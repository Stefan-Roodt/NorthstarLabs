import { createHash } from "node:crypto";

export const payfastPlans = {
  launch: { name: "NorthstarLabs Launch", amountEnv: "PAYFAST_PLAN_LAUNCH_ZAR" },
  build: { name: "NorthstarLabs Build", amountEnv: "PAYFAST_PLAN_BUILD_ZAR" },
  grow: { name: "NorthstarLabs Grow", amountEnv: "PAYFAST_PLAN_GROW_ZAR" },
  scale: { name: "NorthstarLabs Scale", amountEnv: "PAYFAST_PLAN_SCALE_ZAR" },
} as const;

export type PayfastPlan = keyof typeof payfastPlans;

function encode(value: string) {
  // PayFast signs values using PHP's urlencode (RFC 1738), including
  // uppercase percent escapes and "+" for spaces.
  return encodeURIComponent(value.trim())
    .replace(/[!'()*~]/g, (character) =>
      `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
    )
    .replace(/%20/g, "+");
}

export function parameterString(entries: Iterable<[string, string]>, passphrase?: string) {
  const values: string[] = [];
  for (const [key, value] of entries) {
    if (key !== "signature" && value !== "") values.push(`${key}=${encode(value)}`);
  }
  if (passphrase) values.push(`passphrase=${encode(passphrase)}`);
  return values.join("&");
}

export function payfastSignature(entries: Iterable<[string, string]>, passphrase?: string) {
  return createHash("md5").update(parameterString(entries, passphrase)).digest("hex");
}

export function isPayfastPlan(value: unknown): value is PayfastPlan {
  return typeof value === "string" && value in payfastPlans;
}
