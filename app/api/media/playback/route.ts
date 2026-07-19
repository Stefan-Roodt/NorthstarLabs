import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../lib/server-auth";
import {
  createPlaybackToken,
  hashPlaybackToken,
  PLAYBACK_GRANT_TTL_MS,
} from "../../../../lib/media-stream";
import { getLessonGate } from "../../../../lib/learner-controls";

type PlaybackAsset = {
  lessonId: string;
  courseId: string;
  assetKey: string | null;
  filename: string;
  contentType: string;
  kind: string;
};

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as { lessonId?: string } | null;
  const lessonId = body?.lessonId?.trim() || "";
  if (!lessonId) return Response.json({ error: "Lesson required." }, { status: 400 });
  const gate = await getLessonGate(env.DB, user.id, lessonId);
  if (!gate) {
    return Response.json({ error: "You do not have access to this lesson." }, { status: 403 });
  }
  if (gate.locked && !gate.isStaff) {
    return Response.json({ error: gate.lockReason || "This lesson is locked." }, { status: 409 });
  }

  const asset = await env.DB.prepare(
    `SELECT l.id AS lessonId,l.course_id AS courseId,
      COALESCE(ma.key,l.video_key) AS assetKey,
      COALESCE(ma.filename,'Lesson video') AS filename,
      COALESCE(ma.content_type,'video/mp4') AS contentType,
      COALESCE(ma.kind,'video') AS kind
     FROM lessons l
     JOIN courses c ON c.id=l.course_id
     LEFT JOIN media_assets ma ON ma.id=l.primary_asset_id
     LEFT JOIN enrollments e ON e.course_id=l.course_id
       AND e.user_id=? AND e.status='active'
     LEFT JOIN school_members sm ON sm.school_id=c.school_id
       AND sm.user_id=? AND sm.status='active'
       AND sm.role IN ('owner','admin','instructor')
     WHERE l.id=? AND (e.id IS NOT NULL OR sm.id IS NOT NULL)
     LIMIT 1`,
  ).bind(user.id, user.id, lessonId).first<PlaybackAsset>();

  if (!asset) {
    return Response.json({ error: "You do not have access to this lesson." }, { status: 403 });
  }
  if (!asset.assetKey?.startsWith("r2:")) {
    return Response.json({ error: "This lesson does not use protected media." }, { status: 409 });
  }
  if (!["video", "audio", "image"].includes(asset.kind)) {
    return Response.json({ error: "This lesson does not contain playable media." }, { status: 409 });
  }

  const token = createPlaybackToken();
  const tokenHash = await hashPlaybackToken(token);
  const now = Date.now();
  const expiresAt = now + PLAYBACK_GRANT_TTL_MS;
  await env.DB.batch([
    env.DB.prepare(
      "DELETE FROM media_playback_grants WHERE user_id=? AND expires_at<?",
    ).bind(user.id, now),
    env.DB.prepare(
      `INSERT INTO media_playback_grants
       (token_hash,user_id,course_id,lesson_id,asset_key,filename,content_type,kind,expires_at,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
    ).bind(
      tokenHash,
      user.id,
      asset.courseId,
      asset.lessonId,
      asset.assetKey,
      asset.filename,
      asset.contentType,
      asset.kind,
      expiresAt,
      now,
    ),
  ]);

  return Response.json({
    url: `/api/media/stream/${token}`,
    expiresAt,
  }, {
    headers: { "cache-control": "private, no-store" },
  });
}
