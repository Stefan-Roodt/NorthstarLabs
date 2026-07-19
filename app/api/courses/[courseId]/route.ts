import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../lib/server-auth";
import { requireCourseStaffAccess } from "../../../../lib/school-access";

type QuizRow = {
  id: string;
  lessonId: string;
  title: string;
  passingScore: number;
  maxAttempts: number;
  questionId: string | null;
  prompt: string | null;
  optionsJson: string | null;
  correctIndex: number | null;
  position: number | null;
};

type ResourceRow = {
  id: string;
  lessonId: string;
  assetId: string;
  title: string;
  position: number;
  filename: string;
  contentType: string;
  sizeBytes: number;
  kind: string;
};

export async function GET(
  request: Request,
  context: { params: Promise<{ courseId: string }> },
) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await context.params;
  const access = await requireCourseStaffAccess(user.id, courseId);
  if (!access) return Response.json({ error: "Course not found" }, { status: 404 });
  const course = await env.DB.prepare(
    `SELECT id,school_id AS schoolId,title,description,status,
      price_cents AS priceCents,enforce_lesson_order AS enforceLessonOrder,
      available_from AS availableFrom,certificate_title AS certificateTitle,
      certificate_accent AS certificateAccent,
      certificate_valid_days AS certificateValidDays,updated_at AS updatedAt
     FROM courses WHERE id=?`,
  ).bind(courseId).first<{ schoolId: string }>();
  if (!course) return Response.json({ error: "Course not found" }, { status: 404 });

  const [sectionRows, lessonRows, quizRows, resourceRows, mediaRows] = await Promise.all([
    env.DB.prepare(
      `SELECT id,title,position,created_at AS createdAt
       FROM course_sections WHERE course_id=? ORDER BY position,id`,
    ).bind(courseId).all(),
    env.DB.prepare(
      `SELECT l.id,l.section_id AS sectionId,l.title,l.lesson_type AS lessonType,
        l.content,l.content_format AS contentFormat,l.video_key AS videoKey,
        l.primary_asset_id AS primaryAssetId,l.duration_minutes AS durationMinutes,
        l.is_preview AS isPreview,l.available_after_days AS availableAfterDays,
        l.required_watch_percent AS requiredWatchPercent,l.transcript,
        l.position,l.updated_at AS updatedAt,
        ma.filename AS primaryFilename,ma.content_type AS primaryContentType,
        ma.size_bytes AS primarySizeBytes,ma.kind AS primaryKind,
        ma.alt_text AS primaryAltText,ma.created_at AS primaryCreatedAt,
        ma.updated_at AS primaryUpdatedAt
       FROM lessons l
       LEFT JOIN course_sections cs ON cs.id=l.section_id
       LEFT JOIN media_assets ma ON ma.id=l.primary_asset_id
       WHERE l.course_id=?
       ORDER BY COALESCE(cs.position,0),l.position,l.id`,
    ).bind(courseId).all(),
    env.DB.prepare(
      `SELECT q.id,q.lesson_id AS lessonId,q.title,q.passing_score AS passingScore,
        q.max_attempts AS maxAttempts,
        qq.id AS questionId,qq.prompt,qq.options_json AS optionsJson,
        qq.correct_index AS correctIndex,qq.position
       FROM quizzes q
       JOIN lessons l ON l.id=q.lesson_id
       LEFT JOIN quiz_questions qq ON qq.quiz_id=q.id
       WHERE l.course_id=?
       ORDER BY q.id,qq.position,qq.id`,
    ).bind(courseId).all<QuizRow>(),
    env.DB.prepare(
      `SELECT lr.id,lr.lesson_id AS lessonId,lr.asset_id AS assetId,lr.title,lr.position,
        ma.filename,ma.content_type AS contentType,ma.size_bytes AS sizeBytes,ma.kind
       FROM lesson_resources lr
       JOIN lessons l ON l.id=lr.lesson_id
       JOIN media_assets ma ON ma.id=lr.asset_id
       WHERE l.course_id=?
       ORDER BY lr.position,lr.id`,
    ).bind(courseId).all<ResourceRow>(),
    env.DB.prepare(
      `SELECT id,filename,content_type AS contentType,size_bytes AS sizeBytes,
        kind,alt_text AS altText,created_at AS createdAt,updated_at AS updatedAt
       FROM media_assets WHERE school_id=?
       ORDER BY created_at DESC LIMIT 200`,
    ).bind(course.schoolId).all(),
  ]);

  const quizzes = new Map<string, {
    id: string;
    title: string;
    passingScore: number;
    maxAttempts: number;
    questions: Array<{
      id: string;
      prompt: string;
      options: string[];
      correctIndex: number;
    }>;
  }>();
  for (const row of quizRows.results) {
    if (!quizzes.has(row.lessonId)) {
      quizzes.set(row.lessonId, {
        id: row.id,
        title: row.title,
        passingScore: row.passingScore,
        maxAttempts: row.maxAttempts,
        questions: [],
      });
    }
    if (row.questionId && row.prompt && row.optionsJson) {
      quizzes.get(row.lessonId)!.questions.push({
        id: row.questionId,
        prompt: row.prompt,
        options: JSON.parse(row.optionsJson),
        correctIndex: Number(row.correctIndex || 0),
      });
    }
  }

  const resources = new Map<string, ResourceRow[]>();
  for (const row of resourceRows.results) {
    resources.set(row.lessonId, [...(resources.get(row.lessonId) || []), row]);
  }

  return Response.json({
    ...course,
    sections: sectionRows.results,
    media: mediaRows.results,
    lessons: lessonRows.results.map((lesson) => {
      const row = lesson as Record<string, unknown>;
      const primaryAsset = row.primaryAssetId
        ? {
            id: row.primaryAssetId,
            filename: row.primaryFilename,
            contentType: row.primaryContentType,
            sizeBytes: row.primarySizeBytes,
            kind: row.primaryKind,
            altText: row.primaryAltText,
            createdAt: row.primaryCreatedAt,
            updatedAt: row.primaryUpdatedAt,
          }
        : null;
      return {
        ...lesson,
        primaryAsset,
        resources: resources.get(String(row.id)) || [],
        quiz: quizzes.get(String(row.id)) || null,
      };
    }),
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ courseId: string }> },
) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await context.params;
  const body = await request.json() as {
    title?: string;
    description?: string;
    status?: string;
    priceCents?: number;
    enforceLessonOrder?: boolean;
    availableFrom?: number | null;
    certificateTitle?: string;
    certificateAccent?: string;
    certificateValidDays?: number;
  };
  const existing = await requireCourseStaffAccess(user.id, courseId);
  if (!existing) return Response.json({ error: "Course not found" }, { status: 404 });
  const status = body.status === "published" ? "published" : "draft";
  const title = body.title?.trim();
  const description = body.description?.trim();
  const certificateTitle = body.certificateTitle?.trim().slice(0, 100) || null;
  const certificateAccent = /^#[0-9a-f]{6}$/i.test(body.certificateAccent || "")
    ? body.certificateAccent!
    : null;
  const certificateValidDays = body.certificateValidDays === undefined
    ? null
    : Math.max(0, Math.min(3650, Math.round(Number(body.certificateValidDays || 0))));
  const availableFromProvided = body.availableFrom !== undefined;
  const availableFrom = typeof body.availableFrom === "number" &&
    Number.isFinite(body.availableFrom) && body.availableFrom > 0
    ? Math.round(body.availableFrom)
    : null;

  if (status === "published") {
    const errors: string[] = [];
    const lessonStats = await env.DB.prepare(
      `SELECT COUNT(*) AS total,
        SUM(CASE
          WHEN trim(title)='' OR lower(trim(title))='untitled lesson' THEN 1
          WHEN trim(content)='' AND primary_asset_id IS NULL AND video_key IS NULL
            AND NOT EXISTS (
              SELECT 1 FROM lesson_resources lr WHERE lr.lesson_id=lessons.id
            ) THEN 1
          ELSE 0
        END) AS incomplete
       FROM lessons WHERE course_id=?`,
    ).bind(courseId).first<{ total: number; incomplete: number | null }>();
    const sectionStats = await env.DB.prepare(
      `SELECT COUNT(*) AS total,
        SUM(CASE WHEN trim(title)='' THEN 1 ELSE 0 END) AS incomplete
       FROM course_sections WHERE course_id=?`,
    ).bind(courseId).first<{ total: number; incomplete: number | null }>();
    if ((title || "").length < 3) errors.push("Give the course a clear title.");
    if ((description || "").length < 20) {
      errors.push("Add a course description of at least 20 characters.");
    }
    if (!lessonStats?.total) errors.push("Add at least one lesson.");
    if (!sectionStats?.total || Number(sectionStats.incomplete || 0) > 0) {
      errors.push("Give every curriculum section a title.");
    }
    if (Number(lessonStats?.incomplete || 0) > 0) {
      errors.push("Finish every lesson title and add content or media.");
    }
    if (errors.length) {
      return Response.json(
        { error: "Complete the publishing checklist first.", errors },
        { status: 422 },
      );
    }
  }

  await env.DB.prepare(
    `UPDATE courses SET title=COALESCE(?,title),description=COALESCE(?,description),
      status=?,price_cents=COALESCE(?,price_cents),
      enforce_lesson_order=CASE WHEN ?=1 THEN ? ELSE enforce_lesson_order END,
      available_from=CASE WHEN ?=1 THEN ? ELSE available_from END,
      certificate_title=COALESCE(?,certificate_title),
      certificate_accent=COALESCE(?,certificate_accent),
      certificate_valid_days=COALESCE(?,certificate_valid_days),
      updated_at=? WHERE id=?`,
  ).bind(
    title || null,
    body.description === undefined ? null : description || "",
    status,
    Number.isFinite(body.priceCents) ? body.priceCents : null,
    body.enforceLessonOrder === undefined ? 0 : 1,
    body.enforceLessonOrder ? 1 : 0,
    availableFromProvided ? 1 : 0,
    availableFrom,
    certificateTitle,
    certificateAccent,
    certificateValidDays,
    Date.now(),
    courseId,
  ).run();
  return Response.json({ saved: true, status });
}
