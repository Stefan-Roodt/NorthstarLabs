"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

type CourseMetric = {
  id: string;
  title: string;
  status: string;
  enrollments: number;
  activeLearners: number;
  averageProgress: number;
  completions: number;
};
type Activity = { type: string; occurredAt: number; courseTitle: string; learnerName: string };
type AnalyticsData = {
  school: { name: string };
  window: { from: number; to: number; courseId: string | null };
  summary: Record<string, number>;
  assessments: Record<string, number>;
  certificates: Record<string, number>;
  community: Record<string, number>;
  email: Record<string, number>;
  products: Record<string, number>;
  liveLearning: Record<string, number>;
  courses: CourseMetric[];
  trend: Array<{ day: string; enrollments: number }>;
  activity: Activity[];
};

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

const REPORT_TODAY = isoDate(new Date());
const REPORT_MONTH_AGO = isoDate(new Date(new Date().getTime() - 29 * 86_400_000));

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [from, setFrom] = useState(REPORT_MONTH_AGO);
  const [to, setTo] = useState(REPORT_TODAY);
  const [courseId, setCourseId] = useState("");
  const [message, setMessage] = useState("Preparing reporting...");
  const [exporting, setExporting] = useState(false);
  const supabase = getSupabaseBrowser();

  const token = useCallback(async () => {
    return (await supabase?.auth.getSession())?.data.session?.access_token || "";
  }, [supabase]);

  const reportPath = useCallback((format?: string) => {
    const query = new URLSearchParams({ from, to });
    if (courseId) query.set("courseId", courseId);
    if (format) query.set("format", format);
    return `/api/admin/overview?${query}`;
  }, [courseId, from, to]);

  const load = useCallback(async () => {
    const accessToken = await token();
    if (!accessToken) {
      location.href = "/login?next=/dashboard/analytics";
      return;
    }
    setMessage("Updating reporting...");
    const response = await fetch(reportPath(), {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Reporting could not be loaded.");
      return;
    }
    setData(result);
    setMessage("");
  }, [reportPath, token]);

  useEffect(() => {
    if (!supabase) return;
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load, supabase]);

  async function downloadReport() {
    setExporting(true);
    const response = await fetch(reportPath("csv"), {
      headers: { authorization: `Bearer ${await token()}` },
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setMessage(result.error || "The report could not be exported.");
      setExporting(false);
      return;
    }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data?.school.name || "academy"}-learning-report-${to}.csv`
      .toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
    link.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  const chart = useMemo(() => {
    const values = new Map((data?.trend || []).map((item) => [item.day, Number(item.enrollments)]));
    const start = new Date(`${from}T00:00:00Z`);
    const end = new Date(`${to}T00:00:00Z`);
    const days = Math.max(1, Math.min(31, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1));
    return Array.from({ length: days }, (_, index) => {
      const date = new Date(end);
      date.setUTCDate(date.getUTCDate() - (days - 1 - index));
      const key = isoDate(date);
      return { key, label: date.toLocaleDateString("en-ZA", { day: "numeric", month: "short" }), value: values.get(key) || 0 };
    });
  }, [data, from, to]);

  if (!data) return <main className="system-loading"><div><b>NorthStarLabs reporting</b><p>{message}</p></div></main>;

  const maxTrend = Math.max(1, ...chart.map((item) => item.value));
  const completionRate = Number(data.summary.activeEnrollments)
    ? Math.round((Number(data.summary.completions) / Number(data.summary.activeEnrollments)) * 100)
    : 0;

  return <main className="admin-page reporting-page">
    <header className="admin-top reporting-top">
      <Link href="/dashboard">← Creator workspace</Link>
      <div><p className="sys-kicker">CREATOR REPORTING</p><h1>Learning performance</h1></div>
      <div><Link href="/dashboard/operations">Email & schedules</Link><button className="sys-primary" disabled={exporting} onClick={downloadReport}>{exporting ? "Exporting..." : "Export CSV"}</button></div>
    </header>
    <section className="admin-body">
      <div className="report-filter panel">
        <div><p className="sys-kicker">REPORTING WINDOW</p><h2>Choose what to measure.</h2></div>
        <label>From<input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} /></label>
        <label>To<input type="date" value={to} min={from} max={REPORT_TODAY} onChange={(event) => setTo(event.target.value)} /></label>
        <label>Course<select value={courseId} onChange={(event) => setCourseId(event.target.value)}>
          <option value="">All courses</option>
          {data.courses.map((course) => <option value={course.id} key={course.id}>{course.title}</option>)}
        </select></label>
        <button className="sys-primary" onClick={load}>Apply filters</button>
      </div>
      {message && <div className="notice">{message}</div>}

      <div className="metric-row admin-metrics">
        <article><span>Active learners</span><strong>{data.summary.activeLearners || 0}</strong><small>{data.summary.enrollments || 0} total enrolments</small></article>
        <article><span>Average progress</span><strong>{data.summary.averageProgress || 0}%</strong><small>Across active enrolments</small></article>
        <article><span>Completion rate</span><strong>{completionRate}%</strong><small>{data.summary.completions || 0} courses completed</small></article>
      </div>

      <div className="report-signal-grid">
        <article className="panel"><span>Assessment attempts</span><strong>{data.assessments.attempts || 0}</strong><small>{data.assessments.averageScore || 0}% average - {data.assessments.passedAttempts || 0} passed</small></article>
        <article className="panel"><span>Certificates issued</span><strong>{data.certificates.issued || 0}</strong><small>{data.certificates.active || 0} active credentials</small></article>
        <article className="panel"><span>Community participation</span><strong>{data.community.posts || 0}</strong><small>{data.community.contributors || 0} contributors</small></article>
        <article className="panel"><span>Email delivery</span><strong>{data.email.sent || 0}</strong><small>{data.email.needsAttention || 0} need attention - {data.email.queued || 0} queued</small></article>
        <article className="panel"><span>Product access</span><strong>{data.products.activeEntitlements || 0}</strong><small>{data.products.grants || 0} grants in this period - {data.products.published || 0} published</small></article>
        <article className="panel"><span>Live learning</span><strong>{data.liveLearning.registrations || 0}</strong><small>{data.liveLearning.attended || 0} attended - {data.liveLearning.sessions || 0} sessions</small></article>
      </div>

      <div className="analytics-layout">
        <article className="panel enrollment-chart">
          <div className="panel-title"><div><b>New enrolments</b><span>Selected period, latest 31 days shown</span></div></div>
          <div className="trend-chart" aria-label="New enrolments in the selected period">
            {chart.map((item) => <div key={item.key}>
              <span>{item.value}</span>
              <i style={{ height: `${Math.max(item.value ? 10 : 2, (item.value / maxTrend) * 100)}%` }} />
              <small>{item.label}</small>
            </div>)}
          </div>
        </article>
        <article className="panel analytics-activity">
          <div className="panel-title"><b>Recent learner activity</b></div>
          {data.activity.length ? data.activity.map((item, index) =>
            <div className="activity-row" key={`${item.type}-${item.occurredAt}-${index}`}>
              <span>{item.type === "completion" ? "✓" : "+"}</span>
              <div><p><b>{item.learnerName}</b> {item.type === "completion" ? "completed" : "enrolled in"} {item.courseTitle}</p><small>{new Date(item.occurredAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</small></div>
            </div>
          ) : <div className="empty-activity"><strong>No activity in this period</strong><p>Adjust the dates or course filter to widen the report.</p></div>}
        </article>
      </div>

      <article className="panel course-performance">
        <div className="course-performance-heading"><div><p className="sys-kicker">COURSE REPORT</p><h2>Performance by course</h2></div><span>{data.courses.length} courses</span></div>
        <div className="admin-table">
          <div className="admin-table-head"><span>Course</span><span>Active</span><span>Avg. progress</span><span>Completed</span><span>Status</span></div>
          {data.courses.map((course) => <div className="admin-table-row" key={course.id}>
            <div><b>{course.title}</b><small>{course.enrollments} total enrolments</small></div>
            <span>{course.activeLearners}</span><span>{course.averageProgress || 0}%</span><span>{course.completions || 0}</span><span className={`status ${course.status}`}>{course.status}</span>
          </div>)}
        </div>
      </article>
    </section>
  </main>;
}
