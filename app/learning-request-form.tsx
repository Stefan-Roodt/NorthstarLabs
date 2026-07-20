"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

type LearningRequestFormProps = {
  defaultType?: "course" | "coach" | "either";
  defaultTopic?: string;
  defaultDetail?: string;
  source?: string;
  compact?: boolean;
};

export function LearningRequestForm({
  defaultType = "either",
  defaultTopic = "",
  defaultDetail = "",
  source = "homepage",
  compact = false,
}: LearningRequestFormProps) {
  const [requestType, setRequestType] = useState(defaultType);
  const [topic, setTopic] = useState(defaultTopic);
  const [detail, setDetail] = useState(defaultDetail);
  const [requesterName, setRequesterName] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  const [received, setReceived] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setNotice("");
    const response = await fetch("/api/learning-requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        requestType,
        topic,
        detail,
        requesterName,
        requesterEmail,
        companyWebsite,
        source,
      }),
    });
    const result = await response.json() as { error?: string; message?: string };
    setSending(false);
    if (!response.ok) {
      setNotice(result.error || "We could not save your request. Please try again.");
      return;
    }
    setReceived(true);
    setNotice(result.message || "Your request reached NorthstarLabs.");
  }

  if (received) {
    return <div className="learning-request-success" role="status">
      <span aria-hidden="true">✓</span>
      <div>
        <h3>We have your request.</h3>
        <p>{notice}</p>
        <div><Link href="/courses">Explore courses</Link><Link href="/tutors">Search coaches</Link></div>
      </div>
    </div>;
  }

  return <form className={`learning-request-form ${compact ? "compact" : ""}`} onSubmit={submit}>
    <div className="learning-request-row">
      <label>
        What should we find?
        <select value={requestType} onChange={(event) => setRequestType(event.target.value as typeof requestType)}>
          <option value="either">The best course or coach</option>
          <option value="course">A course or learning programme</option>
          <option value="coach">A coach or subject expert</option>
        </select>
      </label>
      <label>
        Topic or goal
        <input required minLength={2} maxLength={160} value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. Bitcoin for beginners, leadership, exam preparation" />
      </label>
    </div>
    <label>
      Tell us what a good result would look like
      <textarea required minLength={20} maxLength={3000} value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Include your current level, what you want to achieve, preferred format, timing, budget, or anything else that would help us find a strong match." />
      <small>{detail.length}/3000 · A little context helps us avoid sending you something irrelevant.</small>
    </label>
    <div className="learning-request-row">
      <label>
        Your name
        <input required minLength={2} maxLength={100} autoComplete="name" value={requesterName} onChange={(event) => setRequesterName(event.target.value)} />
      </label>
      <label>
        Email for our reply
        <input required type="email" maxLength={200} autoComplete="email" value={requesterEmail} onChange={(event) => setRequesterEmail(event.target.value)} />
      </label>
    </div>
    <label className="learning-request-honeypot" aria-hidden="true">
      Company website
      <input tabIndex={-1} autoComplete="off" value={companyWebsite} onChange={(event) => setCompanyWebsite(event.target.value)} />
    </label>
    {notice && <p className="learning-request-notice" role="alert">{notice}</p>}
    <div className="learning-request-submit">
      <button className="button" disabled={sending}>{sending ? "Sending request..." : "Ask Northstar to help →"}</button>
      <small>We will use these details only to respond to your request. See our <Link href="/legal/privacy">privacy policy</Link>.</small>
    </div>
  </form>;
}
