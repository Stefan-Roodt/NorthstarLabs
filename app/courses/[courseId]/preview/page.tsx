"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LessonContent } from "../../../../lib/lesson-content";
import type { LessonExperience } from "../../../../lib/lesson-experience";
import { preferredSpeechVoice } from "../../../../lib/speech-voices";
import { InteractiveLessonExperience } from "../../../learn/[courseId]/lesson-experience";

type PreviewAsset = {
  id: string | null;
  url: string;
  filename: string;
  contentType: string;
  kind: string;
  altText?: string;
};

type PreviewData = {
  course: {
    id: string;
    title: string;
    description: string;
    priceCents: number;
    schoolName: string;
    schoolSlug: string;
  };
  lesson: {
    id: string;
    title: string;
    type: string;
    content: string;
    durationMinutes: number;
    transcript: string;
    experience: LessonExperience | null;
    primaryAsset: PreviewAsset | null;
    questions: Array<{
      id: string;
      prompt: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }>;
  };
};

function narrationSource(transcript: string, fallbackContent: string) {
  const combined = [transcript || "", fallbackContent || ""].join("\n\n");
  return combined
    .replace(/\r/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function LessonTranscriptNarrator({
  transcript,
  lessonContent,
  lessonTitle,
}: {
  transcript: string;
  lessonContent: string;
  lessonTitle: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [isSupported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceUri, setVoiceUri] = useState("");
  const [rate, setRate] = useState(0.98);
  const text = narrationSource(transcript, lessonContent);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = Number(window.localStorage.getItem("northstar:narration-rate"));
      if ([0.85, 0.98, 1.15, 1.3].includes(saved)) setRate(saved);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isSupported) {
      return;
    }
    const loadVoices = () => {
      const available = speechSynthesis.getVoices();
      setVoices(available);
      setVoicesLoaded(true);
      if (!voiceUri && available.length > 0) {
        const saved = window.localStorage.getItem("northstar:narration-voice") || "";
        const selected = preferredSpeechVoice(available, saved);
        if (selected) setVoiceUri(selected.voiceURI);
      }
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      speechSynthesis.onvoiceschanged = null;
      speechSynthesis.cancel();
    };
  }, [isSupported, voiceUri]);

  const canNarrate = isSupported && text.length > 0;

  useEffect(() => {
    if (!playing || !canNarrate) {
      if (isSupported) window.speechSynthesis.cancel();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    if (voiceUri) {
      const selectedVoice = voices.find((candidate) => candidate.voiceURI === voiceUri);
      if (selectedVoice) utterance.voice = selectedVoice;
    }
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
    return () => {
      speechSynthesis.cancel();
    };
  }, [playing, canNarrate, isSupported, text, voiceUri, rate, voices]);

  if (!text) return <p className="lesson-narration-control lesson-narration-empty">No narration text available for this lesson.</p>;
  if (!isSupported) return <p className="lesson-narration-control lesson-narration-empty">Narration is unavailable in this browser.</p>;
  if (!voicesLoaded) return <p className="lesson-narration-control lesson-narration-empty">Loading narration voice options...</p>;

  return <section className="lesson-narration-control">
    <div className="lesson-narration-actions">
      <button
        type="button"
        className="sys-primary"
        disabled={!canNarrate}
        onClick={() => setPlaying((current) => !current)}
        aria-pressed={playing}
      >
        {playing ? `Pause narration` : `Narrate ${lessonTitle}`}
      </button>
      <label>
        <span>Voice</span>
        <select value={voiceUri} onChange={(event) => {
          setVoiceUri(event.target.value);
          window.localStorage.setItem("northstar:narration-voice", event.target.value);
        }}>
          {voices.map((option) => <option key={option.voiceURI} value={option.voiceURI}>{option.name}</option>)}
        </select>
      </label>
      <label>
        <span>Speed</span>
        <select value={String(rate)} onChange={(event) => {
          const nextRate = Number(event.target.value);
          setRate(nextRate);
          window.localStorage.setItem("northstar:narration-rate", String(nextRate));
        }}>
          <option value="0.85">0.85x</option>
          <option value="0.98">0.98x</option>
          <option value="1.15">1.15x</option>
          <option value="1.3">1.30x</option>
        </select>
      </label>
    </div>
  </section>;
}

function vttTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = Math.floor(seconds % 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}.000`;
}

function transcriptTrack(transcript: string, durationMinutes: number) {
  const chunks = transcript.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((item) => item.trim()).filter(Boolean) || [];
  if (!chunks.length) return "";
  const totalSeconds = Math.max(30, durationMinutes * 60);
  const cueLength = totalSeconds / chunks.length;
  const cues = chunks.map((chunk, index) =>
    `${index + 1}\n${vttTime(index * cueLength)} --> ${vttTime(Math.min(totalSeconds, (index + 1) * cueLength))}\n${chunk}`
  );
  return `data:text/vtt;charset=utf-8,${encodeURIComponent(`WEBVTT\n\n${cues.join("\n\n")}`)}`;
}

export default function PublicLessonPreview({ params }: { params: Promise<{ courseId: string }> }) {
  const [courseId, setCourseId] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [error, setError] = useState("");
  const [mediaIndex, setMediaIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    params.then(({ courseId: value }) => setCourseId(value));
  }, [params]);

  useEffect(() => {
    if (!courseId) return;
    fetch(`/api/catalog/${encodeURIComponent(courseId)}/preview`)
      .then(async (response) => {
        const result = await response.json() as PreviewData & { error?: string };
        if (!response.ok) throw new Error(result.error || "This preview is not available.");
        return result;
      })
      .then(setPreview)
      .catch((reason: Error) => setError(reason.message));
  }, [courseId]);

  const media = useMemo(() => preview
    ? [preview.lesson.primaryAsset].filter((asset): asset is PreviewAsset => Boolean(asset?.url))
    : [], [preview]);
  const currentMedia = media[mediaIndex] || null;
  const track = preview ? transcriptTrack(preview.lesson.transcript, preview.lesson.durationMinutes) : "";

  if (error) return <main className="system-loading"><div><b>Preview unavailable</b><p>{error}</p><Link className="sys-primary" href={`/courses/${courseId}`}>Return to course</Link></div></main>;
  if (!preview) return <main className="system-loading"><p>Opening the public lesson preview...</p></main>;

  return <main className="public-preview-page">
    <header className="public-preview-header">
      <Link className="system-brand" href={`/schools/${preview.course.schoolSlug}`}>* {preview.course.schoolName}</Link>
      <div><span>PUBLIC LESSON PREVIEW</span><Link href={`/courses/${courseId}`}>Back to course</Link></div>
    </header>

    <section className="public-preview-hero">
      <div>
        <p className="sys-kicker">TRY THE TEACHING - NO ACCOUNT REQUIRED</p>
        <h1>{preview.lesson.title}</h1>
        <p>A complete lesson from <b>{preview.course.title}</b>. Watch, read and test yourself before deciding whether the course is right for you.</p>
      </div>
      <aside>
        <b>{preview.lesson.durationMinutes || 6} min</b>
        <span>Public lesson</span>
        <small>Your progress is not saved in preview mode.</small>
      </aside>
    </section>

    <div className="public-preview-layout">
      <article className="public-preview-content">
        {!!media.length && <section className="public-preview-media">
          <header>
            <div><span>{mediaIndex + 1}/{media.length}</span><b>{currentMedia?.filename}</b></div>
            {media.length > 0 && <small>Lesson media</small>}
          </header>
          {currentMedia?.kind === "audio" && <audio key={currentMedia.url} controls src={currentMedia.url} onEnded={() => setMediaIndex((index) => Math.min(media.length - 1, index + 1))} />}
          {currentMedia?.kind === "image" && <>
            {/* Creator media can use a short-lived protected URL, so Next image optimisation cannot proxy it. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentMedia.url} alt={currentMedia.altText || currentMedia.filename} />
          </>}
          {currentMedia && !["audio", "image"].includes(currentMedia.kind) && <video key={currentMedia.url} controls playsInline preload="metadata" autoPlay={mediaIndex === 0} onEnded={() => setMediaIndex((index) => Math.min(media.length - 1, index + 1))}>
            <source src={currentMedia.url} type={currentMedia.contentType} />
            {track && <track default kind="captions" srcLang="en" label="English" src={track} />}
          </video>}
          {media.length > 1 && <nav aria-label="Preview media">
            {media.map((asset, index) => <button key={`${asset.id}-${index}`} className={index === mediaIndex ? "active" : ""} onClick={() => setMediaIndex(index)}>{index === 0 ? "Lesson media" : `Media ${index + 1}`}</button>)}
          </nav>}
        </section>}

        <section className="public-preview-lesson">
          <p className="sys-kicker">THE ACTUAL LESSON</p>
          {preview.lesson.experience && <InteractiveLessonExperience experience={preview.lesson.experience} />}
          {preview.lesson.experience
            ? <details className="lesson-reference-notes">
                <summary>Open the source-backed reference notes</summary>
                <LessonContent content={preview.lesson.content} lessonTitle={preview.lesson.title} slideDeckMode />
              </details>
            : <LessonContent content={preview.lesson.content} lessonTitle={preview.lesson.title} slideDeckMode />}
          <LessonTranscriptNarrator
            transcript={preview.lesson.transcript}
            lessonContent={preview.lesson.content}
            lessonTitle={preview.lesson.title}
          />
        </section>

        {preview.lesson.questions.length > 0 && <section className="public-preview-quiz">
          <p className="sys-kicker">KNOWLEDGE CHECK</p>
          <h2>Test what you understood.</h2>
          <p>This practice result stays on this page and is not recorded.</p>
          {preview.lesson.questions.map((question, questionIndex) => {
            const hasChecked = Boolean(checked[question.id]);
            const selected = answers[question.id];
            const isCorrect = selected === question.correctIndex;
            return <fieldset key={question.id}>
              <legend><span>{String(questionIndex + 1).padStart(2, "0")}</span>{question.prompt}</legend>
              {question.options.map((option, optionIndex) => <label key={`${question.id}-${optionIndex}`} className={hasChecked && optionIndex === question.correctIndex ? "correct" : hasChecked && optionIndex === selected ? "incorrect" : ""}>
                <input type="radio" name={question.id} checked={selected === optionIndex} onChange={() => { setAnswers((current) => ({ ...current, [question.id]: optionIndex })); setChecked((current) => ({ ...current, [question.id]: false })); }} />
                <span>{option}</span>
              </label>)}
              <button disabled={selected === undefined} onClick={() => setChecked((current) => ({ ...current, [question.id]: true }))}>Check my answer</button>
              {hasChecked && <div className={isCorrect ? "quiz-result correct" : "quiz-result incorrect"}><b>{isCorrect ? "Correct." : "Not quite."}</b><p>{question.explanation || (isCorrect ? "You have understood this idea." : "Review the lesson and try again.")}</p></div>}
            </fieldset>;
          })}
        </section>}

        {preview.lesson.transcript && <details className="public-preview-transcript">
          <summary>Read the lesson transcript</summary>
          <p>{preview.lesson.transcript}</p>
        </details>}
      </article>

      <aside className="public-preview-decision">
        <p className="sys-kicker">SEEN ENOUGH?</p>
        <h2>Continue with the full course.</h2>
        <p>{preview.course.description}</p>
        <ul><li>Full curriculum and assessments</li><li>Progress saved across devices</li><li>Completion evidence and certificate</li></ul>
        <Link className="sys-primary" href={`/courses/${courseId}?enrol=1`}>{preview.course.priceCents ? "Continue to course" : "Enrol for free"}</Link>
        <Link href={`/courses/${courseId}`}>See the full Course Truth Card</Link>
      </aside>
    </div>

    <footer className="catalog-footer"><Link className="system-brand" href="/">* NORTHSTARLABS</Link><span>Preview first. Join with confidence.</span></footer>
  </main>;
}

