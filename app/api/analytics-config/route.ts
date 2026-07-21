import { env } from "cloudflare:workers";

function pathParts(value: string) {
  try {
    return new URL(value, "https://northstarlabs.co.za").pathname
      .split("/")
      .filter(Boolean)
      .map(decodeURIComponent);
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const parts = pathParts(new URL(request.url).searchParams.get("path") || "/");
  let schoolId = "";
  if (parts[0] === "schools" && parts[1]) {
    const school = await env.DB.prepare("SELECT id FROM schools WHERE slug=? AND status='active'")
      .bind(parts[1]).first<{ id: string }>();
    schoolId = school?.id || "";
  } else if (["courses", "learn"].includes(parts[0]) && parts[1]) {
    const course = await env.DB.prepare("SELECT school_id AS schoolId FROM courses WHERE id=?")
      .bind(parts[1]).first<{ schoolId: string }>();
    schoolId = course?.schoolId || "";
  }

  let measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";
  if (schoolId) {
    const integration = await env.DB.prepare(
      `SELECT settings_json AS settingsJson FROM integrations
       WHERE school_id=? AND provider='google_analytics' AND status='active'
       ORDER BY updated_at DESC LIMIT 1`,
    ).bind(schoolId).first<{ settingsJson: string }>();
    if (integration) {
      try {
        const settings = JSON.parse(integration.settingsJson) as { measurementId?: string };
        measurementId = settings.measurementId || measurementId;
      } catch {
        // Retain the platform measurement ID when a stale academy setting cannot be read.
      }
    }
  }
  if (!/^(G|GT)-[A-Z0-9]+$/.test(measurementId)) measurementId = "";
  return Response.json(
    { measurementId },
    { headers: { "cache-control": "public, max-age=300" } },
  );
}
