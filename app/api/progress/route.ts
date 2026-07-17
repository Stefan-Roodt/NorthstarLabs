import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../lib/server-auth";
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
  const id=`${user.id}:${lessonId}`;
  await env.DB.prepare("INSERT INTO lesson_progress (id,user_id,lesson_id,completed,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET completed=excluded.completed,updated_at=excluded.updated_at")
    .bind(id,user.id,lessonId,completed?1:0,Date.now()).run();
  const counts=await env.DB.prepare(
    `SELECT COUNT(l.id) AS total,SUM(CASE WHEN lp.completed=1 THEN 1 ELSE 0 END) AS done
     FROM lessons l LEFT JOIN lesson_progress lp ON lp.lesson_id=l.id AND lp.user_id=? WHERE l.course_id=?`
  ).bind(user.id,lesson.courseId).first<{total:number;done:number}>();
  const progress=counts?.total?Math.round((Number(counts.done||0)/Number(counts.total))*100):0;
  if(enrollment)await env.DB.prepare("UPDATE enrollments SET progress=? WHERE user_id=? AND course_id=?").bind(progress,user.id,lesson.courseId).run();
  return Response.json({saved:true,progress});
}
