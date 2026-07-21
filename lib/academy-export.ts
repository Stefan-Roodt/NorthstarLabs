import { env } from "cloudflare:workers";
import { sha256Hex } from "./security";
import { createPortableZip, textZipEntry, type PortableZipEntry } from "./zip64-stream";

type ExportRow = Record<string, unknown>;
type Dataset = { name: string; rows: ExportRow[] };
type MediaRow = ExportRow & {
  id: string;
  key: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  kind: string;
  updated_at: number;
};

const EXPORT_DATASETS = [
  { name: "academy", sql: "SELECT * FROM schools WHERE id=?" },
  { name: "academy_slug_history", sql: "SELECT * FROM school_slug_aliases WHERE school_id=?" },
  { name: "academy_members", sql: "SELECT * FROM school_members WHERE school_id=?" },
  {
    name: "people",
    sql: `SELECT p.id,p.email,p.display_name,p.role,p.onboarding_path,p.onboarding_completed,
      p.onboarded_at,p.status,p.created_at
      FROM profiles p WHERE p.id IN (
        SELECT user_id FROM school_members WHERE school_id=?
        UNION SELECT e.user_id FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE c.school_id=?
        UNION SELECT cm.user_id FROM community_members cm JOIN communities co ON co.id=cm.community_id WHERE co.school_id=?
      )`,
    bindings: 3,
  },
  {
    name: "invitations",
    sql: `SELECT id,school_id,course_id,email,role,status,invited_by,expires_at,
      accepted_by,accepted_at,created_at FROM invitations WHERE school_id=?`,
  },
  { name: "courses", sql: "SELECT * FROM courses WHERE school_id=?" },
  { name: "course_sections", sql: "SELECT cs.* FROM course_sections cs JOIN courses c ON c.id=cs.course_id WHERE c.school_id=?" },
  { name: "lessons", sql: "SELECT l.* FROM lessons l JOIN courses c ON c.id=l.course_id WHERE c.school_id=?" },
  { name: "lesson_resources", sql: "SELECT lr.* FROM lesson_resources lr JOIN lessons l ON l.id=lr.lesson_id JOIN courses c ON c.id=l.course_id WHERE c.school_id=?" },
  { name: "media_assets_internal", sql: "SELECT * FROM media_assets WHERE school_id=?" },
  { name: "creator_studio_projects", sql: "SELECT * FROM creator_studio_projects WHERE school_id=?" },
  { name: "creator_studio_sources", sql: "SELECT * FROM creator_studio_sources WHERE school_id=?" },
  { name: "creator_studio_generations", sql: "SELECT * FROM creator_studio_generations WHERE school_id=?" },
  { name: "course_imports", sql: "SELECT * FROM course_import_projects WHERE school_id=?" },
  { name: "enrollments", sql: "SELECT e.* FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE c.school_id=?" },
  { name: "communities", sql: "SELECT * FROM communities WHERE school_id=?" },
  { name: "community_posts", sql: "SELECT p.* FROM posts p JOIN communities c ON c.id=p.community_id WHERE c.school_id=?" },
  { name: "community_reports", sql: "SELECT * FROM content_reports WHERE school_id=?" },
  { name: "community_members", sql: "SELECT cm.* FROM community_members cm JOIN communities c ON c.id=cm.community_id WHERE c.school_id=?" },
  { name: "products", sql: "SELECT * FROM products WHERE school_id=?" },
  { name: "product_items", sql: "SELECT pi.* FROM product_items pi JOIN products p ON p.id=pi.product_id WHERE p.school_id=?" },
  { name: "product_entitlements", sql: "SELECT pe.* FROM product_entitlements pe JOIN products p ON p.id=pe.product_id WHERE p.school_id=?" },
  { name: "live_sessions", sql: "SELECT * FROM live_sessions WHERE school_id=?" },
  { name: "live_attendance", sql: "SELECT la.* FROM live_attendance la JOIN live_sessions ls ON ls.id=la.session_id WHERE ls.school_id=?" },
  { name: "coaches", sql: "SELECT * FROM tutors WHERE school_id=?" },
  { name: "coach_availability", sql: "SELECT * FROM tutor_slots WHERE school_id=?" },
  { name: "coaching_enquiries", sql: "SELECT * FROM tutor_inquiries WHERE school_id=?" },
  { name: "coach_credentials", sql: "SELECT * FROM tutor_credentials WHERE school_id=?" },
  { name: "coach_reviews", sql: "SELECT * FROM tutor_reviews WHERE school_id=?" },
  { name: "learner_session_ratings", sql: "SELECT * FROM learner_session_ratings WHERE school_id=?" },
  {
    name: "integrations",
    sql: `SELECT id,school_id,created_by,provider,name,endpoint_url,event_types_json,status,
      last_delivery_at,last_delivery_status,created_at,updated_at FROM integrations WHERE school_id=?`,
  },
  { name: "integration_deliveries", sql: "SELECT d.* FROM integration_deliveries d JOIN integrations i ON i.id=d.integration_id WHERE i.school_id=?" },
  { name: "lesson_progress", sql: "SELECT lp.* FROM lesson_progress lp JOIN lessons l ON l.id=lp.lesson_id JOIN courses c ON c.id=l.course_id WHERE c.school_id=?" },
  { name: "quizzes", sql: "SELECT q.* FROM quizzes q JOIN lessons l ON l.id=q.lesson_id JOIN courses c ON c.id=l.course_id WHERE c.school_id=?" },
  { name: "quiz_questions", sql: "SELECT qq.* FROM quiz_questions qq JOIN quizzes q ON q.id=qq.quiz_id JOIN lessons l ON l.id=q.lesson_id JOIN courses c ON c.id=l.course_id WHERE c.school_id=?" },
  { name: "quiz_attempts", sql: "SELECT qa.* FROM quiz_attempts qa JOIN quizzes q ON q.id=qa.quiz_id JOIN lessons l ON l.id=q.lesson_id JOIN courses c ON c.id=l.course_id WHERE c.school_id=?" },
  { name: "concept_mastery", sql: "SELECT m.* FROM learner_concept_mastery m WHERE m.course_id IN (SELECT id FROM courses WHERE school_id=?)" },
  { name: "mastery_practice", sql: "SELECT mp.* FROM mastery_practice_attempts mp JOIN quiz_questions qq ON qq.id=mp.question_id JOIN quizzes q ON q.id=qq.quiz_id JOIN lessons l ON l.id=q.lesson_id JOIN courses c ON c.id=l.course_id WHERE c.school_id=?" },
  { name: "certificates", sql: "SELECT ce.* FROM certificates ce JOIN courses c ON c.id=ce.course_id WHERE c.school_id=?" },
  {
    name: "email_history",
    sql: `SELECT id,school_id,recipient_user_id,recipient_email,template_key,subject,html_body,
      text_body,status,provider,attempt_count,last_error,available_at,scheduled_at,sent_at,
      created_at,updated_at FROM email_messages WHERE school_id=?`,
  },
  { name: "report_schedules", sql: "SELECT * FROM report_schedules WHERE school_id=?" },
  { name: "audit_log", sql: "SELECT * FROM audit_logs WHERE school_id=?" },
  {
    name: "export_history",
    sql: `SELECT id,school_id,requested_by,status,format_version,filename,size_bytes,file_count,
      record_count,original_file_count,manifest_checksum,failure_message,created_at,completed_at,
      expires_at,downloaded_at,deleted_at FROM academy_exports WHERE school_id=?`,
  },
] as const;

function safePathPart(value: unknown, fallback: string) {
  return String(value || fallback)
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._ -]/g, "-")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120) || fallback;
}

function redactActiveLinks(value: string) {
  return value
    .replace(/\/invite\/[a-zA-Z0-9_-]{16,}/g, "/invite/[redacted]")
    .replace(/([?&](?:token|access_token|refresh_token)=)[^&\s"']+/gi, "$1[redacted]");
}

function sanitiseValue(value: unknown): unknown {
  if (typeof value === "string") return redactActiveLinks(value);
  if (Array.isArray(value)) return value.map(sanitiseValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as ExportRow).map(([key, item]) => [
      key,
      /(?:token|secret|object_key)/i.test(key) ? "[redacted]" : sanitiseValue(item),
    ]));
  }
  return value;
}

function sanitiseRow(row: ExportRow) {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, sanitiseValue(value)]));
}

async function fetchDataset(
  sql: string,
  schoolId: string,
  bindingCount = 1,
) {
  const rows: ExportRow[] = [];
  const pageSize = 500;
  for (let offset = 0;; offset += pageSize) {
    const statement = env.DB.prepare(`${sql} LIMIT ? OFFSET ?`);
    const bindings = Array.from({ length: bindingCount }, () => schoolId);
    const page = await statement.bind(...bindings, pageSize, offset).all<ExportRow>();
    rows.push(...page.results.map(sanitiseRow));
    if (page.results.length < pageSize) break;
  }
  return rows;
}

function csvCell(value: unknown) {
  if (value === null || value === undefined) return "";
  let text = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function rowsToCsv(rows: ExportRow[]) {
  if (!rows.length) return "";
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  return `\ufeff${columns.map(csvCell).join(",")}\r\n${rows
    .map((row) => columns.map((column) => csvCell(row[column])).join(","))
    .join("\r\n")}\r\n`;
}

function assetArchivePath(row: MediaRow) {
  return `original-files/${safePathPart(row.kind, "file")}/${safePathPart(row.id, "asset")}-${safePathPart(row.filename, "file")}`;
}

function coursePackage(course: ExportRow, byName: Map<string, ExportRow[]>) {
  const courseId = String(course.id);
  const sections = (byName.get("course_sections") || [])
    .filter((item) => item.course_id === courseId)
    .sort((a, b) => Number(a.position || 0) - Number(b.position || 0));
  const lessons = (byName.get("lessons") || [])
    .filter((item) => item.course_id === courseId)
    .sort((a, b) => Number(a.position || 0) - Number(b.position || 0));
  const lessonIds = new Set(lessons.map((item) => item.id));
  const resources = (byName.get("lesson_resources") || []).filter((item) => lessonIds.has(item.lesson_id));
  const quizzes = (byName.get("quizzes") || []).filter((item) => lessonIds.has(item.lesson_id));
  const quizIds = new Set(quizzes.map((item) => item.id));
  const questions = (byName.get("quiz_questions") || []).filter((item) => quizIds.has(item.quiz_id));
  return { course, sections, lessons, resources, quizzes, questions };
}

function courseMarkdown(courseData: ReturnType<typeof coursePackage>) {
  const { course, sections, lessons } = courseData;
  const lines = [
    `# ${String(course.title || "Untitled course")}`,
    "",
    String(course.description || ""),
    "",
  ];
  const sectionTitle = new Map(sections.map((section) => [section.id, String(section.title || "Module")]));
  let activeSection = "";
  for (const lesson of lessons) {
    const nextSection = String(lesson.section_id || "unsectioned");
    if (nextSection !== activeSection) {
      activeSection = nextSection;
      lines.push(`## ${sectionTitle.get(nextSection) || "Course lessons"}`, "");
    }
    lines.push(`### ${String(lesson.title || "Lesson")}`, "");
    if (lesson.content) lines.push(String(lesson.content), "");
    if (lesson.transcript) lines.push("#### Transcript", "", String(lesson.transcript), "");
  }
  return lines.join("\n");
}

function readme(academyName: string, createdAt: string) {
  return `NORTHSTARLABS FREEDOM EXPORT\n\nAcademy: ${academyName}\nCreated: ${createdAt}\nFormat: Northstar portable academy export v1\n\nThis archive is designed to remain useful without a NorthstarLabs account.\n\nWHAT IS INSIDE\n- manifest.json: archive contents, counts and integrity information.\n- data/all-data.json: the complete structured academy export.\n- data/tables/*.csv: one spreadsheet-friendly file per data area.\n- courses/*: a readable JSON and Markdown package for every course.\n- original-files/*: every academy-owned file stored by NorthstarLabs.\n- media-references.json: external or platform-provided media that cannot be copied.\n\nIMPORTANT\nThis archive can contain learner names, email addresses, progress, assessment answers, private support notes, coaching enquiries and other personal information. Store it securely and share it only with authorised people.\n\nSECURITY EXCLUSIONS\nNorthstar intentionally removes passwords, authentication credentials, active invitation links, integration signing secrets, internal object-storage paths and short-lived playback grants. These are security credentials, not portable academy content.\n\nPORTABILITY\nJSON preserves relationships and complete field values. CSV files make common records easy to inspect or import. Course Markdown remains human-readable. Original files are unchanged. Another platform may still require field mapping because vendors use different schemas.\n`;
}

async function storeArchive(
  objectKey: string,
  stream: ReadableStream<Uint8Array>,
  metadata: Record<string, string>,
) {
  // Multipart storage keeps the complete export valid beyond R2's single-part
  // upload ceiling while retaining a small, fixed Worker memory footprint.
  const partSize = 8 * 1024 * 1024;
  const upload = await env.UPLOADS.createMultipartUpload(objectKey, {
    httpMetadata: { contentType: "application/zip" },
    customMetadata: metadata,
  });
  const reader = stream.getReader();
  const parts: R2UploadedPart[] = [];
  const buffered: Uint8Array[] = [];
  let bufferedBytes = 0;
  let partNumber = 1;

  async function flush(size: number) {
    const bytes = new Uint8Array(size);
    let written = 0;
    while (written < size) {
      const first = buffered[0];
      const needed = size - written;
      const taken = Math.min(needed, first.length);
      bytes.set(first.subarray(0, taken), written);
      written += taken;
      bufferedBytes -= taken;
      if (taken === first.length) buffered.shift();
      else buffered[0] = first.subarray(taken);
    }
    parts.push(await upload.uploadPart(partNumber, bytes));
    partNumber += 1;
  }

  try {
    for (;;) {
      const result = await reader.read();
      if (result.done) break;
      if (result.value.length) {
        buffered.push(result.value);
        bufferedBytes += result.value.length;
      }
      while (bufferedBytes >= partSize) await flush(partSize);
    }
    if (bufferedBytes) await flush(bufferedBytes);
    if (!parts.length) parts.push(await upload.uploadPart(1, new Uint8Array()));
    return await upload.complete(parts);
  } catch (error) {
    await reader.cancel(error).catch(() => undefined);
    await upload.abort().catch(() => undefined);
    throw error;
  } finally {
    reader.releaseLock();
  }
}

export async function buildAcademyExport(options: {
  id: string;
  schoolId: string;
  requestedBy: string;
  filename: string;
  objectKey: string;
}) {
  const datasets: Dataset[] = [];
  for (const definition of EXPORT_DATASETS) {
    const rows = await fetchDataset(
      definition.sql,
      options.schoolId,
      "bindings" in definition ? definition.bindings : 1,
    );
    datasets.push({ name: definition.name, rows });
  }

  const internalMedia = (datasets.find((item) => item.name === "media_assets_internal")?.rows || []) as MediaRow[];
  const originalMedia = internalMedia.filter((asset) => String(asset.key).startsWith("r2:"));
  const referencedMedia = internalMedia.filter((asset) => !String(asset.key).startsWith("r2:"));
  const publicMedia = internalMedia.map((asset) => ({
    id: asset.id,
    school_id: asset.school_id,
    owner_id: asset.owner_id,
    filename: asset.filename,
    content_type: asset.content_type,
    size_bytes: asset.size_bytes,
    kind: asset.kind,
    alt_text: asset.alt_text,
    source_type: String(asset.key).startsWith("r2:") ? "included_original" : "external_or_platform_reference",
    archive_path: String(asset.key).startsWith("r2:") ? assetArchivePath(asset) : null,
    source_reference: String(asset.key).startsWith("r2:") ? null : asset.key,
    created_at: asset.created_at,
    updated_at: asset.updated_at,
  }));
  const publicDatasets = datasets
    .filter((item) => item.name !== "media_assets_internal")
    .concat({ name: "media_assets", rows: publicMedia });
  const byName = new Map(publicDatasets.map((item) => [item.name, item.rows]));
  const academy = byName.get("academy")?.[0] || {};
  const academyName = String(academy.name || "Academy");
  const createdAt = new Date().toISOString();
  const recordCount = publicDatasets.reduce((total, item) => total + item.rows.length, 0);
  const recordCounts = Object.fromEntries(publicDatasets.map((item) => [item.name, item.rows.length]));
  const originalBytes = originalMedia.reduce((total, asset) => total + Number(asset.size_bytes || 0), 0);
  const manifest = {
    format: "northstarlabs-freedom-export",
    formatVersion: 1,
    createdAt,
    academy: { id: options.schoolId, name: academyName, slug: academy.slug || "" },
    counts: {
      records: recordCount,
      originalFiles: originalMedia.length,
      originalFileBytes: originalBytes,
      referencedMedia: referencedMedia.length,
      tables: recordCounts,
    },
    securityExclusions: [
      "authentication credentials",
      "active invitation links and token hashes",
      "integration signing secrets",
      "internal object-storage paths",
      "short-lived playback grants",
    ],
    folders: {
      data: "JSON and CSV academy records",
      courses: "Course-by-course JSON and readable Markdown",
      originalFiles: "Unmodified academy-owned uploads",
    },
  };
  const manifestJson = JSON.stringify(manifest, null, 2);
  const manifestChecksum = await sha256Hex(manifestJson);
  const allData = Object.fromEntries(publicDatasets.map((item) => [item.name, item.rows]));
  const entries: PortableZipEntry[] = [
    textZipEntry("README.txt", readme(academyName, createdAt)),
    textZipEntry("manifest.json", manifestJson),
    textZipEntry("manifest.sha256", `${manifestChecksum}  manifest.json\n`),
    textZipEntry("data/all-data.json", JSON.stringify({ manifest, data: allData }, null, 2)),
    textZipEntry("media-references.json", JSON.stringify(referencedMedia.map((asset) => ({
      id: asset.id,
      filename: asset.filename,
      contentType: asset.content_type,
      kind: asset.kind,
      reference: asset.key,
    })), null, 2)),
  ];

  for (const dataset of publicDatasets) {
    entries.push(textZipEntry(`data/tables/${safePathPart(dataset.name, "table")}.csv`, rowsToCsv(dataset.rows)));
  }
  for (const course of byName.get("courses") || []) {
    const courseData = coursePackage(course, byName);
    const folder = `courses/${safePathPart(course.title, "course")}-${safePathPart(course.id, "id")}`;
    entries.push(textZipEntry(`${folder}/course.json`, JSON.stringify(courseData, null, 2)));
    entries.push(textZipEntry(`${folder}/curriculum.md`, courseMarkdown(courseData)));
  }
  for (const asset of originalMedia) {
    entries.push({
      path: assetArchivePath(asset),
      size: Number(asset.size_bytes),
      modifiedAt: Number(asset.updated_at || Date.now()),
      async open() {
        const object = await env.UPLOADS.get(String(asset.key).replace(/^r2:/, ""));
        if (!object) throw new Error(`Original file is missing: ${asset.filename}`);
        return object.body;
      },
    });
  }

  const { stream, completed } = createPortableZip(entries);
  const [stored, archive] = await Promise.all([
    storeArchive(options.objectKey, stream, {
      academy: options.schoolId,
      requestedBy: options.requestedBy,
      exportId: options.id,
      format: "northstarlabs-freedom-export-v1",
    }),
    completed,
  ]);
  if (stored.size !== archive.sizeBytes) throw new Error("The completed export size could not be verified.");
  return {
    sizeBytes: stored.size,
    fileCount: entries.length,
    recordCount,
    originalFileCount: originalMedia.length,
    manifestChecksum,
  };
}

export function academyExportFilename(academyName: string, createdAt = Date.now()) {
  return `${safePathPart(academyName, "academy").toLowerCase()}-northstar-export-${new Date(createdAt).toISOString().slice(0, 10)}.zip`;
}
