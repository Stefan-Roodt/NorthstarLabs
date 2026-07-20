import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../../lib/server-auth";

function calendarDate(value: number) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function calendarText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export async function GET(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { sessionId } = await context.params;
  const session = await env.DB.prepare(
    `SELECT ls.id,ls.title,ls.description,ls.starts_at AS startsAt,
      ls.ends_at AS endsAt,ls.meeting_url AS meetingUrl,
      ls.updated_at AS updatedAt,s.name AS schoolName
     FROM live_sessions ls
     JOIN schools s ON s.id=ls.school_id
     LEFT JOIN live_attendance la ON la.session_id=ls.id AND la.user_id=?
       AND la.status IN ('registered','attended')
     LEFT JOIN school_members sm ON sm.school_id=ls.school_id AND sm.user_id=?
       AND sm.status='active' AND sm.role IN ('owner','admin','instructor')
     WHERE ls.id=? AND ls.status<>'cancelled'
       AND (la.id IS NOT NULL OR sm.id IS NOT NULL)`,
  ).bind(
    user.id,
    user.id,
    sessionId,
  ).first<{
    id: string;
    title: string;
    description: string;
    startsAt: number;
    endsAt: number;
    meetingUrl: string;
    updatedAt: number;
    schoolName: string;
  }>();
  if (!session) return Response.json({ error: "Live session not found." }, { status: 404 });

  const description = [
    session.description,
    `Join: ${session.meetingUrl}`,
  ].filter(Boolean).join("\n\n");
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NorthStarLabs//Live Learning//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${session.id}@northstarlabs.co.za`,
    `DTSTAMP:${calendarDate(session.updatedAt)}`,
    `DTSTART:${calendarDate(session.startsAt)}`,
    `DTEND:${calendarDate(session.endsAt)}`,
    `SUMMARY:${calendarText(session.title)}`,
    `DESCRIPTION:${calendarText(description)}`,
    `LOCATION:${calendarText(session.meetingUrl)}`,
    `ORGANIZER;CN=${calendarText(session.schoolName)}:mailto:noreply@northstarlabs.co.za`,
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${calendarText(`${session.title} begins in 1 hour`)}`,
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${calendarText(`${session.title} begins in 15 minutes`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
  return new Response(calendar, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="northstarlabs-${session.id}.ics"`,
      "cache-control": "private, no-store",
    },
  });
}
