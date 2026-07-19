import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../lib/server-auth";
import { requireCourseStaffAccess } from "../../../lib/school-access";

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as {
    courseId?: string;
    section?: { id?: string; title?: string; position?: number };
  };
  if (!body.courseId || !body.section?.title?.trim()) {
    return Response.json({ error: "Section title required." }, { status: 400 });
  }
  if (!await requireCourseStaffAccess(user.id, body.courseId)) {
    return Response.json({ error: "Course not found." }, { status: 404 });
  }
  const id = body.section.id || crypto.randomUUID();
  const existing = await env.DB.prepare(
    "SELECT id FROM course_sections WHERE id=? AND course_id=?",
  ).bind(id, body.courseId).first();
  if (existing) {
    await env.DB.prepare(
      "UPDATE course_sections SET title=?,position=? WHERE id=? AND course_id=?",
    ).bind(
      body.section.title.trim().slice(0, 120),
      Math.max(0, Number(body.section.position || 0)),
      id,
      body.courseId,
    ).run();
  } else {
    const collision = await env.DB.prepare(
      "SELECT id FROM course_sections WHERE id=?",
    ).bind(id).first();
    if (collision) return Response.json({ error: "Section id is already in use." }, { status: 409 });
    await env.DB.prepare(
      "INSERT INTO course_sections (id,course_id,title,position,created_at) VALUES (?,?,?,?,?)",
    ).bind(
      id,
      body.courseId,
      body.section.title.trim().slice(0, 120),
      Math.max(0, Number(body.section.position || 0)),
      Date.now(),
    ).run();
  }
  return Response.json({ id, saved: true }, { status: existing ? 200 : 201 });
}

export async function PATCH(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as {
    courseId?: string;
    sections?: Array<{ id?: string; position?: number }>;
    lessons?: Array<{ id?: string; sectionId?: string; position?: number }>;
  };
  if (!body.courseId || !await requireCourseStaffAccess(user.id, body.courseId)) {
    return Response.json({ error: "Course not found." }, { status: 404 });
  }
  const statements = [
    ...(body.sections || []).filter((item) => item.id).map((item) =>
      env.DB.prepare(
        "UPDATE course_sections SET position=? WHERE id=? AND course_id=?",
      ).bind(Math.max(0, Number(item.position || 0)), item.id, body.courseId)
    ),
    ...(body.lessons || []).filter((item) => item.id && item.sectionId).map((item) =>
      env.DB.prepare(
        `UPDATE lessons SET position=?,section_id=?,updated_at=?
         WHERE id=? AND course_id=?
           AND ? IN (SELECT id FROM course_sections WHERE course_id=?)`,
      ).bind(
        Math.max(0, Number(item.position || 0)),
        item.sectionId,
        Date.now(),
        item.id,
        body.courseId,
        item.sectionId,
        body.courseId,
      )
    ),
  ];
  if (statements.length) await env.DB.batch(statements);
  return Response.json({ saved: true });
}

export async function DELETE(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const courseId = url.searchParams.get("courseId") || "";
  const sectionId = url.searchParams.get("sectionId") || "";
  if (!courseId || !sectionId || !await requireCourseStaffAccess(user.id, courseId)) {
    return Response.json({ error: "Course not found." }, { status: 404 });
  }
  const replacement = await env.DB.prepare(
    "SELECT id FROM course_sections WHERE course_id=? AND id<>? ORDER BY position,id LIMIT 1",
  ).bind(courseId, sectionId).first<{ id: string }>();
  if (!replacement) {
    return Response.json({ error: "Every course needs at least one section." }, { status: 409 });
  }
  await env.DB.batch([
    env.DB.prepare(
      "UPDATE lessons SET section_id=?,updated_at=? WHERE section_id=? AND course_id=?",
    ).bind(replacement.id, Date.now(), sectionId, courseId),
    env.DB.prepare(
      "DELETE FROM course_sections WHERE id=? AND course_id=?",
    ).bind(sectionId, courseId),
  ]);
  return Response.json({ deleted: true, replacementSectionId: replacement.id });
}
