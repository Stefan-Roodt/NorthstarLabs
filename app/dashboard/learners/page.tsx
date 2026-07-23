"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
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
  certificateCode?: string | null;
  certificateStatus?: string | null;
};
type LearnerData = {
  school: { id: string; name: string; memberRole: string };
  courses: Course[];
  enrollments: Enrollment[];
};
type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  courseId: string | null;
  courseTitle: string | null;
  expiresAt: number;
  createdAt: number;
};

function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
}

export default function LearnerManagement() {
  const [data, setData] = useState<LearnerData | null>(null);
  const [email, setEmail] = useState("");
  const [courseId, setCourseId] = useState("");
  const [inviteRole, setInviteRole] = useState("learner");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteUrl, setInviteUrl] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState("Loading learners...");
  const [busy, setBusy] = useState("");
  const supabase = getSupabaseBrowser();

  const token = useCallback(async () => {
    return (await supabase?.auth.getSession())?.data.session?.access_token || "";
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const accessToken = await token();
      if (!accessToken) {
        location.href = "/login?next=/dashboard/learners";
        return;
      }
      const headers = { authorization: `Bearer ${accessToken}` };
      const [learnerResponse, invitationResponse] = await Promise.all([
        fetch("/api/admin/learners", { headers }),
        fetch("/api/invitations", { headers }),
      ]);
      if (!learnerResponse.ok || !invitationResponse.ok) {
        setMessage("Learner records could not be loaded.");
        return;
      }
      const result = await learnerResponse.json() as LearnerData;
      const invitationResult = await invitationResponse.json() as { invitations: Invitation[] };
      setData(result);
      setInvitations(invitationResult.invitations);
      setCourseId(result.courses[0]?.id || "");
      setMessage("");
    })();
  }, [supabase, token]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data?.enrollments || []).filter((item) =>
      (status === "all" || item.status === status) &&
      (!query || `${item.displayName} ${item.email} ${item.courseTitle}`.toLowerCase().includes(query))
    );
  }, [data, search, status]);

  async function createInvitation(event: FormEvent) {
    event.preventDefault();
    if (!data || !email.trim()) return;
    await issueInvitation({
      email,
      role: inviteRole,
      courseId: inviteRole === "learner" ? courseId || null : null,
    }, "add");
  }

  async function issueInvitation(
    invitation: { email: string; role: string; courseId: string | null },
    busyKey: string,
  ) {
    setBusy(busyKey);
    setMessage("");
    setInviteUrl("");
    const response = await fetch("/api/invitations", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify(invitation),
    });
    const result = await response.json() as {
      invitation?: Invitation;
      inviteUrl?: string;
      error?: string;
    };
    setBusy("");
    if (!response.ok || !result.invitation || !result.inviteUrl) {
      setMessage(result.error || "The invitation could not be created.");
      return;
    }
    setInvitations((current) => [
      result.invitation!,
      ...current.filter((item) =>
        item.id !== result.invitation?.id &&
        !(
          item.status === "pending" &&
          item.email === result.invitation?.email &&
          item.role === result.invitation?.role &&
          item.courseId === result.invitation?.courseId
        )
      ),
    ]);
    setInviteUrl(result.inviteUrl);
    setEmail("");
    setMessage("Secure invitation created. Copy and send the link below.");
  }

  async function renewInvitation(invitation: Invitation) {
    await issueInvitation({
      email: invitation.email,
      role: invitation.role,
      courseId: invitation.courseId,
    }, `renew-${invitation.id}`);
  }

  async function copyInvitation() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setMessage("Invitation link copied.");
  }

  async function revokeInvitation(invitation: Invitation) {
    if (!confirm(`Revoke the invitation for ${invitation.email}?`)) return;
    setBusy(`revoke-${invitation.id}`);
    const response = await fetch("/api/invitations", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ invitationId: invitation.id }),
    });
    const result = await response.json() as { error?: string };
    setBusy("");
    if (!response.ok) {
      setMessage(result.error || "The invitation could not be revoked.");
      return;
    }
    setInvitations(invitations.map((item) =>
      item.id === invitation.id ? { ...item, status: "revoked" } : item
    ));
    setMessage("Invitation revoked.");
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

  async function manageCertificate(item: Enrollment, action: "revoke" | "replace") {
    if (!item.certificateCode) return;
    const verb = action === "revoke" ? "Revoke" : "Replace";
    if (!confirm(`${verb} the certificate for ${item.displayName}?`)) return;
    setBusy(`${action}-${item.id}`);
    const response = await fetch(`/api/certificates/${encodeURIComponent(item.certificateCode)}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ action }),
    });
    const result = await response.json() as {
      error?: string;
      status?: string;
      replacementCode?: string;
    };
    setBusy("");
    if (!response.ok) {
      setMessage(result.error || "The certificate could not be updated.");
      return;
    }
    editLocal(item.id, {
      certificateCode: result.replacementCode || item.certificateCode,
      certificateStatus: result.replacementCode ? "active" : result.status || item.certificateStatus,
    });
    setMessage(action === "replace" ? "Replacement certificate issued." : "Certificate revoked.");
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

  if (!data) return <main className="system-loading"><div><b>NorthstarLabs</b><p>{message}</p></div></main>;

  return <main className="admin-page">
    <header className="admin-top">
      <a href="/dashboard">← Creator workspace</a>
      <div><p className="sys-kicker">LEARNER ADMINISTRATION</p><h1>People and access</h1></div>
      <div><a href="/dashboard/analytics">View analytics</a><button className="sys-primary" onClick={downloadLearners}>Export learners</button></div>
    </header>
    <section className="admin-body">
      <article className="panel manual-enrollment invitation-builder">
        <div><p className="sys-kicker">SECURE INVITATIONS</p><h2>Invite people to {data.school.name}</h2><p>They can create an account or sign in from the same link-no pre-existing account required.</p></div>
        <form onSubmit={createInvitation}>
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" />
          <select value={inviteRole} onChange={(event) => setInviteRole(event.target.value)}>
            <option value="learner">Learner</option>
            {data.school.memberRole !== "instructor" && <option value="instructor">Instructor</option>}
            {data.school.memberRole === "owner" && <option value="admin">Academy admin</option>}
          </select>
          {inviteRole === "learner" && <select value={courseId} onChange={(event) => setCourseId(event.target.value)}>
            <option value="">Academy only (no course yet)</option>
            {data.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>}
          <button className="sys-primary" disabled={busy !== ""}>
            {busy === "add" ? "Creating..." : "Create invite"}
          </button>
        </form>
        {inviteUrl && <div className="invite-link-result">
          <label>Share this one-time link<input readOnly value={inviteUrl} onFocus={(event) => event.currentTarget.select()} /></label>
          <button type="button" onClick={copyInvitation}>Copy link</button>
        </div>}
      </article>

      <section className="pending-invitations">
        <div className="learner-tools">
          <div><h2>Pending invitations</h2><p>Secure links expire after seven days and can be revoked at any time.</p></div>
        </div>
        <div className="invitation-list">
          {invitations.filter((item) => item.status === "pending").map((item) => (
            <article className="panel invitation-row" key={item.id}>
              <div><b>{item.email}</b><small>{item.role === "learner" ? "Learner" : item.role === "admin" ? "Academy admin" : "Instructor"}{item.courseTitle ? ` - ${item.courseTitle}` : ""}</small></div>
              <span>Expires {new Date(item.expiresAt).toLocaleDateString("en-ZA")}</span>
              <div className="invitation-row-actions">
                <button disabled={busy !== ""} onClick={() => renewInvitation(item)}>
                  {busy === `renew-${item.id}` ? "Creating…" : "New link"}
                </button>
                <button disabled={busy !== ""} onClick={() => revokeInvitation(item)}>
                  {busy === `revoke-${item.id}` ? "Revoking…" : "Revoke"}
                </button>
              </div>
            </article>
          ))}
          {!invitations.some((item) => item.status === "pending") && (
            <article className="panel invitation-empty">No pending invitations.</article>
          )}
        </div>
      </section>

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
          {item.certificateCode && <div className="learner-certificate-admin">
            <div><b>Certificate {item.certificateCode}</b><span className={`status ${item.certificateStatus}`}>{item.certificateStatus}</span></div>
            <div>
              <Link href={`/certificates/${item.certificateCode}`} target="_blank">Verify</Link>
              <button onClick={() => manageCertificate(item, "replace")} disabled={busy === `replace-${item.id}`}>Replace</button>
              {item.certificateStatus === "active" && <button onClick={() => manageCertificate(item, "revoke")} disabled={busy === `revoke-${item.id}`}>Revoke</button>}
            </div>
          </div>}
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
        {!filtered.length && <article className="panel empty-dashboard"><h2>No learner records match</h2><p>Change the filters or create an invitation above.</p></article>}
      </div>
    </section>
  </main>;
}
