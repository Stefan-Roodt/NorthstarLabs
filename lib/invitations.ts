export const INVITATION_ROLES = ["learner", "instructor", "admin"] as const;
export type InvitationRole = (typeof INVITATION_ROLES)[number];

export const INVITATION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

export function normalizeInvitationEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidInvitationEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function createInvitationToken() {
  return `${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`;
}

export async function hashInvitationToken(token: string) {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

export function maskInvitationEmail(email: string) {
  const [local = "", domain = ""] = email.split("@");
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(2, local.length - visible.length))}@${domain}`;
}

export function invitationRoleLabel(role: string) {
  if (role === "admin") return "Academy admin";
  if (role === "instructor") return "Instructor";
  return "Learner";
}
