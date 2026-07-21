export type CoachListingTier = "listed" | "verified";

export const coachListingPlans = [
  {
    id: "listed" as const,
    name: "Open listing",
    monthlyCents: 0,
    label: "Free for every coach",
    description: "Publish a useful profile and be found whenever your expertise matches a learner's search.",
    features: ["Public coach profile", "Topic search visibility", "Private enquiries", "Your own hourly rate"],
  },
  {
    id: "verified" as const,
    name: "Northstar Verified",
    monthlyCents: 20_000,
    label: "Verified professional exposure",
    description: "Available only after identity and credentials pass review. Payment never buys approval.",
    features: ["Everything in Open listing", "Priority relevant placement", "Verified professional badge", "Views and enquiry analytics"],
  },
] as const;

export function coachListingPlan(value: unknown) {
  return coachListingPlans.find((plan) => plan.id === value) || coachListingPlans[0];
}

export function coachListingWeight(value: unknown) {
  return value === "verified" ? 0 : 1;
}
