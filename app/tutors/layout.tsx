import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find a tutor",
  description: "Compare trusted independent tutors by subject, experience, format, price, and real appointment availability.",
  alternates: { canonical: "/tutors" },
};

export default function TutorMarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
