import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Your Best Learning Next Step",
  description: "Tell NorthstarLabs what you want to achieve and get a clear route to a relevant course, coach, or blended learning path.",
  alternates: { canonical: "/find" },
  openGraph: {
    title: "Northstar Navigator — Find Your Best Next Step",
    description: "Start with your goal, not a product category. Find a relevant course, coach, or blended path.",
    url: "/find",
  },
};

export default function FindLayout({ children }: { children: React.ReactNode }) {
  return children;
}
