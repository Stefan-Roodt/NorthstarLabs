import { env } from "cloudflare:workers";
import { coachListingPlan } from "./coach-listing-plans";

export const platformPlans = {
  launch: { name: "NorthstarLabs Launch", amountEnv: "PAYMENT_PLAN_LAUNCH_ZAR", fallbackEnv: "PAYFAST_PLAN_LAUNCH_ZAR" },
  build: { name: "NorthstarLabs Build", amountEnv: "PAYMENT_PLAN_BUILD_ZAR", fallbackEnv: "PAYFAST_PLAN_BUILD_ZAR" },
  grow: { name: "NorthstarLabs Grow", amountEnv: "PAYMENT_PLAN_GROW_ZAR", fallbackEnv: "PAYFAST_PLAN_GROW_ZAR" },
  scale: { name: "NorthstarLabs Scale", amountEnv: "PAYMENT_PLAN_SCALE_ZAR", fallbackEnv: "PAYFAST_PLAN_SCALE_ZAR" },
} as const;

export type PlatformPlan = keyof typeof platformPlans;
export type CheckoutPurpose = "platform_subscription" | "course" | "product" | "coach_listing";
export type BillingInterval = "one_time" | "monthly" | "yearly";

export type CheckoutTarget = {
  purpose: CheckoutPurpose;
  targetId: string;
  schoolId: string | null;
  itemName: string;
  description: string;
  amountCents: number;
  billingInterval: BillingInterval;
};

export function isPlatformPlan(value: unknown): value is PlatformPlan {
  return typeof value === "string" && value in platformPlans;
}

function platformPlanAmount(plan: PlatformPlan) {
  const definition = platformPlans[plan];
  const value = process.env[definition.amountEnv] || process.env[definition.fallbackEnv];
  return Math.round(Number(value) * 100);
}

export async function resolveCheckoutTarget(body: {
  plan?: unknown;
  courseId?: unknown;
  productId?: unknown;
  tutorId?: unknown;
}, userId: string): Promise<CheckoutTarget | null> {
  if (isPlatformPlan(body.plan)) {
    const plan = platformPlans[body.plan];
    return {
      purpose: "platform_subscription",
      targetId: body.plan,
      schoolId: null,
      itemName: plan.name,
      description: `${plan.name} monthly platform subscription`,
      amountCents: platformPlanAmount(body.plan),
      billingInterval: "monthly",
    };
  }

  if (typeof body.courseId === "string" && body.courseId.length <= 100) {
    const course = await env.DB.prepare(
      `SELECT c.id,c.school_id AS schoolId,c.title,c.price_cents AS priceCents
       FROM courses c JOIN schools s ON s.id=c.school_id
       WHERE c.id=? AND c.status='published' AND s.status='active'`,
    ).bind(body.courseId).first<{ id: string; schoolId: string; title: string; priceCents: number }>();
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
    const billingInterval: BillingInterval = ["monthly", "yearly"].includes(product.billingInterval)
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
    ).bind(body.tutorId, userId, userId).first<{ id: string; schoolId: string; displayName: string }>();
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

export function publicOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === "https:") return url.origin;
    } catch {
      // Use the request origin if a malformed optional canonical URL was supplied.
    }
  }
  return new URL(request.url).origin;
}
