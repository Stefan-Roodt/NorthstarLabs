import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../lib/server-auth";
import { requireCourseStaffAccess } from "../../../../lib/school-access";
import { writeAuditLog } from "../../../../lib/audit-log";
import { deleteCourseSafely } from "../../../../lib/course-deletion";
import { getCourseReadiness } from "../../../../lib/course-readiness";

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
  explanation: string | null;
  conceptLabel: string | null;
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

type LessonReadinessCourseRow = {
  id: string;
  sectionId: string;
  title: string;
  lessonType: string;
  content: string;
  contentFormat: string | null;
  videoKey: string | null;
  primaryAssetId: string | null;
  introAssetId: string | null;
  durationMinutes: number;
  isPreview: number;
  availableAfterDays: number;
  requiredWatchPercent: number;
  transcript: string | null;
  position: number;
  updatedAt: number;
  primaryFilename: string | null;
  primaryContentType: string | null;
  primarySizeBytes: number | null;
  primaryKind: string | null;
  primaryAltText: string | null;
  primaryCreatedAt: number | null;
  primaryUpdatedAt: number | null;
  introFilename: string | null;
  introContentType: string | null;
  introSizeBytes: number | null;
  introKind: string | null;
  introAltText: string | null;
  introCreatedAt: number | null;
  introUpdatedAt: number | null;
};

type CourseReadinessSummary = {
  score: number;
  label: string;
  issues: ReturnType<typeof getCourseReadiness>["issues"];
  blockers: ReturnType<typeof getCourseReadiness>["blockers"];
  improvements: ReturnType<typeof getCourseReadiness>["improvements"];
  lessonIssueCounts: ReturnType<typeof getCourseReadiness>["lessonIssueCounts"];
  earnedPoints: number;
  totalPoints: number;
};

type CourseReadinessPayload = {
  pendingSourceFiles?: number;
  sections: Array<{
    id: string;
    title: string;
    position: number;
    createdAt: number | null;
  }>;
  lessons: Array<{
    id: string;
    sectionId: string;
    title: string;
    lessonType: string;
    content: string;
    videoKey?: string | null;
    primaryAssetId?: string | null;
    primaryAsset?: {
      id: string;
      filename: string | null;
      contentType: string | null;
      sizeBytes: number | null;
      kind: string | null;
      altText: string | null;
      createdAt: number | null;
      updatedAt: number | null;
    } | null;
    introAsset?: {
      id: string;
      filename: string | null;
      contentType: string | null;
      sizeBytes: number | null;
      kind: string | null;
      altText: string | null;
      createdAt: number | null;
      updatedAt: number | null;
    } | null;
    durationMinutes: number;
    transcript: string;
    resources: {
      id: string;
      lessonId: string;
      assetId: string;
      title: string;
      position: number;
      filename: string;
      contentType: string;
      sizeBytes: number;
      kind: string;
    }[];
    quiz: {
      id: string;
      title: string;
      passingScore: number;
      maxAttempts: number;
      questions: Array<{
        id: string;
        prompt: string;
        options: string[];
        correctIndex: number;
        explanation: string;
        conceptLabel: string;
      }>;
    } | null;
  }>;
};

const parseQuizOptions = (optionsJson: string | null): string[] => {
  if (!optionsJson) return [];
  try {
    const parsed = JSON.parse(optionsJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((option): option is string => typeof option === "string");
  } catch {
    return [];
  }
};

type CourseReadinessPayloadWithMedia = CourseReadinessPayload & {
  media: Array<Record<string, unknown>>;
};

type CourseReadinessMessage = {
  error?: string;
  errors?: string[];
  readiness?: CourseReadinessSummary;
};

type PendingImport = {
  projectId: string;
  projectTitle: string;
  remaining: number;
};

async function pendingImportForCourse(courseId: string, schoolId: string): Promise<PendingImport | null> {
  const projects = await env.DB.prepare(
    `SELECT id,title,result_json AS resultJson
     FROM course_import_projects
     WHERE school_id=? AND status='awaiting_files'
     ORDER BY updated_at DESC`,
  ).bind(schoolId).all<{ id: string; title: string; resultJson: string }>();
  for (const project of projects.results) {
    try {
      const result = JSON.parse(project.resultJson || "{}") as {
        courses?: Array<{ id?: string }>;
        documents?: Array<{ courseId?: string; attached?: boolean }>;
      };
      if (!result.courses?.some((course) => course.id === courseId)) continue;
      const remaining = result.documents?.filter((document) =>
        document.courseId === courseId && document.attached !== true
      ).length || 0;
      if (remaining > 0) {
        return { projectId: project.id, projectTitle: project.title, remaining };
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function loadCourseLessonData(
  courseId: string,
  schoolId: string,
): Promise<CourseReadinessPayloadWithMedia> {
  const [sectionRows, lessonRows, quizRows, resourceRows, mediaRows] = await Promise.all([
    env.DB.prepare(
      `SELECT id,title,position,created_at AS createdAt
       FROM course_sections WHERE course_id=? ORDER BY position,id`,
    ).bind(courseId).all(),
    env.DB.prepare(
      `SELECT l.id,l.section_id AS sectionId,l.title,l.lesson_type AS lessonType,
        l.content,l.content_format AS contentFormat,l.video_key AS videoKey,
        l.primary_asset_id AS primaryAssetId,l.intro_asset_id AS introAssetId,
        l.duration_minutes AS durationMinutes,
        l.is_preview AS isPreview,l.available_after_days AS availableAfterDays,
        l.required_watch_percent AS requiredWatchPercent,l.transcript,
        l.position,l.updated_at AS updatedAt,
        ma.filename AS primaryFilename,ma.content_type AS primaryContentType,
        ma.size_bytes AS primarySizeBytes,ma.kind AS primaryKind,
        ma.alt_text AS primaryAltText,ma.created_at AS primaryCreatedAt,
        ma.updated_at AS primaryUpdatedAt,
        ima.filename AS introFilename,ima.content_type AS introContentType,
        ima.size_bytes AS introSizeBytes,ima.kind AS introKind,
        ima.alt_text AS introAltText,ima.created_at AS introCreatedAt,
        ima.updated_at AS introUpdatedAt
       FROM lessons l
       LEFT JOIN course_sections cs ON cs.id=l.section_id
       LEFT JOIN media_assets ma ON ma.id=l.primary_asset_id
       LEFT JOIN media_assets ima ON ima.id=l.intro_asset_id
       WHERE l.course_id=?
       ORDER BY COALESCE(cs.position,0),l.position,l.id`,
    ).bind(courseId).all<LessonReadinessCourseRow>(),
    env.DB.prepare(
      `SELECT q.id,q.lesson_id AS lessonId,q.title,q.passing_score AS passingScore,
        q.max_attempts AS maxAttempts,
        qq.id AS questionId,qq.prompt,qq.options_json AS optionsJson,
        qq.correct_index AS correctIndex,qq.explanation,
        qq.concept_label AS conceptLabel,qq.position
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
    ).bind(schoolId).all(),
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
      explanation: string;
      conceptLabel: string;
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
    if (row.questionId && row.prompt) {
      const options = parseQuizOptions(row.optionsJson);
      if (options.length === 0) continue;
      quizzes.get(row.lessonId)!.questions.push({
        id: row.questionId,
        prompt: row.prompt,
        options,
        correctIndex: Number(row.correctIndex || 0),
        explanation: row.explanation || "",
        conceptLabel: row.conceptLabel || "",
      });
    }
  }

  const resources = new Map<string, ResourceRow[]>();
  for (const row of resourceRows.results) {
    resources.set(row.lessonId, [...(resources.get(row.lessonId) || []), row]);
  }

  return {
    sections: sectionRows.results,
    lessons: lessonRows.results.map((lesson) => {
      const row = lesson as LessonReadinessCourseRow;
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
      const introAsset = row.introAssetId
        ? {
            id: row.introAssetId,
            filename: row.introFilename,
            contentType: row.introContentType,
            sizeBytes: row.introSizeBytes,
            kind: row.introKind,
            altText: row.introAltText,
            createdAt: row.introCreatedAt,
            updatedAt: row.introUpdatedAt,
          }
        : null;
      return {
        ...row,
        primaryAsset,
        introAsset,
        content: row.content || "",
        transcript: row.transcript || "",
        videoKey: row.videoKey || null,
        durationMinutes: Number(row.durationMinutes || 0),
        resources: resources.get(row.id) || [],
        quiz: quizzes.get(row.id) || null,
      };
    }),
    media: mediaRows.results,
  };
}

function toReadinessPayload(course: {
  title: string | null;
  description: string | null;
  certificateTitle: string | null;
  pendingSourceFiles?: number;
  sections: CourseReadinessPayload["sections"];
  lessons: CourseReadinessPayload["lessons"];
}) {
  return getCourseReadiness({
    title: String(course.title || ""),
    description: String(course.description || ""),
    certificateTitle: String(course.certificateTitle || ""),
    pendingSourceFiles: course.pendingSourceFiles,
    sections: course.sections.map((section) => ({
      id: section.id,
      title: section.title,
    })),
    lessons: course.lessons.map((lesson) => ({
      id: lesson.id,
      sectionId: lesson.sectionId,
      title: lesson.title,
      lessonType: lesson.lessonType,
      content: lesson.content,
      videoKey: lesson.videoKey || undefined,
      primaryAssetId: lesson.primaryAssetId,
      primaryAsset: lesson.primaryAsset
        ? {
            id: lesson.primaryAsset.id,
            filename: lesson.primaryAsset.filename,
            contentType: lesson.primaryAsset.contentType,
            sizeBytes: lesson.primaryAsset.sizeBytes,
            kind: lesson.primaryAsset.kind || "",
            altText: lesson.primaryAsset.altText,
            createdAt: lesson.primaryAsset.createdAt,
            updatedAt: lesson.primaryAsset.updatedAt,
          }
        : null,
      durationMinutes: lesson.durationMinutes,
      transcript: lesson.transcript,
      resources: lesson.resources,
      quiz: lesson.quiz,
    })),
  });
}

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
      truth_outcome AS truthOutcome,truth_audience AS truthAudience,
      truth_not_for AS truthNotFor,truth_prerequisites AS truthPrerequisites,
      truth_evidence AS truthEvidence,truth_source_standard AS truthSourceStandard,
      truth_level AS truthLevel,truth_delivery AS truthDelivery,
      truth_reviewed_at AS truthReviewedAt,
      available_from AS availableFrom,certificate_title AS certificateTitle,
      certificate_accent AS certificateAccent,
      certificate_valid_days AS certificateValidDays,updated_at AS updatedAt
     FROM courses WHERE id=?`,
    ).bind(courseId).first<{ schoolId: string }>();
  if (!course) return Response.json({ error: "Course not found" }, { status: 404 });
  const [{ media, sections, lessons }, pendingImport] = await Promise.all([
    loadCourseLessonData(courseId, course.schoolId),
    pendingImportForCourse(courseId, course.schoolId),
  ]);

  return Response.json({
    ...course,
    pendingSourceFiles: pendingImport?.remaining || 0,
    importProjectId: pendingImport?.projectId || null,
    importProjectTitle: pendingImport?.projectTitle || null,
    sections,
    media,
    lessons,
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
    truthOutcome?: string;
    truthAudience?: string;
    truthNotFor?: string;
    truthPrerequisites?: string;
    truthEvidence?: string;
    truthSourceStandard?: string;
    truthLevel?: string;
    truthDelivery?: string;
    truthReviewedAt?: number | null;
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
  const truthReviewedProvided = body.truthReviewedAt !== undefined;
  const truthReviewedAt = typeof body.truthReviewedAt === "number" &&
    Number.isFinite(body.truthReviewedAt) && body.truthReviewedAt > 0
    ? Math.round(body.truthReviewedAt)
    : null;

  const courseRecord = await env.DB.prepare(
    `SELECT title,description,certificate_title AS certificateTitle
       FROM courses WHERE id=?`,
  ).bind(courseId).first<{
    title: string;
    description: string;
    certificateTitle: string | null;
  }>();
  if (!courseRecord) return Response.json({ error: "Course not found" }, { status: 404 });

  if (status === "published") {
    const [courseDetails, pendingImport] = await Promise.all([
      loadCourseLessonData(courseId, existing.schoolId),
      pendingImportForCourse(courseId, existing.schoolId),
    ]);
    const readinessIssues = toReadinessPayload({
      title: title ?? courseRecord?.title ?? "",
      description: description ?? courseRecord?.description ?? "",
      certificateTitle: certificateTitle || courseRecord?.certificateTitle || "",
      pendingSourceFiles: pendingImport?.remaining || 0,
      sections: courseDetails.sections,
      lessons: courseDetails.lessons,
    });
    const blockers = readinessIssues.blockers;
    if (blockers.length) {
      const errors = blockers.map((issue) => `${issue.title}: ${issue.action}`);
      const response: CourseReadinessMessage = {
        error: "Complete the publishing checklist first.",
        errors,
        readiness: readinessIssues,
      };
      return Response.json(response, { status: 422 });
    }
  }

  await env.DB.prepare(
    `UPDATE courses SET title=COALESCE(?,title),description=COALESCE(?,description),
      status=?,price_cents=COALESCE(?,price_cents),
      truth_outcome=COALESCE(?,truth_outcome),
      truth_audience=COALESCE(?,truth_audience),
      truth_not_for=COALESCE(?,truth_not_for),
      truth_prerequisites=COALESCE(?,truth_prerequisites),
      truth_evidence=COALESCE(?,truth_evidence),
      truth_source_standard=COALESCE(?,truth_source_standard),
      truth_level=COALESCE(?,truth_level),
      truth_delivery=COALESCE(?,truth_delivery),
      truth_reviewed_at=CASE WHEN ?=1 THEN ? ELSE truth_reviewed_at END,
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
    body.truthOutcome === undefined ? null : body.truthOutcome.trim().slice(0, 1000),
    body.truthAudience === undefined ? null : body.truthAudience.trim().slice(0, 1200),
    body.truthNotFor === undefined ? null : body.truthNotFor.trim().slice(0, 1200),
    body.truthPrerequisites === undefined ? null : body.truthPrerequisites.trim().slice(0, 1200),
    body.truthEvidence === undefined ? null : body.truthEvidence.trim().slice(0, 1200),
    body.truthSourceStandard === undefined ? null : body.truthSourceStandard.trim().slice(0, 1200),
    body.truthLevel === undefined ? null : body.truthLevel.trim().slice(0, 120),
    body.truthDelivery === undefined ? null : body.truthDelivery.trim().slice(0, 160),
    truthReviewedProvided ? 1 : 0,
    truthReviewedAt,
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
  await writeAuditLog({
    actorId: user.id,
    schoolId: existing.schoolId,
    action: status === "published" ? "course.publish" : "course.update",
    targetType: "course",
    targetId: courseId,
    detail: { status, title: title || undefined },
  });
  return Response.json({ saved: true, status });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ courseId: string }> },
) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await context.params;
  const access = await requireCourseStaffAccess(user.id, courseId);
  if (!access) return Response.json({ error: "Course not found" }, { status: 404 });
  if (!["owner", "admin"].includes(access.memberRole)) {
    return Response.json(
      { error: "Only an academy owner or administrator can delete a course." },
      { status: 403 },
    );
  }
  const confirmation = request.headers.get("x-delete-confirmation");
  if (confirmation !== courseId) {
    return Response.json(
      { error: "Course deletion confirmation is required." },
      { status: 400 },
    );
  }
  return Response.json(await deleteCourseSafely({
    courseId,
    schoolId: access.schoolId,
    actorId: user.id,
  }));
}
