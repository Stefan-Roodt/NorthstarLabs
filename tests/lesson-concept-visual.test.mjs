import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("replaces empty text-lesson billboards with grounded responsive concept visuals", async () => {
  const [learner, visual, styles] = await Promise.all([
    readFile(new URL("../app/learn/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/[courseId]/lesson-concept-visual.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/system.css", import.meta.url), "utf8"),
  ]);

  assert.match(learner, /<LessonConceptVisual/);
  assert.match(learner, /outline=\{lessonGuide\.outline\}/);
  assert.doesNotMatch(learner, /className="lesson-banner"/);
  for (const theme of ["evidence", "market", "network", "portfolio", "risk", "strategy"]) {
    assert.match(visual, new RegExp(`"${theme}"`));
  }
  assert.match(visual, /role="img"/);
  assert.match(visual, /aria-label="Lesson concepts"/);
  assert.match(visual, /filter\(\(item\) => !genericOutline\.test\(item\)\)/);
  assert.doesNotMatch(visual, /https?:\/\//);
  assert.doesNotMatch(visual, /<img/);
  assert.match(styles, /\.lesson-concept-visual/);
  assert.match(styles, /@media\(max-width:760px\)/);
  assert.match(styles, /\.lesson-concept-visual>ol\{[^}]*grid-template-columns:repeat\(3/);
});
