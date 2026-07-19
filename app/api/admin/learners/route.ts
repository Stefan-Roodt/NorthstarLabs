import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../lib/server-auth";
import {
  ensureLearnerSchoolMembership,
  requestedSchoolId,
  requireCreatorSchool,
} from "../../../../lib/school-access";

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator access required" }, { status: 403 });
  const courses = await env.DB.prepare(
    "SELECT id,title,status FROM courses WHERE school_id=? ORDER BY title",
  ).bind(school.id).all();
  const enrollments = await env.DB.prepare(
    `SELECT e.id,e.user_id AS userId,e.course_id AS courseId,e.progress,e.status,
      e.support_note AS supportNote,e.last_activity_at AS lastActivityAt,e.created_at AS createdAt,
      c.title AS courseTitle,
      COALESCE(p.display_name,p.email,'Learner') AS displayName,
      COALESCE(p.email,'Account email unavailable') AS email
     FROM enrollments e
     JOIN courses c ON c.id=e.course_id
     LEFT JOIN profiles p ON p.id=e.user_id
     WHERE c.school_id=?
     ORDER BY COALESCE(e.last_activity_at,e.created_at) DESC`,
  ).bind(school.id).all();
  return Response.json({ school, courses: courses.results, enrollments: enrollments.results });
}

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator access required" }, { status: 403 });
  const { email, courseId } = await request.json() as { email?: string; courseId?: string };
  if (!email?.trim() || !courseId) {
    return Response.json({ error: "Learner email and course are required." }, { status: 400 });
  }
  const course = await env.DB.prepare(
    "SELECT id,title FROM courses WHERE id=? AND school_id=?",
  ).bind(courseId, school.id).first<{ id: string; title: string }>();
  if (!course) return Response.json({ error: "Course not found." }, { status: 404 });
  const learner = await env.DB.prepare(
    "SELECT id,email,display_name AS displayName FROM profiles WHERE lower(email)=lower(?)",
  ).bind(email.trim()).first<{ id: string; email: string; displayName: string }>();
  if (!learner) {
    return Response.json({ error: "That learner must create a NorthStarLabs account first." }, { status: 404 });
  }
  const now = Date.now();
  const existing = await env.DB.prepare(
    "SELECT id FROM enrollments WHERE user_id=? AND course_id=?",
  ).bind(learner.id, courseId).first<{ id: string }>();
  let enrollmentId = existing?.id;
  if (existing) {
    await env.DB.prepare(
      "UPDATE enrollments SET status='active',last_activity_at=? WHERE id=?",
    ).bind(now, existing.id).run();
  } else {
    enrollmentId = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO enrollments
       (id,user_id,course_id,progress,status,support_note,last_activity_at,created_at)
       VALUES (?,?,?,?,?,?,?,?)`,
    ).bind(enrollmentId, learner.id, courseId, 0, "active", "", now, now).run();
  }
  await ensureLearnerSchoolMembership(learner.id, school.id, false);
  const saved = await env.DB.prepare(
    `SELECT e.id,e.user_id AS userId,e.course_id AS courseId,e.progress,e.status,
      e.support_note AS supportNote,e.last_activity_at AS lastActivityAt,e.created_at AS createdAt,
      c.title AS courseTitle,p.display_name AS displayName,p.email
     FROM enrollments e JOIN courses c ON c.id=e.course_id JOIN profiles p ON p.id=e.user_id
     WHERE e.id=?`,
  ).bind(enrollmentId).first();
  return Response.json(saved, { status: existing ? 200 : 201 });
}

export async function PATCH(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator access required" }, { status: 403 });
  const body = await request.json() as {
    enrollmentId?: string;
    action?: string;
    status?: string;
    supportNote?: string;
  };
  if (!body.enrollmentId) {
    return Response.json({ error: "Enrollment required." }, { status: 400 });
  }
  const enrollment = await env.DB.prepare(
    `SELECT e.id,e.user_id AS userId,e.course_id AS courseId
     FROM enrollments e JOIN courses c ON c.id=e.course_id
     WHERE e.id=? AND c.school_id=?`,
  ).bind(body.enrollmentId, school.id).first<{ id: string; userId: string; courseId: string }>();
  if (!enrollment) return Response.json({ error: "Enrollment not found." }, { status: 404 });

  if (body.action === "status") {
    const status = body.status === "active" ? "active" : "paused";
    await env.DB.prepare(
      "UPDATE enrollments SET status=?,last_activity_at=? WHERE id=?",
    ).bind(status, Date.now(), enrollment.id).run();
    return Response.json({ saved: true, status });
  }

  if (body.action === "note") {
    const supportNote = (body.supportNote || "").trim().slice(0, 2000);
    await env.DB.prepare(
      "UPDATE enrollments SET support_note=? WHERE id=?",
    ).bind(supportNote, enrollment.id).run();
    return Response.json({ saved: true, supportNote });
  }

  if (body.action === "reset") {
    await env.DB.batch([
      env.DB.prepare(
        "DELETE FROM lesson_progress WHERE user_id=? AND lesson_id IN (SELECT id FROM lessons WHERE course_id=?)",
      ).bind(enrollment.userId, enrollment.courseId),
      env.DB.prepare(
        "DELETE FROM certificates WHERE user_id=? AND course_id=?",
      ).bind(enrollment.userId, enrollment.courseId),
      env.DB.prepare(
        "UPDATE enrollments SET progress=0,last_activity_at=? WHERE id=?",
      ).bind(Date.now(), enrollment.id),
    ]);
    return Response.json({ saved: true, progress: 0 });
  }

  return Response.json({ error: "Invalid learner action." }, { status: 400 });
}
