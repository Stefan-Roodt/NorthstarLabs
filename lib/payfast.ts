import { createHash, timingSafeEqual } from "node:crypto";

export const payfastPlans = {
  launch: { name: "NorthstarLabs Launch", amountEnv: "PAYFAST_PLAN_LAUNCH_ZAR" },
  build: { name: "NorthstarLabs Build", amountEnv: "PAYFAST_PLAN_BUILD_ZAR" },
  grow: { name: "NorthstarLabs Grow", amountEnv: "PAYFAST_PLAN_GROW_ZAR" },
  scale: { name: "NorthstarLabs Scale", amountEnv: "PAYFAST_PLAN_SCALE_ZAR" },
} as const;

export type PayfastPlan = keyof typeof payfastPlans;

function encode(value: string, shouldTrim = true) {
  // PayFast signs values using PHP's urlencode (RFC 1738), including
  // uppercase percent escapes and "+" for spaces.
  return encodeURIComponent(shouldTrim ? value.trim() : value)
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

export function payfastItnParameterString(
  entries: Iterable<[string, string]>,
  passphrase?: string,
) {
  const values: string[] = [];
  for (const [key, value] of entries) {
    if (key === "signature") break;
    values.push(`${key}=${encode(value, false)}`);
  }
  if (passphrase) values.push(`passphrase=${encode(passphrase)}`);
  return values.join("&");
}

export function validPayfastSignature(
  entries: Iterable<[string, string]>,
  received: string | null,
  passphrase?: string,
) {
  if (!received || !/^[a-f0-9]{32}$/i.test(received)) return false;
  const expected = Buffer.from(
    createHash("md5").update(payfastItnParameterString(entries, passphrase)).digest("hex"),
    "ascii",
  );
  const candidate = Buffer.from(received.toLowerCase(), "ascii");
  return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}

export function payfastSandbox() {
  return process.env.PAYFAST_SANDBOX !== "false";
}

export function payfastConfigured() {
  return Boolean(
    process.env.PAYFAST_MERCHANT_ID?.trim() &&
    process.env.PAYFAST_MERCHANT_KEY?.trim() &&
    process.env.PAYFAST_PASSPHRASE?.trim(),
  );
}

export function payfastProcessUrl() {
  return payfastSandbox()
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";
}

export function payfastValidationUrl() {
  return payfastSandbox()
    ? "https://sandbox.payfast.co.za/eng/query/validate"
    : "https://www.payfast.co.za/eng/query/validate";
}

function ipv4Number(value: string) {
  const parts = value.split(".");
  if (parts.length !== 4) return null;
  const octets = parts.map(Number);
  if (octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return null;
  return octets.reduce((total, part) => (total * 256 + part) >>> 0, 0) >>> 0;
}

const PAYFAST_NETWORKS = [
  ["197.97.145.144", 28],
  ["41.74.179.192", 27],
  ["102.216.36.0", 28],
  ["102.216.36.128", 28],
  ["144.126.193.139", 32],
] as const;

export function validPayfastSource(value: string | null) {
  if (!value) return false;
  const address = ipv4Number(value.trim());
  if (address === null) return false;
  return PAYFAST_NETWORKS.some(([network, bits]) => {
    const base = ipv4Number(network)!;
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (address & mask) >>> 0 === (base & mask) >>> 0;
  });
}

export function isPayfastPlan(value: unknown): value is PayfastPlan {
  return typeof value === "string" && value in payfastPlans;
}
