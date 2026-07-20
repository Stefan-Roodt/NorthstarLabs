export const RATING_WINDOW_MS = 14 * 24 * 60 * 60_000;
export const BLIND_RATING_PERIOD_MS = 7 * 24 * 60 * 60_000;
export const MINIMUM_LEARNER_RATINGS = 3;

export const coachPraiseTags = [
  "clear_explanations",
  "knowledgeable",
  "supportive",
  "prepared",
  "punctual",
] as const;

export const coachImprovementTags = [
  "needs_clearer_explanations",
  "knowledge_gap",
  "limited_support",
  "unprepared",
  "late",
] as const;

export const learnerPraiseTags = [
  "prepared",
  "engaged",
  "punctual",
  "communicative",
  "respectful",
] as const;

export const learnerImprovementTags = [
  "needs_preparation",
  "low_engagement",
  "late",
  "communication_issue",
  "conduct_concern",
] as const;

const coachTags = new Set<string>([...coachPraiseTags, ...coachImprovementTags]);
const learnerTags = new Set<string>([...learnerPraiseTags, ...learnerImprovementTags]);

export const visibleTutorReviewSql =
  "(tr.status='published' OR (tr.status='pending' AND tr.visible_after<=CAST(strftime('%s','now') AS INTEGER)*1000))";

export const visibleLearnerRatingSql =
  "(lr.status='published' OR (lr.status='pending' AND lr.visible_after<=CAST(strftime('%s','now') AS INTEGER)*1000))";

export function cleanRatingTags(value: unknown, audience: "coach" | "learner") {
  const allowed = audience === "coach" ? coachTags : learnerTags;
  const tags = Array.isArray(value) ? value : [];
  return [...new Set(tags
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => allowed.has(item)))]
    .slice(0, 5);
}

export function parseRatingTags(value: string) {
  try {
    const tags = JSON.parse(value);
    return Array.isArray(tags)
      ? tags.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function ratingWindowClosesAt(completedAt: number) {
  return Number(completedAt || 0) + RATING_WINDOW_MS;
}
