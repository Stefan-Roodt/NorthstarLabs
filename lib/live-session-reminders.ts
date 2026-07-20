import { env } from "cloudflare:workers";
import {
  cancelEmailsByIdempotencyPattern,
  cancelEmailsByIdempotencyPrefix,
  queueEmail,
  scheduleDeferredEmails,
} from "./email-service";

const reminders = [
  { key: "24h", offsetMs: 24 * 60 * 60_000, label: "starts tomorrow" },
  { key: "1h", offsetMs: 60 * 60_000, label: "starts in 1 hour" },
] as const;

type ReminderRecipient = {
  sessionId: string;
  title: string;
  startsAt: number;
  timezone: string;
  capacity: number;
  schoolId: string;
  schoolName: string;
  primaryColor: string;
  userId: string;
  email: string;
  displayName: string;
};

function sessionTime(startsAt: number, timezone: string) {
  try {
    return new Intl.DateTimeFormat("en-ZA", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: timezone,
    }).format(new Date(startsAt));
  } catch {
    return new Intl.DateTimeFormat("en-ZA", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Africa/Johannesburg",
    }).format(new Date(startsAt));
  }
}

export async function queueLiveSessionReminders(input: {
  sessionId: string;
  origin: string;
  userId?: string;
  limit?: number;
}) {
  const limit = Math.max(1, Math.min(input.limit || 100, 250));
  const recipients = await env.DB.prepare(
    `SELECT ls.id AS sessionId,ls.title,ls.starts_at AS startsAt,
      ls.timezone,ls.capacity,ls.school_id AS schoolId,
      s.name AS schoolName,s.primary_color AS primaryColor,
      p.id AS userId,p.email,p.display_name AS displayName
     FROM live_sessions ls
     JOIN schools s ON s.id=ls.school_id
     JOIN live_attendance la ON la.session_id=ls.id
       AND la.status IN ('registered','attended')
     JOIN profiles p ON p.id=la.user_id
     LEFT JOIN notification_preferences np ON np.user_id=p.id
     WHERE ls.id=? AND ls.status='scheduled' AND ls.starts_at>?
       AND (?='' OR p.id=?)
       AND COALESCE(np.live_session_reminders,1)=1
       AND NOT EXISTS(
         SELECT 1 FROM email_messages em
         WHERE em.idempotency_key LIKE
           'live-reminder:' || ls.id || ':' || p.id || ':' || ls.starts_at || ':%'
           AND em.status<>'cancelled'
       )
     ORDER BY p.id LIMIT ?`,
  ).bind(
    input.sessionId,
    Date.now() + 5 * 60_000,
    input.userId || "",
    input.userId || "",
    limit,
  ).all<ReminderRecipient>();

  const results: Array<{ id: string; status: string }> = [];
  const now = Date.now();
  for (let offset = 0; offset < recipients.results.length; offset += 8) {
    const batch = recipients.results.slice(offset, offset + 8);
    const queued = await Promise.all(batch.flatMap((recipient) =>
      reminders
        .map((reminder) => ({
          reminder,
          scheduledFor: recipient.startsAt - reminder.offsetMs,
        }))
        .filter(({ scheduledFor }) => scheduledFor > now + 5 * 60_000)
        .map(({ reminder, scheduledFor }) => queueEmail({
          schoolId: recipient.schoolId,
          recipientUserId: recipient.userId,
          recipientEmail: recipient.email,
          templateKey: "live_session_reminder",
          variables: {
            academy: recipient.schoolName,
            learner: recipient.displayName,
            session: recipient.title,
            sessionType: recipient.capacity === 1 ? "1:1 coaching" : "group learning",
            reminderLabel: reminder.label,
            starts: sessionTime(recipient.startsAt, recipient.timezone),
            timezone: recipient.timezone,
            primaryColor: recipient.primaryColor,
            actionUrl: `${input.origin}/live`,
          },
          idempotencyKey: `live-reminder:${recipient.sessionId}:${recipient.userId}:${recipient.startsAt}:${reminder.key}`,
          scheduledFor,
        })),
    ));
    results.push(...queued);
  }
  return {
    recipients: recipients.results.length,
    reminders: results.length,
    statuses: results.reduce<Record<string, number>>((counts, result) => {
      counts[result.status] = (counts[result.status] || 0) + 1;
      return counts;
    }, {}),
  };
}

export async function backfillLiveSessionReminders(origin: string) {
  const sessions = await env.DB.prepare(
    `SELECT DISTINCT ls.id
     FROM live_sessions ls
     JOIN live_attendance la ON la.session_id=ls.id
       AND la.status IN ('registered','attended')
     JOIN profiles p ON p.id=la.user_id
     LEFT JOIN notification_preferences np ON np.user_id=p.id
     WHERE ls.status='scheduled' AND ls.starts_at>?
       AND COALESCE(np.live_session_reminders,1)=1
       AND NOT EXISTS(
         SELECT 1 FROM email_messages em
         WHERE em.idempotency_key LIKE
           'live-reminder:' || ls.id || ':' || p.id || ':' || ls.starts_at || ':%'
           AND em.status<>'cancelled'
       )
     ORDER BY ls.starts_at LIMIT 20`,
  ).bind(Date.now() + 65 * 60_000).all<{ id: string }>();
  const queued = [];
  for (const session of sessions.results) {
    queued.push(await queueLiveSessionReminders({
      sessionId: session.id,
      origin,
      limit: 100,
    }));
  }
  const dispatched = await scheduleDeferredEmails();
  return { sessions: queued, dispatched };
}

export function cancelLiveSessionReminders(sessionId: string, userId?: string) {
  return cancelEmailsByIdempotencyPrefix(
    userId ? `live-reminder:${sessionId}:${userId}:` : `live-reminder:${sessionId}:`,
  );
}

export function cancelUserLiveSessionReminders(userId: string) {
  return cancelEmailsByIdempotencyPattern(`live-reminder:%:${userId}:%`);
}

export async function queueUserLiveSessionReminders(userId: string, origin: string) {
  const sessions = await env.DB.prepare(
    `SELECT DISTINCT ls.id
     FROM live_sessions ls
     JOIN live_attendance la ON la.session_id=ls.id
       AND la.user_id=? AND la.status IN ('registered','attended')
     WHERE ls.status='scheduled' AND ls.starts_at>?
     ORDER BY ls.starts_at LIMIT 50`,
  ).bind(userId, Date.now() + 5 * 60_000).all<{ id: string }>();
  const results = [];
  for (const session of sessions.results) {
    results.push(await queueLiveSessionReminders({
      sessionId: session.id,
      userId,
      origin,
    }));
  }
  return results;
}
