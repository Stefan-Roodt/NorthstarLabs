"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LessonContent } from "../../../lib/lesson-content";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

type Quiz = {
  id: string;
  title: string;
  passingScore: number;
  questions: Array<{ id: string; prompt: string; options: string[] }>;
};
type Asset = {
  id: string | null;
  key: string;
  filename: string;
  contentType: string;
  kind: string;
  altText?: string;
};
type Resource = Asset & {
  assetId: string;
  sizeBytes: number;
  title: string;
};
type Lesson = {
  id: string;
  sectionId: string;
  title: string;
  lessonType: string;
  content: string;
  durationMinutes: number;
  completed: number;
  primaryAsset?: Asset | null;
  resources: Resource[];
  quiz?: Quiz | null;
};
type Section = { id: string; title: string; position: number };
type Certificate = { code: string; issuedAt: number };

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(bytes > 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

function MediaViewer({
  asset,
  accessToken,
}: {
  asset: Asset;
  accessToken: () => Promise<string>;
}) {
  const [source, setSource] = useState(() => asset.key.startsWith("r2:") ? "" : asset.key);
  const [error, setError] = useState("");

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;
    if (!asset.key.startsWith("r2:")) {
      return;
    }
    (async () => {
      const response = await fetch(`/api/uploads?key=${encodeURIComponent(asset.key)}`, {
        headers: { authorization: `Bearer ${await accessToken()}` },
      });
      if (!response.ok) {
        if (!cancelled) setError("This media could not be loaded.");
        return;
      }
      objectUrl = URL.createObjectURL(await response.blob());
      if (!cancelled) setSource(objectUrl);
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [accessToken, asset.key]);

  if (error) return <div className="media-placeholder"><p>{error}</p></div>;
  if (!source) return <div className="media-placeholder"><p>Loading lesson media…</p></div>;
  if (asset.kind === "image") {
    return <figure className="lesson-image">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={source} alt={asset.altText || asset.filename} />
      {asset.altText && <figcaption>{asset.altText}</figcaption>}
    </figure>;
  }
  if (asset.kind === "audio") {
    return <div className="lesson-audio">
      <b>{asset.filename}</b>
      <audio controls preload="metadata" src={source}>Your browser does not support audio playback.</audio>
    </div>;
  }
  if (asset.kind === "video") {
    return <div className="lesson-video">
      <video controls preload="metadata" src={source}>Your browser does not support video playback.</video>
    </div>;
  }
  return null;
}

export default function Learn({ params }: { params: Promise<{ courseId: string }> }) {
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState("");
  const [resourceMessage, setResourceMessage] = useState("");
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") === "1";
  const supabase = getSupabaseBrowser();

  const token = useCallback(async () => {
    return (await supabase?.auth.getSession())?.data.session?.access_token || "";
  }, [supabase]);

  useEffect(() => {
    params.then((value) => setId(value.courseId));
  }, [params]);

  useEffect(() => {
    if (!id || !supabase) return;
    (async () => {
      const accessToken = await token();
      if (!accessToken) {
        location.href = `/login?next=${encodeURIComponent(`/learn/${id}${preview ? "?preview=1" : ""}`)}`;
        return;
      }
      const response = await fetch(`/api/learn/${id}`, {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json() as {
        error?: string;
        course?: { title: string };
        sections?: Section[];
        lessons?: Lesson[];
        certificate?: Certificate | null;
      };
      if (!response.ok || !data.course) {
        setError(data.error || "This course could not be opened.");
        setLoaded(true);
        return;
      }
      setTitle(data.course.title);
      setSections(data.sections || []);
      setLessons(data.lessons || []);
      setCertificate(data.certificate || null);
      setLoaded(true);
    })();
  }, [id, preview, supabase, token]);

  function continueToNext() {
    if (current < lessons.length - 1) openLesson(current + 1);
  }

  function openLesson(index: number) {
    setCurrent(index);
    setAnswers([]);
    setQuizResult("");
    setResourceMessage("");
  }

  async function completeLesson() {
    if (preview) return;
    const lesson = lessons[current];
    if (lesson.completed) {
      continueToNext();
      return;
    }
    const response = await fetch("/api/progress", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ lessonId: lesson.id, completed: true }),
    });
    const result = await response.json() as { error?: string; certificateCode?: string };
    if (!response.ok) {
      setQuizResult(result.error || "Progress could not be saved.");
      return;
    }
    setLessons(lessons.map((item) => item.id === lesson.id ? { ...item, completed: 1 } : item));
    if (result.certificateCode) setCertificate({ code: result.certificateCode, issuedAt: Date.now() });
    continueToNext();
  }

  async function submitQuiz() {
    if (preview) return;
    const lesson = lessons[current];
    if (!lesson.quiz) return;
    if (lesson.quiz.questions.some((_, index) => !Number.isInteger(answers[index]))) {
      setQuizResult("Choose an answer for every question.");
      return;
    }
    setQuizResult("Checking your answers…");
    const response = await fetch(`/api/quizzes/${lesson.id}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ answers }),
    });
    const result = await response.json() as {
      error?: string;
      score?: number;
      passed?: boolean;
      passingScore?: number;
      certificateCode?: string;
    };
    if (!response.ok) {
      setQuizResult(result.error || "The quiz could not be submitted.");
      return;
    }
    if (result.passed) {
      setLessons(lessons.map((item) => item.id === lesson.id ? { ...item, completed: 1 } : item));
      setQuizResult(`Passed with ${result.score}%. This lesson is complete.`);
      if (result.certificateCode) setCertificate({ code: result.certificateCode, issuedAt: Date.now() });
    } else {
      setQuizResult(`You scored ${result.score}%. You need ${result.passingScore}% to pass. Try again.`);
    }
  }

  async function downloadResource(resource: Resource) {
    setResourceMessage(`Preparing ${resource.filename}…`);
    const response = await fetch(
      `/api/uploads?key=${encodeURIComponent(resource.key)}&download=1`,
      { headers: { authorization: `Bearer ${await token()}` } },
    );
    if (!response.ok) {
      setResourceMessage("This resource could not be downloaded.");
      return;
    }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = resource.filename;
    link.click();
    URL.revokeObjectURL(url);
    setResourceMessage(`${resource.filename} downloaded.`);
  }

  if (error) {
    return <main className="system-loading"><div>
      <b>Access needed</b><p>{error}</p>
      <Link className="sys-primary" href={`/courses/${id}`}>View course</Link>
    </div></main>;
  }
  if (!loaded) return <main className="system-loading"><p>Preparing your course…</p></main>;
  if (!lessons.length) return <main className="system-loading"><div>
    <b>This course has no lessons yet.</b>
    <p>{preview ? "Return to the editor and add the first lesson." : "The creator is still preparing the curriculum."}</p>
    {preview && <Link className="sys-primary" href={`/dashboard/courses/${id}`}>Return to editor</Link>}
  </div></main>;

  const done = lessons.filter((lesson) => lesson.completed).length;
  const progress = Math.round(done / lessons.length * 100);
  const lesson = lessons[current];

  return <main className="learn-page">
    <header>
      <Link className="system-brand" href="/">✦ NORTHSTARLABS</Link>
      {preview
        ? <div className="preview-mode-label">Creator preview · progress is disabled</div>
        : <div><span>{progress}% complete</span><i><b style={{ width: `${progress}%` }} /></i></div>}
      {preview
        ? <Link href={`/dashboard/courses/${id}`}>Exit preview</Link>
        : <Link href="/learn">My learning</Link>}
    </header>
    {!preview && certificate && <div className="certificate-ready">
      <div><b>Course completed</b><span>Your verified NorthStarLabs certificate is ready.</span></div>
      <Link href={`/certificates/${certificate.code}`}>View certificate</Link>
    </div>}
    <div className="learn-layout">
      <aside>
        <p className="sys-kicker">{title}</p>
        <h2>Your curriculum</h2>
        {(sections.length ? sections : [{ id: "all", title: "Course content", position: 0 }]).map((section) => {
          const sectionLessons = sections.length
            ? lessons.filter((item) => item.sectionId === section.id)
            : lessons;
          if (!sectionLessons.length) return null;
          return <div className="learner-section" key={section.id}>
            <h3>{section.title}</h3>
            {sectionLessons.map((item) => {
              const index = lessons.findIndex((candidate) => candidate.id === item.id);
              return <button
                key={item.id}
                className={index === current ? "active" : item.completed ? "done" : ""}
                onClick={() => openLesson(index)}
              >
                <span>{item.completed && !preview ? "✓" : index + 1}</span>
                <span className="lesson-nav-title">
                  {item.title}
                  <small>{item.durationMinutes ? `${item.durationMinutes} min` : item.quiz ? "Quiz required" : item.lessonType}</small>
                </span>
              </button>;
            })}
          </div>;
        })}
      </aside>
      <section>
        {lesson.primaryAsset
          ? <MediaViewer key={lesson.primaryAsset.key} asset={lesson.primaryAsset} accessToken={token} />
          : <div className="lesson-banner">NORTHSTARLABS · {lesson.lessonType.toUpperCase()} LESSON</div>}
        <p className="sys-kicker">LESSON {current + 1} OF {lessons.length}{lesson.durationMinutes ? ` · ${lesson.durationMinutes} MIN` : ""}</p>
        <h1>{lesson.title}</h1>
        {lesson.content
          ? <LessonContent content={lesson.content} />
          : <p className="lesson-empty-copy">Your creator is still adding the written guidance for this lesson.</p>}

        {!!lesson.resources?.length && <section className="lesson-resources">
          <div><p className="sys-kicker">LESSON RESOURCES</p><h2>Files to keep and use</h2></div>
          <div>
            {lesson.resources.map((resource) => <button key={resource.id} onClick={() => downloadResource(resource)}>
              <span>{resource.kind === "document" ? "DOC" : resource.kind.toUpperCase()}</span>
              <div><b>{resource.title || resource.filename}</b><small>{formatBytes(resource.sizeBytes)}</small></div>
              <strong>Download ↓</strong>
            </button>)}
          </div>
          {resourceMessage && <p className="resource-message" role="status">{resourceMessage}</p>}
        </section>}

        {lesson.quiz && <section className="learner-quiz">
          <div>
            <p className="sys-kicker">KNOWLEDGE CHECK</p>
            <h2>{lesson.quiz.title}</h2>
            <span>{preview ? "Preview of the learner quiz." : `Score ${lesson.quiz.passingScore}% or higher to complete this lesson.`}</span>
          </div>
          {lesson.quiz.questions.map((question, questionIndex) =>
            <fieldset key={question.id}>
              <legend>{questionIndex + 1}. {question.prompt}</legend>
              {question.options.map((option, optionIndex) =>
                <label key={optionIndex}>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={answers[questionIndex] === optionIndex}
                    onChange={() => {
                      const next = [...answers];
                      next[questionIndex] = optionIndex;
                      setAnswers(next);
                    }}
                  />
                  <span>{option}</span>
                </label>
              )}
            </fieldset>
          )}
          {quizResult && <p className="quiz-result" role="status">{quizResult}</p>}
          {preview
            ? <div className="preview-completion-note">Quiz submission is disabled in creator preview.</div>
            : lesson.completed
              ? <button className="sys-primary" onClick={continueToNext}>
                  {current === lessons.length - 1 ? "Lesson complete" : "Continue to next lesson →"}
                </button>
              : <button className="sys-primary" onClick={submitQuiz}>Submit quiz</button>}
        </section>}

        {!lesson.quiz && <div className="lesson-actions">
          <button disabled={current === 0} onClick={() => openLesson(current - 1)}>← Previous</button>
          {preview
            ? <span className="preview-completion-note">Completion is disabled in preview.</span>
            : <button className="sys-primary" onClick={completeLesson}>
                {lesson.completed
                  ? current === lessons.length - 1 ? "Lesson completed" : "Completed — continue →"
                  : "Complete & continue →"}
              </button>}
        </div>}
      </section>
    </div>
  </main>;
}
