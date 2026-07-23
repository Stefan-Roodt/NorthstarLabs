"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

type AcademyExport = {
  id: string;
  status: string;
  filename: string;
  sizeBytes: number;
  fileCount: number;
  recordCount: number;
  originalFileCount: number;
  manifestChecksum: string | null;
  failureMessage: string | null;
  createdAt: number;
  completedAt: number | null;
  expiresAt: number | null;
  downloadedAt: number | null;
};

function readableSize(value: number) {
  if (!value) return "0 KB";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** index).toFixed(index > 1 ? 1 : 0)} ${units[index]}`;
}

function readableDate(value: number | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AcademyExportsPage() {
  const supabase = getSupabaseBrowser();
  const [school, setSchool] = useState<{ id: string; name: string; memberRole: string } | null>(null);
  const [exports, setExports] = useState<AcademyExport[]>([]);
  const [retentionDays, setRetentionDays] = useState(7);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("Loading your academy export controls…");

  const token = useCallback(async () => (
    (await supabase?.auth.getSession())?.data.session?.access_token || ""
  ), [supabase]);

  const authed = useCallback(async (init?: RequestInit) => fetch("/api/academy-exports", {
    ...init,
    headers: {
      authorization: `Bearer ${await token()}`,
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
  }), [token]);

  const load = useCallback(async () => {
    if (!supabase) return;
    if (!(await supabase.auth.getSession()).data.session) {
      location.href = "/login?next=/dashboard/exports";
      return;
    }
    const response = await authed();
    const data = await response.json() as {
      error?: string;
      school?: { id: string; name: string; memberRole: string };
      retentionDays?: number;
      exports?: AcademyExport[];
    };
    if (!response.ok || !data.school) {
      setMessage(data.error || "The export workspace could not be opened.");
      return;
    }
    setSchool(data.school);
    setExports(data.exports || []);
    setRetentionDays(data.retentionDays || 7);
    setMessage("");
  }, [authed, supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function prepareExport() {
    if (!confirmed || busy) return;
    setBusy("create");
    setMessage("Preparing the records and copying every academy-owned original file. Keep this page open…");
    try {
      const response = await authed({
        method: "POST",
        body: JSON.stringify({ action: "create", confirmation: "EXPORT" }),
      });
      const data = await response.json() as { error?: string; export?: AcademyExport };
      if (!response.ok || !data.export) throw new Error(data.error || "The export could not be completed.");
      setExports((current) => [data.export!, ...current.filter((item) => item.id !== data.export!.id)]);
      setConfirmed(false);
      setMessage("Your complete portable archive is ready. Use Download below within the retention window.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The export could not be completed.");
      await load();
    } finally {
      setBusy("");
    }
  }

  async function downloadExport(item: AcademyExport) {
    if (busy) return;
    setBusy(item.id);
    setMessage("Creating a private one-hour download link…");
    try {
      const response = await authed({
        method: "POST",
        body: JSON.stringify({ action: "download", exportId: item.id }),
      });
      const data = await response.json() as { error?: string; downloadUrl?: string };
      if (!response.ok || !data.downloadUrl) throw new Error(data.error || "The download could not be started.");
      setMessage("Download started. The private link is valid for one hour and supports resuming.");
      window.location.assign(data.downloadUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The download could not be started.");
    } finally {
      setBusy("");
    }
  }

  async function removeExport(item: AcademyExport) {
    if (busy || !window.confirm("Remove this downloadable archive now? The export history will remain.")) return;
    setBusy(`delete-${item.id}`);
    try {
      const response = await authed({ method: "DELETE", body: JSON.stringify({ exportId: item.id }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "The archive could not be removed.");
      setExports((current) => current.map((candidate) => candidate.id === item.id
        ? { ...candidate, status: "deleted" }
        : candidate));
      setMessage("The downloadable archive has been removed. Its audit history remains.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The archive could not be removed.");
    } finally {
      setBusy("");
    }
  }

  if (!school) return <main className="system-loading"><div><b>* NORTHSTARLABS</b><p>{message}</p></div></main>;

  return <main className="freedom-page">
    <header className="freedom-topbar">
      <Link href="/dashboard">← Creator workspace</Link>
      <b>Freedom Centre</b>
      <span>{school.name}</span>
    </header>

    <section className="freedom-hero">
      <div>
        <p className="sys-kicker">THE NORTHSTAR FREEDOM GUARANTEE</p>
        <h1>Your academy is yours.</h1>
        <p>Take your teaching, learner records, business history and original files with you in one portable archive. No support ticket. No exit fee. No deliberately unusable format.</p>
        <div className="freedom-promise"><span>JSON</span><span>CSV</span><span>MARKDOWN</span><span>ORIGINAL FILES</span></div>
      </div>
      <aside><small>EXPORT PRICE</small><strong>R0</strong><p>Self-service for academy owners and administrators. Every time.</p></aside>
    </section>

    <section className="freedom-workspace">
      <div className="freedom-heading"><p className="sys-kicker">ONE DOWNLOAD - SIX COMPLETE AREAS</p><h2>Everything needed to move, audit or keep your own record.</h2></div>
      <div className="freedom-coverage">
        <article><span>01</span><h3>Teaching</h3><p>Courses, modules, lessons, transcripts, quizzes, answers, certificates and Creator Studio source packs.</p></article>
        <article><span>02</span><h3>Learners</h3><p>Members, invitations without active tokens, enrolments, progress, assessment attempts and mastery records.</p></article>
        <article><span>03</span><h3>Business</h3><p>Products, entitlements, live programmes, scheduled reports, email history and operational audit records.</p></article>
        <article><span>04</span><h3>Community</h3><p>Community settings, members, posts, moderation reports and access relationships.</p></article>
        <article><span>05</span><h3>Coaching</h3><p>Coach profiles, credentials, availability, enquiries, two-way ratings and private academy notes.</p></article>
        <article><span>06</span><h3>Original files</h3><p>Every academy-owned upload copied unchanged into organised folders, plus a manifest for external references.</p></article>
      </div>

      <div className="freedom-create">
        <div>
          <p className="sys-kicker">PREPARE A FRESH COPY</p>
          <h2>One archive. Readable without Northstar.</h2>
          <p>The ZIP includes a human-readable README, complete JSON, spreadsheet-friendly CSV tables, course-by-course Markdown and the original media library. It also includes a SHA-256 checksum for the manifest.</p>
          <label><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span><b>I understand this archive contains private learner and academy data.</b><small>I will store it securely and share it only with authorised people.</small></span></label>
          <button type="button" disabled={!confirmed || Boolean(busy)} onClick={prepareExport}>{busy === "create" ? "Preparing complete archive…" : "Prepare complete academy export →"}</button>
          {message && <div className="freedom-message">{message}</div>}
        </div>
        <aside>
          <p className="sys-kicker">PORTABLE BY DESIGN</p>
          <ol><li><b>README.txt</b><span>What is included and how to use it</span></li><li><b>data/all-data.json</b><span>Relationships and complete field values</span></li><li><b>data/tables/*.csv</b><span>Easy inspection and common imports</span></li><li><b>courses/*</b><span>Readable curriculum and assessment packages</span></li><li><b>original-files/*</b><span>Unchanged documents, video, audio and images</span></li></ol>
          <p className="freedom-security"><b>Security credentials are not content.</b> Passwords, active invite links, signing secrets, private storage paths and temporary playback grants are deliberately excluded.</p>
        </aside>
      </div>
    </section>

    <section className="freedom-history">
      <div><p className="sys-kicker">DOWNLOAD HISTORY</p><h2>Your recent archives.</h2><p>Completed files are retained for {retentionDays} days, then securely removed. You can prepare a fresh copy at any time.</p></div>
      <div>
        {!exports.length && <p className="freedom-empty">No academy export has been prepared yet.</p>}
        {exports.map((item) => <article key={item.id}>
          <span className={`freedom-status ${item.status}`}>{item.status}</span>
          <div><b>{item.filename}</b><small>{item.status === "completed" ? `${readableSize(item.sizeBytes)} - ${item.recordCount.toLocaleString()} records - ${item.originalFileCount.toLocaleString()} original files` : item.failureMessage || "Archive no longer stored"}</small><time>Created {readableDate(item.createdAt)}{item.expiresAt ? ` - available until ${readableDate(item.expiresAt)}` : ""}</time></div>
          {item.status === "completed" && <button type="button" disabled={Boolean(busy)} onClick={() => downloadExport(item)}>{busy === item.id ? "Starting…" : "Download"}</button>}
          {!["deleted", "expired", "preparing"].includes(item.status) && <button className="quiet" type="button" disabled={Boolean(busy)} onClick={() => removeExport(item)}>{busy === `delete-${item.id}` ? "Removing…" : "Remove"}</button>}
        </article>)}
      </div>
    </section>
  </main>;
}
