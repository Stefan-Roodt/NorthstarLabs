import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../lib/server-auth";

export async function GET(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await context.params;
  const course = await env.DB.prepare(
    "SELECT id,title,description,status,price_cents AS priceCents FROM courses WHERE id=? AND owner_id=?"
  ).bind(courseId, user.id).first();
  if (!course) return Response.json({ error: "Course not found" }, { status: 404 });
  const lessons = await env.DB.prepare(
    "SELECT id,title,content,video_key AS videoKey,position FROM lessons WHERE course_id=? ORDER BY position,id"
  ).bind(courseId).all();
  return Response.json({ ...course, lessons: lessons.results });
}

export async function PATCH(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await context.params;
  const body = await request.json() as { title?: string; description?: string; status?: string; priceCents?: number };
  const existing = await env.DB.prepare("SELECT id FROM courses WHERE id=? AND owner_id=?").bind(courseId, user.id).first();
  if (!existing) return Response.json({ error: "Course not found" }, { status: 404 });
  const status = body.status === "published" ? "published" : "draft";
  await env.DB.prepare(
    "UPDATE courses SET title=COALESCE(?,title),description=COALESCE(?,description),status=?,price_cents=COALESCE(?,price_cents),updated_at=? WHERE id=?"
  ).bind(body.title?.trim() || null, body.description ?? null, status, Number.isFinite(body.priceCents) ? body.priceCents : null, Date.now(), courseId).run();
  return Response.json({ saved: true, status });
}

