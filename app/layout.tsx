import type { Metadata } from "next";
import "./globals.css";
import "./system.css";
import "./builder.css";
import "./search-landing.css";
import "driver.js/dist/driver.css";
import { PwaRegister } from "./pwa-register";
import { AuthCallbackRedirect } from "./auth-callback-redirect";
import { GoogleAnalytics } from "./google-analytics";

export const dynamic = "force-dynamic";
const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northstarlabs.co.za";

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title: {
    default: "NorthstarLabs — Learn. Ask. Progress.",
    template: "%s | NorthstarLabs",
  },
  description: "NorthstarLabs connects structured courses, a personal mastery loop, human coaching, live learning, community, verifiable certificates, and learner-owned proof-of-learning portfolios.",
  applicationName: "NorthstarLabs",
  creator: "NorthstarLabs",
  category: "education",
  keywords: [
    "online learning platform",
    "course creation platform",
    "online coaching marketplace",
    "learning management system",
    "South Africa online courses",
    "proof of learning portfolio",
    "verified learning portfolio",
    "personal mastery learning",
    "spaced assessment practice",
    "NorthstarLabs",
  ],
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg" },
  appleWebApp: {
    capable: true,
    title: "NorthstarLabs",
    statusBarStyle: "black-translucent",
  },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, maxImagePreview: "large", maxSnippet: -1, maxVideoPreview: -1 },
  },
  openGraph: {
    type: "website",
    siteName: "NorthstarLabs",
    title: "NorthstarLabs — Learn. Ask. Progress.",
    description: "Courses that remember weak concepts, human coaching for roadblocks, and a learner-owned portfolio that makes real progress visible.",
    images: [{ url: "/og-decision.png", width: 1200, height: 630, alt: "NorthstarLabs — choose what you came to do" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NorthstarLabs — Learn. Ask. Progress.",
    description: "Courses for the path. Human coaching for the roadblocks.",
    images: ["/og-decision.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const publicConfig = JSON.stringify({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  }).replace(/</g, "\\u003c");
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${publicSiteUrl}/#organization`,
        name: "NorthstarLabs",
        url: publicSiteUrl,
        logo: `${publicSiteUrl}/favicon.svg`,
        slogan: "Learn. Ask. Progress.",
        description: "A connected learning platform where structured courses, personal mastery, human coaching, live learning, community, and learner-owned proof of learning work together.",
      },
      {
        "@type": "WebSite",
        "@id": `${publicSiteUrl}/#website`,
        name: "NorthstarLabs",
        alternateName: "Northstar Labs",
        url: publicSiteUrl,
        publisher: { "@id": `${publicSiteUrl}/#organization` },
        inLanguage: "en",
      },
    ],
  }).replace(/</g, "\\u003c");
  return <html lang="en-ZA"><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} /><script dangerouslySetInnerHTML={{ __html: `window.__NORTHSTARLABS_CONFIG__=${publicConfig}` }} /><AuthCallbackRedirect />{children}<GoogleAnalytics /><PwaRegister /></body></html>;
}
