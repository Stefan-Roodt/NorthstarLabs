import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proof-of-Learning Portfolio",
  description: "A learner-curated record of verified achievements, demonstrated skills, and submitted work.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicPortfolioLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
