import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps the PWA install button's accessible name aligned with its visible label", async () => {
  const source = await readFile(new URL("../app/pwa-register.tsx", import.meta.url), "utf8");

  assert.match(source, /<button className="pwa-install" onClick=\{install\}>/);
  assert.match(source, /<span aria-hidden="true">\+<\/span>/);
  assert.match(source, /<b>Install app<\/b>/);
  assert.doesNotMatch(source, /aria-label="Install NorthstarLabs on this device"/);
});
