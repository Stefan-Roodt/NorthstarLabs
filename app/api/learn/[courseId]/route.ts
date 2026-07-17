import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../lib/server-auth";

export async function GET(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await context.params;
  const access = await env.DB.prepare(
    `SELECT c.id,c.title,c.description,c.owner_id AS ownerId
     FROM courses c LEFT JOIN enrollments e ON e.course_id=c.id AND e.user_id=? AND e.status='active'
     WHERE c.id=? AND (c.owner_id=? OR e.id IS NOT NULL)`
  ).bind(user.id,courseId,user.id).first();
  if (!access) return Response.json({ error: "You are not enrolled in this course." }, { status: 403 });
  const lessons = await env.DB.prepare(
    `SELECT l.id,l.title,l.content,l.video_key AS videoKey,l.position,
      COALESCE(lp.completed,0) AS completed
     FROM lessons l LEFT JOIN lesson_progress lp ON lp.lesson_id=l.id AND lp.user_id=?
     WHERE l.course_id=? ORDER BY l.position,l.id`
  ).bind(user.id,courseId).all();
  return Response.json({ course: access, lessons: lessons.results });
}
