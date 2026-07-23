export type TutorRow = {
  id: string;
  schoolId: string;
  userId: string | null;
  createdBy: string;
  slug: string;
  displayName: string;
  headline: string;
  bio: string;
  serviceType: string;
  subjectsJson: string;
  languagesJson: string;
  qualifications: string;
  experienceYears: number;
  priceCents: number;
  priceUnit: string;
  listingTier: string;
  listingMonthlyCents: number;
  sessionMode: string;
  location: string;
  timezone: string;
  availability: string;
  photoUrl: string | null;
  contactEmail: string;
  phoneNumber: string;
  whatsappNumber: string;
  bookingUrl: string | null;
  showDirectContact: number;
  verified: number;
  status: string;
  createdAt: number;
  updatedAt: number;
  inquiryCount?: number;
  newInquiryCount?: number;
  verifiedCredentialCount?: number;
  reviewCount?: number;
  averageRating?: number | null;
};

const visibleTutorReviewSql =
  "(tr.status='published' OR (tr.status='pending' AND tr.visible_after<=CAST(strftime('%s','now') AS INTEGER)*1000))";

export const tutorColumns = `t.id,t.school_id AS schoolId,t.user_id AS userId,
  t.created_by AS createdBy,t.slug,t.display_name AS displayName,
  t.headline,t.bio,t.service_type AS serviceType,t.subjects_json AS subjectsJson,
  t.languages_json AS languagesJson,t.qualifications,
  t.experience_years AS experienceYears,t.price_cents AS priceCents,
  t.price_unit AS priceUnit,t.listing_tier AS listingTier,
  t.listing_monthly_cents AS listingMonthlyCents,
  t.session_mode AS sessionMode,t.location,
  t.timezone,t.availability,t.photo_url AS photoUrl,
  t.contact_email AS contactEmail,t.phone_number AS phoneNumber,
  t.whatsapp_number AS whatsappNumber,t.booking_url AS bookingUrl,
  t.show_direct_contact AS showDirectContact,t.verified,t.status,
  t.created_at AS createdAt,t.updated_at AS updatedAt,
  (SELECT COUNT(*) FROM tutor_credentials tc
    WHERE tc.tutor_id=t.id AND tc.status='verified') AS verifiedCredentialCount,
  (SELECT COUNT(*) FROM tutor_reviews tr
    WHERE tr.tutor_id=t.id AND ${visibleTutorReviewSql}) AS reviewCount,
  (SELECT ROUND(AVG(tr.rating),1) FROM tutor_reviews tr
    WHERE tr.tutor_id=t.id AND ${visibleTutorReviewSql}) AS averageRating`;

function parseList(value: string) {
  try {
    const list = JSON.parse(value);
    return Array.isArray(list)
      ? list.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function serializeTutor(row: TutorRow, includePrivate = false) {
  const direct = Boolean(row.showDirectContact);
  const completeness = tutorProfileCompleteness(row);
  return {
    id: row.id,
    schoolId: row.schoolId,
    userId: includePrivate ? row.userId : undefined,
    slug: row.slug,
    displayName: row.displayName,
    headline: row.headline,
    bio: row.bio,
    serviceType: row.serviceType,
    subjects: parseList(row.subjectsJson),
    languages: parseList(row.languagesJson),
    qualifications: row.qualifications,
    experienceYears: Number(row.experienceYears || 0),
    priceCents: Number(row.priceCents || 0),
    priceUnit: row.priceUnit,
    listingTier: row.listingTier || "listed",
    listingMonthlyCents: Number(row.listingMonthlyCents ?? 0),
    sessionMode: row.sessionMode,
    location: row.location,
    timezone: row.timezone,
    availability: row.availability,
    photoUrl: row.photoUrl,
    contactEmail: includePrivate ? row.contactEmail : undefined,
    phoneNumber: includePrivate || direct ? row.phoneNumber : "",
    whatsappNumber: includePrivate || direct ? row.whatsappNumber : "",
    bookingUrl: includePrivate || direct ? row.bookingUrl : null,
    showDirectContact: direct,
    verified: Boolean(row.verified),
    verifiedCredentialCount: Number(row.verifiedCredentialCount || 0),
    reviewCount: Number(row.reviewCount || 0),
    averageRating: row.averageRating === null || row.averageRating === undefined
      ? null
      : Number(row.averageRating),
    profileCompleteness: completeness.score,
    ...(includePrivate ? { profileMissing: completeness.missing } : {}),
    status: row.status,
    inquiryCount: Number(row.inquiryCount || 0),
    newInquiryCount: Number(row.newInquiryCount || 0),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function tutorProfileCompleteness(row: TutorRow) {
  const subjects = parseList(row.subjectsJson);
  const languages = parseList(row.languagesJson);
  const checks = [
    [Boolean(row.photoUrl), "Add a professional photograph"],
    [row.headline.trim().length >= 25, "Write a specific professional headline"],
    [row.bio.trim().length >= 160, "Expand your biography to explain your approach"],
    [subjects.length >= 3, "Add at least three searchable topics"],
    [languages.length >= 1, "Add the languages you coach in"],
    [row.qualifications.trim().length >= 40, "Describe relevant qualifications and experience"],
    [Number(row.experienceYears) > 0, "Add your years of experience"],
    [Number(row.priceCents) > 0, "Set your hourly rate"],
    [row.availability.trim().length >= 10, "Describe your usual availability"],
    [
      Boolean(row.contactEmail) &&
        Boolean(row.phoneNumber || row.whatsappNumber || row.bookingUrl),
      "Add a private email and one direct contact method",
    ],
  ] as const;
  const completed = checks.filter(([done]) => done).length;
  return {
    score: Math.round((completed / checks.length) * 100),
    missing: checks.filter(([done]) => !done).map(([, label]) => label),
  };
}

export function tutorSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 54) || "tutor";
}

export async function availableTutorSlug(
  database: D1Database,
  schoolId: string,
  displayName: string,
  excludedId?: string,
) {
  const base = tutorSlug(displayName);
  let candidate = base;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const existing = await database.prepare(
      `SELECT id FROM tutors WHERE school_id=? AND slug=?
       ${excludedId ? "AND id<>?" : ""}`,
    ).bind(...(excludedId
      ? [schoolId, candidate, excludedId]
      : [schoolId, candidate])).first();
    if (!existing) return candidate;
    candidate = `${base.slice(0, 47)}-${crypto.randomUUID().slice(0, 6)}`;
  }
  return `${base.slice(0, 38)}-${crypto.randomUUID().slice(0, 15)}`;
}

export async function ensureCoachDraft(
  database: D1Database,
  input: {
    schoolId: string;
    userId: string;
    displayName: string;
    contactEmail: string;
  },
) {
  const existing = await database.prepare(
    `SELECT id FROM tutors
     WHERE school_id=? AND status<>'archived'
       AND (user_id=? OR created_by=?)
     ORDER BY updated_at DESC LIMIT 1`,
  ).bind(input.schoolId, input.userId, input.userId).first<{ id: string }>();
  if (existing) return { id: existing.id, created: false };

  const displayName = input.displayName.trim().slice(0, 100) ||
    input.contactEmail.split("@")[0] ||
    "NorthstarLabs coach";
  const contactEmail = input.contactEmail.trim().toLowerCase().slice(0, 160);
  const id = crypto.randomUUID();
  const now = Date.now();
  const slug = await availableTutorSlug(database, input.schoolId, displayName);
  await database.prepare(
    `INSERT INTO tutors
      (id,school_id,user_id,created_by,slug,display_name,headline,bio,
       service_type,subjects_json,languages_json,qualifications,experience_years,
       price_cents,price_unit,listing_tier,listing_monthly_cents,
       session_mode,location,timezone,availability,
       photo_url,contact_email,phone_number,whatsapp_number,booking_url,
       show_direct_contact,verified,status,created_at,updated_at)
     SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
     WHERE NOT EXISTS (
       SELECT 1 FROM tutors
       WHERE school_id=? AND status<>'archived'
         AND (user_id=? OR created_by=?)
     )`,
  ).bind(
    id,
    input.schoolId,
    input.userId,
    input.userId,
    slug,
    displayName,
    "",
    "",
    "coaching",
    "[]",
    "[]",
    "",
    0,
    0,
    "hour",
    "listed",
    0,
    "online",
    "",
    "Africa/Johannesburg",
    "",
    null,
    contactEmail,
    "",
    "",
    null,
    0,
    0,
    "draft",
    now,
    now,
    input.schoolId,
    input.userId,
    input.userId,
  ).run();
  const draft = await database.prepare(
    `SELECT id FROM tutors
     WHERE school_id=? AND status<>'archived'
       AND (user_id=? OR created_by=?)
     ORDER BY updated_at DESC LIMIT 1`,
  ).bind(input.schoolId, input.userId, input.userId).first<{ id: string }>();
  if (!draft) throw new Error("Coach profile draft could not be initialized.");
  return { id: draft.id, created: draft.id === id };
}

export function cleanStringList(value: unknown, maximum = 12) {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  return [...new Set(raw
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.slice(0, 80)))]
    .slice(0, maximum);
}
