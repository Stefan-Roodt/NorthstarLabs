import { env } from "cloudflare:workers";
import { payfastConfigured, payfastSandbox } from "../../../../lib/payfast";
import { requireApiUser } from "../../../../lib/server-auth";

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const membership = await env.DB.prepare(
    `SELECT plan,status,payfast_token IS NOT NULL AS hasBillingToken,created_at AS createdAt
     FROM memberships WHERE user_id=? AND provider='payfast'
     ORDER BY created_at DESC LIMIT 1`,
  ).bind(user.id).first();
  return Response.json({
    provider: "payfast",
    connected: payfastConfigured(),
    mode: payfastSandbox() ? "sandbox" : "live",
    currency: "ZAR",
    membership: membership || null,
  });
}
