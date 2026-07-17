import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../lib/server-auth";

export async function GET(request:Request){
  const user=await requireApiUser(request);
  if(!user)return Response.json({error:"Unauthorized"},{status:401});
  const rows=await env.DB.prepare(
    `SELECT posts.id,posts.body,posts.created_at AS createdAt,
      COALESCE(profiles.display_name,'NorthstarLabs member') AS author,
      profiles.email AS authorEmail
     FROM posts LEFT JOIN profiles ON profiles.id=posts.author_id
     WHERE posts.community_id='northstar-circle'
     ORDER BY posts.created_at DESC LIMIT 50`
  ).all();
  return Response.json(rows.results);
}

export async function POST(request:Request){
  const user=await requireApiUser(request);
  if(!user)return Response.json({error:"Unauthorized"},{status:401});
  const {body}=await request.json() as {body?:string};
  if(!body?.trim())return Response.json({error:"Post required"},{status:400});
  if(body.trim().length>1500)return Response.json({error:"Post is too long"},{status:400});
  const id=crypto.randomUUID(),createdAt=Date.now();
  await env.DB.prepare("INSERT INTO posts (id,community_id,author_id,body,created_at) VALUES (?,?,?,?,?)")
    .bind(id,"northstar-circle",user.id,body.trim(),createdAt).run();
  const profile=await env.DB.prepare("SELECT display_name AS displayName,email FROM profiles WHERE id=?").bind(user.id).first();
  return Response.json({id,body:body.trim(),createdAt,author:profile?.displayName||"NorthstarLabs member",authorEmail:profile?.email},{status:201});
}
