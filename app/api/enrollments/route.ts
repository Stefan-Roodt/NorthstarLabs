import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../lib/server-auth";
import { ensureLearnerSchoolMembership, ensureProfile } from "../../../lib/school-access";

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await env.DB.prepare(
    `SELECT e.course_id AS courseId,e.progress,e.status,c.title,c.description,
      s.id AS schoolId,s.name AS schoolName,s.slug AS schoolSlug
     FROM enrollments e JOIN courses c ON c.id=e.course_id
     JOIN schools s ON s.id=c.school_id
     WHERE e.user_id=? AND e.status='active' ORDER BY e.created_at DESC`
  ).bind(user.id).all();
  return Response.json(rows.results);
}

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await ensureProfile(user);
  const { courseId } = await request.json() as { courseId?: string };
  if (!courseId) return Response.json({ error: "Course required" }, { status: 400 });
  const course = await env.DB.prepare(
    "SELECT id,school_id AS schoolId,price_cents AS priceCents FROM courses WHERE id=? AND status='published'",
  ).bind(courseId).first<{ id: string; schoolId: string; priceCents: number }>();
  if (!course) return Response.json({ error: "Course unavailable" }, { status: 404 });
  if (course.priceCents > 0) return Response.json({ error: "Paid enrolment will open when PayFast is connected." }, { status: 402 });
  const existing = await env.DB.prepare("SELECT id FROM enrollments WHERE user_id=? AND course_id=?").bind(user.id,courseId).first();
  if (existing) await env.DB.prepare("UPDATE enrollments SET status='active',last_activity_at=? WHERE user_id=? AND course_id=?").bind(Date.now(),user.id,courseId).run();
  else await env.DB.prepare(
    "INSERT INTO enrollments (id,user_id,course_id,progress,status,last_activity_at,created_at) VALUES (?,?,?,?,?,?,?)"
  ).bind(crypto.randomUUID(),user.id,courseId,0,"active",Date.now(),Date.now()).run();
  await ensureLearnerSchoolMembership(user.id, course.schoolId);
  return Response.json({ enrolled: true, courseId, schoolId: course.schoolId });
}
