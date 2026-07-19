export type TutorRow = {
  id: string;
  schoolId: string;
  userId: string | null;
  createdBy: string;
  slug: string;
  displayName: string;
  headline: string;
  bio: string;
  subjectsJson: string;
  languagesJson: string;
  qualifications: string;
  experienceYears: number;
  priceCents: number;
  priceUnit: string;
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
};

export const tutorColumns = `t.id,t.school_id AS schoolId,t.user_id AS userId,
  t.created_by AS createdBy,t.slug,t.display_name AS displayName,
  t.headline,t.bio,t.subjects_json AS subjectsJson,
  t.languages_json AS languagesJson,t.qualifications,
  t.experience_years AS experienceYears,t.price_cents AS priceCents,
  t.price_unit AS priceUnit,t.session_mode AS sessionMode,t.location,
  t.timezone,t.availability,t.photo_url AS photoUrl,
  t.contact_email AS contactEmail,t.phone_number AS phoneNumber,
  t.whatsapp_number AS whatsappNumber,t.booking_url AS bookingUrl,
  t.show_direct_contact AS showDirectContact,t.verified,t.status,
  t.created_at AS createdAt,t.updated_at AS updatedAt`;

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
  return {
    id: row.id,
    schoolId: row.schoolId,
    userId: includePrivate ? row.userId : undefined,
    slug: row.slug,
    displayName: row.displayName,
    headline: row.headline,
    bio: row.bio,
    subjects: parseList(row.subjectsJson),
    languages: parseList(row.languagesJson),
    qualifications: row.qualifications,
    experienceYears: Number(row.experienceYears || 0),
    priceCents: Number(row.priceCents || 0),
    priceUnit: row.priceUnit,
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
    status: row.status,
    inquiryCount: Number(row.inquiryCount || 0),
    newInquiryCount: Number(row.newInquiryCount || 0),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
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
