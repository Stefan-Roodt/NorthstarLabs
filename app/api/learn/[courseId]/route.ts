import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../lib/server-auth";

export async function GET(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await context.params;
  const access = await env.DB.prepare(
    `SELECT c.id,c.title,c.description,c.owner_id AS ownerId
     FROM courses c LEFT JOIN enrollments e ON e.course_id=c.id AND e.user_id=? AND e.status='active'
     WHERE c.id=? AND (c.owner_id=? OR e.id IS NOT NULL)`
  ).bind(user.id,courseId,user.id).first();
  if (!access) return Response.json({ error: "You are not enrolled in this course." }, { status: 403 });
  const lessons = await env.DB.prepare(
    `SELECT l.id,l.title,l.content,l.video_key AS videoKey,l.position,
      COALESCE(lp.completed,0) AS completed
     FROM lessons l LEFT JOIN lesson_progress lp ON lp.lesson_id=l.id AND lp.user_id=?
     WHERE l.course_id=? ORDER BY l.position,l.id`
  ).bind(user.id,courseId).all();
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
  return Response.json({
    course: access,
    lessons: lessons.results.map((lesson)=>({
      ...lesson,
      quiz:quizzes.get(String(lesson.id))||null
    })),
    certificate
  });
}
