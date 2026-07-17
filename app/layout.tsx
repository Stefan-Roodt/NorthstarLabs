import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "./system.css";
import "./builder.css";

const display = Space_Grotesk({ variable: "--font-display", subsets: ["latin"] });
const body = DM_Sans({ variable: "--font-body", subsets: ["latin"] });
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Northstar — Build learning that grows",
  description: "Create courses, communities, and a learning business that compounds with Northstar.",
  icons: { icon: "/favicon.svg" },
  openGraph: { title: "Northstar — Turn what you know into growth", description: "The all-in-one platform for ambitious learning businesses." },
  twitter: { card: "summary", title: "Northstar — Turn what you know into growth", description: "The all-in-one platform for ambitious learning businesses." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const publicConfig = JSON.stringify({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  }).replace(/</g, "\\u003c");
  return <html lang="en"><body className={`${display.variable} ${body.variable}`}><script dangerouslySetInnerHTML={{ __html: `window.__NORTHSTAR_CONFIG__=${publicConfig}` }} />{children}</body></html>;
}
