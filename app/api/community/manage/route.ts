import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../lib/server-auth";
import { COMMUNITY_ID, ensureCommunityAccess } from "../../../../lib/community-access";

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const access = await ensureCommunityAccess(user);
  if (!access.canModerate) return Response.json({ error: "Moderator access required" }, { status: 403 });
  const members = await env.DB.prepare(
    `SELECT cm.id,cm.user_id AS userId,cm.role,cm.status,cm.joined_at AS joinedAt,
      COALESCE(p.display_name,'NorthStarLabs member') AS displayName,p.email
     FROM community_members cm LEFT JOIN profiles p ON p.id=cm.user_id
     WHERE cm.community_id=?
     ORDER BY CASE cm.role WHEN 'owner' THEN 0 WHEN 'moderator' THEN 1 ELSE 2 END,
      cm.joined_at DESC`,
  ).bind(COMMUNITY_ID).all();
  return Response.json({
    community: access.community,
    currentMember: access.member,
    isOwner: access.isOwner,
    members: members.results,
  });
}

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const access = await ensureCommunityAccess(user);
  if (!access.canModerate) return Response.json({ error: "Moderator access required" }, { status: 403 });
  const { email } = await request.json() as { email?: string };
  if (!email?.trim()) return Response.json({ error: "Email required" }, { status: 400 });
  const profile = await env.DB.prepare(
    "SELECT id,email,display_name AS displayName FROM profiles WHERE lower(email)=lower(?)",
  ).bind(email.trim()).first<{ id: string; email: string; displayName: string }>();
  if (!profile) {
    return Response.json({ error: "That person must create a NorthStarLabs account before being added." }, { status: 404 });
  }
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO community_members (id,community_id,user_id,role,status,joined_at)
     VALUES (?,?,?,?,?,?)
     ON CONFLICT(community_id,user_id) DO UPDATE SET status='active'`,
  ).bind(id, COMMUNITY_ID, profile.id, "member", "active", Date.now()).run();
  const member = await env.DB.prepare(
    `SELECT cm.id,cm.user_id AS userId,cm.role,cm.status,cm.joined_at AS joinedAt,
      p.display_name AS displayName,p.email
     FROM community_members cm JOIN profiles p ON p.id=cm.user_id
     WHERE cm.community_id=? AND cm.user_id=?`,
  ).bind(COMMUNITY_ID, profile.id).first();
  return Response.json(member, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const access = await ensureCommunityAccess(user);
  if (!access.canModerate) return Response.json({ error: "Moderator access required" }, { status: 403 });
  const body = await request.json() as {
    type?: string;
    accessType?: string;
    allowPosting?: boolean;
    memberId?: string;
    role?: string;
    status?: string;
  };

  if (body.type === "settings") {
    if (!access.isOwner) return Response.json({ error: "Owner access required" }, { status: 403 });
    const accessType = ["open", "enrolled", "invite"].includes(body.accessType || "")
      ? body.accessType
      : access.community.accessType;
    await env.DB.prepare(
      "UPDATE communities SET access_type=?,allow_posting=? WHERE id=?",
    ).bind(accessType, body.allowPosting === false ? 0 : 1, COMMUNITY_ID).run();
    return Response.json({ saved: true, accessType, allowPosting: body.allowPosting !== false });
  }

  if (body.type === "member" && body.memberId) {
    const target = await env.DB.prepare(
      "SELECT id,user_id AS userId,role FROM community_members WHERE id=? AND community_id=?",
    ).bind(body.memberId, COMMUNITY_ID).first<{ id: string; userId: string; role: string }>();
    if (!target) return Response.json({ error: "Member not found" }, { status: 404 });
    if (target.role === "owner") return Response.json({ error: "The community owner cannot be changed here." }, { status: 400 });
    if (!access.isOwner && (body.role || target.role) !== "member") {
      return Response.json({ error: "Only the owner can manage moderators." }, { status: 403 });
    }
    const role = ["member", "moderator"].includes(body.role || "") ? body.role : target.role;
    const status = ["active", "blocked"].includes(body.status || "") ? body.status : "active";
    await env.DB.prepare(
      "UPDATE community_members SET role=?,status=? WHERE id=?",
    ).bind(role, status, body.memberId).run();
    return Response.json({ saved: true, role, status });
  }

  return Response.json({ error: "Invalid management action" }, { status: 400 });
}
