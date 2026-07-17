import { env } from "cloudflare:workers";

export const COMMUNITY_ID = "northstar-circle";

type ApiUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

type CommunityRow = {
  id: string;
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

function displayName(user: ApiUser) {
  const fullName = user.user_metadata?.full_name;
  const name = user.user_metadata?.name;
  return (
    (typeof fullName === "string" && fullName.trim()) ||
    (typeof name === "string" && name.trim()) ||
    user.email?.split("@")[0] ||
    "NorthStarLabs member"
  );
}

export async function ensureCommunityAccess(user: ApiUser) {
  if (user.email) {
    await env.DB.prepare(
      `INSERT INTO profiles (id,email,display_name,role,created_at)
       VALUES (?,?,?,'creator',?)
       ON CONFLICT(id) DO UPDATE SET email=excluded.email,display_name=excluded.display_name`,
    ).bind(user.id, user.email, displayName(user), Date.now()).run();
  }

  let community = await env.DB.prepare(
    `SELECT id,owner_id AS ownerId,name,description,access_type AS accessType,
      allow_posting AS allowPosting FROM communities WHERE id=?`,
  ).bind(COMMUNITY_ID).first<CommunityRow>();

  if (!community) {
    const earliestCreator = await env.DB.prepare(
      "SELECT owner_id AS ownerId FROM courses ORDER BY created_at ASC LIMIT 1",
    ).first<{ ownerId: string }>();
    const ownerId = earliestCreator?.ownerId || user.id;
    await env.DB.prepare(
      `INSERT INTO communities (id,owner_id,name,description,access_type,allow_posting,created_at)
       VALUES (?,?,?,?,?,?,?)
       ON CONFLICT(id) DO NOTHING`,
    ).bind(
      COMMUNITY_ID,
      ownerId,
      "Northstar Circle",
      "A member space for questions, progress, and peer support.",
      "open",
      1,
      Date.now(),
    ).run();
    community = await env.DB.prepare(
      `SELECT id,owner_id AS ownerId,name,description,access_type AS accessType,
        allow_posting AS allowPosting FROM communities WHERE id=?`,
    ).bind(COMMUNITY_ID).first<CommunityRow>();
  }

  if (!community) throw new Error("Community could not be initialized.");

  let member = await env.DB.prepare(
    `SELECT id,role,status FROM community_members WHERE community_id=? AND user_id=?`,
  ).bind(COMMUNITY_ID, user.id).first<MemberRow>();

  const isOwner = community.ownerId === user.id;
  const hasEnrollment = await env.DB.prepare(
    "SELECT id FROM enrollments WHERE user_id=? AND status='active' LIMIT 1",
  ).bind(user.id).first();
  const ownsCourse = await env.DB.prepare(
    "SELECT id FROM courses WHERE owner_id=? LIMIT 1",
  ).bind(user.id).first();
  const eligible = isOwner ||
    community.accessType === "open" ||
    (community.accessType === "enrolled" && Boolean(hasEnrollment || ownsCourse));

  if (!member && eligible) {
    await env.DB.prepare(
      `INSERT INTO community_members (id,community_id,user_id,role,status,joined_at)
       VALUES (?,?,?,?,?,?)
       ON CONFLICT(community_id,user_id) DO NOTHING`,
    ).bind(
      crypto.randomUUID(),
      COMMUNITY_ID,
      user.id,
      isOwner ? "owner" : "member",
      "active",
      Date.now(),
    ).run();
    member = await env.DB.prepare(
      "SELECT id,role,status FROM community_members WHERE community_id=? AND user_id=?",
    ).bind(COMMUNITY_ID, user.id).first<MemberRow>();
  }

  const active = member?.status === "active";
  const canModerate = active && (member?.role === "owner" || member?.role === "moderator");
  return {
    community,
    member: member || null,
    canAccess: Boolean(active && (eligible || member)),
    canModerate,
    isOwner: active && member?.role === "owner",
    eligible,
  };
}
