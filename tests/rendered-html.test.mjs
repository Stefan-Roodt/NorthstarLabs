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

test("prevents cross-account lesson edits and external sign-in redirects", async () => {
  const [lessons, login] = await Promise.all([
    readFile(new URL("../app/api/lessons/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/login/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(lessons, /l\.id=\? AND l\.course_id=\? AND c\.owner_id=\?/);
  assert.doesNotMatch(lessons, /ON CONFLICT\(id\) DO UPDATE/);
  assert.match(login, /safeDestination/);
  assert.match(login, /value\?\.startsWith\("\/"\)/);
  assert.match(login, /value\.startsWith\("\/\/"\)/);
});
