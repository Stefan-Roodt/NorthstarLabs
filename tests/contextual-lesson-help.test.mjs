import assert from "node:assert/strict";
import test from "node:test";
import { buildContextualLessonHelp } from "../lib/contextual-lesson-help.ts";

const lessons = [
  {
    id: "lesson-1",
    title: "Money before Bitcoin",
    content: "## Your outcome\nExplain why digital scarcity was a difficult problem.\n\n## The double-spend problem\nDigital files can be copied. A payment system must prevent the same unit from being spent twice.",
    transcript: "For example, imagine sending the same digital coin to two shops at the same moment. A trusted ledger would normally decide which payment came first.",
  },
  {
    id: "lesson-2",
    title: "Proof of work",
    content: "## Your outcome\nDescribe how proof of work helps a network agree on transaction history.\n\n## Agreement without a central referee\nProof of work makes rewriting a confirmed history computationally expensive.",
    transcript: "Miners compete to add a valid block, and nodes verify the result independently.",
  },
];

test("explains a lesson only from available course passages and cites them", () => {
  const result = buildContextualLessonHelp({ mode: "explain", currentLessonId: "lesson-2", lessons });
  assert.equal(result.enoughEvidence, true);
  assert.match(result.answer, /proof of work/i);
  assert.ok(result.sources.length > 0);
  assert.ok(result.sources.every((source) => lessons.some((lesson) => lesson.id === source.lessonId)));
});

test("refuses to invent a definition that the course does not contain", () => {
  const result = buildContextualLessonHelp({ mode: "define", query: "taproot annex", currentLessonId: "lesson-2", lessons });
  assert.equal(result.enoughEvidence, false);
  assert.equal(result.sources.length, 0);
  assert.match(result.answer, /will not invent/i);
});

test("finds a course example and labels its lesson source", () => {
  const result = buildContextualLessonHelp({ mode: "example", query: "digital coin", currentLessonId: "lesson-1", lessons: [lessons[0]] });
  assert.equal(result.enoughEvidence, true);
  assert.equal(result.sources[0].lessonTitle, "Money before Bitcoin");
  assert.match(result.answer, /two shops/i);
});

test("uses an existing quiz prompt without revealing its correct answer", () => {
  const result = buildContextualLessonHelp({
    mode: "check",
    currentLessonId: "lesson-2",
    lessons,
    quizQuestions: [{ prompt: "What makes historical rewriting costly?", options: ["Proof of work", "A username", "A logo"] }],
  });
  assert.equal(result.checkpoint?.prompt, "What makes historical rewriting costly?");
  assert.deepEqual(result.checkpoint?.options, ["Proof of work", "A username", "A logo"]);
  assert.doesNotMatch(result.answer, /correct answer/i);
});
