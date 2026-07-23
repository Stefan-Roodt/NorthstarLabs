import assert from "node:assert/strict";
import test from "node:test";
import { getCourseReadiness } from "../lib/course-readiness.ts";

function courseWithLesson(overrides = {}) {
  return {
    title: "Media integrity course",
    description: "A complete course promise that explains the audience, useful outcome and practical evidence.",
    certificateTitle: "Certificate of completion",
    sections: [{ id: "section-1", title: "Start here" }],
    lessons: [{
      id: "lesson-1",
      sectionId: "section-1",
      title: "Watch the lesson",
      lessonType: "video",
      content: "## Your outcome\n\nExplain the idea clearly after watching the lesson.",
      durationMinutes: 6,
      transcript: "This reviewed transcript contains enough words to support accessibility, revision and low bandwidth learning for every participant who completes this focused lesson experience today.",
      resources: [],
      quiz: null,
      ...overrides,
    }],
  };
}

test("does not treat an orphaned media id as playable lesson media", () => {
  const readiness = getCourseReadiness(courseWithLesson({
    primaryAssetId: "missing-media-row",
    primaryAsset: null,
    videoKey: "",
  }));

  assert.ok(readiness.blockers.some((issue) => issue.id === "lesson-1-media"));
});

test("accepts a joined media asset or supported protected media key", () => {
  const joined = getCourseReadiness(courseWithLesson({
    primaryAssetId: "asset-1",
    primaryAsset: {
      id: "asset-1",
      filename: "lesson.mp4",
      kind: "video",
    },
  }));
  const protectedKey = getCourseReadiness(courseWithLesson({
    videoKey: "static:/media/faculty/lesson.mp4",
  }));

  assert.ok(!joined.blockers.some((issue) => issue.id === "lesson-1-media"));
  assert.ok(!protectedKey.blockers.some((issue) => issue.id === "lesson-1-media"));
});

test("blocks publishing when a named curriculum section has no lessons", () => {
  const course = courseWithLesson();
  course.sections.push({ id: "section-2", title: "Missing module" });

  const readiness = getCourseReadiness(course);

  assert.ok(readiness.blockers.some((issue) => issue.id === "section-2-empty"));
  assert.equal(readiness.label, "Not ready to publish");
  assert.ok(readiness.score < 100);
});

test("does not label a text-only course as fully produced", () => {
  const readiness = getCourseReadiness(courseWithLesson({
    lessonType: "text",
    primaryAssetId: null,
    primaryAsset: null,
    videoKey: "",
  }));

  assert.ok(readiness.score < 100);
  assert.ok(readiness.improvements.some((issue) => issue.id === "course-narrated-teaching"));
  assert.equal(readiness.productionCoverage.narratedTeaching.ready, 0);
  assert.equal(readiness.productionCoverage.narratedTeaching.total, 1);
  assert.equal(readiness.productionQueue.length, 1);
  assert.equal(readiness.productionQueue[0].sectionTitle, "Start here");
  assert.deepEqual(readiness.productionQueue[0].missingLessons, [{
    id: "lesson-1",
    title: "Watch the lesson",
    hasTranscript: false,
    hasMedia: false,
  }]);
});
