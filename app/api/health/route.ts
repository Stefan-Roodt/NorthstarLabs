import { env } from "cloudflare:workers";
import { requestId } from "../../../lib/system-monitor";

export async function GET(request: Request) {
  const currentRequestId = requestId(request);
  const startedAt = Date.now();
  try {
    await env.DB.prepare("SELECT 1 AS healthy").first();
    const state = await env.DB.prepare(
      `SELECT
        (SELECT COUNT(*) FROM system_events
          WHERE status='open' AND severity IN ('critical','error')) AS openErrors,
        (SELECT MAX(completed_at) FROM backup_runs
          WHERE status='completed') AS lastBackupAt`,
    ).first<{ openErrors: number; lastBackupAt: number | null }>();
    return Response.json({
      status: Number(state?.openErrors || 0) > 0 ? "degraded" : "ok",
      checks: {
        database: "ok",
        objectStorage: env.UPLOADS ? "available" : "unavailable",
        recentBackup: state?.lastBackupAt &&
          state.lastBackupAt > Date.now() - 48 * 60 * 60_000
          ? "ok"
          : "attention",
      },
      requestId: currentRequestId,
      responseTimeMs: Date.now() - startedAt,
      timestamp: Date.now(),
    }, {
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return Response.json({
      status: "unavailable",
      checks: { database: "unavailable" },
      requestId: currentRequestId,
      responseTimeMs: Date.now() - startedAt,
      timestamp: Date.now(),
    }, {
      status: 503,
      headers: { "cache-control": "no-store" },
    });
  }
}

