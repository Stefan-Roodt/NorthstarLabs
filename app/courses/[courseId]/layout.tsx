import { env } from "cloudflare:workers";
import type { Metadata } from "next";

type PublicCourse = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  lessonCount: number;
  creator: string;
};

async function publicCourse(courseId: string) {
  return env.DB.prepare(
    `SELECT c.id,c.title,c.description,c.price_cents AS priceCents,
      COALESCE(p.display_name,'NorthstarLabs') AS creator,
      (SELECT COUNT(*) FROM lessons l WHERE l.course_id=c.id) AS lessonCount
     FROM courses c LEFT JOIN profiles p ON p.id=c.owner_id
     WHERE c.id=? AND c.status='published'`,
  ).bind(courseId).first<PublicCourse>();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  const course = await publicCourse(courseId);
  if (!course) return { title: "Course not found", robots: { index: false, follow: false } };
  const description = course.description ||
    `${course.lessonCount} practical lessons from ${course.creator} on NorthstarLabs.`;
  return {
    title: course.title,
    description,
    alternates: { canonical: `/courses/${course.id}` },
    openGraph: {
      title: `${course.title} | NorthstarLabs`,
      description,
      type: "website",
    },
  };
}

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await publicCourse(courseId);
  const structuredData = course ? {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: {
      "@type": "Organization",
      name: "NorthstarLabs",
      sameAs: "https://northstarlabs.co.za",
    },
    ...(course.priceCents === 0 ? {
      offers: {
        "@type": "Offer",
        price: 0,
        priceCurrency: "ZAR",
        availability: "https://schema.org/InStock",
      },
    } : {}),
  } : null;
  return <>
    {structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />}
    {children}
  </>;
}
