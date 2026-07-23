import assert from "node:assert/strict";
import test from "node:test";
import {
  buildNarrationDraft,
  countNarrationWords,
  estimateNarrationMinutes,
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
