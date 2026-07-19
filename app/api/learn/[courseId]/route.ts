import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../lib/server-auth";

export async function GET(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await context.params;
  const access = await env.DB.prepare(
    `SELECT c.id,c.title,c.description,c.status,c.owner_id AS ownerId
     FROM courses c LEFT JOIN enrollments e ON e.course_id=c.id AND e.user_id=? AND e.status='active'
     LEFT JOIN school_members sm ON sm.school_id=c.school_id AND sm.user_id=?
       AND sm.status='active' AND sm.role IN ('owner','admin','instructor')
     WHERE c.id=? AND (sm.id IS NOT NULL OR e.id IS NOT NULL)`
  ).bind(user.id,user.id,courseId).first();
  if (!access) return Response.json({ error: "You are not enrolled in this course." }, { status: 403 });
  const sections = await env.DB.prepare(
    `SELECT id,title,position FROM course_sections
     WHERE course_id=? ORDER BY position,id`,
  ).bind(courseId).all();
  const lessons = await env.DB.prepare(
    `SELECT l.id,l.section_id AS sectionId,l.title,l.lesson_type AS lessonType,
      l.content,l.content_format AS contentFormat,l.video_key AS videoKey,
      l.primary_asset_id AS primaryAssetId,l.duration_minutes AS durationMinutes,
      l.is_preview AS isPreview,l.position,COALESCE(lp.completed,0) AS completed,
      ma.key AS primaryKey,ma.filename AS primaryFilename,
      ma.content_type AS primaryContentType,ma.kind AS primaryKind,
      ma.alt_text AS primaryAltText
     FROM lessons l
     LEFT JOIN course_sections cs ON cs.id=l.section_id
     LEFT JOIN lesson_progress lp ON lp.lesson_id=l.id AND lp.user_id=?
     LEFT JOIN media_assets ma ON ma.id=l.primary_asset_id
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
      qq.id AS questionId,qq.prompt,qq.options_json AS optionsJson,qq.position
     FROM quizzes q
     JOIN lessons l ON l.id=q.lesson_id
     LEFT JOIN quiz_questions qq ON qq.quiz_id=q.id
     WHERE l.course_id=?
     ORDER BY q.id,qq.position,qq.id`
  ).bind(courseId).all<{
    id:string;lessonId:string;title:string;passingScore:number;
    questionId:string|null;prompt:string|null;optionsJson:string|null;position:number|null;
  }>();
  const quizzes = new Map<string,{id:string;title:string;passingScore:number;questions:Array<{id:string;prompt:string;options:string[]}>}>();
  for(const row of quizRows.results){
    if(!quizzes.has(row.lessonId))quizzes.set(row.lessonId,{id:row.id,title:row.title,passingScore:row.passingScore,questions:[]});
    if(row.questionId&&row.prompt&&row.optionsJson){
      quizzes.get(row.lessonId)!.questions.push({
        id:row.questionId,prompt:row.prompt,options:JSON.parse(row.optionsJson)
      });
    }
  }
  const certificate = await env.DB.prepare(
    "SELECT code,issued_at AS issuedAt FROM certificates WHERE user_id=? AND course_id=?"
  ).bind(user.id,courseId).first();
  const resources = new Map<string, typeof resourceRows.results>();
  for (const resource of resourceRows.results) {
    resources.set(resource.lessonId, [...(resources.get(resource.lessonId) || []), resource]);
  }
  return Response.json({
    course: access,
    sections: sections.results,
    lessons: lessons.results.map((lesson)=>({
      ...lesson,
      primaryAsset: lesson.primaryAssetId ? {
        id: lesson.primaryAssetId,
        key: lesson.primaryKey,
        filename: lesson.primaryFilename,
        contentType: lesson.primaryContentType,
        kind: lesson.primaryKind,
        altText: lesson.primaryAltText,
      } : lesson.videoKey ? {
        id: null,
        key: lesson.videoKey,
        filename: "Lesson video",
        contentType: "video/mp4",
        kind: "video",
        altText: "",
      } : null,
      resources: resources.get(String(lesson.id)) || [],
      quiz:quizzes.get(String(lesson.id))||null
    })),
    certificate
  });
}
