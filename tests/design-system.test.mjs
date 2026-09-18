import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("loads one platform-wide refinement layer after page-specific styles", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const imports = [...layout.matchAll(/import "\.\/(.+\.css)"/g)].map((match) => match[1]);
  assert.ok(imports.includes("refinement.css"));
  assert.ok(imports.indexOf("refinement.css") > imports.indexOf("builder.css"));
  assert.ok(imports.indexOf("refinement.css") > imports.indexOf("system.css"));
});

test("governs public, auth, workspace, academy, and learner surfaces", async () => {
  const css = await readFile(new URL("../app/refinement.css", import.meta.url), "utf8");
  for (const selector of [
    ".decision-home",
    ".auth-page-expanded",
    ".system-shell",
    ".studio-shell",
    ".learner-home",
    ".learn-page",
    ".school-storefront",
    ".catalog-page",
    ".marketplace-page",
  ]) assert.match(css, new RegExp(selector.replaceAll(".", "\\.")));
  assert.match(css, /--shadow-md:/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /font-size:16px!important/);
});
