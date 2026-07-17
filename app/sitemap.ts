import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northstar-learning-platform.pikster.chatgpt.site";
  const lastModified = new Date("2026-07-17");
  return [
    { url: baseUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/courses`, lastModified, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/legal/terms`, lastModified, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/legal/privacy`, lastModified, changeFrequency: "monthly", priority: 0.3 },
  ];
}
