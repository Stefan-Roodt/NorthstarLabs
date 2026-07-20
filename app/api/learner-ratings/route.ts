import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../lib/audit-log";
import { emitIntegrationEvent } from "../../../lib/integrations";
import { requestedSchoolId, requireCreatorSchool } from "../../../lib/school-access";
import { requireApiUser } from "../../../lib/server-auth";
import {
  BLIND_RATING_PERIOD_MS,
  cleanRatingTags,
  MINIMUM_LEARNER_RATINGS,
  parseRatingTags,
  ratingWindowClosesAt,
  visibleLearnerRatingSql,
} from "../../../lib/tutor-rating-policy";

function cleanText(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await env.DB.prepare(
    `SELECT lr.rating,lr.tags_json AS tagsJson
     FROM learner_session_ratings lr
     WHERE lr.learner_id=? AND ${visibleLearnerRatingSql}
     ORDER BY lr.created_at DESC LIMIT 250`,
  ).bind(user.id).all<{ rating: number; tagsJson: string }>();
  const ratingCount = rows.results.length;
  if (ratingCount < MINIMUM_LEARNER_RATINGS) {
    return Response.json({
      ratingCount,
      minimumRatings: MINIMUM_LEARNER_RATINGS,
      averageRating: null,
      themes: [],
    });
  }
  const total = rows.results.reduce((sum, row) => sum + Number(row.rating), 0);
  const themeCounts = new Map<string, number>();
  for (const row of rows.results) {
    for (const tag of parseRatingTags(row.tagsJson)) {
      themeCounts.set(tag, (themeCounts.get(tag) || 0) + 1);
    }
  }
  const themes = [...themeCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));
  return Response.json({
    ratingCount,
    minimumRatings: MINIMUM_LEARNER_RATINGS,
    averageRating: Number((total / ratingCount).toFixed(1)),
    themes,
  });
}

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator access required." }, { status: 403 });
  const body = await request.json() as Record<string, unknown>;
  const inquiryId = cleanText(body.inquiryId, 100);
  const rating = Number(body.rating);
  const tags = cleanRatingTags(body.tags, "learner");
  const privateNote = cleanText(body.privateNote, 600);
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
      ti.learner_id AS learnerId,ti.learner_name AS learnerName,
      ti.status,ti.updated_at AS completedAt,t.display_name AS tutorName
     FROM tutor_inquiries ti
     JOIN tutors t ON t.id=ti.tutor_id
     WHERE ti.id=? AND ti.school_id=?`,
  ).bind(inquiryId, school.id).first<{
    id: string;
    tutorId: string;
    schoolId: string;
    learnerId: string;
    learnerName: string;
    status: string;
    completedAt: number;
    tutorName: string;
  }>();
  if (!inquiry) return Response.json({ error: "Completed session not found." }, { status: 404 });
  if (inquiry.status !== "completed") {
    return Response.json(
      { error: "Learner ratings open only after a completed session." },
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
    "SELECT id FROM learner_session_ratings WHERE inquiry_id=?",
  ).bind(inquiry.id).first();
  if (existing) {
    return Response.json({ error: "This learner has already been rated for the session." }, { status: 409 });
  }
  const counterpart = await env.DB.prepare(
    "SELECT id FROM tutor_reviews WHERE inquiry_id=?",
  ).bind(inquiry.id).first();
  const id = crypto.randomUUID();
  const status = counterpart ? "published" : "pending";
  const visibleAfter = counterpart ? now : now + BLIND_RATING_PERIOD_MS;
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO learner_session_ratings
        (id,inquiry_id,tutor_id,school_id,learner_id,rated_by,rating,tags_json,
         private_note,status,visible_after,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).bind(
      id,
      inquiry.id,
      inquiry.tutorId,
      inquiry.schoolId,
      inquiry.learnerId,
      user.id,
      rating,
      JSON.stringify(tags),
      privateNote,
      status,
      visibleAfter,
      now,
      now,
    ),
    env.DB.prepare(
      `UPDATE tutor_reviews
       SET status=CASE WHEN status='pending' THEN 'published' ELSE status END,
         visible_after=CASE WHEN status='pending' THEN ? ELSE visible_after END,
         updated_at=?
       WHERE inquiry_id=?`,
    ).bind(now, now, inquiry.id),
  ]);
  await writeAuditLog({
    actorId: user.id,
    schoolId: inquiry.schoolId,
    action: "learner_session_rating.create",
    targetType: "learner_session_rating",
    targetId: id,
    detail: {
      inquiryId: inquiry.id,
      tutorId: inquiry.tutorId,
      learnerId: inquiry.learnerId,
      rating,
    },
  });
  await emitIntegrationEvent(env.DB, inquiry.schoolId, "tutor.learner_rating_created", {
    inquiryId: inquiry.id,
    tutorId: inquiry.tutorId,
    learnerId: inquiry.learnerId,
  });
  return Response.json({
    created: true,
    id,
    learnerName: inquiry.learnerName,
    tutorName: inquiry.tutorName,
    status,
    visibleAfter,
  }, { status: 201 });
}
