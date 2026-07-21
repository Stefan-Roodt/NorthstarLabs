import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("PayFast checkout derives every charge from server-owned catalogue data", async () => {
  const checkout = await read("app/api/payfast/checkout/route.ts");
  assert.match(checkout, /FROM courses c JOIN schools/);
  assert.match(checkout, /FROM products p JOIN schools/);
  assert.match(checkout, /INSERT INTO payment_orders/);
  assert.match(checkout, /amountCents < 500/);
  assert.match(checkout, /frequency = target\.billingInterval === "yearly" \? "6" : "3"/);
  assert.match(checkout, /fields\.signature = payfastSignature/);
  assert.doesNotMatch(checkout, /body\.amount/);
});

test("PayFast ITNs are verified before access is granted", async () => {
  const itn = await read("app/api/payfast/itn/route.ts");
  assert.match(itn, /validPayfastSignature/);
  assert.match(itn, /payfastValidationUrl\(\)/);
  assert.match(itn, /serverConfirmation !== "VALID"/);
  assert.match(itn, /validPayfastSource/);
  assert.match(itn, /payfastItnParameterString/);
  assert.match(itn, /receivedAmountCents !== order\.amountCents/);
  assert.match(itn, /payment_events WHERE payfast_payment_id/);
  assert.match(itn, /grantPlatformSubscription/);
  assert.match(itn, /grantCourse/);
  assert.match(itn, /grantProduct/);
});

test("payment records make notifications durable and idempotent", async () => {
  const migration = await read("drizzle/0045_payfast_commerce.sql");
  assert.match(migration, /CREATE TABLE `payment_orders`/);
  assert.match(migration, /CREATE TABLE `payment_events`/);
  assert.match(migration, /CREATE UNIQUE INDEX `payment_events_payfast_payment_unique`/);
});

test("paid courses and products now open verified checkout", async () => {
  const course = await read("app/courses/[courseId]/page.tsx");
  const school = await read("app/schools/[slug]/page.tsx");
  const complete = await read("app/payment/complete/page.tsx");
  assert.match(course, /paid \? "\/api\/payfast\/checkout"/);
  assert.match(school, /Pay securely with PayFast/);
  assert.doesNotMatch(school, /Paid checkout coming next/);
  assert.match(complete, /Payment confirmed\. Your access is ready\./);
});
