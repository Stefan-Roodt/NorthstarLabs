import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../lib/server-auth";

export async function GET(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await context.params;
  const course = await env.DB.prepare(
    "SELECT id,title,description,status,price_cents AS priceCents FROM courses WHERE id=? AND owner_id=?"
  ).bind(courseId, user.id).first();
  if (!course) return Response.json({ error: "Course not found" }, { status: 404 });
  const lessons = await env.DB.prepare(
    "SELECT id,title,content,video_key AS videoKey,position FROM lessons WHERE course_id=? ORDER BY position,id"
  ).bind(courseId).all();
  const quizRows = await env.DB.prepare(
    `SELECT q.id,q.lesson_id AS lessonId,q.title,q.passing_score AS passingScore,
      qq.id AS questionId,qq.prompt,qq.options_json AS optionsJson,
      qq.correct_index AS correctIndex,qq.position
     FROM quizzes q
     JOIN lessons l ON l.id=q.lesson_id
     LEFT JOIN quiz_questions qq ON qq.quiz_id=q.id
     WHERE l.course_id=?
     ORDER BY q.id,qq.position,qq.id`
  ).bind(courseId).all<{
    id:string;lessonId:string;title:string;passingScore:number;
    questionId:string|null;prompt:string|null;optionsJson:string|null;
    correctIndex:number|null;position:number|null;
  }>();
  const quizzes = new Map<string,{id:string;title:string;passingScore:number;questions:Array<{id:string;prompt:string;options:string[];correctIndex:number}>}>();
  for(const row of quizRows.results){
    if(!quizzes.has(row.lessonId))quizzes.set(row.lessonId,{id:row.id,title:row.title,passingScore:row.passingScore,questions:[]});
    if(row.questionId&&row.prompt&&row.optionsJson){
      quizzes.get(row.lessonId)!.questions.push({
        id:row.questionId,prompt:row.prompt,options:JSON.parse(row.optionsJson),correctIndex:Number(row.correctIndex||0)
      });
    }
  }
  return Response.json({
    ...course,
    lessons: lessons.results.map((lesson)=>({
      ...lesson,
      quiz:quizzes.get(String(lesson.id))||null
    }))
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await context.params;
  const body = await request.json() as { title?: string; description?: string; status?: string; priceCents?: number };
  const existing = await env.DB.prepare("SELECT id FROM courses WHERE id=? AND owner_id=?").bind(courseId, user.id).first();
  if (!existing) return Response.json({ error: "Course not found" }, { status: 404 });
  const status = body.status === "published" ? "published" : "draft";
  await env.DB.prepare(
    "UPDATE courses SET title=COALESCE(?,title),description=COALESCE(?,description),status=?,price_cents=COALESCE(?,price_cents),updated_at=? WHERE id=?"
  ).bind(body.title?.trim() || null, body.description ?? null, status, Number.isFinite(body.priceCents) ? body.priceCents : null, Date.now(), courseId).run();
  return Response.json({ saved: true, status });
}
