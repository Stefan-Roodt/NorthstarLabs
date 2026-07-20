import assert from "node:assert/strict";
import test from "node:test";
import { generateNativeCourseBlueprint } from "../lib/creator-studio.ts";

test("builds a complete governed course without an external AI key", () => {
  const blueprint = generateNativeCourseBlueprint({
    title: "Evidence-led decision making",
    audience: "Managers who must explain important decisions to their teams.",
    outcome: "Produce a decision record that connects evidence, reasoning, limitations, and action.",
    lessonMinutes: 6,
    sources: [{
      title: "Original decision framework",
      sourceType: "notes",
      sourceText: "A defensible decision record identifies the question, the evidence considered, the reasoning used, and the limits of the conclusion.\n\nReviewers should be able to retrace how the decision was reached and see which assumptions remain uncertain.",
      rightsBasis: "owned",
      citationLabel: "[S1]",
    }],
  });

  assert.equal(blueprint.title, "Evidence-led decision making");
  assert.equal(blueprint.sections.length, 3);
  assert.match(blueprint.sourceNote, /No source material was sent to an external AI provider/);
  const lessons = blueprint.sections.flatMap((section) => section.lessons);
  assert.equal(lessons.length, 9);
  assert.ok(lessons.every((lesson) => lesson.durationMinutes === 6));
  assert.ok(lessons.every((lesson) => lesson.content.includes("## Your outcome")));
  assert.ok(lessons.every((lesson) => lesson.citations.every((citation) => citation === "[S1]")));
  const quizzes = lessons.filter((lesson) => lesson.lessonType === "quiz");
  assert.equal(quizzes.length, 3);
  assert.ok(quizzes.every((lesson) => lesson.questions.length >= 3));
  assert.ok(quizzes.every((lesson) =>
    lesson.questions.every((question) => question.explanation?.trim())
  ));
});
