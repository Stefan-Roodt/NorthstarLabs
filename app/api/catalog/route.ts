import { env } from "cloudflare:workers";

export async function GET() {
  const rows = await env.DB.prepare(
    `SELECT c.id,c.title,c.description,c.price_cents AS priceCents,
      COUNT(l.id) AS lessonCount,p.display_name AS creator
     FROM courses c
     LEFT JOIN lessons l ON l.course_id=c.id
     LEFT JOIN profiles p ON p.id=c.owner_id
     WHERE c.status='published'
     GROUP BY c.id ORDER BY c.updated_at DESC`
  ).all();
  return Response.json(rows.results);
}

