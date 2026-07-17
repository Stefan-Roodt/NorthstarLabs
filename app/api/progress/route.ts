import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../lib/server-auth";
import { updateCourseProgress } from "../../../lib/course-progress";
export async function POST(request:Request){
  const user=await requireApiUser(request);
  if(!user)return Response.json({error:"Unauthorized"},{status:401});
  const {lessonId,completed}=await request.json() as {lessonId?:string;completed?:boolean};
  if(!lessonId)return Response.json({error:"Lesson required"},{status:400});
  const lesson=await env.DB.prepare("SELECT course_id AS courseId FROM lessons WHERE id=?").bind(lessonId).first<{courseId:string}>();
  if(!lesson)return Response.json({error:"Lesson not found"},{status:404});
  const enrollment=await env.DB.prepare("SELECT id FROM enrollments WHERE user_id=? AND course_id=? AND status='active'").bind(user.id,lesson.courseId).first();
  const owner=await env.DB.prepare("SELECT id FROM courses WHERE id=? AND owner_id=?").bind(lesson.courseId,user.id).first();
  if(!enrollment&&!owner)return Response.json({error:"Not enrolled"},{status:403});
  const quiz=await env.DB.prepare("SELECT id FROM quizzes WHERE lesson_id=?").bind(lessonId).first();
  if(quiz&&completed)return Response.json({error:"Pass the lesson quiz to complete this lesson."},{status:409});
  const id=`${user.id}:${lessonId}`;
  await env.DB.prepare("INSERT INTO lesson_progress (id,user_id,lesson_id,completed,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET completed=excluded.completed,updated_at=excluded.updated_at")
    .bind(id,user.id,lessonId,completed?1:0,Date.now()).run();
  const result=await updateCourseProgress(env.DB,user.id,lesson.courseId);
  return Response.json({saved:true,...result});
}
