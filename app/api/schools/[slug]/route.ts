import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../lib/server-auth";

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

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const school = await env.DB.prepare(
    `SELECT ${publicSchoolColumns}
     FROM schools WHERE slug=? AND status='active'`,
  ).bind(slug).first<SchoolRow>();
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

  return Response.json({ school, community, courses: courses.results });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await context.params;
  const current = await env.DB.prepare(
    `SELECT ${publicSchoolColumns}
     FROM schools WHERE slug=? AND status='active'`,
  ).bind(slug).first<SchoolRow>();
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

  await env.DB.prepare(
    `UPDATE schools SET
      name=?,description=?,logo_url=?,cover_image_url=?,
      primary_color=?,accent_color=?,hero_title=?,hero_description=?,
      font_theme=?,support_email=?,website_url=?,seo_title=?,
      seo_description=?,show_community=?,terms_url=?,privacy_url=?,updated_at=?
     WHERE id=?`,
  ).bind(
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
  ).run();

  const school = await env.DB.prepare(
    `SELECT ${publicSchoolColumns} FROM schools WHERE id=?`,
  ).bind(current.id).first<SchoolRow>();
  return Response.json({ saved: true, school });
}
