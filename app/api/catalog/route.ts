import { env } from "cloudflare:workers";
import { starterCourses, type CatalogCourse } from "../../../lib/starter-courses";

export async function GET() {
  const rows = await env.DB.prepare(
    `SELECT c.id,c.title,c.description,c.price_cents AS priceCents,
      COUNT(l.id) AS lessonCount,p.display_name AS creator,
      s.id AS schoolId,s.name AS schoolName,s.slug AS schoolSlug
     FROM courses c
     LEFT JOIN lessons l ON l.course_id=c.id
     LEFT JOIN profiles p ON p.id=c.owner_id
     JOIN schools s ON s.id=c.school_id
     WHERE c.status='published'
     GROUP BY c.id ORDER BY c.updated_at DESC`
  ).all<CatalogCourse>();
  const ids = new Set(rows.results.map((course) => course.id));
  const completeCatalog = [
    ...starterCourses.filter((course) => !ids.has(course.id)),
    ...rows.results,
  ];
  return Response.json(completeCatalog);
}
