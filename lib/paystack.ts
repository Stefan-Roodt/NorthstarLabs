import { createHmac, timingSafeEqual } from "node:crypto";

const API_ORIGIN = "https://api.paystack.co";

export function paystackConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY?.trim());
}

export function paystackMode() {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim() || "";
  return key.startsWith("sk_live_") ? "live" : "test";
}

export async function paystackApi<T>(path: string, init: RequestInit = {}) {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) throw new Error("Paystack is not configured.");
  const response = await fetch(`${API_ORIGIN}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/json",
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(12_000),
  });
  const payload = await response.json().catch(() => null) as {
    status?: boolean;
    message?: string;
    data?: T;
  } | null;
  if (!response.ok || !payload?.status || !payload.data) {
    throw new Error(payload?.message || `Paystack request failed (${response.status}).`);
  }
  return payload.data;
}

export function validPaystackSignature(raw: string, received: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret || !received || !/^[a-f0-9]{128}$/i.test(received)) return false;
  const expected = Buffer.from(createHmac("sha512", secret).update(raw).digest("hex"), "ascii");
  const candidate = Buffer.from(received.toLowerCase(), "ascii");
  return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}

export function parsePaystackMetadata(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : {};
  } catch {
    return {};
  }
}
