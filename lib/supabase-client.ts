import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
export function getSupabaseBrowser() {
  const runtime = typeof window !== "undefined" ? (window as typeof window & { __NORTHSTAR_CONFIG__?: { supabaseUrl?: string; supabaseKey?: string } }).__NORTHSTAR_CONFIG__ : undefined;
  const url = runtime?.supabaseUrl;
  const key = runtime?.supabaseKey;
  if (!url || !key) return null;
  client ??= createClient(url, key, { auth: { persistSession: true, detectSessionInUrl: true } });
  return client;
}
