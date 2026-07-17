import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northstar-learning-platform.pikster.chatgpt.site";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/courses", "/legal/", "/certificates/"],
        disallow: ["/account", "/api/", "/community", "/dashboard", "/forgot-password", "/learn", "/login"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
