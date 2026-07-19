import { env } from "cloudflare:workers";
import { createPlatformBackup } from "../../../../lib/platform-backup";
import { revokeProductAccess } from "../../../../lib/product-access";
import { recordSystemEvent } from "../../../../lib/system-monitor";

function authorized(request: Request) {
  const configured = process.env.MAINTENANCE_SECRET || "";
  const supplied = request.headers.get("x-maintenance-secret") || "";
  return configured.length >= 24 && supplied === configured;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Maintenance access denied." }, { status: 403 });
  }
  const now = Date.now();
  const lastBackup = await env.DB.prepare(
    `SELECT completed_at AS completedAt FROM backup_runs
     WHERE status='completed' ORDER BY completed_at DESC LIMIT 1`,
  ).first<{ completedAt: number | null }>();
  let backup: Awaited<ReturnType<typeof createPlatformBackup>> | null = null;
  if (!lastBackup?.completedAt || lastBackup.completedAt < now - 24 * 60 * 60_000) {
    backup = await createPlatformBackup("scheduled-maintenance");
  }
  const expired = await env.DB.prepare(
    `SELECT id FROM product_entitlements
     WHERE status='active' AND expires_at IS NOT NULL AND expires_at<=?
     ORDER BY expires_at LIMIT 1000`,
  ).bind(now).all<{ id: string }>();
  for (const entitlement of expired.results) {
    await revokeProductAccess(env.DB, entitlement.id, now);
    await env.DB.prepare(
      "UPDATE product_entitlements SET status='expired',updated_at=? WHERE id=?",
    ).bind(now, entitlement.id).run();
  }
  const cleanup = await env.DB.batch([
    env.DB.prepare("DELETE FROM rate_limit_buckets WHERE reset_at<?").bind(
      now - 24 * 60 * 60_000,
    ),
    env.DB.prepare(
      "DELETE FROM media_playback_grants WHERE expires_at<?",
    ).bind(now - 24 * 60 * 60_000),
    env.DB.prepare(
      "DELETE FROM system_events WHERE status='resolved' AND resolved_at<?",
    ).bind(now - 90 * 24 * 60 * 60_000),
  ]);
  await recordSystemEvent(env.DB, {
    severity: "info",
    source: "maintenance",
    eventType: "maintenance.completed",
    message: "Scheduled maintenance completed.",
    detail: {
      backupId: backup?.id,
      rateLimitBuckets: cleanup[0].meta.changes,
      playbackGrants: cleanup[1].meta.changes,
      resolvedEvents: cleanup[2].meta.changes,
      expiredEntitlements: expired.results.length,
    },
  });
  return Response.json({
    completed: true,
    backup,
    cleanup: {
      rateLimitBuckets: cleanup[0].meta.changes,
      playbackGrants: cleanup[1].meta.changes,
      resolvedEvents: cleanup[2].meta.changes,
      expiredEntitlements: expired.results.length,
    },
  });
}
