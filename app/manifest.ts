import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NorthstarLabs",
    short_name: "NorthstarLabs",
    description: "Create courses, communities, and a learning business that compounds.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f0e8",
    theme_color: "#3556d8",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
