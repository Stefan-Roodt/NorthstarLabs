import type { MetadataRoute } from "next";
import { env } from "cloudflare:workers";
import { searchLandingPages } from "../lib/search-landing-pages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northstarlabs.co.za";
  const lastModified = new Date();
  const fixed: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/find`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/demand`, lastModified, changeFrequency: "daily", priority: 0.85 },
    { url: `${baseUrl}/courses`, lastModified, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/tutors`, lastModified, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/solutions`, lastModified, changeFrequency: "weekly", priority: 0.85 },
    ...searchLandingPages.map((page) => ({
      url: `${baseUrl}/solutions/${page.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    { url: `${baseUrl}/legal/terms`, lastModified, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/legal/privacy`, lastModified, changeFrequency: "monthly", priority: 0.3 },
  ];
  try {
    const [courses, schools, tutors] = await Promise.all([
      env.DB.prepare(
        `SELECT id,updated_at AS updatedAt FROM courses
         WHERE status='published' ORDER BY updated_at DESC LIMIT 5000`,
      ).all<{ id: string; updatedAt: number }>(),
      env.DB.prepare(
        `SELECT slug,updated_at AS updatedAt FROM schools
         WHERE status='active' ORDER BY updated_at DESC LIMIT 2000`,
      ).all<{ slug: string; updatedAt: number }>(),
      env.DB.prepare(
        `SELECT t.slug,s.slug AS schoolSlug,t.updated_at AS updatedAt
         FROM tutors t JOIN schools s ON s.id=t.school_id
         WHERE t.status='published' AND s.status='active'
         ORDER BY t.updated_at DESC LIMIT 5000`,
      ).all<{ slug: string; schoolSlug: string; updatedAt: number }>(),
    ]);
    return [
      ...fixed,
      ...courses.results.map((course) => ({
        url: `${baseUrl}/courses/${course.id}`,
        lastModified: new Date(course.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...schools.results.map((school) => ({
        url: `${baseUrl}/schools/${school.slug}`,
        lastModified: new Date(school.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...tutors.results.map((tutor) => ({
        url: `${baseUrl}/schools/${tutor.schoolSlug}/tutors/${tutor.slug}`,
        lastModified: new Date(tutor.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.65,
      })),
    ];
  } catch {
    return fixed;
  }
}
