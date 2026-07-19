import { createClient } from "@supabase/supabase-js";
import { env } from "cloudflare:workers";

export async function requireApiUser(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!token || !url || !key) return null;
  const { data, error } = await createClient(url, key, { auth: { persistSession: false } }).auth.getUser(token);
  if (error || !data.user) return null;
  const profile = await env.DB.prepare(
    "SELECT status FROM profiles WHERE id=?",
  ).bind(data.user.id).first<{ status: string }>();
  return profile?.status === "suspended" ? null : data.user;
}
