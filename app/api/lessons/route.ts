import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../lib/server-auth";
import { requireCourseStaffAccess } from "../../../lib/school-access";

const LESSON_TYPES = new Set(["text", "video", "audio", "resource", "quiz"]);

type LessonInput = {
  id?: string;
  sectionId?: string;
  title?: string;
  lessonType?: string;
  content?: string;
  contentFormat?: string;
  videoKey?: string;
  primaryAssetId?: string | null;
  introAssetId?: string | null;
  resourceIds?: string[];
  durationMinutes?: number;
  isPreview?: boolean;
  availableAfterDays?: number;
  requiredWatchPercent?: number;
  transcript?: string;
  position?: number;
};

function safeExternalMedia(value?: string) {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as { courseId?: string; lesson?: LessonInput };
  const lesson = body.lesson;
  if (!body.courseId || !lesson?.title?.trim() || !lesson.sectionId) {
    return Response.json({ error: "Lesson title and section are required." }, { status: 400 });
  }
  const courseAccess = await requireCourseStaffAccess(user.id, body.courseId);
  if (!courseAccess) return Response.json({ error: "Course not found." }, { status: 404 });
  const section = await env.DB.prepare(
    "SELECT id FROM course_sections WHERE id=? AND course_id=?",
  ).bind(lesson.sectionId, body.courseId).first();
  if (!section) return Response.json({ error: "Section not found." }, { status: 404 });

  const lessonType = LESSON_TYPES.has(lesson.lessonType || "") ? lesson.lessonType! : "text";
  const primaryAssetId = lesson.primaryAssetId || null;
  if (primaryAssetId) {
    const asset = await env.DB.prepare(
      "SELECT id FROM media_assets WHERE id=? AND school_id=?",
    ).bind(primaryAssetId, courseAccess.schoolId).first();
    if (!asset) return Response.json({ error: "Primary media not found." }, { status: 404 });
  }
  const introAssetId = lesson.introAssetId || null;
  if (introAssetId) {
    const introAsset = await env.DB.prepare(
      "SELECT id FROM media_assets WHERE id=? AND school_id=? AND kind='video'",
    ).bind(introAssetId, courseAccess.schoolId).first();
    if (!introAsset) return Response.json({ error: "Lesson intro video not found." }, { status: 404 });
  }

  const resourceIds = Array.from(new Set(lesson.resourceIds || [])).slice(0, 20);
  let resourceAssets: Array<{ id: string; filename: string }> = [];
  if (resourceIds.length) {
    const placeholders = resourceIds.map(() => "?").join(",");
    const rows = await env.DB.prepare(
      `SELECT id,filename FROM media_assets
       WHERE school_id=? AND id IN (${placeholders})`,
    ).bind(courseAccess.schoolId, ...resourceIds).all<{ id: string; filename: string }>();
    if (rows.results.length !== resourceIds.length) {
      return Response.json({ error: "One or more resources are unavailable." }, { status: 404 });
    }
    resourceAssets = resourceIds.map((id) => rows.results.find((asset) => asset.id === id)!);
  }

  const id = lesson.id || crypto.randomUUID();
  const existing = await env.DB.prepare(
    "SELECT id,video_key AS videoKey FROM lessons WHERE id=? AND course_id=?",
  ).bind(id, body.courseId).first<{ id: string; videoKey: string | null }>();
  if (!existing) {
    const collision = await env.DB.prepare("SELECT id FROM lessons WHERE id=?").bind(id).first();
    if (collision) return Response.json({ error: "Lesson id is already in use." }, { status: 409 });
  }

  const now = Date.now();
  const legacyMedia = lesson.videoKey?.startsWith("r2:") &&
    existing?.videoKey === lesson.videoKey
    ? lesson.videoKey
    : null;
  const externalMedia = legacyMedia || safeExternalMedia(lesson.videoKey);
  if (lesson.videoKey?.trim() && !externalMedia) {
    return Response.json(
      { error: "External media must use a valid https:// or http:// URL." },
      { status: 400 },
    );
  }
  const lessonStatement = existing
    ? env.DB.prepare(
        `UPDATE lessons SET section_id=?,title=?,lesson_type=?,content=?,
          content_format='markdown',video_key=?,primary_asset_id=?,intro_asset_id=?,duration_minutes=?,
          is_preview=?,available_after_days=?,required_watch_percent=?,transcript=?,
          position=?,updated_at=?
         WHERE id=? AND course_id=?`,
      ).bind(
        lesson.sectionId,
        lesson.title.trim().slice(0, 160),
        lessonType,
        (lesson.content || "").slice(0, 100000),
        externalMedia,
        primaryAssetId,
        introAssetId,
        Math.max(0, Math.min(1440, Number(lesson.durationMinutes || 0))),
        lesson.isPreview ? 1 : 0,
        Math.max(0, Math.min(3650, Math.round(Number(lesson.availableAfterDays || 0)))),
        Math.max(0, Math.min(100, Math.round(Number(lesson.requiredWatchPercent || 0)))),
        (lesson.transcript || "").slice(0, 100_000),
        Math.max(0, Number(lesson.position || 0)),
        now,
        id,
        body.courseId,
      )
    : env.DB.prepare(
        `INSERT INTO lessons
         (id,course_id,section_id,title,lesson_type,content,content_format,video_key,
          primary_asset_id,intro_asset_id,duration_minutes,is_preview,available_after_days,
          required_watch_percent,transcript,position,updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      ).bind(
        id,
        body.courseId,
        lesson.sectionId,
        lesson.title.trim().slice(0, 160),
        lessonType,
        (lesson.content || "").slice(0, 100000),
        "markdown",
        externalMedia,
        primaryAssetId,
        introAssetId,
        Math.max(0, Math.min(1440, Number(lesson.durationMinutes || 0))),
        lesson.isPreview ? 1 : 0,
        Math.max(0, Math.min(3650, Math.round(Number(lesson.availableAfterDays || 0)))),
        Math.max(0, Math.min(100, Math.round(Number(lesson.requiredWatchPercent || 0)))),
        (lesson.transcript || "").slice(0, 100_000),
        Math.max(0, Number(lesson.position || 0)),
        now,
      );

  await env.DB.batch([
    lessonStatement,
    env.DB.prepare("DELETE FROM lesson_resources WHERE lesson_id=?").bind(id),
    ...resourceAssets.map((asset, index) =>
      env.DB.prepare(
        "INSERT INTO lesson_resources (id,lesson_id,asset_id,title,position) VALUES (?,?,?,?,?)",
      ).bind(crypto.randomUUID(), id, asset.id, asset.filename, index)
    ),
    env.DB.prepare("UPDATE courses SET updated_at=? WHERE id=?").bind(now, body.courseId),
  ]);
  return Response.json({ id, saved: true, updatedAt: now }, { status: existing ? 200 : 201 });
}

export async function DELETE(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const courseId = url.searchParams.get("courseId") || "";
  const lessonId = url.searchParams.get("lessonId") || "";
  if (!courseId || !lessonId || !await requireCourseStaffAccess(user.id, courseId)) {
    return Response.json({ error: "Course not found." }, { status: 404 });
  }
  const lesson = await env.DB.prepare(
    "SELECT id FROM lessons WHERE id=? AND course_id=?",
  ).bind(lessonId, courseId).first();
  if (!lesson) return Response.json({ error: "Lesson not found." }, { status: 404 });
  await env.DB.batch([
    env.DB.prepare(
      "DELETE FROM quiz_attempts WHERE quiz_id IN (SELECT id FROM quizzes WHERE lesson_id=?)",
    ).bind(lessonId),
    env.DB.prepare(
      "DELETE FROM quiz_questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE lesson_id=?)",
    ).bind(lessonId),
    env.DB.prepare("DELETE FROM quizzes WHERE lesson_id=?").bind(lessonId),
    env.DB.prepare("DELETE FROM lesson_progress WHERE lesson_id=?").bind(lessonId),
    env.DB.prepare("DELETE FROM media_playback_grants WHERE lesson_id=?").bind(lessonId),
    env.DB.prepare("DELETE FROM lesson_resources WHERE lesson_id=?").bind(lessonId),
    env.DB.prepare("DELETE FROM lessons WHERE id=? AND course_id=?").bind(lessonId, courseId),
    env.DB.prepare("UPDATE courses SET updated_at=? WHERE id=?").bind(Date.now(), courseId),
  ]);
  return Response.json({ deleted: true });
}
