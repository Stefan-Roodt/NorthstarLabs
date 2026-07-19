import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../lib/server-auth";
import { requireCreatorSchool, requestedSchoolId } from "../../../lib/school-access";

const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/ogg"]);

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!await requireCreatorSchool(user, requestedSchoolId(request))) {
    return Response.json({ error: "Creator access required" }, { status: 403 });
  }

  const contentType = request.headers.get("content-type")?.split(";")[0] || "";
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (!VIDEO_TYPES.has(contentType)) {
    return Response.json({ error: "Upload an MP4, WebM, or Ogg video." }, { status: 415 });
  }
  if (contentLength > MAX_VIDEO_BYTES) {
    return Response.json({ error: "Video files must be 200 MB or smaller." }, { status: 413 });
  }

  const filename = new URL(request.url).searchParams
    .get("filename")
    ?.replace(/[^a-zA-Z0-9._-]/g, "-") || "lesson-video";
  const key = `users/${user.id}/${crypto.randomUUID()}-${filename}`;

  await env.UPLOADS.put(key, request.body, {
    httpMetadata: { contentType },
    customMetadata: { owner: user.id },
  });

  return Response.json({ key: `r2:${key}` });
}

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rawKey = new URL(request.url).searchParams.get("key") || "";
  const key = rawKey.replace(/^r2:/, "");
  if (!key) return Response.json({ error: "Video key required" }, { status: 400 });

  const lesson = await env.DB.prepare(
    `SELECT l.id,c.owner_id AS ownerId,c.id AS courseId,c.school_id AS schoolId
     FROM lessons l JOIN courses c ON c.id=l.course_id
     WHERE l.video_key=?`,
  ).bind(`r2:${key}`).first<{ id: string; ownerId: string; courseId: string; schoolId: string }>();
  if (!lesson) return Response.json({ error: "Video not found" }, { status: 404 });

  const enrollment = await env.DB.prepare(
    "SELECT id FROM enrollments WHERE user_id=? AND course_id=? AND status='active'",
  ).bind(user.id, lesson.courseId).first();
  const staff = await env.DB.prepare(
    `SELECT id FROM school_members
     WHERE school_id=? AND user_id=? AND status='active'
       AND role IN ('owner','admin','instructor')`,
  ).bind(lesson.schoolId, user.id).first();
  if (!staff && !enrollment) {
    return Response.json({ error: "Not enrolled" }, { status: 403 });
  }

  const object = await env.UPLOADS.get(key);
  if (!object) return Response.json({ error: "Video not found" }, { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("content-length", String(object.size));
  headers.set("cache-control", "private, max-age=3600");
  headers.set("accept-ranges", "bytes");
  return new Response(object.body, { headers });
}
