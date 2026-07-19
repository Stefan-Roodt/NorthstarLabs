import { env } from "cloudflare:workers";

export async function writeAuditLog(input: {
  actorId: string;
  schoolId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  detail?: Record<string, unknown>;
}) {
  await env.DB.prepare(
    `INSERT INTO audit_logs
      (id,actor_id,school_id,action,target_type,target_id,detail_json,created_at)
     VALUES (?,?,?,?,?,?,?,?)`,
  ).bind(
    crypto.randomUUID(),
    input.actorId,
    input.schoolId || null,
    input.action.slice(0, 80),
    input.targetType.slice(0, 60),
    input.targetId.slice(0, 160),
    JSON.stringify(input.detail || {}).slice(0, 4_000),
    Date.now(),
  ).run();
}
