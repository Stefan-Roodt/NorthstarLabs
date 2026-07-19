import { env } from "cloudflare:workers";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const school = await env.DB.prepare(
    `SELECT id,slug,name,description,logo_url AS logoUrl,
      primary_color AS primaryColor
     FROM schools WHERE slug=? AND status='active'`,
  ).bind(slug).first();
  if (!school) return Response.json({ error: "School not found." }, { status: 404 });

  const courses = await env.DB.prepare(
    `SELECT c.id,c.title,c.description,c.price_cents AS priceCents,
      COUNT(l.id) AS lessonCount,
      COALESCE(p.display_name,s.name) AS creator,
      s.id AS schoolId,s.name AS schoolName,s.slug AS schoolSlug
     FROM courses c
     JOIN schools s ON s.id=c.school_id
     LEFT JOIN lessons l ON l.course_id=c.id
     LEFT JOIN profiles p ON p.id=c.owner_id
     WHERE c.school_id=? AND c.status='published'
     GROUP BY c.id
     ORDER BY c.updated_at DESC`,
  ).bind(school.id).all();

  return Response.json({ school, courses: courses.results });
}
