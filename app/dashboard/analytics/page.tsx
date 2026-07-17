"use client";

import { useEffect, useMemo, useState } from "react";
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
type Activity = {
  type: string;
  occurredAt: number;
  courseTitle: string;
  learnerName: string;
};
type AnalyticsData = {
  summary: {
    courses: number;
    enrollments: number;
    activeEnrollments: number;
    activeLearners: number;
    averageProgress: number;
    completions: number;
  };
  courses: CourseMetric[];
  trend: Array<{ day: string; enrollments: number }>;
  activity: Activity[];
};

function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [message, setMessage] = useState("Preparing analytics...");
  const supabase = getSupabaseBrowser();

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) {
        location.href = "/login?next=/dashboard/analytics";
        return;
      }
      const response = await fetch("/api/admin/overview", {
        headers: { authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) {
        setMessage("Analytics could not be loaded.");
        return;
      }
      setData(await response.json());
      setMessage("");
    })();
  }, [supabase]);

  const chart = useMemo(() => {
    const values = new Map((data?.trend || []).map((item) => [item.day, Number(item.enrollments)]));
    return Array.from({ length: 14 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - index));
      const key = date.toISOString().slice(0, 10);
      return { key, label: date.toLocaleDateString("en-ZA", { day: "numeric", month: "short" }), value: values.get(key) || 0 };
    });
  }, [data]);

  function downloadReport() {
    if (!data) return;
    const rows = [
      ["Course", "Status", "Total enrolments", "Active learners", "Average progress", "Completions"],
      ...data.courses.map((course) => [
        course.title,
        course.status,
        course.enrollments,
        course.activeLearners,
        `${course.averageProgress}%`,
        course.completions,
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `northstarlabs-course-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!data) return <main className="system-loading"><div><b>NorthStarLabs</b><p>{message}</p></div></main>;

  const maxTrend = Math.max(1, ...chart.map((item) => item.value));
  const completionRate = Number(data.summary.activeEnrollments)
    ? Math.round((Number(data.summary.completions) / Number(data.summary.activeEnrollments)) * 100)
    : 0;

  return <main className="admin-page">
    <header className="admin-top">
      <a href="/dashboard">← Creator workspace</a>
      <div><p className="sys-kicker">CREATOR ANALYTICS</p><h1>Learning performance</h1></div>
      <div><a href="/dashboard/learners">Manage learners</a><button className="sys-primary" onClick={downloadReport}>Export report</button></div>
    </header>
    <section className="admin-body">
      <div className="metric-row admin-metrics">
        <article><span>Active learners</span><strong>{data.summary.activeLearners || 0}</strong><small>{data.summary.enrollments || 0} total enrolments</small></article>
        <article><span>Average progress</span><strong>{data.summary.averageProgress || 0}%</strong><small>Across active enrolments</small></article>
        <article><span>Completion rate</span><strong>{completionRate}%</strong><small>{data.summary.completions || 0} courses completed</small></article>
      </div>

      <div className="analytics-layout">
        <article className="panel enrollment-chart">
          <div className="panel-title"><div><b>New enrolments</b><span>Last 14 days</span></div></div>
          <div className="trend-chart" aria-label="New enrolments over the last 14 days">
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
              <div>
                <p><b>{item.learnerName}</b> {item.type === "completion" ? "completed" : "enrolled in"} {item.courseTitle}</p>
                <small>{new Date(item.occurredAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</small>
              </div>
            </div>
          ) : <div className="empty-activity"><strong>No learner activity yet</strong><p>New enrolments and completions will appear here.</p></div>}
        </article>
      </div>

      <article className="panel course-performance">
        <div className="course-performance-heading">
          <div><p className="sys-kicker">COURSE REPORT</p><h2>Performance by course</h2></div>
          <span>{data.courses.length} courses</span>
        </div>
        <div className="admin-table">
          <div className="admin-table-head"><span>Course</span><span>Active</span><span>Avg. progress</span><span>Completed</span><span>Status</span></div>
          {data.courses.map((course) => <div className="admin-table-row" key={course.id}>
            <div><b>{course.title}</b><small>{course.enrollments} total enrolments</small></div>
            <span>{course.activeLearners}</span>
            <span>{course.averageProgress || 0}%</span>
            <span>{course.completions || 0}</span>
            <span className={`status ${course.status}`}>{course.status}</span>
          </div>)}
        </div>
      </article>
    </section>
  </main>;
}
