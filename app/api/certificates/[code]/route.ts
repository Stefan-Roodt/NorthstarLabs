import { env } from "cloudflare:workers";
import { requireCourseStaffAccess } from "../../../../lib/school-access";
import { requireApiUser } from "../../../../lib/server-auth";

type CertificateRow = {
  code: string;
  issuedAt: number;
  userId: string;
  courseId: string;
  courseTitle: string;
  learnerName: string;
  certificateTitle: string;
  accentColor: string;
  status: string;
  expiresAt: number | null;
  revokedAt: number | null;
  replacedByCode: string | null;
  issuerName: string;
};

async function findCertificate(code: string) {
  return env.DB.prepare(
    `SELECT cert.code,cert.issued_at AS issuedAt,cert.user_id AS userId,
      cert.course_id AS courseId,
      COALESCE(cert.course_title,c.title) AS courseTitle,
      COALESCE(cert.recipient_name,p.display_name,'NorthStarLabs learner') AS learnerName,
      cert.certificate_title AS certificateTitle,cert.accent_color AS accentColor,
      cert.status,cert.expires_at AS expiresAt,cert.revoked_at AS revokedAt,
      cert.replaced_by_code AS replacedByCode,s.name AS issuerName
     FROM certificates cert
     JOIN courses c ON c.id=cert.course_id
     JOIN schools s ON s.id=c.school_id
     LEFT JOIN profiles p ON p.id=cert.user_id
     WHERE cert.code=?`,
  ).bind(code).first<CertificateRow>();
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  const certificate = await findCertificate(code);
  if (!certificate) return Response.json({ error: "Certificate not found" }, { status: 404 });
  return Response.json({
    ...certificate,
    valid: certificate.status === "active" &&
      (!certificate.expiresAt || certificate.expiresAt > Date.now()),
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { code } = await context.params;
  const body = await request.json() as { action?: "revoke" | "replace" };
  const certificate = await findCertificate(code);
  if (!certificate || !await requireCourseStaffAccess(user.id, certificate.courseId)) {
    return Response.json({ error: "Certificate not found" }, { status: 404 });
  }
  const now = Date.now();

  if (body.action === "revoke") {
    await env.DB.prepare(
      `UPDATE certificates SET status='revoked',revoked_at=?
       WHERE code=? AND status='active'`,
    ).bind(now, code).run();
    return Response.json({ saved: true, status: "revoked" });
  }

  if (body.action === "replace") {
    const replacementCode = `NSL-${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
    const validFor = certificate.expiresAt
      ? Math.max(0, certificate.expiresAt - certificate.issuedAt)
      : 0;
    await env.DB.batch([
      env.DB.prepare(
        `UPDATE certificates SET status='replaced',replaced_by_code=?,revoked_at=?
         WHERE code=?`,
      ).bind(replacementCode, now, code),
      env.DB.prepare(
        `INSERT INTO certificates
          (id,user_id,course_id,code,issued_at,recipient_name,course_title,
           certificate_title,accent_color,status,expires_at)
         VALUES (?,?,?,?,?,?,?,?,?,'active',?)`,
      ).bind(
        crypto.randomUUID(),
        certificate.userId,
        certificate.courseId,
        replacementCode,
        now,
        certificate.learnerName,
        certificate.courseTitle,
        certificate.certificateTitle,
        certificate.accentColor,
        validFor ? now + validFor : null,
      ),
    ]);
    return Response.json({ saved: true, status: "replaced", replacementCode });
  }

  return Response.json({ error: "Choose revoke or replace." }, { status: 400 });
}
