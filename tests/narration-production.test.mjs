import assert from "node:assert/strict";
import test from "node:test";
import {
  buildNarrationProductionCsv,
  buildNarrationDraft,
  countNarrationWords,
  estimateNarrationMinutes,
  matchNarrationFilename,
  narrationFilename,
  narrationFileStem,
} from "../lib/narration-production.ts";

test("builds a reviewable narration draft only from substantive lesson text", () => {
  const draft = buildNarrationDraft("Bitcoin custody", `# Bitcoin custody

## What custody means

Custody describes who can authorise movement of an asset. A wallet can help a person manage keys, but the interface itself is not the asset and is not proof of legal ownership. [S1]

- Hot wallets favour access and convenience.
- Cold storage separates signing keys from an online device.

> Match the custody design to the actual risk, recovery plan and transaction frequency.

Read the [security guide](https://example.com/guide) before choosing a control model.`);

  assert.match(draft, /^In this lesson, we work through Bitcoin custody\./);
  assert.match(draft, /Custody describes who can authorise movement of an asset/);
  assert.match(draft, /security guide/);
  assert.doesNotMatch(draft, /https:\/\/example\.com/);
  assert.doesNotMatch(draft, /\[S1\]/);
  assert.doesNotMatch(draft, /^#/m);
  assert.match(draft, /pause and explain the central idea/);
});

test("refuses to pad thin content into a narration script", () => {
  assert.equal(buildNarrationDraft("Thin lesson", "A short note with too little teaching."), "");
});

test("reports honest word and spoken-time estimates", () => {
  const script = Array.from({ length: 281 }, () => "word").join(" ");
  assert.equal(countNarrationWords(script), 281);
  assert.equal(estimateNarrationMinutes(script), 3);
  assert.equal(estimateNarrationMinutes(""), 0);
});

test("creates stable collision-resistant narration filenames and matches only exact stems", () => {
  const first = narrationFilename("lesson/one");
  const second = narrationFilename("lesson-one");
  assert.match(first, /^narration-lesson-one-[a-z0-9]{7}\.mp3$/);
  assert.notEqual(first, second);
  assert.equal(matchNarrationFilename(first.toUpperCase(), ["lesson/one", "lesson-one"]), "lesson/one");
  assert.equal(matchNarrationFilename("lesson-one.mp3", ["lesson/one", "lesson-one"]), null);
  assert.equal(narrationFileStem(""), "narration-lesson-000045h");
});

test("exports a production-ready CSV without losing quoted or multiline scripts", () => {
  const readyTranscript = `A credible script includes "quoted evidence" and a practical explanation.

${Array.from({ length: 45 }, (_, index) => `word${index}`).join(" ")}`;
  const csv = buildNarrationProductionCsv([
    {
      order: 1,
      moduleTitle: "Module 1, Foundations",
      lessonId: "lesson-1",
      lessonTitle: "Ownership and \"control\"",
      transcript: readyTranscript,
      hasMedia: false,
    },
    {
      order: 2,
      moduleTitle: "Module 1, Foundations",
      lessonId: "lesson-2",
      lessonTitle: "Thin script",
      transcript: "Needs work.",
      hasMedia: false,
    },
  ]);

  assert.match(csv, /^"production_order","module","lesson","lesson_id","required_audio_filename"/);
  assert.match(csv, /"Module 1, Foundations"/);
  assert.match(csv, /"Ownership and ""control"""/);
  assert.match(csv, /"ready_for_recording"/);
  assert.match(csv, /"script_review_required"/);
  assert.match(csv, new RegExp(narrationFilename("lesson-1").replace(".", "\\.")));
  assert.match(csv, /A credible script includes ""quoted evidence"" and a practical explanation\.\r?\n\r?\nword0/);
});
