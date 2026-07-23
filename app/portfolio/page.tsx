"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-client";

type SourceItem = {
  sourceId: string;
  title: string;
  courseTitle: string;
  issuerName: string;
  achievedAt: number;
  visible: number;
  status?: string;
  expiresAt?: number | null;
  valid?: number;
  lessonTitle?: string;
  bestScore?: number;
  showScore?: number;
};

type Evidence = {
  id: string;
  evidenceType: string;
  title: string;
  description: string;
  skills: string;
  evidenceUrl: string | null;
  achievedAt: number | null;
  visible: number;
};

type PortfolioData = {
  portfolio: {
    slug: string;
    headline: string;
    bio: string;
    visibility: string;
    updatedAt: number;
  };
  sharePath: string;
  certificates: SourceItem[];
  assessments: SourceItem[];
  evidence: Evidence[];
};

const blankEvidence = {
  evidenceType: "project",
  title: "",
  description: "",
  skills: "",
  evidenceUrl: "",
  achievedAt: "",
};

export default function PortfolioStudio() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [newEvidence, setNewEvidence] = useState(blankEvidence);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const supabase = getSupabaseBrowser();

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) {
        window.location.assign("/login?next=/portfolio");
        return;
      }
      const response = await fetch("/api/portfolio", {
        headers: { authorization: `Bearer ${session.access_token}` },
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || "We could not prepare your portfolio.");
        return;
      }
      setData(result);
      setHeadline(result.portfolio.headline);
      setBio(result.portfolio.bio);
    })();
  }, [supabase]);

  async function request(method: string, body: Record<string, unknown>) {
    if (!supabase) return null;
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) {
      window.location.assign("/login?next=/portfolio");
      return null;
    }
    const response = await fetch("/api/portfolio", {
      method,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "We could not save that change.");
    setData(result);
    if (result.portfolio) {
      setHeadline(result.portfolio.headline);
      setBio(result.portfolio.bio);
    }
    return result;
  }

  async function saveProfile(visibility = data?.portfolio.visibility || "draft") {
    setBusy("profile");
    setMessage("");
    try {
      await request("PATCH", { action: "profile", headline, bio, visibility });
      setMessage(visibility === "published" ? "Your portfolio is live and ready to share." : "Portfolio details saved privately.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not save your portfolio.");
    } finally {
      setBusy("");
    }
  }

  async function toggleSource(sourceType: "certificate" | "assessment", item: SourceItem, visible: boolean, showScore = Boolean(item.showScore)) {
    setBusy(`${sourceType}:${item.sourceId}`);
    setMessage("");
    try {
      await request("PATCH", {
        action: "source",
        sourceType,
        sourceId: item.sourceId,
        visible,
        showScore,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not update that evidence.");
    } finally {
      setBusy("");
    }
  }

  async function addEvidence(event: FormEvent) {
    event.preventDefault();
    setBusy("new");
    setMessage("");
    try {
      await request("POST", {
        ...newEvidence,
        achievedAt: newEvidence.achievedAt ? new Date(newEvidence.achievedAt).getTime() : null,
      });
      setNewEvidence(blankEvidence);
      setMessage("Evidence added privately. Review it below before making it visible.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not add that evidence.");
    } finally {
      setBusy("");
    }
  }

  const selectedCount = useMemo(() => data
    ? data.certificates.filter((item) => item.visible && item.valid).length +
      data.assessments.filter((item) => item.visible).length +
      data.evidence.filter((item) => item.visible).length
    : 0, [data]);
  const live = data?.portfolio.visibility === "published";
  const shareUrl = typeof location === "undefined" || !data ? "" : `${location.origin}${data.sharePath}`;

  async function signOut() {
    await supabase?.auth.signOut();
    location.href = "/";
  }

  return <main className="portfolio-studio">
    <header className="portfolio-topbar">
      <Link className="system-brand" href="/">* NORTHSTARLABS</Link>
      <nav><Link href="/learn">My learning</Link><Link href="/account">Account settings</Link><button onClick={signOut}>Sign out</button></nav>
    </header>

    <section className="portfolio-studio-hero">
      <div>
        <p className="sys-kicker">PROOF-OF-LEARNING PORTFOLIO</p>
        <h1>Your learning should be visible.</h1>
        <p>Select verified Northstar evidence, add practical work, and share one clear page that proves more than course attendance.</p>
      </div>
      <aside>
        <span className={live ? "live" : "draft"}>{live ? "PUBLIC" : "PRIVATE DRAFT"}</span>
        <b>{selectedCount}</b>
        <small>{selectedCount === 1 ? "visible proof item" : "visible proof items"}</small>
      </aside>
    </section>

    {!data ? <section className="portfolio-loading"><span /><p>{message || "Collecting your verified learning evidence…"}</p></section> : <>
      <section className="portfolio-publish-bar">
        <div>
          <b>{live ? "Your portfolio is public." : "Only you can see this draft."}</b>
          <span>{live ? shareUrl : "Choose your evidence, then publish when it represents you well."}</span>
        </div>
        <div>
          {live && <Link href={data.sharePath}>View public page</Link>}
          {live && <button type="button" onClick={() => navigator.clipboard.writeText(shareUrl).then(() => setMessage("Share link copied."))}>Copy share link</button>}
          <button className="sys-primary" disabled={busy !== "" || selectedCount < 1} type="button" onClick={() => saveProfile(live ? "draft" : "published")}>
            {live ? "Make private" : "Publish portfolio →"}
          </button>
        </div>
      </section>

      <div className="portfolio-studio-grid">
        <section className="portfolio-main-column">
          <article className="portfolio-editor-card">
            <header><span>01</span><div><p className="sys-kicker">YOUR STORY</p><h2>Say what the evidence adds up to.</h2></div></header>
            <label>Portfolio headline<input maxLength={120} value={headline} onChange={(event) => setHeadline(event.target.value)} /></label>
            <label>Short professional introduction<textarea maxLength={700} value={bio} onChange={(event) => setBio(event.target.value)} placeholder="What are you learning, building, or becoming able to do?" /></label>
            <button className="portfolio-save" disabled={busy !== ""} type="button" onClick={() => saveProfile()}>Save introduction</button>
          </article>

          <article className="portfolio-editor-card">
            <header><span>02</span><div><p className="sys-kicker">VERIFIED EVIDENCE</p><h2>Choose what Northstar can prove.</h2><p>Nothing is shared by default. Certificate status and assessment completion are checked from platform records.</p></div></header>
            <div className="portfolio-source-list">
              {data.certificates.map((item) => <label className="portfolio-source" key={item.sourceId}>
                <input type="checkbox" checked={Boolean(item.visible && item.valid)} disabled={busy !== "" || !item.valid} onChange={(event) => toggleSource("certificate", item, event.target.checked)} />
                <span className="portfolio-source-icon">✓</span>
                <div><small>VERIFIED CERTIFICATE - {item.issuerName}</small><b>{item.title}</b><p>{item.courseTitle}</p><em>{new Date(item.achievedAt).toLocaleDateString("en-ZA")}{!item.valid ? " - not currently valid" : ""}</em></div>
                <strong>{item.visible && item.valid ? "VISIBLE" : item.valid ? "PRIVATE" : "UNAVAILABLE"}</strong>
              </label>)}
              {data.assessments.map((item) => <div className="portfolio-source assessment" key={item.sourceId}>
                <input aria-label={`Show ${item.title}`} type="checkbox" checked={Boolean(item.visible)} disabled={busy !== ""} onChange={(event) => toggleSource("assessment", item, event.target.checked)} />
                <span className="portfolio-source-icon">%</span>
                <div><small>RECORDED ASSESSMENT - {item.issuerName}</small><b>{item.title}</b><p>{item.courseTitle} - {item.lessonTitle}</p><em>Passed - best recorded result {item.bestScore}%</em></div>
                <label className="score-choice"><input type="checkbox" checked={Boolean(item.showScore)} disabled={!item.visible || busy !== ""} onChange={(event) => toggleSource("assessment", item, true, event.target.checked)} /> Show score</label>
              </div>)}
              {!data.certificates.length && !data.assessments.length && <div className="portfolio-empty-source"><b>Your verified evidence will appear automatically.</b><p>Complete a course certificate or pass an assessment; then return here and choose whether to share it.</p><Link href="/learn">Continue learning →</Link></div>}
            </div>
          </article>

          <article className="portfolio-editor-card">
            <header><span>03</span><div><p className="sys-kicker">PRACTICAL PROOF</p><h2>Add work that shows what you can do.</h2><p>Projects and links are clearly labelled learner-submitted. We never imply academy verification where it does not exist.</p></div></header>
            <form className="portfolio-evidence-form" onSubmit={addEvidence}>
              <label>Evidence type<select value={newEvidence.evidenceType} onChange={(event) => setNewEvidence({ ...newEvidence, evidenceType: event.target.value })}><option value="project">Project</option><option value="challenge">Practical challenge</option><option value="skill">Skill demonstration</option><option value="feedback">Instructor feedback</option></select></label>
              <label>Title<input required minLength={3} maxLength={120} value={newEvidence.title} onChange={(event) => setNewEvidence({ ...newEvidence, title: event.target.value })} placeholder="e.g. Bitcoin board briefing" /></label>
              <label className="wide">What does this prove?<textarea maxLength={1200} value={newEvidence.description} onChange={(event) => setNewEvidence({ ...newEvidence, description: event.target.value })} placeholder="Describe the work, your decisions, and the outcome." /></label>
              <label>Skills demonstrated<input maxLength={300} value={newEvidence.skills} onChange={(event) => setNewEvidence({ ...newEvidence, skills: event.target.value })} placeholder="Research, analysis, communication" /></label>
              <label>Evidence link<input type="url" value={newEvidence.evidenceUrl} onChange={(event) => setNewEvidence({ ...newEvidence, evidenceUrl: event.target.value })} placeholder="https://…" /></label>
              <label>Date achieved<input type="date" value={newEvidence.achievedAt} onChange={(event) => setNewEvidence({ ...newEvidence, achievedAt: event.target.value })} /></label>
              <button className="sys-primary" disabled={busy !== ""} type="submit">{busy === "new" ? "Adding…" : "Add private draft →"}</button>
            </form>
          </article>

          {data.evidence.length > 0 && <article className="portfolio-editor-card">
            <header><span>04</span><div><p className="sys-kicker">YOUR ADDED EVIDENCE</p><h2>Review every claim before sharing.</h2></div></header>
            <div className="portfolio-custom-list">
              {data.evidence.map((item) => <EvidenceEditor key={item.id} item={item} busy={busy} onBusy={setBusy} onMessage={setMessage} request={request} />)}
            </div>
          </article>}
        </section>

        <aside className="portfolio-guidance">
          <p className="sys-kicker">WHAT VIEWERS CAN TRUST</p>
          <h2>Three honest proof levels.</h2>
          <dl>
            <div><dt>01 - Verified</dt><dd>Certificate identity and status are checked against the issuing academy&apos;s live record.</dd></div>
            <div><dt>02 - Recorded</dt><dd>Assessment completion comes from Northstar&apos;s saved attempts. You decide whether to reveal the score.</dd></div>
            <div><dt>03 - Submitted</dt><dd>Your projects and links remain visibly learner-submitted until an academy verification workflow is added.</dd></div>
          </dl>
          <p>Your email, private notes, answer choices and incomplete work are never shown.</p>
        </aside>
      </div>
    </>}
    {message && <div className="portfolio-message" role="status">{message}</div>}
  </main>;
}

function EvidenceEditor({ item, busy, onBusy, onMessage, request }: {
  item: Evidence;
  busy: string;
  onBusy: (value: string) => void;
  onMessage: (value: string) => void;
  request: (method: string, body: Record<string, unknown>) => Promise<unknown>;
}) {
  const [draft, setDraft] = useState({
    ...item,
    evidenceUrl: item.evidenceUrl || "",
    achievedAt: item.achievedAt ? new Date(item.achievedAt).toISOString().slice(0, 10) : "",
  });

  async function save(visible = Boolean(item.visible)) {
    onBusy(item.id);
    onMessage("");
    try {
      await request("PATCH", {
        action: "evidence",
        ...draft,
        visible,
        achievedAt: draft.achievedAt ? new Date(draft.achievedAt).getTime() : null,
      });
      onMessage(visible ? "Evidence saved and visible on your public portfolio." : "Evidence saved privately.");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "We could not save that evidence.");
    } finally {
      onBusy("");
    }
  }

  async function remove() {
    onBusy(item.id);
    onMessage("");
    try {
      await request("DELETE", { id: item.id });
      onMessage("Evidence removed.");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "We could not remove that evidence.");
    } finally {
      onBusy("");
    }
  }

  return <section className="portfolio-custom-editor">
    <div className="portfolio-custom-status"><span>{item.evidenceType.replaceAll("_", " ")}</span><b>{item.visible ? "VISIBLE" : "PRIVATE"}</b></div>
    <label>Title<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
    <label>Description<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
    <div><label>Skills<input value={draft.skills} onChange={(event) => setDraft({ ...draft, skills: event.target.value })} /></label><label>Evidence link<input type="url" value={draft.evidenceUrl} onChange={(event) => setDraft({ ...draft, evidenceUrl: event.target.value })} /></label></div>
    <footer><button type="button" disabled={busy !== ""} onClick={() => save()}>Save</button><button type="button" disabled={busy !== ""} onClick={() => save(!item.visible)}>{item.visible ? "Make private" : "Add to public portfolio"}</button><button type="button" disabled={busy !== ""} onClick={remove}>Remove</button></footer>
  </section>;
}
