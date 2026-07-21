import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../lib/audit-log";
import { requireApiUser } from "../../../lib/server-auth";
import { requireCourseStaffAccess } from "../../../lib/school-access";

const DEFAULT_SCHOOL_STORAGE_QUOTA = 5 * 1024 * 1024 * 1024;
const DEFAULT_SCHOOL_ASSET_LIMIT = 2_000;

const MEDIA_RULES: Record<string, { kind: string; maxBytes: number }> = {
  "video/mp4": { kind: "video", maxBytes: 200 * 1024 * 1024 },
  "video/webm": { kind: "video", maxBytes: 200 * 1024 * 1024 },
  "video/ogg": { kind: "video", maxBytes: 200 * 1024 * 1024 },
  "audio/mpeg": { kind: "audio", maxBytes: 50 * 1024 * 1024 },
  "audio/mp4": { kind: "audio", maxBytes: 50 * 1024 * 1024 },
  "audio/webm": { kind: "audio", maxBytes: 50 * 1024 * 1024 },
  "audio/ogg": { kind: "audio", maxBytes: 50 * 1024 * 1024 },
  "audio/wav": { kind: "audio", maxBytes: 50 * 1024 * 1024 },
  "image/jpeg": { kind: "image", maxBytes: 20 * 1024 * 1024 },
  "image/png": { kind: "image", maxBytes: 20 * 1024 * 1024 },
  "image/webp": { kind: "image", maxBytes: 20 * 1024 * 1024 },
  "image/gif": { kind: "image", maxBytes: 20 * 1024 * 1024 },
  "application/pdf": { kind: "document", maxBytes: 50 * 1024 * 1024 },
  "application/msword": { kind: "document", maxBytes: 50 * 1024 * 1024 },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    kind: "document",
    maxBytes: 50 * 1024 * 1024,
  },
  "application/vnd.ms-powerpoint": { kind: "document", maxBytes: 50 * 1024 * 1024 },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    kind: "document",
    maxBytes: 50 * 1024 * 1024,
  },
  "application/vnd.ms-excel": { kind: "document", maxBytes: 50 * 1024 * 1024 },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    kind: "document",
    maxBytes: 50 * 1024 * 1024,
  },
  "text/plain": { kind: "document", maxBytes: 10 * 1024 * 1024 },
  "text/markdown": { kind: "document", maxBytes: 10 * 1024 * 1024 },
  "text/html": { kind: "document", maxBytes: 10 * 1024 * 1024 },
  "application/zip": { kind: "archive", maxBytes: 100 * 1024 * 1024 },
};

function safeFilename(value: string | null) {
  return (value || "course-file")
    .replace(/[^a-zA-Z0-9._ -]/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 140);
}

function inferredContentType(filename: string) {
  const extension = filename.split(".").at(-1)?.toLowerCase() || "";
  return ({
    mp4: "video/mp4", webm: "video/webm", ogv: "video/ogg",
    mp3: "audio/mpeg", m4a: "audio/mp4", oga: "audio/ogg", wav: "audio/wav",
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif",
    pdf: "application/pdf", doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    txt: "text/plain", md: "text/markdown", markdown: "text/markdown",
    html: "text/html", htm: "text/html", zip: "application/zip",
  } as Record<string, string>)[extension] || "";
}

function schoolStorageQuota() {
  const configured = Number(process.env.SCHOOL_STORAGE_QUOTA_BYTES || 0);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_SCHOOL_STORAGE_QUOTA;
}

function schoolAssetLimit() {
  const configured = Number(process.env.SCHOOL_MEDIA_ASSET_LIMIT || 0);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_SCHOOL_ASSET_LIMIT;
}

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const courseId = url.searchParams.get("courseId") || "";
  const course = await requireCourseStaffAccess(user.id, courseId);
  if (!course) return Response.json({ error: "Course not found." }, { status: 404 });

  const filename = safeFilename(url.searchParams.get("filename"));
  const receivedType = request.headers.get("content-type")?.split(";")[0] || "";
  const contentType = receivedType === "application/octet-stream" || !receivedType
    ? inferredContentType(filename)
    : receivedType;
  const rule = MEDIA_RULES[contentType];
  if (!rule) {
    return Response.json(
      { error: "Upload a supported video, audio, image, PDF, Office file, text file, or ZIP archive." },
      { status: 415 },
    );
  }
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > rule.maxBytes) {
    return Response.json({ error: `This ${rule.kind} file is too large.` }, { status: 413 });
  }
  if (!request.body) return Response.json({ error: "File content required." }, { status: 400 });
  const usage = await env.DB.prepare(
    `SELECT COUNT(*) AS assetCount,COALESCE(SUM(size_bytes),0) AS usedBytes
     FROM media_assets WHERE school_id=?`,
  ).bind(course.schoolId).first<{ assetCount: number; usedBytes: number }>();
  const assetCount = Number(usage?.assetCount || 0);
  const usedBytes = Number(usage?.usedBytes || 0);
  const quotaBytes = schoolStorageQuota();
  if (assetCount >= schoolAssetLimit()) {
    return Response.json(
      { error: "This academy has reached its media-library file limit." },
      { status: 413 },
    );
  }
  if (contentLength > 0 && usedBytes + contentLength > quotaBytes) {
    return Response.json(
      { error: "This upload would exceed the academy storage quota." },
      { status: 413 },
    );
  }

  const objectKey = `schools/${course.schoolId}/${crypto.randomUUID()}-${filename}`;
  const key = `r2:${objectKey}`;
  const assetId = crypto.randomUUID();
  const now = Date.now();
  const saved = await env.UPLOADS.put(objectKey, request.body, {
    httpMetadata: { contentType },
    customMetadata: {
      owner: user.id,
      school: course.schoolId,
      originalFilename: filename,
    },
  });
  if (saved.size > rule.maxBytes) {
    await env.UPLOADS.delete(objectKey);
    return Response.json({ error: `This ${rule.kind} file is too large.` }, { status: 413 });
  }
  if (usedBytes + saved.size > quotaBytes) {
    await env.UPLOADS.delete(objectKey);
    return Response.json(
      { error: "This upload would exceed the academy storage quota." },
      { status: 413 },
    );
  }

  try {
    await env.DB.prepare(
      `INSERT INTO media_assets
       (id,school_id,owner_id,key,filename,content_type,size_bytes,kind,alt_text,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    ).bind(
      assetId,
      course.schoolId,
      user.id,
      key,
      filename,
      contentType,
      saved.size,
      rule.kind,
      "",
      now,
      now,
    ).run();
  } catch (error) {
    await env.UPLOADS.delete(objectKey);
    throw error;
  }
  await writeAuditLog({
    actorId: user.id,
    schoolId: course.schoolId,
    action: "media.upload",
    targetType: "media_asset",
    targetId: assetId,
    detail: { kind: rule.kind, sizeBytes: saved.size, contentType },
  });

  return Response.json({
    id: assetId,
    filename,
    contentType,
    sizeBytes: saved.size,
    kind: rule.kind,
    altText: "",
    createdAt: now,
    updatedAt: now,
  }, { status: 201 });
}

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const rawKey = url.searchParams.get("key") || "";

  if (!rawKey) {
    const courseId = url.searchParams.get("courseId") || "";
    const course = await requireCourseStaffAccess(user.id, courseId);
    if (!course) return Response.json({ error: "Course not found." }, { status: 404 });
    const rows = await env.DB.prepare(
      `SELECT id,filename,content_type AS contentType,size_bytes AS sizeBytes,
        kind,alt_text AS altText,created_at AS createdAt,updated_at AS updatedAt
       FROM media_assets WHERE school_id=?
       ORDER BY created_at DESC LIMIT 200`,
    ).bind(course.schoolId).all();
    return Response.json(rows.results);
  }

  const key = rawKey.startsWith("r2:") ? rawKey : `r2:${rawKey}`;
  const asset = await env.DB.prepare(
    `SELECT id,school_id AS schoolId,key,filename,content_type AS contentType
     FROM media_assets WHERE key=?`,
  ).bind(key).first<{
    id: string;
    schoolId: string;
    key: string;
    filename: string;
    contentType: string;
  }>();

  const objectKey = key.replace(/^r2:/, "");
  let filename = "course-file";
  if (asset) {
    filename = asset.filename;
    const staff = await env.DB.prepare(
      `SELECT id FROM school_members
       WHERE school_id=? AND user_id=? AND status='active'
         AND role IN ('owner','admin','instructor')`,
    ).bind(asset.schoolId, user.id).first();
    const enrollment = staff ? null : await env.DB.prepare(
      `SELECT e.id
       FROM lessons l
       JOIN enrollments e ON e.course_id=l.course_id
         AND e.user_id=? AND e.status='active'
       LEFT JOIN lesson_resources lr ON lr.lesson_id=l.id
       WHERE l.primary_asset_id=? OR lr.asset_id=?
       LIMIT 1`,
    ).bind(user.id, asset.id, asset.id).first();
    if (!staff && !enrollment) {
      return Response.json({ error: "Not enrolled." }, { status: 403 });
    }
  } else {
    const legacyLesson = await env.DB.prepare(
      `SELECT l.id,c.id AS courseId,c.school_id AS schoolId
       FROM lessons l JOIN courses c ON c.id=l.course_id
       WHERE l.video_key=?`,
    ).bind(key).first<{ id: string; courseId: string; schoolId: string }>();
    if (!legacyLesson) return Response.json({ error: "Media not found." }, { status: 404 });
    const enrollment = await env.DB.prepare(
      "SELECT id FROM enrollments WHERE user_id=? AND course_id=? AND status='active'",
    ).bind(user.id, legacyLesson.courseId).first();
    const staff = await env.DB.prepare(
      `SELECT id FROM school_members
       WHERE school_id=? AND user_id=? AND status='active'
         AND role IN ('owner','admin','instructor')`,
    ).bind(legacyLesson.schoolId, user.id).first();
    if (!staff && !enrollment) return Response.json({ error: "Not enrolled." }, { status: 403 });
    filename = objectKey.split("/").at(-1) || filename;
  }

  const object = await env.UPLOADS.get(objectKey);
  if (!object) return Response.json({ error: "Media not found." }, { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("content-length", String(object.size));
  headers.set("cache-control", "private, max-age=3600");
  headers.set(
    "content-disposition",
    `${url.searchParams.get("download") === "1" ? "attachment" : "inline"}; filename="${filename.replace(/["\r\n]/g, "_")}"`,
  );
  return new Response(object.body, { headers });
}

export async function PATCH(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as { courseId?: string; assetId?: string; altText?: string };
  const course = await requireCourseStaffAccess(user.id, body.courseId || "");
  if (!course || !body.assetId) return Response.json({ error: "Media not found." }, { status: 404 });
  await env.DB.prepare(
    "UPDATE media_assets SET alt_text=?,updated_at=? WHERE id=? AND school_id=?",
  ).bind((body.altText || "").trim().slice(0, 300), Date.now(), body.assetId, course.schoolId).run();
  return Response.json({ saved: true });
}

export async function DELETE(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const courseId = url.searchParams.get("courseId") || "";
  const assetId = url.searchParams.get("assetId") || "";
  const course = await requireCourseStaffAccess(user.id, courseId);
  if (!course) return Response.json({ error: "Course not found." }, { status: 404 });
  const asset = await env.DB.prepare(
    "SELECT id,key FROM media_assets WHERE id=? AND school_id=?",
  ).bind(assetId, course.schoolId).first<{ id: string; key: string }>();
  if (!asset) return Response.json({ error: "Media not found." }, { status: 404 });
  const used = await env.DB.prepare(
    `SELECT
      EXISTS(SELECT 1 FROM lessons WHERE primary_asset_id=?) AS isPrimary,
      EXISTS(SELECT 1 FROM lesson_resources WHERE asset_id=?) AS isResource`,
  ).bind(asset.id, asset.id).first<{ isPrimary: number; isResource: number }>();
  if (used?.isPrimary || used?.isResource) {
    return Response.json(
      { error: "Remove this file from its lessons before deleting it." },
      { status: 409 },
    );
  }
  await env.UPLOADS.delete(asset.key.replace(/^r2:/, ""));
  await env.DB.prepare(
    "DELETE FROM media_assets WHERE id=? AND school_id=?",
  ).bind(asset.id, course.schoolId).run();
  await writeAuditLog({
    actorId: user.id,
    schoolId: course.schoolId,
    action: "media.delete",
    targetType: "media_asset",
    targetId: asset.id,
  });
  return Response.json({ deleted: true });
}
