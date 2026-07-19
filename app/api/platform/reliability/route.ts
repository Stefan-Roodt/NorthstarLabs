import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../../lib/audit-log";
import {
  createPlatformBackup,
  verifyPlatformBackup,
} from "../../../../lib/platform-backup";
import { requirePlatformAdmin } from "../../../../lib/platform-admin";

export async function GET(request: Request) {
  const user = await requirePlatformAdmin(request);
  if (!user) {
    return Response.json(
      { error: "Platform administrator access required." },
      { status: 403 },
    );
  }
  const [metrics, events, backups, storage, requests, reports] = await Promise.all([
    env.DB.prepare(
      `SELECT
        (SELECT COUNT(*) FROM system_events WHERE status='open') AS openEvents,
        (SELECT COUNT(*) FROM system_events
          WHERE status='open' AND severity IN ('critical','error')) AS openErrors,
        (SELECT COUNT(*) FROM system_events
          WHERE event_type='http.server_error' AND created_at>?) AS serverErrors24h,
        (SELECT COUNT(*) FROM rate_limit_buckets WHERE reset_at>?) AS activeRateBuckets,
        (SELECT COALESCE(SUM(size_bytes),0) FROM media_assets) AS storedBytes,
        (SELECT COUNT(*) FROM media_assets) AS storedFiles,
        (SELECT COUNT(*) FROM data_requests WHERE status='pending') AS pendingDataRequests,
        (SELECT COUNT(*) FROM content_reports WHERE status='open') AS openContentReports,
        (SELECT MAX(completed_at) FROM backup_runs
          WHERE status='completed') AS lastBackupAt`,
    ).bind(Date.now() - 24 * 60 * 60_000, Date.now()).first(),
    env.DB.prepare(
      `SELECT id,severity,source,event_type AS eventType,message,request_id AS requestId,
        route,detail_json AS detailJson,status,created_at AS createdAt,
        resolved_at AS resolvedAt
       FROM system_events ORDER BY created_at DESC LIMIT 100`,
    ).all(),
    env.DB.prepare(
      `SELECT id,status,table_count AS tableCount,row_count AS rowCount,
        size_bytes AS sizeBytes,checksum,failure_message AS failureMessage,
        created_at AS createdAt,completed_at AS completedAt,verified_at AS verifiedAt
       FROM backup_runs ORDER BY created_at DESC LIMIT 30`,
    ).all(),
    env.DB.prepare(
      `SELECT s.id,s.name,s.slug,COUNT(ma.id) AS files,
        COALESCE(SUM(ma.size_bytes),0) AS bytes
       FROM schools s LEFT JOIN media_assets ma ON ma.school_id=s.id
       GROUP BY s.id ORDER BY bytes DESC,s.name LIMIT 100`,
    ).all(),
    env.DB.prepare(
      `SELECT dr.id,dr.request_type AS requestType,dr.status,
        dr.failure_message AS failureMessage,dr.created_at AS createdAt,
        p.email,p.display_name AS displayName
       FROM data_requests dr LEFT JOIN profiles p ON p.id=dr.user_id
       ORDER BY dr.created_at DESC LIMIT 50`,
    ).all(),
    env.DB.prepare(
      `SELECT cr.id,cr.school_id AS schoolId,cr.post_id AS postId,cr.reason,
        cr.detail,cr.status,cr.created_at AS createdAt,s.name AS schoolName,
        COALESCE(reporter.display_name,reporter.email,'Member') AS reporter,
        COALESCE(author.display_name,author.email,'Member') AS author,
        p.body AS postBody
       FROM content_reports cr
       JOIN schools s ON s.id=cr.school_id
       JOIN posts p ON p.id=cr.post_id
       LEFT JOIN profiles reporter ON reporter.id=cr.reporter_id
       LEFT JOIN profiles author ON author.id=p.author_id
       ORDER BY CASE cr.status WHEN 'open' THEN 0 ELSE 1 END,cr.created_at DESC
       LIMIT 100`,
    ).all(),
  ]);
  return Response.json({
    metrics,
    events: events.results,
    backups: backups.results,
    storage: storage.results,
    dataRequests: requests.results,
    contentReports: reports.results,
    configuration: {
      automatedMaintenance: Boolean(process.env.MAINTENANCE_SECRET),
      storageQuotaBytes: Number(process.env.SCHOOL_STORAGE_QUOTA_BYTES || 0) ||
        5 * 1024 * 1024 * 1024,
    },
  });
}

export async function POST(request: Request) {
  const user = await requirePlatformAdmin(request);
  if (!user) {
    return Response.json(
      { error: "Platform administrator access required." },
      { status: 403 },
    );
  }
  const body = await request.json() as {
    action?: string;
    backupId?: string;
    eventId?: string;
    reportId?: string;
  };

  if (body.action === "backup") {
    const running = await env.DB.prepare(
      "SELECT id FROM backup_runs WHERE status='running' AND created_at>? LIMIT 1",
    ).bind(Date.now() - 30 * 60_000).first();
    if (running) {
      return Response.json(
        { error: "A backup is already running." },
        { status: 409 },
      );
    }
    const result = await createPlatformBackup(user.id);
    await writeAuditLog({
      actorId: user.id,
      action: "platform.backup.create",
      targetType: "backup",
      targetId: result.id,
      detail: { rowCount: result.rowCount, sizeBytes: result.sizeBytes },
    });
    return Response.json(result, { status: 201 });
  }

  if (body.action === "verify" && body.backupId) {
    try {
      const result = await verifyPlatformBackup(body.backupId, user.id);
      await writeAuditLog({
        actorId: user.id,
        action: "platform.backup.verify",
        targetType: "backup",
        targetId: body.backupId,
      });
      return Response.json(result);
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : "Backup verification failed." },
        { status: 422 },
      );
    }
  }

  if (body.action === "resolve" && body.eventId) {
    const result = await env.DB.prepare(
      `UPDATE system_events SET status='resolved',resolved_at=?,resolved_by=?
       WHERE id=? AND status='open'`,
    ).bind(Date.now(), user.id, body.eventId).run();
    if (!result.meta.changes) {
      return Response.json({ error: "Open event not found." }, { status: 404 });
    }
    await writeAuditLog({
      actorId: user.id,
      action: "platform.event.resolve",
      targetType: "system_event",
      targetId: body.eventId,
    });
    return Response.json({ saved: true });
  }

  if (body.action === "prune") {
    const now = Date.now();
    const [buckets, events] = await env.DB.batch([
      env.DB.prepare("DELETE FROM rate_limit_buckets WHERE reset_at<?").bind(
        now - 24 * 60 * 60_000,
      ),
      env.DB.prepare(
        "DELETE FROM system_events WHERE status='resolved' AND resolved_at<?",
      ).bind(now - 90 * 24 * 60 * 60_000),
    ]);
    await writeAuditLog({
      actorId: user.id,
      action: "platform.maintenance.prune",
      targetType: "platform",
      targetId: "northstarlabs",
      detail: {
        rateLimitBuckets: buckets.meta.changes,
        resolvedEvents: events.meta.changes,
      },
    });
    return Response.json({
      pruned: {
        rateLimitBuckets: buckets.meta.changes,
        resolvedEvents: events.meta.changes,
      },
    });
  }

  if (
    ["hide_reported_post", "dismiss_report"].includes(body.action || "") &&
    body.reportId
  ) {
    const report = await env.DB.prepare(
      `SELECT id,school_id AS schoolId,post_id AS postId,status
       FROM content_reports WHERE id=?`,
    ).bind(body.reportId).first<{
      id: string;
      schoolId: string;
      postId: string;
      status: string;
    }>();
    if (!report || report.status !== "open") {
      return Response.json({ error: "Open content report not found." }, { status: 404 });
    }
    const reviewedAt = Date.now();
    const statements = [
      env.DB.prepare(
        `UPDATE content_reports SET status=?,reviewed_by=?,reviewed_at=?
         WHERE id=? AND status='open'`,
      ).bind(
        body.action === "hide_reported_post" ? "actioned" : "dismissed",
        user.id,
        reviewedAt,
        report.id,
      ),
    ];
    if (body.action === "hide_reported_post") {
      statements.push(
        env.DB.prepare(
          `UPDATE posts SET status='hidden',moderated_by=?,moderated_at=?
           WHERE id=?`,
        ).bind(user.id, reviewedAt, report.postId),
      );
    }
    await env.DB.batch(statements);
    await writeAuditLog({
      actorId: user.id,
      schoolId: report.schoolId,
      action: `platform.content_report.${
        body.action === "hide_reported_post" ? "actioned" : "dismissed"
      }`,
      targetType: "content_report",
      targetId: report.id,
      detail: { postId: report.postId },
    });
    return Response.json({ saved: true });
  }

  return Response.json({ error: "Unsupported reliability action." }, { status: 400 });
}
