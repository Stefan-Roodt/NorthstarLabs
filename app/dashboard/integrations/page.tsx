"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

type Integration = {
  id: string;
  provider: string;
  name: string;
  endpointUrl: string;
  eventTypes: string[];
  settings: Record<string, string>;
  status: string;
  lastDeliveryAt: number | null;
  lastDeliveryStatus: string | null;
  createdAt: number;
};
type Delivery = {
  id: string;
  integrationId: string;
  eventType: string;
  status: string;
  responseStatus: number | null;
  errorMessage: string | null;
  createdAt: number;
};
type IntegrationData = {
  integrations: Integration[];
  deliveries: Delivery[];
  supportedEvents: string[];
};
type StudioCapabilities = {
  blueprint: boolean;
  quizzes: boolean;
  narration: boolean;
  videoClips: boolean;
  aiNarration: boolean;
  aiVideoClips: boolean;
  provider: string;
};

const eventLabels: Record<string, string> = {
  "product.published": "Product published",
  "entitlement.granted": "Access granted",
  "entitlement.revoked": "Access revoked",
  "live_session.created": "Live session created",
  "live_session.registered": "Live registration",
  "live_session.completed": "Live session completed",
  "live_session.cancelled": "Live session cancelled",
  "live_session.attendance_updated": "Attendance updated",
};

export default function IntegrationsPage() {
  const supabase = getSupabaseBrowser();
  const [data, setData] = useState<IntegrationData | null>(null);
  const [studioCapabilities, setStudioCapabilities] = useState<StudioCapabilities | null>(null);
  const [name, setName] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["*"]);
  const [revealedSecret, setRevealedSecret] = useState("");
  const [message, setMessage] = useState("Loading integrations...");
  const [busy, setBusy] = useState("");
  const [zoom, setZoom] = useState({ accountId: "", clientId: "", clientSecret: "", hostEmail: "" });
  const [mailchimp, setMailchimp] = useState({ apiKey: "", audienceId: "", tag: "Northstar learner" });
  const [zapierUrl, setZapierUrl] = useState("");
  const [measurementId, setMeasurementId] = useState("");

  const token = useCallback(async () => {
    return (await supabase?.auth.getSession())?.data.session?.access_token || "";
  }, [supabase]);
  const authed = useCallback(async (path: string, init?: RequestInit) => fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      authorization: `Bearer ${await token()}`,
      ...(init?.headers || {}),
    },
  }), [token]);

  const load = useCallback(async () => {
    if (!supabase) return;
    if (!(await supabase.auth.getSession()).data.session) {
      location.href = "/login?next=/dashboard/integrations";
      return;
    }
    const [response, studioResponse] = await Promise.all([
      authed("/api/integrations"),
      authed("/api/creator-studio"),
    ]);
    if (!response.ok) {
      setMessage("Integrations could not be loaded.");
      return;
    }
    setData(await response.json());
    if (studioResponse.ok) {
      const studio = await studioResponse.json() as { capabilities: StudioCapabilities };
      setStudioCapabilities(studio.capabilities);
    }
    setMessage("");
  }, [authed, supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function toggleEvent(eventType: string) {
    if (eventType === "*") {
      setSelectedEvents(["*"]);
      return;
    }
    setSelectedEvents((current) => {
      const withoutAll = current.filter((event) => event !== "*");
      return withoutAll.includes(eventType)
        ? withoutAll.filter((event) => event !== eventType)
        : [...withoutAll, eventType];
    });
  }

  async function createWebhook(event: FormEvent) {
    event.preventDefault();
    setBusy("create");
    setRevealedSecret("");
    const response = await authed("/api/integrations", {
      method: "POST",
      body: JSON.stringify({ name, endpointUrl, eventTypes: selectedEvents }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "The webhook could not be created.");
      setBusy("");
      return;
    }
    setRevealedSecret(result.signingSecret);
    setMessage(result.message);
    setName("");
    setEndpointUrl("");
    setSelectedEvents(["*"]);
    await load();
    setBusy("");
  }

  async function updateStatus(integration: Integration) {
    setBusy(integration.id);
    const response = await authed("/api/integrations", {
      method: "PATCH",
      body: JSON.stringify({
        id: integration.id,
        status: integration.status === "active" ? "paused" : "active",
      }),
    });
    const result = await response.json();
    setMessage(response.ok
      ? integration.status === "active" ? "Webhook paused." : "Webhook activated."
      : result.error || "The webhook could not be updated.");
    await load();
    setBusy("");
  }

  async function testWebhook(integration: Integration) {
    setBusy(integration.id);
    const response = await authed("/api/integrations", {
      method: "POST",
      body: JSON.stringify({ action: "test", integrationId: integration.id }),
    });
    const result = await response.json();
    const delivery = result.deliveries?.find((item: { integrationId: string }) =>
      item.integrationId === integration.id
    );
    setMessage(response.ok
      ? delivery?.status === "delivered" ? "Test event delivered successfully." : "Test sent; check the delivery result below."
      : result.error || "The test could not be sent.");
    await load();
    setBusy("");
  }

  async function deleteWebhook(integration: Integration) {
    if (!confirm(`Delete ${integration.name} and its delivery history?`)) return;
    setBusy(integration.id);
    const response = await authed(`/api/integrations?id=${encodeURIComponent(integration.id)}`, { method: "DELETE" });
    const result = await response.json();
    setMessage(response.ok ? "Connection removed." : result.error || "The connection could not be removed.");
    await load();
    setBusy("");
  }

  async function connectProvider(provider: string, values: Record<string, unknown>) {
    setBusy(provider);
    const response = await authed("/api/integrations", {
      method: "POST",
      body: JSON.stringify({ action: "connect_provider", provider, ...values }),
    });
    const result = await response.json();
    setMessage(response.ok
      ? `${provider.replaceAll("_", " ")} connected: ${result.connectedLabel}.`
      : result.error || "The provider could not be connected.");
    if (response.ok) {
      if (provider === "zoom") setZoom({ accountId: "", clientId: "", clientSecret: "", hostEmail: "" });
      if (provider === "mailchimp") setMailchimp({ apiKey: "", audienceId: "", tag: "Northstar learner" });
      if (provider === "zapier") setZapierUrl("");
      if (provider === "google_analytics") setMeasurementId("");
      await load();
    }
    setBusy("");
  }

  async function testProvider(integration: Integration) {
    setBusy(integration.id);
    const response = await authed("/api/integrations", {
      method: "POST",
      body: JSON.stringify({ action: "test_provider", integrationId: integration.id }),
    });
    const result = await response.json();
    setMessage(response.ok ? result.label : result.error || "The connection test failed.");
    await load();
    setBusy("");
  }

  async function copySecret() {
    await navigator.clipboard.writeText(revealedSecret);
    setMessage("Signing secret copied.");
  }

  async function signOut() {
    await supabase?.auth.signOut();
    location.href = "/dashboard";
  }

  if (!data) return <main className="system-loading"><div><b>NorthStarLabs</b><p>{message}</p></div></main>;

  return <main className="integration-page">
    <header className="product-admin-top">
      <Link className="system-brand" href="/dashboard">* NORTHSTARLABS</Link>
      <nav><Link href="/dashboard/control">Control centre</Link><Link href="/dashboard/products">Products</Link><Link href="/dashboard/live">Live learning</Link><Link href="/account">Account settings</Link><button onClick={signOut}>Sign out</button></nav>
    </header>
    <section className="integration-hero">
      <div><p className="sys-kicker">MOBILE & INTEGRATIONS</p><h1>Connect learning to the rest of the work.</h1><p>Calendar downloads, meeting links and installable mobile access work immediately. Signed webhooks connect NorthStarLabs events to automation tools, CRMs and your own systems.</p></div>
      <span><strong>{data.integrations.filter((item) => item.status === "active").length}</strong> active connections</span>
    </section>

    <section className="integration-grid">
      {message && <div className="notice integration-notice" role="status">{message}</div>}
      <section className="native-integrations">
        <article className="panel native-integration-card"><span>01</span><div><p className="sys-kicker">CALENDAR</p><h2>Apple, Google & Outlook</h2><p>Every eligible live session can be downloaded as a standards-based calendar file with its secure meeting link.</p><b>READY</b></div></article>
        <article className="panel native-integration-card"><span>02</span><div><p className="sys-kicker">AUTOMATION</p><h2>Signed event delivery</h2><p>Northstar can send verified product, learner and live-session activity to compatible HTTPS endpoints.</p><b>READY</b></div></article>
        <article className="panel native-integration-card"><span>03</span><div><p className="sys-kicker">MOBILE</p><h2>Installable learning app</h2><p>Phones and tablets can install NorthStarLabs from the browser, launch full-screen and keep the learning shell available during brief network interruptions.</p><b>READY</b></div></article>
      </section>

      <section className="provider-connections" id="provider-connections">
        <div className="product-section-heading"><span>PROVIDERS</span><div><h2>Connect the services you already use</h2><p>Each connection is academy-specific. Secrets are encrypted, never shown again, and excluded from exports.</p></div></div>
        <div className="provider-connection-grid">
          <article className="panel provider-connection-card">
            <div className="provider-card-heading"><span>Z</span><div><p className="sys-kicker">LIVE LEARNING</p><h3>Zoom</h3></div>{providerStatus(data.integrations, "zoom")}</div>
            <p>Create scheduled Zoom meetings directly from Live Learning. A manually pasted meeting URL remains available as a fallback.</p>
            <label>Account ID<input value={zoom.accountId} onChange={(event) => setZoom({ ...zoom, accountId: event.target.value })} /></label>
            <label>Client ID<input value={zoom.clientId} onChange={(event) => setZoom({ ...zoom, clientId: event.target.value })} /></label>
            <label>Client secret<input type="password" autoComplete="new-password" value={zoom.clientSecret} onChange={(event) => setZoom({ ...zoom, clientSecret: event.target.value })} /></label>
            <label>Host email <small>Optional; defaults to the Zoom account owner.</small><input type="email" value={zoom.hostEmail} onChange={(event) => setZoom({ ...zoom, hostEmail: event.target.value })} /></label>
            <ProviderActions provider="zoom" integrations={data.integrations} busy={busy} connectDisabled={!zoom.accountId || !zoom.clientId || !zoom.clientSecret} onConnect={() => connectProvider("zoom", zoom)} onTest={testProvider} onDelete={deleteWebhook} />
          </article>

          <article className="panel provider-connection-card">
            <div className="provider-card-heading"><span>M</span><div><p className="sys-kicker">AUDIENCE</p><h3>Mailchimp</h3></div>{providerStatus(data.integrations, "mailchimp")}</div>
            <p>Send newly granted learners to one Mailchimp audience as pending contacts. Mailchimp asks them to confirm before marketing starts.</p>
            <label>API key<input type="password" autoComplete="new-password" value={mailchimp.apiKey} onChange={(event) => setMailchimp({ ...mailchimp, apiKey: event.target.value })} /></label>
            <label>Audience ID<input value={mailchimp.audienceId} onChange={(event) => setMailchimp({ ...mailchimp, audienceId: event.target.value })} /></label>
            <label>Tag<input value={mailchimp.tag} onChange={(event) => setMailchimp({ ...mailchimp, tag: event.target.value })} /></label>
            <ProviderActions provider="mailchimp" integrations={data.integrations} busy={busy} connectDisabled={!mailchimp.apiKey || !mailchimp.audienceId} onConnect={() => connectProvider("mailchimp", mailchimp)} onTest={testProvider} onDelete={deleteWebhook} />
          </article>

          <article className="panel provider-connection-card">
            <div className="provider-card-heading"><span>?</span><div><p className="sys-kicker">NO-CODE AUTOMATION</p><h3>Zapier</h3></div>{providerStatus(data.integrations, "zapier")}</div>
            <p>Paste a Webhooks by Zapier Catch Hook URL, choose events, and test the Zap before relying on it.</p>
            <label>Catch Hook URL<input type="url" value={zapierUrl} onChange={(event) => setZapierUrl(event.target.value)} placeholder="https://hooks.zapier.com/hooks/catch/..." /></label>
            <fieldset className="webhook-events compact"><legend>Send these events</legend>
              <label><input type="checkbox" checked={selectedEvents.includes("*")} onChange={() => toggleEvent("*")} /><span><b>All events</b></span></label>
              {Object.entries(eventLabels).map(([eventType, label]) => <label key={eventType}><input type="checkbox" checked={selectedEvents.includes(eventType)} onChange={() => toggleEvent(eventType)} /><span><b>{label}</b></span></label>)}
            </fieldset>
            <ProviderActions provider="zapier" integrations={data.integrations} busy={busy} connectDisabled={!zapierUrl || selectedEvents.length === 0} onConnect={() => connectProvider("zapier", { endpointUrl: zapierUrl, eventTypes: selectedEvents })} onTest={testProvider} onDelete={deleteWebhook} />
          </article>

          <article className="panel provider-connection-card">
            <div className="provider-card-heading"><span>G</span><div><p className="sys-kicker">MEASUREMENT</p><h3>Google Analytics</h3></div>{providerStatus(data.integrations, "google_analytics")}</div>
            <p>Measure academy and course page usage only after the visitor allows analytics. Private learning data is excluded.</p>
            <label>Google tag ID<input value={measurementId} onChange={(event) => setMeasurementId(event.target.value.toUpperCase())} placeholder="G-XXXXXXXXXX" /></label>
            <ProviderActions provider="google_analytics" integrations={data.integrations} busy={busy} connectDisabled={!measurementId} onConnect={() => connectProvider("google_analytics", { measurementId })} onTest={testProvider} onDelete={deleteWebhook} />
          </article>
        </div>
      </section>

      <section className="panel creator-provider-panel" id="creator-studio-providers">
        <div className="product-section-heading"><span>CREATOR AUTOMATION</span><div><h2>Creator Studio engines</h2><p>Core drafting, self-recorded narration and branded lesson intros work inside Northstar. Connect an optional provider only for fully AI-generated media.</p></div></div>
        <div className="creator-provider-summary">
          <div><span>Current engine</span><b>{studioCapabilities?.provider || "Checking connection..."}</b><small>The native engine keeps approved source text inside Northstar.</small></div>
          <div><span>Course drafts & checks</span><b>{studioCapabilities?.blueprint && studioCapabilities?.quizzes ? "Ready" : "Setup required"}</b><small>Built-in structures, activities and assessment feedback need no external key.</small></div>
          <div><span>Narration</span><b>{studioCapabilities?.narration ? "Self-service ready" : "Unavailable"}</b><small>Record or upload in the course editor. AI narration: {studioCapabilities?.aiNarration ? "connected" : "optional"}.</small></div>
          <div><span>Cinematic intros</span><b>{studioCapabilities?.videoClips ? "Self-service ready" : "Unavailable"}</b><small>Create a branded opening locally. Fully generated AI video: {studioCapabilities?.aiVideoClips ? "connected" : "optional"}.</small></div>
        </div>
        <div className="creator-provider-actions">
          <Link className="sys-primary" href="/dashboard/studio#studio-workspace">Return to Creator Studio</Link>
          <Link href="/admin">Open platform administration</Link>
        </div>
      </section>

      <form className="panel webhook-editor" onSubmit={createWebhook}>
        <div className="product-section-heading"><span>WEBHOOK</span><div><h2>Add an automation endpoint</h2><p>Events are signed with HMAC-SHA256 so your system can verify they came from NorthStarLabs.</p></div></div>
        <label>Connection name<input required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="CRM learner sync" /></label>
        <label>Public HTTPS endpoint<input required type="url" value={endpointUrl} onChange={(event) => setEndpointUrl(event.target.value)} placeholder="https://automation.example.com/northstar" /></label>
        <fieldset className="webhook-events"><legend>Send these events</legend>
          <label><input type="checkbox" checked={selectedEvents.includes("*")} onChange={() => toggleEvent("*")} /><span><b>All events</b><small>Best for a general-purpose automation.</small></span></label>
          {Object.entries(eventLabels).map(([eventType, label]) => <label key={eventType}><input type="checkbox" checked={selectedEvents.includes(eventType)} onChange={() => toggleEvent(eventType)} /><span><b>{label}</b><small>{eventType}</small></span></label>)}
        </fieldset>
        <button className="sys-primary" disabled={busy === "create" || selectedEvents.length === 0}>{busy === "create" ? "Connecting..." : "Create signed webhook"}</button>
      </form>

      {revealedSecret && <section className="panel webhook-secret">
        <p className="sys-kicker">COPY THIS ONCE</p><h2>Webhook signing secret</h2><p>Store this in your receiving system. NorthStarLabs will not show it again.</p><code>{revealedSecret}</code><button className="sys-primary" onClick={copySecret}>Copy secret</button>
      </section>}

      <section className="webhook-list">
        <div className="product-section-heading"><span>CONNECTED</span><div><h2>Your webhooks</h2><p>Pause, test or remove endpoints without exposing their secret.</p></div></div>
        {data.integrations.filter((item) => item.provider === "webhook").length ? data.integrations.filter((item) => item.provider === "webhook").map((integration) => <article className="panel webhook-card" key={integration.id}>
          <div><span className={`status ${integration.status}`}>{integration.status}</span><h3>{integration.name}</h3><p>{integration.endpointUrl}</p></div>
          <ul>{integration.eventTypes.map((eventType) => <li key={eventType}>{eventType === "*" ? "All events" : eventLabels[eventType] || eventType}</li>)}</ul>
          <small>{integration.lastDeliveryAt ? `Last delivery ${new Date(integration.lastDeliveryAt).toLocaleString("en-ZA")} - ${integration.lastDeliveryStatus}` : "No deliveries yet"}</small>
          <div><button disabled={busy === integration.id || integration.status !== "active"} onClick={() => testWebhook(integration)}>Send test</button><button disabled={busy === integration.id} onClick={() => updateStatus(integration)}>{integration.status === "active" ? "Pause" : "Activate"}</button><button className="danger-text" disabled={busy === integration.id} onClick={() => deleteWebhook(integration)}>Delete</button></div>
        </article>) : <article className="panel product-empty"><h3>No webhooks connected</h3><p>Add an endpoint to connect product and live-learning activity to another system.</p></article>}
      </section>

      {data.deliveries.length > 0 && <section className="panel delivery-log">
        <div className="product-section-heading"><span>DELIVERIES</span><div><h2>Recent event delivery</h2><p>Use status and response codes to diagnose automations.</p></div></div>
        {data.deliveries.slice(0, 30).map((delivery) => <div key={delivery.id}><span><b>{delivery.eventType}</b><small>{new Date(delivery.createdAt).toLocaleString("en-ZA")}</small></span><span className={`status ${delivery.status}`}>{delivery.status}</span><small>{delivery.responseStatus ? `HTTP ${delivery.responseStatus}` : delivery.errorMessage || "Pending"}</small></div>)}
      </section>}
    </section>
  </main>;
}

function providerStatus(integrations: Integration[], provider: string) {
  const integration = integrations.find((item) => item.provider === provider);
  return <b className={`provider-status ${integration?.status || "available"}`}>{integration?.status || "available"}</b>;
}

function ProviderActions({
  provider,
  integrations,
  busy,
  connectDisabled,
  onConnect,
  onTest,
  onDelete,
}: {
  provider: string;
  integrations: Integration[];
  busy: string;
  connectDisabled: boolean;
  onConnect: () => void;
  onTest: (integration: Integration) => void;
  onDelete: (integration: Integration) => void;
}) {
  const integration = integrations.find((item) => item.provider === provider);
  return <div className="provider-actions">
    <button className="sys-primary" type="button" disabled={busy === provider || connectDisabled} onClick={onConnect}>{integration ? "Replace connection" : "Connect"}</button>
    {integration && <><button type="button" disabled={busy === integration.id || integration.status !== "active"} onClick={() => onTest(integration)}>Test</button><button type="button" className="danger-text" disabled={busy === integration.id} onClick={() => onDelete(integration)}>Disconnect</button></>}
  </div>;
}
