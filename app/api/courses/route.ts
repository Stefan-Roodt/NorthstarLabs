import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../lib/server-auth";
import { requestedSchoolId, requireCreatorSchool } from "../../../lib/school-access";

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) {
    return Response.json(
      { error: "Choose the creator path to set up your academy.", onboardingRequired: true },
      { status: 403 },
    );
  }
  const rows = await env.DB.prepare(
    `SELECT c.id,c.title,c.description,c.status,c.price_cents AS priceCents,
      c.updated_at AS updatedAt,
      COUNT(DISTINCT e.id) AS students,
      COUNT(DISTINCT l.id) AS lessonCount,
      COUNT(DISTINCT CASE WHEN l.primary_asset_id IS NOT NULL THEN l.id END) AS mediaLessonCount,
      COUNT(DISTINCT q.id) AS quizCount
     FROM courses c
     LEFT JOIN enrollments e ON e.course_id=c.id AND e.status='active'
     LEFT JOIN lessons l ON l.course_id=c.id
     LEFT JOIN quizzes q ON q.lesson_id=l.id
     WHERE c.school_id = ? GROUP BY c.id ORDER BY c.updated_at DESC`
  ).bind(school.id).all();
  return Response.json(rows.results);
}

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) {
    return Response.json(
      { error: "Choose the creator path to set up your academy.", onboardingRequired: true },
      { status: 403 },
    );
  }
  const body = await request.json() as { title?: string };
  if (!body.title?.trim()) return Response.json({ error: "Title required" }, { status: 400 });
  const id = crypto.randomUUID();
  const sectionId = crypto.randomUUID();
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO courses (id,school_id,owner_id,title,description,status,price_cents,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)",
    ).bind(id, school.id, user.id, body.title.trim(), "", "draft", 0, now, now),
    env.DB.prepare(
      "INSERT INTO course_sections (id,course_id,title,position,created_at) VALUES (?,?,?,?,?)",
    ).bind(sectionId, id, "Course content", 0, now),
  ]);
  return Response.json({
    id,
    schoolId: school.id,
    title: body.title.trim(),
    students: 0,
    status: "draft",
    priceCents: 0,
    lessonCount: 0,
    mediaLessonCount: 0,
    quizCount: 0,
    updatedAt: now,
  }, { status: 201 });
}
