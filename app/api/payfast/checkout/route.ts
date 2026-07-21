import { env } from "cloudflare:workers";
import { coachListingPlan } from "../../../../lib/coach-listing-plans";
import {
  isPayfastPlan,
  payfastConfigured,
  payfastPlans,
  payfastProcessUrl,
  payfastSandbox,
  payfastSignature,
} from "../../../../lib/payfast";
import { requireApiUser } from "../../../../lib/server-auth";

type CheckoutTarget = {
  purpose: "platform_subscription" | "course" | "product" | "coach_listing";
  targetId: string;
  schoolId: string | null;
  itemName: string;
  description: string;
  amountCents: number;
  billingInterval: "one_time" | "monthly" | "yearly";
};

function publicOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === "https:") return url.origin;
    } catch {
      // Fall back to the request origin when the optional canonical URL is invalid.
    }
  }
  return new URL(request.url).origin;
}

async function checkoutTarget(body: {
  plan?: unknown;
  courseId?: unknown;
  productId?: unknown;
  tutorId?: unknown;
}, userId: string): Promise<CheckoutTarget | null> {
  if (isPayfastPlan(body.plan)) {
    const plan = payfastPlans[body.plan];
    const amount = Number(process.env[plan.amountEnv]);
    return {
      purpose: "platform_subscription",
      targetId: body.plan,
      schoolId: null,
      itemName: plan.name,
      description: `${plan.name} monthly platform subscription`,
      amountCents: Math.round(amount * 100),
      billingInterval: "monthly",
    };
  }
  if (typeof body.courseId === "string" && body.courseId.length <= 100) {
    const course = await env.DB.prepare(
      `SELECT c.id,c.school_id AS schoolId,c.title,c.price_cents AS priceCents
       FROM courses c JOIN schools s ON s.id=c.school_id
       WHERE c.id=? AND c.status='published' AND s.status='active'`,
    ).bind(body.courseId).first<{
      id: string;
      schoolId: string;
      title: string;
      priceCents: number;
    }>();
    if (!course || Number(course.priceCents) <= 0) return null;
    return {
      purpose: "course",
      targetId: course.id,
      schoolId: course.schoolId,
      itemName: course.title,
      description: `Course access: ${course.title}`,
      amountCents: Number(course.priceCents),
      billingInterval: "one_time",
    };
  }
  if (typeof body.productId === "string" && body.productId.length <= 100) {
    const product = await env.DB.prepare(
      `SELECT p.id,p.school_id AS schoolId,p.name,p.price_cents AS priceCents,
        p.billing_interval AS billingInterval
       FROM products p JOIN schools s ON s.id=p.school_id
       WHERE p.id=? AND p.status='published' AND s.status='active'`,
    ).bind(body.productId).first<{
      id: string;
      schoolId: string;
      name: string;
      priceCents: number;
      billingInterval: string;
    }>();
    if (!product || Number(product.priceCents) <= 0) return null;
    const billingInterval = ["monthly", "yearly"].includes(product.billingInterval)
      ? product.billingInterval as "monthly" | "yearly"
      : "one_time";
    return {
      purpose: "product",
      targetId: product.id,
      schoolId: product.schoolId,
      itemName: product.name,
      description: `Learning access: ${product.name}`,
      amountCents: Number(product.priceCents),
      billingInterval,
    };
  }
  if (typeof body.tutorId === "string" && body.tutorId.length <= 100) {
    const tutor = await env.DB.prepare(
      `SELECT t.id,t.school_id AS schoolId,t.display_name AS displayName
       FROM tutors t JOIN schools s ON s.id=t.school_id
       WHERE t.id=? AND (t.user_id=? OR t.created_by=?) AND t.verified=1
         AND t.status<>'archived' AND s.status='active'`,
    ).bind(body.tutorId, userId, userId).first<{
      id: string;
      schoolId: string;
      displayName: string;
    }>();
    if (!tutor) return null;
    const plan = coachListingPlan("verified");
    return {
      purpose: "coach_listing",
      targetId: tutor.id,
      schoolId: tutor.schoolId,
      itemName: `Northstar Verified: ${tutor.displayName}`,
      description: "Northstar Verified professional coach listing",
      amountCents: plan.monthlyCents,
      billingInterval: "monthly",
    };
  }
  return null;
}

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user?.email) {
    return Response.json({ error: "Sign in before checkout." }, { status: 401 });
  }
  if (!payfastConfigured()) {
    return Response.json(
      { error: "PayFast setup is incomplete. NorthstarLabs has been notified." },
      { status: 503 },
    );
  }
  const body = await request.json().catch(() => ({})) as {
    plan?: unknown;
    courseId?: unknown;
    productId?: unknown;
    tutorId?: unknown;
  };
  const target = await checkoutTarget(body, user.id);
  if (!target) {
    return Response.json({ error: "Choose an available paid plan, course, programme, or verified listing." }, { status: 400 });
  }
  if (!Number.isInteger(target.amountCents) || target.amountCents < 500) {
    return Response.json(
      { error: "This price must be at least R5.00 before PayFast checkout can open." },
      { status: 409 },
    );
  }

  const orderId = crypto.randomUUID();
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO payment_orders
      (id,user_id,school_id,purpose,target_id,item_name,amount_cents,currency,
       billing_interval,status,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).bind(
    orderId,
    user.id,
    target.schoolId,
    target.purpose,
    target.targetId,
    target.itemName,
    target.amountCents,
    "ZAR",
    target.billingInterval,
    "pending",
    now,
    now,
  ).run();

  const merchantId = process.env.PAYFAST_MERCHANT_ID!.trim();
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY!.trim();
  const passphrase = process.env.PAYFAST_PASSPHRASE!.trim();
  const origin = publicOrigin(request);
  const name = String(user.user_metadata?.full_name || user.user_metadata?.name || "NorthstarLabs learner")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim()
    .split(/\s+/);
  const amount = (target.amountCents / 100).toFixed(2);
  const fields: Record<string, string> = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${origin}/payment/complete?order=${encodeURIComponent(orderId)}`,
    cancel_url: `${origin}/payment/complete?order=${encodeURIComponent(orderId)}&cancelled=1`,
    notify_url: `${origin}/api/payfast/itn`,
    name_first: name[0] || "NorthstarLabs",
    name_last: name.slice(1).join(" ") || "Learner",
    email_address: user.email,
    m_payment_id: orderId,
    amount,
    item_name: target.itemName.slice(0, 100),
    item_description: target.description.slice(0, 255),
    custom_str1: target.purpose,
    custom_str2: target.targetId.slice(0, 100),
  };
  if (target.billingInterval !== "one_time") {
    fields.subscription_type = "1";
    fields.recurring_amount = amount;
    fields.frequency = target.billingInterval === "yearly" ? "6" : "3";
    fields.cycles = "0";
    fields.subscription_notify_buyer = "true";
  }
  fields.signature = payfastSignature(Object.entries(fields), passphrase);

  return Response.json({
    provider: "payfast",
    sandbox: payfastSandbox(),
    orderId,
    action: payfastProcessUrl(),
    fields,
  });
}
