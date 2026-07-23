"use client";

import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

type EmailMessage = {
  id: string;
  recipientEmail: string;
  templateKey: string;
  subject: string;
  status: string;
  attemptCount: number;
  lastError: string | null;
  scheduledAt: number | null;
  sentAt: number | null;
  createdAt: number;
};
type Schedule = {
  id: string;
  frequency: string;
  recipientEmail: string;
  status: string;
  nextRunAt: number;
  lastRunAt: number | null;
};
type Audit = {
  id: string;
  actor: string;
  action: string;
  targetType: string;
  detailJson: string;
  createdAt: number;
};
type OperationsData = {
  school: { id: string; name: string; slug: string };
  currentUserEmail: string;
  provider: { name: string; configured: boolean; sender: string | null };
  messages: EmailMessage[];
  schedules: Schedule[];
  audit: Audit[];
};

export default function OperationsPage() {
  const [data, setData] = useState<OperationsData | null>(null);
  const [message, setMessage] = useState("Loading communications...");
  const [busy, setBusy] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [recipientEmail, setRecipientEmail] = useState("");
  const supabase = getSupabaseBrowser();

  const token = useCallback(async () => {
    return (await supabase?.auth.getSession())?.data.session?.access_token || "";
  }, [supabase]);

  const load = useCallback(async () => {
    const accessToken = await token();
    if (!accessToken) {
      location.href = "/login?next=/dashboard/operations";
      return;
    }
    const response = await fetch("/api/admin/communications", {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Communications could not be loaded.");
      return;
    }
    setData(result);
    const schedule = result.schedules?.[0] as Schedule | undefined;
    if (schedule) {
      setFrequency(schedule.status === "paused" ? "off" : schedule.frequency);
      setRecipientEmail(schedule.recipientEmail);
    } else {
      setRecipientEmail(result.currentUserEmail || "");
    }
    setMessage("");
  }, [token]);

  useEffect(() => {
    if (!supabase) return;
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load, supabase]);

  async function act(action: string, extra: Record<string, unknown> = {}) {
    setBusy(action);
    setMessage(action === "test" ? "Sending test email..." : "Updating communications...");
    const response = await fetch("/api/admin/communications", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ action, ...extra }),
    });
    const result = await response.json();
    setBusy("");
    if (!response.ok) {
      setMessage(result.error || "The action could not be completed.");
      return;
    }
    setMessage(result.status === "configuration_required"
      ? "The message is queued. Connect the email provider to deliver it."
      : action === "schedule"
        ? "Report schedule saved."
        : "Communication action completed.");
    await load();
  }

  async function saveSchedule(event: FormEvent) {
    event.preventDefault();
    await act("schedule", { frequency, recipientEmail });
  }

  const stats = useMemo(() => {
    const messages = data?.messages || [];
    return {
      sent: messages.filter((item) => item.status === "sent").length,
      queued: messages.filter((item) => ["pending", "retrying", "scheduled"].includes(item.status)).length,
      attention: messages.filter((item) => ["failed", "configuration_required"].includes(item.status)).length,
    };
  }, [data]);

  if (!data) return <main className="system-loading"><div><b>Communications</b><p>{message}</p></div></main>;

  return <main className="operations-page">
    <header className="operations-top">
      <Link href="/dashboard">← Creator workspace</Link>
      <div><p className="sys-kicker">EMAIL & ADMINISTRATION</p><h1>Operations centre</h1></div>
      <Link className="sys-primary" href="/dashboard/analytics">Open reporting</Link>
    </header>
    <section className="operations-body">
      {message && <div className="notice" role="status">{message}</div>}
      <div className="metric-row">
        <article><span>Email provider</span><strong className="metric-word">{data.provider.configured ? "Connected" : "Setup needed"}</strong><small>{data.provider.sender || "No verified sender configured"}</small></article>
        <article><span>Delivered</span><strong>{stats.sent}</strong><small>Recent messages</small></article>
        <article><span>Needs attention</span><strong>{stats.attention}</strong><small>{stats.queued} queued or retrying</small></article>
      </div>

      <div className="operations-grid">
        <article className="panel delivery-setup">
          <p className="sys-kicker">DELIVERY CONNECTION</p>
          <h2>{data.provider.configured ? "Email delivery is ready." : "Connect a verified sender."}</h2>
          <p>{data.provider.configured
            ? `Messages are sent through ${data.provider.name}${data.provider.sender ? ` from ${data.provider.sender}` : ""}.`
            : "Invitations and notifications are safely queued until a Resend key and verified sender are connected in the production environment."}</p>
          <button className="sys-primary" disabled={Boolean(busy)} onClick={() => act("test")}>
            {busy === "test" ? "Sending..." : "Send me a test email"}
          </button>
        </article>

        <article className="panel report-schedule">
          <p className="sys-kicker">SCHEDULED SUMMARY</p>
          <h2>Put reporting on a rhythm.</h2>
          <form onSubmit={saveSchedule}>
            <label>Frequency<select value={frequency} onChange={(event) => setFrequency(event.target.value)}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="off">Off</option>
            </select></label>
            <label>Recipient<input required type="email" value={recipientEmail} onChange={(event) => setRecipientEmail(event.target.value)} placeholder="you@example.com" /></label>
            <button className="sys-primary" disabled={Boolean(busy)}>Save schedule</button>
          </form>
          <button className="operations-text-button" disabled={Boolean(busy)} onClick={() => act("send_summary", { recipientEmail })}>Send the latest summary now →</button>
        </article>
      </div>

      <article className="panel operations-section">
        <div className="operations-heading"><div><p className="sys-kicker">DELIVERY LOG</p><h2>Every platform email</h2></div><span>{data.messages.length} recent messages</span></div>
        <div className="delivery-list">
          {data.messages.length ? data.messages.map((item) => <div className="delivery-row" key={item.id}>
            <div><b>{item.subject}</b><small>{item.recipientEmail} - {item.scheduledAt && item.status === "scheduled" ? `scheduled for ${new Date(item.scheduledAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}` : new Date(item.createdAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</small></div>
            <span className={`delivery-status ${item.status}`}>{item.status.replaceAll("_", " ")}</span>
            <small>{item.attemptCount} {item.attemptCount === 1 ? "attempt" : "attempts"}</small>
            {!["sent", "scheduled", "cancelled"].includes(item.status) && <button disabled={Boolean(busy)} onClick={() => act("retry", { messageId: item.id })}>Retry</button>}
            {item.lastError && <p>{item.lastError}</p>}
          </div>) : <div className="empty-activity"><strong>No messages yet</strong><p>Invitations, enrolments, live-session reminders, certificates, and reports will appear here.</p></div>}
        </div>
      </article>

      <article className="panel operations-section">
        <div className="operations-heading"><div><p className="sys-kicker">AUDIT TRAIL</p><h2>Administrative history</h2></div><span>{data.audit.length} recent actions</span></div>
        <div className="audit-list">
          {data.audit.length ? data.audit.map((item) => <div key={item.id}>
            <span>{item.action}</span>
            <p><b>{item.actor}</b> updated {item.targetType.replaceAll("_", " ")}</p>
            <small>{new Date(item.createdAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</small>
          </div>) : <p>No administrative changes have been recorded yet.</p>}
        </div>
      </article>
    </section>
  </main>;
}
