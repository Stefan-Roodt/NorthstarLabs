import { strFromU8, unzipSync } from "fflate";

export const MAX_DOCUMENT_SEQUENCE_FILES = 120;
const MAX_ARCHIVE_BYTES = 100 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 50 * 1024 * 1024;
const MAX_EXPANDED_ARCHIVE_BYTES = 300 * 1024 * 1024;

export type PreparedDocument = {
  file: File;
  text: string;
};

export type SequenceIssue = {
  label: string;
  missing: string[];
};

export type NumberingConflict = {
  filename: string;
  filenameNumber: string;
  internalNumber: string;
};

export type PreparedDocumentSelection = {
  documents: PreparedDocument[];
  excludedExactContentCopies: string[];
};

const naturalCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

export function naturalDocumentSort<T extends { name: string }>(items: T[]) {
  return [...items].sort((left, right) => naturalCollator.compare(left.name, right.name));
}

function extension(filename: string) {
  return filename.split(".").at(-1)?.toLowerCase() || "";
}

function decodeXml(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal: string) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function paragraphText(paragraphXml: string) {
  return paragraphXml
    .replace(/<w:tab\b[^>]*\/>/gi, "\t")
    .replace(/<w:(?:br|cr)\b[^>]*\/>/gi, "\n")
    .replace(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/gi, (_, text: string) => decodeXml(text))
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/** Convert WordprocessingML into clean Markdown without uploading the source elsewhere. */
export function wordDocumentXmlToMarkdown(xml: string) {
  const paragraphs = xml.match(/<w:p\b[\s\S]*?<\/w:p>/gi) || [];
  const output: string[] = [];
  for (const paragraph of paragraphs) {
    const text = paragraphText(paragraph);
    if (!text) continue;
    const style = paragraph.match(/<w:pStyle\b[^>]*w:val=["']([^"']+)["']/i)?.[1] || "";
    const heading = style.match(/(?:heading|head)([1-6])/i)?.[1];
    const isTitle = /^(?:title|subtitle)$/i.test(style);
    const isList = /<w:numPr\b/i.test(paragraph);
    if (heading) output.push(`${"#".repeat(Number(heading))} ${text}`);
    else if (isTitle) output.push(`# ${text}`);
    else if (isList) output.push(`- ${text}`);
    else output.push(text);
  }
  return output.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function extractDocxBytes(bytes: Uint8Array) {
  if (bytes.byteLength > MAX_DOCUMENT_BYTES) throw new Error("A Word document is larger than the 50 MB limit.");
  let entries: Record<string, Uint8Array>;
  try {
    entries = unzipSync(bytes, {
      filter: (file) => file.name === "word/document.xml" && file.originalSize <= MAX_DOCUMENT_BYTES,
    });
  } catch {
    throw new Error("A Word document could not be opened. It may be damaged or password protected.");
  }
  const documentXml = entries["word/document.xml"];
  if (!documentXml) throw new Error("A selected Word file does not contain readable document text.");
  return wordDocumentXmlToMarkdown(strFromU8(documentXml));
}

export async function extractDocumentText(file: File) {
  const fileExtension = extension(file.name);
  if (fileExtension === "docx") return extractDocxBytes(new Uint8Array(await file.arrayBuffer()));
  if (file.type.startsWith("text/") || ["md", "markdown", "html", "htm"].includes(fileExtension)) {
    if (file.size > 2 * 1024 * 1024) throw new Error(`${file.name} is larger than the 2 MB text-file limit.`);
    return file.text();
  }
  return "";
}

function safeArchiveEntry(name: string) {
  const normalized = name.replace(/\\/g, "/");
  return !normalized.startsWith("/") && !normalized.split("/").includes("..") && !normalized.endsWith("/");
}

function fileFromArchiveEntry(name: string, data: Uint8Array, modified: number) {
  const filename = name.replace(/\\/g, "/").split("/").at(-1) || "course-module.docx";
  return new File([data], filename, {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    lastModified: modified,
  });
}

export async function extractDocxArchive(file: File) {
  if (file.size > MAX_ARCHIVE_BYTES) throw new Error("The ZIP archive is larger than the 100 MB limit.");
  let entries: Record<string, Uint8Array>;
  try {
    entries = unzipSync(new Uint8Array(await file.arrayBuffer()), {
      filter: (entry) => safeArchiveEntry(entry.name)
        && extension(entry.name) === "docx"
        && entry.originalSize <= MAX_DOCUMENT_BYTES,
    });
  } catch {
    throw new Error("The ZIP archive could not be opened. Check that it is a valid, unencrypted ZIP file.");
  }
  const expandedBytes = Object.values(entries).reduce((total, item) => total + item.byteLength, 0);
  if (expandedBytes > MAX_EXPANDED_ARCHIVE_BYTES) throw new Error("The ZIP archive expands beyond the 300 MB safety limit.");
  const files = naturalDocumentSort(Object.entries(entries).map(([name, data]) => (
    fileFromArchiveEntry(name, data, file.lastModified)
  )));
  if (!files.length) throw new Error("The ZIP archive does not contain any .docx Word files.");
  if (files.length > MAX_DOCUMENT_SEQUENCE_FILES) {
    throw new Error(`The ZIP archive contains ${files.length} Word files. Import at most ${MAX_DOCUMENT_SEQUENCE_FILES} at a time.`);
  }
  return files;
}

function moduleNumber(item: { name: string; text?: string }) {
  const internal = item.text?.match(/^#{1,6}\s+Module\s+(\d+)\s*\.\s*(\d+)\b/im);
  const filename = item.name.match(/(?:^|\b)(?:module\s*)?(\d+)\s*\.\s*(\d+)(?:\b|\D)/i);
  const match = internal || filename;
  return match ? { major: match[1], minor: Number(match[2]) } : null;
}

export function sequenceIssues(files: Array<{ name: string; text?: string }>): SequenceIssue[] {
  const groups = new Map<string, Set<number>>();
  for (const file of files) {
    const number = moduleNumber(file);
    if (!number) continue;
    const { major, minor } = number;
    if (!groups.has(major)) groups.set(major, new Set());
    groups.get(major)!.add(minor);
  }
  return [...groups.entries()].flatMap(([major, minors]) => {
    if (minors.size < 2) return [];
    const minimum = Math.min(...minors);
    const maximum = Math.max(...minors);
    const missing: string[] = [];
    for (let item = minimum; item <= maximum; item += 1) {
      if (!minors.has(item)) missing.push(`${major}.${item}`);
    }
    return missing.length ? [{ label: `Part ${major}`, missing }] : [];
  });
}

export function numberingConflicts(documents: PreparedDocument[]): NumberingConflict[] {
  return documents.flatMap(({ file, text }) => {
    const filename = moduleNumber({ name: file.name });
    const internal = text.match(/^#{1,6}\s+Module\s+(\d+)\s*\.\s*(\d+)\b/im);
    if (!filename || !internal) return [];
    const internalNumber = `${internal[1]}.${Number(internal[2])}`;
    const filenameNumber = `${filename.major}.${filename.minor}`;
    return internalNumber === filenameNumber ? [] : [{
      filename: file.name,
      filenameNumber,
      internalNumber,
    }];
  });
}

function canonicalFilenamePriority(filename: string) {
  if (/^module\s+\d+\.\d+\b/i.test(filename)) return 0;
  if (/^module\s+\d+\s*\.\s*\d+\b/i.test(filename)) return 1;
  return 2;
}

export async function prepareDocumentSelection(selected: File[]) {
  const expanded: File[] = [];
  for (const file of selected) {
    if (extension(file.name) === "zip" || file.type === "application/zip") {
      expanded.push(...await extractDocxArchive(file));
    } else {
      expanded.push(file);
    }
  }
  if (expanded.length > MAX_DOCUMENT_SEQUENCE_FILES) {
    throw new Error(`Select at most ${MAX_DOCUMENT_SEQUENCE_FILES} documents per migration.`);
  }
  const ordered = naturalDocumentSort(expanded);
  const prepared: PreparedDocument[] = [];
  for (const document of ordered) {
    prepared.push({ file: document, text: await extractDocumentText(document) });
  }
  const unique: PreparedDocument[] = [];
  const byText = new Map<string, number>();
  const excludedExactContentCopies: string[] = [];
  for (const document of prepared) {
    const signature = document.text
      .replace(/^#{1,6}[ \t]+/gm, "")
      .replace(/^[-*+][ \t]+/gm, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!signature) {
      unique.push(document);
      continue;
    }
    const existingIndex = byText.get(signature);
    if (existingIndex === undefined) {
      byText.set(signature, unique.length);
      unique.push(document);
      continue;
    }
    const existing = unique[existingIndex];
    if (canonicalFilenamePriority(document.file.name) < canonicalFilenamePriority(existing.file.name)) {
      excludedExactContentCopies.push(existing.file.name);
      unique[existingIndex] = document;
    } else {
      excludedExactContentCopies.push(document.file.name);
    }
  }
  return {
    documents: naturalDocumentSort(unique.map((document) => ({ ...document, name: document.file.name })))
      .map(({ file, text }) => ({ file, text })),
    excludedExactContentCopies,
  } satisfies PreparedDocumentSelection;
}
