const REVIEW_INTERVAL_MS = 24 * 60 * 60 * 1000;

export type MasteryState = {
  status: "needs_review" | "practising" | "mastered";
  wrongCount: number;
  correctStreak: number;
  nextReviewAt: number | null;
  masteredAt: number | null;
};

export function normaliseConceptLabel(label: string | null | undefined, prompt: string) {
  const supplied = label?.trim().replace(/\s+/g, " ");
  if (supplied) return supplied.slice(0, 100);
  const fallback = prompt.trim().replace(/\s+/g, " ").replace(/[?.!]+$/, "");
  return (fallback || "Course concept").slice(0, 100);
}

export function nextMasteryState(
  current: Pick<MasteryState, "wrongCount" | "correctStreak"> | null,
  correct: boolean,
  now = Date.now(),
): MasteryState {
  if (!correct) {
    return {
      status: "needs_review",
      wrongCount: Number(current?.wrongCount || 0) + 1,
      correctStreak: 0,
      nextReviewAt: now,
      masteredAt: null,
    };
  }

  const correctStreak = Number(current?.correctStreak || 0) + 1;
  if (correctStreak >= 2) {
    return {
      status: "mastered",
      wrongCount: Number(current?.wrongCount || 0),
      correctStreak,
      nextReviewAt: null,
      masteredAt: now,
    };
  }
  return {
    status: "practising",
    wrongCount: Number(current?.wrongCount || 0),
    correctStreak,
    nextReviewAt: now + REVIEW_INTERVAL_MS,
    masteredAt: null,
  };
}
