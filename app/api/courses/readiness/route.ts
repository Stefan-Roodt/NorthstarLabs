import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../lib/server-auth";
import { getCourseReadiness } from "../../../../lib/course-readiness";
import { requestedSchoolId, requireCreatorSchool } from "../../../../lib/school-access";

type CourseRow = {
  id: string;
  title: string;
  description: string;
  status: string;
  certificateTitle: string | null;
  schoolId: string;
};

type SectionRow = { id: string; title: string };
type LessonRow = {
  id: string;
  sectionId: string;
  title: string;
  lessonType: string;
  content: string;
  videoKey: string | null;
  primaryAssetId: string | null;
  primaryFilename: string | null;
  primaryKind: string | null;
  primaryAltText: string | null;
  durationMinutes: number;
  transcript: string | null;
};
type QuizQuestionRow = {
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
  lessonId: string;
  id: string;
  assetId: string;
  title: string;
  position: number;
  filename: string;
  contentType: string;
  sizeBytes: number;
  kind: string;
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

async function loadCourseReadiness(course: CourseRow) {
  const [sectionRows, lessonRows, quizRows, resourceRows] = await Promise.all([
    env.DB.prepare(
      `SELECT id,title FROM course_sections WHERE course_id=? ORDER BY position,id`,
    ).bind(course.id).all<SectionRow>(),
    env.DB.prepare(
      `SELECT l.id,l.section_id AS sectionId,l.title,l.lesson_type AS lessonType,
        l.content,l.video_key AS videoKey,l.primary_asset_id AS primaryAssetId,
        l.duration_minutes AS durationMinutes,l.transcript,
        ma.filename AS primaryFilename,ma.kind AS primaryKind,ma.alt_text AS primaryAltText
       FROM lessons l
       LEFT JOIN media_assets ma ON ma.id=l.primary_asset_id
       WHERE l.course_id=?
       ORDER BY l.section_id,l.position,l.id`,
    ).bind(course.id).all<LessonRow>(),
    env.DB.prepare(
      `SELECT q.id,q.lesson_id AS lessonId,q.title,q.passing_score AS passingScore,
        q.max_attempts AS maxAttempts,
        qq.id AS questionId,qq.prompt,qq.options_json AS optionsJson,
        qq.correct_index AS correctIndex,qq.explanation,qq.concept_label AS conceptLabel
       FROM quizzes q
       JOIN lessons l ON l.id=q.lesson_id
       LEFT JOIN quiz_questions qq ON qq.quiz_id=q.id
       WHERE l.course_id=?
       ORDER BY q.id,qq.position,qq.id`,
    ).bind(course.id).all<QuizQuestionRow>(),
    env.DB.prepare(
      `SELECT lr.lesson_id AS lessonId,lr.id,lr.asset_id AS assetId,lr.title,lr.position,
        ma.filename,ma.content_type AS contentType,ma.size_bytes AS sizeBytes,ma.kind
       FROM lesson_resources lr
       JOIN lessons l ON l.id=lr.lesson_id
       JOIN media_assets ma ON ma.id=lr.asset_id
       WHERE l.course_id=?
       ORDER BY lr.lesson_id,lr.position,lr.id`,
    ).bind(course.id).all<ResourceRow>(),
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
    const bucket = resources.get(row.lessonId) || [];
    bucket.push(row);
    resources.set(row.lessonId, bucket);
  }

  const readiness = getCourseReadiness({
    title: course.title,
    description: course.description,
    certificateTitle: course.certificateTitle || "",
    sections: sectionRows.results.map((section) => ({ id: section.id, title: section.title })),
    lessons: lessonRows.results.map((lesson) => ({
      id: lesson.id,
      sectionId: lesson.sectionId,
      title: lesson.title,
      lessonType: lesson.lessonType,
      content: lesson.content,
      videoKey: lesson.videoKey,
      primaryAssetId: lesson.primaryAssetId,
      primaryAsset: lesson.primaryAssetId
        ? {
            id: lesson.primaryAssetId,
            filename: lesson.primaryFilename || "",
            kind: lesson.primaryKind || "",
            altText: lesson.primaryAltText || "",
          }
        : null,
      durationMinutes: lesson.durationMinutes,
      transcript: lesson.transcript || "",
      resources: (resources.get(lesson.id) || []).map((resource) => ({
        id: resource.id,
        lessonId: resource.lessonId,
        assetId: resource.assetId,
        title: resource.title,
        position: resource.position,
        filename: resource.filename,
        contentType: resource.contentType,
        sizeBytes: resource.sizeBytes,
        kind: resource.kind,
      })),
      quiz: quizzes.get(lesson.id) || null,
    })),
  });
  const lessonIssueCounts = Object.entries(readiness.lessonIssueCounts);

  return {
    courseId: course.id,
    courseTitle: course.title,
    status: course.status,
    score: readiness.score,
    label: readiness.label,
    blockerCount: readiness.blockers.length,
    improvementCount: readiness.improvements.length,
    totalPoints: readiness.totalPoints,
    earnedPoints: readiness.earnedPoints,
    blockers: readiness.blockers,
    improvements: readiness.improvements,
    lessonIssueCounts: readiness.lessonIssueCounts,
    issueByLesson: lessonIssueCounts.map(([lessonId, issueCount]) => ({ lessonId, issueCount })),
  };
}

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) {
    return Response.json(
      { error: "Choose the creator path to run course audits.", onboardingRequired: true },
      { status: 403 },
    );
  }
  const rows = await env.DB.prepare(
    `SELECT id,title,description,status,certificate_title AS certificateTitle,school_id AS schoolId
     FROM courses WHERE school_id=? ORDER BY updated_at DESC`,
  ).bind(school.id).all<CourseRow>();

  const audits = await Promise.all(rows.results.map((course) => loadCourseReadiness(course)));
  const blockerCount = audits.reduce((sum, report) => sum + report.blockerCount, 0);

  return Response.json({
    schoolId: school.id,
    totalCourses: audits.length,
    totalBlockers: blockerCount,
    audits,
  });
}
