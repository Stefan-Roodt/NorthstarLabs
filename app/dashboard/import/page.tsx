"use client";

import Link from "next/link";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  analyseLearnerCsv,
  applyMediaManifest,
  courseFromDocumentSequence,
  emptyImportPlan,
  parseCourseOutline,
  parseCourseSource,
  runCourseLaunchAutopilot,
  summarizeImportPlan,
  type CourseLaunchAutopilotReport,
  type CourseImportPlan,
  type CourseImportSummary,
} from "../../../lib/course-import";
import {
  MAX_DOCUMENT_SEQUENCE_FILES,
  numberingConflicts,
  prepareDocumentSelection,
  sequenceIssues,
  type PreparedDocument,
} from "../../../lib/document-ingestion";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

type Provider = "teachable" | "thinkific" | "podia" | "documents" | "other";
type ImportProject = {
  id: string;
  provider: Provider;
  sourceType: string;
  sourceFilename: string;
  title: string;
  status: string;
  summary: CourseImportSummary;
  warnings: string[];
  result?: Partial<ImportResult>;
  documentUpload?: { total: number; attached: number; remaining: number };
  createdAt: number;
  updatedAt?: number;
  importedAt: number | null;
};
type ImportDocument = {
  clientId: string;
  filename: string;
  courseId: string;
  lessonId: string;
  attached: boolean;
  assetId?: string;
  attachedAt?: number;
};
type ImportResult = {
  courses: Array<{ clientId: string; id: string; title: string; originalTitle: string; editorUrl: string }>;
  documents: ImportDocument[];
  invitations: Array<{ email: string; courseId: string | null; inviteUrl: string }>;
};

const providerOptions: Array<{ id: Provider; label: string; detail: string }> = [
  { id: "teachable", label: "Teachable", detail: "Map common course, lecture and learner CSV fields." },
  { id: "thinkific", label: "Thinkific", detail: "Map courses, chapters, lessons and enrolment lists." },
  { id: "podia", label: "Podia", detail: "Bring product outlines, content rows and customer lists." },
  { id: "documents", label: "Ordered documents", detail: "Each selected document becomes the next module." },
  { id: "other", label: "CSV, JSON or outline", detail: "Use a structured export or paste a curriculum outline." },
];

function documentClientId(file: File) {
  return `document-${file.name}-${file.size}-${file.lastModified}`
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 120);
}

function sourceTypeFor(plan: CourseImportPlan, documentCount: number) {
  const kinds = [
    plan.courses.length ? "courses" : "",
    documentCount ? "documents" : "",
    plan.learners.length ? "learners" : "",
  ].filter(Boolean);
  if (kinds.length > 1) return "combined";
  if (documentCount) return "document_sequence";
  if (plan.learners.length && !plan.courses.length) return "learner_list";
  return "course_export";
}

export default function ImportStudioPage() {
  const supabase = getSupabaseBrowser();
  const [academy, setAcademy] = useState<{ id: string; name: string } | null>(null);
  const [projects, setProjects] = useState<ImportProject[]>([]);
  const [provider, setProvider] = useState<Provider>("documents");
  const [courseTitle, setCourseTitle] = useState("");
  const [outline, setOutline] = useState("");
  const [courseFile, setCourseFile] = useState<File | null>(null);
  const [learnerFile, setLearnerFile] = useState<File | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<PreparedDocument[]>([]);
  const [excludedDocumentCopies, setExcludedDocumentCopies] = useState<string[]>([]);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [sendInvitations, setSendInvitations] = useState(false);
  const [autopilotEnabled, setAutopilotEnabled] = useState(true);
  const [autopilotReport, setAutopilotReport] = useState<CourseLaunchAutopilotReport | null>(null);
  const [plan, setPlan] = useState<CourseImportPlan | null>(null);
  const [preview, setPreview] = useState<ImportProject | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [message, setMessage] = useState("Loading Migration Studio.");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [busy, setBusy] = useState("");
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);

  const token = useCallback(async () => (
    (await supabase?.auth.getSession())?.data.session?.access_token || ""
  ), [supabase]);

  const authed = useCallback(async (path: string, init?: RequestInit) => fetch(path, {
    ...init,
    headers: {
      authorization: `Bearer ${await token()}`,
      ...(init?.body && typeof init.body === "string" ? { "content-type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
  }), [token]);

  const load = useCallback(async () => {
    if (!supabase) return;
    if (!(await supabase.auth.getSession()).data.session) {
      location.href = "/login?next=/dashboard/import";
      return;
    }
    const response = await authed("/api/imports");
    if (!response.ok) {
      setMessage("Migration Studio could not be opened.");
      return;
    }
    const data = await response.json() as { school: { id: string; name: string }; projects: ImportProject[] };
    setAcademy(data.school);
    setProjects(data.projects);
    setMessage("");
  }, [authed, supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const summary = useMemo(() => plan ? summarizeImportPlan(plan) : null, [plan]);
  const documentSequenceIssues = useMemo(
    () => sequenceIssues(documents.map(({ file, text }) => ({ name: file.name, text }))),
    [documents],
  );
  const documentNumberingConflicts = useMemo(() => numberingConflicts(documents), [documents]);

  function invalidatePreview() {
    setPreview(null);
    setPlan(null);
    setResult(null);
    setWarnings([]);
    setUploadProgress([]);
    setAutopilotReport(null);
  }

  async function chooseDocuments(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []);
    invalidatePreview();
    setBusy("documents");
    setMessage(selected.length ? "Reading the document sequence locally..." : "");
    try {
      const prepared = await prepareDocumentSelection(selected);
      setDocuments(prepared.documents);
      setExcludedDocumentCopies(prepared.excludedExactContentCopies);
      setMessage(`${prepared.documents.length} unique document${prepared.documents.length === 1 ? "" : "s"} read and placed in natural module order.`);
    } catch (error) {
      setDocuments([]);
      setExcludedDocumentCopies([]);
      setMessage(error instanceof Error ? error.message : "The documents could not be read.");
    } finally {
      setBusy("");
      event.target.value = "";
    }
  }

  function moveDocument(index: number, direction: -1 | 1) {
    setDocuments((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    invalidatePreview();
  }

  async function buildPlan() {
    setBusy("inspect");
    setMessage("");
    setWarnings([]);
    setResult(null);
    try {
      let next = emptyImportPlan();
      const localWarnings: string[] = [];
      next.academyName = academy?.name || "";
      if (courseFile) {
        if (courseFile.size > 8 * 1024 * 1024) throw new Error("Course structure files must be smaller than 8 MB.");
        next.courses.push(...parseCourseSource(await courseFile.text(), courseFile.name, courseTitle || "Imported course"));
        next.sourceFiles.push(courseFile.name);
      }
      if (outline.trim()) {
        next.courses.push(...parseCourseOutline(outline, courseTitle || "Imported course"));
        next.sourceFiles.push("Pasted curriculum outline");
      }
      if (documents.length) {
        const documentInputs = documents.map(({ file, text }) => ({
          clientId: documentClientId(file),
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          text,
        }));
        next.courses.push(courseFromDocumentSequence(courseTitle || "Imported document course", documentInputs));
        next.sourceFiles.push(...documents.map((document) => document.file.name));
        for (const issue of documentSequenceIssues) {
          localWarnings.push(`${issue.label} appears to be missing Module ${issue.missing.join(", ")}. The remaining files have not been renumbered.`);
        }
        for (const conflict of documentNumberingConflicts) {
          localWarnings.push(`${conflict.filename} says ${conflict.filenameNumber} in its filename but ${conflict.internalNumber} inside the document. The internal heading is used for the draft and requires confirmation.`);
        }
        if (excludedDocumentCopies.length) {
          localWarnings.push(`${excludedDocumentCopies.length} exact content cop${excludedDocumentCopies.length === 1 ? "y was" : "ies were"} excluded: ${excludedDocumentCopies.join(", ")}.`);
        }
      }
      if (learnerFile) {
        if (learnerFile.size > 3 * 1024 * 1024) throw new Error("Learner lists must be smaller than 3 MB.");
        const learnerData = analyseLearnerCsv(await learnerFile.text());
        next.learners = learnerData.learners;
        localWarnings.push(...learnerData.report.warnings);
        next.sourceFiles.push(learnerFile.name);
      }
      if (mediaFile) {
        if (!next.courses.length) throw new Error("Add course structure before applying a media manifest.");
        const mapped = applyMediaManifest(next.courses, await mediaFile.text());
        localWarnings.push(...mapped.warnings);
        if (!mapped.matched) localWarnings.push("The media manifest did not match any lesson titles.");
        next.sourceFiles.push(mediaFile.name);
      }
      if (!next.courses.length && !next.learners.length) {
        throw new Error("Add a course export, an ordered document sequence, an outline, or a learner CSV first.");
      }
      if (autopilotEnabled) {
        const automated = runCourseLaunchAutopilot(next);
        next = automated.plan;
        setAutopilotReport(automated.report);
      } else {
        setAutopilotReport(null);
      }
      const response = await authed("/api/imports", {
        method: "POST",
        body: JSON.stringify({
          action: "preview",
          provider,
          sourceType: sourceTypeFor(next, documents.length),
          sourceFilename: next.sourceFiles.join(", "),
          title: next.courses[0]?.title || `${academy?.name || "Academy"} learner import`,
          rightsConfirmed,
          automationEnabled: autopilotEnabled,
          plan: next,
        }),
      });
      const data = await response.json() as { error?: string; project?: ImportProject };
      if (!response.ok || !data.project) throw new Error(data.error || "The import could not be inspected.");
      setPlan(next);
      setPreview(data.project);
      setWarnings([...localWarnings, ...data.project.warnings]);
      setProjects((current) => [data.project!, ...current.filter((item) => item.id !== data.project!.id)]);
      setMessage("Inspection complete. Nothing has been created or published yet.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The import could not be inspected.");
    } finally {
      setBusy("");
    }
  }

  async function uploadSequentialDocuments(
    importResult: ImportResult,
    projectId: string,
    preparedDocuments = documents,
  ) {
    const byClientId = new Map(preparedDocuments.map(({ file }) => [
      documentClientId(file),
      file,
    ] as const));
    const byFilename = new Map(preparedDocuments.map(({ file }) => [
      file.name.toLowerCase(),
      file,
    ] as const));
    const progress: string[] = [];
    let latestProject: ImportProject | null = null;
    let attachedCount = 0;
    let failedCount = 0;
    let missingCount = 0;
    for (const mapping of importResult.documents) {
      if (mapping.attached) {
        attachedCount += 1;
        continue;
      }
      const file = byClientId.get(mapping.clientId) || byFilename.get(mapping.filename.toLowerCase());
      if (!file) {
        missingCount += 1;
        progress.push(`${mapping.filename}: select this original file to finish the module`);
        setUploadProgress([...progress]);
        continue;
      }
      progress.push(`Uploading ${file.name}.`);
      setUploadProgress([...progress]);
      const uploadResponse = await authed(
        `/api/uploads?courseId=${encodeURIComponent(mapping.courseId)}&filename=${encodeURIComponent(file.name)}`,
        {
          method: "POST",
          headers: { "content-type": file.type || "application/octet-stream" },
          body: file,
        },
      );
      const upload = await uploadResponse.json() as { id?: string; error?: string };
      if (!uploadResponse.ok || !upload.id) {
        failedCount += 1;
        progress[progress.length - 1] = `${file.name}: ${upload.error || "upload failed"}`;
        setUploadProgress([...progress]);
        continue;
      }
      const attachResponse = await authed("/api/imports", {
        method: "POST",
        body: JSON.stringify({
          action: "attach_document",
          projectId,
          clientId: mapping.clientId,
          assetId: upload.id,
        }),
      });
      const attached = await attachResponse.json() as { error?: string; project?: ImportProject };
      progress[progress.length - 1] = attachResponse.ok
        ? `${file.name}: attached to module`
        : `${file.name}: ${attached.error || "could not attach"}`;
      if (attachResponse.ok) {
        attachedCount += 1;
        if (attached.project) latestProject = attached.project;
      } else {
        failedCount += 1;
      }
      setUploadProgress([...progress]);
    }
    if (latestProject) {
      setProjects((current) => [
        latestProject!,
        ...current.filter((item) => item.id !== latestProject!.id),
      ]);
      if (
        latestProject.result?.courses
        && latestProject.result.documents
        && latestProject.result.invitations
      ) {
        setResult(latestProject.result as ImportResult);
      }
    }
    return {
      attachedCount,
      failedCount,
      missingCount,
      remaining: latestProject?.documentUpload?.remaining
        ?? Math.max(0, importResult.documents.length - attachedCount),
      project: latestProject,
    };
  }

  async function createDrafts() {
    if (!preview || busy) return;
    setBusy("import");
    setMessage("");
    setUploadProgress([]);
    setAutopilotReport(null);
    try {
      const response = await authed("/api/imports", {
        method: "POST",
        body: JSON.stringify({ action: "import", projectId: preview.id, sendInvitations }),
      });
      const data = await response.json() as { error?: string; result?: ImportResult; project?: ImportProject };
      if (!response.ok || !data.result || !data.project) throw new Error(data.error || "The drafts could not be created.");
      setResult(data.result);
      setPreview(data.project);
      setProjects((current) => [data.project!, ...current.filter((item) => item.id !== data.project!.id)]);
      const uploads = data.result.documents.length
        ? await uploadSequentialDocuments(data.result, data.project.id)
        : null;
      setMessage(
        `${data.result.courses.length} private course draft${data.result.courses.length === 1 ? "" : "s"} created. ` +
        `${data.result.invitations.length ? `${data.result.invitations.length} learner invitation${data.result.invitations.length === 1 ? "" : "s"} queued. ` : ""}` +
        (uploads?.remaining
          ? `${uploads.remaining} source file${uploads.remaining === 1 ? "" : "s"} still need to be attached. The draft is saved and can be resumed below. `
          : data.result.documents.length ? "Every source file is safely attached. " : "") +
        "Nothing was published.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The drafts could not be created.");
    } finally {
      setBusy("");
    }
  }

  async function resumeProjectDocuments(project: ImportProject, event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    if (!selected.length || !project.result?.documents?.length || busy) return;
    const importResult: ImportResult = {
      courses: project.result.courses || [],
      documents: project.result.documents,
      invitations: project.result.invitations || [],
    };
    setBusy(`resume-${project.id}`);
    setResult(importResult);
    setUploadProgress([]);
    setMessage("Checking the selected files and resuming the protected upload...");
    try {
      const prepared = await prepareDocumentSelection(selected);
      const uploads = await uploadSequentialDocuments(importResult, project.id, prepared.documents);
      setMessage(uploads.remaining
        ? `${uploads.remaining} source file${uploads.remaining === 1 ? "" : "s"} still missing. Select the remaining originals and resume again.`
        : "Import verified: every source document is attached to its correct module.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The source-file upload could not be resumed.");
    } finally {
      setBusy("");
    }
  }

  function resetWorkspace() {
    setCourseFile(null);
    setLearnerFile(null);
    setMediaFile(null);
    setDocuments([]);
    setExcludedDocumentCopies([]);
    setOutline("");
    setCourseTitle("");
    setPlan(null);
    setPreview(null);
    setResult(null);
    setWarnings([]);
    setUploadProgress([]);
    setRightsConfirmed(false);
    setSendInvitations(false);
    setAutopilotEnabled(true);
    setMessage("");
  }

  if (!academy) return <main className="system-loading"><div><b>NorthstarLabs</b><p>{message}</p></div></main>;

  return <main className="import-page">
    <header className="import-topbar">
      <Link href="/dashboard">Creator workspace</Link>
      <b>Northstar Migration Studio</b>
      <span>Free - private drafts first</span>
    </header>

    <section className="import-hero">
      <div>
        <p className="sys-kicker">BRING THE WORK YOU HAVE ALREADY DONE</p>
        <h1>Move in without starting over.</h1>
        <p>Bring course structures, ordered documents, learner lists and existing media references into <b>{academy.name}</b>. Inspect every mapping first. Northstar creates editable private drafts—never surprise publications.</p>
        <ol className="import-hero-promise">
          <li><span>1</span><b>Upload or paste</b></li>
          <li><span>2</span><b>Inspect the map</b></li>
          <li><span>3</span><b>Create private drafts</b></li>
        </ol>
      </div>
      <aside>
        <small>FIRST MIGRATION</small>
        <strong>Free</strong>
        <p>No card. No manual retyping. Your source files remain yours.</p>
      </aside>
    </section>

    <section className="import-workspace">
      <div className="import-step-heading"><span>01</span><div><p className="sys-kicker">SOURCE</p><h2>What are you bringing across?</h2><p>Choose the closest source. Export layouts vary, so Northstar will show the interpreted structure before it creates anything.</p></div></div>
      <div className="import-provider-grid">
        {providerOptions.map((option) => <button type="button" className={provider === option.id ? "active" : ""} onClick={() => { setProvider(option.id); invalidatePreview(); }} key={option.id}>
          <span>{option.id === "documents" ? "DOC" : option.label.slice(0, 2).toUpperCase()}</span><b>{option.label}</b><small>{option.detail}</small>
        </button>)}
      </div>

      <div className="import-input-grid">
        <article className="import-input-card primary">
          <p className="sys-kicker">COURSE STRUCTURE</p><h3>Course export or curriculum file</h3>
          <p>CSV, TSV, JSON, Markdown or text. Common course/module/lesson fields are detected automatically.</p>
          <label className="import-file-label"><input type="file" accept=".csv,.tsv,.json,.md,.markdown,.txt" onChange={(event) => { setCourseFile(event.target.files?.[0] || null); invalidatePreview(); }} /><span>{courseFile ? courseFile.name : "Choose structure file"}</span><b>Browse</b></label>
          <label className="import-outline-label">Or paste an outline<textarea rows={7} value={outline} onChange={(event) => { setOutline(event.target.value); invalidatePreview(); }} placeholder={`# Course title\n## Module 1\n### Lesson 1\nTeaching notes.`} /></label>
        </article>

        <article className="import-input-card documents">
          <p className="sys-kicker">DOCUMENT SEQUENCE</p><h3>A folder of files becomes a real course</h3>
          <p>Upload one ZIP of Word, Markdown, text or HTML files, or select individual documents. Northstar reads the content, uses natural filename order, and keeps every original as a protected source file.</p>
          <label>Course title<input value={courseTitle} onChange={(event) => { setCourseTitle(event.target.value); invalidatePreview(); }} placeholder="e.g. Digital Assets Foundations" /></label>
          <label className="import-file-label"><input multiple type="file" accept=".zip,.pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.html" onChange={(event) => void chooseDocuments(event)} disabled={busy === "documents"} /><span>{busy === "documents" ? "Reading documents..." : documents.length ? `${documents.length} documents ready` : "Choose documents or one ZIP"}</span><b>{busy === "documents" ? "Wait" : "Browse"}</b></label>
          <small className="import-file-help">Up to {MAX_DOCUMENT_SEQUENCE_FILES} documents. Word text stays on this device until you inspect and approve the private draft.</small>
          {documentSequenceIssues.length > 0 && <div className="import-sequence-alert"><b>Sequence gap found</b>{documentSequenceIssues.map((issue) => <span key={issue.label}>{issue.label}: missing {issue.missing.join(", ")}. Nothing has been silently renumbered.</span>)}</div>}
          {documentNumberingConflicts.length > 0 && <div className="import-sequence-alert"><b>Filename and document disagree</b>{documentNumberingConflicts.map((conflict) => <span key={conflict.filename}>{conflict.filename}: filename {conflict.filenameNumber}, internal heading {conflict.internalNumber}. The internal heading will be used and flagged for review.</span>)}</div>}
          {excludedDocumentCopies.length > 0 && <div className="import-sequence-alert"><b>Exact copies removed</b><span>{excludedDocumentCopies.join(", ")}</span></div>}
          {documents.length > 0 && <ol className="document-sequence">
            {documents.map(({ file, text }, index) => <li key={`${file.name}-${file.lastModified}-${index}`}><span>{index + 1}</span><div><b>{file.name}</b><small>{(file.size / 1024).toFixed(0)} KB | {text ? `${text.trim().split(/\s+/).length.toLocaleString()} words extracted` : "protected attachment"}</small></div><button type="button" disabled={index === 0} onClick={() => moveDocument(index, -1)} aria-label={`Move ${file.name} up`}>up</button><button type="button" disabled={index === documents.length - 1} onClick={() => moveDocument(index, 1)} aria-label={`Move ${file.name} down`}>down</button><button type="button" onClick={() => { setDocuments((current) => current.filter((_, itemIndex) => itemIndex !== index)); invalidatePreview(); }} aria-label={`Remove ${file.name}`}>remove</button></li>)}
          </ol>}
        </article>

        <article className="import-input-card compact">
          <p className="sys-kicker">LEARNERS</p><h3>Optional learner CSV</h3><p>Email, name and course title columns are recognised. Invitations are opt-in after preview; nobody is silently enrolled.</p>
          <label className="import-file-label"><input type="file" accept=".csv,.tsv" onChange={(event) => { setLearnerFile(event.target.files?.[0] || null); invalidatePreview(); }} /><span>{learnerFile ? learnerFile.name : "Choose learner list"}</span><b>Browse</b></label>
        </article>
        <article className="import-input-card compact">
          <p className="sys-kicker">MEDIA MAP</p><h3>Optional media manifest</h3><p>A CSV can match existing HTTPS video or audio URLs to course, module and lesson titles.</p>
          <label className="import-file-label"><input type="file" accept=".csv,.tsv" onChange={(event) => { setMediaFile(event.target.files?.[0] || null); invalidatePreview(); }} /><span>{mediaFile ? mediaFile.name : "Choose media manifest"}</span><b>Browse</b></label>
        </article>
      </div>

      <section className={`import-autopilot ${autopilotEnabled ? "active" : ""}`}>
        <div>
          <p className="sys-kicker">COURSE LAUNCH AUTOPILOT</p>
          <h3>Let Northstar do the organising.</h3>
          <p>Northstar can shape supplied material into short lessons, draft literal source-grounded module checks, normalise learner records, and flag course assignments that need attention.</p>
        </div>
        <label>
          <input type="checkbox" checked={autopilotEnabled} onChange={(event) => { setAutopilotEnabled(event.target.checked); invalidatePreview(); }} />
          <span><b>{autopilotEnabled ? "Autopilot on" : "Autopilot off"}</b><small>Nothing is published and nobody is contacted without your approval.</small></span>
        </label>
        <ul>
          <li><span>01</span><b>Curriculum</b><small>Preserve the supplied order and split long material into lessons of about six minutes.</small></li>
          <li><span>02</span><b>Knowledge checks</b><small>Draft questions whose correct answers come directly from the supplied lesson text.</small></li>
          <li><span>03</span><b>Student data</b><small>Normalise email addresses, remove exact duplicates, and expose invalid or unmatched records.</small></li>
        </ul>
      </section>

      <label className="import-rights"><input type="checkbox" checked={rightsConfirmed} onChange={(event) => { setRightsConfirmed(event.target.checked); if (!event.target.checked) invalidatePreview(); }} /><span><b>I own, licensed, or have permission to migrate these materials and learner records.</b><small>Northstar does not turn access to a source into permission to copy it. Remove data you do not need before importing.</small></span></label>
      <button className="import-inspect-button" type="button" disabled={!rightsConfirmed || busy === "inspect"} onClick={() => void buildPlan()}>{busy === "inspect" ? "Inspecting structure." : "Inspect before importing"}</button>

      {message && <div className="import-message" role="status">{message}</div>}

      {preview && plan && summary && <section className="import-preview">
        <div className="import-step-heading"><span>02</span><div><p className="sys-kicker">PREVIEW</p><h2>This is what Northstar will create.</h2><p>Review the order and counts. Change the source above and inspect again if anything looks wrong.</p></div></div>
        <div className="import-summary-grid">
          {(["courses", "sections", "lessons", "quizzes", "mediaLinks", "documents", "learners"] as const).map((key) => <div key={key}><strong>{summary[key]}</strong><span>{key === "mediaLinks" ? "media links" : key}</span></div>)}
        </div>
        {autopilotReport && <section className="import-autopilot-report">
          <div className="autopilot-score"><strong>{autopilotReport.score}</strong><span>/ 100</span><small>automation readiness</small></div>
          <div><p className="sys-kicker">AUTOMATED, NOT AUTO-PUBLISHED</p><h3>Your launch draft has a head start.</h3><ul>{autopilotReport.completed.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><p className="sys-kicker">HUMAN REVIEW</p><h3>What still needs judgement.</h3><ul>{autopilotReport.review.map((item) => <li key={item}>{item}</li>)}</ul></div>
        </section>}
        {warnings.length > 0 && <div className="import-warnings"><b>Review these mappings</b><ul>{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div>}
        <div className="import-course-previews">
          {plan.courses.map((course) => <article key={course.clientId}>
            <header><span>DRAFT</span><div><h3>{course.title}</h3><p>{course.description || "No course description was supplied."}</p></div><b>{course.sections.length} modules</b></header>
            <ol>{course.sections.map((section, sectionIndex) => <li key={section.clientId}><span>{String(sectionIndex + 1).padStart(2, "0")}</span><div><b>{section.title}</b><small>{section.lessons.map((lesson) => lesson.title).join(" | ")}</small></div><strong>{section.lessons.length} lesson{section.lessons.length === 1 ? "" : "s"}</strong></li>)}</ol>
          </article>)}
          {!plan.courses.length && <article className="learner-only-preview"><h3>Learner invitation list only</h3><p>{plan.learners.length} valid learner records are ready. Match course titles carefully before choosing to send invitations.</p></article>}
        </div>
        {plan.learners.length > 0 && <label className="import-invite-choice"><input type="checkbox" checked={sendInvitations} onChange={(event) => setSendInvitations(event.target.checked)} /><span><b>Create and queue {plan.learners.length} secure learner invitation{plan.learners.length === 1 ? "" : "s"}</b><small>Leave this off to import course drafts without contacting learners. Invitations expire after seven days.</small></span></label>}
        <div className="import-final-check">
          <div><b>Safe by default</b><p>Every course stays private and editable. Existing courses are not overwritten. Duplicate titles receive an &quot;imported draft&quot; label.</p></div>
          <button type="button" className="sys-primary" onClick={() => void createDrafts()} disabled={busy === "import" || ["imported", "awaiting_files"].includes(preview.status)}>{busy === "import" ? "Creating private drafts." : ["imported", "awaiting_files"].includes(preview.status) ? "Drafts created" : "Create private drafts"}</button>
        </div>
      </section>}

      {result && <section className="import-complete">
        <p className="sys-kicker">{result.documents.some((document) => !document.attached) ? "DRAFTS CREATED | FILES STILL REQUIRED" : "MIGRATION VERIFIED | NOTHING PUBLISHED"}</p><h2>{result.documents.some((document) => !document.attached) ? "Your course is safe. Finish attaching its source files." : "Your work is now editable in Northstar."}</h2>
        <div>{result.courses.map((course) => <Link href={course.editorUrl} key={course.id}><span>COURSE DRAFT</span><b>{course.title}</b><small>Open, review and finish the learner experience</small></Link>)}</div>
        {uploadProgress.length > 0 && <ul>{uploadProgress.map((item) => <li key={item}>{item}</li>)}</ul>}
        <button type="button" onClick={resetWorkspace}>Start another migration</button>
      </section>}
    </section>

    {projects.length > 0 && <section className="import-history">
      <div><p className="sys-kicker">MIGRATION HISTORY</p><h2>A clear record of what moved.</h2></div>
      <div>{projects.map((project) => <article key={project.id}><span className={project.status}>{project.status === "awaiting_files" ? "files required" : project.status}</span><div><b>{project.title}</b><small>{project.summary.courses} courses, {project.summary.lessons} lessons, {project.summary.learners} learners{project.documentUpload?.remaining ? ` | ${project.documentUpload.remaining} source files missing` : ""}</small></div><time>{new Date(project.updatedAt || project.createdAt).toLocaleDateString("en-ZA", { dateStyle: "medium" })}</time><div className="import-history-actions">{project.status === "awaiting_files" && <label><input multiple type="file" accept=".zip,.pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.html" disabled={Boolean(busy)} onChange={(event) => void resumeProjectDocuments(project, event)} /><span>{busy === `resume-${project.id}` ? "Uploading..." : "Finish file upload"}</span></label>}{project.result?.courses?.[0] && <Link href={project.result.courses[0].editorUrl}>Open draft</Link>}</div></article>)}</div>
    </section>}
  </main>;
}



