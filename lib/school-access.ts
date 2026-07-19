import { env } from "cloudflare:workers";

export const CREATOR_ROLES = ["owner", "admin", "instructor"] as const;

type ApiUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

export type SchoolContext = {
  id: string;
  slug: string;
  name: string;
  description: string;
  logoUrl: string | null;
  primaryColor: string;
  ownerId: string;
  memberRole: string;
  memberStatus: string;
};

type ProfileRow = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  activeSchoolId: string | null;
  createdAt: number;
};

function userDisplayName(user: ApiUser) {
  const fullName = user.user_metadata?.full_name;
  const name = user.user_metadata?.name;
  return (
    (typeof fullName === "string" && fullName.trim()) ||
    (typeof name === "string" && name.trim()) ||
    user.email?.split("@")[0] ||
    "NorthStarLabs member"
  );
}

function schoolSlug(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "academy";
}

export function requestedSchoolId(request: Request) {
  return request.headers.get("x-school-id") ||
    new URL(request.url).searchParams.get("schoolId") ||
    undefined;
}

export async function ensureProfile(user: ApiUser) {
  if (!user.email) throw new Error("An email address is required.");
  await env.DB.prepare(
    `INSERT INTO profiles (id,email,display_name,role,created_at)
     VALUES (?,?,?,'learner',?)
     ON CONFLICT(id) DO UPDATE SET
       email=excluded.email,
       display_name=CASE
         WHEN profiles.display_name='' THEN excluded.display_name
         ELSE profiles.display_name
       END`,
  ).bind(user.id, user.email, userDisplayName(user), Date.now()).run();
  return env.DB.prepare(
    `SELECT id,email,display_name AS displayName,role,
      active_school_id AS activeSchoolId,created_at AS createdAt
     FROM profiles WHERE id=?`,
  ).bind(user.id).first<ProfileRow>();
}

async function availableSlug(name: string) {
  const base = schoolSlug(name);
  let candidate = base;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const existing = await env.DB.prepare(
      "SELECT id FROM schools WHERE slug=?",
    ).bind(candidate).first();
    if (!existing) return candidate;
    candidate = `${base.slice(0, 44)}-${crypto.randomUUID().slice(0, 5)}`;
  }
  return `${base.slice(0, 36)}-${crypto.randomUUID().slice(0, 13)}`;
}

async function membershipBySchool(userId: string, schoolId: string) {
  return env.DB.prepare(
    `SELECT s.id,s.slug,s.name,s.description,s.logo_url AS logoUrl,
      s.primary_color AS primaryColor,s.owner_id AS ownerId,
      sm.role AS memberRole,sm.status AS memberStatus
     FROM schools s
     JOIN school_members sm ON sm.school_id=s.id
     WHERE s.id=? AND sm.user_id=? AND s.status='active'`,
  ).bind(schoolId, userId).first<SchoolContext>();
}

export async function getActiveSchool(
  userId: string,
  allowedRoles?: readonly string[],
  preferredSchoolId?: string,
) {
  let school: SchoolContext | null = null;
  if (preferredSchoolId) {
    school = await membershipBySchool(userId, preferredSchoolId);
  } else {
    school = await env.DB.prepare(
      `SELECT s.id,s.slug,s.name,s.description,s.logo_url AS logoUrl,
        s.primary_color AS primaryColor,s.owner_id AS ownerId,
        sm.role AS memberRole,sm.status AS memberStatus
       FROM profiles p
       JOIN school_members sm ON sm.school_id=p.active_school_id AND sm.user_id=p.id
       JOIN schools s ON s.id=sm.school_id
       WHERE p.id=? AND s.status='active'`,
    ).bind(userId).first<SchoolContext>();
  }

  if (
    school?.memberStatus === "active" &&
    (!allowedRoles || allowedRoles.includes(school.memberRole))
  ) {
    return school;
  }

  const rows = await env.DB.prepare(
    `SELECT s.id,s.slug,s.name,s.description,s.logo_url AS logoUrl,
      s.primary_color AS primaryColor,s.owner_id AS ownerId,
      sm.role AS memberRole,sm.status AS memberStatus
     FROM school_members sm
     JOIN schools s ON s.id=sm.school_id
     WHERE sm.user_id=? AND sm.status='active' AND s.status='active'
     ORDER BY
       CASE sm.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1
         WHEN 'instructor' THEN 2 ELSE 3 END,
       sm.joined_at ASC`,
  ).bind(userId).all<SchoolContext>();
  school = rows.results.find((candidate) =>
    !allowedRoles || allowedRoles.includes(candidate.memberRole)
  ) || null;
  if (school) {
    await env.DB.prepare(
      "UPDATE profiles SET active_school_id=? WHERE id=?",
    ).bind(school.id, userId).run();
  }
  return school;
}

export async function getUserSchools(userId: string) {
  const rows = await env.DB.prepare(
    `SELECT s.id,s.slug,s.name,s.description,s.logo_url AS logoUrl,
      s.primary_color AS primaryColor,s.owner_id AS ownerId,
      sm.role AS memberRole,sm.status AS memberStatus
     FROM school_members sm
     JOIN schools s ON s.id=sm.school_id
     WHERE sm.user_id=? AND sm.status='active' AND s.status='active'
     ORDER BY s.name`,
  ).bind(userId).all<SchoolContext>();
  return rows.results;
}

export async function createCreatorSchool(user: ApiUser, rawName?: string) {
  const profile = await ensureProfile(user);
  if (!profile) throw new Error("Profile could not be initialized.");
  const current = await getActiveSchool(user.id, CREATOR_ROLES);
  if (current) {
    await env.DB.prepare(
      "UPDATE profiles SET role='creator',active_school_id=? WHERE id=?",
    ).bind(current.id, user.id).run();
    return current;
  }

  const name = (rawName?.trim() || `${profile.displayName}'s Academy`).slice(0, 80);
  if (name.length < 2) throw new Error("School name must be at least 2 characters.");
  const slug = await availableSlug(name);
  const schoolId = crypto.randomUUID();
  const communityId = crypto.randomUUID();
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO schools
       (id,slug,name,description,logo_url,primary_color,owner_id,status,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
    ).bind(schoolId, slug, name, "", null, "#3556d8", user.id, "active", now, now),
    env.DB.prepare(
      `INSERT INTO school_members (id,school_id,user_id,role,status,joined_at)
       VALUES (?,?,?,?,?,?)`,
    ).bind(crypto.randomUUID(), schoolId, user.id, "owner", "active", now),
    env.DB.prepare(
      `INSERT INTO communities
       (id,school_id,owner_id,name,description,access_type,allow_posting,created_at)
       VALUES (?,?,?,?,?,?,?,?)`,
    ).bind(
      communityId,
      schoolId,
      user.id,
      `${name} Community`,
      "A private space for learners to ask questions, share progress, and support one another.",
      "enrolled",
      1,
      now,
    ),
    env.DB.prepare(
      `INSERT INTO community_members (id,community_id,user_id,role,status,joined_at)
       VALUES (?,?,?,?,?,?)`,
    ).bind(crypto.randomUUID(), communityId, user.id, "owner", "active", now),
    env.DB.prepare(
      "UPDATE profiles SET role='creator',active_school_id=? WHERE id=?",
    ).bind(schoolId, user.id),
  ]);
  const created = await membershipBySchool(user.id, schoolId);
  if (!created) throw new Error("School could not be initialized.");
  return created;
}

export async function requireCreatorSchool(user: ApiUser, preferredSchoolId?: string) {
  const profile = await ensureProfile(user);
  if (!profile) return null;
  const school = await getActiveSchool(user.id, CREATOR_ROLES, preferredSchoolId);
  if (school) return school;

  const ownsLegacyCourse = await env.DB.prepare(
    "SELECT id FROM courses WHERE owner_id=? LIMIT 1",
  ).bind(user.id).first();
  if (profile.role === "creator" || ownsLegacyCourse) {
    return createCreatorSchool(user);
  }
  return null;
}

export async function switchActiveSchool(userId: string, schoolId: string) {
  const school = await membershipBySchool(userId, schoolId);
  if (!school || school.memberStatus !== "active") return null;
  const mode = CREATOR_ROLES.includes(school.memberRole as (typeof CREATOR_ROLES)[number])
    ? "creator"
    : "learner";
  await env.DB.prepare(
    "UPDATE profiles SET active_school_id=?,role=? WHERE id=?",
  ).bind(school.id, mode, userId).run();
  return school;
}

export async function requireCourseStaffAccess(userId: string, courseId: string) {
  return env.DB.prepare(
    `SELECT c.id AS courseId,c.school_id AS schoolId,c.owner_id AS ownerId,
      sm.role AS memberRole
     FROM courses c
     JOIN school_members sm ON sm.school_id=c.school_id
     WHERE c.id=? AND sm.user_id=? AND sm.status='active'
       AND sm.role IN ('owner','admin','instructor')`,
  ).bind(courseId, userId).first<{
    courseId: string;
    schoolId: string;
    ownerId: string;
    memberRole: string;
  }>();
}

export async function ensureLearnerSchoolMembership(
  userId: string,
  schoolId: string,
  makeActive = true,
) {
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO school_members (id,school_id,user_id,role,status,joined_at)
     VALUES (?,?,?,?,?,?)
     ON CONFLICT(school_id,user_id) DO UPDATE SET
       status='active',
       role=CASE
         WHEN school_members.role IN ('owner','admin','instructor')
           THEN school_members.role
         ELSE 'learner'
       END`,
  ).bind(crypto.randomUUID(), schoolId, userId, "learner", "active", now).run();
  if (makeActive) {
    await env.DB.prepare(
      `UPDATE profiles SET
        active_school_id=CASE
          WHEN role='learner' OR active_school_id IS NULL THEN ?
          ELSE active_school_id
        END
       WHERE id=?`,
    ).bind(schoolId, userId).run();
  }
}
