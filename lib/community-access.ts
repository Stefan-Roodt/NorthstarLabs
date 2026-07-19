import { env } from "cloudflare:workers";
import {
  CREATOR_ROLES,
  ensureProfile,
  getActiveSchool,
  type SchoolContext,
} from "./school-access";

type ApiUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

type CommunityRow = {
  id: string;
  schoolId: string;
  ownerId: string;
  name: string;
  description: string;
  accessType: string;
  allowPosting: number;
};

type MemberRow = {
  id: string;
  role: string;
  status: string;
};

async function ensureSchoolCommunity(school: SchoolContext) {
  let community = await env.DB.prepare(
    `SELECT id,school_id AS schoolId,owner_id AS ownerId,name,description,
      access_type AS accessType,allow_posting AS allowPosting
     FROM communities WHERE school_id=?`,
  ).bind(school.id).first<CommunityRow>();
  if (community) return community;

  await env.DB.prepare(
    `INSERT INTO communities
     (id,school_id,owner_id,name,description,access_type,allow_posting,created_at)
     VALUES (?,?,?,?,?,?,?,?)
     ON CONFLICT(school_id) DO NOTHING`,
  ).bind(
    crypto.randomUUID(),
    school.id,
    school.ownerId,
    `${school.name} Community`,
    "A private space for learners to ask questions, share progress, and support one another.",
    "enrolled",
    1,
    Date.now(),
  ).run();
  community = await env.DB.prepare(
    `SELECT id,school_id AS schoolId,owner_id AS ownerId,name,description,
      access_type AS accessType,allow_posting AS allowPosting
     FROM communities WHERE school_id=?`,
  ).bind(school.id).first<CommunityRow>();
  if (!community) throw new Error("Community could not be initialized.");
  return community;
}

export async function ensureCommunityAccess(user: ApiUser, preferredSchoolId?: string) {
  await ensureProfile(user);
  const school = await getActiveSchool(user.id, undefined, preferredSchoolId);
  if (!school) {
    return {
      school: null,
      community: null,
      member: null,
      canAccess: false,
      canModerate: false,
      isOwner: false,
      eligible: false,
    };
  }

  const community = await ensureSchoolCommunity(school);
  let member = await env.DB.prepare(
    "SELECT id,role,status FROM community_members WHERE community_id=? AND user_id=?",
  ).bind(community.id, user.id).first<MemberRow>();

  const isSchoolOwner = school.ownerId === user.id;
  const isSchoolStaff = CREATOR_ROLES.includes(
    school.memberRole as (typeof CREATOR_ROLES)[number],
  );
  const hasEnrollment = await env.DB.prepare(
    `SELECT e.id FROM enrollments e
     JOIN courses c ON c.id=e.course_id
     WHERE e.user_id=? AND e.status='active' AND c.school_id=?
     LIMIT 1`,
  ).bind(user.id, school.id).first();
  const eligible = isSchoolStaff ||
    community.accessType === "open" ||
    (community.accessType === "enrolled" && Boolean(hasEnrollment)) ||
    (community.accessType === "invite" && Boolean(member));

  if (!member && eligible) {
    const communityRole = isSchoolOwner
      ? "owner"
      : isSchoolStaff
        ? "moderator"
        : "member";
    await env.DB.prepare(
      `INSERT INTO community_members (id,community_id,user_id,role,status,joined_at)
       VALUES (?,?,?,?,?,?)
       ON CONFLICT(community_id,user_id) DO NOTHING`,
    ).bind(
      crypto.randomUUID(),
      community.id,
      user.id,
      communityRole,
      "active",
      Date.now(),
    ).run();
    member = await env.DB.prepare(
      "SELECT id,role,status FROM community_members WHERE community_id=? AND user_id=?",
    ).bind(community.id, user.id).first<MemberRow>();
  }

  const active = member?.status === "active";
  const canModerate = Boolean(
    active && (member?.role === "owner" || member?.role === "moderator"),
  );
  return {
    school,
    community,
    member: member || null,
    canAccess: Boolean(active && eligible),
    canModerate,
    isOwner: Boolean(active && member?.role === "owner"),
    eligible,
  };
}
