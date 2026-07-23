import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NorthstarLabs Learning",
    short_name: "NorthstarLabs",
    description: "Courses, communities, memberships and live learning in one focused mobile experience.",
    start_url: "/learn",
    display: "standalone",
    background_color: "#f5f4ef",
    theme_color: "#171724",
    orientation: "any",
    categories: ["education", "business", "productivity"],
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
