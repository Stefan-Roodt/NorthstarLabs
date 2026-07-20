"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

type Session = {
  id: string;
  title: string;
  description: string;
  productId: string | null;
  productName: string | null;
  courseId: string | null;
  courseTitle: string | null;
  startsAt: number;
  endsAt: number;
  timezone: string;
  meetingProvider: string;
  meetingUrl: string;
  capacity: number;
  status: string;
  registrations: number;
  attended: number;
};
type Attendance = {
  id: string;
  sessionId: string;
  userId: string;
  displayName: string;
  email: string;
  status: string;
  attendanceMinutes: number;
};
type LiveData = {
  school: { name: string };
  sessions: Session[];
  products: { id: string; name: string; productType: string; status: string }[];
  courses: { id: string; title: string; status: string }[];
  attendance: Attendance[];
};

function localInput(value: Date) {
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}

export default function LiveLearningPage() {
  const supabase = getSupabaseBrowser();
  const defaultStart = useMemo(() => {
    const value = new Date();
    value.setDate(value.getDate() + 1);
    value.setHours(10, 0, 0, 0);
    return value;
  }, []);
  const [data, setData] = useState<LiveData | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [accessTarget, setAccessTarget] = useState("");
  const [startsAt, setStartsAt] = useState(localInput(defaultStart));
  const [endsAt, setEndsAt] = useState(localInput(new Date(defaultStart.getTime() + 60 * 60_000)));
  const [meetingProvider, setMeetingProvider] = useState("zoom");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [capacity, setCapacity] = useState("0");
  const [message, setMessage] = useState("Loading live learning...");
  const [busy, setBusy] = useState("");
  const [now, setNow] = useState(() => Date.now());

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
      location.href = "/login?next=/dashboard/live";
      return;
    }
    const response = await authed("/api/live-sessions");
    if (!response.ok) {
      setMessage("Live learning could not be loaded.");
      return;
    }
    const result = await response.json() as LiveData;
    setData(result);
    setAccessTarget((current) => current ||
      (result.products[0] ? `product:${result.products[0].id}` :
        result.courses[0] ? `course:${result.courses[0].id}` : ""));
    setMessage("");
  }, [authed, supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  async function createSession(event: FormEvent) {
    event.preventDefault();
    const [targetType, targetId] = accessTarget.split(":");
    setBusy("create");
    const response = await authed("/api/live-sessions", {
      method: "POST",
      body: JSON.stringify({
        title,
        description,
        productId: targetType === "product" ? targetId : null,
        courseId: targetType === "course" ? targetId : null,
        startsAt: new Date(startsAt).getTime(),
        endsAt: new Date(endsAt).getTime(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Johannesburg",
        meetingProvider,
        meetingUrl,
        capacity: Number(capacity || 0),
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "The live session could not be scheduled.");
      setBusy("");
      return;
    }
    setMessage(`${result.title} is scheduled. ${result.registrations || 0} eligible learners were registered, with automatic reminders prepared.`);
    setTitle("");
    setDescription("");
    setMeetingUrl("");
    await load();
    setBusy("");
  }

  async function setStatus(session: Session, status: "completed" | "cancelled") {
    if (status === "cancelled" && !confirm(`Cancel ${session.title}?`)) return;
    setBusy(session.id);
    const response = await authed("/api/live-sessions", {
      method: "PATCH",
      body: JSON.stringify({ sessionId: session.id, status }),
    });
    const result = await response.json();
    setMessage(response.ok
      ? status === "completed" ? "Session marked complete." : "Session cancelled."
      : result.error || "Session could not be updated.");
    await load();
    setBusy("");
  }

  async function markAttendance(item: Attendance, status: "attended" | "no_show") {
    setBusy(item.id);
    const response = await authed("/api/live-sessions", {
      method: "PATCH",
      body: JSON.stringify({
        action: "attendance",
        sessionId: item.sessionId,
        userId: item.userId,
        status,
        attendanceMinutes: status === "attended" ? 60 : 0,
      }),
    });
    const result = await response.json();
    setMessage(response.ok ? "Attendance saved." : result.error || "Attendance could not be saved.");
    await load();
    setBusy("");
  }

  async function downloadCalendar(session: Session) {
    const response = await authed(`/api/live-sessions/${encodeURIComponent(session.id)}/calendar`);
    if (!response.ok) {
      setMessage("The calendar file could not be created.");
      return;
    }
    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `northstarlabs-${session.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
    link.click();
    URL.revokeObjectURL(href);
  }

  if (!data) return <main className="system-loading"><div><b>NorthStarLabs</b><p>{message}</p></div></main>;
  const upcoming = data.sessions.filter((session) => session.endsAt >= now && session.status === "scheduled");
  const history = data.sessions.filter((session) => !upcoming.includes(session));

  return <main className="live-admin-page">
    <header className="product-admin-top">
      <Link className="system-brand" href="/dashboard">✦ NORTHSTARLABS</Link>
      <nav><Link href="/dashboard/products">Products</Link><Link href="/dashboard/integrations">Integrations</Link><Link href="/learn">Learner view</Link></nav>
    </header>
    <section className="live-admin-hero">
      <div><p className="sys-kicker">COHORTS & LIVE LEARNING</p><h1>Make learning happen together.</h1><p>Schedule 1:1 or group sessions, register everyone with access, send automatic email reminders, export calendars with alarms, track attendance and attach recordings later.</p></div>
      <span><strong>{upcoming.length}</strong> upcoming</span>
    </section>

    <section className="live-admin-grid">
      {message && <div className="notice live-admin-notice" role="status">{message}</div>}
      <form className="panel live-session-editor" onSubmit={createSession}>
        <div className="product-section-heading"><span>NEW</span><div><h2>Schedule a session</h2><p>Access follows the selected course or product. Registered learners receive email reminders 24 hours and 1 hour before the start.</p></div></div>
        <div className="product-form-grid">
          <label>Session title<input required minLength={2} maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Monthly coaching call" /></label>
          <label>Who gets access<select required value={accessTarget} onChange={(event) => setAccessTarget(event.target.value)}>
            <option value="">Choose a product or course</option>
            <optgroup label="Products">{data.products.map((product) => <option value={`product:${product.id}`} key={product.id}>{product.name}</option>)}</optgroup>
            <optgroup label="Courses">{data.courses.map((course) => <option value={`course:${course.id}`} key={course.id}>{course.title}</option>)}</optgroup>
          </select></label>
          <label className="product-span-two">Description<textarea maxLength={1200} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What learners should prepare and what will be covered." /></label>
          <label>Starts<input required type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} /></label>
          <label>Ends<input required type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} /></label>
          <label>Meeting provider<select value={meetingProvider} onChange={(event) => setMeetingProvider(event.target.value)}>
            <option value="zoom">Zoom</option><option value="google_meet">Google Meet</option><option value="microsoft_teams">Microsoft Teams</option><option value="other">Other secure link</option>
          </select></label>
          <label>Secure meeting URL<input required type="url" value={meetingUrl} onChange={(event) => setMeetingUrl(event.target.value)} placeholder="https://..." /></label>
          <label>Capacity<input min={0} max={100000} type="number" value={capacity} onChange={(event) => setCapacity(event.target.value)} /><small>Use 1 for a 1:1 session, or 0 for an unlimited group.</small></label>
        </div>
        <button className="sys-primary" disabled={busy === "create" || !accessTarget}>{busy === "create" ? "Scheduling..." : "Schedule live session"}</button>
      </form>

      <section className="live-session-list">
        <div className="product-section-heading"><span>UPCOMING</span><div><h2>Your live calendar</h2><p>Meeting links are protected. Cancelling a session also withdraws its pending reminders.</p></div></div>
        {upcoming.length ? upcoming.map((session) => <SessionCard key={session.id} session={session} attendance={data.attendance.filter((item) => item.sessionId === session.id)} busy={busy} onCalendar={downloadCalendar} onStatus={setStatus} onAttendance={markAttendance} />)
          : <article className="panel product-empty"><h3>No sessions scheduled</h3><p>Create a session and eligible learners will be registered automatically.</p></article>}
      </section>

      {history.length > 0 && <section className="live-history">
        <div className="product-section-heading"><span>HISTORY</span><div><h2>Completed and cancelled</h2><p>Keep the delivery record for reporting.</p></div></div>
        {history.map((session) => <SessionCard key={session.id} session={session} attendance={data.attendance.filter((item) => item.sessionId === session.id)} busy={busy} onCalendar={downloadCalendar} onStatus={setStatus} onAttendance={markAttendance} />)}
      </section>}
    </section>
  </main>;
}

function SessionCard({
  session,
  attendance,
  busy,
  onCalendar,
  onStatus,
  onAttendance,
}: {
  session: Session;
  attendance: Attendance[];
  busy: string;
  onCalendar: (session: Session) => void;
  onStatus: (session: Session, status: "completed" | "cancelled") => void;
  onAttendance: (attendance: Attendance, status: "attended" | "no_show") => void;
}) {
  const start = new Date(session.startsAt);
  return <article className="panel live-session-card">
    <div className="live-session-date"><strong>{start.toLocaleDateString("en-ZA", { day: "2-digit" })}</strong><span>{start.toLocaleDateString("en-ZA", { month: "short" }).toUpperCase()}</span></div>
    <div className="live-session-main">
      <div className="live-session-title"><span className={`status ${session.status}`}>{session.status}</span><small>{session.productName || session.courseTitle}</small><h3>{session.title}</h3><p>{start.toLocaleString("en-ZA", { dateStyle: "full", timeStyle: "short" })} · {session.meetingProvider.replaceAll("_", " ")}</p></div>
      <div className="live-session-metrics"><span><b>{session.registrations || 0}</b> registered</span><span><b>{session.attended || 0}</b> attended</span><span><b>{session.capacity || "∞"}</b> capacity</span></div>
      <div className="live-session-actions">
        <a href={session.meetingUrl} target="_blank" rel="noreferrer">Open meeting ↗</a>
        <button onClick={() => onCalendar(session)}>Download calendar</button>
        {session.status === "scheduled" && <>
          <button disabled={busy === session.id} onClick={() => onStatus(session, "completed")}>Mark complete</button>
          <button className="danger-text" disabled={busy === session.id} onClick={() => onStatus(session, "cancelled")}>Cancel</button>
        </>}
      </div>
      {attendance.length > 0 && <details className="attendance-panel">
        <summary>Attendance register ({attendance.length})</summary>
        {attendance.map((item) => <div key={item.id}>
          <span><b>{item.displayName}</b><small>{item.email}</small></span>
          <span className={`status ${item.status}`}>{item.status.replaceAll("_", " ")}</span>
          <div><button disabled={busy === item.id} onClick={() => onAttendance(item, "attended")}>Attended</button><button disabled={busy === item.id} onClick={() => onAttendance(item, "no_show")}>No show</button></div>
        </div>)}
      </details>}
    </div>
  </article>;
}
