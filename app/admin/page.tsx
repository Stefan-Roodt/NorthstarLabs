"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-client";

type PlatformData = {
  metrics: Record<string, number>;
  provider: { configured: boolean; sender: string | null };
  schools: Array<{ id: string; name: string; slug: string; status: string; owner: string; courses: number; members: number }>;
  users: Array<{ id: string; email: string; displayName: string; role: string; status: string; createdAt: number }>;
  messages: Array<{ id: string; recipientEmail: string; subject: string; status: string; lastError: string | null; schoolName: string | null; createdAt: number }>;
  audit: Array<{ id: string; actor: string; action: string; targetType: string; schoolName: string | null; createdAt: number }>;
};
type ReliabilityData = {
  metrics: {
    openEvents: number;
    openErrors: number;
    serverErrors24h: number;
    activeRateBuckets: number;
    storedBytes: number;
    storedFiles: number;
    pendingDataRequests: number;
    openContentReports: number;
    lastBackupAt: number | null;
  };
  configuration: { automatedMaintenance: boolean; storageQuotaBytes: number };
  events: Array<{
    id: string;
    severity: string;
    source: string;
    eventType: string;
    message: string;
    requestId: string | null;
    route: string | null;
    status: string;
    createdAt: number;
  }>;
  backups: Array<{
    id: string;
    status: string;
    tableCount: number;
    rowCount: number;
    sizeBytes: number;
    failureMessage: string | null;
    createdAt: number;
    completedAt: number | null;
    verifiedAt: number | null;
  }>;
  storage: Array<{ id: string; name: string; slug: string; files: number; bytes: number }>;
  dataRequests: Array<{
    id: string;
    requestType: string;
    status: string;
    failureMessage: string | null;
    createdAt: number;
    email: string | null;
    displayName: string | null;
  }>;
  contentReports: Array<{
    id: string;
    schoolId: string;
    schoolName: string;
    postId: string;
    reason: string;
    detail: string;
    status: string;
    createdAt: number;
    reporter: string;
    author: string;
    postBody: string;
  }>;
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(0, Math.round(bytes / 1024))} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export default function PlatformAdministration() {
  const [data, setData] = useState<PlatformData | null>(null);
  const [tab, setTab] = useState("Schools");
  const [message, setMessage] = useState("Checking administrator access...");
  const [busy, setBusy] = useState("");
  const [reliability, setReliability] = useState<ReliabilityData | null>(null);
  const supabase = getSupabaseBrowser();

  const token = useCallback(async () => {
    return (await supabase?.auth.getSession())?.data.session?.access_token || "";
  }, [supabase]);

  const load = useCallback(async () => {
    const accessToken = await token();
    if (!accessToken) {
      location.href = "/login?next=/admin";
      return;
    }
    const response = await fetch("/api/platform/overview", {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Platform administration is unavailable.");
      return;
    }
    setData(result);
    setMessage("");
  }, [token]);

  useEffect(() => {
    if (!supabase) return;
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load, supabase]);

  const loadReliability = useCallback(async () => {
    const response = await fetch("/api/platform/reliability", {
      headers: { authorization: `Bearer ${await token()}` },
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Reliability information is unavailable.");
      return;
    }
    setReliability(result);
    setMessage("");
  }, [token]);

  useEffect(() => {
    if (tab !== "Reliability" || !supabase) return;
    const timeout = window.setTimeout(() => void loadReliability(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadReliability, supabase, tab]);

  async function update(targetType: string, targetId: string, action: string) {
    const label = action === "suspend" ? "suspend" : action === "reactivate" ? "reactivate" : "retry";
    if (label !== "retry" && !confirm(`${label[0].toUpperCase()}${label.slice(1)} this ${targetType}?`)) return;
    setBusy(targetId);
    const response = await fetch("/api/platform/overview", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ targetType, targetId, action }),
    });
    const result = await response.json();
    setBusy("");
    setMessage(response.ok ? "Administration action completed." : result.error || "Action failed.");
    if (response.ok) await load();
  }

  async function reliabilityAction(
    action: string,
    extra: Record<string, unknown> = {},
  ) {
    setBusy(`${action}-${String(extra.backupId || extra.eventId || "")}`);
    setMessage(action === "backup" ? "Creating a protected platform backup..." : "Running reliability action...");
    const response = await fetch("/api/platform/reliability", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ action, ...extra }),
    });
    const result = await response.json();
    setBusy("");
    setMessage(response.ok
      ? action === "backup"
        ? "Backup completed and stored securely."
        : action === "verify"
          ? "Backup integrity verified."
          : "Reliability action completed."
      : result.error || "Reliability action failed.");
    if (response.ok) await loadReliability();
  }

  if (!data) return <main className="system-loading"><div><b>Platform administration</b><p>{message}</p>{message.includes("required") && <Link href="/">Return home</Link>}</div></main>;

  return <main className="platform-admin">
    <aside>
      <Link className="system-brand" href="/">✦ NORTHSTARLABS</Link>
      <p>PLATFORM ADMIN</p>
      <nav>{["Schools", "Users", "Email", "Reliability", "Audit"].map((item) =>
        <button className={tab === item ? "active" : ""} key={item} onClick={() => setTab(item)}>{item}</button>
      )}</nav>
      <Link href="/dashboard">Creator workspace</Link>
    </aside>
    <section>
      <header><div><p className="sys-kicker">OPERATIONS & CONTROL</p><h1>{tab}</h1></div><span className={data.provider.configured ? "admin-healthy" : "admin-warning"}>{data.provider.configured ? "Email connected" : "Email setup needed"}</span></header>
      {message && <div className="notice">{message}</div>}
      <div className="platform-metrics">
        <article><span>Active schools</span><strong>{data.metrics.activeSchools || 0}</strong><small>{data.metrics.schools || 0} total</small></article>
        <article><span>Members</span><strong>{data.metrics.users || 0}</strong><small>{data.metrics.suspendedUsers || 0} suspended</small></article>
        <article><span>Published courses</span><strong>{data.metrics.publishedCourses || 0}</strong><small>{data.metrics.activeEnrollments || 0} active enrolments</small></article>
        <article><span>Email attention</span><strong>{data.metrics.emailAttention || 0}</strong><small>{data.metrics.sentEmails || 0} delivered</small></article>
      </div>

      {tab === "Schools" && <article className="platform-panel">
        <div className="platform-table platform-school-table"><b>School</b><b>Owner</b><b>Usage</b><b>Status</b><b>Action</b>
          {data.schools.map((school) => <div className="platform-row" key={school.id}>
            <div><strong>{school.name}</strong><small>/{school.slug}</small></div>
            <span>{school.owner}</span>
            <span>{school.courses} courses · {school.members} members</span>
            <span className={`delivery-status ${school.status}`}>{school.status}</span>
            <button disabled={busy === school.id} onClick={() => update("school", school.id, school.status === "active" ? "suspend" : "reactivate")}>{school.status === "active" ? "Suspend" : "Reactivate"}</button>
          </div>)}
        </div>
      </article>}

      {tab === "Users" && <article className="platform-panel">
        <div className="platform-table platform-user-table"><b>Member</b><b>Role</b><b>Joined</b><b>Status</b><b>Action</b>
          {data.users.map((user) => <div className="platform-row" key={user.id}>
            <div><strong>{user.displayName}</strong><small>{user.email}</small></div>
            <span>{user.role}</span>
            <span>{new Date(user.createdAt).toLocaleDateString("en-ZA")}</span>
            <span className={`delivery-status ${user.status}`}>{user.status}</span>
            <button disabled={busy === user.id} onClick={() => update("user", user.id, user.status === "active" ? "suspend" : "reactivate")}>{user.status === "active" ? "Suspend" : "Reactivate"}</button>
          </div>)}
        </div>
      </article>}

      {tab === "Email" && <article className="platform-panel">
        <div className="operations-heading"><div><p className="sys-kicker">PROVIDER & QUEUE</p><h2>{data.provider.configured ? `Sending from ${data.provider.sender}` : "Connect Resend to deliver queued messages"}</h2></div></div>
        <div className="delivery-list">{data.messages.map((item) => <div className="delivery-row" key={item.id}>
          <div><b>{item.subject}</b><small>{item.schoolName || "Platform"} · {item.recipientEmail}</small></div>
          <span className={`delivery-status ${item.status}`}>{item.status.replaceAll("_", " ")}</span>
          <small>{new Date(item.createdAt).toLocaleString("en-ZA", { dateStyle: "short", timeStyle: "short" })}</small>
          {item.status !== "sent" && <button disabled={busy === item.id} onClick={() => update("email", item.id, "retry")}>Retry</button>}
          {item.lastError && <p>{item.lastError}</p>}
        </div>)}</div>
      </article>}

      {tab === "Reliability" && <article className="platform-panel reliability-panel">
        {!reliability ? <div className="empty-activity"><strong>Loading reliability controls...</strong></div> : <>
          <div className="reliability-heading">
            <div><p className="sys-kicker">HEALTH, SECURITY & RECOVERY</p><h2>Production reliability</h2><p>Monitor errors, verify backups, review storage usage, and keep temporary security data clean.</p></div>
            <div>
              <button className="sys-primary" disabled={Boolean(busy)} onClick={() => reliabilityAction("backup")}>Create backup</button>
              <button disabled={Boolean(busy)} onClick={() => reliabilityAction("prune")}>Run cleanup</button>
            </div>
          </div>
          <div className="reliability-metrics">
            <div><span>Open errors</span><strong>{reliability.metrics.openErrors || 0}</strong><small>{reliability.metrics.serverErrors24h || 0} server errors in 24 hours</small></div>
            <div><span>Last backup</span><strong className="metric-word">{reliability.metrics.lastBackupAt ? new Date(reliability.metrics.lastBackupAt).toLocaleDateString("en-ZA") : "None"}</strong><small>{reliability.configuration.automatedMaintenance ? "Automation key configured" : "Automation setup needed"}</small></div>
            <div><span>Stored media</span><strong className="metric-word">{formatBytes(reliability.metrics.storedBytes || 0)}</strong><small>{reliability.metrics.storedFiles || 0} files</small></div>
            <div><span>Needs review</span><strong>{(reliability.metrics.pendingDataRequests || 0) + (reliability.metrics.openContentReports || 0)}</strong><small>{reliability.metrics.openContentReports || 0} content reports · {reliability.metrics.pendingDataRequests || 0} data requests</small></div>
          </div>

          <section className="reliability-section">
            <div className="operations-heading"><div><p className="sys-kicker">BACKUP HISTORY</p><h2>Recoverable snapshots</h2></div></div>
            <div className="delivery-list">{reliability.backups.length ? reliability.backups.map((backup) => <div className="delivery-row" key={backup.id}>
              <div><b>{new Date(backup.createdAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</b><small>{backup.rowCount} records · {formatBytes(backup.sizeBytes)}</small></div>
              <span className={`delivery-status ${backup.status}`}>{backup.status}</span>
              <small>{backup.verifiedAt ? `Verified ${new Date(backup.verifiedAt).toLocaleDateString("en-ZA")}` : "Not yet verified"}</small>
              {backup.status === "completed" && <button disabled={Boolean(busy)} onClick={() => reliabilityAction("verify", { backupId: backup.id })}>Verify</button>}
              {backup.failureMessage && <p>{backup.failureMessage}</p>}
            </div>) : <p>No platform backup has been created yet.</p>}</div>
          </section>

          {!!reliability.contentReports.length && <section className="reliability-section">
            <div className="operations-heading"><div><p className="sys-kicker">CONTENT REPORTS</p><h2>Moderation queue</h2></div><span>{reliability.metrics.openContentReports || 0} open</span></div>
            <div className="content-report-list">{reliability.contentReports.map((report) => <div key={report.id}>
              <div><strong>{report.schoolName} · {report.reason}</strong><small>Reported by {report.reporter} · posted by {report.author} · {new Date(report.createdAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</small><p>{report.postBody}</p>{report.detail && <em>Reporter note: {report.detail}</em>}</div>
              <span className={`delivery-status ${report.status}`}>{report.status}</span>
              {report.status === "open" && <div><button disabled={Boolean(busy)} onClick={() => reliabilityAction("hide_reported_post", { reportId: report.id })}>Hide post</button><button disabled={Boolean(busy)} onClick={() => reliabilityAction("dismiss_report", { reportId: report.id })}>Dismiss</button></div>}
            </div>)}</div>
          </section>}

          <section className="reliability-section">
            <div className="operations-heading"><div><p className="sys-kicker">SYSTEM EVENTS</p><h2>Errors and operational alerts</h2></div></div>
            <div className="audit-list">{reliability.events.length ? reliability.events.map((event) => <div key={event.id}>
              <span className={`event-severity ${event.severity}`}>{event.severity}</span>
              <p><b>{event.eventType}</b> · {event.message}</p>
              <small>{event.route || event.source} · {new Date(event.createdAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}{event.requestId ? ` · ${event.requestId}` : ""}</small>
              {event.status === "open" && <button disabled={Boolean(busy)} onClick={() => reliabilityAction("resolve", { eventId: event.id })}>Resolve</button>}
            </div>) : <p>No system alerts have been recorded.</p>}</div>
          </section>

          <section className="reliability-section">
            <div className="operations-heading"><div><p className="sys-kicker">STORAGE BY ACADEMY</p><h2>Quota visibility</h2></div><span>{formatBytes(reliability.configuration.storageQuotaBytes)} per academy</span></div>
            <div className="storage-list">{reliability.storage.map((school) => <div key={school.id}><strong>{school.name}</strong><span>{school.files} files</span><span>{formatBytes(school.bytes)}</span></div>)}</div>
          </section>

          {!!reliability.dataRequests.length && <section className="reliability-section">
            <div className="operations-heading"><div><p className="sys-kicker">PRIVACY REQUESTS</p><h2>Data export and deletion activity</h2></div></div>
            <div className="storage-list">{reliability.dataRequests.map((item) => <div key={item.id}><strong>{item.displayName || item.email || "Deleted member"}</strong><span>{item.requestType}</span><span className={`delivery-status ${item.status}`}>{item.status}</span></div>)}</div>
          </section>}
        </>}
      </article>}

      {tab === "Audit" && <article className="platform-panel"><div className="audit-list">
        {data.audit.map((item) => <div key={item.id}><span>{item.action}</span><p><b>{item.actor}</b> · {item.schoolName || "Platform"} · {item.targetType}</p><small>{new Date(item.createdAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</small></div>)}
      </div></article>}
    </section>
  </main>;
}
