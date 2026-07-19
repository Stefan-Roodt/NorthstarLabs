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
    `SELECT c.id, c.title, c.description, c.status, c.price_cents AS priceCents,
      c.updated_at AS updatedAt, COUNT(e.id) AS students
     FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'active'
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
  const now = Date.now();
  await env.DB.prepare("INSERT INTO courses (id,school_id,owner_id,title,description,status,price_cents,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)")
    .bind(id, school.id, user.id, body.title.trim(), "", "draft", 0, now, now).run();
  return Response.json({
    id,
    schoolId: school.id,
    title: body.title.trim(),
    students: 0,
    status: "draft",
    priceCents: 0,
    updatedAt: now,
  }, { status: 201 });
}
