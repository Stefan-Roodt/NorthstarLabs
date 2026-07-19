import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../../lib/audit-log";
import { queueProductAccessEmail } from "../../../../lib/email-service";
import { emitIntegrationEvent } from "../../../../lib/integrations";
import { activateProductAccess } from "../../../../lib/product-access";
import { ensureProfile } from "../../../../lib/school-access";
import { requireApiUser } from "../../../../lib/server-auth";

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await env.DB.prepare(
    `SELECT pe.id,pe.status,pe.starts_at AS startsAt,pe.expires_at AS expiresAt,
      p.id AS productId,p.name,p.description,p.product_type AS productType,
      p.includes_community AS includesCommunity,s.name AS schoolName,s.slug AS schoolSlug,
      COUNT(DISTINCT CASE WHEN pi.item_type='course' THEN pi.item_id END) AS courseCount,
      COUNT(DISTINCT CASE WHEN ls.status='scheduled' AND ls.ends_at>?
        THEN ls.id END) AS upcomingSessions
     FROM product_entitlements pe
     JOIN products p ON p.id=pe.product_id
     JOIN schools s ON s.id=p.school_id
     LEFT JOIN product_items pi ON pi.product_id=p.id
     LEFT JOIN live_sessions ls ON ls.product_id=p.id
     WHERE pe.user_id=? AND pe.status='active' AND pe.starts_at<=?
       AND (pe.expires_at IS NULL OR pe.expires_at>?)
     GROUP BY pe.id ORDER BY pe.created_at DESC`,
  ).bind(Date.now(), user.id, Date.now(), Date.now()).all();
  return Response.json({ products: rows.results });
}

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Sign in to join this product." }, { status: 401 });
  await ensureProfile(user);
  const body = await request.json() as { productId?: string };
  const now = Date.now();
  const product = await env.DB.prepare(
    `SELECT p.id,p.school_id AS schoolId,p.name,p.price_cents AS priceCents,
      p.access_duration_days AS accessDurationDays
     FROM products p JOIN schools s ON s.id=p.school_id
     WHERE p.id=? AND p.status='published' AND s.status='active'`,
  ).bind(body.productId || "").first<{
    id: string;
    schoolId: string;
    name: string;
    priceCents: number;
    accessDurationDays: number;
  }>();
  if (!product) return Response.json({ error: "Product not found." }, { status: 404 });
  if (product.priceCents > 0) {
    return Response.json(
      { error: "Checkout for paid products is not connected yet. Ask the academy for access." },
      { status: 402 },
    );
  }
  const existing = await env.DB.prepare(
    `SELECT id,status,expires_at AS expiresAt FROM product_entitlements
     WHERE product_id=? AND user_id=?`,
  ).bind(product.id, user.id).first<{
    id: string;
    status: string;
    expiresAt: number | null;
  }>();
  const entitlementId = existing?.id || crypto.randomUUID();
  const expiresAt = product.accessDurationDays > 0
    ? now + product.accessDurationDays * 86_400_000
    : null;
  if (
    existing?.status === "active" &&
    (!existing.expiresAt || existing.expiresAt > now)
  ) {
    const access = await activateProductAccess(env.DB, entitlementId, now);
    return Response.json({
      joined: true,
      alreadyActive: true,
      productId: product.id,
      courseIds: access.courseIds,
      registeredSessionIds: access.registeredSessionIds,
      emailStatus: "already_active",
    });
  }
  if (existing) {
    await env.DB.prepare(
      `UPDATE product_entitlements SET status='active',source='self_service',
        starts_at=?,expires_at=?,updated_at=? WHERE id=?`,
    ).bind(now, expiresAt, now, entitlementId).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO product_entitlements
        (id,product_id,user_id,source,status,starts_at,expires_at,
         granted_by,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
    ).bind(
      entitlementId,
      product.id,
      user.id,
      "self_service",
      "active",
      now,
      expiresAt,
      null,
      now,
      now,
    ).run();
  }
  const access = await activateProductAccess(env.DB, entitlementId, now);
  const emailDelivery = await queueProductAccessEmail({
    userId: user.id,
    productId: product.id,
    entitlementId,
    grantedAt: now,
    expiresAt,
    origin: new URL(request.url).origin,
  });
  await writeAuditLog({
    actorId: user.id,
    schoolId: product.schoolId,
    action: "product.self_enroll",
    targetType: "product_entitlement",
    targetId: entitlementId,
    detail: {
      productId: product.id,
      courseCount: access.courseIds.length,
      emailStatus: emailDelivery.status,
    },
  });
  await emitIntegrationEvent(env.DB, product.schoolId, "entitlement.granted", {
    entitlementId,
    productId: product.id,
    productName: product.name,
    userId: user.id,
    source: "self_service",
  });
  return Response.json({
    joined: true,
    productId: product.id,
    courseIds: access.courseIds,
    registeredSessionIds: access.registeredSessionIds,
    emailStatus: emailDelivery.status,
  }, { status: existing ? 200 : 201 });
}
