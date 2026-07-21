"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

type Question = { id: string; question: string; status: string; response: string; createdAt: number; updatedAt: number; learnerName: string; learnerEmail: string; courseTitle: string; lessonTitle: string };

export default function LessonQuestionsPage() {
  const supabase = getSupabaseBrowser();
  const [school, setSchool] = useState<{ id: string; name: string } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState("open");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("Loading learner questions…");
  const token = useCallback(async () => (await supabase?.auth.getSession())?.data.session?.access_token || "", [supabase]);

  const load = useCallback(async () => {
    if (!supabase) return;
    const accessToken = await token();
    if (!accessToken) { location.href = "/login?next=/dashboard/questions"; return; }
    const response = await fetch(`/api/lesson-help?view=staff&status=${filter}`, { headers: { authorization: `Bearer ${accessToken}` } });
    const result = await response.json() as { error?: string; questions?: Question[]; school?: { id: string; name: string } };
    if (!response.ok) { setMessage(result.error || "The question desk could not be opened."); return; }
    setQuestions(result.questions || []); setSchool(result.school || null);
    setDrafts(Object.fromEntries((result.questions || []).map((item) => [item.id, item.response || ""])));
    setMessage("");
  }, [filter, supabase, token]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  async function updateQuestion(item: Question, status: "answered" | "closed") {
    setBusy(item.id); setMessage("");
    const response = await fetch("/api/lesson-help", { method: "PATCH", headers: { authorization: `Bearer ${await token()}`, "content-type": "application/json" }, body: JSON.stringify({ requestId: item.id, response: drafts[item.id] || "", status }) });
    const result = await response.json() as { error?: string };
    if (response.ok) { setMessage(status === "answered" ? "Response sent and saved with the learner’s lesson." : "Question closed."); await load(); }
    else setMessage(result.error || "The question could not be updated.");
    setBusy("");
  }

  return <main className="lesson-question-desk admin-page">
    <header className="admin-top"><Link href="/dashboard">← Creator workspace</Link><div><p className="sys-kicker">HUMAN HELP, IN CONTEXT</p><h1>Lesson questions</h1></div><div><span>{school?.name || "Your academy"}</span></div></header>
    <section className="admin-body">
      <div className="question-desk-intro"><div><p className="sys-kicker">EDUCATOR RESPONSE DESK</p><h2>Answer at the moment learning gets difficult.</h2><p>Every question arrives with its course and lesson, so you can give a precise answer without asking the learner to repeat the context.</p></div><strong>{questions.length}<small>{filter} {questions.length === 1 ? "question" : "questions"}</small></strong></div>
      <nav className="question-filters" aria-label="Question status">{["open", "answered", "closed"].map((status) => <button key={status} className={filter === status ? "active" : ""} onClick={() => setFilter(status)}>{status}</button>)}</nav>
      {message && <div className="notice" role="status">{message}</div>}
      <div className="question-desk-list">
        {!message && questions.length === 0 && <article className="panel question-desk-empty"><span>✓</span><h3>No {filter} lesson questions.</h3><p>When a learner asks for human help inside a lesson, it will appear here and reach the academy by email.</p></article>}
        {questions.map((item) => <article className="panel question-desk-card" key={item.id}>
          <header><div><span className={`question-status ${item.status}`}>{item.status}</span><time>{new Date(item.createdAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</time></div><div><b>{item.courseTitle}</b><span>{item.lessonTitle}</span></div></header>
          <div className="question-learner"><span>{item.learnerName.slice(0, 2).toUpperCase()}</span><div><b>{item.learnerName}</b><small>{item.learnerEmail}</small></div></div>
          <blockquote>{item.question}</blockquote>
          <label>Your response<textarea maxLength={3_000} disabled={item.status === "closed"} value={drafts[item.id] || ""} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Answer clearly, point to the relevant course idea, and suggest the learner’s next step." /></label>
          <footer><span>{(drafts[item.id] || "").length}/3,000</span>{item.status !== "closed" && <div><button disabled={busy === item.id} onClick={() => void updateQuestion(item, "closed")}>Close</button><button className="sys-primary" disabled={busy === item.id || (drafts[item.id] || "").trim().length < 2} onClick={() => void updateQuestion(item, "answered")}>{busy === item.id ? "Saving…" : item.status === "answered" ? "Update response" : "Send response"}</button></div>}</footer>
        </article>)}
      </div>
    </section>
  </main>;
}
