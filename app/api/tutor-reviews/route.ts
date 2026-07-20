import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../lib/audit-log";
import { ensureProfile } from "../../../lib/school-access";
import { requireApiUser } from "../../../lib/server-auth";
import {
  BLIND_RATING_PERIOD_MS,
  cleanRatingTags,
  parseRatingTags,
  ratingWindowClosesAt,
  visibleTutorReviewSql,
} from "../../../lib/tutor-rating-policy";

function cleanText(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

export async function GET(request: Request) {
  const tutorId = new URL(request.url).searchParams.get("tutorId") || "";
  if (!tutorId) return Response.json({ error: "Tutor is required." }, { status: 400 });
  const rows = await env.DB.prepare(
    `SELECT tr.id,tr.rating,tr.tags_json AS tagsJson,tr.comment,
      tr.created_at AS createdAt
     FROM tutor_reviews tr
     WHERE tr.tutor_id=? AND ${visibleTutorReviewSql}
     ORDER BY tr.created_at DESC LIMIT 50`,
  ).bind(tutorId).all<{
    id: string;
    rating: number;
    tagsJson: string;
    comment: string;
    createdAt: number;
  }>();
  const reviews = rows.results.map((row) => ({
    id: row.id,
    rating: Number(row.rating),
    tags: parseRatingTags(row.tagsJson),
    comment: row.comment,
    createdAt: row.createdAt,
    reviewerName: "Verified learner",
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
  const tags = cleanRatingTags(body.tags, "coach");
  const comment = cleanText(body.comment, 800);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json({ error: "Choose a rating from one to five stars." }, { status: 400 });
  }
  if (rating < 5 && !tags.length) {
    return Response.json(
      { error: "Choose at least one reason so the rating is useful and fair." },
      { status: 400 },
    );
  }
  const inquiry = await env.DB.prepare(
    `SELECT ti.id,ti.tutor_id AS tutorId,ti.school_id AS schoolId,
      ti.status,ti.updated_at AS completedAt,t.display_name AS tutorName
     FROM tutor_inquiries ti
     JOIN tutors t ON t.id=ti.tutor_id
     WHERE ti.id=? AND ti.learner_id=?`,
  ).bind(inquiryId, user.id).first<{
    id: string;
    tutorId: string;
    schoolId: string;
    status: string;
    completedAt: number;
    tutorName: string;
  }>();
  if (!inquiry) return Response.json({ error: "Session not found." }, { status: 404 });
  if (inquiry.status !== "completed") {
    return Response.json(
      { error: "Reviews open after the coach marks the session completed." },
      { status: 409 },
    );
  }
  const now = Date.now();
  if (ratingWindowClosesAt(inquiry.completedAt) < now) {
    return Response.json(
      { error: "The 14-day rating window for this session has closed." },
      { status: 409 },
    );
  }
  const existing = await env.DB.prepare(
    "SELECT id FROM tutor_reviews WHERE inquiry_id=?",
  ).bind(inquiry.id).first();
  if (existing) return Response.json({ error: "You already reviewed this session." }, { status: 409 });
  const counterpart = await env.DB.prepare(
    "SELECT id FROM learner_session_ratings WHERE inquiry_id=?",
  ).bind(inquiry.id).first();
  const id = crypto.randomUUID();
  const status = counterpart ? "published" : "pending";
  const visibleAfter = counterpart ? now : now + BLIND_RATING_PERIOD_MS;
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO tutor_reviews
        (id,inquiry_id,tutor_id,school_id,learner_id,rating,tags_json,comment,
         status,visible_after,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).bind(
      id,
      inquiry.id,
      inquiry.tutorId,
      inquiry.schoolId,
      user.id,
      rating,
      JSON.stringify(tags),
      comment,
      status,
      visibleAfter,
      now,
      now,
    ),
    env.DB.prepare(
      `UPDATE learner_session_ratings
       SET status=CASE WHEN status='pending' THEN 'published' ELSE status END,
         visible_after=CASE WHEN status='pending' THEN ? ELSE visible_after END,
         updated_at=?
       WHERE inquiry_id=?`,
    ).bind(now, now, inquiry.id),
  ]);
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
    status,
    visibleAfter,
  }, { status: 201 });
}
