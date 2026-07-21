import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../../lib/server-auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { orderId } = await context.params;
  const order = await env.DB.prepare(
    `SELECT id,purpose,target_id AS targetId,item_name AS itemName,
      amount_cents AS amountCents,currency,billing_interval AS billingInterval,
      status,payment_status AS paymentStatus,failure_reason AS failureReason,
      created_at AS createdAt,completed_at AS completedAt
     FROM payment_orders WHERE id=? AND user_id=?`,
  ).bind(orderId, user.id).first<{
    id: string;
    purpose: string;
    targetId: string;
    itemName: string;
    amountCents: number;
    currency: string;
    billingInterval: string;
    status: string;
    paymentStatus: string | null;
    failureReason: string | null;
    createdAt: number;
    completedAt: number | null;
  }>();
  if (!order) return Response.json({ error: "Payment not found." }, { status: 404 });

  let continueUrl = "/learn";
  if (order.purpose === "course") {
    continueUrl = order.status === "complete"
      ? `/learn/${encodeURIComponent(order.targetId)}`
      : `/courses/${encodeURIComponent(order.targetId)}`;
  } else if (order.purpose === "product") {
    const firstCourse = await env.DB.prepare(
      `SELECT item_id AS courseId FROM product_items
       WHERE product_id=? AND item_type='course' ORDER BY position,id LIMIT 1`,
    ).bind(order.targetId).first<{ courseId: string }>();
    continueUrl = firstCourse?.courseId
      ? `/learn/${encodeURIComponent(firstCourse.courseId)}`
      : "/learn";
  } else if (order.purpose === "platform_subscription") {
    continueUrl = "/dashboard";
  } else if (order.purpose === "coach_listing") {
    continueUrl = "/dashboard/tutors";
  }
  return Response.json({ ...order, continueUrl });
}
