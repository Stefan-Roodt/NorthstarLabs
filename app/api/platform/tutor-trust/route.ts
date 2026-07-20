import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../../lib/audit-log";
import { requirePlatformAdmin } from "../../../../lib/platform-admin";
import {
  visibleLearnerRatingSql,
  visibleTutorReviewSql,
} from "../../../../lib/tutor-rating-policy";

function cleanText(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

export async function GET(request: Request) {
  const user = await requirePlatformAdmin(request);
  if (!user) {
    return Response.json({ error: "Platform administrator access required." }, { status: 403 });
  }
  const [metrics, credentials, reviews, learnerRatings] = await Promise.all([
    env.DB.prepare(
      `SELECT
        (SELECT COUNT(*) FROM tutor_credentials WHERE status='pending') AS pendingCredentials,
        (SELECT COUNT(*) FROM tutor_credentials WHERE status='verified') AS verifiedCredentials,
        (SELECT COUNT(*) FROM tutors WHERE verified=1 AND status<>'archived') AS verifiedProfiles,
        (SELECT COUNT(*) FROM tutor_reviews tr WHERE ${visibleTutorReviewSql}) AS publishedReviews,
        (SELECT COUNT(*) FROM learner_session_ratings lr WHERE ${visibleLearnerRatingSql}) AS learnerRatings`,
    ).first(),
    env.DB.prepare(
      `SELECT tc.id,tc.tutor_id AS tutorId,tc.school_id AS schoolId,
        tc.title,tc.issuer,tc.awarded_year AS awardedYear,
        tc.evidence_url AS evidenceUrl,tc.status,
        tc.reviewer_note AS reviewerNote,tc.created_at AS createdAt,
        tc.reviewed_at AS reviewedAt,t.display_name AS tutorName,
        t.headline,s.name AS schoolName,
        COALESCE(p.display_name,p.email,tc.submitted_by) AS submittedBy
       FROM tutor_credentials tc
       JOIN tutors t ON t.id=tc.tutor_id
       JOIN schools s ON s.id=tc.school_id
       LEFT JOIN profiles p ON p.id=tc.submitted_by
       WHERE tc.status<>'withdrawn'
       ORDER BY CASE tc.status WHEN 'pending' THEN 0 WHEN 'verified' THEN 1 ELSE 2 END,
         tc.updated_at DESC LIMIT 150`,
    ).all(),
    env.DB.prepare(
      `SELECT tr.id,tr.tutor_id AS tutorId,tr.school_id AS schoolId,
        tr.rating,tr.comment,tr.status,tr.created_at AS createdAt,
        t.display_name AS tutorName,s.name AS schoolName,
        COALESCE(p.display_name,p.email,'Verified learner') AS reviewerName
       FROM tutor_reviews tr
       JOIN tutors t ON t.id=tr.tutor_id
       JOIN schools s ON s.id=tr.school_id
       LEFT JOIN profiles p ON p.id=tr.learner_id
       ORDER BY tr.created_at DESC LIMIT 100`,
    ).all(),
    env.DB.prepare(
      `SELECT lr.id,lr.inquiry_id AS inquiryId,lr.tutor_id AS tutorId,
        lr.school_id AS schoolId,lr.learner_id AS learnerId,lr.rating,
        lr.tags_json AS tagsJson,lr.private_note AS privateNote,lr.status,
        lr.visible_after AS visibleAfter,lr.created_at AS createdAt,
        t.display_name AS tutorName,s.name AS schoolName,
        COALESCE(p.display_name,p.email,lr.learner_id) AS learnerName,
        COALESCE(rp.display_name,rp.email,lr.rated_by) AS ratedBy
       FROM learner_session_ratings lr
       JOIN tutors t ON t.id=lr.tutor_id
       JOIN schools s ON s.id=lr.school_id
       LEFT JOIN profiles p ON p.id=lr.learner_id
       LEFT JOIN profiles rp ON rp.id=lr.rated_by
       ORDER BY lr.created_at DESC LIMIT 100`,
    ).all(),
  ]);
  return Response.json({
    metrics,
    credentials: credentials.results,
    reviews: reviews.results,
    learnerRatings: learnerRatings.results,
  });
}

export async function PATCH(request: Request) {
  const user = await requirePlatformAdmin(request);
  if (!user) {
    return Response.json({ error: "Platform administrator access required." }, { status: 403 });
  }
  const body = await request.json() as Record<string, unknown>;
  const learnerRatingId = cleanText(body.learnerRatingId, 100);
  if (learnerRatingId) {
    const ratingStatus = body.status === "hidden" || body.status === "published"
      ? body.status
      : "";
    if (!ratingStatus) {
      return Response.json({ error: "Choose a valid learner-rating status." }, { status: 400 });
    }
    const rating = await env.DB.prepare(
      `SELECT id,tutor_id AS tutorId,school_id AS schoolId,
        learner_id AS learnerId
       FROM learner_session_ratings WHERE id=?`,
    ).bind(learnerRatingId).first<{
      id: string;
      tutorId: string;
      schoolId: string;
      learnerId: string;
    }>();
    if (!rating) return Response.json({ error: "Learner rating not found." }, { status: 404 });
    await env.DB.prepare(
      "UPDATE learner_session_ratings SET status=?,updated_at=? WHERE id=?",
    ).bind(ratingStatus, Date.now(), rating.id).run();
    await writeAuditLog({
      actorId: user.id,
      schoolId: rating.schoolId,
      action: `platform.learner_session_rating.${ratingStatus}`,
      targetType: "learner_session_rating",
      targetId: rating.id,
      detail: { tutorId: rating.tutorId, learnerId: rating.learnerId },
    });
    return Response.json({
      saved: true,
      learnerRatingId: rating.id,
      status: ratingStatus,
    });
  }
  const reviewId = cleanText(body.reviewId, 100);
  if (reviewId) {
    const reviewStatus = body.status === "hidden" || body.status === "published"
      ? body.status
      : "";
    if (!reviewStatus) {
      return Response.json({ error: "Choose a valid review status." }, { status: 400 });
    }
    const review = await env.DB.prepare(
      "SELECT id,tutor_id AS tutorId,school_id AS schoolId FROM tutor_reviews WHERE id=?",
    ).bind(reviewId).first<{ id: string; tutorId: string; schoolId: string }>();
    if (!review) return Response.json({ error: "Review not found." }, { status: 404 });
    await env.DB.prepare(
      "UPDATE tutor_reviews SET status=?,updated_at=? WHERE id=?",
    ).bind(reviewStatus, Date.now(), review.id).run();
    await writeAuditLog({
      actorId: user.id,
      schoolId: review.schoolId,
      action: `platform.tutor_review.${reviewStatus}`,
      targetType: "tutor_review",
      targetId: review.id,
      detail: { tutorId: review.tutorId },
    });
    return Response.json({ saved: true, reviewId: review.id, status: reviewStatus });
  }
  const id = cleanText(body.credentialId, 100);
  const status = body.status === "verified" || body.status === "rejected"
    ? body.status
    : "";
  const reviewerNote = cleanText(body.reviewerNote, 1_000);
  if (!id || !status) {
    return Response.json({ error: "Choose a credential and review outcome." }, { status: 400 });
  }
  const credential = await env.DB.prepare(
    "SELECT id,tutor_id AS tutorId,school_id AS schoolId,title FROM tutor_credentials WHERE id=?",
  ).bind(id).first<{ id: string; tutorId: string; schoolId: string; title: string }>();
  if (!credential) return Response.json({ error: "Credential not found." }, { status: 404 });
  const now = Date.now();
  await env.DB.prepare(
    `UPDATE tutor_credentials SET status=?,reviewer_note=?,reviewed_by=?,
      reviewed_at=?,updated_at=? WHERE id=?`,
  ).bind(status, reviewerNote, user.id, now, now, id).run();
  const verified = await env.DB.prepare(
    "SELECT id FROM tutor_credentials WHERE tutor_id=? AND status='verified' LIMIT 1",
  ).bind(credential.tutorId).first();
  await env.DB.prepare(
    "UPDATE tutors SET verified=?,updated_at=? WHERE id=?",
  ).bind(verified ? 1 : 0, now, credential.tutorId).run();
  await writeAuditLog({
    actorId: user.id,
    schoolId: credential.schoolId,
    action: `platform.tutor_credential.${status}`,
    targetType: "tutor_credential",
    targetId: credential.id,
    detail: { tutorId: credential.tutorId, title: credential.title, reviewerNote },
  });
  return Response.json({
    saved: true,
    credentialId: credential.id,
    status,
    tutorVerified: Boolean(verified),
  });
}
