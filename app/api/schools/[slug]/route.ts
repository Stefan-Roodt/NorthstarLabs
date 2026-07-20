import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../lib/server-auth";
import { writeAuditLog } from "../../../../lib/audit-log";
import { serializeTutor, tutorColumns, type TutorRow } from "../../../../lib/tutors";

const publicSchoolColumns = `id,slug,name,description,logo_url AS logoUrl,
  cover_image_url AS coverImageUrl,primary_color AS primaryColor,
  accent_color AS accentColor,hero_title AS heroTitle,
  hero_description AS heroDescription,font_theme AS fontTheme,
  support_email AS supportEmail,website_url AS websiteUrl,
  seo_title AS seoTitle,seo_description AS seoDescription,
  show_community AS showCommunity,terms_url AS termsUrl,
  privacy_url AS privacyUrl`;

type SchoolRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  primaryColor: string;
  accentColor: string;
  heroTitle: string;
  heroDescription: string;
  fontTheme: string;
  supportEmail: string;
  websiteUrl: string | null;
  seoTitle: string;
  seoDescription: string;
  showCommunity: number;
  termsUrl: string | null;
  privacyUrl: string | null;
};

function cleanText(value: unknown, fallback: string, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : fallback;
}

function cleanColor(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)
    ? value.toLowerCase()
    : fallback;
}

function cleanUrl(value: unknown, fallback: string | null) {
  if (value === undefined) return fallback;
  if (value === null || value === "") return null;
  if (typeof value !== "string" || value.length > 500) return fallback;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed.toString()
      : fallback;
  } catch {
    return fallback;
  }
}

function cleanSlug(value: unknown, fallback: string) {
  if (value === undefined) return fallback;
  return typeof value === "string" ? value.trim().toLowerCase().slice(0, 80) : fallback;
}

async function findSchool(slug: string) {
  const direct = await env.DB.prepare(
    `SELECT ${publicSchoolColumns} FROM schools WHERE slug=? AND status='active'`,
  ).bind(slug).first<SchoolRow>();
  if (direct) return direct;
  const alias = await env.DB.prepare(
    "SELECT school_id AS schoolId FROM school_slug_aliases WHERE slug=?",
  ).bind(slug).first<{ schoolId: string }>();
  if (!alias) return null;
  return env.DB.prepare(
    `SELECT ${publicSchoolColumns} FROM schools WHERE id=? AND status='active'`,
  ).bind(alias.schoolId).first<SchoolRow>();
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const school = await findSchool(slug);
  if (!school) return Response.json({ error: "School not found." }, { status: 404 });

  const courses = await env.DB.prepare(
    `SELECT c.id,c.title,c.description,c.price_cents AS priceCents,
      COUNT(l.id) AS lessonCount,
      COALESCE(p.display_name,s.name) AS creator,
      s.id AS schoolId,s.name AS schoolName,s.slug AS schoolSlug
     FROM courses c
     JOIN schools s ON s.id=c.school_id
     LEFT JOIN lessons l ON l.course_id=c.id
     LEFT JOIN profiles p ON p.id=c.owner_id
     WHERE c.school_id=? AND c.status='published'
     GROUP BY c.id
     ORDER BY c.updated_at DESC`,
  ).bind(school.id).all();

  const community = school.showCommunity
    ? await env.DB.prepare(
      `SELECT name,description,access_type AS accessType
       FROM communities WHERE school_id=?`,
    ).bind(school.id).first()
    : null;

  const products = await env.DB.prepare(
    `SELECT p.id,p.name,p.slug,p.description,
      p.product_type AS productType,p.price_cents AS priceCents,
      p.billing_interval AS billingInterval,
      p.includes_community AS includesCommunity,
      p.access_duration_days AS accessDurationDays,
      COUNT(DISTINCT CASE WHEN pi.item_type='course' THEN pi.item_id END) AS courseCount,
      COUNT(DISTINCT ls.id) AS liveSessionCount
     FROM products p
     LEFT JOIN product_items pi ON pi.product_id=p.id
     LEFT JOIN live_sessions ls ON ls.product_id=p.id
       AND ls.status='scheduled' AND ls.ends_at>?
     WHERE p.school_id=? AND p.status='published'
     GROUP BY p.id ORDER BY p.updated_at DESC`,
  ).bind(Date.now(), school.id).all();

  const tutors = await env.DB.prepare(
    `SELECT ${tutorColumns}
     FROM tutors t WHERE t.school_id=? AND t.status='published'
     ORDER BY t.verified DESC,t.updated_at DESC LIMIT 6`,
  ).bind(school.id).all<TutorRow>();

  return Response.json({
    school,
    community,
    products: products.results,
    courses: courses.results,
    tutors: tutors.results.map((tutor) => serializeTutor(tutor)),
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await context.params;
  const current = await findSchool(slug);
  if (!current) return Response.json({ error: "School not found." }, { status: 404 });
  const membership = await env.DB.prepare(
    `SELECT role FROM school_members
     WHERE school_id=? AND user_id=? AND status='active'`,
  ).bind(current.id, user.id).first<{ role: string }>();
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return Response.json({ error: "Owner or admin access required." }, { status: 403 });
  }

  const body = await request.json() as Record<string, unknown>;
  const name = cleanText(body.name, current.name, 80);
  if (name.length < 2) {
    return Response.json({ error: "Academy name must be at least 2 characters." }, { status: 400 });
  }
  const nextSlug = cleanSlug(body.slug, current.slug);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(nextSlug)) {
    return Response.json({
      error: "Public address must use lowercase words separated by single hyphens.",
      field: "slug",
    }, { status: 400 });
  }
  if (nextSlug !== current.slug) {
    const existing = await env.DB.prepare(
      `SELECT id FROM schools WHERE slug=? AND id<>?
       UNION ALL
       SELECT school_id AS id FROM school_slug_aliases WHERE slug=? AND school_id<>?
       LIMIT 1`,
    ).bind(nextSlug, current.id, nextSlug, current.id).first();
    if (existing) {
      return Response.json({
        error: "That public academy address is already in use. Try a more specific name.",
        field: "slug",
      }, { status: 409 });
    }
  }
  const next = {
    name,
    description: cleanText(body.description, current.description, 600),
    logoUrl: cleanUrl(body.logoUrl, current.logoUrl),
    coverImageUrl: cleanUrl(body.coverImageUrl, current.coverImageUrl),
    primaryColor: cleanColor(body.primaryColor, current.primaryColor),
    accentColor: cleanColor(body.accentColor, current.accentColor),
    heroTitle: cleanText(body.heroTitle, current.heroTitle, 120),
    heroDescription: cleanText(body.heroDescription, current.heroDescription, 320),
    fontTheme: ["modern", "editorial", "classic"].includes(String(body.fontTheme))
      ? String(body.fontTheme)
      : current.fontTheme,
    supportEmail: cleanText(body.supportEmail, current.supportEmail, 160),
    websiteUrl: cleanUrl(body.websiteUrl, current.websiteUrl),
    seoTitle: cleanText(body.seoTitle, current.seoTitle, 70),
    seoDescription: cleanText(body.seoDescription, current.seoDescription, 180),
    showCommunity: body.showCommunity === undefined
      ? Boolean(current.showCommunity)
      : Boolean(body.showCommunity),
    termsUrl: cleanUrl(body.termsUrl, current.termsUrl),
    privacyUrl: cleanUrl(body.privacyUrl, current.privacyUrl),
  };
  if (next.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.supportEmail)) {
    return Response.json({ error: "Enter a valid support email." }, { status: 400 });
  }

  const updateSchool = env.DB.prepare(
    `UPDATE schools SET
      slug=?,name=?,description=?,logo_url=?,cover_image_url=?,
      primary_color=?,accent_color=?,hero_title=?,hero_description=?,
      font_theme=?,support_email=?,website_url=?,seo_title=?,
      seo_description=?,show_community=?,terms_url=?,privacy_url=?,updated_at=?
     WHERE id=?`,
  ).bind(
    nextSlug,
    next.name,
    next.description,
    next.logoUrl,
    next.coverImageUrl,
    next.primaryColor,
    next.accentColor,
    next.heroTitle,
    next.heroDescription,
    next.fontTheme,
    next.supportEmail,
    next.websiteUrl,
    next.seoTitle,
    next.seoDescription,
    next.showCommunity ? 1 : 0,
    next.termsUrl,
    next.privacyUrl,
    Date.now(),
    current.id,
  );
  const updateDefaultCommunityName = env.DB.prepare(
    `UPDATE communities SET name=?
     WHERE school_id=? AND name=?`,
  ).bind(`${next.name} Community`, current.id, `${current.name} Community`);
  if (nextSlug !== current.slug) {
    await env.DB.batch([
      env.DB.prepare(
        "INSERT OR IGNORE INTO school_slug_aliases (slug,school_id,created_at) VALUES (?,?,?)",
      ).bind(current.slug, current.id, Date.now()),
      updateSchool,
      updateDefaultCommunityName,
    ]);
  } else {
    await env.DB.batch([updateSchool, updateDefaultCommunityName]);
  }
  await writeAuditLog({
    actorId: user.id,
    schoolId: current.id,
    action: "school.storefront.update",
    targetType: "school",
    targetId: current.id,
    detail: {
      name: next.name,
      slug: nextSlug,
      previousSlug: current.slug,
      fontTheme: next.fontTheme,
      showCommunity: next.showCommunity,
    },
  });

  const school = await env.DB.prepare(
    `SELECT ${publicSchoolColumns} FROM schools WHERE id=?`,
  ).bind(current.id).first<SchoolRow>();
  return Response.json({ saved: true, school });
}
