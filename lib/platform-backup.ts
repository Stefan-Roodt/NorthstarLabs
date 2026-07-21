import { env } from "cloudflare:workers";
import { recordSystemEvent, safeErrorMessage } from "./system-monitor";
import { sha256Hex } from "./security";

const BACKUP_TABLES = [
  "profiles",
  "schools",
  "school_members",
  "invitations",
  "courses",
  "course_sections",
  "media_assets",
  "media_playback_grants",
  "lessons",
  "lesson_resources",
  "enrollments",
  "communities",
  "posts",
  "content_reports",
  "community_members",
  "memberships",
  "products",
  "product_items",
  "product_entitlements",
  "live_sessions",
  "live_attendance",
  "integrations",
  "integration_deliveries",
  "lesson_progress",
  "quizzes",
  "quiz_questions",
  "quiz_attempts",
  "learner_concept_mastery",
  "mastery_practice_attempts",
  "certificates",
  "learning_portfolios",
  "portfolio_source_visibility",
  "portfolio_evidence",
  "email_messages",
  "notification_preferences",
  "report_schedules",
  "audit_logs",
  "system_events",
  "backup_runs",
  "data_requests",
] as const;

const MAX_BACKUP_BYTES = 50 * 1024 * 1024;

export async function createPlatformBackup(requestedBy: string) {
  const id = crypto.randomUUID();
  const createdAt = Date.now();
  await env.DB.prepare(
    `INSERT INTO backup_runs
      (id,requested_by,status,table_count,row_count,size_bytes,created_at)
     VALUES (?,?,?,0,0,0,?)`,
  ).bind(id, requestedBy, "running", createdAt).run();

  try {
    const tables: Record<string, unknown[]> = {};
    let rowCount = 0;
    for (const table of BACKUP_TABLES) {
      const rows = await env.DB.prepare(`SELECT * FROM "${table}"`).all();
      tables[table] = rows.results;
      rowCount += rows.results.length;
    }
    const payload = JSON.stringify({
      format: "northstarlabs-d1-backup",
      schemaVersion: 1,
      backupId: id,
      createdAt,
      tableNames: BACKUP_TABLES,
      tables,
    });
    const bytes = new TextEncoder().encode(payload);
    if (bytes.byteLength > MAX_BACKUP_BYTES) {
      throw new Error("Backup exceeded the current 50 MB safety limit.");
    }
    const checksum = await sha256Hex(bytes);
    const objectKey = `backups/platform/${new Date(createdAt).toISOString().slice(0, 10)}/${id}.json`;
    await env.UPLOADS.put(objectKey, bytes, {
      httpMetadata: { contentType: "application/json" },
      customMetadata: {
        backupId: id,
        checksum,
        createdAt: String(createdAt),
      },
    });
    await env.DB.prepare(
      `UPDATE backup_runs SET status='completed',object_key=?,table_count=?,
       row_count=?,size_bytes=?,checksum=?,completed_at=? WHERE id=?`,
    ).bind(
      objectKey,
      BACKUP_TABLES.length,
      rowCount,
      bytes.byteLength,
      checksum,
      Date.now(),
      id,
    ).run();
    await recordSystemEvent(env.DB, {
      severity: "info",
      source: "backup",
      eventType: "backup.completed",
      message: `Platform backup completed with ${rowCount} records.`,
      detail: { backupId: id, tableCount: BACKUP_TABLES.length, rowCount },
    });
    return {
      id,
      status: "completed",
      tableCount: BACKUP_TABLES.length,
      rowCount,
      sizeBytes: bytes.byteLength,
      checksum,
      createdAt,
    };
  } catch (error) {
    const message = safeErrorMessage(error);
    await env.DB.prepare(
      "UPDATE backup_runs SET status='failed',failure_message=?,completed_at=? WHERE id=?",
    ).bind(message, Date.now(), id).run();
    await recordSystemEvent(env.DB, {
      severity: "critical",
      source: "backup",
      eventType: "backup.failed",
      message,
      detail: { backupId: id },
    });
    throw error;
  }
}

export async function verifyPlatformBackup(backupId: string, verifiedBy: string) {
  const backup = await env.DB.prepare(
    `SELECT id,object_key AS objectKey,checksum,status
     FROM backup_runs WHERE id=?`,
  ).bind(backupId).first<{
    id: string;
    objectKey: string | null;
    checksum: string | null;
    status: string;
  }>();
  if (!backup?.objectKey || backup.status !== "completed") {
    throw new Error("A completed backup is required.");
  }
  const object = await env.UPLOADS.get(backup.objectKey);
  if (!object) throw new Error("Backup file is missing from storage.");
  const bytes = new Uint8Array(await object.arrayBuffer());
  const checksum = await sha256Hex(bytes);
  if (checksum !== backup.checksum) throw new Error("Backup checksum verification failed.");
  const parsed = JSON.parse(new TextDecoder().decode(bytes)) as {
    format?: string;
    backupId?: string;
    tableNames?: unknown[];
  };
  if (
    parsed.format !== "northstarlabs-d1-backup" ||
    parsed.backupId !== backup.id ||
    !Array.isArray(parsed.tableNames)
  ) {
    throw new Error("Backup manifest verification failed.");
  }
  const verifiedAt = Date.now();
  await env.DB.prepare(
    "UPDATE backup_runs SET verified_at=? WHERE id=?",
  ).bind(verifiedAt, backup.id).run();
  await recordSystemEvent(env.DB, {
    severity: "info",
    source: "backup",
    eventType: "backup.verified",
    message: "Platform backup checksum and manifest verified.",
    detail: { backupId: backup.id, verifiedBy },
  });
  return { id: backup.id, status: "verified", verifiedAt };
}
