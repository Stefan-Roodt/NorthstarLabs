import { env } from "cloudflare:workers";
import Stripe from "stripe";
import { requireApiUser } from "../../../lib/server-auth";

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return Response.json({ error: "Stripe is not connected yet" }, { status: 503 });
  const profile = await env.DB.prepare("SELECT stripe_customer_id AS stripeCustomerId FROM profiles WHERE id = ?")
    .bind(user.id).first<{ stripeCustomerId?: string }>();
  if (!profile?.stripeCustomerId) return Response.json({ error: "Start a plan before opening billing settings" }, { status: 400 });
  const stripe = new Stripe(secret);
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripeCustomerId,
    return_url: `${new URL(request.url).origin}/dashboard`,
  });
  return Response.json({ url: session.url });
}
