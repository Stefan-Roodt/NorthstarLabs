"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

type Course = { id: string; title: string; status: string };
type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  status: string;
  supportNote: string;
  lastActivityAt?: number;
  createdAt: number;
  courseTitle: string;
  displayName: string;
  email: string;
};
type LearnerData = { courses: Course[]; enrollments: Enrollment[] };

function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
}

export default function LearnerManagement() {
  const [data, setData] = useState<LearnerData | null>(null);
  const [email, setEmail] = useState("");
  const [courseId, setCourseId] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState("Loading learners...");
  const [busy, setBusy] = useState("");
  const supabase = getSupabaseBrowser();

  async function token() {
    return (await supabase?.auth.getSession())?.data.session?.access_token || "";
  }

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const accessToken = await token();
      if (!accessToken) {
        location.href = "/login?next=/dashboard/learners";
        return;
      }
      const response = await fetch("/api/admin/learners", {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        setMessage("Learner records could not be loaded.");
        return;
      }
      const result = await response.json() as LearnerData;
      setData(result);
      setCourseId(result.courses[0]?.id || "");
      setMessage("");
    })();
  }, [supabase]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data?.enrollments || []).filter((item) =>
      (status === "all" || item.status === status) &&
      (!query || `${item.displayName} ${item.email} ${item.courseTitle}`.toLowerCase().includes(query))
    );
  }, [data, search, status]);

  async function grantAccess(event: FormEvent) {
    event.preventDefault();
    if (!data || !courseId || !email.trim()) return;
    setBusy("add");
    setMessage("");
    const response = await fetch("/api/admin/learners", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ email, courseId }),
    });
    const result = await response.json();
    setBusy("");
    if (!response.ok) {
      setMessage(result.error || "Learner access could not be granted.");
      return;
    }
    setData({
      ...data,
      enrollments: [result, ...data.enrollments.filter((item) => item.id !== result.id)],
    });
    setEmail("");
    setMessage("Course access granted.");
  }

  function editLocal(id: string, patch: Partial<Enrollment>) {
    if (!data) return;
    setData({
      ...data,
      enrollments: data.enrollments.map((item) => item.id === id ? { ...item, ...patch } : item),
    });
  }

  async function updateEnrollment(item: Enrollment, action: "status" | "note" | "reset") {
    if (!data) return;
    if (action === "reset" && !confirm(`Reset all progress and remove the certificate for ${item.displayName}?`)) return;
    const nextStatus = item.status === "active" ? "paused" : "active";
    setBusy(`${action}-${item.id}`);
    setMessage("");
    const response = await fetch("/api/admin/learners", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({
        enrollmentId: item.id,
        action,
        status: action === "status" ? nextStatus : undefined,
        supportNote: action === "note" ? item.supportNote : undefined,
      }),
    });
    const result = await response.json();
    setBusy("");
    if (!response.ok) {
      setMessage(result.error || "Learner record could not be updated.");
      return;
    }
    if (action === "status") editLocal(item.id, { status: result.status });
    if (action === "reset") editLocal(item.id, { progress: 0, lastActivityAt: Date.now() });
    setMessage(action === "note" ? "Private support note saved." : action === "reset" ? "Learner progress reset." : "Learner access updated.");
  }

  function downloadLearners() {
    if (!data) return;
    const rows = [
      ["Learner", "Email", "Course", "Progress", "Status", "Joined", "Last activity", "Support note"],
      ...filtered.map((item) => [
        item.displayName,
        item.email,
        item.courseTitle,
        `${item.progress}%`,
        item.status,
        new Date(item.createdAt).toISOString(),
        item.lastActivityAt ? new Date(item.lastActivityAt).toISOString() : "",
        item.supportNote,
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `northstarlabs-learners-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!data) return <main className="system-loading"><div><b>NorthStarLabs</b><p>{message}</p></div></main>;

  return <main className="admin-page">
    <header className="admin-top">
      <a href="/dashboard">← Creator workspace</a>
      <div><p className="sys-kicker">LEARNER ADMINISTRATION</p><h1>People and access</h1></div>
      <div><a href="/dashboard/analytics">View analytics</a><button className="sys-primary" onClick={downloadLearners}>Export learners</button></div>
    </header>
    <section className="admin-body">
      <article className="panel manual-enrollment">
        <div><p className="sys-kicker">MANUAL ENROLMENT</p><h2>Grant course access</h2><p>The learner must already have a NorthStarLabs account.</p></div>
        <form onSubmit={grantAccess}>
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Learner email" />
          <select required value={courseId} onChange={(event) => setCourseId(event.target.value)}>
            {data.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
          <button className="sys-primary" disabled={busy === "add" || !data.courses.length}>
            {busy === "add" ? "Granting..." : "Grant access"}
          </button>
        </form>
      </article>

      <div className="learner-tools">
        <div><h2>Learner records</h2><p>{filtered.length} enrolments shown</p></div>
        <div>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search learner or course" />
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All access</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>
      {message && <div className="notice">{message}</div>}

      <div className="learner-admin-list">
        {filtered.map((item) => <article className="panel learner-admin-card" key={item.id}>
          <header>
            <span>{item.displayName.slice(0, 2).toUpperCase()}</span>
            <div><h3>{item.displayName}</h3><p>{item.email}</p></div>
            <div><b>{item.courseTitle}</b><small>Joined {new Date(item.createdAt).toLocaleDateString("en-ZA")}</small></div>
            <strong className={`status ${item.status}`}>{item.status}</strong>
          </header>
          <div className="learner-progress">
            <span>Course progress</span><i><b style={{ width: `${item.progress}%` }} /></i><strong>{item.progress}%</strong>
          </div>
          <div className="learner-support">
            <label>
              Private support note
              <textarea maxLength={2000} value={item.supportNote || ""}
                onChange={(event) => editLocal(item.id, { supportNote: event.target.value })}
                placeholder="Record follow-up, accommodations, or support context..." />
            </label>
            <div>
              <button onClick={() => updateEnrollment(item, "note")} disabled={busy === `note-${item.id}`}>Save note</button>
              <button onClick={() => updateEnrollment(item, "status")} disabled={busy === `status-${item.id}`}>
                {item.status === "active" ? "Pause access" : "Restore access"}
              </button>
              <button className="reset-progress" onClick={() => updateEnrollment(item, "reset")} disabled={busy === `reset-${item.id}`}>Reset progress</button>
            </div>
          </div>
        </article>)}
        {!filtered.length && <article className="panel empty-dashboard"><h2>No learner records match</h2><p>Change the filters or grant a registered learner access to a course.</p></article>}
      </div>
    </section>
  </main>;
}
