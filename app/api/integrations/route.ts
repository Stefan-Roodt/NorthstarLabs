import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../lib/audit-log";
import { emitIntegrationEvent } from "../../../lib/integrations";
import {
  requestedSchoolId,
  requireCreatorSchool,
} from "../../../lib/school-access";
import { requireApiUser } from "../../../lib/server-auth";
import {
  decryptIntegrationCredentials,
  encryptIntegrationCredentials,
  mailchimpSettings,
  testMailchimpConnection,
  testZoomConnection,
} from "../../../lib/provider-integrations";

const supportedEvents = new Set([
  "*",
  "integration.test",
  "product.published",
  "entitlement.granted",
  "entitlement.revoked",
  "live_session.created",
  "live_session.registered",
  "live_session.scheduled",
  "live_session.completed",
  "live_session.cancelled",
  "live_session.attendance_updated",
]);

async function creatorContext(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return { error: Response.json({ error: "Creator access required." }, { status: 403 }) };
  if (!["owner", "admin"].includes(school.memberRole)) {
    return {
      error: Response.json(
        { error: "Academy owner or administrator access is required." },
        { status: 403 },
      ),
    };
  }
  return { user, school };
}

function webhookUrl(value: unknown) {
  if (typeof value !== "string" || value.length > 1_000) return null;
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== "https:") return null;
    if (parsed.username || parsed.password) return null;
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      /^127\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^169\.254\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
    ) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function eventTypes(value: unknown) {
  if (!Array.isArray(value)) return ["*"];
  const events = [...new Set(value
    .filter((event): event is string =>
      typeof event === "string" && supportedEvents.has(event)
    ))].slice(0, 25);
  return events.length ? events : ["*"];
}

function signingSecret() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return `nsl_whsec_${Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

function providerSettings(value: unknown) {
  try {
    const parsed = JSON.parse(String(value || "{}"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function zapierUrl(value: unknown) {
  const endpoint = webhookUrl(value);
  if (!endpoint) return null;
  const parsed = new URL(endpoint);
  if (!["hooks.zapier.com", "zapier.com"].includes(parsed.hostname.toLowerCase())) return null;
  return parsed.pathname.includes("/hooks/catch/") ? endpoint : null;
}

export async function GET(request: Request) {
  const context = await creatorContext(request);
  if ("error" in context) return context.error;
  const [integrations, deliveries] = await Promise.all([
    env.DB.prepare(
      `SELECT id,provider,name,endpoint_url AS endpointUrl,
        event_types_json AS eventTypesJson,status,
        settings_json AS settingsJson,
        last_delivery_at AS lastDeliveryAt,
        last_delivery_status AS lastDeliveryStatus,
        created_at AS createdAt,updated_at AS updatedAt
       FROM integrations WHERE school_id=?
       ORDER BY created_at DESC`,
    ).bind(context.school.id).all(),
    env.DB.prepare(
      `SELECT d.id,d.integration_id AS integrationId,d.event_type AS eventType,
        d.status,d.response_status AS responseStatus,d.error_message AS errorMessage,
        d.created_at AS createdAt,d.delivered_at AS deliveredAt
       FROM integration_deliveries d
       JOIN integrations i ON i.id=d.integration_id
       WHERE i.school_id=? ORDER BY d.created_at DESC LIMIT 100`,
    ).bind(context.school.id).all(),
  ]);
  return Response.json({
    integrations: integrations.results.map((integration: Record<string, unknown>) => {
      const parsedEvents = JSON.parse(String(integration.eventTypesJson || "[]"));
      return {
        ...integration,
        eventTypes: Array.isArray(parsedEvents) ? parsedEvents : [],
        settings: providerSettings(integration.settingsJson),
        eventTypesJson: undefined,
        settingsJson: undefined,
      };
    }),
    deliveries: deliveries.results,
    supportedEvents: [...supportedEvents],
  });
}

export async function POST(request: Request) {
  const context = await creatorContext(request);
  if ("error" in context) return context.error;
  const body = await request.json() as Record<string, unknown>;
  if (body.action === "test") {
    const integration = await env.DB.prepare(
      "SELECT id FROM integrations WHERE id=? AND school_id=? AND status='active'",
    ).bind(String(body.integrationId || ""), context.school.id).first();
    if (!integration) return Response.json({ error: "Integration not found." }, { status: 404 });
    const deliveries = await emitIntegrationEvent(
      env.DB,
      context.school.id,
      "integration.test",
      {
        schoolId: context.school.id,
        schoolName: context.school.name,
        requestedBy: context.user.id,
      },
      String(body.integrationId),
    );
    return Response.json({ tested: true, deliveries });
  }

  if (body.action === "connect_provider") {
    const provider = String(body.provider || "");
    if (!["zoom", "mailchimp", "zapier", "google_analytics"].includes(provider)) {
      return Response.json({ error: "Unsupported provider." }, { status: 400 });
    }
    let name = "";
    let endpointUrl: string | null = null;
    let events: string[] = [];
    let secret: string | null = null;
    let settings: Record<string, string> = {};
    let credentials: string | null = null;
    let connectedLabel = "Connection verified";
    try {
      if (provider === "zoom") {
        const zoomCredentials = {
          accountId: String(body.accountId || "").trim(),
          clientId: String(body.clientId || "").trim(),
          clientSecret: String(body.clientSecret || "").trim(),
        };
        settings = { hostEmail: String(body.hostEmail || "").trim().slice(0, 200) };
        if (!zoomCredentials.accountId || !zoomCredentials.clientId || !zoomCredentials.clientSecret) {
          throw new Error("Add the Zoom account ID, client ID and client secret.");
        }
        connectedLabel = await testZoomConnection(zoomCredentials, settings as { hostEmail: string });
        credentials = await encryptIntegrationCredentials(zoomCredentials);
        name = "Zoom meetings";
      } else if (provider === "mailchimp") {
        const configured = mailchimpSettings(
          String(body.apiKey || ""),
          String(body.audienceId || ""),
          String(body.tag || ""),
        );
        connectedLabel = await testMailchimpConnection(configured.credentials, configured.settings);
        credentials = await encryptIntegrationCredentials(configured.credentials);
        settings = configured.settings;
        events = ["entitlement.granted"];
        name = "Mailchimp audience";
      } else if (provider === "zapier") {
        endpointUrl = zapierUrl(body.endpointUrl);
        if (!endpointUrl) throw new Error("Paste a valid Webhooks by Zapier Catch Hook URL.");
        events = eventTypes(body.eventTypes);
        secret = signingSecret();
        name = "Zapier automation";
      } else {
        const measurementId = String(body.measurementId || "").trim().toUpperCase();
        if (!/^(G|GT)-[A-Z0-9]+$/.test(measurementId)) {
          throw new Error("Add a valid Google tag ID such as G-XXXXXXXXXX.");
        }
        settings = { measurementId };
        connectedLabel = measurementId;
        name = "Google Analytics";
      }
    } catch (error) {
      return Response.json({
        error: error instanceof Error ? error.message : "The provider could not be connected.",
      }, { status: 400 });
    }

    const existing = await env.DB.prepare(
      "SELECT id FROM integrations WHERE school_id=? AND provider=? ORDER BY updated_at DESC LIMIT 1",
    ).bind(context.school.id, provider).first<{ id: string }>();
    const id = existing?.id || crypto.randomUUID();
    const now = Date.now();
    if (existing) {
      await env.DB.prepare(
        `UPDATE integrations SET name=?,endpoint_url=?,event_types_json=?,signing_secret=?,
          settings_json=?,credentials_json=?,status='active',last_delivery_at=?,
          last_delivery_status='connected',updated_at=? WHERE id=?`,
      ).bind(
        name,
        endpointUrl,
        JSON.stringify(events),
        secret,
        JSON.stringify(settings),
        credentials,
        now,
        now,
        id,
      ).run();
    } else {
      await env.DB.prepare(
        `INSERT INTO integrations
          (id,school_id,created_by,provider,name,endpoint_url,event_types_json,
           signing_secret,settings_json,credentials_json,status,last_delivery_at,
           last_delivery_status,created_at,updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,'active',?,'connected',?,?)`,
      ).bind(
        id,
        context.school.id,
        context.user.id,
        provider,
        name,
        endpointUrl,
        JSON.stringify(events),
        secret,
        JSON.stringify(settings),
        credentials,
        now,
        now,
        now,
      ).run();
    }
    await writeAuditLog({
      actorId: context.user.id,
      schoolId: context.school.id,
      action: `integration.${provider}.connect`,
      targetType: "integration",
      targetId: id,
      detail: { provider, connectedLabel },
    });
    return Response.json({ connected: true, id, provider, connectedLabel });
  }

  if (body.action === "test_provider") {
    const integration = await env.DB.prepare(
      `SELECT id,provider,endpoint_url AS endpointUrl,event_types_json AS eventTypesJson,
        credentials_json AS credentialsJson,settings_json AS settingsJson
       FROM integrations WHERE id=? AND school_id=? AND status='active'`,
    ).bind(String(body.integrationId || ""), context.school.id).first<{
      id: string;
      provider: string;
      endpointUrl: string | null;
      eventTypesJson: string;
      credentialsJson: string | null;
      settingsJson: string;
    }>();
    if (!integration) return Response.json({ error: "Connection not found." }, { status: 404 });
    try {
      let label = "Configuration is valid";
      if (integration.provider === "zoom") {
        label = await testZoomConnection(
          await decryptIntegrationCredentials(integration.credentialsJson),
          providerSettings(integration.settingsJson) as { hostEmail: string },
        );
      } else if (integration.provider === "mailchimp") {
        label = await testMailchimpConnection(
          await decryptIntegrationCredentials(integration.credentialsJson),
          providerSettings(integration.settingsJson) as {
            audienceId: string; dataCenter: string; tag: string;
          },
        );
      } else if (integration.provider === "zapier") {
        const deliveries = await emitIntegrationEvent(
          env.DB,
          context.school.id,
          "integration.test",
          { schoolId: context.school.id, schoolName: context.school.name },
          integration.id,
        );
        if (!deliveries.some((delivery: { status: string }) => delivery.status === "delivered")) {
          throw new Error("Zapier did not accept the test. Make sure the Zap is listening or switched on.");
        }
        label = "Test event delivered to Zapier";
      }
      await env.DB.prepare(
        "UPDATE integrations SET last_delivery_at=?,last_delivery_status='connected',updated_at=? WHERE id=?",
      ).bind(Date.now(), Date.now(), integration.id).run();
      return Response.json({ tested: true, label });
    } catch (error) {
      return Response.json({
        error: error instanceof Error ? error.message : "The connection test failed.",
      }, { status: 400 });
    }
  }

  const endpointUrl = webhookUrl(body.endpointUrl);
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
  if (!endpointUrl || name.length < 2) {
    return Response.json(
      { error: "Add a name and a public HTTPS webhook endpoint." },
      { status: 400 },
    );
  }
  const id = crypto.randomUUID();
  const secret = signingSecret();
  const now = Date.now();
  const events = eventTypes(body.eventTypes);
  await env.DB.prepare(
    `INSERT INTO integrations
      (id,school_id,created_by,provider,name,endpoint_url,event_types_json,
       signing_secret,status,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  ).bind(
    id,
    context.school.id,
    context.user.id,
    "webhook",
    name,
    endpointUrl,
    JSON.stringify(events),
    secret,
    "active",
    now,
    now,
  ).run();
  await writeAuditLog({
    actorId: context.user.id,
    schoolId: context.school.id,
    action: "integration.webhook.create",
    targetType: "integration",
    targetId: id,
    detail: { name, endpointUrl, events },
  });
  return Response.json({
    id,
    provider: "webhook",
    name,
    endpointUrl,
    eventTypes: events,
    status: "active",
    signingSecret: secret,
    createdAt: now,
    message: "Copy the signing secret now. It will not be shown again.",
  }, { status: 201 });
}

export async function PATCH(request: Request) {
  const context = await creatorContext(request);
  if ("error" in context) return context.error;
  const body = await request.json() as Record<string, unknown>;
  const integration = await env.DB.prepare(
    `SELECT id,provider,name,endpoint_url AS endpointUrl,event_types_json AS eventTypesJson,
      status FROM integrations WHERE id=? AND school_id=?`,
  ).bind(String(body.id || ""), context.school.id).first<{
    id: string;
    provider: string;
    name: string;
    endpointUrl: string | null;
    eventTypesJson: string;
    status: string;
  }>();
  if (!integration) return Response.json({ error: "Integration not found." }, { status: 404 });
  const status = ["active", "paused"].includes(String(body.status))
    ? String(body.status)
    : integration.status;
  const webhookProvider = ["webhook", "zapier"].includes(integration.provider);
  const endpointUrl = !webhookProvider
    ? integration.endpointUrl
    : body.endpointUrl === undefined
      ? integration.endpointUrl
      : webhookUrl(body.endpointUrl);
  if (webhookProvider && !endpointUrl) {
    return Response.json({ error: "A public HTTPS endpoint is required." }, { status: 400 });
  }
  const name = typeof body.name === "string"
    ? body.name.trim().slice(0, 100)
    : integration.name;
  const events = !webhookProvider || body.eventTypes === undefined
    ? JSON.parse(integration.eventTypesJson)
    : eventTypes(body.eventTypes);
  await env.DB.prepare(
    `UPDATE integrations SET name=?,endpoint_url=?,event_types_json=?,
      status=?,updated_at=? WHERE id=?`,
  ).bind(name, endpointUrl, JSON.stringify(events), status, Date.now(), integration.id).run();
  await writeAuditLog({
    actorId: context.user.id,
    schoolId: context.school.id,
    action: "integration.webhook.update",
    targetType: "integration",
    targetId: integration.id,
    detail: { name, endpointUrl, events, status },
  });
  return Response.json({ saved: true, id: integration.id, name, endpointUrl, eventTypes: events, status });
}

export async function DELETE(request: Request) {
  const context = await creatorContext(request);
  if ("error" in context) return context.error;
  const id = new URL(request.url).searchParams.get("id") || "";
  const integration = await env.DB.prepare(
    "SELECT id,provider FROM integrations WHERE id=? AND school_id=?",
  ).bind(id, context.school.id).first<{ id: string; provider: string }>();
  if (!integration) return Response.json({ error: "Integration not found." }, { status: 404 });
  await env.DB.batch([
    env.DB.prepare("DELETE FROM integration_deliveries WHERE integration_id=?").bind(id),
    env.DB.prepare("DELETE FROM integrations WHERE id=?").bind(id),
  ]);
  await writeAuditLog({
    actorId: context.user.id,
    schoolId: context.school.id,
    action: `integration.${integration.provider}.delete`,
    targetType: "integration",
    targetId: id,
  });
  return Response.json({ deleted: true });
}
