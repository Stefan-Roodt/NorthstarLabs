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
    setMessage(response.ok ? "Webhook deleted." : result.error || "The webhook could not be deleted.");
    await load();
    setBusy("");
  }

  async function copySecret() {
    await navigator.clipboard.writeText(revealedSecret);
    setMessage("Signing secret copied.");
  }

  if (!data) return <main className="system-loading"><div><b>NorthStarLabs</b><p>{message}</p></div></main>;

  return <main className="integration-page">
    <header className="product-admin-top">
      <Link className="system-brand" href="/dashboard">✦ NORTHSTARLABS</Link>
      <nav><Link href="/dashboard/products">Products</Link><Link href="/dashboard/live">Live learning</Link><Link href="/account">Account</Link></nav>
    </header>
    <section className="integration-hero">
      <div><p className="sys-kicker">MOBILE & INTEGRATIONS</p><h1>Connect learning to the rest of the work.</h1><p>Calendar downloads, meeting links and installable mobile access work immediately. Signed webhooks connect NorthStarLabs events to automation tools, CRMs and your own systems.</p></div>
      <span><strong>{data.integrations.filter((item) => item.status === "active").length}</strong> active webhooks</span>
    </section>

    <section className="integration-grid">
      {message && <div className="notice integration-notice" role="status">{message}</div>}
      <section className="native-integrations">
        <article className="panel native-integration-card"><span>01</span><div><p className="sys-kicker">CALENDAR</p><h2>Apple, Google & Outlook</h2><p>Every eligible live session can be downloaded as a standards-based calendar file with its secure meeting link.</p><b>READY</b></div></article>
        <article className="panel native-integration-card"><span>02</span><div><p className="sys-kicker">MEETINGS</p><h2>Zoom, Meet & Teams</h2><p>Creators attach their secure provider link. NorthStarLabs reveals it only to staff and eligible signed-in learners.</p><b>READY</b></div></article>
        <article className="panel native-integration-card"><span>03</span><div><p className="sys-kicker">MOBILE</p><h2>Installable learning app</h2><p>Phones and tablets can install NorthStarLabs from the browser, launch full-screen and keep the learning shell available during brief network interruptions.</p><b>READY</b></div></article>
      </section>

      <section className="panel creator-provider-panel" id="creator-studio-providers">
        <div className="product-section-heading"><span>CREATOR AI</span><div><h2>Creator Studio providers</h2><p>See what is genuinely connected before promising AI-assisted production.</p></div></div>
        <div className="creator-provider-summary">
          <div><span>Current provider</span><b>{studioCapabilities?.provider || "Checking connection..."}</b><small>One governed provider currently powers course drafting, checks and narration.</small></div>
          <div><span>Course drafts & checks</span><b>{studioCapabilities?.blueprint && studioCapabilities?.quizzes ? "Connected" : "Setup required"}</b><small>Required for grounded structures and generated assessments.</small></div>
          <div><span>Narration</span><b>{studioCapabilities?.narration ? "Connected" : "Setup required"}</b><small>Used only after the creator has reviewed the course structure.</small></div>
          <div><span>Cinematic clips</span><b>{studioCapabilities?.videoClips ? "Connected" : "Optional model required"}</b><small>Separate from ordinary protected video uploads and never required to publish.</small></div>
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
        {data.integrations.length ? data.integrations.map((integration) => <article className="panel webhook-card" key={integration.id}>
          <div><span className={`status ${integration.status}`}>{integration.status}</span><h3>{integration.name}</h3><p>{integration.endpointUrl}</p></div>
          <ul>{integration.eventTypes.map((eventType) => <li key={eventType}>{eventType === "*" ? "All events" : eventLabels[eventType] || eventType}</li>)}</ul>
          <small>{integration.lastDeliveryAt ? `Last delivery ${new Date(integration.lastDeliveryAt).toLocaleString("en-ZA")} · ${integration.lastDeliveryStatus}` : "No deliveries yet"}</small>
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
