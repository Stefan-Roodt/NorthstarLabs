import { env } from "cloudflare:workers";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const school = await env.DB.prepare(
    `SELECT name,description,seo_title AS seoTitle,
      seo_description AS seoDescription,logo_url AS logoUrl
     FROM schools WHERE slug=? AND status='active'`,
  ).bind(slug).first<{
    name: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
    logoUrl: string | null;
  }>();
  if (!school) return { title: "Academy not found" };
  const title = school.seoTitle || school.name;
  const description = school.seoDescription || school.description ||
    `Explore practical courses from ${school.name}.`;
  return {
    title,
    description,
    alternates: { canonical: `/schools/${slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: school.logoUrl ? [school.logoUrl] : undefined,
    },
  };
}

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  return children;
}
