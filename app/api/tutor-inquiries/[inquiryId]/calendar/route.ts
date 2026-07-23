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

function safeFilename(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ inquiryId: string }> },
) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { inquiryId } = await context.params;
  const appointment = await env.DB.prepare(
    `SELECT ti.id,ti.subject,ti.updated_at AS updatedAt,
      t.display_name AS tutorName,s.name AS schoolName,
      ts.starts_at AS startsAt,ts.ends_at AS endsAt,
      ts.session_mode AS sessionMode,ts.meeting_details AS meetingDetails
     FROM tutor_inquiries ti
     JOIN tutors t ON t.id=ti.tutor_id
     JOIN schools s ON s.id=ti.school_id
     JOIN tutor_slots ts ON ts.id=ti.slot_id
     WHERE ti.id=? AND ti.learner_id=?
       AND ti.status IN ('booked','completed')
       AND ts.status IN ('booked','completed')`,
  ).bind(inquiryId, user.id).first<{
    id: string;
    subject: string;
    updatedAt: number;
    tutorName: string;
    schoolName: string;
    startsAt: number;
    endsAt: number;
    sessionMode: string;
    meetingDetails: string;
  }>();
  if (!appointment) {
    return Response.json({ error: "Confirmed coaching appointment not found." }, { status: 404 });
  }

  const title = `Coaching with ${appointment.tutorName}`;
  const description = [
    appointment.subject,
    appointment.meetingDetails
      ? `Joining or venue details: ${appointment.meetingDetails}`
      : "Open My coaching in NorthstarLabs for the latest joining or venue details.",
  ].join("\n\n");
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NorthstarLabs//Coaching Appointments//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:tutoring-${appointment.id}@northstarlabs.co.za`,
    `DTSTAMP:${calendarDate(appointment.updatedAt)}`,
    `DTSTART:${calendarDate(appointment.startsAt)}`,
    `DTEND:${calendarDate(appointment.endsAt)}`,
    `SUMMARY:${calendarText(title)}`,
    `DESCRIPTION:${calendarText(description)}`,
    `LOCATION:${calendarText(appointment.meetingDetails || appointment.sessionMode.replaceAll("_", " "))}`,
    `ORGANIZER;CN=${calendarText(appointment.schoolName)}:mailto:noreply@northstarlabs.co.za`,
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${calendarText(`${title} begins in 1 hour`)}`,
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${calendarText(`${title} begins in 15 minutes`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
  const filename = safeFilename(`northstarlabs-${appointment.tutorName}`) || "northstarlabs-coaching";
  return new Response(calendar, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}.ics"`,
      "cache-control": "private, no-store",
    },
  });
}
