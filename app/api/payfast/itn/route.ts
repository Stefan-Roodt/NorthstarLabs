import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../../lib/audit-log";
import { queueEnrollmentEmail, queueProductAccessEmail } from "../../../../lib/email-service";
import { emitIntegrationEvent } from "../../../../lib/integrations";
import {
  payfastItnParameterString,
  payfastSandbox,
  payfastValidationUrl,
  validPayfastSource,
  validPayfastSignature,
} from "../../../../lib/payfast";
import { activateProductAccess, revokeProductAccess } from "../../../../lib/product-access";

type PaymentOrder = {
  id: string;
  userId: string;
  schoolId: string | null;
  purpose: "platform_subscription" | "course" | "product";
  targetId: string;
  itemName: string;
  amountCents: number;
  billingInterval: string;
  status: string;
  payfastPaymentId: string | null;
};

async function grantPlatformSubscription(
  order: PaymentOrder,
  paymentId: string,
  token: string | null,
  now: number,
) {
  const existing = await env.DB.prepare(
    `SELECT id FROM memberships
     WHERE user_id=? AND provider='payfast' ORDER BY created_at DESC LIMIT 1`,
  ).bind(order.userId).first<{ id: string }>();
  if (existing) {
    await env.DB.prepare(
      `UPDATE memberships SET status='active',plan=?,payfast_token=?,
       payfast_payment_id=? WHERE id=?`,
    ).bind(order.targetId, token, paymentId, existing.id).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO memberships
        (id,user_id,payfast_token,payfast_payment_id,provider,plan,status,created_at)
       VALUES (?,?,?,?,?,?,?,?)`,
    ).bind(
      crypto.randomUUID(),
      order.userId,
      token,
      paymentId,
      "payfast",
      order.targetId,
      "active",
      now,
    ).run();
  }
  await writeAuditLog({
    actorId: order.userId,
    action: "payment.platform_subscription.complete",
    targetType: "payment_order",
    targetId: order.id,
    detail: { plan: order.targetId, provider: "payfast" },
  });
}

async function grantCourse(
  order: PaymentOrder,
  paymentId: string,
  now: number,
  origin: string,
) {
  const course = await env.DB.prepare(
    "SELECT id,school_id AS schoolId,title FROM courses WHERE id=?",
  ).bind(order.targetId).first<{ id: string; schoolId: string; title: string }>();
  if (!course || course.schoolId !== order.schoolId) {
    throw new Error("The purchased course is no longer available.");
  }
  const existing = await env.DB.prepare(
    "SELECT id FROM enrollments WHERE user_id=? AND course_id=?",
  ).bind(order.userId, course.id).first<{ id: string }>();
  const enrollmentId = existing?.id || crypto.randomUUID();
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO school_members (id,school_id,user_id,role,status,joined_at)
       VALUES (?,?,?,?,?,?)
       ON CONFLICT(school_id,user_id) DO UPDATE SET
         status='active',
         role=CASE WHEN school_members.role IN ('owner','admin','instructor')
           THEN school_members.role ELSE 'learner' END`,
    ).bind(crypto.randomUUID(), course.schoolId, order.userId, "learner", "active", now),
    env.DB.prepare(
      `INSERT INTO enrollments
        (id,user_id,course_id,progress,status,support_note,last_activity_at,
         access_source,access_source_id,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(user_id,course_id) DO UPDATE SET
         status='active',last_activity_at=excluded.last_activity_at,
         access_source='payment',access_source_id=excluded.access_source_id`,
    ).bind(
      enrollmentId,
      order.userId,
      course.id,
      0,
      "active",
      "",
      now,
      "payment",
      order.id,
      now,
    ),
  ]);
  const email = await queueEnrollmentEmail({
    userId: order.userId,
    courseId: course.id,
    enrollmentId,
    origin,
  }).catch(() => ({ status: "pending" }));
  await writeAuditLog({
    actorId: order.userId,
    schoolId: course.schoolId,
    action: "payment.course.complete",
    targetType: "payment_order",
    targetId: order.id,
    detail: { courseId: course.id, paymentId, emailStatus: email.status },
  });
  await emitIntegrationEvent(env.DB, course.schoolId, "payment.completed", {
    orderId: order.id,
    paymentId,
    purpose: "course",
    courseId: course.id,
    userId: order.userId,
    amountCents: order.amountCents,
    currency: "ZAR",
  });
}

async function grantProduct(
  order: PaymentOrder,
  paymentId: string,
  now: number,
  origin: string,
) {
  const product = await env.DB.prepare(
    `SELECT id,school_id AS schoolId,name,
      access_duration_days AS accessDurationDays
     FROM products WHERE id=?`,
  ).bind(order.targetId).first<{
    id: string;
    schoolId: string;
    name: string;
    accessDurationDays: number;
  }>();
  if (!product || product.schoolId !== order.schoolId) {
    throw new Error("The purchased programme is no longer available.");
  }
  const existing = await env.DB.prepare(
    "SELECT id FROM product_entitlements WHERE product_id=? AND user_id=?",
  ).bind(product.id, order.userId).first<{ id: string }>();
  const entitlementId = existing?.id || crypto.randomUUID();
  const expiresAt = product.accessDurationDays > 0
    ? now + product.accessDurationDays * 86_400_000
    : null;
  if (existing) {
    await env.DB.prepare(
      `UPDATE product_entitlements SET status='active',source='payfast',
       source_reference=?,starts_at=?,expires_at=?,updated_at=? WHERE id=?`,
    ).bind(order.id, now, expiresAt, now, entitlementId).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO product_entitlements
        (id,product_id,user_id,source,source_reference,status,starts_at,
         expires_at,granted_by,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    ).bind(
      entitlementId,
      product.id,
      order.userId,
      "payfast",
      order.id,
      "active",
      now,
      expiresAt,
      null,
      now,
      now,
    ).run();
  }
  const access = await activateProductAccess(env.DB, entitlementId, now);
  const email = await queueProductAccessEmail({
    userId: order.userId,
    productId: product.id,
    entitlementId,
    grantedAt: now,
    expiresAt,
    origin,
  }).catch(() => ({ status: "pending" }));
  await writeAuditLog({
    actorId: order.userId,
    schoolId: product.schoolId,
    action: "payment.product.complete",
    targetType: "payment_order",
    targetId: order.id,
    detail: {
      productId: product.id,
      paymentId,
      courseCount: access.courseIds.length,
      emailStatus: email.status,
    },
  });
  await emitIntegrationEvent(env.DB, product.schoolId, "payment.completed", {
    orderId: order.id,
    paymentId,
    purpose: "product",
    productId: product.id,
    userId: order.userId,
    amountCents: order.amountCents,
    currency: "ZAR",
  });
  await emitIntegrationEvent(env.DB, product.schoolId, "entitlement.granted", {
    entitlementId,
    productId: product.id,
    productName: product.name,
    userId: order.userId,
    source: "payfast",
  });
}

async function markIncompleteSubscription(
  order: PaymentOrder,
  paymentStatus: string,
  token: string | null,
) {
  if (order.purpose !== "platform_subscription") return;
  const status = paymentStatus === "CANCELLED"
    ? "cancelled"
    : paymentStatus === "FAILED" ? "past_due" : "pending";
  await env.DB.prepare(
    `UPDATE memberships SET status=?,payfast_token=COALESCE(?,payfast_token)
     WHERE user_id=? AND provider='payfast'`,
  ).bind(status, token, order.userId).run();
}

async function cancelProductSubscription(order: PaymentOrder, now: number) {
  if (order.purpose !== "product" || order.billingInterval === "one_time") return;
  const entitlement = await env.DB.prepare(
    `SELECT id FROM product_entitlements
     WHERE product_id=? AND user_id=? AND source_reference=?`,
  ).bind(order.targetId, order.userId, order.id).first<{ id: string }>();
  if (entitlement) await revokeProductAccess(env.DB, entitlement.id, now);
}

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(length) && length > 65_536) {
    return new Response("Payload too large", { status: 413 });
  }
  const raw = await request.text();
  if (raw.length > 65_536) return new Response("Payload too large", { status: 413 });
  const data = new URLSearchParams(raw);
  const merchantId = process.env.PAYFAST_MERCHANT_ID?.trim();
  const passphrase = process.env.PAYFAST_PASSPHRASE?.trim();
  if (!merchantId || !passphrase || data.get("merchant_id") !== merchantId) {
    return new Response("Invalid merchant", { status: 400 });
  }
  if (!validPayfastSignature(data.entries(), data.get("signature"), passphrase)) {
    return new Response("Invalid signature", { status: 400 });
  }
  const sourceAddress = request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  if (!payfastSandbox() && !validPayfastSource(sourceAddress)) {
    return new Response("Invalid PayFast source", { status: 400 });
  }

  const validationBody = payfastItnParameterString(data.entries());
  let serverConfirmation = "";
  try {
    const validation = await fetch(payfastValidationUrl(), {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": "NorthStarLabs-PayFast/1.0",
      },
      body: validationBody,
      signal: AbortSignal.timeout(10_000),
    });
    serverConfirmation = (await validation.text()).trim();
  } catch {
    return new Response("PayFast validation temporarily unavailable", { status: 503 });
  }
  if (serverConfirmation !== "VALID") {
    return new Response("Invalid transaction", { status: 400 });
  }

  const orderId = data.get("m_payment_id") || "";
  const paymentId = data.get("pf_payment_id") || "";
  const paymentStatus = (data.get("payment_status") || "").toUpperCase();
  const token = data.get("token");
  if (!orderId || !paymentId || !["COMPLETE", "FAILED", "PENDING", "CANCELLED"].includes(paymentStatus)) {
    return new Response("Invalid payment notification", { status: 400 });
  }
  const order = await env.DB.prepare(
    `SELECT id,user_id AS userId,school_id AS schoolId,purpose,target_id AS targetId,
      item_name AS itemName,amount_cents AS amountCents,
      billing_interval AS billingInterval,status,
      payfast_payment_id AS payfastPaymentId
     FROM payment_orders WHERE id=?`,
  ).bind(orderId).first<PaymentOrder>();
  if (!order) return new Response("Unknown payment", { status: 404 });
  if (
    (data.get("custom_str1") && data.get("custom_str1") !== order.purpose) ||
    (data.get("custom_str2") && data.get("custom_str2") !== order.targetId)
  ) {
    return new Response("Payment reference mismatch", { status: 400 });
  }
  const amountGross = data.get("amount_gross");
  const receivedAmountCents = amountGross === null || amountGross === ""
    ? null
    : Math.round(Number(amountGross) * 100);
  if (
    paymentStatus !== "CANCELLED" &&
    (receivedAmountCents === null || !Number.isFinite(receivedAmountCents) || receivedAmountCents !== order.amountCents)
  ) {
    return new Response("Amount mismatch", { status: 400 });
  }
  if (
    paymentStatus === "CANCELLED" && receivedAmountCents !== null &&
    (!Number.isFinite(receivedAmountCents) || receivedAmountCents !== order.amountCents)
  ) return new Response("Amount mismatch", { status: 400 });
  const duplicate = await env.DB.prepare(
    "SELECT id FROM payment_events WHERE payfast_payment_id=?",
  ).bind(paymentId).first<{ id: string }>();
  if (duplicate) return new Response("OK");

  const now = Date.now();
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.trim() || new URL(request.url).origin;
  try {
    if (paymentStatus === "COMPLETE") {
      if (order.purpose === "platform_subscription") {
        await grantPlatformSubscription(order, paymentId, token, now);
      } else if (order.purpose === "course") {
        await grantCourse(order, paymentId, now, origin);
      } else if (order.purpose === "product") {
        await grantProduct(order, paymentId, now, origin);
      }
    } else {
      await markIncompleteSubscription(order, paymentStatus, token);
      if (paymentStatus === "CANCELLED") await cancelProductSubscription(order, now);
    }
    const orderStatus = paymentStatus === "COMPLETE"
      ? "complete"
      : paymentStatus === "CANCELLED"
        ? "cancelled"
      : paymentStatus === "FAILED"
        ? order.billingInterval === "one_time" ? "failed" : "past_due"
        : "pending";
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO payment_events
          (id,order_id,payfast_payment_id,payment_status,amount_cents,created_at)
         VALUES (?,?,?,?,?,?)`,
      ).bind(crypto.randomUUID(), order.id, paymentId, paymentStatus, order.amountCents, now),
      env.DB.prepare(
        `UPDATE payment_orders SET status=?,payfast_payment_id=?,payfast_token=?,
         payment_status=?,failure_reason=?,updated_at=?,completed_at=? WHERE id=?`,
      ).bind(
        orderStatus,
        paymentId,
        token,
        paymentStatus,
        paymentStatus === "FAILED"
          ? "PayFast reported a failed payment."
          : paymentStatus === "CANCELLED" ? "The PayFast subscription was cancelled." : null,
        now,
        paymentStatus === "COMPLETE" ? now : null,
        order.id,
      ),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 240) : "Access delivery failed.";
    await env.DB.prepare(
      "UPDATE payment_orders SET failure_reason=?,updated_at=? WHERE id=?",
    ).bind(message, now, order.id).run().catch(() => undefined);
    return new Response("Payment received; access delivery will retry", { status: 503 });
  }

  return new Response("OK", {
    headers: { "x-northstar-payfast-mode": payfastSandbox() ? "sandbox" : "live" },
  });
}
