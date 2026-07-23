import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps long courses navigable by progressively revealing modules", async () => {
  const [learner, styles] = await Promise.all([
    readFile(new URL("../app/learn/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/system.css", import.meta.url), "utf8"),
  ]);

  assert.match(learner, /expandedSectionIds/);
  assert.match(learner, /learner-section-toggle/);
  assert.match(learner, /aria-expanded=\{isExpanded\}/);
  assert.match(learner, /aria-controls=\{panelId\}/);
  assert.match(learner, /\{isExpanded && \(/);
  assert.match(learner, /completedInSection/);
  assert.match(learner, /Boolean\(normalizedSearch\)/);
  assert.match(learner, /sectionTitleMatches/);
  assert.match(styles, /\.learner-section-toggle/);
  assert.match(styles, /\.learner-section-lessons/);
});

test("keeps the public syllabus compact while every lesson remains inspectable", async () => {
  const [course, styles] = await Promise.all([
    readFile(new URL("../app/courses/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/system.css", import.meta.url), "utf8"),
  ]);

  assert.match(course, /<details/);
  assert.match(course, /className="course-module"/);
  assert.match(course, /expandedModuleIds/);
  assert.match(course, /open=\{expandedModuleIds\.has\(section\.id\)\}/);
  assert.match(course, /onToggle=/);
  assert.match(course, /<summary>/);
  assert.match(course, /Open a module to inspect every lesson/);
  assert.match(styles, /\.course-module>summary/);
  assert.match(styles, /\.course-module\[open\]>summary/);
  assert.match(styles, /\.course-module>summary:after/);
});

test("makes the complete curriculum reachable on small screens", async () => {
  const [learner, styles] = await Promise.all([
    readFile(new URL("../app/learn/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/system.css", import.meta.url), "utf8"),
  ]);

  assert.match(learner, /curriculumOpen/);
  assert.match(learner, /className="mobile-curriculum-toggle"/);
  assert.match(learner, /aria-controls="learner-curriculum"/);
  assert.match(learner, /id="learner-curriculum"/);
  assert.match(learner, /className="curriculum-close"/);
  assert.match(learner, /className="curriculum-mobile-links"/);
  assert.match(styles, /@media\(max-width:900px\)/);
  assert.match(styles, /\.learn-page\.curriculum-open \.learn-layout>aside/);
  assert.match(styles, /position:fixed/);
  assert.match(styles, /overflow-y:auto/);
  assert.match(styles, /\.learn-layout>aside \.curriculum-close\{display:none\}/);
});

test("keeps the next required learner action visible and returns progression to the lesson start", async () => {
  const [learner, styles] = await Promise.all([
    readFile(new URL("../app/learn/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/system.css", import.meta.url), "utf8"),
  ]);

  assert.match(learner, /showCompletionDock/);
  assert.match(learner, /className="lesson-ready-dock"/);
  assert.match(learner, /Finish & continue/);
  assert.match(learner, /Keep exploring/);
  assert.match(learner, /id="lesson-start"/);
  assert.match(learner, /focusLessonStart\(\)/);
  assert.match(learner, /scrollIntoView/);
  assert.match(learner, /focus\(\{ preventScroll: true \}\)/);
  assert.match(styles, /\.lesson-ready-dock\{position:fixed/);
  assert.match(styles, /@media\(max-width:620px\).*\.lesson-ready-dock/);
});

test("reports accessible lesson text instead of a misleading transcript ratio", async () => {
  const [catalogApi, coursePage] = await Promise.all([
    readFile(new URL("../app/api/catalog/[courseId]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/courses/[courseId]/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(catalogApi, /accessibleLessonTextCount/);
  assert.match(catalogApi, /length\(trim\(l\.content\)\)>=40/);
  assert.match(coursePage, /Accessible lesson text/);
  assert.match(coursePage, /accessibleLessonTextCount/);
  assert.doesNotMatch(coursePage, /<dt>Transcripts<\/dt>/);
});
