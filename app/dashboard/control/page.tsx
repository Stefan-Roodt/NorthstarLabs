"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

type Action = {
  id: string;
  priority: "urgent" | "important" | "improve";
  title: string;
  detail: string;
  href: string;
  label: string;
};
type ControlData = {
  generatedAt: number;
  school: { name: string; slug: string; memberRole: string };
  readiness: number;
  readinessChecks: Array<{ label: string; ready: boolean; href: string }>;
  actions: Action[];
  courses: {
    total: number; published: number; drafts: number; lessons: number;
    quizzes: number; richLessons: number; thinCourses: number;
  };
  learners: {
    active: number; enrollments: number; averageProgress: number;
    stalled: number; paused: number;
  };
  invitations: { pending: number; expired: number; acceptedRecently: number };
  live: {
    upcoming: number; overdue: number; completedRecently: number;
    nextTitle: string; nextStartsAt: number | null;
  };
  communications: {
    provider: string; configured: boolean; sender: string | null;
    sentRecently: number; queued: number; attention: number;
    scheduledReports: number; lastReportAt: number | null; nextReportAt: number | null;
  };
  integrations: { active: number; providers: number; attention: number };
  team: { owners: number; admins: number; instructors: number };
  exports: { latestCompletedAt: number | null; failed: number };
  questions: { open: number };
  imports: { unfinished: number; failed: number };
};

function readableDate(value: number | null, empty = "Not scheduled") {
  if (!value) return empty;
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AcademyControlCentre() {
  const supabase = getSupabaseBrowser();
  const [data, setData] = useState<ControlData | null>(null);
  const [message, setMessage] = useState("Opening your academy control centre...");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (!supabase) return;
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      location.href = "/login?next=/dashboard/control";
      return;
    }
    if (refresh) setRefreshing(true);
    const response = await fetch("/api/admin/control-center", {
      headers: { authorization: `Bearer ${sessionData.session.access_token}` },
    });
    const result = await response.json() as ControlData & { error?: string };
    if (!response.ok) {
      setMessage(result.error || "The academy control centre could not be opened.");
      setRefreshing(false);
      return;
    }
    setData(result);
    setMessage("");
    setRefreshing(false);
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (!data) {
    return <main className="system-loading"><div><b>Academy control centre</b><p>{message}</p></div></main>;
  }

  const ready = data.actions.filter((item) => item.priority === "urgent").length === 0;
  const staff = data.team.owners + data.team.admins + data.team.instructors;

  return <main className="control-page">
    <header className="control-top">
      <Link href="/dashboard">← Creator workspace</Link>
      <div><p className="sys-kicker">ACADEMY OPERATIONS</p><h1>Control centre</h1></div>
      <div>
        <Link href={`/schools/${data.school.slug}`}>View academy</Link>
        <button type="button" disabled={refreshing} onClick={() => void load(true)}>
          {refreshing ? "Refreshing..." : "Refresh status"}
        </button>
      </div>
    </header>

    <section className="control-hero">
      <div>
        <p className="sys-kicker">{data.school.name.toUpperCase()} · {data.school.memberRole.toUpperCase()}</p>
        <h2>{ready ? "The academy is under control." : "Know what needs attention."}</h2>
        <p>One live view of teaching, learners, support, communications, delivery and academy resilience. Every signal links to the place where it can be resolved.</p>
      </div>
      <aside className={data.readiness >= 80 ? "ready" : ""}>
        <span>OPERATIONAL READINESS</span>
        <strong>{data.readiness}%</strong>
        <i><b style={{ width: `${data.readiness}%` }} /></i>
        <small>Updated {new Date(data.generatedAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}</small>
      </aside>
    </section>

    <section className="control-body">
      {message && <div className="notice" role="status">{message}</div>}

      <div className="control-snapshot">
        <Link href="/dashboard?area=courses">
          <span>TEACHING</span><strong>{data.courses.published}/{data.courses.total}</strong>
          <b>courses published</b><small>{data.courses.lessons} lessons · {data.courses.quizzes} quizzes</small>
        </Link>
        <Link href="/dashboard/learners">
          <span>LEARNERS</span><strong>{data.learners.active}</strong>
          <b>active learners</b><small>{data.learners.averageProgress}% average progress · {data.learners.stalled} stalled</small>
        </Link>
        <Link href="/dashboard/questions">
          <span>SUPPORT</span><strong>{data.questions.open}</strong>
          <b>open lesson questions</b><small>{data.invitations.pending} invitations pending</small>
        </Link>
        <Link href="/dashboard/live">
          <span>LIVE DELIVERY</span><strong>{data.live.upcoming}</strong>
          <b>upcoming sessions</b><small>{data.live.nextTitle || "Nothing scheduled yet"}</small>
        </Link>
      </div>

      <div className="control-main-grid">
        <article className="panel control-actions">
          <div className="control-heading">
            <div><p className="sys-kicker">ACTION QUEUE</p><h2>Do the right work next.</h2></div>
            <span>{data.actions.length} {data.actions.length === 1 ? "action" : "actions"}</span>
          </div>
          {data.actions.length ? <div className="control-action-list">
            {data.actions.map((action) => <Link href={action.href} key={action.id} className={action.priority}>
              <span>{action.priority}</span>
              <div><b>{action.title}</b><p>{action.detail}</p></div>
              <strong>{action.label} →</strong>
            </Link>)}
          </div> : <div className="control-clear">
            <span>✓</span><div><b>No operational exceptions</b><p>There are no failed, overdue, unanswered or incomplete items in the current checks.</p></div>
          </div>}
        </article>

        <aside className="panel control-readiness">
          <p className="sys-kicker">READINESS CHECK</p>
          <h2>Seven essentials.</h2>
          <div>
            {data.readinessChecks.map((check) => <Link href={check.href} key={check.label} className={check.ready ? "ready" : ""}>
              <span>{check.ready ? "✓" : "!"}</span><b>{check.label}</b><small>{check.ready ? "Ready" : "Needs work"}</small>
            </Link>)}
          </div>
        </aside>
      </div>

      <section className="control-systems">
        <div className="control-heading">
          <div><p className="sys-kicker">THE WHOLE ACADEMY</p><h2>Every operational area, without the maze.</h2></div>
        </div>
        <div className="control-system-grid">
          <article>
            <span>01 · TEACH</span><h3>Curriculum & publishing</h3>
            <p>{data.courses.drafts} drafts · {data.courses.richLessons} rich lessons · {data.imports.unfinished} unfinished imports</p>
            <nav><Link href="/dashboard?area=courses">Courses</Link><Link href="/dashboard/import">Imports</Link><Link href="/dashboard/products">Programmes</Link></nav>
          </article>
          <article>
            <span>02 · SUPPORT</span><h3>Learners & team</h3>
            <p>{data.learners.enrollments} active enrolments · {staff} academy staff · {data.invitations.expired} expired invites</p>
            <nav><Link href="/dashboard/learners">Learners & invitations</Link><Link href="/dashboard/questions">Lesson questions</Link><Link href="/dashboard/community">Community</Link></nav>
          </article>
          <article>
            <span>03 · DELIVER</span><h3>Live learning</h3>
            <p>{data.live.nextTitle ? `${data.live.nextTitle} · ${readableDate(data.live.nextStartsAt)}` : "No next session scheduled"}</p>
            <nav><Link href="/dashboard/live">Live calendar</Link><Link href="/dashboard/integrations">Meeting connections</Link></nav>
          </article>
          <article>
            <span>04 · COMMUNICATE</span><h3>Email & reporting</h3>
            <p>{data.communications.configured ? `Sending from ${data.communications.sender}` : "Email provider needs setup"} · {data.communications.queued} queued</p>
            <nav><Link href="/dashboard/operations">Email & audit</Link><Link href="/dashboard/analytics">Learning reports</Link></nav>
          </article>
          <article>
            <span>05 · CONNECT</span><h3>Integrations</h3>
            <p>{data.integrations.active} active connections · {data.integrations.attention} need attention</p>
            <nav><Link href="/dashboard/integrations">Manage connections</Link></nav>
          </article>
          <article>
            <span>06 · PROTECT</span><h3>Identity & portability</h3>
            <p>Latest complete export: {readableDate(data.exports.latestCompletedAt, "None prepared")}</p>
            <nav><Link href="/dashboard/academy">Academy identity</Link><Link href="/dashboard/exports">Complete export</Link></nav>
          </article>
        </div>
      </section>
    </section>
  </main>;
}
