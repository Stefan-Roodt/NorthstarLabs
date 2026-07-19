import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../lib/server-auth";
import { updateCourseProgress } from "../../../lib/course-progress";
import { getLessonGate } from "../../../lib/learner-controls";
export async function POST(request:Request){
  const user=await requireApiUser(request);
  if(!user)return Response.json({error:"Unauthorized"},{status:401});
  const {lessonId,completed}=await request.json() as {lessonId?:string;completed?:boolean};
  if(!lessonId)return Response.json({error:"Lesson required"},{status:400});
  const gate=await getLessonGate(env.DB,user.id,lessonId);
  if(!gate)return Response.json({error:"Lesson not found or not enrolled"},{status:403});
  if(completed&&gate.locked&&!gate.isStaff){
    return Response.json({error:gate.lockReason||"This lesson is locked."},{status:409});
  }
  if(completed&&gate.requiredWatchPercent>gate.watchedPercent&&!gate.isStaff){
    return Response.json({
      error:`Watch at least ${gate.requiredWatchPercent}% of the lesson video before completing it.`,
      watchedPercent:gate.watchedPercent,
      requiredWatchPercent:gate.requiredWatchPercent,
    },{status:409});
  }
  const quiz=await env.DB.prepare("SELECT id FROM quizzes WHERE lesson_id=?").bind(lessonId).first();
  if(quiz&&completed)return Response.json({error:"Pass the lesson quiz to complete this lesson."},{status:409});
  const id=`${user.id}:${lessonId}`;
  await env.DB.prepare("INSERT INTO lesson_progress (id,user_id,lesson_id,completed,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET completed=excluded.completed,updated_at=excluded.updated_at")
    .bind(id,user.id,lessonId,completed?1:0,Date.now()).run();
  const result=await updateCourseProgress(env.DB,user.id,gate.courseId);
  return Response.json({saved:true,...result});
}
