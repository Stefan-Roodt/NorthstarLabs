export type CoachListingTier = "listed" | "featured" | "spotlight";

export const coachListingPlans = [
  {
    id: "listed" as const,
    name: "Listed",
    monthlyCents: 14_900,
    label: "Searchable listing",
    description: "A credible profile that appears whenever a learner searches for your topics.",
    features: ["Public coach profile", "Topic search visibility", "Private enquiries", "Bookable availability"],
  },
  {
    id: "featured" as const,
    name: "Featured",
    monthlyCents: 34_900,
    label: "Featured placement",
    description: "Stronger visibility in relevant results for coaches ready to grow their practice.",
    features: ["Everything in Listed", "Priority topic placement", "Featured label", "Enquiry performance summary"],
  },
  {
    id: "spotlight" as const,
    name: "Spotlight",
    monthlyCents: 69_900,
    label: "Sponsored spotlight",
    description: "Premium rotation at the top of relevant searches and selected discovery areas.",
    features: ["Everything in Featured", "Top-of-search rotation", "Sponsored spotlight label", "Launch support"],
  },
] as const;

export function coachListingPlan(value: unknown) {
  return coachListingPlans.find((plan) => plan.id === value) || coachListingPlans[0];
}

export function coachListingWeight(value: unknown) {
  if (value === "spotlight") return 0;
  if (value === "featured") return 1;
  return 2;
}
