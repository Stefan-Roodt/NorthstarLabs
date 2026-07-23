import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("keeps enrolled learning ahead of optional coaching promotion", async () => {
  const learnerHome = await readFile(new URL("../app/learn/page.tsx", import.meta.url), "utf8");

  assert.match(learnerHome, />Explore courses</);
  assert.doesNotMatch(learnerHome, />Explore modules</);
  assert.match(learnerHome, /activeCoaching\.length > 0 \|\| reviewDue\.length > 0/);
  assert.match(learnerHome, /activeCoaching\.length === 0 && reviewDue\.length === 0/);
  assert.match(learnerHome, /Coaching is optional/);
  assert.match(learnerHome, /times a coach has actually published/);
  assert.doesNotMatch(learnerHome, /choose an available time/);

  const nextCoursePosition = learnerHome.indexOf('className="learner-next-wrap"');
  const optionalSupportPosition = learnerHome.indexOf("activeCoaching.length === 0");
  assert.ok(nextCoursePosition > -1, "next-course card should be rendered");
  assert.ok(optionalSupportPosition > nextCoursePosition, "optional coaching should follow the learner's course-first experience");
});
