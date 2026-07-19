type WebhookIntegration = {
  id: string;
  endpointUrl: string;
  eventTypesJson: string;
  signingSecret: string;
};

function enabledFor(eventTypesJson: string, eventType: string) {
  try {
    const configured = JSON.parse(eventTypesJson);
    return Array.isArray(configured) &&
      (configured.includes("*") || configured.includes(eventType));
  } catch {
    return false;
  }
}

function hexadecimal(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function signature(secret: string, timestamp: string, body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return hexadecimal(await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${body}`),
  ));
}

export async function emitIntegrationEvent(
  db: D1Database,
  schoolId: string,
  eventType: string,
  data: Record<string, unknown>,
  onlyIntegrationId?: string,
) {
  const rows = await db.prepare(
    `SELECT id,endpoint_url AS endpointUrl,event_types_json AS eventTypesJson,
      signing_secret AS signingSecret
     FROM integrations
     WHERE school_id=? AND provider='webhook' AND status='active'
       AND endpoint_url IS NOT NULL AND signing_secret IS NOT NULL`,
  ).bind(schoolId).all<WebhookIntegration>();
  const integrations = rows.results.filter((integration) =>
    onlyIntegrationId
      ? integration.id === onlyIntegrationId
      : enabledFor(integration.eventTypesJson, eventType)
  );
  const eventId = crypto.randomUUID();
  const createdAt = Date.now();
  const payload = JSON.stringify({
    id: eventId,
    type: eventType,
    createdAt,
    data,
  });

  return Promise.all(integrations.map(async (integration) => {
    const deliveryId = crypto.randomUUID();
    await db.prepare(
      `INSERT INTO integration_deliveries
        (id,integration_id,event_type,payload_json,status,created_at)
       VALUES (?,?,?,?,?,?)`,
    ).bind(
      deliveryId,
      integration.id,
      eventType,
      payload,
      "pending",
      createdAt,
    ).run();
    const timestamp = String(Math.floor(createdAt / 1000));
    try {
      const response = await fetch(integration.endpointUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "NorthStarLabs-Webhooks/1.0",
          "x-northstar-event": eventType,
          "x-northstar-delivery": deliveryId,
          "x-northstar-timestamp": timestamp,
          "x-northstar-signature": `sha256=${await signature(
            integration.signingSecret,
            timestamp,
            payload,
          )}`,
        },
        body: payload,
        signal: AbortSignal.timeout(8_000),
      });
      const status = response.ok ? "delivered" : "failed";
      await db.batch([
        db.prepare(
          `UPDATE integration_deliveries
           SET status=?,response_status=?,delivered_at=? WHERE id=?`,
        ).bind(status, response.status, Date.now(), deliveryId),
        db.prepare(
          `UPDATE integrations
           SET last_delivery_at=?,last_delivery_status=?,updated_at=?
           WHERE id=?`,
        ).bind(Date.now(), status, Date.now(), integration.id),
      ]);
      return { integrationId: integration.id, status, responseStatus: response.status };
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 240) : "Delivery failed.";
      await db.batch([
        db.prepare(
          `UPDATE integration_deliveries
           SET status='failed',error_message=?,delivered_at=? WHERE id=?`,
        ).bind(message, Date.now(), deliveryId),
        db.prepare(
          `UPDATE integrations
           SET last_delivery_at=?,last_delivery_status='failed',updated_at=?
           WHERE id=?`,
        ).bind(Date.now(), Date.now(), integration.id),
      ]);
      return { integrationId: integration.id, status: "failed" };
    }
  }));
}
