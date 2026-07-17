import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../lib/server-auth";
export async function POST(request:Request){
  const user=await requireApiUser(request);
  if(!user)return Response.json({error:"Unauthorized"},{status:401});
  const body=await request.json() as {courseId?:string;lesson?:{id?:string;title?:string;content?:string;videoKey?:string;position?:number}};
  if(!body.courseId||!body.lesson?.title?.trim())return Response.json({error:"Invalid lesson"},{status:400});
  const owner=await env.DB.prepare("SELECT id FROM courses WHERE id=? AND owner_id=?").bind(body.courseId,user.id).first();
  if(!owner)return Response.json({error:"Course not found"},{status:404});
  const id=body.lesson.id||crypto.randomUUID();
  if(body.lesson.id){
    const existing=await env.DB.prepare(
      `SELECT l.id FROM lessons l JOIN courses c ON c.id=l.course_id
       WHERE l.id=? AND l.course_id=? AND c.owner_id=?`
    ).bind(id,body.courseId,user.id).first();
    if(!existing)return Response.json({error:"Lesson not found"},{status:404});
    await env.DB.prepare("UPDATE lessons SET title=?,content=?,video_key=?,position=? WHERE id=? AND course_id=?")
      .bind(body.lesson.title.trim(),body.lesson.content||"",body.lesson.videoKey||null,body.lesson.position||0,id,body.courseId).run();
  }else{
    await env.DB.prepare("INSERT INTO lessons (id,course_id,title,content,video_key,position) VALUES (?,?,?,?,?,?)")
      .bind(id,body.courseId,body.lesson.title.trim(),body.lesson.content||"",body.lesson.videoKey||null,body.lesson.position||0).run();
  }
  return Response.json({id});
}
