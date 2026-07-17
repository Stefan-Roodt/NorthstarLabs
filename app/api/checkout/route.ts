import { env } from "cloudflare:workers";
import Stripe from "stripe";
import { requireApiUser } from "../../../lib/server-auth";

const prices = {
  launch: "STRIPE_PRICE_LAUNCH_MONTHLY",
  build: "STRIPE_PRICE_BUILD_MONTHLY",
  grow: "STRIPE_PRICE_GROW_MONTHLY",
  scale: "STRIPE_PRICE_SCALE_MONTHLY",
} as const;

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Sign in before checkout" }, { status: 401 });
  const body = await request.json() as { plan?: keyof typeof prices };
  const plan = body.plan && body.plan in prices ? body.plan : null;
  if (!plan) return Response.json({ error: "Choose a valid Northstar plan" }, { status: 400 });
  const secret = process.env.STRIPE_SECRET_KEY;
  const price = process.env[prices[plan]];
  if (!secret || !price) return Response.json({ error: "Stripe test pricing is not connected yet" }, { status: 503 });

  const stripe = new Stripe(secret);
  const origin = new URL(request.url).origin;
  const profile = await env.DB.prepare("SELECT stripe_customer_id AS stripeCustomerId FROM profiles WHERE id = ?")
    .bind(user.id).first<{ stripeCustomerId?: string }>();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    ...(profile?.stripeCustomerId ? { customer: profile.stripeCustomerId } : { customer_email: user.email }),
    client_reference_id: user.id,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/dashboard?checkout=cancelled`,
    metadata: { user_id: user.id, plan },
    subscription_data: { metadata: { user_id: user.id, plan } },
  });
  return Response.json({ url: session.url });
}
