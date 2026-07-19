import { env } from "cloudflare:workers";
import { requireApiUser } from "./server-auth";

type ApiUser = NonNullable<Awaited<ReturnType<typeof requireApiUser>>>;

function configuredAdminEmails() {
  return new Set(
    (process.env.PLATFORM_ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function isPlatformAdmin(user: ApiUser) {
  if (user.email && configuredAdminEmails().has(user.email.toLowerCase())) return true;
  const profile = await env.DB.prepare(
    "SELECT role,status FROM profiles WHERE id=?",
  ).bind(user.id).first<{ role: string; status: string }>();
  return profile?.status !== "suspended" && profile?.role === "platform_admin";
}

export async function requirePlatformAdmin(request: Request) {
  const user = await requireApiUser(request);
  if (!user || !(await isPlatformAdmin(user))) return null;
  return user;
}
