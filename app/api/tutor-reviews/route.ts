import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../lib/audit-log";
import { ensureProfile } from "../../../lib/school-access";
import { requireApiUser } from "../../../lib/server-auth";

function cleanText(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function reviewerLabel(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Verified learner";
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts.at(-1)?.[0] || ""}.`;
}

export async function GET(request: Request) {
  const tutorId = new URL(request.url).searchParams.get("tutorId") || "";
  if (!tutorId) return Response.json({ error: "Tutor is required." }, { status: 400 });
  const rows = await env.DB.prepare(
    `SELECT tr.id,tr.rating,tr.comment,tr.created_at AS createdAt,
      COALESCE(p.display_name,'Verified learner') AS reviewerName
     FROM tutor_reviews tr
     LEFT JOIN profiles p ON p.id=tr.learner_id
     WHERE tr.tutor_id=? AND tr.status='published'
     ORDER BY tr.created_at DESC LIMIT 50`,
  ).bind(tutorId).all<{
    id: string;
    rating: number;
    comment: string;
    createdAt: number;
    reviewerName: string;
  }>();
  const reviews = rows.results.map((row) => ({
    id: row.id,
    rating: Number(row.rating),
    comment: row.comment,
    createdAt: row.createdAt,
    reviewerName: reviewerLabel(row.reviewerName),
    verifiedSession: true,
  }));
  const ratingTotal = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Response.json({
    reviews,
    reviewCount: reviews.length,
    averageRating: reviews.length ? Number((ratingTotal / reviews.length).toFixed(1)) : null,
  });
}

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Sign in to review your session." }, { status: 401 });
  const profile = await ensureProfile(user);
  if (!profile) return Response.json({ error: "Profile unavailable." }, { status: 403 });
  const body = await request.json() as Record<string, unknown>;
  const inquiryId = cleanText(body.inquiryId, 100);
  const rating = Number(body.rating);
  const comment = cleanText(body.comment, 800);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json({ error: "Choose a rating from one to five stars." }, { status: 400 });
  }
  const inquiry = await env.DB.prepare(
    `SELECT ti.id,ti.tutor_id AS tutorId,ti.school_id AS schoolId,
      ti.status,t.display_name AS tutorName
     FROM tutor_inquiries ti
     JOIN tutors t ON t.id=ti.tutor_id
     WHERE ti.id=? AND ti.learner_id=?`,
  ).bind(inquiryId, user.id).first<{
    id: string;
    tutorId: string;
    schoolId: string;
    status: string;
    tutorName: string;
  }>();
  if (!inquiry) return Response.json({ error: "Session not found." }, { status: 404 });
  if (inquiry.status !== "completed") {
    return Response.json(
      { error: "Reviews open after the coach marks the session completed." },
      { status: 409 },
    );
  }
  const existing = await env.DB.prepare(
    "SELECT id FROM tutor_reviews WHERE inquiry_id=?",
  ).bind(inquiry.id).first();
  if (existing) return Response.json({ error: "You already reviewed this session." }, { status: 409 });
  const id = crypto.randomUUID();
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO tutor_reviews
      (id,inquiry_id,tutor_id,school_id,learner_id,rating,comment,status,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,'published',?,?)`,
  ).bind(
    id,
    inquiry.id,
    inquiry.tutorId,
    inquiry.schoolId,
    user.id,
    rating,
    comment,
    now,
    now,
  ).run();
  await writeAuditLog({
    actorId: user.id,
    schoolId: inquiry.schoolId,
    action: "tutor_review.create",
    targetType: "tutor_review",
    targetId: id,
    detail: { tutorId: inquiry.tutorId, inquiryId: inquiry.id, rating },
  });
  return Response.json({
    created: true,
    id,
    tutorName: inquiry.tutorName,
    verifiedSession: true,
  }, { status: 201 });
}
