import { env } from "cloudflare:workers";
import {
  createPlaybackToken,
  hashPlaybackToken,
  PLAYBACK_GRANT_TTL_MS,
} from "../../../../../lib/media-stream";

type PreviewRow = {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  priceCents: number;
  schoolName: string;
  schoolSlug: string;
  lessonId: string;
  lessonTitle: string;
  lessonType: string;
  content: string;
  durationMinutes: number;
  transcript: string;
  primaryAssetId: string | null;
  primaryKey: string | null;
  primaryFilename: string | null;
  primaryContentType: string | null;
  primaryKind: string | null;
  primaryAltText: string | null;
  introAssetId: string | null;
  introKey: string | null;
  introFilename: string | null;
  introContentType: string | null;
  introKind: string | null;
};

type PreviewAsset = {
  id: string | null;
  key: string | null;
  filename: string;
  contentType: string;
  kind: string;
  altText?: string;
};

async function publicMedia(
  row: PreviewRow,
  asset: PreviewAsset | null,
) {
  if (!asset?.key) return null;
  if (/^https?:\/\//.test(asset.key)) return { ...asset, url: asset.key };
  if (!asset.key.startsWith("r2:") && !asset.key.startsWith("static:")) return null;

  const token = createPlaybackToken();
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO media_playback_grants
     (token_hash,user_id,course_id,lesson_id,asset_key,filename,content_type,kind,expires_at,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
  ).bind(
    await hashPlaybackToken(token),
    "public-preview",
    row.courseId,
    row.lessonId,
    asset.key,
    asset.filename,
    asset.contentType,
    asset.kind,
    now + PLAYBACK_GRANT_TTL_MS,
    now,
  ).run();
  return { ...asset, url: `/api/media/stream/${token}` };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await context.params;
  const row = await env.DB.prepare(
    `SELECT c.id AS courseId,c.title AS courseTitle,c.description AS courseDescription,
      c.price_cents AS priceCents,s.name AS schoolName,s.slug AS schoolSlug,
      l.id AS lessonId,l.title AS lessonTitle,l.lesson_type AS lessonType,
      l.content,l.duration_minutes AS durationMinutes,l.transcript,
      l.primary_asset_id AS primaryAssetId,
      COALESCE(ma.key,l.video_key) AS primaryKey,
      COALESCE(ma.filename,'Preview lesson media') AS primaryFilename,
      COALESCE(ma.content_type,'video/mp4') AS primaryContentType,
      COALESCE(ma.kind,CASE WHEN l.video_key IS NULL THEN NULL ELSE 'video' END) AS primaryKind,
      ma.alt_text AS primaryAltText,
      l.intro_asset_id AS introAssetId,ima.key AS introKey,
      ima.filename AS introFilename,ima.content_type AS introContentType,
      ima.kind AS introKind
     FROM courses c
     JOIN schools s ON s.id=c.school_id
     JOIN lessons l ON l.course_id=c.id AND l.is_preview=1
     LEFT JOIN course_sections cs ON cs.id=l.section_id
     LEFT JOIN media_assets ma ON ma.id=l.primary_asset_id
     LEFT JOIN media_assets ima ON ima.id=l.intro_asset_id
     WHERE c.id=? AND c.status='published'
     ORDER BY COALESCE(cs.position,0),l.position,l.id
     LIMIT 1`,
  ).bind(courseId).first<PreviewRow>();

  if (!row) return Response.json({ error: "This course does not have a public preview lesson yet." }, { status: 404 });

  const primaryAsset = row.primaryKey ? await publicMedia(row, {
    id: row.primaryAssetId,
    key: row.primaryKey,
    filename: row.primaryFilename || "Preview lesson media",
    contentType: row.primaryContentType || "video/mp4",
    kind: row.primaryKind || "video",
    altText: row.primaryAltText || "",
  }) : null;
  const introAsset = row.introKey ? await publicMedia(row, {
    id: row.introAssetId,
    key: row.introKey,
    filename: row.introFilename || "Lesson opening",
    contentType: row.introContentType || "video/webm",
    kind: row.introKind || "video",
  }) : null;

  const questions = await env.DB.prepare(
    `SELECT qq.id,qq.prompt,qq.options_json AS optionsJson,
      qq.correct_index AS correctIndex,qq.explanation
     FROM quizzes q JOIN quiz_questions qq ON qq.quiz_id=q.id
     WHERE q.lesson_id=? ORDER BY qq.position,qq.id`,
  ).bind(row.lessonId).all<{
    id: string;
    prompt: string;
    optionsJson: string;
    correctIndex: number;
    explanation: string;
  }>();

  return Response.json({
    course: {
      id: row.courseId,
      title: row.courseTitle,
      description: row.courseDescription,
      priceCents: Number(row.priceCents || 0),
      schoolName: row.schoolName,
      schoolSlug: row.schoolSlug,
    },
    lesson: {
      id: row.lessonId,
      title: row.lessonTitle,
      type: row.lessonType,
      content: row.content,
      durationMinutes: Number(row.durationMinutes || 0),
      transcript: row.transcript,
      primaryAsset,
      introAsset,
      questions: questions.results.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        options: JSON.parse(question.optionsJson) as string[],
        correctIndex: Number(question.correctIndex || 0),
        explanation: question.explanation || "",
      })),
    },
  }, { headers: { "cache-control": "private, no-store" } });
}
