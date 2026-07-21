import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Personal Mastery Loop",
  description: "Review weak concepts, complete focused follow-up checks, and see what you have mastered.",
  robots: { index: false, follow: false },
};

export default function MasteryLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
