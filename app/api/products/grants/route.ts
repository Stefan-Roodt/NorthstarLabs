import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../../lib/audit-log";
import { queueProductAccessEmail } from "../../../../lib/email-service";
import { emitIntegrationEvent } from "../../../../lib/integrations";
import {
  activateProductAccess,
  revokeProductAccess,
} from "../../../../lib/product-access";
import {
  requestedSchoolId,
  requireCreatorSchool,
} from "../../../../lib/school-access";
import { requireApiUser } from "../../../../lib/server-auth";

async function creatorContext(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) {
    return { error: Response.json({ error: "Creator access required." }, { status: 403 }) };
  }
  return { user, school };
}

export async function GET(request: Request) {
  const context = await creatorContext(request);
  if ("error" in context) return context.error;
  const rows = await env.DB.prepare(
    `SELECT pe.id,pe.product_id AS productId,pe.user_id AS userId,
      pe.source,pe.status,pe.starts_at AS startsAt,pe.expires_at AS expiresAt,
      pe.created_at AS createdAt,p.name AS productName,p.product_type AS productType,
      pr.email,pr.display_name AS displayName
     FROM product_entitlements pe
     JOIN products p ON p.id=pe.product_id
     JOIN profiles pr ON pr.id=pe.user_id
     WHERE p.school_id=?
     ORDER BY pe.created_at DESC LIMIT 500`,
  ).bind(context.school.id).all();
  return Response.json({ entitlements: rows.results });
}

export async function POST(request: Request) {
  const context = await creatorContext(request);
  if ("error" in context) return context.error;
  const body = await request.json() as {
    productId?: string;
    email?: string;
    expiresAt?: number | null;
  };
  const product = await env.DB.prepare(
    `SELECT id,name,product_type AS productType,
      access_duration_days AS accessDurationDays
     FROM products WHERE id=? AND school_id=? AND status<>'archived'`,
  ).bind(body.productId || "", context.school.id).first<{
    id: string;
    name: string;
    productType: string;
    accessDurationDays: number;
  }>();
  if (!product) return Response.json({ error: "Product not found." }, { status: 404 });
  const email = body.email?.trim().toLowerCase() || "";
  const learner = await env.DB.prepare(
    `SELECT id,email,display_name AS displayName
     FROM profiles WHERE lower(email)=? AND status='active'`,
  ).bind(email).first<{ id: string; email: string; displayName: string }>();
  if (!learner) {
    return Response.json(
      { error: "That person must register first. Send an academy invitation, then grant the product." },
      { status: 404 },
    );
  }
  const now = Date.now();
  const requestedExpiry = body.expiresAt ? Number(body.expiresAt) : null;
  const expiresAt = requestedExpiry && requestedExpiry > now
    ? requestedExpiry
    : product.accessDurationDays > 0
      ? now + product.accessDurationDays * 86_400_000
      : null;
  const existing = await env.DB.prepare(
    `SELECT id FROM product_entitlements
     WHERE product_id=? AND user_id=?`,
  ).bind(product.id, learner.id).first<{ id: string }>();
  const entitlementId = existing?.id || crypto.randomUUID();
  if (existing) {
    await env.DB.prepare(
      `UPDATE product_entitlements SET
        status='active',source='manual',source_reference=NULL,
        starts_at=?,expires_at=?,granted_by=?,updated_at=?
       WHERE id=?`,
    ).bind(now, expiresAt, context.user.id, now, entitlementId).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO product_entitlements
        (id,product_id,user_id,source,source_reference,status,starts_at,
         expires_at,granted_by,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    ).bind(
      entitlementId,
      product.id,
      learner.id,
      "manual",
      null,
      "active",
      now,
      expiresAt,
      context.user.id,
      now,
      now,
    ).run();
  }
  const access = await activateProductAccess(env.DB, entitlementId, now);
  const emailDelivery = await queueProductAccessEmail({
    userId: learner.id,
    productId: product.id,
    entitlementId,
    grantedAt: now,
    expiresAt,
    origin: new URL(request.url).origin,
  });
  await writeAuditLog({
    actorId: context.user.id,
    schoolId: context.school.id,
    action: existing ? "product.entitlement.restore" : "product.entitlement.grant",
    targetType: "product_entitlement",
    targetId: entitlementId,
    detail: {
      productId: product.id,
      learnerId: learner.id,
      expiresAt,
      courseCount: access.courseIds.length,
      emailStatus: emailDelivery.status,
    },
  });
  await emitIntegrationEvent(env.DB, context.school.id, "entitlement.granted", {
    entitlementId,
    productId: product.id,
    productName: product.name,
    userId: learner.id,
    email: learner.email,
    expiresAt,
  });
  return Response.json({
    id: entitlementId,
    productId: product.id,
    productName: product.name,
    userId: learner.id,
    email: learner.email,
    displayName: learner.displayName,
    status: "active",
    startsAt: now,
    expiresAt,
    emailStatus: emailDelivery.status,
  }, { status: existing ? 200 : 201 });
}

export async function PATCH(request: Request) {
  const context = await creatorContext(request);
  if ("error" in context) return context.error;
  const body = await request.json() as { entitlementId?: string; action?: string };
  if (body.action !== "revoke") {
    return Response.json({ error: "Unsupported entitlement action." }, { status: 400 });
  }
  const owned = await env.DB.prepare(
    `SELECT pe.id,p.id AS productId,p.name AS productName,pe.user_id AS userId
     FROM product_entitlements pe JOIN products p ON p.id=pe.product_id
     WHERE pe.id=? AND p.school_id=?`,
  ).bind(body.entitlementId || "", context.school.id).first<{
    id: string;
    productId: string;
    productName: string;
    userId: string;
  }>();
  if (!owned) return Response.json({ error: "Entitlement not found." }, { status: 404 });
  await revokeProductAccess(env.DB, owned.id);
  await writeAuditLog({
    actorId: context.user.id,
    schoolId: context.school.id,
    action: "product.entitlement.revoke",
    targetType: "product_entitlement",
    targetId: owned.id,
    detail: { productId: owned.productId, learnerId: owned.userId },
  });
  await emitIntegrationEvent(env.DB, context.school.id, "entitlement.revoked", {
    entitlementId: owned.id,
    productId: owned.productId,
    productName: owned.productName,
    userId: owned.userId,
  });
  return Response.json({ revoked: true });
}
