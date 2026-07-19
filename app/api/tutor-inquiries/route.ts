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
        ti.subject,ti.message,ti.preferred_times AS preferredTimes,
        ti.contact_preference AS contactPreference,ti.status,
        ti.created_at AS createdAt,ti.updated_at AS updatedAt,
        t.display_name AS tutorName,t.slug AS tutorSlug,
        s.name AS schoolName,s.slug AS schoolSlug
       FROM tutor_inquiries ti
       JOIN tutors t ON t.id=ti.tutor_id
       JOIN schools s ON s.id=ti.school_id
       WHERE ti.learner_id=? ORDER BY ti.created_at DESC`,
    ).bind(user.id).all();
    return Response.json({ inquiries: rows.results });
  }

  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator access required." }, { status: 403 });
  const rows = await env.DB.prepare(
    `SELECT ti.id,ti.tutor_id AS tutorId,ti.learner_id AS learnerId,
      ti.learner_name AS learnerName,ti.learner_email AS learnerEmail,
      ti.phone_number AS phoneNumber,ti.subject,ti.message,
      ti.preferred_times AS preferredTimes,
      ti.contact_preference AS contactPreference,ti.status,
      ti.creator_note AS creatorNote,ti.created_at AS createdAt,
      ti.updated_at AS updatedAt,t.display_name AS tutorName,
      t.slug AS tutorSlug
     FROM tutor_inquiries ti
     JOIN tutors t ON t.id=ti.tutor_id
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
  const preferredTimes = cleanText(body.preferredTimes, 500);
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
  const id = crypto.randomUUID();
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO tutor_inquiries
      (id,tutor_id,school_id,learner_id,learner_name,learner_email,
       phone_number,subject,message,preferred_times,contact_preference,
       status,creator_note,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).bind(
    id,
    tutor.id,
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
    detail: { tutorId: tutor.id, subject, contactPreference, emailStatus: emailDelivery.status },
  });
  await emitIntegrationEvent(env.DB, tutor.schoolId, "tutor.inquiry_created", {
    inquiryId: id,
    tutorId: tutor.id,
    learnerId: user.id,
    subject,
  });
  return Response.json({
    sent: true,
    id,
    tutorName: tutor.displayName,
    emailStatus: emailDelivery.status,
  }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator access required." }, { status: 403 });
  const body = await request.json() as Record<string, unknown>;
  const id = cleanText(body.id, 100);
  const inquiry = await env.DB.prepare(
    `SELECT ti.id,ti.status,t.display_name AS tutorName
     FROM tutor_inquiries ti JOIN tutors t ON t.id=ti.tutor_id
     WHERE ti.id=? AND ti.school_id=?`,
  ).bind(id, school.id).first<{ id: string; status: string; tutorName: string }>();
  if (!inquiry) return Response.json({ error: "Enquiry not found." }, { status: 404 });
  const status = inquiryStatuses.has(String(body.status))
    ? String(body.status)
    : inquiry.status;
  const creatorNote = cleanText(body.creatorNote, 1_000);
  await env.DB.prepare(
    "UPDATE tutor_inquiries SET status=?,creator_note=?,updated_at=? WHERE id=?",
  ).bind(status, creatorNote, Date.now(), inquiry.id).run();
  await writeAuditLog({
    actorId: user.id,
    schoolId: school.id,
    action: "tutor_inquiry.update",
    targetType: "tutor_inquiry",
    targetId: inquiry.id,
    detail: { status, tutorName: inquiry.tutorName },
  });
  await emitIntegrationEvent(env.DB, school.id, `tutor.inquiry_${status}`, {
    inquiryId: inquiry.id,
  });
  return Response.json({ saved: true, id: inquiry.id, status });
}
