import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practical Online Courses in South Africa",
  description: "Explore practical online courses in South Africa, enrol free, save your progress, complete quizzes, earn certificates, and find human coaching when you need it.",
  alternates: { canonical: "/courses" },
  openGraph: {
    title: "Practical Online Courses in South Africa | NorthstarLabs",
    description: "Start with a practical course. Add human coaching when the roadblock becomes personal.",
    type: "website",
  },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
