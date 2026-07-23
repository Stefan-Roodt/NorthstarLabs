import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("coach service modes are derived from real published availability", async () => {
  const helper = await readFile(new URL("../lib/tutor-service-mode.ts", import.meta.url), "utf8");
  assert.match(helper, /if \(Number\(availableSlotCount \|\| 0\) > 0\) return "bookable"/);
  assert.match(helper, /\\bfaculty\\b/);
  assert.match(helper, /return "enquiry_only"/);
});

test("marketplace distinguishes bookable, faculty and enquiry-only support", async () => {
  const [marketplace, profile, academy, landing] = await Promise.all([
    readFile(new URL("../app/tutors/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/schools/[slug]/tutors/[tutorSlug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/schools/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/search-landing-pages.ts", import.meta.url), "utf8"),
  ]);

  assert.match(marketplace, /Available to request now/);
  assert.match(marketplace, /Faculty and enquiry-only support/);
  assert.match(marketplace, /faculty and support/);
  assert.match(marketplace, /serviceMode === "faculty_support" \? "FACULTY"/);
  assert.match(marketplace, /published appointment/);
  assert.match(marketplace, /tutorServiceLabel/);
  assert.doesNotMatch(marketplace, /Book confidently/);
  assert.match(profile, /This is an academy faculty contact, not a published one-to-one appointment/);
  assert.match(profile, /FACULTY SUPPORT AT/);
  assert.match(profile, /Send faculty enquiry/);
  assert.match(academy, /ACADEMY FACULTY/);
  assert.match(academy, /View profile & availability/);
  assert.doesNotMatch(academy, /View tutor & book/);
  assert.match(landing, /Open listing — free/);
  assert.match(landing, /Verified exposure — R200\/month/);
  assert.match(landing, /Verification is earned/);
  assert.doesNotMatch(landing, /R149|R349|R699/);
});
