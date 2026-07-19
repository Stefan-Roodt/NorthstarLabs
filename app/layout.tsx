import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "./system.css";
import "./builder.css";
import { PwaRegister } from "./pwa-register";

const display = Space_Grotesk({ variable: "--font-display", subsets: ["latin"] });
const body = DM_Sans({ variable: "--font-body", subsets: ["latin"] });
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://northstar-learning-platform.pikster.chatgpt.site"),
  title: {
    default: "NorthstarLabs — Build learning that grows",
    template: "%s | NorthstarLabs",
  },
  description: "Create courses, communities, and a learning business that compounds with NorthstarLabs.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg" },
  appleWebApp: {
    capable: true,
    title: "NorthStarLabs",
    statusBarStyle: "black-translucent",
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "NorthstarLabs",
    title: "NorthstarLabs — Turn what you know into growth",
    description: "The all-in-one platform for ambitious learning businesses.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "NorthstarLabs learning platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NorthstarLabs — Turn what you know into growth",
    description: "The all-in-one platform for ambitious learning businesses.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const publicConfig = JSON.stringify({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  }).replace(/</g, "\\u003c");
  return <html lang="en"><body className={`${display.variable} ${body.variable}`}><script dangerouslySetInnerHTML={{ __html: `window.__NORTHSTARLABS_CONFIG__=${publicConfig}` }} />{children}<PwaRegister /></body></html>;
}
