import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../lib/server-auth";
import { parseLessonExperience } from "../../../../lib/lesson-experience";

function learnerMediaKey(key: unknown) {
  return typeof key === "string" && key.startsWith("r2:") ? "r2:protected" : key;
}

function publicLessonFields(lesson: Record<string, unknown>) {
  const safe = { ...lesson };
  for (const key of [
    "videoKey", "primaryKey", "primaryFilename", "primaryContentType", "primaryKind",
    "primaryAltText", "introKey", "introFilename", "introContentType", "introKind", "introAltText",
    "experienceJson",
  ]) delete safe[key];
  return safe;
}

export async function GET(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const compact = url.searchParams.get("compact") === "1";
  const requestedLessonId = url.searchParams.get("lessonId") || "";
  const { courseId } = await context.params;
  const access = await env.DB.prepare(
    `SELECT c.id,c.title,c.description,c.status,c.owner_id AS ownerId,
      c.school_id AS schoolId,s.name AS schoolName,s.slug AS schoolSlug,
      s.logo_url AS schoolLogoUrl,s.primary_color AS schoolPrimaryColor,
      s.accent_color AS schoolAccentColor,s.show_community AS showCommunity,
      c.enforce_lesson_order AS enforceLessonOrder,
      c.available_from AS availableFrom,e.id AS enrollmentId,
      e.created_at AS enrolledAt,sm.id AS staffId
     FROM courses c JOIN schools s ON s.id=c.school_id
     LEFT JOIN enrollments e ON e.course_id=c.id AND e.user_id=? AND e.status='active'
     LEFT JOIN school_members sm ON sm.school_id=c.school_id AND sm.user_id=?
       AND sm.status='active' AND sm.role IN ('owner','admin','instructor')
     WHERE c.id=? AND (sm.id IS NOT NULL OR e.id IS NOT NULL)`
  ).bind(user.id,user.id,courseId).first<{
    id: string;
    title: string;
    description: string;
    status: string;
    ownerId: string;
    schoolId: string;
    schoolName: string;
    schoolSlug: string;
    schoolLogoUrl: string | null;
    schoolPrimaryColor: string;
    schoolAccentColor: string;
    showCommunity: number;
    enforceLessonOrder: number;
    availableFrom: number | null;
    enrollmentId: string | null;
    enrolledAt: number | null;
    staffId: string | null;
  }>();
  if (!access) return Response.json({ error: "You are not enrolled in this course." }, { status: 403 });
  const sections = await env.DB.prepare(
    `SELECT id,title,position FROM course_sections
     WHERE course_id=? ORDER BY position,id`,
  ).bind(courseId).all();
  const lessons = await env.DB.prepare(
    `SELECT l.id,l.section_id AS sectionId,l.title,l.lesson_type AS lessonType,
      l.content,l.content_format AS contentFormat,l.video_key AS videoKey,
      l.primary_asset_id AS primaryAssetId,l.intro_asset_id AS introAssetId,
      l.duration_minutes AS durationMinutes,
      l.is_preview AS isPreview,l.available_after_days AS availableAfterDays,
      l.required_watch_percent AS requiredWatchPercent,l.transcript,l.position,
      l.experience_json AS experienceJson,
      COALESCE(lp.completed,0) AS completed,
      COALESCE(lp.watched_percent,0) AS watchedPercent,
      COALESCE(lp.notes,'') AS notes,COALESCE(lp.bookmarked,0) AS bookmarked,
      ma.key AS primaryKey,ma.filename AS primaryFilename,
      ma.content_type AS primaryContentType,ma.kind AS primaryKind,
      ma.alt_text AS primaryAltText,
      ima.key AS introKey,ima.filename AS introFilename,
      ima.content_type AS introContentType,ima.kind AS introKind,
      ima.alt_text AS introAltText
     FROM lessons l
     LEFT JOIN course_sections cs ON cs.id=l.section_id
     LEFT JOIN lesson_progress lp ON lp.lesson_id=l.id AND lp.user_id=?
     LEFT JOIN media_assets ma ON ma.id=l.primary_asset_id
     LEFT JOIN media_assets ima ON ima.id=l.intro_asset_id
     WHERE l.course_id=? ORDER BY COALESCE(cs.position,0),l.position,l.id`
  ).bind(user.id,courseId).all();
  const resourceRows = await env.DB.prepare(
    `SELECT lr.id,lr.lesson_id AS lessonId,lr.asset_id AS assetId,lr.title,lr.position,
      ma.key,ma.filename,ma.content_type AS contentType,ma.size_bytes AS sizeBytes,ma.kind
     FROM lesson_resources lr
     JOIN lessons l ON l.id=lr.lesson_id
     JOIN media_assets ma ON ma.id=lr.asset_id
     WHERE l.course_id=? ORDER BY lr.position,lr.id`,
  ).bind(courseId).all<{
    id: string;
    lessonId: string;
    assetId: string;
    title: string;
    position: number;
    key: string;
    filename: string;
    contentType: string;
    sizeBytes: number;
    kind: string;
  }>();
  const quizRows = await env.DB.prepare(
    `SELECT q.id,q.lesson_id AS lessonId,q.title,q.passing_score AS passingScore,
      q.max_attempts AS maxAttempts,
      qq.id AS questionId,qq.prompt,qq.options_json AS optionsJson,qq.position
     FROM quizzes q
     JOIN lessons l ON l.id=q.lesson_id
     LEFT JOIN quiz_questions qq ON qq.quiz_id=q.id
     WHERE l.course_id=?
     ORDER BY q.id,qq.position,qq.id`
  ).bind(courseId).all<{
    id:string;lessonId:string;title:string;passingScore:number;maxAttempts:number;
    questionId:string|null;prompt:string|null;optionsJson:string|null;position:number|null;
  }>();
  const attemptRows = await env.DB.prepare(
    `SELECT qa.quiz_id AS quizId,COUNT(*) AS attemptCount,MAX(qa.score) AS bestScore,
      MAX(CASE WHEN qa.passed=1 THEN 1 ELSE 0 END) AS passed,
      MAX(qa.submitted_at) AS lastAttemptAt
     FROM quiz_attempts qa
     JOIN quizzes q ON q.id=qa.quiz_id
     JOIN lessons l ON l.id=q.lesson_id
     WHERE l.course_id=? AND qa.user_id=?
     GROUP BY qa.quiz_id`,
  ).bind(courseId, user.id).all<{
    quizId:string;attemptCount:number;bestScore:number;passed:number;lastAttemptAt:number;
  }>();
  const attempts = new Map(attemptRows.results.map((row) => [row.quizId, row]));
  const quizzes = new Map<string,{
    id:string;title:string;passingScore:number;maxAttempts:number;
    attemptCount:number;bestScore:number|null;passed:boolean;attemptsRemaining:number|null;
    questions:Array<{id:string;prompt:string;options:string[]}>;
  }>();
  for(const row of quizRows.results){
    if(!quizzes.has(row.lessonId)){
      const stats = attempts.get(row.id);
      const attemptCount = Number(stats?.attemptCount || 0);
      quizzes.set(row.lessonId,{
        id:row.id,
        title:row.title,
        passingScore:row.passingScore,
        maxAttempts:row.maxAttempts,
        attemptCount,
        bestScore:stats ? Number(stats.bestScore || 0) : null,
        passed:Boolean(stats?.passed),
        attemptsRemaining:row.maxAttempts > 0
          ? Math.max(0, row.maxAttempts - attemptCount)
          : null,
        questions:[],
      });
    }
    if(row.questionId&&row.prompt&&row.optionsJson){
      quizzes.get(row.lessonId)!.questions.push({
        id:row.questionId,prompt:row.prompt,options:JSON.parse(row.optionsJson)
      });
    }
  }
  const certificate = await env.DB.prepare(
    `SELECT code,issued_at AS issuedAt,status,expires_at AS expiresAt
     FROM certificates WHERE user_id=? AND course_id=?
     ORDER BY issued_at DESC LIMIT 1`
  ).bind(user.id,courseId).first();
  const resources = new Map<string, typeof resourceRows.results>();
  for (const resource of resourceRows.results) {
    resources.set(resource.lessonId, [...(resources.get(resource.lessonId) || []), resource]);
  }
  const now = Date.now();
  const isStaff = Boolean(access.staffId);
  let hasIncompleteEarlier = false;
  const controlledLessons = lessons.results.map((lesson) => {
    const row = lesson as Record<string, unknown>;
    const dripAvailableAt = access.enrolledAt && Number(row.availableAfterDays || 0) > 0
      ? Number(access.enrolledAt) + Number(row.availableAfterDays) * 86_400_000
      : null;
    const availableAt = Math.max(
      Number(access.availableFrom || 0),
      Number(dripAvailableAt || 0),
    ) || null;
    let lockReason: string | null = null;
    if (!isStaff && availableAt && availableAt > now) {
      lockReason = `Available ${new Date(availableAt).toLocaleDateString("en-ZA")}`;
    } else if (!isStaff && access.enforceLessonOrder && hasIncompleteEarlier) {
      lockReason = "Complete the earlier lessons first";
    }
    const locked = Boolean(lockReason);
    if (!Number(row.completed || 0)) hasIncompleteEarlier = true;
    return { lesson, availableAt, locked, lockReason };
  });

  const requestedLesson = controlledLessons.find(({ lesson, locked }) =>
    String(lesson.id) === requestedLessonId && (!locked || isStaff)
  );
  const startingLesson = controlledLessons.find(({ lesson, locked }) =>
    !locked && !Number((lesson as Record<string, unknown>).completed || 0)
  ) || controlledLessons.find(({ locked }) => !locked);
  const detailLessonId = String((requestedLesson || startingLesson)?.lesson.id || "");

  return Response.json({
    course: access,
    sections: sections.results,
    lessons: controlledLessons.map(({lesson,availableAt,locked,lockReason})=>{
      const includeDetail = !compact || String(lesson.id) === detailLessonId;
      return {
      ...publicLessonFields(lesson as Record<string, unknown>),
      content: includeDetail ? lesson.content : "",
      transcript: includeDetail ? lesson.transcript : "",
      experience: includeDetail ? parseLessonExperience(lesson.experienceJson) : null,
      detailLoaded: includeDetail,
      availableAt,
      locked,
      lockReason,
      primaryAsset: includeDetail && lesson.primaryAssetId ? {
        id: lesson.primaryAssetId,
        key: learnerMediaKey(lesson.primaryKey),
        filename: lesson.primaryFilename,
        contentType: lesson.primaryContentType,
        kind: lesson.primaryKind,
        altText: lesson.primaryAltText,
      } : includeDetail && lesson.videoKey ? {
        id: null,
        key: learnerMediaKey(lesson.videoKey),
        filename: "Lesson video",
        contentType: "video/mp4",
        kind: "video",
        altText: "",
      } : null,
      introAsset: includeDetail && lesson.introAssetId ? {
        id: lesson.introAssetId,
        key: learnerMediaKey(lesson.introKey),
        filename: lesson.introFilename,
        contentType: lesson.introContentType,
        kind: lesson.introKind,
        altText: lesson.introAltText,
      } : null,
      resources: includeDetail ? resources.get(String(lesson.id)) || [] : [],
      quiz:includeDetail ? quizzes.get(String(lesson.id))||null : null
    }}),
    certificate
  });
}
