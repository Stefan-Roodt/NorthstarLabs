import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../lib/server-auth";

const preferenceSelect = `SELECT enrollment_emails AS enrollmentEmails,
  completion_emails AS completionEmails,community_emails AS communityEmails,
  creator_summaries AS creatorSummaries,product_updates AS productUpdates,
  updated_at AS updatedAt FROM notification_preferences WHERE user_id=?`;

async function ensurePreferences(userId: string) {
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO notification_preferences
      (id,user_id,enrollment_emails,completion_emails,community_emails,
       creator_summaries,product_updates,updated_at)
     VALUES (?,?,1,1,1,1,0,?)
     ON CONFLICT(user_id) DO NOTHING`,
  ).bind(crypto.randomUUID(), userId, now).run();
  return env.DB.prepare(preferenceSelect).bind(userId).first();
}

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(await ensurePreferences(user.id));
}

export async function PATCH(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const current = await ensurePreferences(user.id) as Record<string, unknown>;
  const body = await request.json() as Record<string, unknown>;
  const value = (key: string) => body[key] === undefined
    ? Boolean(current[key])
    : Boolean(body[key]);
  await env.DB.prepare(
    `UPDATE notification_preferences SET enrollment_emails=?,completion_emails=?,
      community_emails=?,creator_summaries=?,product_updates=?,updated_at=?
     WHERE user_id=?`,
  ).bind(
    value("enrollmentEmails") ? 1 : 0,
    value("completionEmails") ? 1 : 0,
    value("communityEmails") ? 1 : 0,
    value("creatorSummaries") ? 1 : 0,
    value("productUpdates") ? 1 : 0,
    Date.now(),
    user.id,
  ).run();
  return Response.json({ saved: true, ...(await ensurePreferences(user.id) as object) });
}
