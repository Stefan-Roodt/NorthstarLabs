import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Practical Online Courses",
  description: "Explore practical NorthstarLabs courses, enrol free, save your progress, complete quizzes, earn certificates, and find human coaching when you need it.",
  alternates: { canonical: "/courses" },
  openGraph: {
    title: "Free Practical Online Courses | NorthstarLabs",
    description: "Start with a practical course. Add human coaching when the roadblock becomes personal.",
    type: "website",
  },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
