import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../lib/server-auth";

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const displayName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
    user.email.split("@")[0];
  await env.DB.prepare(
    `INSERT INTO profiles (id, email, display_name, role, created_at)
     VALUES (?, ?, ?, 'creator', ?)
     ON CONFLICT(id) DO UPDATE SET email = excluded.email`
  ).bind(user.id, user.email, displayName, Date.now()).run();
  const profile = await env.DB.prepare(
    "SELECT id, email, display_name AS displayName, role, created_at AS createdAt FROM profiles WHERE id = ?"
  ).bind(user.id).first();
  return Response.json(profile);
}

export async function PATCH(request: Request) {
  const user = await requireApiUser(request);
  if (!user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { displayName } = await request.json() as { displayName?: string };
  const cleanName = displayName?.trim() || "";
  if (cleanName.length < 2 || cleanName.length > 80) {
    return Response.json({ error: "Display name must be between 2 and 80 characters." }, { status: 400 });
  }
  await env.DB.prepare(
    `INSERT INTO profiles (id,email,display_name,role,created_at)
     VALUES (?,?,?,'creator',?)
     ON CONFLICT(id) DO UPDATE SET email=excluded.email,display_name=excluded.display_name`
  ).bind(user.id, user.email, cleanName, Date.now()).run();
  return Response.json({ saved: true, displayName: cleanName });
}
