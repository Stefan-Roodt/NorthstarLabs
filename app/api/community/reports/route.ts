import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../../lib/audit-log";
import { ensureCommunityAccess } from "../../../../lib/community-access";
import { requireApiUser } from "../../../../lib/server-auth";

const REPORT_REASONS = new Set([
  "harassment",
  "hate",
  "spam",
  "misinformation",
  "privacy",
  "other",
]);

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as {
    schoolId?: string;
    postId?: string;
    reason?: string;
    detail?: string;
  };
  const access = await ensureCommunityAccess(user, body.schoolId);
  if (!access.school || !access.community || !access.canAccess) {
    return Response.json({ error: "Community access required." }, { status: 403 });
  }
  const reason = REPORT_REASONS.has(body.reason || "") ? body.reason! : "other";
  const post = await env.DB.prepare(
    "SELECT id,author_id AS authorId FROM posts WHERE id=? AND community_id=?",
  ).bind(body.postId || "", access.community.id).first<{
    id: string;
    authorId: string;
  }>();
  if (!post) return Response.json({ error: "Post not found." }, { status: 404 });
  if (post.authorId === user.id) {
    return Response.json(
      { error: "You can delete your own post instead of reporting it." },
      { status: 400 },
    );
  }
  const id = crypto.randomUUID();
  try {
    await env.DB.prepare(
      `INSERT INTO content_reports
        (id,school_id,community_id,post_id,reporter_id,reason,detail,status,created_at)
       VALUES (?,?,?,?,?,?,?,'open',?)`,
    ).bind(
      id,
      access.school.id,
      access.community.id,
      post.id,
      user.id,
      reason,
      (body.detail || "").trim().slice(0, 1_000),
      Date.now(),
    ).run();
  } catch {
    return Response.json(
      { error: "You have already reported this post." },
      { status: 409 },
    );
  }
  await writeAuditLog({
    actorId: user.id,
    schoolId: access.school.id,
    action: "community.post.report",
    targetType: "post",
    targetId: post.id,
    detail: { reason },
  });
  return Response.json({
    reported: true,
    message: "Thank you. The report is now in the moderation queue.",
  }, { status: 201 });
}

