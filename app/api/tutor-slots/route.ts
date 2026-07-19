import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../lib/audit-log";
import { emitIntegrationEvent } from "../../../lib/integrations";
import { requestedSchoolId, requireCreatorSchool } from "../../../lib/school-access";
import { requireApiUser } from "../../../lib/server-auth";

const sessionModes = new Set(["online", "in_person"]);

async function creatorContext(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) {
    return { error: Response.json({ error: "Creator access required." }, { status: 403 }) };
  }
  return { user, school };
}

export async function GET(request: Request) {
  const context = await creatorContext(request);
  if ("error" in context) return context.error;
  const rows = await env.DB.prepare(
    `SELECT ts.id,ts.tutor_id AS tutorId,ts.starts_at AS startsAt,
      ts.ends_at AS endsAt,ts.timezone,ts.session_mode AS sessionMode,
      ts.meeting_details AS meetingDetails,ts.status,
      ts.created_at AS createdAt,ts.updated_at AS updatedAt,
      t.display_name AS tutorName,
      ti.id AS inquiryId,ti.learner_name AS learnerName,
      ti.status AS inquiryStatus
     FROM tutor_slots ts
     JOIN tutors t ON t.id=ts.tutor_id
     LEFT JOIN tutor_inquiries ti ON ti.slot_id=ts.id
       AND ti.status NOT IN ('declined','closed')
     WHERE ts.school_id=? AND ts.starts_at>?
     ORDER BY ts.starts_at ASC LIMIT 1000`,
  ).bind(context.school.id, Date.now() - 24 * 60 * 60_000).all();
  return Response.json({ school: context.school, slots: rows.results });
}

export async function POST(request: Request) {
  const context = await creatorContext(request);
  if ("error" in context) return context.error;
  const body = await request.json() as Record<string, unknown>;
  const tutorId = typeof body.tutorId === "string" ? body.tutorId.slice(0, 100) : "";
  const tutor = await env.DB.prepare(
    `SELECT id,display_name AS displayName FROM tutors
     WHERE id=? AND school_id=? AND status<>'archived'`,
  ).bind(tutorId, context.school.id).first<{ id: string; displayName: string }>();
  if (!tutor) return Response.json({ error: "Tutor not found." }, { status: 404 });
  const startsAt = Number(body.startsAt);
  const durationMinutes = Math.max(15, Math.min(Math.round(Number(body.durationMinutes || 60)), 480));
  const repeatWeeks = Math.max(1, Math.min(Math.round(Number(body.repeatWeeks || 1)), 12));
  if (!Number.isFinite(startsAt) || startsAt < Date.now() + 5 * 60_000) {
    return Response.json({ error: "Choose a future appointment time." }, { status: 400 });
  }
  const timezone = typeof body.timezone === "string"
    ? body.timezone.trim().slice(0, 80)
    : "Africa/Johannesburg";
  const sessionMode = sessionModes.has(String(body.sessionMode))
    ? String(body.sessionMode)
    : "online";
  const meetingDetails = typeof body.meetingDetails === "string"
    ? body.meetingDetails.trim().slice(0, 1_000)
    : "";
  const proposed = Array.from({ length: repeatWeeks }, (_, index) => {
    const start = startsAt + index * 7 * 24 * 60 * 60_000;
    return { start, end: start + durationMinutes * 60_000 };
  });
  for (const slot of proposed) {
    const conflict = await env.DB.prepare(
      `SELECT id FROM tutor_slots
       WHERE tutor_id=? AND status<>'cancelled'
         AND starts_at<? AND ends_at>? LIMIT 1`,
    ).bind(tutor.id, slot.end, slot.start).first();
    if (conflict) {
      return Response.json(
        { error: "One of these times overlaps an existing tutor slot." },
        { status: 409 },
      );
    }
  }
  const now = Date.now();
  const slots = proposed.map((slot) => ({
    id: crypto.randomUUID(),
    startsAt: slot.start,
    endsAt: slot.end,
  }));
  await env.DB.batch(slots.map((slot) =>
    env.DB.prepare(
      `INSERT INTO tutor_slots
        (id,tutor_id,school_id,created_by,starts_at,ends_at,timezone,
         session_mode,meeting_details,status,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,'open',?,?)`,
    ).bind(
      slot.id,
      tutor.id,
      context.school.id,
      context.user.id,
      slot.startsAt,
      slot.endsAt,
      timezone,
      sessionMode,
      meetingDetails,
      now,
      now,
    )
  ));
  await writeAuditLog({
    actorId: context.user.id,
    schoolId: context.school.id,
    action: "tutor_slots.create",
    targetType: "tutor",
    targetId: tutor.id,
    detail: { count: slots.length, startsAt, durationMinutes, repeatWeeks, sessionMode },
  });
  await emitIntegrationEvent(env.DB, context.school.id, "tutor.slots_created", {
    tutorId: tutor.id,
    slotIds: slots.map((slot) => slot.id),
  });
  return Response.json({ created: slots.length, slots }, { status: 201 });
}

export async function PATCH(request: Request) {
  const context = await creatorContext(request);
  if ("error" in context) return context.error;
  const body = await request.json() as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id.slice(0, 100) : "";
  const slot = await env.DB.prepare(
    `SELECT id,tutor_id AS tutorId,status,starts_at AS startsAt
     FROM tutor_slots WHERE id=? AND school_id=?`,
  ).bind(id, context.school.id).first<{
    id: string;
    tutorId: string;
    status: string;
    startsAt: number;
  }>();
  if (!slot) return Response.json({ error: "Tutor slot not found." }, { status: 404 });
  if (slot.status !== "open") {
    return Response.json(
      { error: "Resolve the connected enquiry before changing this reserved time." },
      { status: 409 },
    );
  }
  await env.DB.prepare(
    "UPDATE tutor_slots SET status='cancelled',updated_at=? WHERE id=?",
  ).bind(Date.now(), slot.id).run();
  await writeAuditLog({
    actorId: context.user.id,
    schoolId: context.school.id,
    action: "tutor_slot.cancel",
    targetType: "tutor_slot",
    targetId: slot.id,
    detail: { tutorId: slot.tutorId, startsAt: slot.startsAt },
  });
  return Response.json({ cancelled: true, id: slot.id });
}
