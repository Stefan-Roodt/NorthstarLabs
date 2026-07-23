import { env } from "cloudflare:workers";
import { createCertificatePdf } from "../../../../../lib/certificate-pdf";

type PdfCertificate = {
  code: string;
  issuedAt: number;
  courseTitle: string;
  learnerName: string;
  certificateTitle: string;
  accentColor: string;
  status: string;
  expiresAt: number | null;
  issuerName: string;
};

export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  const certificate = await env.DB.prepare(
    `SELECT cert.code,cert.issued_at AS issuedAt,
      COALESCE(cert.course_title,c.title) AS courseTitle,
      COALESCE(cert.recipient_name,p.display_name,'NorthstarLabs learner') AS learnerName,
      cert.certificate_title AS certificateTitle,cert.accent_color AS accentColor,
      cert.status,cert.expires_at AS expiresAt,s.name AS issuerName
     FROM certificates cert
     JOIN courses c ON c.id=cert.course_id
     JOIN schools s ON s.id=c.school_id
     LEFT JOIN profiles p ON p.id=cert.user_id
     WHERE cert.code=?`,
  ).bind(code).first<PdfCertificate>();
  if (!certificate) return Response.json({ error: "Certificate not found" }, { status: 404 });
  if (
    certificate.status !== "active" ||
    (certificate.expiresAt && certificate.expiresAt <= Date.now())
  ) {
    return Response.json({ error: "This certificate is no longer valid." }, { status: 410 });
  }

  const origin = new URL(request.url).origin;
  const pdf = createCertificatePdf({
    ...certificate,
    verificationUrl: `${origin}/certificates/${encodeURIComponent(certificate.code)}`,
  });
  return new Response(pdf, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="NorthstarLabs-${certificate.code}.pdf"`,
      "cache-control": "public, max-age=300",
      "x-content-type-options": "nosniff",
    },
  });
}
