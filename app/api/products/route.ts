import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../lib/audit-log";
import { emitIntegrationEvent } from "../../../lib/integrations";
import { resyncProductAccess } from "../../../lib/product-access";
import { requestedSchoolId, requireCreatorSchool } from "../../../lib/school-access";
import { requireApiUser } from "../../../lib/server-auth";

const productTypes = new Set(["bundle", "membership", "live_program"]);
const billingIntervals = new Set(["free", "one_time", "monthly", "yearly"]);
const productStatuses = new Set(["draft", "published", "archived"]);

type ProductRow = {
  id: string;
  schoolId: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  productType: string;
  priceCents: number;
  billingInterval: string;
  status: string;
  includesCommunity: number;
  accessDurationDays: number;
  createdAt: number;
  updatedAt: number;
  activeMembers: number;
};

const productColumns = `p.id,p.school_id AS schoolId,p.owner_id AS ownerId,
  p.name,p.slug,p.description,p.product_type AS productType,
  p.price_cents AS priceCents,p.billing_interval AS billingInterval,
  p.status,p.includes_community AS includesCommunity,
  p.access_duration_days AS accessDurationDays,
  p.created_at AS createdAt,p.updated_at AS updatedAt`;

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 54) || "product";
}

async function availableSlug(schoolId: string, name: string, excludedId?: string) {
  const base = slugify(name);
  let candidate = base;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const existing = await env.DB.prepare(
      `SELECT id FROM products WHERE school_id=? AND slug=?
       ${excludedId ? "AND id<>?" : ""}`,
    ).bind(...(excludedId
      ? [schoolId, candidate, excludedId]
      : [schoolId, candidate])).first();
    if (!existing) return candidate;
    candidate = `${base.slice(0, 47)}-${crypto.randomUUID().slice(0, 6)}`;
  }
  return `${base.slice(0, 38)}-${crypto.randomUUID().slice(0, 15)}`;
}

async function serializeProducts(schoolId: string) {
  const [products, items] = await Promise.all([
    env.DB.prepare(
      `SELECT ${productColumns},
        COUNT(CASE WHEN pe.status='active'
          AND pe.starts_at<=?
          AND (pe.expires_at IS NULL OR pe.expires_at>?)
          THEN 1 END) AS activeMembers
       FROM products p
       LEFT JOIN product_entitlements pe ON pe.product_id=p.id
       WHERE p.school_id=?
       GROUP BY p.id ORDER BY p.updated_at DESC`,
    ).bind(Date.now(), Date.now(), schoolId).all<ProductRow>(),
    env.DB.prepare(
      `SELECT pi.id,pi.product_id AS productId,pi.item_type AS itemType,
        pi.item_id AS itemId,pi.position,c.title
       FROM product_items pi
       LEFT JOIN courses c ON c.id=pi.item_id AND pi.item_type='course'
       JOIN products p ON p.id=pi.product_id
       WHERE p.school_id=? ORDER BY pi.position,pi.id`,
    ).bind(schoolId).all<{
      id: string;
      productId: string;
      itemType: string;
      itemId: string;
      position: number;
      title: string | null;
    }>(),
  ]);
  return products.results.map((product) => ({
    ...product,
    items: items.results.filter((item) => item.productId === product.id),
  }));
}

async function productContext(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) {
    return {
      error: Response.json(
        { error: "Choose the creator path to set up your academy." },
        { status: 403 },
      ),
    };
  }
  return { user, school };
}

async function validCourseIds(schoolId: string, raw: unknown) {
  const courseIds = Array.isArray(raw)
    ? [...new Set(raw.filter((value): value is string =>
      typeof value === "string" && value.length <= 100
    ))].slice(0, 75)
    : [];
  if (!courseIds.length) return [];
  const placeholders = courseIds.map(() => "?").join(",");
  const rows = await env.DB.prepare(
    `SELECT id FROM courses WHERE school_id=? AND id IN (${placeholders})`,
  ).bind(schoolId, ...courseIds).all<{ id: string }>();
  return rows.results.map((row) => row.id);
}

function price(value: unknown) {
  const amount = Math.round(Number(value || 0));
  return Number.isFinite(amount) ? Math.max(0, Math.min(amount, 100_000_000)) : 0;
}

export async function GET(request: Request) {
  const context = await productContext(request);
  if ("error" in context) return context.error;
  const [products, courses, community] = await Promise.all([
    serializeProducts(context.school.id),
    env.DB.prepare(
      `SELECT id,title,status FROM courses
       WHERE school_id=? ORDER BY updated_at DESC`,
    ).bind(context.school.id).all(),
    env.DB.prepare(
      "SELECT id,name FROM communities WHERE school_id=?",
    ).bind(context.school.id).first(),
  ]);
  return Response.json({ school: context.school, products, courses: courses.results, community });
}

export async function POST(request: Request) {
  const context = await productContext(request);
  if ("error" in context) return context.error;
  const body = await request.json() as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
  if (name.length < 2) {
    return Response.json({ error: "Product name must be at least 2 characters." }, { status: 400 });
  }
  const productType = productTypes.has(String(body.productType))
    ? String(body.productType)
    : "bundle";
  const courseIds = await validCourseIds(context.school.id, body.courseIds);
  const includesCommunity = Boolean(body.includesCommunity);
  if (!courseIds.length && !includesCommunity && productType !== "live_program") {
    return Response.json(
      { error: "Choose at least one course or include the community." },
      { status: 400 },
    );
  }
  const id = crypto.randomUUID();
  const now = Date.now();
  const priceCents = price(body.priceCents);
  const billingInterval = priceCents === 0
    ? "free"
    : billingIntervals.has(String(body.billingInterval))
      ? String(body.billingInterval)
      : productType === "membership" ? "monthly" : "one_time";
  const accessDurationDays = Math.max(
    0,
    Math.min(Math.round(Number(body.accessDurationDays || 0)), 3650),
  );
  const description = typeof body.description === "string"
    ? body.description.trim().slice(0, 1_200)
    : "";
  const slug = await availableSlug(context.school.id, name);
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO products
        (id,school_id,owner_id,name,slug,description,product_type,price_cents,
         billing_interval,status,includes_community,access_duration_days,
         created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).bind(
      id,
      context.school.id,
      context.user.id,
      name,
      slug,
      description,
      productType,
      priceCents,
      billingInterval,
      "draft",
      includesCommunity ? 1 : 0,
      accessDurationDays,
      now,
      now,
    ),
    ...courseIds.map((courseId, position) =>
      env.DB.prepare(
        `INSERT INTO product_items
          (id,product_id,item_type,item_id,position,created_at)
         VALUES (?,?,?,?,?,?)`,
      ).bind(crypto.randomUUID(), id, "course", courseId, position, now)
    ),
  ]);
  await writeAuditLog({
    actorId: context.user.id,
    schoolId: context.school.id,
    action: "product.create",
    targetType: "product",
    targetId: id,
    detail: { productType, courseCount: courseIds.length, includesCommunity },
  });
  const products = await serializeProducts(context.school.id);
  return Response.json(products.find((product) => product.id === id), { status: 201 });
}

export async function PATCH(request: Request) {
  const context = await productContext(request);
  if ("error" in context) return context.error;
  const body = await request.json() as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id : "";
  const current = await env.DB.prepare(
    `SELECT ${productColumns},0 AS activeMembers
     FROM products p WHERE p.id=? AND p.school_id=?`,
  ).bind(id, context.school.id).first<ProductRow>();
  if (!current) return Response.json({ error: "Product not found." }, { status: 404 });

  const name = typeof body.name === "string"
    ? body.name.trim().slice(0, 100)
    : current.name;
  const productType = productTypes.has(String(body.productType))
    ? String(body.productType)
    : current.productType;
  const includesCommunity = body.includesCommunity === undefined
    ? Boolean(current.includesCommunity)
    : Boolean(body.includesCommunity);
  const courseIds = body.courseIds === undefined
    ? null
    : await validCourseIds(context.school.id, body.courseIds);
  const existingItems = courseIds === null
    ? await env.DB.prepare(
      `SELECT item_id AS itemId FROM product_items
       WHERE product_id=? AND item_type='course'`,
    ).bind(id).all<{ itemId: string }>()
    : null;
  const effectiveCourseIds = courseIds ?? existingItems?.results.map((item) => item.itemId) ?? [];
  if (!effectiveCourseIds.length && !includesCommunity && productType !== "live_program") {
    return Response.json(
      { error: "Choose at least one course or include the community." },
      { status: 400 },
    );
  }
  const status = productStatuses.has(String(body.status))
    ? String(body.status)
    : current.status;
  if (status === "published" && effectiveCourseIds.length) {
    const placeholders = effectiveCourseIds.map(() => "?").join(",");
    const unpublished = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM courses
       WHERE school_id=? AND id IN (${placeholders}) AND status<>'published'`,
    ).bind(context.school.id, ...effectiveCourseIds).first<{ count: number }>();
    if (Number(unpublished?.count || 0) > 0) {
      return Response.json(
        { error: "Publish every included course before publishing this product." },
        { status: 409 },
      );
    }
  }
  const priceCents = body.priceCents === undefined ? current.priceCents : price(body.priceCents);
  const billingInterval = priceCents === 0
    ? "free"
    : billingIntervals.has(String(body.billingInterval))
      ? String(body.billingInterval)
      : current.billingInterval === "free"
        ? productType === "membership" ? "monthly" : "one_time"
        : current.billingInterval;
  const now = Date.now();
  const statements = [
    env.DB.prepare(
      `UPDATE products SET name=?,slug=?,description=?,product_type=?,
        price_cents=?,billing_interval=?,status=?,includes_community=?,
        access_duration_days=?,updated_at=? WHERE id=?`,
    ).bind(
      name,
      await availableSlug(context.school.id, name, id),
      typeof body.description === "string"
        ? body.description.trim().slice(0, 1_200)
        : current.description,
      productType,
      priceCents,
      billingInterval,
      status,
      includesCommunity ? 1 : 0,
      body.accessDurationDays === undefined
        ? current.accessDurationDays
        : Math.max(0, Math.min(Math.round(Number(body.accessDurationDays || 0)), 3650)),
      now,
      id,
    ),
  ];
  if (courseIds !== null) {
    statements.push(
      env.DB.prepare("DELETE FROM product_items WHERE product_id=?").bind(id),
      ...courseIds.map((courseId, position) =>
        env.DB.prepare(
          `INSERT INTO product_items
            (id,product_id,item_type,item_id,position,created_at)
           VALUES (?,?,?,?,?,?)`,
        ).bind(crypto.randomUUID(), id, "course", courseId, position, now)
      ),
    );
  }
  await env.DB.batch(statements);
  if (courseIds !== null || includesCommunity !== Boolean(current.includesCommunity)) {
    const entitlements = await env.DB.prepare(
      `SELECT id FROM product_entitlements
       WHERE product_id=? AND status='active'
         AND starts_at<=? AND (expires_at IS NULL OR expires_at>?)`,
    ).bind(id, now, now).all<{ id: string }>();
    for (const entitlement of entitlements.results) {
      await resyncProductAccess(env.DB, entitlement.id, now);
    }
  }
  await writeAuditLog({
    actorId: context.user.id,
    schoolId: context.school.id,
    action: status === "published" && current.status !== "published"
      ? "product.publish"
      : "product.update",
    targetType: "product",
    targetId: id,
    detail: { status, productType, courseCount: effectiveCourseIds.length },
  });
  if (status === "published" && current.status !== "published") {
    await emitIntegrationEvent(env.DB, context.school.id, "product.published", {
      productId: id,
      name,
      productType,
    });
  }
  const products = await serializeProducts(context.school.id);
  return Response.json(products.find((product) => product.id === id));
}

export async function DELETE(request: Request) {
  const context = await productContext(request);
  if ("error" in context) return context.error;
  const id = new URL(request.url).searchParams.get("id") || "";
  const current = await env.DB.prepare(
    "SELECT id FROM products WHERE id=? AND school_id=?",
  ).bind(id, context.school.id).first();
  if (!current) return Response.json({ error: "Product not found." }, { status: 404 });
  await env.DB.prepare(
    "UPDATE products SET status='archived',updated_at=? WHERE id=?",
  ).bind(Date.now(), id).run();
  await writeAuditLog({
    actorId: context.user.id,
    schoolId: context.school.id,
    action: "product.archive",
    targetType: "product",
    targetId: id,
  });
  return Response.json({ archived: true });
}
