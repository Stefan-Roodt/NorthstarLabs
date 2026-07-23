import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../lib/server-auth";
import { ensureCommunityAccess } from "../../../lib/community-access";
import { requestedSchoolId } from "../../../lib/school-access";

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const access = await ensureCommunityAccess(user, requestedSchoolId(request));
  if (!access.community || !access.canAccess) {
    return Response.json({
      error: !access.community
        ? "Join or create a school before opening its community."
        : access.member?.status === "blocked"
        ? "Your community access has been paused."
        : "This community is currently limited to invited or enrolled members.",
      accessType: access.community?.accessType,
    }, { status: 403 });
  }

  const rows = await env.DB.prepare(
    `SELECT posts.id,posts.body,posts.created_at AS createdAt,posts.status,
      posts.author_id AS authorId,
      COALESCE(profiles.display_name,'NorthstarLabs member') AS author,
      profiles.email AS authorEmail
     FROM posts LEFT JOIN profiles ON profiles.id=posts.author_id
     WHERE posts.community_id=? AND (posts.status='visible' OR ?=1)
     ORDER BY posts.created_at DESC LIMIT 100`,
  ).bind(access.community.id, access.canModerate ? 1 : 0).all();
  const stats = await env.DB.prepare(
    `SELECT
      (SELECT COUNT(*) FROM community_members WHERE community_id=? AND status='active') AS members,
      (SELECT COUNT(*) FROM posts WHERE community_id=? AND status='visible') AS posts`,
  ).bind(access.community.id, access.community.id).first();

  return Response.json({
    school: access.school,
    community: access.community,
    membership: access.member,
    canModerate: access.canModerate,
    currentUserId: user.id,
    posts: rows.results,
    stats,
  });
}

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const access = await ensureCommunityAccess(user, requestedSchoolId(request));
  if (!access.community || !access.canAccess) return Response.json({ error: "Community access required" }, { status: 403 });
  if (!access.community.allowPosting && !access.canModerate) {
    return Response.json({ error: "Only moderators can post right now." }, { status: 403 });
  }

  const { body } = await request.json() as { body?: string };
  if (!body?.trim()) return Response.json({ error: "Post required" }, { status: 400 });
  if (body.trim().length > 1500) return Response.json({ error: "Post is too long" }, { status: 400 });
  const id = crypto.randomUUID();
  const createdAt = Date.now();
  await env.DB.prepare(
    "INSERT INTO posts (id,community_id,author_id,body,status,created_at) VALUES (?,?,?,?,?,?)",
  ).bind(id, access.community.id, user.id, body.trim(), "visible", createdAt).run();
  const profile = await env.DB.prepare(
    "SELECT display_name AS displayName,email FROM profiles WHERE id=?",
  ).bind(user.id).first();
  return Response.json({
    id,
    body: body.trim(),
    createdAt,
    status: "visible",
    authorId: user.id,
    author: profile?.displayName || "NorthstarLabs member",
    authorEmail: profile?.email,
  }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const access = await ensureCommunityAccess(user, requestedSchoolId(request));
  if (!access.community || !access.canModerate) return Response.json({ error: "Moderator access required" }, { status: 403 });
  const { postId, action } = await request.json() as { postId?: string; action?: string };
  if (!postId || !["hide", "restore"].includes(action || "")) {
    return Response.json({ error: "Invalid moderation action" }, { status: 400 });
  }
  const status = action === "hide" ? "hidden" : "visible";
  await env.DB.prepare(
    "UPDATE posts SET status=?,moderated_by=?,moderated_at=? WHERE id=? AND community_id=?",
  ).bind(status, user.id, Date.now(), postId, access.community.id).run();
  return Response.json({ saved: true, status });
}

export async function DELETE(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const access = await ensureCommunityAccess(user, requestedSchoolId(request));
  if (!access.community || !access.canAccess) return Response.json({ error: "Community access required" }, { status: 403 });
  const postId = new URL(request.url).searchParams.get("postId");
  if (!postId) return Response.json({ error: "Post required" }, { status: 400 });
  const post = await env.DB.prepare(
    "SELECT author_id AS authorId FROM posts WHERE id=? AND community_id=?",
  ).bind(postId, access.community.id).first<{ authorId: string }>();
  if (!post) return Response.json({ error: "Post not found" }, { status: 404 });
  if (post.authorId !== user.id && !access.canModerate) {
    return Response.json({ error: "You cannot delete this post." }, { status: 403 });
  }
  await env.DB.prepare("DELETE FROM posts WHERE id=?").bind(postId).run();
  return Response.json({ deleted: true });
}
