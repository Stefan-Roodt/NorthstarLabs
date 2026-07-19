import { createClient } from "@supabase/supabase-js";
import { env } from "cloudflare:workers";

export async function requireApiUser(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!token || !url || !key) return null;
  const { data, error } = await createClient(url, key, { auth: { persistSession: false } }).auth.getUser(token);
  if (error || !data.user) return null;
  const access = await env.DB.prepare(
    `SELECT
      (SELECT status FROM profiles WHERE id=?) AS status,
      EXISTS(
        SELECT 1 FROM data_requests
        WHERE user_id=? AND request_type='delete'
          AND status IN ('pending','processing','failed','completed')
      ) AS deletionPending`,
  ).bind(data.user.id, data.user.id).first<{
    status: string | null;
    deletionPending: number;
  }>();
  return access?.status === "suspended" || access?.deletionPending ? null : data.user;
}
