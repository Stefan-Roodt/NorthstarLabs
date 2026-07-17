import { env } from "cloudflare:workers";
import Stripe from "stripe";

async function saveSubscription(subscription: Stripe.Subscription, fallbackUserId?: string, fallbackPlan?: string) {
  const userId = subscription.metadata.user_id || fallbackUserId;
  const plan = subscription.metadata.plan || fallbackPlan || "launch";
  if (!userId) return;
  const periodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end;
  const existing = await env.DB.prepare("SELECT id FROM memberships WHERE stripe_subscription_id = ?")
    .bind(subscription.id).first<{ id: string }>();
  if (existing) {
    await env.DB.prepare("UPDATE memberships SET user_id = ?, plan = ?, status = ?, current_period_end = ? WHERE id = ?")
      .bind(userId, plan, subscription.status, periodEnd ?? null, existing.id).run();
  } else {
    await env.DB.prepare("INSERT INTO memberships (id,user_id,stripe_subscription_id,plan,status,current_period_end,created_at) VALUES (?,?,?,?,?,?,?)")
      .bind(crypto.randomUUID(), userId, subscription.id, plan, subscription.status, periodEnd ?? null, Date.now()).run();
  }
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !webhookSecret || !signature) return new Response("Webhook not configured", { status: 400 });
  const stripe = new Stripe(secret);
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret); }
  catch { return new Response("Invalid signature", { status: 400 }); }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    if (userId && session.customer) {
      await env.DB.prepare("UPDATE profiles SET stripe_customer_id = ? WHERE id = ?")
        .bind(String(session.customer), userId).run();
    }
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(String(session.subscription));
      await saveSubscription(subscription, userId, session.metadata?.plan);
    }
  }
  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    await saveSubscription(event.data.object);
  }
  if (event.type === "invoice.payment_failed") {
    const subscriptionId = typeof event.data.object.parent?.subscription_details?.subscription === "string"
      ? event.data.object.parent.subscription_details.subscription : null;
    if (subscriptionId) await env.DB.prepare("UPDATE memberships SET status = 'past_due' WHERE stripe_subscription_id = ?").bind(subscriptionId).run();
  }
  return Response.json({ received: true });
}
