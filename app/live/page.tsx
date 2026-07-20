"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-client";

type LiveSession = {
  id: string;
  title: string;
  description: string;
  productName: string | null;
  courseTitle: string | null;
  startsAt: number;
  endsAt: number;
  meetingProvider: string;
  meetingUrl: string;
  status: string;
  attendanceStatus: string | null;
};

export default function LearnerLivePage() {
  const supabase = getSupabaseBrowser();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [message, setMessage] = useState("Loading your live calendar...");
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
      location.href = "/login?next=/live";
      return;
    }
    const response = await authed("/api/live-sessions?mode=learner");
    if (!response.ok) {
      setMessage("Your live calendar could not be loaded.");
      return;
    }
    const result = await response.json() as { sessions: LiveSession[] };
    setSessions(result.sessions);
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

  async function register(session: LiveSession) {
    setBusy(session.id);
    const response = await authed("/api/live-sessions", {
      method: "POST",
      body: JSON.stringify({ action: "register", sessionId: session.id }),
    });
    const result = await response.json();
    setMessage(response.ok ? "Your place is confirmed." : result.error || "Registration failed.");
    await load();
    setBusy("");
  }

  async function downloadCalendar(session: LiveSession) {
    const response = await authed(`/api/live-sessions/${encodeURIComponent(session.id)}/calendar`);
    if (!response.ok) {
      setMessage("The calendar file could not be created.");
      return;
    }
    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `northstarlabs-${session.id}.ics`;
    link.click();
    URL.revokeObjectURL(href);
  }

  const upcoming = sessions.filter((session) => session.endsAt >= now && session.status === "scheduled");
  const past = sessions.filter((session) => !upcoming.includes(session));

  return <main className="learner-live-page">
    <header className="learner-live-top"><Link className="system-brand" href="/">âœ¦ NORTHSTARLABS</Link><nav><Link href="/learn">My courses</Link><Link href="/community">Community</Link><Link href="/account">Account</Link></nav></header>
    <section className="learner-live-hero"><div><p className="sys-kicker">MY LIVE LEARNING</p><h1>Show up. Practise. Grow.</h1><p>Your 1:1 coaching, group workshops and live classes are gathered here with secure joining links, email reminders, and calendar alarms.</p></div><span><strong>{upcoming.length}</strong> upcoming</span></section>
    <section className="learner-live-library">
      {message && <div className="notice" role="status">{message}</div>}
      <div className="library-heading"><div><h2>Upcoming sessions</h2><p>Times use your device timezone. Email reminders arrive 24 hours and 1 hour before registered sessions; calendar downloads include 1-hour and 15-minute alarms.</p></div><Link className="builder-preview" href="/learn">Back to my courses</Link></div>
      {upcoming.length ? <div className="learner-live-grid">{upcoming.map((session) => <LearnerSession key={session.id} session={session} busy={busy} now={now} onRegister={register} onCalendar={downloadCalendar} />)}</div>
        : <article className="panel empty-dashboard"><h2>No live sessions yet</h2><p>When an academy schedules a session for one of your courses, bundles or memberships, it will appear here.</p><Link className="sys-primary" href="/learn">Continue a course â†’</Link></article>}
        {past.length > 0 && <><div className="library-heading learner-live-past"><div><h2>Session history</h2><p>Your completed live-learning record.</p></div></div><div className="learner-live-grid">{past.map((session) => <LearnerSession key={session.id} session={session} busy={busy} now={now} onRegister={register} onCalendar={downloadCalendar} />)}</div></>}
    </section>
  </main>;
}

function LearnerSession({
  session,
  busy,
  now,
  onRegister,
  onCalendar,
}: {
  session: LiveSession;
  busy: string;
  now: number;
  onRegister: (session: LiveSession) => void;
  onCalendar: (session: LiveSession) => void;
}) {
  const upcoming = session.endsAt >= now && session.status === "scheduled";
  return <article className="panel learner-live-card">
    <div className="learner-live-card-top"><span>{new Date(session.startsAt).toLocaleDateString("en-ZA", { day: "2-digit", month: "short" })}</span><b className={`status ${session.attendanceStatus || session.status}`}>{session.attendanceStatus || session.status}</b></div>
    <p className="sys-kicker">{session.productName || session.courseTitle || "LIVE LEARNING"}</p>
    <h3>{session.title}</h3>
    <p>{session.description || "Join your facilitator and fellow learners for a focused live session."}</p>
    <time>{new Date(session.startsAt).toLocaleString("en-ZA", { dateStyle: "full", timeStyle: "short" })}</time>
    <small>{session.meetingProvider.replaceAll("_", " ")}</small>
    <div>
      {upcoming && !session.attendanceStatus && <button className="sys-primary" disabled={busy === session.id} onClick={() => onRegister(session)}>{busy === session.id ? "Registering..." : "Reserve my place"}</button>}
      {upcoming && session.attendanceStatus && <a className="sys-primary" href={session.meetingUrl} target="_blank" rel="noreferrer">Join meeting â†—</a>}
      <button onClick={() => onCalendar(session)}>Add to calendar</button>
    </div>
  </article>;
}
