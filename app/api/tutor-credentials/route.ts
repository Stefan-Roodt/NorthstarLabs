import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../lib/audit-log";
import { requestedSchoolId, requireCreatorSchool } from "../../../lib/school-access";
import { requireApiUser } from "../../../lib/server-auth";

function cleanText(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function cleanEvidenceUrl(value: unknown) {
  const raw = cleanText(value, 500);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return ["https:", "http:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

async function creatorContext(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return null;
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  return school ? { user, school } : null;
}

export async function GET(request: Request) {
  const context = await creatorContext(request);
  if (!context) return Response.json({ error: "Creator access required." }, { status: 403 });
  const rows = await env.DB.prepare(
    `SELECT tc.id,tc.tutor_id AS tutorId,t.display_name AS tutorName,
      tc.title,tc.issuer,tc.awarded_year AS awardedYear,
      tc.evidence_url AS evidenceUrl,tc.status,
      tc.reviewer_note AS reviewerNote,tc.reviewed_at AS reviewedAt,
      tc.created_at AS createdAt,tc.updated_at AS updatedAt
     FROM tutor_credentials tc
     JOIN tutors t ON t.id=tc.tutor_id
     WHERE tc.school_id=? AND tc.status<>'withdrawn'
     ORDER BY CASE tc.status WHEN 'pending' THEN 0 WHEN 'verified' THEN 1 ELSE 2 END,
       tc.updated_at DESC`,
  ).bind(context.school.id).all();
  return Response.json({ credentials: rows.results });
}

export async function POST(request: Request) {
  const context = await creatorContext(request);
  if (!context) return Response.json({ error: "Creator access required." }, { status: 403 });
  const body = await request.json() as Record<string, unknown>;
  const tutorId = cleanText(body.tutorId, 100);
  const title = cleanText(body.title, 160);
  const issuer = cleanText(body.issuer, 160);
  const year = Number(body.awardedYear);
  const awardedYear = Number.isInteger(year) && year >= 1950 && year <= new Date().getFullYear()
    ? year
    : null;
  const evidenceUrl = cleanEvidenceUrl(body.evidenceUrl);
  if (title.length < 3 || issuer.length < 2) {
    return Response.json(
      { error: "Add the credential title and issuing organisation." },
      { status: 400 },
    );
  }
  if (body.evidenceUrl && !evidenceUrl) {
    return Response.json({ error: "Use a valid evidence URL." }, { status: 400 });
  }
  const tutor = await env.DB.prepare(
    "SELECT id FROM tutors WHERE id=? AND school_id=? AND status<>'archived'",
  ).bind(tutorId, context.school.id).first();
  if (!tutor) return Response.json({ error: "Coach profile not found." }, { status: 404 });
  const id = crypto.randomUUID();
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO tutor_credentials
      (id,tutor_id,school_id,submitted_by,title,issuer,awarded_year,
       evidence_url,status,reviewer_note,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,'pending','',?,?)`,
  ).bind(
    id,
    tutorId,
    context.school.id,
    context.user.id,
    title,
    issuer,
    awardedYear,
    evidenceUrl,
    now,
    now,
  ).run();
  await writeAuditLog({
    actorId: context.user.id,
    schoolId: context.school.id,
    action: "tutor_credential.submit",
    targetType: "tutor_credential",
    targetId: id,
    detail: { tutorId, title, issuer },
  });
  return Response.json({ created: true, id, status: "pending" }, { status: 201 });
}

export async function DELETE(request: Request) {
  const context = await creatorContext(request);
  if (!context) return Response.json({ error: "Creator access required." }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id") || "";
  const result = await env.DB.prepare(
    `UPDATE tutor_credentials SET status='withdrawn',updated_at=?
     WHERE id=? AND school_id=? AND status IN ('pending','rejected')`,
  ).bind(Date.now(), id, context.school.id).run();
  if (!result.meta.changes) {
    return Response.json(
      { error: "Only pending or rejected credentials can be withdrawn." },
      { status: 409 },
    );
  }
  await writeAuditLog({
    actorId: context.user.id,
    schoolId: context.school.id,
    action: "tutor_credential.withdraw",
    targetType: "tutor_credential",
    targetId: id,
  });
  return Response.json({ withdrawn: true, id });
}
