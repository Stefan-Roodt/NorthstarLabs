import { env } from "cloudflare:workers";

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  const certificate = await env.DB.prepare(
    `SELECT cert.code,cert.issued_at AS issuedAt,c.title AS courseTitle,
      COALESCE(p.display_name,'NorthStarLabs learner') AS learnerName
     FROM certificates cert
     JOIN courses c ON c.id=cert.course_id
     LEFT JOIN profiles p ON p.id=cert.user_id
     WHERE cert.code=?`,
  ).bind(code).first();
  if (!certificate) return Response.json({ error: "Certificate not found" }, { status: 404 });
  return Response.json(certificate);
}
