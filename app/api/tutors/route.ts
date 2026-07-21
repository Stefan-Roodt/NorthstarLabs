import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../lib/audit-log";
import { emitIntegrationEvent } from "../../../lib/integrations";
import { requestedSchoolId, requireCreatorSchool } from "../../../lib/school-access";
import { requireApiUser } from "../../../lib/server-auth";
import { coachListingPlan } from "../../../lib/coach-listing-plans";
import {
  availableTutorSlug,
  cleanStringList,
  serializeTutor,
  tutorColumns,
  type TutorRow,
} from "../../../lib/tutors";

const tutorStatuses = new Set(["draft", "published", "paused"]);
const sessionModes = new Set(["online", "in_person", "both"]);
const priceUnits = new Set(["hour", "session"]);
const serviceTypes = new Set(["coaching", "tutoring", "both"]);

function cleanText(value: unknown, fallback: string, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : fallback;
}

function cleanEmail(value: unknown, fallback = "") {
  if (value === undefined) return fallback;
  const email = typeof value === "string" ? value.trim().toLowerCase().slice(0, 160) : "";
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function cleanPhone(value: unknown, fallback = "") {
  if (value === undefined) return fallback;
  const phone = typeof value === "string" ? value.trim().slice(0, 30) : "";
  return !phone || /^[+()\d\s-]{7,30}$/.test(phone) ? phone : null;
}

function cleanUrl(value: unknown, fallback: string | null = null) {
  if (value === undefined) return fallback;
  if (!value) return null;
  if (typeof value !== "string" || value.length > 500) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function positiveNumber(value: unknown, fallback: number, maximum: number) {
  if (value === undefined) return fallback;
  const parsed = Math.round(Number(value || 0));
  return Number.isFinite(parsed) ? Math.max(0, Math.min(parsed, maximum)) : fallback;
}

async function publicTutors(schoolSlug: string, tutorSlug?: string | null) {
  const school = await env.DB.prepare(
    `SELECT id,slug,name,description,logo_url AS logoUrl,
      primary_color AS primaryColor,accent_color AS accentColor,
      support_email AS supportEmail
     FROM schools WHERE slug=? AND status='active'`,
  ).bind(schoolSlug).first<{
    id: string;
    slug: string;
    name: string;
    description: string;
    logoUrl: string | null;
    primaryColor: string;
    accentColor: string;
    supportEmail: string;
  }>();
  if (!school) return Response.json({ error: "Academy not found." }, { status: 404 });
  const query = `SELECT ${tutorColumns}
    FROM tutors t WHERE t.school_id=? AND t.status='published'
    ${tutorSlug ? "AND t.slug=?" : ""}
    ORDER BY CASE WHEN t.listing_tier='verified' AND t.verified=1
      THEN 0 ELSE 1 END,
      t.verified DESC,t.updated_at DESC`;
  const rows = await env.DB.prepare(query)
    .bind(...(tutorSlug ? [school.id, tutorSlug] : [school.id]))
    .all<TutorRow>();
  if (tutorSlug && !rows.results[0]) {
    return Response.json({ error: "Tutor not found." }, { status: 404 });
  }
  const slots = tutorSlug
    ? await env.DB.prepare(
      `SELECT id,tutor_id AS tutorId,starts_at AS startsAt,
        ends_at AS endsAt,timezone,session_mode AS sessionMode
       FROM tutor_slots
       WHERE tutor_id=? AND status='open' AND starts_at>?
       ORDER BY starts_at ASC LIMIT 30`,
    ).bind(rows.results[0].id, Date.now()).all()
    : { results: [] };
  return Response.json({
    school,
    tutors: rows.results.map((row) => serializeTutor(row)),
    slots: slots.results,
  });
}

async function publicTutorMarketplace() {
  const now = Date.now();
  const rows = await env.DB.prepare(
    `SELECT ${tutorColumns},
      s.name AS schoolName,s.slug AS schoolSlug,s.logo_url AS schoolLogoUrl,
      s.primary_color AS schoolPrimaryColor,
      COUNT(CASE WHEN ts.status='open' AND ts.starts_at>? THEN 1 END) AS availableSlotCount,
      MIN(CASE WHEN ts.status='open' AND ts.starts_at>? THEN ts.starts_at END) AS nextAvailableAt
     FROM tutors t
     JOIN schools s ON s.id=t.school_id
     LEFT JOIN tutor_slots ts ON ts.tutor_id=t.id
     WHERE t.status='published' AND s.status='active'
     GROUP BY t.id
     ORDER BY CASE WHEN t.listing_tier='verified' AND t.verified=1
       THEN 0 ELSE 1 END,
       t.verified DESC,
       CASE WHEN nextAvailableAt IS NULL THEN 1 ELSE 0 END,
       nextAvailableAt ASC,t.updated_at DESC
     LIMIT 250`,
  ).bind(now, now).all<TutorRow & {
    schoolName: string;
    schoolSlug: string;
    schoolLogoUrl: string | null;
    schoolPrimaryColor: string;
    availableSlotCount: number;
    nextAvailableAt: number | null;
  }>();
  return Response.json({
    tutors: rows.results.map((row) => ({
      ...serializeTutor(row),
      schoolName: row.schoolName,
      schoolSlug: row.schoolSlug,
      schoolLogoUrl: row.schoolLogoUrl,
      schoolPrimaryColor: row.schoolPrimaryColor,
      availableSlotCount: Number(row.availableSlotCount || 0),
      nextAvailableAt: row.nextAvailableAt ? Number(row.nextAvailableAt) : null,
    })),
  });
}

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
  const url = new URL(request.url);
  if (url.searchParams.get("marketplace") === "1") return publicTutorMarketplace();
  const schoolSlug = url.searchParams.get("schoolSlug");
  if (schoolSlug) return publicTutors(schoolSlug, url.searchParams.get("slug"));

  const context = await creatorContext(request);
  if ("error" in context) return context.error;
  const rows = await env.DB.prepare(
    `SELECT ${tutorColumns},
      COUNT(ti.id) AS inquiryCount,
      COUNT(CASE WHEN ti.status='new' THEN 1 END) AS newInquiryCount
     FROM tutors t
     LEFT JOIN tutor_inquiries ti ON ti.tutor_id=t.id
     WHERE t.school_id=? AND t.status<>'archived'
     GROUP BY t.id ORDER BY t.updated_at DESC`,
  ).bind(context.school.id).all<TutorRow>();
  return Response.json({
    school: context.school,
    tutors: rows.results.map((row) => serializeTutor(row, true)),
  });
}

export async function POST(request: Request) {
  const context = await creatorContext(request);
  if ("error" in context) return context.error;
  const body = await request.json() as Record<string, unknown>;
  const displayName = cleanText(body.displayName, "", 100);
  const headline = cleanText(body.headline, "", 160);
  const contactEmail = cleanEmail(body.contactEmail);
  const phoneNumber = cleanPhone(body.phoneNumber);
  const whatsappNumber = cleanPhone(body.whatsappNumber);
  if (displayName.length < 2 || !contactEmail || phoneNumber === null || whatsappNumber === null) {
    return Response.json(
      { error: "Add a tutor name and valid contact details." },
      { status: 400 },
    );
  }
  const bookingUrl = cleanUrl(body.bookingUrl);
  const showDirectContact = Boolean(body.showDirectContact);
  if (showDirectContact && !phoneNumber && !whatsappNumber && !bookingUrl) {
    return Response.json(
      { error: "Add a phone, WhatsApp or booking link before showing direct contact." },
      { status: 400 },
    );
  }
  const id = crypto.randomUUID();
  const now = Date.now();
  const sessionMode = sessionModes.has(String(body.sessionMode))
    ? String(body.sessionMode)
    : "online";
  const serviceType = serviceTypes.has(String(body.serviceType))
    ? String(body.serviceType)
    : "coaching";
  const priceUnit = priceUnits.has(String(body.priceUnit)) ? String(body.priceUnit) : "hour";
  const listingPlan = coachListingPlan("listed");
  const subjects = cleanStringList(body.subjects);
  const languages = cleanStringList(body.languages, 8);
  await env.DB.prepare(
    `INSERT INTO tutors
      (id,school_id,user_id,created_by,slug,display_name,headline,bio,
       service_type,subjects_json,languages_json,qualifications,experience_years,
       price_cents,price_unit,listing_tier,listing_monthly_cents,
       session_mode,location,timezone,availability,
       photo_url,contact_email,phone_number,whatsapp_number,booking_url,
       show_direct_contact,verified,status,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).bind(
    id,
    context.school.id,
    typeof body.userId === "string" ? body.userId.slice(0, 100) : null,
    context.user.id,
    await availableTutorSlug(env.DB, context.school.id, displayName),
    displayName,
    headline,
    cleanText(body.bio, "", 3_000),
    serviceType,
    JSON.stringify(subjects),
    JSON.stringify(languages),
    cleanText(body.qualifications, "", 1_200),
    positiveNumber(body.experienceYears, 0, 80),
    positiveNumber(body.priceCents, 0, 10_000_000),
    priceUnit,
    listingPlan.id,
    listingPlan.monthlyCents,
    sessionMode,
    cleanText(body.location, "", 160),
    cleanText(body.timezone, "Africa/Johannesburg", 80),
    cleanText(body.availability, "", 500),
    cleanUrl(body.photoUrl),
    contactEmail,
    phoneNumber,
    whatsappNumber,
    bookingUrl,
    showDirectContact ? 1 : 0,
    0,
    "draft",
    now,
    now,
  ).run();
  await writeAuditLog({
    actorId: context.user.id,
    schoolId: context.school.id,
    action: "tutor.create",
    targetType: "tutor",
    targetId: id,
    detail: { displayName, subjects, sessionMode, serviceType, listingTier: listingPlan.id },
  });
  const row = await env.DB.prepare(
    `SELECT ${tutorColumns},0 AS inquiryCount,0 AS newInquiryCount
     FROM tutors t WHERE t.id=?`,
  ).bind(id).first<TutorRow>();
  return Response.json(row ? serializeTutor(row, true) : { id }, { status: 201 });
}

export async function PATCH(request: Request) {
  const context = await creatorContext(request);
  if ("error" in context) return context.error;
  const body = await request.json() as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id : "";
  const current = await env.DB.prepare(
    `SELECT ${tutorColumns} FROM tutors t
     WHERE t.id=? AND t.school_id=? AND t.status<>'archived'`,
  ).bind(id, context.school.id).first<TutorRow>();
  if (!current) return Response.json({ error: "Tutor not found." }, { status: 404 });

  const displayName = cleanText(body.displayName, current.displayName, 100);
  const headline = cleanText(body.headline, current.headline, 160);
  const contactEmail = cleanEmail(body.contactEmail, current.contactEmail);
  const phoneNumber = cleanPhone(body.phoneNumber, current.phoneNumber);
  const whatsappNumber = cleanPhone(body.whatsappNumber, current.whatsappNumber);
  const bookingUrl = cleanUrl(body.bookingUrl, current.bookingUrl);
  const showDirectContact = body.showDirectContact === undefined
    ? Boolean(current.showDirectContact)
    : Boolean(body.showDirectContact);
  const status = tutorStatuses.has(String(body.status)) ? String(body.status) : current.status;
  const subjects = body.subjects === undefined
    ? cleanStringList(JSON.parse(current.subjectsJson))
    : cleanStringList(body.subjects);
  const languages = body.languages === undefined
    ? cleanStringList(JSON.parse(current.languagesJson), 8)
    : cleanStringList(body.languages, 8);
  const priceCents = positiveNumber(body.priceCents, current.priceCents, 10_000_000);
  if (
    displayName.length < 2 ||
    contactEmail === null ||
    phoneNumber === null ||
    whatsappNumber === null ||
    (showDirectContact && !phoneNumber && !whatsappNumber && !bookingUrl)
  ) {
    return Response.json({ error: "Check the tutor name and contact details." }, { status: 400 });
  }
  if (status === "published" && (!headline || !subjects.length || priceCents <= 0)) {
    return Response.json(
      { error: "Add a clear headline, at least one searchable topic, and an hourly rate before publishing." },
      { status: 409 },
    );
  }
  const sessionMode = sessionModes.has(String(body.sessionMode))
    ? String(body.sessionMode)
    : current.sessionMode;
  const serviceType = serviceTypes.has(String(body.serviceType))
    ? String(body.serviceType)
    : current.serviceType;
  const priceUnit = priceUnits.has(String(body.priceUnit))
    ? String(body.priceUnit)
    : current.priceUnit;
  // Paid visibility is activated only by a verified PayFast notification.
  // Editing a profile must never grant a paid marketplace tier.
  const listingPlan = coachListingPlan(current.listingTier === "verified" ? "verified" : "listed");
  const now = Date.now();
  await env.DB.prepare(
    `UPDATE tutors SET slug=?,display_name=?,headline=?,bio=?,service_type=?,subjects_json=?,
      languages_json=?,qualifications=?,experience_years=?,price_cents=?,
      price_unit=?,listing_tier=?,listing_monthly_cents=?,
      session_mode=?,location=?,timezone=?,availability=?,
      photo_url=?,contact_email=?,phone_number=?,whatsapp_number=?,booking_url=?,
      show_direct_contact=?,status=?,updated_at=? WHERE id=?`,
  ).bind(
    await availableTutorSlug(env.DB, context.school.id, displayName, id),
    displayName,
    headline,
    cleanText(body.bio, current.bio, 3_000),
    serviceType,
    JSON.stringify(subjects),
    JSON.stringify(languages),
    cleanText(body.qualifications, current.qualifications, 1_200),
    positiveNumber(body.experienceYears, current.experienceYears, 80),
    priceCents,
    priceUnit,
    listingPlan.id,
    listingPlan.monthlyCents,
    sessionMode,
    cleanText(body.location, current.location, 160),
    cleanText(body.timezone, current.timezone, 80),
    cleanText(body.availability, current.availability, 500),
    cleanUrl(body.photoUrl, current.photoUrl),
    contactEmail,
    phoneNumber,
    whatsappNumber,
    bookingUrl,
    showDirectContact ? 1 : 0,
    status,
    now,
    id,
  ).run();
  await writeAuditLog({
    actorId: context.user.id,
    schoolId: context.school.id,
    action: "tutor.update",
    targetType: "tutor",
    targetId: id,
    detail: { displayName, status, showDirectContact, serviceType, listingTier: listingPlan.id },
  });
  await emitIntegrationEvent(env.DB, context.school.id, `tutor.${status}`, {
    tutorId: id,
    displayName,
  });
  return Response.json({ saved: true, id, status });
}

export async function DELETE(request: Request) {
  const context = await creatorContext(request);
  if ("error" in context) return context.error;
  const id = new URL(request.url).searchParams.get("id") || "";
  const tutor = await env.DB.prepare(
    "SELECT id,display_name AS displayName FROM tutors WHERE id=? AND school_id=?",
  ).bind(id, context.school.id).first<{ id: string; displayName: string }>();
  if (!tutor) return Response.json({ error: "Tutor not found." }, { status: 404 });
  await env.DB.prepare(
    "UPDATE tutors SET status='archived',updated_at=? WHERE id=?",
  ).bind(Date.now(), tutor.id).run();
  await writeAuditLog({
    actorId: context.user.id,
    schoolId: context.school.id,
    action: "tutor.archive",
    targetType: "tutor",
    targetId: tutor.id,
    detail: { displayName: tutor.displayName },
  });
  return Response.json({ archived: true });
}
