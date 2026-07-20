import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find a Coach or Tutor by Topic",
  description: "Search NorthstarLabs coaches and tutors by topic, compare self-set hourly rates, credentials, verified-session reviews, format, and real availability.",
  alternates: { canonical: "/tutors" },
  openGraph: {
    title: "Find a Coach or Tutor by Topic | NorthstarLabs",
    description: "A course gives you the path. Find human help for the roadblock.",
    type: "website",
  },
};

export default function TutorMarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
