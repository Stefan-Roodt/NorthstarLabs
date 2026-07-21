import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northstarlabs.co.za";
  const privateRoutes = ["/account", "/api/", "/admin", "/community", "/dashboard", "/forgot-password", "/learn", "/login"];
  return {
    rules: [
      {
        userAgent: ["OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "PerplexityBot"],
        allow: ["/", "/about", "/find", "/demand", "/courses", "/tutors", "/solutions", "/schools/", "/legal/", "/certificates/"],
        disallow: privateRoutes,
      },
      {
        userAgent: "*",
        allow: ["/", "/about", "/find", "/demand", "/courses", "/tutors", "/schools/", "/legal/", "/certificates/"],
        disallow: privateRoutes,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
