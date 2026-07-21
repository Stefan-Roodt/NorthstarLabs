type ZoomCredentials = {
  accountId: string;
  clientId: string;
  clientSecret: string;
};

type ZoomSettings = {
  hostEmail: string;
};

type MailchimpCredentials = {
  apiKey: string;
};

type MailchimpSettings = {
  audienceId: string;
  dataCenter: string;
  tag: string;
};

type ProviderRow = {
  id: string;
  credentialsJson: string | null;
  settingsJson: string;
};

function integrationKey() {
  const value = process.env.INTEGRATION_ENCRYPTION_KEY?.trim();
  if (!value || value.length < 32) {
    throw new Error("Provider connections are unavailable until the integration security key is configured.");
  }
  return value;
}

function base64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function unbase64(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function aesKey() {
  const material = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(integrationKey()),
  );
  return crypto.subtle.importKey("raw", material, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export async function encryptIntegrationCredentials(value: Record<string, string>) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await aesKey(),
    new TextEncoder().encode(JSON.stringify(value)),
  );
  return `v1.${base64(iv)}.${base64(new Uint8Array(encrypted))}`;
}

export async function decryptIntegrationCredentials<T>(value: string | null) {
  const [version, iv, encrypted] = String(value || "").split(".");
  if (version !== "v1" || !iv || !encrypted) throw new Error("Provider credentials are unavailable.");
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: unbase64(iv) },
    await aesKey(),
    unbase64(encrypted),
  );
  return JSON.parse(new TextDecoder().decode(decrypted)) as T;
}

function parseSettings<T>(value: string) {
  try {
    return JSON.parse(value || "{}") as T;
  } catch {
    return {} as T;
  }
}

async function zoomToken(credentials: ZoomCredentials) {
  const response = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(credentials.accountId)}`,
    {
      method: "POST",
      headers: {
        authorization: `Basic ${btoa(`${credentials.clientId}:${credentials.clientSecret}`)}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      signal: AbortSignal.timeout(10_000),
    },
  );
  const result = await response.json() as { access_token?: string; api_url?: string; reason?: string; error?: string };
  if (!response.ok || !result.access_token) {
    throw new Error(result.reason || result.error || "Zoom rejected these credentials.");
  }
  const apiUrl = result.api_url?.startsWith("https://") ? result.api_url : "https://api.zoom.us";
  return { accessToken: result.access_token, apiUrl };
}

export async function testZoomConnection(credentials: ZoomCredentials, settings: ZoomSettings) {
  const token = await zoomToken(credentials);
  const user = settings.hostEmail.trim() || "me";
  const response = await fetch(`${token.apiUrl}/v2/users/${encodeURIComponent(user)}`, {
    headers: { authorization: `Bearer ${token.accessToken}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Zoom connected, but the host could not be found. Check the host email and app scopes.");
  const result = await response.json() as { email?: string; display_name?: string };
  return result.display_name || result.email || user;
}

export async function createZoomMeeting(
  db: D1Database,
  schoolId: string,
  meeting: { title: string; description: string; startsAt: number; endsAt: number; timezone: string },
) {
  const integration = await db.prepare(
    `SELECT id,credentials_json AS credentialsJson,settings_json AS settingsJson
     FROM integrations WHERE school_id=? AND provider='zoom' AND status='active'
     ORDER BY updated_at DESC LIMIT 1`,
  ).bind(schoolId).first<ProviderRow>();
  if (!integration) throw new Error("Connect Zoom in Integrations, or paste a meeting link.");
  const credentials = await decryptIntegrationCredentials<ZoomCredentials>(integration.credentialsJson);
  const settings = parseSettings<ZoomSettings>(integration.settingsJson);
  const token = await zoomToken(credentials);
  const host = settings.hostEmail?.trim() || "me";
  const response = await fetch(`${token.apiUrl}/v2/users/${encodeURIComponent(host)}/meetings`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token.accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      topic: meeting.title,
      agenda: meeting.description,
      type: 2,
      start_time: new Date(meeting.startsAt).toISOString(),
      duration: Math.max(1, Math.ceil((meeting.endsAt - meeting.startsAt) / 60_000)),
      timezone: meeting.timezone,
      settings: {
        waiting_room: true,
        join_before_host: false,
        mute_upon_entry: true,
      },
    }),
    signal: AbortSignal.timeout(12_000),
  });
  const result = await response.json() as { join_url?: string; message?: string };
  if (!response.ok || !result.join_url) {
    throw new Error(result.message || "Zoom could not create this meeting.");
  }
  return result.join_url;
}

function mailchimpAuthorization(apiKey: string) {
  return `Basic ${btoa(`northstarlabs:${apiKey}`)}`;
}

export function mailchimpSettings(apiKey: string, audienceId: string, tag: string) {
  const dataCenter = apiKey.trim().split("-").pop()?.toLowerCase() || "";
  if (!/^[a-z0-9-]{2,20}$/.test(dataCenter) || audienceId.trim().length < 2) {
    throw new Error("Add a valid Mailchimp API key and audience ID.");
  }
  return {
    credentials: { apiKey: apiKey.trim() },
    settings: {
      audienceId: audienceId.trim(),
      dataCenter,
      tag: tag.trim().slice(0, 80) || "Northstar learner",
    },
  };
}

export async function testMailchimpConnection(credentials: MailchimpCredentials, settings: MailchimpSettings) {
  const response = await fetch(
    `https://${settings.dataCenter}.api.mailchimp.com/3.0/lists/${encodeURIComponent(settings.audienceId)}`,
    {
      headers: { authorization: mailchimpAuthorization(credentials.apiKey) },
      signal: AbortSignal.timeout(10_000),
    },
  );
  const result = await response.json() as { name?: string; detail?: string; title?: string };
  if (!response.ok) throw new Error(result.detail || result.title || "Mailchimp rejected this connection.");
  return result.name || "Mailchimp audience";
}

export async function syncMailchimpLearner(
  integration: ProviderRow,
  data: Record<string, unknown>,
) {
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  if (!email) throw new Error("The learner event did not include an email address.");
  const credentials = await decryptIntegrationCredentials<MailchimpCredentials>(integration.credentialsJson);
  const settings = parseSettings<MailchimpSettings>(integration.settingsJson);
  const response = await fetch(
    `https://${settings.dataCenter}.api.mailchimp.com/3.0/lists/${encodeURIComponent(settings.audienceId)}/members`,
    {
      method: "POST",
      headers: {
        authorization: mailchimpAuthorization(credentials.apiKey),
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "pending",
        tags: settings.tag ? [settings.tag] : [],
      }),
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (response.ok) return response.status;
  const result = await response.json() as { title?: string; detail?: string };
  if (result.title === "Member Exists") return 200;
  throw new Error(result.detail || result.title || "Mailchimp could not add this learner.");
}
