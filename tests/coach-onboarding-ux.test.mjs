import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("coach setup prioritises essentials, defers extras, and previews the public listing", async () => {
  const [page, styles] = await Promise.all([
    readFile(new URL("../app/dashboard/tutors/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/system.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /6 essentials complete/);
  assert.match(page, /Describe the help you offer/);
  assert.match(page, /Help learners plan the session/);
  assert.match(page, /Add trust and contact extras/);
  assert.match(page, /PUBLIC PROFILE PREVIEW/);
  assert.match(page, /Private by default\. NorthstarLabs uses it to deliver learner enquiries/);
  assert.match(styles, /\.coach-draft-progress/);
  assert.match(styles, /\.coach-optional-details/);
  assert.match(styles, /\.coach-draft-preview/);
});
