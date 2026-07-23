import { env } from "cloudflare:workers";
import {
  cancelUserLiveSessionReminders,
  queueUserLiveSessionReminders,
} from "../../../lib/live-session-reminders";
import { requireApiUser } from "../../../lib/server-auth";

const preferenceSelect = `SELECT enrollment_emails AS enrollmentEmails,
  completion_emails AS completionEmails,community_emails AS communityEmails,
  live_session_reminders AS liveSessionReminders,
  creator_summaries AS creatorSummaries,product_updates AS productUpdates,
  updated_at AS updatedAt FROM notification_preferences WHERE user_id=?`;

async function ensurePreferences(userId: string) {
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO notification_preferences
      (id,user_id,enrollment_emails,completion_emails,community_emails,
       live_session_reminders,creator_summaries,product_updates,updated_at)
     VALUES (?,?,1,1,1,1,1,0,?)
     ON CONFLICT(user_id) DO NOTHING`,
  ).bind(crypto.randomUUID(), userId, now).run();
  return env.DB.prepare(preferenceSelect).bind(userId).first();
}

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const [preferences, notifications, unread] = await Promise.all([
    ensurePreferences(user.id),
    env.DB.prepare(
      `SELECT id,template_key AS templateKey,title,body,
        action_label AS actionLabel,action_url AS actionUrl,
        read_at AS readAt,created_at AS createdAt
       FROM in_app_notifications WHERE user_id=?
       ORDER BY created_at DESC LIMIT 50`,
    ).bind(user.id).all(),
    env.DB.prepare(
      "SELECT COUNT(*) AS count FROM in_app_notifications WHERE user_id=? AND read_at IS NULL",
    ).bind(user.id).first<{ count: number }>(),
  ]);
  return Response.json({
    ...preferences as object,
    inbox: notifications.results,
    unreadCount: Number(unread?.count || 0),
  });
}

export async function PATCH(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const current = await ensurePreferences(user.id) as Record<string, unknown>;
  const body = await request.json() as Record<string, unknown>;
  if (body.action === "mark_read") {
    const id = typeof body.id === "string" ? body.id.slice(0, 100) : "";
    if (!id) return Response.json({ error: "Choose a notification." }, { status: 400 });
    const saved = await env.DB.prepare(
      `UPDATE in_app_notifications SET read_at=COALESCE(read_at,?)
       WHERE id=? AND user_id=? RETURNING id`,
    ).bind(Date.now(), id, user.id).first();
    if (!saved) return Response.json({ error: "Notification not found." }, { status: 404 });
    return Response.json({ saved: true, id });
  }
  if (body.action === "mark_all_read") {
    await env.DB.prepare(
      "UPDATE in_app_notifications SET read_at=COALESCE(read_at,?) WHERE user_id=?",
    ).bind(Date.now(), user.id).run();
    return Response.json({ saved: true });
  }
  const value = (key: string) => body[key] === undefined
    ? Boolean(current[key])
    : Boolean(body[key]);
  await env.DB.prepare(
    `UPDATE notification_preferences SET enrollment_emails=?,completion_emails=?,
      community_emails=?,live_session_reminders=?,creator_summaries=?,
      product_updates=?,updated_at=?
     WHERE user_id=?`,
  ).bind(
    value("enrollmentEmails") ? 1 : 0,
    value("completionEmails") ? 1 : 0,
    value("communityEmails") ? 1 : 0,
    value("liveSessionReminders") ? 1 : 0,
    value("creatorSummaries") ? 1 : 0,
    value("productUpdates") ? 1 : 0,
    Date.now(),
    user.id,
  ).run();
  if (body.liveSessionReminders === false) {
    await cancelUserLiveSessionReminders(user.id).catch(() => null);
  } else if (body.liveSessionReminders === true) {
    await queueUserLiveSessionReminders(user.id, new URL(request.url).origin).catch(() => null);
  }
  return Response.json({ saved: true, ...(await ensurePreferences(user.id) as object) });
}
