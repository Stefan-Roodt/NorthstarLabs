export type RateLimitPolicy = {
  scope: string;
  limit: number;
  windowMs: number;
};

type RateLimitRow = {
  requestCount: number;
  resetAt: number;
};

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function clientAddress(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  ).slice(0, 128);
}

export async function sha256Hex(value: string | Uint8Array) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

export function rateLimitPolicy(request: Request): RateLimitPolicy | null {
  const method = request.method.toUpperCase();
  if (!WRITE_METHODS.has(method)) return null;
  const path = new URL(request.url).pathname;
  if (path === "/api/uploads") {
    return { scope: "uploads", limit: 20, windowMs: 60 * 60_000 };
  }
  if (path === "/api/academy-exports") {
    return { scope: "academy_exports", limit: 8, windowMs: 60 * 60_000 };
  }
  if (path === "/api/lesson-help") {
    return { scope: "lesson_help", limit: 120, windowMs: 60 * 60_000 };
  }
  if (path.startsWith("/api/invitations")) {
    return { scope: "invitations", limit: 30, windowMs: 60 * 60_000 };
  }
  if (path === "/api/community") {
    return { scope: "community_write", limit: 30, windowMs: 60_000 };
  }
  if (path === "/api/enrollments") {
    return { scope: "enrollment_write", limit: 30, windowMs: 60_000 };
  }
  if (path === "/api/tutor-inquiries") {
    return { scope: "tutor_inquiry", limit: 10, windowMs: 60 * 60_000 };
  }
  if (path === "/api/learning-requests") {
    return { scope: "learning_request", limit: 5, windowMs: 60 * 60_000 };
  }
  if (path === "/api/demand") {
    return { scope: "demand_board", limit: 60, windowMs: 60 * 60_000 };
  }
  if (path === "/api/tutor-reviews") {
    return { scope: "tutor_review", limit: 5, windowMs: 24 * 60 * 60_000 };
  }
  if (path === "/api/learner-ratings") {
    return { scope: "learner_rating", limit: 10, windowMs: 24 * 60 * 60_000 };
  }
  if (path === "/api/media/playback") {
    return { scope: "media_grant", limit: 120, windowMs: 60_000 };
  }
  if (path.startsWith("/api/platform/")) {
    return { scope: "platform_admin", limit: 120, windowMs: 60_000 };
  }
  return { scope: "api_write", limit: 100, windowMs: 60_000 };
}

export async function consumeRateLimit(
  database: D1Database,
  request: Request,
  policy: RateLimitPolicy,
) {
  const now = Date.now();
  const identity = `${policy.scope}|${clientAddress(request)}|${
    request.headers.get("user-agent")?.slice(0, 160) || "unknown"
  }`;
  const bucketKey = await sha256Hex(identity);
  const row = await database.prepare(
    `INSERT INTO rate_limit_buckets
      (bucket_key,scope,request_count,window_started_at,reset_at,updated_at)
     VALUES (?,?,1,?,?,?)
     ON CONFLICT(bucket_key) DO UPDATE SET
       request_count=CASE
         WHEN rate_limit_buckets.reset_at<=excluded.updated_at THEN 1
         ELSE rate_limit_buckets.request_count+1
       END,
       window_started_at=CASE
         WHEN rate_limit_buckets.reset_at<=excluded.updated_at
           THEN excluded.window_started_at
         ELSE rate_limit_buckets.window_started_at
       END,
       reset_at=CASE
         WHEN rate_limit_buckets.reset_at<=excluded.updated_at
           THEN excluded.reset_at
         ELSE rate_limit_buckets.reset_at
       END,
       updated_at=excluded.updated_at
     RETURNING request_count AS requestCount,reset_at AS resetAt`,
  ).bind(
    bucketKey,
    policy.scope,
    now,
    now + policy.windowMs,
    now,
  ).first<RateLimitRow>();
  const requestCount = Number(row?.requestCount || 1);
  const resetAt = Number(row?.resetAt || now + policy.windowMs);
  return {
    allowed: requestCount <= policy.limit,
    limit: policy.limit,
    remaining: Math.max(0, policy.limit - requestCount),
    resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
  };
}

export function rateLimitResponse(result: {
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}) {
  return Response.json(
    { error: "Too many requests. Please wait before trying again." },
    {
      status: 429,
      headers: {
        "retry-after": String(result.retryAfterSeconds),
        "x-ratelimit-limit": String(result.limit),
        "x-ratelimit-remaining": String(result.remaining),
        "x-ratelimit-reset": String(Math.ceil(result.resetAt / 1000)),
      },
    },
  );
}

export function oversizedJsonRequest(request: Request, maxBytes = 1_048_576) {
  if (!["POST", "PUT", "PATCH"].includes(request.method.toUpperCase())) return false;
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return false;
  const length = Number(request.headers.get("content-length") || 0);
  return Number.isFinite(length) && length > maxBytes;
}
