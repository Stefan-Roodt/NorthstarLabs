"use client";

import { useCallback, useEffect, useState } from "react";
import type { LessonHelpMode, LessonHelpResult } from "../../../lib/contextual-lesson-help";

type LearnerQuestion = {
  id: string;
  question: string;
  status: string;
  response: string;
  createdAt: number;
  respondedAt: number | null;
};

const actions: Array<{ mode: LessonHelpMode; label: string; needsQuery?: boolean }> = [
  { mode: "explain", label: "Explain simply" },
  { mode: "define", label: "Define this term", needsQuery: true },
  { mode: "example", label: "Find an example", needsQuery: true },
  { mode: "search", label: "Search earlier lessons", needsQuery: true },
  { mode: "check", label: "Test my understanding" },
];

export function ContextualLessonHelp({
  lessonId,
  lessonTitle,
  courseTitle,
  accessToken,
  onSaveToNotes,
}: {
  lessonId: string;
  lessonTitle: string;
  courseTitle: string;
  accessToken: () => Promise<string>;
  onSaveToNotes: (text: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [help, setHelp] = useState<LessonHelpResult | null>(null);
  const [questions, setQuestions] = useState<LearnerQuestion[]>([]);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [showAsk, setShowAsk] = useState(false);

  const headers = useCallback(async () => ({ authorization: `Bearer ${await accessToken()}` }), [accessToken]);

  const loadQuestions = useCallback(async () => {
    const response = await fetch(`/api/lesson-help?lessonId=${encodeURIComponent(lessonId)}`, { headers: await headers() });
    if (response.ok) setQuestions(((await response.json()) as { questions: LearnerQuestion[] }).questions || []);
  }, [headers, lessonId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadQuestions(), 0);
    return () => window.clearTimeout(timer);
  }, [lessonId, loadQuestions]);

  async function requestHelp(mode: LessonHelpMode, needsQuery = false) {
    if (needsQuery && query.trim().length < 2) {
      setMessage("Type the term or topic you want help with first.");
      return;
    }
    setBusy(mode);
    setMessage("");
    const response = await fetch("/api/lesson-help", {
      method: "POST",
      headers: { ...(await headers()), "content-type": "application/json" },
      body: JSON.stringify({ action: "help", lessonId, mode, question: query }),
    });
    const result = await response.json() as { error?: string; help?: LessonHelpResult };
    if (response.ok && result.help) setHelp(result.help);
    else setMessage(result.error || "Lesson help is temporarily unavailable.");
    setBusy("");
  }

  async function askEducator() {
    if (query.trim().length < 10) {
      setMessage("Tell the educator what is unclear in at least one short sentence.");
      setShowAsk(true);
      return;
    }
    setBusy("educator");
    setMessage("");
    const response = await fetch("/api/lesson-help", {
      method: "POST",
      headers: { ...(await headers()), "content-type": "application/json" },
      body: JSON.stringify({ action: "ask_educator", lessonId, question: query }),
    });
    const result = await response.json() as { error?: string };
    if (response.ok) {
      setQuery("");
      setShowAsk(false);
      setMessage("Your question is with the educator. Their response will appear here and reach you by email.");
      await loadQuestions();
    } else setMessage(result.error || "Your question could not be sent.");
    setBusy("");
  }

  async function saveHelp() {
    if (!help) return;
    setBusy("save");
    const sources = help.sources.map((source) => `- ${source.lessonTitle}: ${source.excerpt}`).join("\n");
    await onSaveToNotes(`Contextual help — ${help.heading}\n${help.answer}${sources ? `\nSources from this course:\n${sources}` : ""}`);
    setMessage("Saved to your private lesson notes.");
    setBusy("");
  }

  return <section className="contextual-help" aria-labelledby="contextual-help-title">
    <header>
      <div>
        <p className="sys-kicker">CONTEXTUAL LESSON HELP</p>
        <h2 id="contextual-help-title">Stuck? Stay inside the lesson.</h2>
        <p>Get a simpler explanation, find the exact course passage, test yourself, or ask the educator.</p>
      </div>
      <span>Built only from {courseTitle}</span>
    </header>
    <label className="contextual-help-input">
      <span>What is unclear?</span>
      <input
        maxLength={500}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={`Ask about a term or idea in “${lessonTitle}”`}
      />
    </label>
    <div className="contextual-help-actions">
      {actions.map((action) => <button
        key={action.mode}
        type="button"
        disabled={Boolean(busy)}
        onClick={() => void requestHelp(action.mode, action.needsQuery)}
      >{busy === action.mode ? "Checking…" : action.label}</button>)}
    </div>

    {help && <article className={`contextual-help-result${help.enoughEvidence ? "" : " limited"}`}>
      <div className="contextual-help-result-heading">
        <div><small>{help.enoughEvidence ? "COURSE-GROUNDED RESPONSE" : "EVIDENCE LIMIT REACHED"}</small><h3>{help.heading}</h3></div>
        {help.enoughEvidence && <button type="button" disabled={Boolean(busy)} onClick={() => void saveHelp()}>{busy === "save" ? "Saving…" : "Save to my notes"}</button>}
      </div>
      <p>{help.answer}</p>
      {help.checkpoint && <div className="contextual-checkpoint">
        <b>{help.checkpoint.prompt}</b>
        {help.checkpoint.options?.map((option, index) => <span key={option}>{String.fromCharCode(65 + index)}. {option}</span>)}
        <small>The answer is deliberately not revealed here. Use the course knowledge check for marked feedback.</small>
      </div>}
      {!!help.sources.length && <div className="contextual-sources">
        <b>Where this came from</b>
        {help.sources.map((source, index) => <blockquote key={`${source.lessonId}-${index}`}>
          <span>{source.lessonTitle}</span>
          <p>{source.excerpt}</p>
        </blockquote>)}
      </div>}
      <footer><span>{help.escalationSuggestion}</span><button type="button" onClick={() => setShowAsk(true)}>Still stuck? Ask the educator →</button></footer>
    </article>}

    {showAsk && <div className="educator-question-composer">
      <div><b>Ask a person, not a bot</b><span>Your educator will see the course and lesson with your question.</span></div>
      <textarea maxLength={1_000} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Describe what you understand, where you became stuck, and what would help." />
      <div><span>{query.length}/1,000</span><button type="button" disabled={Boolean(busy)} onClick={() => void askEducator()}>{busy === "educator" ? "Sending…" : "Send to educator"}</button></div>
    </div>}
    {!showAsk && <button className="ask-educator-plain" type="button" onClick={() => setShowAsk(true)}>I still need help from the educator</button>}

    {questions.length > 0 && <div className="lesson-question-history">
      <div><b>Your questions about this lesson</b><button type="button" onClick={() => void loadQuestions()}>Refresh</button></div>
      {questions.map((item) => <article key={item.id}>
        <header><span className={`question-status ${item.status}`}>{item.status}</span><time>{new Date(item.createdAt).toLocaleDateString("en-ZA")}</time></header>
        <p>{item.question}</p>
        {item.response && <blockquote><b>Educator response</b><p>{item.response}</p></blockquote>}
      </article>)}
    </div>}
    {message && <p className="contextual-help-message" role="status">{message}</p>}
  </section>;
}
