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

export default function PlatformAdministration() {
  const [data, setData] = useState<PlatformData | null>(null);
  const [tab, setTab] = useState("Schools");
  const [message, setMessage] = useState("Checking administrator access...");
  const [busy, setBusy] = useState("");
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

  if (!data) return <main className="system-loading"><div><b>Platform administration</b><p>{message}</p>{message.includes("required") && <Link href="/">Return home</Link>}</div></main>;

  return <main className="platform-admin">
    <aside>
      <Link className="system-brand" href="/">✦ NORTHSTARLABS</Link>
      <p>PLATFORM ADMIN</p>
      <nav>{["Schools", "Users", "Email", "Audit"].map((item) =>
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

      {tab === "Audit" && <article className="platform-panel"><div className="audit-list">
        {data.audit.map((item) => <div key={item.id}><span>{item.action}</span><p><b>{item.actor}</b> · {item.schoolName || "Platform"} · {item.targetType}</p><small>{new Date(item.createdAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</small></div>)}
      </div></article>}
    </section>
  </main>;
}
