import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../lib/audit-log";
import { queueEmail } from "../../../lib/email-service";
import { emitIntegrationEvent } from "../../../lib/integrations";
import {
  ensureProfile,
  requestedSchoolId,
  requireCreatorSchool,
} from "../../../lib/school-access";
import { requireApiUser } from "../../../lib/server-auth";

const inquiryStatuses = new Set(["new", "contacted", "booked", "closed", "declined"]);
const contactPreferences = new Set(["email", "phone", "whatsapp"]);

function cleanText(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function cleanPhone(value: unknown) {
  const phone = cleanText(value, 30);
  return !phone || /^[+()\d\s-]{7,30}$/.test(phone) ? phone : null;
}

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  if (url.searchParams.get("view") === "learner") {
    const rows = await env.DB.prepare(
      `SELECT ti.id,ti.tutor_id AS tutorId,ti.school_id AS schoolId,
        ti.slot_id AS slotId,ti.subject,ti.message,
        ti.preferred_times AS preferredTimes,
        ti.contact_preference AS contactPreference,ti.status,
        ti.created_at AS createdAt,ti.updated_at AS updatedAt,
        t.display_name AS tutorName,t.slug AS tutorSlug,
        s.name AS schoolName,s.slug AS schoolSlug,
        ts.starts_at AS startsAt,ts.ends_at AS endsAt,ts.timezone,
        ts.session_mode AS sessionMode,
        CASE WHEN ti.status='booked' THEN ts.meeting_details ELSE '' END AS meetingDetails
       FROM tutor_inquiries ti
       JOIN tutors t ON t.id=ti.tutor_id
       JOIN schools s ON s.id=ti.school_id
       LEFT JOIN tutor_slots ts ON ts.id=ti.slot_id
       WHERE ti.learner_id=? ORDER BY ti.created_at DESC`,
    ).bind(user.id).all();
    return Response.json({ inquiries: rows.results });
  }

  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator access required." }, { status: 403 });
  const rows = await env.DB.prepare(
    `SELECT ti.id,ti.tutor_id AS tutorId,ti.slot_id AS slotId,
      ti.learner_id AS learnerId,
      ti.learner_name AS learnerName,ti.learner_email AS learnerEmail,
      ti.phone_number AS phoneNumber,ti.subject,ti.message,
      ti.preferred_times AS preferredTimes,
      ti.contact_preference AS contactPreference,ti.status,
      ti.creator_note AS creatorNote,ti.created_at AS createdAt,
      ti.updated_at AS updatedAt,t.display_name AS tutorName,
      t.slug AS tutorSlug,ts.starts_at AS startsAt,ts.ends_at AS endsAt,
      ts.timezone,ts.session_mode AS sessionMode,
      ts.meeting_details AS meetingDetails,ts.status AS slotStatus
     FROM tutor_inquiries ti
     JOIN tutors t ON t.id=ti.tutor_id
     LEFT JOIN tutor_slots ts ON ts.id=ti.slot_id
     WHERE ti.school_id=? ORDER BY
       CASE ti.status WHEN 'new' THEN 0 WHEN 'contacted' THEN 1
         WHEN 'booked' THEN 2 ELSE 3 END,
       ti.created_at DESC`,
  ).bind(school.id).all();
  return Response.json({ school, inquiries: rows.results });
}

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Sign in to contact a tutor." }, { status: 401 });
  const profile = await ensureProfile(user);
  if (!profile) return Response.json({ error: "Profile unavailable." }, { status: 403 });
  const body = await request.json() as Record<string, unknown>;
  const tutorId = cleanText(body.tutorId, 100);
  const tutor = await env.DB.prepare(
    `SELECT t.id,t.school_id AS schoolId,t.display_name AS displayName,
      t.contact_email AS contactEmail,t.user_id AS userId,
      s.name AS schoolName,s.slug AS schoolSlug,s.support_email AS supportEmail,
      s.primary_color AS primaryColor
     FROM tutors t JOIN schools s ON s.id=t.school_id
     WHERE t.id=? AND t.status='published' AND s.status='active'`,
  ).bind(tutorId).first<{
    id: string;
    schoolId: string;
    displayName: string;
    contactEmail: string;
    userId: string | null;
    schoolName: string;
    schoolSlug: string;
    supportEmail: string;
    primaryColor: string;
  }>();
  if (!tutor) return Response.json({ error: "Tutor unavailable." }, { status: 404 });
  const subject = cleanText(body.subject, 160);
  const message = cleanText(body.message, 2_000);
  let preferredTimes = cleanText(body.preferredTimes, 500);
  const slotId = cleanText(body.slotId, 100) || null;
  const phoneNumber = cleanPhone(body.phoneNumber);
  const contactPreference = contactPreferences.has(String(body.contactPreference))
    ? String(body.contactPreference)
    : "email";
  if (subject.length < 2 || message.length < 10 || phoneNumber === null) {
    return Response.json(
      { error: "Add a subject, a short message and a valid phone number if supplied." },
      { status: 400 },
    );
  }
  if ((contactPreference === "phone" || contactPreference === "whatsapp") && !phoneNumber) {
    return Response.json(
      { error: "Add your phone number for phone or WhatsApp contact." },
      { status: 400 },
    );
  }
  const recent = await env.DB.prepare(
    `SELECT id FROM tutor_inquiries
     WHERE tutor_id=? AND learner_id=? AND status IN ('new','contacted')
       AND created_at>? LIMIT 1`,
  ).bind(tutor.id, user.id, Date.now() - 24 * 60 * 60_000).first();
  if (recent) {
    return Response.json(
      { error: "You already sent this tutor an enquiry recently." },
      { status: 409 },
    );
  }
  const slot = slotId
    ? await env.DB.prepare(
      `SELECT id,starts_at AS startsAt,ends_at AS endsAt,timezone,
        session_mode AS sessionMode
       FROM tutor_slots
       WHERE id=? AND tutor_id=? AND school_id=? AND status='open'
         AND starts_at>?`,
    ).bind(slotId, tutor.id, tutor.schoolId, Date.now()).first<{
      id: string;
      startsAt: number;
      endsAt: number;
      timezone: string;
      sessionMode: string;
    }>()
    : null;
  if (slotId && !slot) {
    return Response.json(
      { error: "That appointment time is no longer available. Choose another slot." },
      { status: 409 },
    );
  }
  if (slot) {
    preferredTimes = `${new Date(slot.startsAt).toISOString()} to ${new Date(slot.endsAt).toISOString()} (${slot.timezone})`;
    const reserved = await env.DB.prepare(
      `UPDATE tutor_slots SET status='reserved',updated_at=?
       WHERE id=? AND status='open' RETURNING id`,
    ).bind(Date.now(), slot.id).first();
    if (!reserved) {
      return Response.json(
        { error: "Someone else just requested that time. Choose another slot." },
        { status: 409 },
      );
    }
  }
  const id = crypto.randomUUID();
  const now = Date.now();
  try {
    await env.DB.prepare(
      `INSERT INTO tutor_inquiries
        (id,tutor_id,slot_id,school_id,learner_id,learner_name,learner_email,
         phone_number,subject,message,preferred_times,contact_preference,
         status,creator_note,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).bind(
      id,
      tutor.id,
      slot?.id || null,
      tutor.schoolId,
      user.id,
      profile.displayName,
      profile.email,
      phoneNumber,
      subject,
      message,
      preferredTimes,
      contactPreference,
      "new",
      "",
      now,
      now,
    ).run();
  } catch (error) {
    if (slot) {
      await env.DB.prepare(
        "UPDATE tutor_slots SET status='open',updated_at=? WHERE id=? AND status='reserved'",
      ).bind(Date.now(), slot.id).run();
    }
    throw error;
  }

  const recipientEmail = tutor.contactEmail || tutor.supportEmail;
  const emailDelivery = recipientEmail
    ? await queueEmail({
      schoolId: tutor.schoolId,
      recipientUserId: tutor.userId,
      recipientEmail,
      templateKey: "tutor_enquiry",
      variables: {
        academy: tutor.schoolName,
        tutor: tutor.displayName,
        learner: profile.displayName,
        subject,
        contactPreference,
        preferredTimes,
        chosenTime: slot ? new Date(slot.startsAt).toLocaleString("en-ZA") : "",
        primaryColor: tutor.primaryColor,
        actionUrl: `${new URL(request.url).origin}/dashboard/tutors?inquiry=${id}`,
      },
      idempotencyKey: `tutor-enquiry:${id}`,
    }).catch(() => ({ id: "", status: "pending" }))
    : { id: "", status: "dashboard_only" };
  await writeAuditLog({
    actorId: user.id,
    schoolId: tutor.schoolId,
    action: "tutor_inquiry.create",
    targetType: "tutor_inquiry",
    targetId: id,
    detail: {
      tutorId: tutor.id,
      slotId: slot?.id || null,
      subject,
      contactPreference,
      emailStatus: emailDelivery.status,
    },
  });
  await emitIntegrationEvent(env.DB, tutor.schoolId, "tutor.inquiry_created", {
    inquiryId: id,
    tutorId: tutor.id,
    learnerId: user.id,
    slotId: slot?.id || null,
    subject,
  });
  return Response.json({
    sent: true,
    id,
    tutorName: tutor.displayName,
    slotId: slot?.id || null,
    emailStatus: emailDelivery.status,
  }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const id = cleanText(body.id, 100);
  if (body.action === "learner_cancel") {
    const inquiry = await env.DB.prepare(
      `SELECT ti.id,ti.school_id AS schoolId,ti.status,
        ti.learner_name AS learnerName,ti.slot_id AS slotId,
        t.display_name AS tutorName,t.contact_email AS contactEmail,
        t.user_id AS tutorUserId,s.name AS schoolName,
        s.slug AS schoolSlug,s.support_email AS supportEmail,
        s.primary_color AS primaryColor,ts.starts_at AS startsAt,
        ts.status AS slotStatus
       FROM tutor_inquiries ti
       JOIN tutors t ON t.id=ti.tutor_id
       JOIN schools s ON s.id=ti.school_id
       LEFT JOIN tutor_slots ts ON ts.id=ti.slot_id
       WHERE ti.id=? AND ti.learner_id=?` ,
    ).bind(id, user.id).first<{
      id: string;
      schoolId: string;
      status: string;
      learnerName: string;
      slotId: string | null;
      tutorName: string;
      contactEmail: string;
      tutorUserId: string | null;
      schoolName: string;
      schoolSlug: string;
      supportEmail: string;
      primaryColor: string;
      startsAt: number | null;
      slotStatus: string | null;
    }>();
    if (!inquiry) return Response.json({ error: "Tutoring request not found." }, { status: 404 });
    if (["declined", "closed"].includes(inquiry.status)) {
      return Response.json({ error: "This request is already closed." }, { status: 409 });
    }
    if (inquiry.startsAt && inquiry.startsAt <= Date.now()) {
      return Response.json({ error: "Past appointments cannot be cancelled here." }, { status: 409 });
    }
    const now = Date.now();
    if (inquiry.slotId && ["reserved", "booked"].includes(inquiry.slotStatus || "")) {
      await env.DB.prepare(
        "UPDATE tutor_slots SET status='open',updated_at=? WHERE id=?",
      ).bind(now, inquiry.slotId).run();
    }
    await env.DB.prepare(
      "UPDATE tutor_inquiries SET status='closed',updated_at=? WHERE id=? AND learner_id=?",
    ).bind(now, inquiry.id, user.id).run();
    const recipientEmail = inquiry.contactEmail || inquiry.supportEmail;
    if (recipientEmail) {
      await queueEmail({
        schoolId: inquiry.schoolId,
        recipientUserId: inquiry.tutorUserId,
        recipientEmail,
        templateKey: "tutor_booking_cancelled",
        variables: {
          academy: inquiry.schoolName,
          tutor: inquiry.tutorName,
          learner: inquiry.learnerName,
          chosenTime: inquiry.startsAt
            ? new Date(inquiry.startsAt).toLocaleString("en-ZA")
            : "the requested appointment",
          primaryColor: inquiry.primaryColor,
          actionUrl: `${new URL(request.url).origin}/dashboard/tutors?inquiry=${inquiry.id}`,
        },
        idempotencyKey: `tutor-booking:${inquiry.id}:learner-cancelled`,
      }).catch(() => ({ id: "", status: "pending" }));
    }
    await writeAuditLog({
      actorId: user.id,
      schoolId: inquiry.schoolId,
      action: "tutor_inquiry.learner_cancel",
      targetType: "tutor_inquiry",
      targetId: inquiry.id,
      detail: { slotId: inquiry.slotId, tutorName: inquiry.tutorName },
    });
    await emitIntegrationEvent(env.DB, inquiry.schoolId, "tutor.inquiry_cancelled", {
      inquiryId: inquiry.id,
      slotId: inquiry.slotId,
      learnerId: user.id,
    });
    return Response.json({ cancelled: true, id: inquiry.id });
  }
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator access required." }, { status: 403 });
  const inquiry = await env.DB.prepare(
    `SELECT ti.id,ti.status,ti.slot_id AS slotId,
      ti.learner_id AS learnerId,ti.learner_name AS learnerName,
      ti.learner_email AS learnerEmail,
      t.display_name AS tutorName,t.id AS tutorId,
      s.name AS schoolName,s.primary_color AS primaryColor,
      ts.starts_at AS startsAt,ts.ends_at AS endsAt,ts.timezone,
      ts.meeting_details AS meetingDetails,ts.status AS slotStatus
     FROM tutor_inquiries ti
     JOIN tutors t ON t.id=ti.tutor_id
     JOIN schools s ON s.id=ti.school_id
     LEFT JOIN tutor_slots ts ON ts.id=ti.slot_id
     WHERE ti.id=? AND ti.school_id=?`,
  ).bind(id, school.id).first<{
    id: string;
    status: string;
    slotId: string | null;
    learnerId: string;
    learnerName: string;
    learnerEmail: string;
    tutorName: string;
    tutorId: string;
    schoolName: string;
    primaryColor: string;
    startsAt: number | null;
    endsAt: number | null;
    timezone: string | null;
    meetingDetails: string | null;
    slotStatus: string | null;
  }>();
  if (!inquiry) return Response.json({ error: "Enquiry not found." }, { status: 404 });
  const status = inquiryStatuses.has(String(body.status))
    ? String(body.status)
    : inquiry.status;
  const creatorNote = cleanText(body.creatorNote, 1_000);
  const now = Date.now();
  if (inquiry.slotId && status === "booked") {
    const booked = await env.DB.prepare(
      `UPDATE tutor_slots SET status='booked',updated_at=?
       WHERE id=? AND status IN ('reserved','booked') RETURNING id`,
    ).bind(now, inquiry.slotId).first();
    if (!booked) {
      return Response.json(
        { error: "This appointment time can no longer be confirmed." },
        { status: 409 },
      );
    }
  }
  if (inquiry.slotId && ["declined", "closed"].includes(status) && inquiry.slotStatus === "reserved") {
    await env.DB.prepare(
      "UPDATE tutor_slots SET status=?,updated_at=? WHERE id=?",
    ).bind(Number(inquiry.startsAt || 0) > now ? "open" : "cancelled", now, inquiry.slotId).run();
  }
  await env.DB.prepare(
    "UPDATE tutor_inquiries SET status=?,creator_note=?,updated_at=? WHERE id=?",
  ).bind(status, creatorNote, now, inquiry.id).run();
  if (inquiry.slotId && ["booked", "declined"].includes(status)) {
    await queueEmail({
      schoolId: school.id,
      recipientUserId: inquiry.learnerId,
      recipientEmail: inquiry.learnerEmail,
      templateKey: "tutor_booking_update",
      variables: {
        academy: inquiry.schoolName,
        tutor: inquiry.tutorName,
        status,
        chosenTime: inquiry.startsAt
          ? new Date(inquiry.startsAt).toLocaleString("en-ZA")
          : "the requested time",
        meetingDetails: status === "booked" ? inquiry.meetingDetails : "",
        primaryColor: inquiry.primaryColor,
        actionUrl: `${new URL(request.url).origin}/tutoring`,
      },
      idempotencyKey: `tutor-booking:${inquiry.id}:${status}`,
    }).catch(() => ({ id: "", status: "pending" }));
  }
  await writeAuditLog({
    actorId: user.id,
    schoolId: school.id,
    action: "tutor_inquiry.update",
    targetType: "tutor_inquiry",
    targetId: inquiry.id,
    detail: { status, tutorName: inquiry.tutorName, slotId: inquiry.slotId },
  });
  await emitIntegrationEvent(env.DB, school.id, `tutor.inquiry_${status}`, {
    inquiryId: inquiry.id,
  });
  return Response.json({ saved: true, id: inquiry.id, status });
}
