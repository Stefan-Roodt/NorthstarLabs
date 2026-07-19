import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("defines NorthstarLabs production metadata", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /NorthstarLabs — Build learning that grows/);
  assert.match(layout, /metadataBase/);
  assert.match(layout, /og\.png/);
  assert.match(layout, /summary_large_image/);
  assert.doesNotMatch(layout, /codex-preview|Starter Project/);
});

test("publishes complete terms and privacy pages", async () => {
  const [terms, privacy] = await Promise.all([
    readFile(new URL("../app/legal/terms/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/legal/privacy/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(terms, /Terms of Service/);
  assert.match(terms, /Creator responsibilities/);
  assert.match(privacy, /Privacy Policy/);
  assert.match(privacy, /Creators and learner data/);
});

test("adds browser security headers to every response", async () => {
  const worker = await readFile(new URL("../worker/index.ts", import.meta.url), "utf8");
  assert.match(worker, /frame-ancestors 'none'/);
  assert.match(worker, /x-content-type-options/);
  assert.match(worker, /x-frame-options/);
  assert.match(worker, /strict-origin-when-cross-origin/);
  assert.match(worker, /max-age=31536000/);
  assert.match(worker, /private, no-store/);
});

test("prevents cross-school lesson edits and external sign-in redirects", async () => {
  const [lessons, schoolAccess, login] = await Promise.all([
    readFile(new URL("../app/api/lessons/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/school-access.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/login/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(lessons, /requireCourseStaffAccess\(user\.id,body\.courseId\)/);
  assert.match(schoolAccess, /sm\.role IN \('owner','admin','instructor'\)/);
  assert.match(schoolAccess, /JOIN school_members sm ON sm\.school_id=c\.school_id/);
  assert.doesNotMatch(lessons, /ON CONFLICT\(id\) DO UPDATE/);
  assert.match(login, /safeDestination/);
  assert.match(login, /value\?\.startsWith\("\/"\)/);
  assert.match(login, /value\.startsWith\("\/\/"\)/);
});

test("isolates creator schools, memberships, courses, and communities", async () => {
  const [schema, migration, profile, welcome, community] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0006_conscious_talisman.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/api/profile/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/welcome/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/community-access.ts", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /export const schools/);
  assert.match(schema, /export const schoolMembers/);
  assert.match(schema, /schoolId: text\("school_id"\)/);
  assert.match(migration, /CREATE TABLE `schools`/);
  assert.match(migration, /CREATE TABLE `school_members`/);
  assert.match(migration, /ALTER TABLE `courses` ADD `school_id`/);
  assert.match(migration, /ALTER TABLE `communities` ADD `school_id`/);
  assert.match(profile, /createCreatorSchool/);
  assert.match(welcome, /Name your academy/);
  assert.match(welcome, /role: "creator"/);
  assert.match(community, /FROM communities WHERE school_id=\?/);
  assert.doesNotMatch(community, /northstar-circle/);
});

test("ships a real starter catalogue without placeholder proof", async () => {
  const [home, catalog, courseData, migration] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/courses/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/starter-courses.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0005_starter_course_catalog.sql", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(home, /href="#"/);
  assert.doesNotMatch(home, /32k\+|\$1\.4B|96M|4\.8\/5|Avery Lin|21% less/);
  assert.match(home, /Product tour/);
  assert.match(home, /Frequently asked questions/i);
  assert.match(catalog, /NORTHSTARLABS ORIGINALS/);
  assert.match(courseData, /Launch Your First Online Course/);
  assert.match(courseData, /Price Your Expertise/);
  assert.match(courseData, /Build a Learning Community/);
  assert.match(migration, /launch-your-first-online-course/);
  assert.match(migration, /starter-community-06/);
});

test("guides new members into creating or learning with a low-friction join flow", async () => {
  const [home, login, welcome, course] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/login/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/welcome/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/courses/[courseId]/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(home, /Choose the result you want first/);
  assert.match(home, /Create my free account/);
  assert.match(login, /No payment details/);
  assert.match(login, /emailRedirectTo: new URL\(destination/);
  assert.match(welcome, /Build my first course/);
  assert.match(welcome, /Start a practical free course/);
  assert.match(course, /enrol=1/);
  assert.match(course, /Joining your course/);
});
