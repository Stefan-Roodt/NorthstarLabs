"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-client";

type Summary = { ready: number; strengthening: number; mastered: number; total: number };
type MasteryItem = {
  id: string;
  questionId: string;
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  quizTitle: string;
  conceptLabel: string;
  status: "needs_review" | "practising" | "mastered";
  wrongCount: number;
  correctStreak: number;
  firstSeenAt: number;
  lastReviewedAt: number | null;
  nextReviewAt: number | null;
  masteredAt: number | null;
  prompt: string;
  options: string[];
  due: boolean;
};
type PracticeResult = {
  correct: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
  status: MasteryItem["status"];
  correctStreak: number;
  nextReviewAt: number | null;
  masteredAt: number | null;
};

const emptySummary: Summary = { ready: 0, strengthening: 0, mastered: 0, total: 0 };

function reviewDate(timestamp: number | null) {
  if (!timestamp || timestamp <= Date.now()) return "Ready now";
  return `Review ${new Date(timestamp).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}`;
}

export default function MasteryPage() {
  const supabase = getSupabaseBrowser();
  const [items, setItems] = useState<MasteryItem[]>([]);
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeId, setActiveId] = useState("");
  const [answer, setAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<PracticeResult | null>(null);
  const [practised, setPractised] = useState<Set<string>>(new Set());

  const accessToken = useCallback(async () => {
    return (await supabase?.auth.getSession())?.data.session?.access_token || "";
  }, [supabase]);

  const loadMastery = useCallback(async () => {
    if (!supabase) {
      setMessage("Sign-in is unavailable. Please refresh and try again.");
      setLoading(false);
      return;
    }
    const token = await accessToken();
    if (!token) {
      window.location.assign("/login?next=/mastery");
      return;
    }
    const courseId = new URLSearchParams(window.location.search).get("courseId") || "";
    const response = await fetch(`/api/mastery${courseId ? `?courseId=${encodeURIComponent(courseId)}` : ""}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const result = await response.json() as { error?: string; summary?: Summary; items?: MasteryItem[] };
    if (!response.ok) {
      setMessage(result.error || "Your mastery record could not be loaded.");
      setLoading(false);
      return;
    }
    setItems(result.items || []);
    setSummary(result.summary || emptySummary);
    setActiveId((current) => current || result.items?.find((item) => item.due)?.questionId || "");
    setLoading(false);
  }, [accessToken, supabase]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (!cancelled) await loadMastery();
    })();
    return () => {
      cancelled = true;
    };
  }, [loadMastery]);

  const ready = useMemo(
    () => items.filter((item) => item.due && !practised.has(item.questionId)),
    [items, practised],
  );
  const active = items.find((item) => item.questionId === activeId) || ready[0] || null;
  const strengthening = items.filter((item) => item.status === "practising");
  const mastered = items.filter((item) => item.status === "mastered");

  async function submitPractice() {
    if (!active || answer === null) {
      setMessage("Choose an answer before checking this concept.");
      return;
    }
    setMessage("Checking your understandingâ€¦");
    const response = await fetch("/api/mastery", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await accessToken()}`,
      },
      body: JSON.stringify({ questionId: active.questionId, answer }),
    });
    const result = await response.json() as PracticeResult & { error?: string };
    if (!response.ok) {
      setMessage(result.error || "This review could not be saved.");
      return;
    }
    setFeedback(result);
    setMessage("");
    await loadMastery();
  }

  function continueReview() {
    if (!active) return;
    const nextPractised = new Set(practised).add(active.questionId);
    setPractised(nextPractised);
    const next = items.find((item) => item.due && !nextPractised.has(item.questionId));
    setActiveId(next?.questionId || "");
    setAnswer(null);
    setFeedback(null);
    setMessage(next ? "" : "Review complete for now. Your next check will appear here automatically.");
  }

  return <main className="mastery-page">
    <header className="mastery-topbar">
      <Link className="system-brand" href="/">âœ¦ NORTHSTARLABS</Link>
      <nav><Link href="/learn">My learning</Link><Link href="/portfolio">Proof portfolio</Link><Link href="/account">Account</Link></nav>
    </header>

    <section className="mastery-hero">
      <div>
        <p className="sys-kicker">YOUR PERSONAL MASTERY LOOP</p>
        <h1>Turn every mistake into something you master.</h1>
        <p>Northstar remembers the concepts that need another look, gives you a focused follow-up check, and retires each one only after you answer it correctly twice.</p>
        <div className="mastery-hero-actions">
          {ready.length > 0 && <button className="sys-primary" onClick={() => {
            setActiveId(ready[0]?.questionId || items.find((item) => item.due)?.questionId || "");
            document.querySelector<HTMLElement>(".mastery-practice")?.scrollIntoView({ behavior: "smooth" });
          }}>Review {ready.length} now â†’</button>}
          <Link href="/learn">Return to my courses</Link>
        </div>
      </div>
      <div className="mastery-scoreboard" aria-label="Mastery summary">
        <article><strong>{ready.length}</strong><span>Ready to review</span></article>
        <article><strong>{summary.strengthening}</strong><span>Strengthening</span></article>
        <article><strong>{summary.mastered}</strong><span>Concepts mastered</span></article>
      </div>
    </section>

    {loading ? <section className="mastery-empty"><p>Preparing your personal review queueâ€¦</p></section> : <>
      {summary.total === 0 ? <section className="mastery-empty">
        <span>âœ¦</span><h2>Your mastery record starts with real learning.</h2>
        <p>Complete a knowledge check. If a concept needs work, Northstar will bring it here with the original lesson and explanation.</p>
        <Link className="sys-primary" href="/learn">Open my courses â†’</Link>
      </section> : <>
        <section className="mastery-practice">
          <div className="mastery-section-heading">
            <div><p className="sys-kicker">FOCUSED REVIEW</p><h2>{ready.length ? "One concept at a time." : "You are caught up."}</h2></div>
            <span>{ready.length} remaining this session</span>
          </div>
          {active && (Boolean(feedback) || (active.due && !practised.has(active.questionId))) ? <article className="mastery-question-card">
            <div className="mastery-question-context">
              <span>{active.courseTitle}</span><span>{active.lessonTitle}</span>
            </div>
            <p className="sys-kicker">CONCEPT: {active.conceptLabel.toUpperCase()}</p>
            <h3>{active.prompt}</h3>
            <fieldset disabled={Boolean(feedback)}>
              <legend className="sr-only">Choose an answer</legend>
              {active.options.map((option, index) => <label key={index} className={answer === index ? "selected" : ""}>
                <input type="radio" name={`mastery-${active.questionId}`} checked={answer === index} onChange={() => setAnswer(index)} />
                <span>{option}</span>
              </label>)}
            </fieldset>
            {feedback ? <div className={`mastery-feedback ${feedback.correct ? "correct" : "incorrect"}`} role="status">
              <b>{feedback.correct ? (feedback.status === "mastered" ? "Mastered." : "Correct. One later check will confirm it.") : "Not yetâ€”keep the concept in your loop."}</b>
              {!feedback.correct && <span>Correct answer: {feedback.correctAnswer}</span>}
              <p>{feedback.explanation}</p>
              <button className="sys-primary" onClick={continueReview}>{ready.length > 1 ? "Continue review â†’" : "Finish for now"}</button>
            </div> : <button className="sys-primary" onClick={submitPractice}>Check my answer</button>}
          </article> : <div className="mastery-caught-up">
            <span>âœ“</span><div><h3>No concept needs attention right now.</h3><p>Northstar will place the next spaced check here when it is due.</p></div>
          </div>}
          {message && <p className="mastery-message" role="status">{message}</p>}
        </section>

        <section className="mastery-library">
          <div className="mastery-section-heading"><div><p className="sys-kicker">YOUR CONCEPT MAP</p><h2>See understanding change over time.</h2></div></div>
          <div className="mastery-library-columns">
            <div><h3>Strengthening <span>{strengthening.length}</span></h3>{strengthening.length ? strengthening.map((item) => <article key={item.questionId}>
              <i>1/2</i><div><b>{item.conceptLabel}</b><span>{item.courseTitle}</span></div><small>{reviewDate(item.nextReviewAt)}</small>
            </article>) : <p>Your first correct review moves a concept here.</p>}</div>
            <div><h3>Mastered <span>{mastered.length}</span></h3>{mastered.length ? mastered.map((item) => <article key={item.questionId}>
              <i>âœ“</i><div><b>{item.conceptLabel}</b><span>{item.courseTitle}</span></div><Link href={`/learn/${item.courseId}`}>Revisit</Link>
            </article>) : <p>Two correct checks move a concept here.</p>}</div>
          </div>
        </section>
      </>}
    </>}
  </main>;
}
