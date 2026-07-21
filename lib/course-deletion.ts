import { env } from "cloudflare:workers";
import { writeAuditLog } from "./audit-log";
import { recordSystemEvent, safeErrorMessage } from "./system-monitor";

type AssetRow = {
  id: string;
  key: string;
};

export async function deleteCourseSafely(input: {
  courseId: string;
  schoolId: string;
  actorId: string;
}) {
  const assets = await env.DB.prepare(
    `SELECT DISTINCT ma.id,ma.key
     FROM media_assets ma
     WHERE ma.school_id=? AND (
       ma.id IN (
         SELECT primary_asset_id FROM lessons
         WHERE course_id=? AND primary_asset_id IS NOT NULL
       )
       OR ma.id IN (
         SELECT lr.asset_id FROM lesson_resources lr
         JOIN lessons l ON l.id=lr.lesson_id
         WHERE l.course_id=?
       )
     )`,
  ).bind(input.schoolId, input.courseId, input.courseId).all<AssetRow>();

  await env.DB.batch([
    env.DB.prepare(
      `DELETE FROM portfolio_source_visibility WHERE source_type='assessment'
       AND source_id IN (
         SELECT q.id FROM quizzes q JOIN lessons l ON l.id=q.lesson_id
         WHERE l.course_id=?
       )`,
    ).bind(input.courseId),
    env.DB.prepare(
      `DELETE FROM portfolio_source_visibility WHERE source_type='certificate'
       AND source_id IN (SELECT code FROM certificates WHERE course_id=?)`,
    ).bind(input.courseId),
    env.DB.prepare(
      "UPDATE portfolio_evidence SET course_id=NULL,updated_at=? WHERE course_id=?",
    ).bind(Date.now(), input.courseId),
    env.DB.prepare(
      `DELETE FROM quiz_attempts WHERE quiz_id IN (
        SELECT q.id FROM quizzes q
        JOIN lessons l ON l.id=q.lesson_id WHERE l.course_id=?
      )`,
    ).bind(input.courseId),
    env.DB.prepare(
      `DELETE FROM quiz_questions WHERE quiz_id IN (
        SELECT q.id FROM quizzes q
        JOIN lessons l ON l.id=q.lesson_id WHERE l.course_id=?
      )`,
    ).bind(input.courseId),
    env.DB.prepare(
      "DELETE FROM quizzes WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id=?)",
    ).bind(input.courseId),
    env.DB.prepare(
      "DELETE FROM lesson_progress WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id=?)",
    ).bind(input.courseId),
    env.DB.prepare(
      "DELETE FROM lesson_resources WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id=?)",
    ).bind(input.courseId),
    env.DB.prepare("DELETE FROM media_playback_grants WHERE course_id=?").bind(input.courseId),
    env.DB.prepare(
      `DELETE FROM live_attendance WHERE session_id IN (
        SELECT id FROM live_sessions WHERE course_id=? AND product_id IS NULL
      )`,
    ).bind(input.courseId),
    env.DB.prepare(
      "DELETE FROM live_sessions WHERE course_id=? AND product_id IS NULL",
    ).bind(input.courseId),
    env.DB.prepare(
      "UPDATE live_sessions SET course_id=NULL,updated_at=? WHERE course_id=?",
    ).bind(Date.now(), input.courseId),
    env.DB.prepare(
      "DELETE FROM product_items WHERE item_type='course' AND item_id=?",
    ).bind(input.courseId),
    env.DB.prepare("DELETE FROM lessons WHERE course_id=?").bind(input.courseId),
    env.DB.prepare("DELETE FROM course_sections WHERE course_id=?").bind(input.courseId),
    env.DB.prepare("DELETE FROM enrollments WHERE course_id=?").bind(input.courseId),
    env.DB.prepare("DELETE FROM certificates WHERE course_id=?").bind(input.courseId),
    env.DB.prepare("DELETE FROM invitations WHERE course_id=?").bind(input.courseId),
    env.DB.prepare("DELETE FROM courses WHERE id=? AND school_id=?").bind(
      input.courseId,
      input.schoolId,
    ),
  ]);

  let removedAssets = 0;
  for (const asset of assets.results) {
    const inUse = await env.DB.prepare(
      `SELECT
        EXISTS(SELECT 1 FROM lessons WHERE primary_asset_id=?) AS isPrimary,
        EXISTS(SELECT 1 FROM lesson_resources WHERE asset_id=?) AS isResource`,
    ).bind(asset.id, asset.id).first<{ isPrimary: number; isResource: number }>();
    if (inUse?.isPrimary || inUse?.isResource) continue;
    try {
      await env.UPLOADS.delete(asset.key.replace(/^r2:/, ""));
      await env.DB.prepare(
        "DELETE FROM media_assets WHERE id=? AND school_id=?",
      ).bind(asset.id, input.schoolId).run();
      removedAssets += 1;
    } catch (error) {
      await recordSystemEvent(env.DB, {
        severity: "error",
        source: "course_deletion",
        eventType: "media.cleanup_failed",
        message: safeErrorMessage(error),
        detail: { courseId: input.courseId, assetId: asset.id },
      });
    }
  }

  await writeAuditLog({
    actorId: input.actorId,
    schoolId: input.schoolId,
    action: "course.delete",
    targetType: "course",
    targetId: input.courseId,
    detail: { removedAssets },
  });
  return { deleted: true, removedAssets };
}
