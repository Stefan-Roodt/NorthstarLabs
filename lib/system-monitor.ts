type SystemEventInput = {
  severity?: "info" | "warning" | "error" | "critical";
  source: string;
  eventType: string;
  message: string;
  requestId?: string | null;
  route?: string | null;
  detail?: Record<string, unknown>;
};

function safeDetail(detail?: Record<string, unknown>) {
  if (!detail) return "{}";
  const redacted = Object.fromEntries(
    Object.entries(detail).map(([key, value]) => [
      key,
      /token|secret|password|authorization|cookie|key/i.test(key)
        ? "[redacted]"
        : typeof value === "string"
          ? value.slice(0, 1_000)
          : value,
    ]),
  );
  return JSON.stringify(redacted).slice(0, 8_000);
}

export function safeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "Unknown error");
  return message
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [redacted]")
    .replace(/[A-Za-z0-9_-]{32,}/g, "[redacted]")
    .slice(0, 1_000);
}

export function requestId(request: Request) {
  return request.headers.get("cf-ray") ||
    request.headers.get("x-request-id") ||
    crypto.randomUUID();
}

export async function recordSystemEvent(
  database: D1Database,
  event: SystemEventInput,
) {
  await database.prepare(
    `INSERT INTO system_events
      (id,severity,source,event_type,message,request_id,route,detail_json,status,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
  ).bind(
    crypto.randomUUID(),
    event.severity || "info",
    event.source.slice(0, 80),
    event.eventType.slice(0, 120),
    event.message.slice(0, 1_000),
    event.requestId?.slice(0, 160) || null,
    event.route?.slice(0, 300) || null,
    safeDetail(event.detail),
    "open",
    Date.now(),
  ).run();
}

