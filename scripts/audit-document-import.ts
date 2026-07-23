import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import {
  numberingConflicts,
  prepareDocumentSelection,
  sequenceIssues,
} from "../lib/document-ingestion";

async function main() {
  const sourcePaths = process.argv.slice(2);
  if (!sourcePaths.length) {
    throw new Error("Pass one or more document or ZIP paths to audit.");
  }

  const selected: File[] = [];
  for (const sourcePath of sourcePaths) {
    const bytes = await readFile(sourcePath);
    selected.push(new File([bytes], basename(sourcePath), {
      type: sourcePath.toLowerCase().endsWith(".zip")
        ? "application/zip"
        : "application/octet-stream",
    }));
  }

  const prepared = await prepareDocumentSelection(selected);
  const issues = sequenceIssues(prepared.documents.map(({ file, text }) => ({
    name: file.name,
    text,
  })));
  const conflicts = numberingConflicts(prepared.documents);
  const conflictPreviews = conflicts.map((conflict) => {
    const document = prepared.documents.find(({ file }) => file.name === conflict.filename);
    return {
      ...conflict,
      openingHeadings: (document?.text.match(/^#{1,6}\s+.+$/gm) || []).slice(0, 5),
    };
  });
  const emptyDocuments = prepared.documents
    .filter(({ text }) => !text.trim())
    .map(({ file }) => file.name);

  process.stdout.write(`${JSON.stringify({
    suppliedSources: sourcePaths.map((sourcePath) => basename(sourcePath)),
    preparedDocuments: prepared.documents.length,
    firstDocument: prepared.documents[0]?.file.name || null,
    lastDocument: prepared.documents.at(-1)?.file.name || null,
    sequenceIssues: issues,
    numberingConflicts: conflictPreviews,
    excludedExactContentCopies: prepared.excludedExactContentCopies,
    emptyDocuments,
    totalExtractedCharacters: prepared.documents.reduce(
      (total, document) => total + document.text.length,
      0,
    ),
  }, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
