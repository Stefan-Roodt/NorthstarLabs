"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { PublicDemandTopic } from "../../lib/demand-board";

const categories = [
  ["", "All topics"], ["business", "Business"], ["technology", "Technology"],
  ["finance", "Finance"], ["career", "Career"], ["education", "Education"],
  ["personal-growth", "Personal growth"], ["other", "Other"],
];
const statusCopy: Record<string, { label: string; detail: string }> = {
  open: { label: "Open for support", detail: "Northstar is measuring demand and fit." },
  planned: { label: "Planned", detail: "The topic has earned a place on the roadmap." },
  building: { label: "In production", detail: "A course, coach match, or live format is being prepared." },
  released: { label: "Available", detail: "A credible learning option is ready." },
  declined: { label: "Not proceeding", detail: "Northstar has explained why it will not move forward." },
};

export function DemandBoard({ initialTopics }: { initialTopics: PublicDemandTopic[] }) {
  const searchParams = useSearchParams();
  const manageToken = searchParams.get("manage") || "";
  const [topics, setTopics] = useState(initialTopics);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("popular");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [followTopic, setFollowTopic] = useState<PublicDemandTopic | null>(null);
  const [followName, setFollowName] = useState("");
  const [followEmail, setFollowEmail] = useState("");
  const [managedFollow, setManagedFollow] = useState<{ id: string; topicId: string; title: string; status: string } | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submission, setSubmission] = useState({ requesterName: "", requesterEmail: "", title: "", summary: "", category: "business", preferredFormat: "either", companyWebsite: "" });

  const load = useCallback(async () => {
    const params = new URLSearchParams({ sort });
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    if (query.trim()) params.set("query", query.trim());
    if (manageToken) params.set("manage", manageToken);
    const response = await fetch(`/api/demand?${params}`);
    const result = await response.json() as { topics?: PublicDemandTopic[]; managedFollow?: typeof managedFollow; error?: string };
    if (response.ok) { setTopics(result.topics || []); setManagedFollow(result.managedFollow || null); }
    else setMessage(result.error || "The board could not be refreshed.");
  }, [category, manageToken, query, sort, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 180);
    return () => window.clearTimeout(timer);
  }, [load]);

  const metrics = useMemo(() => ({
    published: topics.length,
    moving: topics.filter((topic) => ["planned", "building"].includes(topic.status)).length,
    released: topics.filter((topic) => topic.status === "released").length,
    support: topics.reduce((sum, topic) => sum + topic.supporters, 0),
  }), [topics]);

  async function vote(topic: PublicDemandTopic, value: number) {
    setBusy(`vote-${topic.id}`); setMessage("");
    const nextValue = topic.viewerVote === value ? 0 : value;
    const response = await fetch("/api/demand", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "vote", topicId: topic.id, value: nextValue }) });
    const result = await response.json() as { topic?: PublicDemandTopic; error?: string };
    if (response.ok && result.topic) setTopics((current) => current.map((item) => item.id === topic.id ? result.topic! : item));
    else setMessage(result.error || "Your vote could not be saved.");
    setBusy("");
  }

  async function follow(event: FormEvent) {
    event.preventDefault();
    if (!followTopic) return;
    setBusy(`follow-${followTopic.id}`); setMessage("");
    const response = await fetch("/api/demand", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "follow", topicId: followTopic.id, email: followEmail, name: followName }) });
    const result = await response.json() as { message?: string; error?: string };
    if (response.ok) { setMessage(result.message || "You are following this topic."); setFollowTopic(null); setFollowEmail(""); setFollowName(""); await load(); }
    else setMessage(result.error || "Updates could not be enabled.");
    setBusy("");
  }

  async function unfollow() {
    setBusy("unfollow");
    const response = await fetch("/api/demand", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "unfollow", token: manageToken }) });
    const result = await response.json() as { error?: string };
    if (response.ok) { setMessage("Email updates stopped. Your public votes are unchanged."); setManagedFollow((current) => current ? { ...current, status: "unsubscribed" } : null); }
    else setMessage(result.error || "Updates could not be stopped.");
    setBusy("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy("submit"); setMessage("");
    const response = await fetch("/api/demand", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "submit", ...submission }) });
    const result = await response.json() as { message?: string; error?: string; existingTopicId?: string | null };
    if (response.ok) {
      setMessage(result.message || "Your idea is awaiting moderation.");
      setShowSubmit(false);
      setSubmission({ requesterName: "", requesterEmail: "", title: "", summary: "", category: "business", preferredFormat: "either", companyWebsite: "" });
      if (result.existingTopicId) document.getElementById(`demand-${result.existingTopicId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else setMessage(result.error || "Your request could not be submitted.");
    setBusy("");
  }

  return <main className="demand-page">
    <header className="demand-nav"><Link className="brand" href="/"><span className="brand-mark">*</span><span className="brand-wordmark">NORTHSTARLABS</span></Link><nav><Link href="/courses">Courses</Link><Link href="/tutors">Coaches</Link><Link href="/find">Find my path</Link><Link className="demand-nav-action" href="/login?mode=signup">Join free</Link></nav></header>

    <section className="demand-hero">
      <div><p className="sys-kicker">PUBLIC LEARNING DEMAND</p><h1>Help decide what Northstar builds next.</h1><p>Request the learning you cannot find, support useful ideas, and see whether each topic is being considered, planned, built, or released.</p><div><button className="sys-primary" onClick={() => setShowSubmit(true)}>Request a topic →</button><a href="#board">See the live board</a></div></div>
      <aside><span>THE RULE</span><strong>Real signals.<br/>No fake votes.</strong><p>Contact details and full request context stay private. Public topics appear only after moderation.</p></aside>
    </section>

    <section className="demand-metrics" aria-label="Demand Board summary"><div><strong>{metrics.published}</strong><span>public topics</span></div><div><strong>{metrics.support}</strong><span>positive votes</span></div><div><strong>{metrics.moving}</strong><span>on the roadmap</span></div><div><strong>{metrics.released}</strong><span>released</span></div></section>

    {managedFollow && <section className="demand-manage"><div><b>Email updates for &ldquo;{managedFollow.title}&rdquo;</b><span>{managedFollow.status === "active" ? "You will hear when its roadmap status changes." : "Updates are currently stopped."}</span></div>{managedFollow.status === "active" && <button disabled={busy === "unfollow"} onClick={() => void unfollow()}>{busy === "unfollow" ? "Stopping…" : "Stop email updates"}</button>}</section>}
    {message && <div className="demand-message" role="status">{message}</div>}

    {showSubmit && <section className="demand-submit" aria-labelledby="demand-submit-title">
      <div><button onClick={() => setShowSubmit(false)}>Close</button><p className="sys-kicker">ADD A CLEAR SIGNAL</p><h2 id="demand-submit-title">What should people be able to learn here?</h2><p>Write the public idea, not confidential personal information. Northstar reviews every submission before it appears.</p><ul><li>Your name and email stay private</li><li>Matching requests are combined</li><li>Publication is not a promise to build</li></ul></div>
      <form onSubmit={submit}>
        <label>Topic title<input required minLength={5} maxLength={120} value={submission.title} onChange={(event) => setSubmission((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. Bitcoin custody for a company board" /></label>
        <label>What should the learner be able to do?<textarea required minLength={40} maxLength={1_200} value={submission.summary} onChange={(event) => setSubmission((current) => ({ ...current, summary: event.target.value }))} placeholder="Describe the audience, problem, desired outcome, and what current options fail to provide." /><small>{submission.summary.length}/1,200</small></label>
        <div><label>Category<select value={submission.category} onChange={(event) => setSubmission((current) => ({ ...current, category: event.target.value }))}>{categories.slice(1).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Best format<select value={submission.preferredFormat} onChange={(event) => setSubmission((current) => ({ ...current, preferredFormat: event.target.value }))}><option value="either">Let Northstar decide</option><option value="course">Self-paced course</option><option value="coach">Personal coach</option><option value="live">Live group learning</option></select></label></div>
        <div><label>Your name<input required minLength={2} maxLength={100} autoComplete="name" value={submission.requesterName} onChange={(event) => setSubmission((current) => ({ ...current, requesterName: event.target.value }))} /></label><label>Email for a private reply<input required type="email" maxLength={200} autoComplete="email" value={submission.requesterEmail} onChange={(event) => setSubmission((current) => ({ ...current, requesterEmail: event.target.value }))} /></label></div>
        <label className="demand-honeypot">Company website<input tabIndex={-1} autoComplete="off" value={submission.companyWebsite} onChange={(event) => setSubmission((current) => ({ ...current, companyWebsite: event.target.value }))} /></label>
        <button className="sys-primary" disabled={busy === "submit"}>{busy === "submit" ? "Submitting…" : "Submit for review →"}</button>
        <small>By submitting, you agree that the topic and summary may be published. Your contact details will not be shown.</small>
      </form>
    </section>}

    <section className="demand-board" id="board">
      <header><div><p className="sys-kicker">THE LIVE BOARD</p><h2>Demand people can see-and Northstar can act on.</h2></div><p>A vote is a signal, not a purchase or guarantee. Northstar also checks evidence quality, available expertise, safety, and whether the topic fits the platform.</p></header>
      <div className="demand-controls"><label>Search<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a topic" /></label><label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Every status</option>{Object.entries(statusCopy).map(([value, copy]) => <option value={value} key={value}>{copy.label}</option>)}</select></label><label>Order<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="popular">Most supported</option><option value="roadmap">Roadmap progress</option><option value="new">Newest</option></select></label></div>
      <div className="demand-list">
        {topics.length === 0 && <div className="demand-empty"><b>No public topic matches those filters.</b><p>Clear a filter or submit the learning need you expected to find.</p><button onClick={() => setShowSubmit(true)}>Request it →</button></div>}
        {topics.map((topic, index) => <article id={`demand-${topic.id}`} className={`demand-card status-${topic.status}`} key={topic.id}>
          <div className="demand-rank"><span>{String(index + 1).padStart(2, "0")}</span><div><button aria-label={`Support ${topic.title}`} aria-pressed={topic.viewerVote === 1} disabled={busy === `vote-${topic.id}`} onClick={() => void vote(topic, 1)}>^</button><strong>{topic.score}</strong><button aria-label={`Do not support ${topic.title}`} aria-pressed={topic.viewerVote === -1} disabled={busy === `vote-${topic.id}`} onClick={() => void vote(topic, -1)}>v</button></div></div>
          <div className="demand-topic"><header><span>{topic.category.replaceAll("-", " ")}</span><span>{topic.preferredFormat === "either" ? "Best format to be decided" : topic.preferredFormat}</span></header><h3>{topic.title}</h3><p>{topic.summary}</p>{topic.publicNote && <blockquote><b>Northstar update</b><p>{topic.publicNote}</p></blockquote>}<footer><span>{topic.supporters} supporting - {topic.followers} following</span><button onClick={() => setFollowTopic(topic)}>Follow updates</button>{topic.status === "released" && topic.matchedUrl && <a href={topic.matchedUrl}>Open what was released →</a>}</footer></div>
          <aside><span className={`demand-status ${topic.status}`}>{statusCopy[topic.status]?.label || topic.status}</span><p>{statusCopy[topic.status]?.detail}</p><time>Updated {new Date(topic.updatedAt).toLocaleDateString("en-ZA", { dateStyle: "medium" })}</time></aside>
        </article>)}
      </div>
    </section>

    {followTopic && <div className="demand-follow-backdrop" onMouseDown={() => setFollowTopic(null)}><form className="demand-follow" onSubmit={follow} onMouseDown={(event) => event.stopPropagation()}><button type="button" onClick={() => setFollowTopic(null)}>Close</button><p className="sys-kicker">FOLLOW THE ROADMAP</p><h2>{followTopic.title}</h2><p>Northstar will email only when this topic changes status or becomes available.</p><label>Name (optional)<input maxLength={100} value={followName} onChange={(event) => setFollowName(event.target.value)} /></label><label>Email<input required type="email" maxLength={200} value={followEmail} onChange={(event) => setFollowEmail(event.target.value)} /></label><button className="sys-primary" disabled={busy === `follow-${followTopic.id}`}>{busy === `follow-${followTopic.id}` ? "Saving…" : "Follow this topic"}</button><small>Every update email includes a link to stop messages.</small></form></div>}

    <footer className="demand-footer"><div><b>* NORTHSTARLABS</b><span>Learn. Ask. Progress.</span></div><p>The Demand Board informs decisions. It does not create a contractual promise, investment, presale, or guaranteed release.</p><nav><Link href="/">Home</Link><Link href="/courses">Courses</Link><Link href="/tutors">Coaches</Link><Link href="/legal/privacy">Privacy</Link></nav></footer>
  </main>;
}

