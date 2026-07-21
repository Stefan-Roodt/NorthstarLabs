import { env } from "cloudflare:workers";
import { academyExportFilename, buildAcademyExport } from "../../../lib/academy-export";
import { writeAuditLog } from "../../../lib/audit-log";
import { requestedSchoolId, requireCreatorSchool } from "../../../lib/school-access";
import { requireApiUser } from "../../../lib/server-auth";
import { sha256Hex } from "../../../lib/security";
import { recordSystemEvent, safeErrorMessage } from "../../../lib/system-monitor";

const EXPORT_RETENTION_MS = 7 * 24 * 60 * 60_000;
const DOWNLOAD_LINK_MS = 60 * 60_000;

type ExportRow = {
  id: string;
  status: string;
  filename: string;
  sizeBytes: number;
  fileCount: number;
  recordCount: number;
  originalFileCount: number;
  manifestChecksum: string | null;
  failureMessage: string | null;
  createdAt: number;
  completedAt: number | null;
  expiresAt: number | null;
  downloadedAt: number | null;
  deletedAt: number | null;
};

async function creatorContext(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return { error: Response.json({ error: "Creator access required." }, { status: 403 }) };
  if (!['owner', 'admin'].includes(school.memberRole)) {
    return {
      error: Response.json(
        { error: "Only an academy owner or administrator can export learner and business data." },
        { status: 403 },
      ),
    };
  }
  return { user, school };
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function expireOldArchives(schoolId: string) {
  const expired = await env.DB.prepare(
    `SELECT id,object_key AS objectKey FROM academy_exports
     WHERE school_id=? AND status='completed' AND expires_at<=? AND object_key IS NOT NULL
     LIMIT 10`,
  ).bind(schoolId, Date.now()).all<{ id: string; objectKey: string }>();
  for (const item of expired.results) {
    await env.UPLOADS.delete(item.objectKey);
    await env.DB.prepare(
      `UPDATE academy_exports SET status='expired',object_key=NULL,
       download_token_hash=NULL,download_token_expires_at=NULL WHERE id=? AND school_id=?`,
    ).bind(item.id, schoolId).run();
  }
}

async function listExports(schoolId: string) {
  return env.DB.prepare(
    `SELECT id,status,filename,size_bytes AS sizeBytes,file_count AS fileCount,
      record_count AS recordCount,original_file_count AS originalFileCount,
      manifest_checksum AS manifestChecksum,failure_message AS failureMessage,
      created_at AS createdAt,completed_at AS completedAt,expires_at AS expiresAt,
      downloaded_at AS downloadedAt,deleted_at AS deletedAt
     FROM academy_exports WHERE school_id=? ORDER BY created_at DESC LIMIT 30`,
  ).bind(schoolId).all<ExportRow>();
}

export async function GET(request: Request) {
  const context = await creatorContext(request);
  if ("error" in context) return context.error;
  await expireOldArchives(context.school.id);
  const exports = await listExports(context.school.id);
  return Response.json({
    school: {
      id: context.school.id,
      name: context.school.name,
      memberRole: context.school.memberRole,
    },
    retentionDays: EXPORT_RETENTION_MS / 86_400_000,
    exports: exports.results,
  });
}

export async function POST(request: Request) {
  const context = await creatorContext(request);
  if ("error" in context) return context.error;
  const body = await request.json().catch(() => ({})) as {
    action?: string;
    exportId?: string;
    confirmation?: string;
  };

  if (body.action === "download") {
    const item = await env.DB.prepare(
      `SELECT id,status,object_key AS objectKey,expires_at AS expiresAt
       FROM academy_exports WHERE id=? AND school_id=?`,
    ).bind(body.exportId || "", context.school.id).first<{
      id: string;
      status: string;
      objectKey: string | null;
      expiresAt: number | null;
    }>();
    if (!item || item.status !== "completed" || !item.objectKey || Number(item.expiresAt || 0) <= Date.now()) {
      return Response.json({ error: "This export is no longer available. Prepare a fresh copy." }, { status: 404 });
    }
    const token = randomToken();
    const tokenHash = await sha256Hex(token);
    const tokenExpiresAt = Math.min(Number(item.expiresAt), Date.now() + DOWNLOAD_LINK_MS);
    await env.DB.prepare(
      `UPDATE academy_exports SET download_token_hash=?,download_token_expires_at=?
       WHERE id=? AND school_id=?`,
    ).bind(tokenHash, tokenExpiresAt, item.id, context.school.id).run();
    await writeAuditLog({
      actorId: context.user.id,
      schoolId: context.school.id,
      action: "academy_export.download_link_created",
      targetType: "academy_export",
      targetId: item.id,
      detail: { expiresAt: tokenExpiresAt },
    });
    return Response.json({
      downloadUrl: `${new URL(request.url).origin}/api/academy-exports/download/${token}`,
      expiresAt: tokenExpiresAt,
    });
  }

  if (body.action !== "create" || body.confirmation !== "EXPORT") {
    return Response.json(
      { error: "Confirm that this archive contains private academy and learner data." },
      { status: 400 },
    );
  }
  const existing = await env.DB.prepare(
    "SELECT id FROM academy_exports WHERE school_id=? AND status='preparing' LIMIT 1",
  ).bind(context.school.id).first<{ id: string }>();
  if (existing) {
    return Response.json({ error: "An academy export is already being prepared." }, { status: 409 });
  }

  const id = crypto.randomUUID();
  const createdAt = Date.now();
  const expiresAt = createdAt + EXPORT_RETENTION_MS;
  const filename = academyExportFilename(context.school.name, createdAt);
  const objectKey = `exports/academies/${context.school.id}/${id}.zip`;
  await env.DB.prepare(
    `INSERT INTO academy_exports
      (id,school_id,requested_by,status,format_version,filename,created_at,expires_at)
     VALUES (?,?,?,?,?,?,?,?)`,
  ).bind(
    id,
    context.school.id,
    context.user.id,
    "preparing",
    1,
    filename,
    createdAt,
    expiresAt,
  ).run();

  try {
    const result = await buildAcademyExport({
      id,
      schoolId: context.school.id,
      requestedBy: context.user.id,
      filename,
      objectKey,
    });
    const completedAt = Date.now();
    await env.DB.prepare(
      `UPDATE academy_exports SET status='completed',object_key=?,size_bytes=?,file_count=?,
       record_count=?,original_file_count=?,manifest_checksum=?,completed_at=?
       WHERE id=? AND school_id=?`,
    ).bind(
      objectKey,
      result.sizeBytes,
      result.fileCount,
      result.recordCount,
      result.originalFileCount,
      result.manifestChecksum,
      completedAt,
      id,
      context.school.id,
    ).run();
    await writeAuditLog({
      actorId: context.user.id,
      schoolId: context.school.id,
      action: "academy_export.completed",
      targetType: "academy_export",
      targetId: id,
      detail: {
        sizeBytes: result.sizeBytes,
        fileCount: result.fileCount,
        recordCount: result.recordCount,
        originalFileCount: result.originalFileCount,
      },
    });
    const exports = await listExports(context.school.id);
    return Response.json({ export: exports.results.find((item) => item.id === id) }, { status: 201 });
  } catch (error) {
    const message = safeErrorMessage(error);
    await env.UPLOADS.delete(objectKey).catch(() => undefined);
    await env.DB.prepare(
      `UPDATE academy_exports SET status='failed',failure_message=?,completed_at=?,expires_at=NULL
       WHERE id=? AND school_id=?`,
    ).bind(message, Date.now(), id, context.school.id).run();
    await recordSystemEvent(env.DB, {
      severity: "error",
      source: "academy-export",
      eventType: "academy_export.failed",
      message,
      route: "/api/academy-exports",
      detail: { exportId: id, schoolId: context.school.id },
    });
    return Response.json({ error: `The export could not be completed: ${message}` }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const context = await creatorContext(request);
  if ("error" in context) return context.error;
  const body = await request.json().catch(() => ({})) as { exportId?: string };
  const item = await env.DB.prepare(
    "SELECT id,object_key AS objectKey,status FROM academy_exports WHERE id=? AND school_id=?",
  ).bind(body.exportId || "", context.school.id).first<{
    id: string;
    objectKey: string | null;
    status: string;
  }>();
  if (!item) return Response.json({ error: "Export not found." }, { status: 404 });
  if (item.status === "preparing") {
    return Response.json({ error: "Wait for the current export to finish before removing it." }, { status: 409 });
  }
  if (item.objectKey) await env.UPLOADS.delete(item.objectKey);
  await env.DB.prepare(
    `UPDATE academy_exports SET status='deleted',object_key=NULL,deleted_at=?,
     download_token_hash=NULL,download_token_expires_at=NULL WHERE id=? AND school_id=?`,
  ).bind(Date.now(), item.id, context.school.id).run();
  await writeAuditLog({
    actorId: context.user.id,
    schoolId: context.school.id,
    action: "academy_export.deleted",
    targetType: "academy_export",
    targetId: item.id,
  });
  return Response.json({ ok: true });
}
