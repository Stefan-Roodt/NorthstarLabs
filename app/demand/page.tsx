import type { Metadata } from "next";
import { publicDemandTopics } from "../../lib/demand-board";
import { DemandBoard } from "./demand-board";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Demand Board — What should NorthstarLabs build next?",
  description: "Request a course, coach, or live learning topic; support useful ideas; and follow NorthstarLabs' public learning roadmap.",
  alternates: { canonical: "/demand" },
};

export default async function DemandBoardPage() {
  const topics = await publicDemandTopics().catch(() => []);
  return <DemandBoard initialTopics={topics} />;
}
