"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

type Source = {
  title: string;
  sourceType: "notes" | "website" | "document" | "recording";
  sourceUrl: string;
  sourceText: string;
  rightsBasis: "owned" | "licensed" | "public_domain" | "permission";
  citationLabel?: string;
};
type Question = { prompt: string; options: string[]; correctIndex: number; explanation?: string };
type Lesson = {
  title: string; lessonType: string; durationMinutes: number; outcome: string;
  content: string; transcript: string; citations: string[]; questions: Question[];
};
type Blueprint = {
  title: string; promise: string; audience: string; sourceNote: string;
  sections: Array<{ title: string; lessons: Lesson[] }>;
};
type Project = {
  id: string; courseId: string | null; title: string; audience: string; outcome: string;
  lessonMinutes: number; status: string; model: string; sources: Source[]; blueprint: Blueprint | null;
};
type Capabilities = { blueprint: boolean; quizzes: boolean; narration: boolean; videoClips: boolean; provider: string };

const blankSource = (): Source => ({
  title: "", sourceType: "notes", sourceUrl: "", sourceText: "", rightsBasis: "owned",
});

export default function CreatorStudioPage() {
  const supabase = getSupabaseBrowser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("");
  const [outcome, setOutcome] = useState("");
  const [lessonMinutes, setLessonMinutes] = useState(6);
  const [sources, setSources] = useState<Source[]>([blankSource()]);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [aiDisclosure, setAiDisclosure] = useState(true);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [message, setMessage] = useState("Loading Creator Studio…");
  const [busy, setBusy] = useState("");

  const token = useCallback(async () =>
    (await supabase?.auth.getSession())?.data.session?.access_token || "", [supabase]);

  useEffect(() => {
    let active = true;
    async function load() {
      const accessToken = await token();
      if (!accessToken) { location.href = "/login?next=/dashboard/studio"; return; }
      const response = await fetch("/api/creator-studio", { headers: { authorization: `Bearer ${accessToken}` } });
      if (!active) return;
      if (!response.ok) { setMessage("Creator Studio could not be loaded."); return; }
      const result = await response.json() as { projects: Project[]; capabilities: Capabilities };
      setProjects(result.projects);
      setCapabilities(result.capabilities);
      setSelectedId(result.projects[0]?.id || "");
      setMessage("");
    }
    void load();
    return () => { active = false; };
  }, [token]);
  const selected = useMemo(() => projects.find((project) => project.id === selectedId) || null, [projects, selectedId]);
  const sourcesReady = sources.length > 0 &&
    sources.every((source) => source.title.trim() && source.sourceText.trim());
  const buildReadiness = [
    Boolean(title.trim()),
    Boolean(audience.trim()),
    Boolean(outcome.trim()),
    sourcesReady,
    rightsConfirmed,
    aiDisclosure,
  ].filter(Boolean).length;

  async function post(body: object) {
    const response = await fetch("/api/creator-studio", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${await token()}` },
      body: JSON.stringify(body),
    });
    const result = await response.json() as { error?: string; project?: Project; courseId?: string };
    if (!response.ok) throw new Error(result.error || "Creator Studio could not complete that action.");
    return result;
  }

  async function createProject(event: FormEvent) {
    event.preventDefault(); setBusy("create"); setMessage("");
    let sourcePackSaved = false;
    try {
      const result = await post({
        action: "create", title, audience, outcome, lessonMinutes, sources, rightsConfirmed, aiDisclosure,
      });
      if (result.project) {
        sourcePackSaved = true;
        const savedProject = result.project;
        setProjects((current) => [savedProject!, ...current]);
        setSelectedId(savedProject.id);
        setTitle(""); setAudience(""); setOutcome(""); setSources([blankSource()]);
        setRightsConfirmed(false); setReviewConfirmed(false);
        setMessage("Sources saved. Northstar is building the structured draft now…");
        const generated = await post({ action: "generate", projectId: savedProject.id });
        if (generated.project) {
          setProjects((current) => current.map((project) =>
            project.id === generated.project!.id ? generated.project! : project
          ));
          setMessage("Draft built automatically. Review the structure, claims, citations and checks before exporting.");
        }
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Automatic drafting could not finish.";
      setMessage(sourcePackSaved
        ? `Your source pack is safe. Automatic drafting needs attention: ${detail}`
        : detail);
    }
    setBusy("");
  }

  async function generate() {
    if (!selected) return; setBusy("generate"); setMessage("Generating a source-grounded course draft…");
    try {
      const result = await post({ action: "generate", projectId: selected.id });
      if (result.project) setProjects((current) => current.map((project) => project.id === result.project!.id ? result.project! : project));
      setReviewConfirmed(false); setMessage("Draft generated. Review every lesson and citation before exporting it.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Generation failed."); }
    setBusy("");
  }

  async function exportCourse() {
    if (!selected) return; setBusy("export"); setMessage("Creating an unpublished course draft…");
    try {
      const result = await post({ action: "export", projectId: selected.id, reviewConfirmed });
      if (result.courseId) location.href = `/dashboard/courses/${result.courseId}`;
    } catch (error) { setMessage(error instanceof Error ? error.message : "Export failed."); setBusy(""); }
  }

  function updateSource(index: number, patch: Partial<Source>) {
    setSources((current) => current.map((source, sourceIndex) => sourceIndex === index ? { ...source, ...patch } : source));
  }

  function openCapability(available: boolean, capability: string) {
    if (!available) {
      location.href = "/dashboard/integrations?setup=creator-studio#creator-studio-providers";
      return;
    }
    document.getElementById("studio-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMessage(`${capability} is ready. Start a new governed project or open an existing one below.`);
  }

  const lessonCount = selected?.blueprint?.sections.reduce((sum, section) => sum + section.lessons.length, 0) || 0;
  const productionCount = selected?.blueprint?.sections.reduce(
    (sum, section) => sum + section.lessons.filter((lesson) => ["audio", "video"].includes(lesson.lessonType)).length, 0,
  ) || 0;

  return <main className="studio-shell">
    <header className="studio-topbar">
      <Link href="/dashboard">← Creator workspace</Link>
      <Link className="system-brand" href="/">✦ NORTHSTARLABS</Link>
      <span>{capabilities?.provider || "Checking provider…"}</span>
    </header>

    <section className="studio-hero">
      <div><p className="sys-kicker">NORTHSTAR CREATOR STUDIO</p><h1>Bring the expertise. Leave with a course draft.</h1></div>
      <p>Add the outcome and material you are allowed to use. Northstar builds the structure, lessons and checks automatically—then keeps a human in control.</p>
    </section>

    <section className="studio-capabilities" aria-label="Creator Studio capabilities">
      <div className="ready"><button type="button" onClick={() => openCapability(true, "Grounded course drafting")}><b>01</b><span>Course structure</span><small>Built in and ready</small><em>Start building →</em></button></div>
      <div className="ready"><button type="button" onClick={() => openCapability(true, "Quizzes and checks")}><b>02</b><span>Checks with feedback</span><small>Built in and ready</small><em>Start building →</em></button></div>
      <div className={capabilities?.narration ? "ready" : "planned"}><button type="button" onClick={() => openCapability(Boolean(capabilities?.narration), "AI narration")}><b>03</b><span>AI narration</span><small>{capabilities?.narration ? "Connected upgrade" : "Optional upgrade"}</small><em>{capabilities?.narration ? "Open workspace →" : "Connect when needed →"}</em></button></div>
      <div className={capabilities?.videoClips ? "ready" : "planned"}><button type="button" onClick={() => openCapability(Boolean(capabilities?.videoClips), "Cinematic clips")}><b>04</b><span>Cinematic clips</span><small>{capabilities?.videoClips ? "Connected upgrade" : "Optional upgrade"}</small><em>{capabilities?.videoClips ? "Open workspace →" : "Connect when needed →"}</em></button></div>
    </section>

    <section className="studio-automation-flow" aria-label="Automated course-building workflow">
      <header><p className="sys-kicker">ONE GUIDED RUN</p><h2>From source pack to editable course—without the blank-page problem.</h2></header>
      <ol>
        <li><b>1</b><div><strong>Define the result</strong><span>Tell Northstar who the course serves and what learners must be able to do.</span></div></li>
        <li><b>2</b><div><strong>Add approved material</strong><span>Paste your notes or licensed text. The native builder keeps it inside Northstar.</span></div></li>
        <li><b>3</b><div><strong>Review the build</strong><span>Northstar creates sections, lessons, activities and checks, then exports only after your approval.</span></div></li>
      </ol>
    </section>

    <div className="studio-grid">
      <aside className="studio-projects">
        <p className="sys-kicker">PROJECTS</p>
        <button className={`studio-new-button ${selectedId ? "" : "active"}`} onClick={() => { setSelectedId(""); setReviewConfirmed(false); }}><b>+ New governed project</b><span>Start with approved sources</span></button>
        {projects.length ? projects.map((project) => <button key={project.id} className={selectedId === project.id ? "active" : ""} onClick={() => { setSelectedId(project.id); setReviewConfirmed(false); }}>
          <b>{project.title}</b><span>{project.status.replace("_", " ")}</span>
        </button>) : <p className="studio-empty">Your first governed draft will appear here.</p>}
      </aside>

      <section className="studio-workspace" id="studio-workspace">
        {selected ? <>
          <header className="studio-project-head"><div><p className="sys-kicker">{selected.status.toUpperCase()}</p><h2>{selected.title}</h2><p>{selected.outcome}</p></div><div><b>{selected.sources.length}</b><span>approved sources</span></div></header>
          {!selected.blueprint ? <div className="studio-generate-card">
            <div><b>Rights recorded</b><span>Every source carries an explicit usage basis.</span></div>
            <div><b>Grounding enforced</b><span>The drafting prompt may use only the supplied source text.</span></div>
            <div><b>Human gate active</b><span>Generated material stays in review and exports only as a draft.</span></div>
            <button className="sys-primary" disabled={busy === "generate"} onClick={generate}>{busy === "generate" ? "Building your draft…" : "Build grounded draft →"}</button>
          </div> : <>
            <div className="studio-blueprint-summary"><div><b>{selected.blueprint.sections.length}</b><span>sections</span></div><div><b>{lessonCount}</b><span>lessons</span></div><div><b>{productionCount}</b><span>need media production</span></div><p>{selected.blueprint.sourceNote}</p></div>
            <div className="studio-blueprint">
              {selected.blueprint.sections.map((section, sectionIndex) => <article key={`${section.title}-${sectionIndex}`}>
                <header><span>{String(sectionIndex + 1).padStart(2, "0")}</span><h3>{section.title}</h3></header>
                {section.lessons.map((lesson, lessonIndex) => <div key={`${lesson.title}-${lessonIndex}`}>
                  <b>{lesson.title}</b><small>{lesson.lessonType} · {lesson.durationMinutes} min</small>
                  <p>{lesson.outcome}</p><em>{lesson.citations.join(" · ") || "Citation missing — fix before export"}</em>
                </div>)}
              </article>)}
            </div>
            <label className="studio-review-check"><input type="checkbox" checked={reviewConfirmed} onChange={(event) => setReviewConfirmed(event.target.checked)}/><span><b>I reviewed the structure, claims, citations and assessments.</b><small>The exported course remains an unpublished draft. Audio and video require separate production review.</small></span></label>
            <button className="sys-primary" disabled={!reviewConfirmed || busy === "export"} onClick={exportCourse}>{busy === "export" ? "Creating draft…" : selected.courseId ? "Already exported" : "Export to course editor →"}</button>
          </>}
        </> : <form className="studio-new-project" onSubmit={createProject}>
          <p className="sys-kicker">NEW AUTOMATED COURSE BUILD</p><h2>Give Northstar the goal and the evidence.</h2>
          <p className="studio-form-intro">One submission creates the governed source pack and builds the first structured draft automatically.</p>
          <div className="studio-form-row"><label>Working title<input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Bitcoin decisions for business leaders"/></label><label>Lesson length<select value={lessonMinutes} onChange={(event) => setLessonMinutes(Number(event.target.value))}><option value={4}>4 minutes</option><option value={6}>6 minutes</option><option value={8}>8 minutes</option><option value={10}>10 minutes</option></select></label></div>
          <label>Who is this for?<textarea required value={audience} onChange={(event) => setAudience(event.target.value)} placeholder="Describe what learners already know, their context, and the decisions they face."/></label>
          <label>What should they be able to do?<textarea required value={outcome} onChange={(event) => setOutcome(event.target.value)} placeholder="Use one observable, useful outcome—not a vague promise."/></label>
          <div className="studio-source-list"><div><p className="sys-kicker">APPROVED SOURCES</p><button type="button" onClick={() => setSources((current) => [...current, blankSource()])}>+ Add source</button></div>
            {sources.map((source, index) => <article key={index}>
              <header><b>[S{index + 1}]</b>{sources.length > 1 && <button type="button" onClick={() => setSources((current) => current.filter((_, sourceIndex) => sourceIndex !== index))}>Remove</button>}</header>
              <div className="studio-form-row"><label>Source title<input required value={source.title} onChange={(event) => updateSource(index, { title: event.target.value })}/></label><label>Rights basis<select value={source.rightsBasis} onChange={(event) => updateSource(index, { rightsBasis: event.target.value as Source["rightsBasis"] })}><option value="owned">I own it</option><option value="licensed">Licensed for this use</option><option value="permission">Written permission</option><option value="public_domain">Verified public domain</option></select></label></div>
              <label>Source URL (optional)<input type="url" value={source.sourceUrl} onChange={(event) => updateSource(index, { sourceUrl: event.target.value })} placeholder="https://…"/></label>
              <label>Source text<textarea required value={source.sourceText} onChange={(event) => updateSource(index, { sourceText: event.target.value })} placeholder="Paste the authorised source text or your original notes. URLs are recorded for citation; they are not silently scraped."/></label>
            </article>)}
          </div>
          <label className="studio-review-check"><input type="checkbox" checked={rightsConfirmed} onChange={(event) => setRightsConfirmed(event.target.checked)}/><span><b>I own, licensed, or have permission to use every source.</b><small>Educational purpose alone does not grant permission to copy protected work.</small></span></label>
          <label className="studio-review-check"><input type="checkbox" checked={aiDisclosure} onChange={(event) => setAiDisclosure(event.target.checked)}/><span><b>Record automated assistance and require human approval.</b><small>Northstar records the engine, source declaration and review gate for accountability.</small></span></label>
          <div className="studio-build-readiness">
            <div><b>{buildReadiness}/6</b><span>build requirements ready</span></div>
            <p>{buildReadiness === 6 ? "Ready. Northstar will save the sources and build the draft in one run." : "Complete the outcome, audience, source and governance details above."}</p>
          </div>
          <button className="sys-primary" disabled={busy === "create" || buildReadiness < 6}>{busy === "create" ? "Building your course…" : "Build my course draft →"}</button>
        </form>}
        {message && <div className="studio-message">{message}</div>}
      </section>
    </div>
  </main>;
}
