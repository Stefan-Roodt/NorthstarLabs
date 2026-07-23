"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  type CSSProperties,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import confetti from "canvas-confetti";
import { driver } from "driver.js";
import { domAnimation, LazyMotion, m, useReducedMotion } from "motion/react";
import { LessonContent } from "../../../lib/lesson-content";
import { getLessonGuide } from "../../../lib/lesson-guide";
import type { LessonExperience } from "../../../lib/lesson-experience";
import { useLowBandwidthMode } from "../../../lib/low-bandwidth";
import { preferredSpeechVoice } from "../../../lib/speech-voices";
import { getSupabaseBrowser } from "../../../lib/supabase-client";
import { ContextualLessonHelp } from "./lesson-help";
import { InteractiveLessonExperience } from "./lesson-experience";
type Quiz = {
  id: string;
  title: string;
  passingScore: number;
  maxAttempts: number;
  attemptCount: number;
  bestScore: number | null;
  passed: boolean;
  attemptsRemaining: number | null;
  questions: Array<{ id: string; prompt: string; options: string[] }>;
};
type QuizAnswerFeedback = {
  questionId: string;
  correct: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
};
type Asset = {
  id: string | null;
  key: string;
  filename: string;
  contentType: string;
  kind: string;
  altText?: string;
};
type Resource = Asset & { assetId: string; sizeBytes: number; title: string };
type Lesson = {
  id: string;
  sectionId: string;
  title: string;
  lessonType: string;
  content: string;
  durationMinutes: number;
  completed: number;
  watchedPercent: number;
  requiredWatchPercent: number;
  notes: string;
  bookmarked: number;
  transcript: string;
  experience?: LessonExperience | null;
  availableAt: number | null;
  locked: boolean;
  lockReason: string | null;
  primaryAsset?: Asset | null;
  introAsset?: Asset | null;
  resources: Resource[];
  quiz?: Quiz | null;
  detailLoaded?: boolean;
};
type Section = { id: string; title: string; position: number };
type Certificate = {
  code: string;
  issuedAt: number;
  status: string;
  expiresAt: number | null;
};
type CourseSchool = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  showCommunity: number;
};
function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(bytes > 10 * 1024 * 1024 ? 0 : 1)} MB`;
}
function vttTime(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = Math.floor(safe % 60);
  const milliseconds = Math.floor((safe % 1) * 1000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}
function captionVtt(transcript: string, durationSeconds: number) {
  const words = transcript
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  if (!words.length) return "";
  const cues: string[] = [];
  for (let index = 0; index < words.length; index += 12) {
    cues.push(
      words
        .slice(index, index + 12)
        .join(" ")
        .replace(/-->/g, "to"),
    );
  }
  const usableDuration = Math.max(
    cues.length * 1.5,
    durationSeconds || cues.length * 4,
  );
  const cueDuration = usableDuration / cues.length;
  return `WEBVTT\n\n${cues.map((text, index) => `${index + 1}\n${vttTime(index * cueDuration)} --> ${vttTime(Math.min(usableDuration, (index + 1) * cueDuration - 0.08))}\n${text}\n`).join("\n")}`;
}
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
  const [isSupported] = useState(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
  );
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
      const selectedVoice = voices.find(
        (candidate) => candidate.voiceURI === voiceUri,
      );
      if (selectedVoice) utterance.voice = selectedVoice;
    }
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [playing, canNarrate, isSupported, text, voiceUri, rate, voices]);
  if (!text)
    return (
      <p className="lesson-narration-control lesson-narration-empty">
        No narration text available for this lesson.
      </p>
    );
  if (!isSupported)
    return (
      <p className="lesson-narration-empty">
        Narration is unavailable in this browser.
      </p>
    );
  if (!voicesLoaded)
    return (
      <p className="lesson-narration-empty">
        Loading narration voice options...
      </p>
    );
  return (
    <section className="lesson-narration-control">
      {" "}
      <div className="lesson-narration-actions">
        {" "}
        <button
          type="button"
          className="sys-primary"
          disabled={!canNarrate}
          onClick={() => setPlaying((current) => !current)}
          aria-pressed={playing}
        >
          {" "}
          {playing ? "Pause read-aloud" : `Read ${lessonTitle} aloud`}{" "}
        </button>{" "}
        <label>
          {" "}
          <span>Voice</span>{" "}
          <select
            value={voiceUri}
            onChange={(event) => {
              setVoiceUri(event.target.value);
              window.localStorage.setItem("northstar:narration-voice", event.target.value);
            }}
          >
            {" "}
            {voices.map((option) => (
              <option key={option.voiceURI} value={option.voiceURI}>
                {option.name}
              </option>
            ))}{" "}
          </select>{" "}
        </label>{" "}
        <label>
          {" "}
          <span>Speed</span>{" "}
          <select
            value={String(rate)}
            onChange={(event) => {
              const nextRate = Number(event.target.value);
              setRate(nextRate);
              window.localStorage.setItem("northstar:narration-rate", String(nextRate));
            }}
          >
            {" "}
            <option value="0.85">0.85x</option>{" "}
            <option value="0.98">0.98x</option>{" "}
            <option value="1.15">1.15x</option>{" "}
            <option value="1.3">1.30x</option>{" "}
          </select>{" "}
        </label>{" "}
      </div>{" "}
      {!canNarrate && (
        <small>Your browser does not support speech narration.</small>
      )}{" "}
    </section>
  );
}
function isProtectedMediaKey(key: string) {
  return key.startsWith("r2:") || key.startsWith("static:");
}
function MediaViewer({
  asset,
  transcript,
  lessonId,
  accessToken,
  onWatch,
  effectiveLowBandwidth,
}: {
  asset: Asset;
  transcript: string;
  lessonId: string;
  accessToken: () => Promise<string>;
  onWatch: (percent: number) => void;
  effectiveLowBandwidth: boolean;
}) {
  const [activeAsset] = useState(() => asset);
  const [mediaRequested, setMediaRequested] = useState(!effectiveLowBandwidth);
  const [source, setSource] = useState(() =>
    !effectiveLowBandwidth && !isProtectedMediaKey(asset.key) ? asset.key : "",
  );
  const [error, setError] = useState("");
  const [slowAttempt, setSlowAttempt] = useState(-1);
  const [renewal, setRenewal] = useState(0);
  const [captionUrl, setCaptionUrl] = useState("");
  const lastWatchReport = useRef(0);
  useEffect(() => {
    if (!mediaRequested) return;
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setError("");
      if (!isProtectedMediaKey(activeAsset.key)) {
        setSource(activeAsset.key);
        return;
      }
      setSource("");
      const response = await fetch("/api/media/playback", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${await accessToken()}`,
        },
        body: JSON.stringify({
          lessonId,
          assetId: activeAsset.id || undefined,
        }),
      });
      const result = (await response.json()) as {
        url?: string;
        error?: string;
      };
      if (!response.ok) {
        if (!cancelled)
          setError(result.error || "This media could not be loaded.");
        return;
      }
      if (!cancelled) setSource(result.url || "");
    })();
    return () => {
      cancelled = true;
    };
  }, [
    accessToken,
    activeAsset.id,
    activeAsset.key,
    lessonId,
    mediaRequested,
    renewal,
  ]);
  useEffect(() => {
    if (!mediaRequested || source || error) return;
    const timer = window.setTimeout(() => setSlowAttempt(renewal), 8_000);
    return () => window.clearTimeout(timer);
  }, [error, mediaRequested, renewal, source]);
  const slow = slowAttempt === renewal && !source && !error;
  useEffect(
    () => () => {
      if (captionUrl) URL.revokeObjectURL(captionUrl);
    },
    [captionUrl],
  );
  function playbackFailed() {
    if (isProtectedMediaKey(activeAsset.key) && renewal < 1) {
      setSource("");
      setRenewal(renewal + 1);
      return;
    }
    setError("This media could not be played.");
  }
  function prepareCaptions(event: SyntheticEvent<HTMLVideoElement>) {
    if (!transcript.trim() || captionUrl) return;
    const vtt = captionVtt(transcript, event.currentTarget.duration);
    if (vtt)
      setCaptionUrl(URL.createObjectURL(new Blob([vtt], { type: "text/vtt" })));
  }
  function finishVideo() {
    onWatch(100);
  }
  function reportVideoProgress(event: SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget;
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    const percent = Math.max(
      0,
      Math.min(100, Math.round((video.currentTime / video.duration) * 100)),
    );
    if (percent >= 100 || percent >= lastWatchReport.current + 5) {
      lastWatchReport.current = percent;
      onWatch(percent);
    }
  }
  if (!mediaRequested)
    return (
      <div
        className="low-bandwidth-media"
        role="region"
        aria-label="Lesson media paused to save data"
      >
        {" "}
        <div>
          <span>LOW-BANDWIDTH MODE</span>
          <h2>
            {activeAsset.kind === "image"
              ? "Image held back"
              : `${activeAsset.kind === "audio" ? "Audio" : "Video"} held back`}
          </h2>
          <p>
            The written lesson and transcript are ready. This media will use
            data only when you choose to load it.
          </p>
        </div>{" "}
        <button onClick={() => setMediaRequested(true)}>
          Load {activeAsset.kind} now
        </button>{" "}
      </div>
    );
  if (error)
    return (
      <div className="media-placeholder">
        <p>{error}</p>
      </div>
    );
  if (!source)
    return (
      <div className="media-placeholder media-loading-card" role="status" aria-live="polite">
        <span className="media-loading-orbit" aria-hidden="true"><i /></span>
        <div>
          <small>PROTECTED LESSON MEDIA</small>
          <h2>{slow ? "The recorded lesson is taking longer than expected." : "Preparing your recorded lesson"}</h2>
          <p>{slow
            ? "The lesson below is ready while secure playback reconnects."
            : "Authorising secure playback. You can begin with the lesson guide while this finishes."}</p>
          {slow && <button type="button" onClick={() => setRenewal((current) => current + 1)}>
            Try secure playback again
          </button>}
        </div>
      </div>
    );
  if (activeAsset.kind === "image") {
    return (
      <figure className="lesson-image">
        {" "}
        {/* eslint-disable-next-line @next/next/no-img-element */}{" "}
        <img
          src={source}
          alt={activeAsset.altText || activeAsset.filename}
          onError={playbackFailed}
        />{" "}
        {activeAsset.altText && (
          <figcaption>{activeAsset.altText}</figcaption>
        )}{" "}
      </figure>
    );
  }
  if (activeAsset.kind === "audio") {
    return (
      <div className="lesson-audio">
        {" "}
        <b>{activeAsset.filename}</b>{" "}
        <audio
          controls
          controlsList="nodownload"
          preload={effectiveLowBandwidth ? "none" : "metadata"}
          src={source}
          onError={playbackFailed}
        >
          {" "}
          Your browser does not support audio playback.{" "}
        </audio>{" "}
      </div>
    );
  }
  if (activeAsset.kind === "video") {
    return (
      <div className="lesson-video">
        {" "}
        <video
          controls
          controlsList="nodownload"
          disablePictureInPicture
          playsInline
          preload={effectiveLowBandwidth ? "none" : "metadata"}
          src={source}
          onLoadedMetadata={prepareCaptions}
          onTimeUpdate={reportVideoProgress}
          onEnded={finishVideo}
          onError={playbackFailed}
        >
          {" "}
          {captionUrl && (
            <track
              default
              kind="captions"
              src={captionUrl}
              srcLang="en"
              label="English"
            />
          )}{" "}
          Your browser does not support video playback.{" "}
        </video>{" "}
        {transcript.trim() && (
          <p className="lesson-caption-note">
            CC captions available - select captions in the video controls
          </p>
        )}{" "}
      </div>
    );
  }
  return null;
}
export default function Learn({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [school, setSchool] = useState<CourseSchool | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState("");
  const [quizFeedback, setQuizFeedback] = useState<QuizAnswerFeedback[]>([]);
  const [masteryImpact, setMasteryImpact] = useState<{
    weakConcepts: number;
    newConcepts: number;
    masteredConcepts: number;
  } | null>(null);
  const [resourceMessage, setResourceMessage] = useState("");
  const [learnerMessage, setLearnerMessage] = useState("");
  const [orientationDismissed, setOrientationDismissed] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [search, setSearch] = useState("");
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [celebration, setCelebration] = useState<{
    title: string;
    detail: string;
  } | null>(null);
  const activeLessonId = useRef("");
  const celebrationTimer = useRef<number | null>(null);
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") === "1";
  const showOrientation =
    !preview && searchParams.get("welcome") === "1" && !orientationDismissed;
  const supabase = getSupabaseBrowser();
  const shouldReduceMotion = useReducedMotion();
  const {
    enabled: lowBandwidthMode,
    ready: bandwidthReady,
    toggle: toggleLowBandwidth,
  } = useLowBandwidthMode();
  const effectiveLowBandwidth = preview ? false : lowBandwidthMode;
  const token = useCallback(async () => {
    return (
      (await supabase?.auth.getSession())?.data.session?.access_token || ""
    );
  }, [supabase]);
  useEffect(() => {
    params.then((value) => setId(value.courseId));
  }, [params]);
  useEffect(() => {
    activeLessonId.current = lessons[current]?.id || "";
  }, [current, lessons]);
  useEffect(
    () => () => {
      if (celebrationTimer.current)
        window.clearTimeout(celebrationTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (!id || !supabase || !bandwidthReady) return;
    (async () => {
      const accessToken = await token();
      if (!accessToken) {
        location.href = `/login?next=${encodeURIComponent(`/learn/${id}${preview ? "?preview=1" : ""}`)}`;
        return;
      }
      const compactQuery = effectiveLowBandwidth
        ? `?compact=1${activeLessonId.current ? `&lessonId=${encodeURIComponent(activeLessonId.current)}` : ""}`
        : "";
      const response = await fetch(`/api/learn/${id}${compactQuery}`, {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      const data = (await response.json()) as {
        error?: string;
        course?: {
          title: string;
          schoolId: string;
          schoolName: string;
          schoolSlug: string;
          schoolLogoUrl: string | null;
          schoolPrimaryColor: string;
          schoolAccentColor: string;
          showCommunity: number;
        };
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
      setSchool({
        id: data.course.schoolId,
        name: data.course.schoolName,
        slug: data.course.schoolSlug,
        logoUrl: data.course.schoolLogoUrl,
        primaryColor: data.course.schoolPrimaryColor,
        accentColor: data.course.schoolAccentColor,
        showCommunity: data.course.showCommunity,
      });
      setSections(data.sections || []);
      const loadedLessons = data.lessons || [];
      setLessons(loadedLessons);
      const previousLesson = loadedLessons.findIndex(
        (lesson) => lesson.id === activeLessonId.current && !lesson.locked,
      );
      const startingLesson = loadedLessons.findIndex(
        (lesson) => !lesson.locked && !lesson.completed,
      );
      const firstAvailable = loadedLessons.findIndex(
        (lesson) => !lesson.locked,
      );
      setCurrent(
        previousLesson >= 0
          ? previousLesson
          : startingLesson >= 0
            ? startingLesson
            : Math.max(0, firstAvailable),
      );
      setCertificate(data.certificate || null);
      setLoaded(true);
    })();
  }, [bandwidthReady, id, effectiveLowBandwidth, preview, supabase, token]);
  async function loadLessonDetail(lessonId: string) {
    if (!effectiveLowBandwidth) return true;
    setLearnerMessage("Loading this lesson's text and activities.");
    const response = await fetch(
      `/api/learn/${id}?compact=1&lessonId=${encodeURIComponent(lessonId)}`,
      { headers: { authorization: `Bearer ${await token()}` } },
    );
    const data = (await response.json()) as {
      lessons?: Lesson[];
      error?: string;
    };
    const detail = data.lessons?.find(
      (item) => item.id === lessonId && item.detailLoaded,
    );
    if (!response.ok || !detail) {
      setLearnerMessage(
        data.error ||
          "This lesson could not be loaded on the current connection.",
      );
      return false;
    }
    setLessons((currentLessons) =>
      currentLessons.map((item) =>
        item.id === lessonId ? { ...item, ...detail } : item,
      ),
    );
    setLearnerMessage("Text-first lesson ready. Media is still paused.");
    return true;
  }
  function continueToNext() {
    if (current < lessons.length - 1) void openLesson(current + 1);
  }
  async function openLesson(index: number) {
    if (!preview && lessons[index]?.locked) {
      setLearnerMessage(lessons[index].lockReason || "This lesson is locked.");
      return;
    }
    if (effectiveLowBandwidth && !lessons[index]?.detailLoaded) {
      const available = await loadLessonDetail(lessons[index].id);
      if (!available) return;
    }
    setCurrent(index);
    setAnswers([]);
    setQuizResult("");
    setQuizFeedback([]);
    setMasteryImpact(null);
    setResourceMessage("");
    setLearnerMessage(
      effectiveLowBandwidth
        ? "Text-first lesson ready. Media is still paused."
        : "",
    );
  }
  async function saveLearnerState(
    lessonId: string,
    patch: Partial<Pick<Lesson, "watchedPercent" | "notes" | "bookmarked">>,
    quiet = false,
  ) {
    if (preview) return;
    setLessons((currentLessons) =>
      currentLessons.map((item) =>
        item.id === lessonId ? { ...item, ...patch } : item,
      ),
    );
    if (!quiet) setLearnerMessage("Saving...");
    const response = await fetch("/api/learner-state", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({
        lessonId,
        watchedPercent: patch.watchedPercent,
        notes: patch.notes,
        bookmarked:
          patch.bookmarked === undefined
            ? undefined
            : Boolean(patch.bookmarked),
      }),
    });
    const result = (await response.json()) as {
      error?: string;
      watchedPercent?: number;
    };
    if (!response.ok) {
      setLearnerMessage(
        result.error || "Your learning notes could not be saved.",
      );
      return;
    }
    if (typeof result.watchedPercent === "number") {
      setLessons((currentLessons) =>
        currentLessons.map((item) =>
          item.id === lessonId
            ? {
                ...item,
                watchedPercent: Math.max(
                  item.watchedPercent,
                  result.watchedPercent!,
                ),
              }
            : item,
        ),
      );
    }
    if (!quiet) setLearnerMessage("Saved");
  }
  function recordWatch(percent: number) {
    const lesson = lessons[current];
    if (!lesson || preview || percent <= lesson.watchedPercent) return;
    void saveLearnerState(lesson.id, { watchedPercent: percent }, true);
  }
  function celebrateProgress(
    updatedLessons: Lesson[],
    courseCompleted = false,
  ) {
    const previousDone = lessons.filter((item) => item.completed).length;
    const nextDone = updatedLessons.filter((item) => item.completed).length;
    const total = Math.max(1, updatedLessons.length);
    const previousQuarter = Math.floor((previousDone / total) * 4);
    const nextQuarter = Math.floor((nextDone / total) * 4);
    const crossedMilestone = nextQuarter > previousQuarter;
    if (!courseCompleted && !crossedMilestone) return;
    const percentage = Math.min(100, Math.round((nextDone / total) * 100));
    setCelebration(
      courseCompleted
        ? {
            title: "Course complete",
            detail: "You finished the journey. Your certificate is ready.",
          }
        : {
            title: `${percentage}% complete`,
            detail: "A real milestone. Keep the momentum going.",
          },
    );
    if (celebrationTimer.current) window.clearTimeout(celebrationTimer.current);
    celebrationTimer.current = window.setTimeout(
      () => setCelebration(null),
      courseCompleted ? 6500 : 4200,
    );
    if (effectiveLowBandwidth || shouldReduceMotion) return;
    void confetti({
      particleCount: courseCompleted ? 90 : 34,
      spread: courseCompleted ? 82 : 48,
      startVelocity: courseCompleted ? 36 : 24,
      gravity: 0.9,
      ticks: courseCompleted ? 220 : 140,
      origin: { x: 0.72, y: 0.78 },
      colors: [
        school?.primaryColor || "#3556d8",
        school?.accentColor || "#ffbd8a",
        "#171724",
      ],
      shapes: ["star", "circle"],
      disableForReducedMotion: true,
      useWorker: true,
    });
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
    const result = (await response.json()) as {
      error?: string;
      certificateCode?: string;
    };
    if (!response.ok) {
      setQuizResult(result.error || "Progress could not be saved.");
      return;
    }
    const updatedLessons = lessons.map((item, index) => {
      if (item.id === lesson.id) return { ...item, completed: 1 };
      if (
        index === current + 1 &&
        item.locked &&
        item.lockReason === "Complete the earlier lessons first"
      ) {
        return { ...item, locked: false, lockReason: null };
      }
      return item;
    });
    setLessons(updatedLessons);
    celebrateProgress(updatedLessons, Boolean(result.certificateCode));
    if (result.certificateCode) {
      setCertificate({
        code: result.certificateCode,
        issuedAt: 0,
        status: "active",
        expiresAt: null,
      });
    }
    if (
      current < updatedLessons.length - 1 &&
      !updatedLessons[current + 1].locked
    ) {
      if (effectiveLowBandwidth && !updatedLessons[current + 1].detailLoaded) {
        const available = await loadLessonDetail(
          updatedLessons[current + 1].id,
        );
        if (!available) return;
      }
      setCurrent(current + 1);
      setAnswers([]);
      setQuizResult("");
      setQuizFeedback([]);
      setLearnerMessage(
        effectiveLowBandwidth
          ? "Text-first lesson ready. Media is still paused."
          : "",
      );
    }
  }
  async function submitQuiz() {
    if (preview) return;
    const lesson = lessons[current];
    if (!lesson.quiz) return;
    if (
      lesson.quiz.questions.some(
        (_, index) => !Number.isInteger(answers[index]),
      )
    ) {
      setQuizResult("Choose an answer for every question.");
      return;
    }
    setQuizFeedback([]);
    setQuizResult("Checking your answers.");
    const response = await fetch(`/api/quizzes/${lesson.id}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ answers }),
    });
    const result = (await response.json()) as {
      error?: string;
      score?: number;
      passed?: boolean;
      passingScore?: number;
      certificateCode?: string;
      attemptCount?: number;
      bestScore?: number;
      attemptsRemaining?: number | null;
      feedback?: QuizAnswerFeedback[];
      mastery?: {
        weakConcepts: number;
        newConcepts: number;
        masteredConcepts: number;
      };
    };
    if (!response.ok) {
      setQuizResult(result.error || "The quiz could not be submitted.");
      return;
    }
    setQuizFeedback(result.feedback || []);
    setMasteryImpact(result.mastery || null);
    const updatedLessons = lessons.map((item, index) => {
      if (item.id === lesson.id) {
        return {
          ...item,
          completed: result.passed ? 1 : item.completed,
          quiz: item.quiz
            ? {
                ...item.quiz,
                passed: Boolean(result.passed) || item.quiz.passed,
                attemptCount: Number(
                  result.attemptCount ?? item.quiz.attemptCount,
                ),
                bestScore: Number(result.bestScore ?? item.quiz.bestScore ?? 0),
                attemptsRemaining:
                  result.attemptsRemaining ?? item.quiz.attemptsRemaining,
              }
            : item.quiz,
        };
      }
      if (
        result.passed &&
        index === current + 1 &&
        item.locked &&
        item.lockReason === "Complete the earlier lessons first"
      ) {
        return { ...item, locked: false, lockReason: null };
      }
      return item;
    });
    setLessons(updatedLessons);
    if (result.passed) {
      celebrateProgress(updatedLessons, Boolean(result.certificateCode));
      setQuizResult(`Passed with ${result.score}%. This lesson is complete.`);
      if (result.certificateCode) {
        setCertificate({
          code: result.certificateCode,
          issuedAt: 0,
          status: "active",
          expiresAt: null,
        });
      }
    } else {
      const attempts =
        result.attemptsRemaining === null
          ? ""
          : result.attemptsRemaining === 0
            ? " No attempts remain."
            : ` ${result.attemptsRemaining} attempt${result.attemptsRemaining === 1 ? "" : "s"} remain.`;
      setQuizResult(
        `You scored ${result.score}%. You need ${result.passingScore}% to pass.${attempts}`,
      );
    }
  }
  function retryQuiz() {
    setAnswers([]);
    setQuizFeedback([]);
    setQuizResult("");
    setMasteryImpact(null);
    document
      .querySelector<HTMLElement>(".learner-quiz")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function reviewLesson() {
    document
      .querySelector<HTMLElement>(".lesson-brief")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  async function downloadResource(resource: Resource) {
    setResourceMessage(`Preparing ${resource.filename}.`);
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
    return (
      <main className="system-loading">
        <div>
          {" "}
          <b>Access needed</b>
          <p>{error}</p>{" "}
          <Link className="sys-primary" href={`/courses/${id}`}>
            View course
          </Link>{" "}
        </div>
      </main>
    );
  }
  if (!loaded)
    return (
      <main className="system-loading">
        <p>Preparing your course.</p>
      </main>
    );
  if (!lessons.length)
    return (
      <main className="system-loading">
        <div>
          {" "}
          <b>This course has no lessons yet.</b>{" "}
          <p>
            {preview
              ? "Return to the editor and add the first lesson."
              : "The creator is still preparing the curriculum."}
          </p>{" "}
          {preview && (
            <Link className="sys-primary" href={`/dashboard/courses/${id}`}>
              Return to editor
            </Link>
          )}{" "}
        </div>
      </main>
    );
  const done = lessons.filter((lesson) => lesson.completed).length;
  const progress = Math.round((done / lessons.length) * 100);
  const lesson = lessons[current];
  const currentSection = sections.find(
    (section) => section.id === lesson.sectionId,
  );
  const lessonGuide = getLessonGuide(lesson.content);
  const hasRecordedMedia = ["video", "audio"].includes(lesson.primaryAsset?.kind || "");
  const normalizedSearch = search.trim().toLowerCase();
  const watchRequirementMet =
    lesson.requiredWatchPercent <= lesson.watchedPercent;
  const completionRequirement = lesson.quiz
    ? `Pass the knowledge check at ${lesson.quiz.passingScore}% or higher`
    : lesson.requiredWatchPercent > 0
      ? `Watch at least ${lesson.requiredWatchPercent}% of the video`
      : "Read the lesson and mark it complete";
  const lessonFormat = lesson.quiz
    ? "Knowledge check"
    : lesson.experience && lesson.primaryAsset?.kind === "video"
      ? "Narrated video + interactive lab"
      : lesson.experience
        ? "Interactive experience"
        : lesson.primaryAsset?.kind === "video"
          ? "Video + guided notes"
          : "Guided lesson";
  const schoolStyle = school
    ? ({
        "--blue": school.primaryColor,
        "--acid": school.accentColor,
      } as CSSProperties)
    : undefined;
  function beginLearning() {
    setOrientationDismissed(true);
    history.replaceState({}, "", `/learn/${id}`);
    document
      .querySelector<HTMLElement>(".learn-layout > section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function startCourseTour() {
    setOrientationDismissed(true);
    history.replaceState({}, "", `/learn/${id}`);
    window.requestAnimationFrame(() => {
      const courseTour = driver({
        animate: !shouldReduceMotion,
        allowClose: true,
        showProgress: true,
        nextBtnText: "Next",
        prevBtnText: "Back",
        doneBtnText: "Start learning",
        progressText: "Step {{current}} of {{total}}",
        popoverClass: "northstar-course-tour",
        steps: [
          {
            element: "[data-tour='course-progress']",
            popover: {
              title: "Your progress at a glance",
              description:
                "Northstar saves each completed lesson and always brings you back to the next useful step.",
              side: "bottom",
              align: "center",
            },
          },
          {
            element: "[data-tour='curriculum']",
            popover: {
              title: "The whole learning journey",
              description:
                "Open any available lesson, see what is complete, and search this course without leaving it.",
              side: "right",
              align: "start",
            },
          },
          {
            element: "[data-tour='lesson']",
            popover: {
              title: "One focused lesson at a time",
              description:
                "The outcome, estimated time, media, notes, resources, and knowledge check stay together here.",
              side: "left",
              align: "start",
            },
          },
          {
            element: "[data-tour='lesson-help']",
            popover: {
              title: "Human help is built in",
              description:
                "Ask for a simpler explanation or send the educator a question with the exact lesson context attached.",
              side: "top",
              align: "start",
            },
          },
          {
            element: "[data-tour='completion']",
            popover: {
              title: "Finish with evidence",
              description:
                "Complete the required activity to unlock the next step and work toward a verifiable certificate.",
              side: "top",
              align: "end",
            },
          },
        ],
      });
      courseTour.drive();
    });
  }
  return (
    <main
      className={`learn-page${focusMode ? " focus-mode" : ""}${effectiveLowBandwidth ? " low-bandwidth" : ""}`}
      style={schoolStyle}
    >
      {" "}
      <header>
        {" "}
        <Link
          className="learner-school-brand"
          href={school ? `/schools/${school.slug}` : "/"}
        >
          {" "}
          {school?.logoUrl && !effectiveLowBandwidth ? (
            <>
              {" "}
              {/* eslint-disable-next-line @next/next/no-img-element */}{" "}
              <img src={school.logoUrl} alt="" />{" "}
            </>
          ) : (
            <i>{(school?.name || "NorthstarLabs").slice(0, 2).toUpperCase()}</i>
          )}{" "}
          <b>{school?.name || "NorthstarLabs"}</b>{" "}
        </Link>{" "}
        {preview ? (
          <div className="preview-mode-label">
            Creator preview - progress is disabled
          </div>
        ) : (
          <div data-tour="course-progress">
            <span>{progress}% complete</span>
            <i>
              <b style={{ width: `${progress}%` }} />
            </i>
          </div>
        )}{" "}
        {!preview && (
          <button
            className={`bandwidth-toggle ${effectiveLowBandwidth ? "active" : ""}`}
            aria-pressed={effectiveLowBandwidth}
            title="Reduce course data use on this device"
            onClick={toggleLowBandwidth}
          >
            <span>
              {effectiveLowBandwidth ? "Data saver on" : "Data saver off"}
            </span>
            <small>
              {effectiveLowBandwidth ? "Text first" : "Standard media"}
            </small>
          </button>
        )}{" "}
        {preview ? (
          <Link href={`/dashboard/courses/${id}`}>Exit preview</Link>
        ) : (
          <div className="learner-course-links">
            {" "}
            <button type="button" onClick={startCourseTour}>
              Course tour
            </button>{" "}
            <button
              aria-pressed={focusMode}
              onClick={() => setFocusMode((currentMode) => !currentMode)}
            >
              {" "}
              {focusMode ? "Show curriculum" : "Focus mode"}{" "}
            </button>{" "}
            {school?.showCommunity && (
              <Link href={`/schools/${school.slug}/community`}>Community</Link>
            )}{" "}
            <Link href="/learn">My learning</Link>{" "}
          </div>
        )}{" "}
      </header>{" "}
      {!preview && effectiveLowBandwidth && (
        <div className="bandwidth-notice" role="status">
          <b>Low-bandwidth mode is on.</b>
          <span>
            Only the open lesson&apos;s text and activities are transferred.
            Images, audio, and video wait for your permission.
          </span>
          <button onClick={toggleLowBandwidth}>Use standard mode</button>
        </div>
      )}{" "}
      {showOrientation && (
        <section
          className="first-lesson-welcome"
          aria-labelledby="first-lesson-title"
        >
          {" "}
          <div>
            {" "}
            <p className="sys-kicker">YOU ARE ENROLLED</p>{" "}
            <h2 id="first-lesson-title">Welcome to {title}.</h2>{" "}
            <p>
              Your first lesson is open below. Progress saves automatically, so
              you can stop and return at any time.
            </p>{" "}
          </div>{" "}
          <ol>
            {" "}
            <li>
              <span>01</span>
              <b>Start the lesson already open</b>
            </li>{" "}
            <li>
              <span>02</span>
              <b>Complete each required activity</b>
            </li>{" "}
            <li>
              <span>03</span>
              <b>Earn your verifiable certificate</b>
            </li>{" "}
          </ol>{" "}
          <div className="first-lesson-actions">
            {" "}
            <button type="button" onClick={startCourseTour}>
              Show me around
            </button>{" "}
            <button className="sys-primary" onClick={beginLearning}>
              Start my first lesson &rarr;
            </button>{" "}
          </div>{" "}
        </section>
      )}{" "}
      {celebration && (
        <aside
          className="learning-celebration"
          role="status"
          aria-live="polite"
        >
          {" "}
          <span aria-hidden="true">&#9733;</span>{" "}
          <div>
            <b>{celebration.title}</b>
            <small>{celebration.detail}</small>
          </div>{" "}
          <button
            type="button"
            aria-label="Dismiss progress celebration"
            onClick={() => setCelebration(null)}
          >
            &times;
          </button>{" "}
        </aside>
      )}{" "}
      {!preview && certificate?.status === "active" && (
        <div className="certificate-ready">
          {" "}
          <div>
            <b>Course completed</b>
            <span>Your verified NorthstarLabs certificate is ready.</span>
          </div>{" "}
          <div>
            <Link href={`/certificates/${certificate.code}`}>
              View certificate
            </Link>
            <a href={`/api/certificates/${certificate.code}/pdf`}>
              Download PDF
            </a>
          </div>{" "}
        </div>
      )}{" "}
      <div className="learn-layout">
        {" "}
        <aside data-tour="curriculum">
          {" "}
          <p className="sys-kicker">{title}</p> <h2>Your curriculum</h2>{" "}
          <label className="course-search">
            {" "}
            <span>Search this course</span>{" "}
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                effectiveLowBandwidth
                  ? "Find a lesson by title"
                  : "Find a lesson or topic"
              }
            />{" "}
          </label>{" "}
          <div className="learner-saved-summary">
            {" "}
            <span>
              Saved lessons:{" "}
              {lessons.filter((item) => item.bookmarked).length}
            </span>{" "}
            <span>
              {done}/{lessons.length} complete
            </span>{" "}
          </div>{" "}
          {(sections.length
            ? sections
            : [{ id: "all", title: "Course content", position: 0 }]
          ).map((section) => {
            const sectionLessons = (
              sections.length
                ? lessons.filter((item) => item.sectionId === section.id)
                : lessons
            ).filter(
              (item) =>
                !normalizedSearch ||
                `${item.title}${effectiveLowBandwidth ? "" : ` ${item.content} ${item.transcript}`}`
                  .toLowerCase()
                  .includes(normalizedSearch),
            );
            if (!sectionLessons.length) return null;
            return (
              <div className="learner-section" key={section.id}>
                {" "}
                <h3>{section.title}</h3>{" "}
                {sectionLessons.map((item) => {
                  const index = lessons.findIndex(
                    (candidate) => candidate.id === item.id,
                  );
                  return (
                    <button
                      key={item.id}
                      className={`${index === current ? "active" : item.completed ? "done" : ""}${item.locked && !preview ? " locked" : ""}`}
                      disabled={item.locked && !preview}
                      title={item.lockReason || undefined}
                      onClick={() => void openLesson(index)}
                    >
                      {" "}
                      <span>
                        {item.locked && !preview
                          ? "\u{1F512}"
                          : item.completed && !preview
                            ? "\u2713"
                            : index + 1}
                      </span>{" "}
                      <span className="lesson-nav-title">
                        {" "}
                        {item.title}{" "}
                        <small>
                          {item.lockReason ||
                            (item.durationMinutes
                              ? `${item.durationMinutes} min`
                              : item.quiz
                                ? "Quiz required"
                                : item.lessonType)}
                        </small>{" "}
                      </span>{" "}
                    </button>
                  );
                })}{" "}
              </div>
            );
          })}{" "}
          {learnerMessage && (
            <p className="learner-state-message" role="status">
              {learnerMessage}
            </p>
          )}{" "}
        </aside>{" "}
        <LazyMotion features={domAnimation}>
          {" "}
          <m.section
            key={lesson.id}
            data-tour="lesson"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.22,
              ease: "easeOut",
            }}
          >
            {" "}
            {lesson.locked && !preview ? (
              <div className="lesson-locked-panel">
                {" "}
                <span aria-hidden="true">&#128274;</span>{" "}
                <p className="sys-kicker">LESSON LOCKED</p>{" "}
                <h1>{lesson.title}</h1> <p>{lesson.lockReason}</p>{" "}
                <button
                  onClick={() => void openLesson(Math.max(0, current - 1))}
                >
                  Return to the previous lesson
                </button>{" "}
              </div>
            ) : (
              <>
                {" "}
                {lesson.primaryAsset ? (
                  <MediaViewer
                    key={`${lesson.id}:${lesson.primaryAsset.key}:${effectiveLowBandwidth ? "low" : "standard"}`}
                    asset={lesson.primaryAsset}
                    transcript={lesson.transcript}
                    lessonId={lesson.id}
                    accessToken={token}
                    onWatch={recordWatch}
                    effectiveLowBandwidth={effectiveLowBandwidth}
                  />
                ) : (
                  <div className="lesson-banner">
                    {(school?.name || "NorthstarLabs").toUpperCase()} -{" "}
                    {lesson.lessonType.toUpperCase()} LESSON
                  </div>
                )}{" "}
                <p className="sys-kicker">
                  LESSON {current + 1} OF {lessons.length}
                  {lesson.durationMinutes
                    ? ` - ${lesson.durationMinutes} MIN`
                    : ""}
                </p>{" "}
                <h1>{lesson.title}</h1>{" "}
                <section className="lesson-brief" aria-label="Lesson guide">
                  {" "}
                  <div className="lesson-brief-meta">
                    {" "}
                    <span>
                      <small>MODULE</small>
                      <b>{currentSection?.title || "Course content"}</b>
                    </span>{" "}
                    <span>
                      <small>FORMAT</small>
                      <b>{lessonFormat}</b>
                    </span>{" "}
                    <span>
                      <small>TIME</small>
                      <b>
                        {lesson.durationMinutes
                          ? `About ${lesson.durationMinutes} minutes`
                          : "Self-paced"}
                      </b>
                    </span>{" "}
                    <span>
                      <small>TO FINISH</small>
                      <b>{completionRequirement}</b>
                    </span>{" "}
                  </div>{" "}
                  {(lessonGuide.outcome || lessonGuide.outline.length > 0) && (
                    <div className="lesson-brief-body">
                      {" "}
                      {lessonGuide.outcome && (
                        <div>
                          {" "}
                          <p className="sys-kicker">YOUR OUTCOME</p>{" "}
                          <p>{lessonGuide.outcome}</p>{" "}
                        </div>
                      )}{" "}
                      {lessonGuide.outline.length > 0 && (
                        <aside>
                          {" "}
                          <small>IN THIS LESSON</small>{" "}
                          <ol>
                            {lessonGuide.outline.map((item, index) => (
                              <li key={`${item}-${index}`}>{item}</li>
                            ))}
                          </ol>{" "}
                        </aside>
                      )}{" "}
                    </div>
                  )}{" "}
                </section>{" "}
                {!preview && lesson.requiredWatchPercent > 0 && (
                  <div
                    className={`watch-requirement ${watchRequirementMet ? "met" : ""}`}
                  >
                    {" "}
                    <div>
                      <b>
                        {watchRequirementMet
                          ? "Video requirement complete"
                          : `Watch ${lesson.requiredWatchPercent}% to complete`}
                      </b>
                      <span>{lesson.watchedPercent}% watched</span>
                    </div>{" "}
                    <i>
                      <b
                        style={{
                          width: `${Math.min(100, lesson.watchedPercent)}%`,
                        }}
                      />
                    </i>{" "}
                  </div>
                )}{" "}
                {lesson.experience && (
                  <InteractiveLessonExperience
                    experience={lesson.experience}
                    allowBrowserNarration={!hasRecordedMedia}
                  />
                )}{" "}
                {lesson.content ? (
                  lesson.experience ? (
                    <details className="lesson-reference-notes">
                      {" "}
                      <summary>
                        Open the source-backed reference notes
                      </summary>{" "}
                      <LessonContent
                        content={lesson.content}
                        omitLessonIntro
                        lessonTitle={lesson.title}
                        slideDeckMode
                      />{" "}
                    </details>
                  ) : (
                    <LessonContent
                      content={lesson.content}
                      omitLessonIntro
                      lessonTitle={lesson.title}
                      slideDeckMode
                    />
                  )
                ) : (
                  <p className="lesson-empty-copy">
                    Your creator is still adding the written guidance for this
                    lesson.
                  </p>
                )}{" "}
                {!hasRecordedMedia && (
                  <LessonTranscriptNarrator
                    transcript={lesson.transcript}
                    lessonContent={lesson.content}
                    lessonTitle={lesson.title}
                  />
                )}{" "}
                {!preview && (
                  <ContextualLessonHelp
                    key={lesson.id}
                    lessonId={lesson.id}
                    lessonTitle={lesson.title}
                    courseTitle={title}
                    accessToken={token}
                    onSaveToNotes={async (text) => {
                      const nextNotes = [lesson.notes.trim(), text.trim()]
                        .filter(Boolean)
                        .join("\n\n")
                        .slice(0, 10_000);
                      await saveLearnerState(lesson.id, { notes: nextNotes });
                    }}
                  />
                )}{" "}
                {lesson.transcript && (
                  <details className="lesson-transcript">
                    {" "}
                    <summary>Read captions / transcript</summary>{" "}
                    <div>
                      {lesson.transcript
                        .split(/\n{2,}/)
                        .map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                    </div>{" "}
                  </details>
                )}{" "}
                {!!lesson.resources?.length && (
                  <section className="lesson-resources">
                    {" "}
                    <div>
                      <p className="sys-kicker">LESSON RESOURCES</p>
                      <h2>Files to keep and use</h2>
                    </div>{" "}
                    <div>
                      {" "}
                      {lesson.resources.map((resource) => (
                        <button
                          key={resource.id}
                          onClick={() => downloadResource(resource)}
                        >
                          {" "}
                          <span>
                            {resource.kind === "document"
                              ? "DOC"
                              : resource.kind.toUpperCase()}
                          </span>{" "}
                          <div>
                            <b>{resource.title || resource.filename}</b>
                            <small>{formatBytes(resource.sizeBytes)}</small>
                          </div>{" "}
                          <strong>Download &rarr;</strong>{" "}
                        </button>
                      ))}{" "}
                    </div>{" "}
                    {resourceMessage && (
                      <p className="resource-message" role="status">
                        {resourceMessage}
                      </p>
                    )}{" "}
                  </section>
                )}{" "}
                {lesson.quiz && (
                  <section className="learner-quiz" data-tour="completion">
                    {" "}
                    <div>
                      {" "}
                      <p className="sys-kicker">KNOWLEDGE CHECK</p>{" "}
                      <h2>{lesson.quiz.title}</h2>{" "}
                      <span>
                        {preview
                          ? "Preview of the learner quiz."
                          : `Score ${lesson.quiz.passingScore}% or higher to complete this lesson.`}
                      </span>{" "}
                      {!preview && (
                        <div className="quiz-attempt-summary">
                          {" "}
                          <span>
                            Attempts: {lesson.quiz.attemptCount}
                            {lesson.quiz.maxAttempts
                              ? `/${lesson.quiz.maxAttempts}`
                              : " - unlimited"}
                          </span>{" "}
                          {lesson.quiz.bestScore !== null && (
                            <span>Best score: {lesson.quiz.bestScore}%</span>
                          )}{" "}
                        </div>
                      )}{" "}
                    </div>{" "}
                    {lesson.quiz.questions.map((question, questionIndex) => {
                      const feedback = quizFeedback.find(
                        (item) => item.questionId === question.id,
                      );
                      return (
                        <fieldset
                          className={
                            feedback
                              ? feedback.correct
                                ? "answered-correctly"
                                : "answered-incorrectly"
                              : ""
                          }
                          key={question.id}
                        >
                          {" "}
                          <legend>
                            {questionIndex + 1}. {question.prompt}
                          </legend>{" "}
                          {question.options.map((option, optionIndex) => (
                            <label key={optionIndex}>
                              {" "}
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                disabled={
                                  !preview &&
                                  (quizFeedback.length > 0 ||
                                    (lesson.quiz?.attemptsRemaining === 0 &&
                                      !lesson.completed))
                                }
                                checked={answers[questionIndex] === optionIndex}
                                onChange={() => {
                                  const next = [...answers];
                                  next[questionIndex] = optionIndex;
                                  setAnswers(next);
                                }}
                              />{" "}
                              <span>{option}</span>{" "}
                            </label>
                          ))}{" "}
                          {feedback && (
                            <div
                              className={`quiz-answer-feedback ${feedback.correct ? "correct" : "incorrect"}`}
                            >
                              {" "}
                              <b>
                                {feedback.correct ? "Correct" : "Not yet"}
                              </b>{" "}
                              {!feedback.correct && (
                                <span>
                                  Correct answer: {feedback.correctAnswer}
                                </span>
                              )}{" "}
                              <p>{feedback.explanation}</p>{" "}
                            </div>
                          )}{" "}
                        </fieldset>
                      );
                    })}{" "}
                    {quizResult && (
                      <p className="quiz-result" role="status">
                        {quizResult}
                      </p>
                    )}{" "}
                    {masteryImpact &&
                      (masteryImpact.weakConcepts > 0 ||
                        masteryImpact.masteredConcepts > 0) && (
                        <div className="quiz-mastery-callout">
                          {" "}
                          <div>
                            {" "}
                            <p className="sys-kicker">
                              PERSONAL MASTERY LOOP
                            </p>{" "}
                            <b>
                              {masteryImpact.weakConcepts > 0
                                ? `${masteryImpact.weakConcepts} concept${masteryImpact.weakConcepts === 1 ? "" : "s"} saved for focused review.`
                                : `${masteryImpact.masteredConcepts} concept${masteryImpact.masteredConcepts === 1 ? "" : "s"} moved to mastered.`}
                            </b>{" "}
                            <span>
                              Your mistakes are not lost inside a percentage.
                              Northstar will bring each weak concept back until
                              you can answer it correctly twice.
                            </span>{" "}
                          </div>{" "}
                          <Link
                            href={`/mastery?courseId=${encodeURIComponent(id)}`}
                          >
                            Open my mastery loop &rarr;
                          </Link>{" "}
                        </div>
                      )}{" "}
                    {preview ? (
                      <div className="preview-completion-note">
                        Quiz submission is disabled in creator preview.
                      </div>
                    ) : lesson.completed ? (
                      <button className="sys-primary" onClick={continueToNext}>
                        {" "}
                        {current === lessons.length - 1
                          ? "Lesson complete"
                          : "Continue to next lesson \u2192"}{" "}
                      </button>
                    ) : quizFeedback.length > 0 ? (
                      <div className="quiz-retry-actions">
                        {" "}
                        <button type="button" onClick={reviewLesson}>
                          Review lesson
                        </button>{" "}
                        <button
                          className="sys-primary"
                          type="button"
                          disabled={lesson.quiz.attemptsRemaining === 0}
                          onClick={retryQuiz}
                        >
                          {" "}
                          {lesson.quiz.attemptsRemaining === 0
                            ? "No attempts remaining"
                            : "Try again"}{" "}
                        </button>{" "}
                      </div>
                    ) : (
                      <button
                        className="sys-primary"
                        disabled={lesson.quiz.attemptsRemaining === 0}
                        onClick={submitQuiz}
                      >
                        {" "}
                        {lesson.quiz.attemptsRemaining === 0
                          ? "No attempts remaining"
                          : "Submit quiz"}{" "}
                      </button>
                    )}{" "}
                  </section>
                )}{" "}
                {!preview && (
                  <section className="learner-tools">
                    {" "}
                    <div>
                      {" "}
                      <p className="sys-kicker">YOUR LEARNING SPACE</p>{" "}
                      <h2>Save this lesson and keep private notes.</h2>{" "}
                    </div>{" "}
                    <button
                      className={lesson.bookmarked ? "saved" : ""}
                      onClick={() =>
                        void saveLearnerState(lesson.id, {
                          bookmarked: lesson.bookmarked ? 0 : 1,
                        })
                      }
                    >
                      {" "}
                      {lesson.bookmarked ? "Saved" : "Save lesson"}{" "}
                    </button>{" "}
                    <label>
                      Private notes{" "}
                      <textarea
                        maxLength={10_000}
                        value={lesson.notes || ""}
                        onChange={(event) =>
                          setLessons((currentLessons) =>
                            currentLessons.map((item) =>
                              item.id === lesson.id
                                ? { ...item, notes: event.target.value }
                                : item,
                            ),
                          )
                        }
                        placeholder="Capture a takeaway, question, or action for later."
                      />{" "}
                    </label>{" "}
                    <div>
                      <span>
                        {lesson.notes.length.toLocaleString()} / 10,000
                      </span>
                      <button
                        onClick={() =>
                          void saveLearnerState(lesson.id, {
                            notes: lesson.notes,
                          })
                        }
                      >
                        Save notes
                      </button>
                    </div>{" "}
                  </section>
                )}{" "}
                {!lesson.quiz && (
                  <div className="lesson-actions" data-tour="completion">
                    {" "}
                    <button
                      disabled={current === 0}
                      onClick={() => void openLesson(current - 1)}
                    >
                      &larr; Previous
                    </button>{" "}
                    {preview ? (
                      <span className="preview-completion-note">
                        Completion is disabled in preview.
                      </span>
                    ) : (
                      <button
                        className="sys-primary"
                        disabled={!watchRequirementMet}
                        onClick={completeLesson}
                      >
                        {" "}
                        {lesson.completed
                          ? current === lessons.length - 1
                            ? "Lesson completed"
                            : "Completed - continue \u2192"
                          : watchRequirementMet
                            ? "Complete & continue \u2192"
                            : `Watch ${lesson.requiredWatchPercent}% first`}{" "}
                      </button>
                    )}{" "}
                  </div>
                )}{" "}
              </>
            )}{" "}
          </m.section>{" "}
        </LazyMotion>{" "}
      </div>{" "}
    </main>
  );
}
