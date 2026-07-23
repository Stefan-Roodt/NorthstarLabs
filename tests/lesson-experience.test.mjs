import assert from "node:assert/strict";
import test from "node:test";
import {
  deriveLessonExperience,
  parseLessonExperience,
} from "../lib/lesson-experience.ts";
import { preferredSpeechVoice } from "../lib/speech-voices.ts";

test("derives a grounded guided experience from an educator lesson", () => {
  const experience = deriveLessonExperience({
    lessonTitle: "Why digital scarcity is difficult",
    courseTitle: "Bitcoin Intelligence",
    content: `## Your outcome

Explain why a digital payment cannot allow the same unit to be spent twice.

## The coordination problem

A digital file can be copied. A payment system therefore needs a reliable way to order transactions and reject a conflicting spend.

## The conventional answer

Banks and payment processors maintain an authoritative ledger. They apply identity, reversal and dispute rules around that record.

## The Bitcoin question

Bitcoin asks whether independent participants can agree on transaction history without appointing one ledger operator.

## Apply it

Separate the technical ledger problem from the legal and customer-service functions surrounding a payment.`,
  });

  assert.ok(experience);
  assert.equal(experience.eyebrow, "Guided lesson map");
  assert.equal(experience.scenes.length, 4);
  assert.equal(experience.scenes[0].title, "The coordination problem");
  assert.match(experience.intro, /digital payment/i);
  assert.equal(experience.activity.kind, "meter");
  assert.equal(experience.activity.dimensions.length, 3);
  assert.equal(parseLessonExperience(experience)?.title, experience.title);
});

test("does not invent an experience for thin placeholder copy", () => {
  assert.equal(deriveLessonExperience({
    lessonTitle: "Empty lesson",
    content: "More material will be added later.",
  }), null);
});

test("prefers a stronger English narration voice and remembers an explicit choice", () => {
  const voices = [
    { name: "Microsoft David", lang: "en-US", voiceURI: "david", localService: true },
    { name: "Microsoft Mark", lang: "en-US", voiceURI: "mark", localService: true },
    { name: "Microsoft Sonia Online (Natural)", lang: "en-GB", voiceURI: "sonia", localService: false },
  ];
  assert.equal(preferredSpeechVoice(voices)?.voiceURI, "sonia");
  assert.equal(preferredSpeechVoice(voices, "mark")?.voiceURI, "mark");
});
