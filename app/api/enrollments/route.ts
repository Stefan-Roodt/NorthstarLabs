import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../lib/server-auth";
import { ensureLearnerSchoolMembership, ensureProfile } from "../../../lib/school-access";
import { queueEnrollmentEmail } from "../../../lib/email-service";
import { writeAuditLog } from "../../../lib/audit-log";

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await env.DB.prepare(
    `SELECT e.course_id AS courseId,e.progress,e.status,c.title,c.description,
      s.id AS schoolId,s.name AS schoolName,s.slug AS schoolSlug,
      (SELECT COUNT(*) FROM lessons course_lessons
       WHERE course_lessons.course_id=e.course_id) AS lessonCount,
      (SELECT COUNT(*) FROM lessons completed_lessons
       JOIN lesson_progress completed_progress
         ON completed_progress.lesson_id=completed_lessons.id
        AND completed_progress.user_id=e.user_id
        AND completed_progress.completed=1
       WHERE completed_lessons.course_id=e.course_id) AS completedLessons,
      (SELECT next_lesson.title
       FROM lessons next_lesson
       LEFT JOIN course_sections next_section ON next_section.id=next_lesson.section_id
       LEFT JOIN lesson_progress next_progress
         ON next_progress.lesson_id=next_lesson.id
        AND next_progress.user_id=e.user_id
       WHERE next_lesson.course_id=e.course_id
         AND COALESCE(next_progress.completed,0)=0
       ORDER BY COALESCE(next_section.position,0),next_lesson.position,next_lesson.id
       LIMIT 1) AS nextLessonTitle
     FROM enrollments e JOIN courses c ON c.id=e.course_id
     JOIN schools s ON s.id=c.school_id
     WHERE e.user_id=? AND e.status='active'
     ORDER BY e.last_activity_at DESC,e.created_at DESC`
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
  const existing = await env.DB.prepare(
    "SELECT id FROM enrollments WHERE user_id=? AND course_id=?",
  ).bind(user.id,courseId).first<{ id: string }>();
  const enrollmentId = existing?.id || crypto.randomUUID();
  if (existing) await env.DB.prepare("UPDATE enrollments SET status='active',last_activity_at=? WHERE user_id=? AND course_id=?").bind(Date.now(),user.id,courseId).run();
  else await env.DB.prepare(
    "INSERT INTO enrollments (id,user_id,course_id,progress,status,last_activity_at,created_at) VALUES (?,?,?,?,?,?,?)"
  ).bind(enrollmentId,user.id,courseId,0,"active",Date.now(),Date.now()).run();
  await ensureLearnerSchoolMembership(user.id, course.schoolId);
  const emailDelivery = await queueEnrollmentEmail({
    userId: user.id,
    courseId,
    enrollmentId,
    origin: new URL(request.url).origin,
  }).catch(() => ({ id: "", status: "pending" }));
  await writeAuditLog({
    actorId: user.id,
    schoolId: course.schoolId,
    action: existing ? "enrollment.restore" : "enrollment.create",
    targetType: "enrollment",
    targetId: enrollmentId,
    detail: { courseId, emailStatus: emailDelivery.status },
  });
  return Response.json({
    enrolled: true,
    newEnrollment: !existing,
    courseId,
    schoolId: course.schoolId,
    emailStatus: emailDelivery.status,
  });
}
