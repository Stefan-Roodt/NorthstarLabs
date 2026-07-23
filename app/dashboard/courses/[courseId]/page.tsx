"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCourseReadiness, type CourseReadinessIssue } from "../../../../lib/course-readiness";
import { LessonContent } from "../../../../lib/lesson-content";
import { getSupabaseBrowser } from "../../../../lib/supabase-client";

type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptLabel: string;
};
type Quiz = {
  id?: string;
  title: string;
  passingScore: number;
  maxAttempts: number;
  questions: QuizQuestion[];
};
type Asset = {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  kind: string;
  altText: string;
  createdAt: number;
  updatedAt: number;
};
type Resource = {
  id: string;
  assetId: string;
  title: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  kind: string;
  position: number;
};
type Lesson = {
  id: string;
  sectionId: string;
  title: string;
  lessonType: string;
  content: string;
  contentFormat: string;
  videoKey?: string;
  primaryAssetId?: string | null;
  primaryAsset?: Asset | null;
  introAssetId?: string | null;
  introAsset?: Asset | null;
  durationMinutes: number;
  isPreview: number | boolean;
  availableAfterDays: number;
  requiredWatchPercent: number;
  transcript: string;
  position: number;
  updatedAt: number;
  resources: Resource[];
  quiz?: Quiz | null;
};
type Section = {
  id: string;
  title: string;
  position: number;
  createdAt: number;
};
type Course = {
  id: string;
  schoolId: string;
  schoolName: string;
  schoolSlug: string;
  title: string;
  description: string;
  status: string;
  priceCents: number;
  truthOutcome: string;
  truthAudience: string;
  truthNotFor: string;
  truthPrerequisites: string;
  truthEvidence: string;
  truthSourceStandard: string;
  truthLevel: string;
  truthDelivery: string;
  truthReviewedAt: number | null;
  enforceLessonOrder: number | boolean;
  availableFrom: number | null;
  certificateTitle: string;
  certificateAccent: string;
  certificateValidDays: number;
  pendingSourceFiles?: number;
  importProjectId?: string | null;
  importProjectTitle?: string | null;
  sections: Section[];
  lessons: Lesson[];
  media: Asset[];
};

const CURRICULUM_SECTION_BATCH = 20;

const blankQuestion = (): QuizQuestion => ({
  id: crypto.randomUUID(),
  prompt: "",
  options: ["", ""],
  correctIndex: 0,
  explanation: "",
  conceptLabel: "",
});

function isBlankNewLesson(lesson: Lesson) {
  return !lesson.updatedAt &&
    lesson.lessonType !== "quiz" &&
    lesson.title.trim().toLowerCase() === "untitled lesson" &&
    !lesson.content.trim() &&
    !lesson.transcript.trim() &&
    !lesson.videoKey?.trim() &&
    !lesson.primaryAssetId &&
    !lesson.introAssetId &&
    lesson.resources.length === 0;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(bytes > 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

function assetIcon(kind: string) {
  if (kind === "video") return "VID";
  if (kind === "audio") return "AUD";
  if (kind === "image") return "IMG";
  if (kind === "archive") return "ZIP";
  return "DOC";
}

function dateTimeInputValue(timestamp: number | null) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function dateInputValue(timestamp: number | null) {
  return timestamp ? new Date(timestamp).toISOString().slice(0, 10) : "";
}

function supportedRecorderType(candidates: string[]) {
  if (typeof MediaRecorder === "undefined") return "";
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function safeMediaFilename(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9 -]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 80) || "northstar-lesson";
}

function wrapCanvasText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

function drawCinematicFrame(
  context: CanvasRenderingContext2D,
  progress: number,
  courseTitle: string,
  lessonTitle: string,
  lessonNumber: number,
) {
  const { width, height } = context.canvas;
  context.clearRect(0, 0, width, height);
  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#11121c");
  background.addColorStop(0.58, "#1b1d31");
  background.addColorStop(1, "#273c9f");
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  const ease = 1 - Math.pow(1 - Math.min(progress * 1.8, 1), 3);
  const outro = Math.max(0, (progress - 0.82) / 0.18);
  context.globalAlpha = 1 - outro * 0.28;
  context.fillStyle = "#d8ff57";
  context.beginPath();
  context.arc(width * (0.82 + 0.06 * Math.sin(progress * Math.PI * 2)), height * 0.2, 95 + progress * 45, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "rgba(255,255,255,.16)";
  context.lineWidth = 2;
  for (let index = 0; index < 4; index += 1) {
    context.beginPath();
    context.arc(width * 0.86, height * 0.18, 150 + index * 64 + progress * 30, 0, Math.PI * 2);
    context.stroke();
  }

  const left = 92;
  context.save();
  context.translate(left - (1 - ease) * 90, 0);
  context.globalAlpha = ease * (1 - outro * 0.18);
  context.fillStyle = "#d8ff57";
  context.font = "700 22px Arial, sans-serif";
  context.letterSpacing = "3px";
  context.fillText(`NORTHSTARLABS  .  ${courseTitle.toUpperCase().slice(0, 52)}`, 0, 108);
  context.letterSpacing = "0px";

  context.fillStyle = "#ffffff";
  context.font = "700 72px Arial, sans-serif";
  const titleLines = wrapCanvasText(context, lessonTitle, width - left * 2);
  titleLines.forEach((line, index) => context.fillText(line, 0, 235 + index * 78));

  const footerY = Math.min(610, 275 + titleLines.length * 78);
  context.fillStyle = "rgba(255,255,255,.72)";
  context.font = "600 24px Arial, sans-serif";
  context.fillText(`LESSON ${String(lessonNumber).padStart(2, "0")}  .  LEARN WITH PURPOSE`, 0, footerY);
  context.restore();

  context.globalAlpha = 1;
  context.fillStyle = "rgba(255,255,255,.2)";
  context.fillRect(left, height - 58, width - left * 2, 5);
  context.fillStyle = "#d8ff57";
  context.fillRect(left, height - 58, (width - left * 2) * progress, 5);
  context.fillStyle = "#ffffff";
  context.font = "700 18px Arial, sans-serif";
  context.fillText("N", width - left - 24, height - 79);
}

export default function CourseBuilder({ params }: { params: Promise<{ courseId: string }> }) {
  const searchParams = useSearchParams();
  const openedFromCreation = searchParams.get("created") === "1";
  const [courseId, setCourseId] = useState("");
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("Loading course.");
  const [dirty, setDirty] = useState<{ id: string; revision: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaFilter, setMediaFilter] = useState("all");
  const [workspaceTab, setWorkspaceTab] = useState<"lesson" | "media" | "settings" | "review">("lesson");
  const [contentMode, setContentMode] = useState<"write" | "preview">("write");
  const [draggedLessonId, setDraggedLessonId] = useState("");
  const [publishingErrors, setPublishingErrors] = useState<string[]>([]);
  const [studioBusy, setStudioBusy] = useState(false);
  const [mediaProduction, setMediaProduction] = useState<"" | "recording" | "processing" | "cinematic">("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [launchGuideDismissed, setLaunchGuideDismissed] = useState(false);
  const [curriculumQuery, setCurriculumQuery] = useState("");
  const [curriculumSectionLimit, setCurriculumSectionLimit] = useState(CURRICULUM_SECTION_BATCH);
  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(new Set());
  const [showAllProductionSections, setShowAllProductionSections] = useState(false);
  const revision = useRef(0);
  const contentEditor = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const narrationInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const narrationRecorder = useRef<MediaRecorder | null>(null);
  const narrationStream = useRef<MediaStream | null>(null);
  const narrationChunks = useRef<Blob[]>([]);
  const recordingTimer = useRef<number | null>(null);
  const supabase = getSupabaseBrowser();

  const selected = useMemo(
    () => course?.lessons.find((lesson) => lesson.id === selectedId) || null,
    [course, selectedId],
  );
  const readiness = useMemo(
    () => course ? getCourseReadiness(course) : null,
    [course],
  );
  const productionMissingLessonIds = useMemo(
    () => new Set(readiness?.productionQueue.flatMap((section) =>
      section.missingLessons.map((lesson) => lesson.id)
    ) || []),
    [readiness],
  );

  const token = useCallback(async () => {
    return (await supabase?.auth.getSession())?.data.session?.access_token || "";
  }, [supabase]);

  useEffect(() => {
    params.then(({ courseId: value }) => setCourseId(value));
  }, [params]);

  useEffect(() => {
    if (!courseId || !supabase) return;
    (async () => {
      const accessToken = await token();
      if (!accessToken) {
        location.href = `/login?next=${encodeURIComponent(`/dashboard/courses/${courseId}`)}`;
        return;
      }
      const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}`, {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        setMessage("Course not found.");
        return;
      }
      const loaded = await response.json() as Course;
      setCourse(loaded);
      setSelectedId(loaded.lessons[0]?.id || "");
      const firstSectionId = loaded.lessons[0]?.sectionId || loaded.sections[0]?.id || "";
      setCurriculumSectionLimit(CURRICULUM_SECTION_BATCH);
      setOpenSectionIds(firstSectionId ? new Set([firstSectionId]) : new Set());
      setMessage(openedFromCreation ? "Private course created - start with the first useful lesson" : "All changes saved");
    })();
  }, [courseId, openedFromCreation, supabase, token]);

  useEffect(() => () => {
    if (recordingTimer.current) window.clearInterval(recordingTimer.current);
    if (narrationRecorder.current?.state === "recording") {
      narrationRecorder.current.onstop = null;
      narrationRecorder.current.stop();
    }
    narrationStream.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (!course || location.hash !== "#media-production") return;
    window.setTimeout(() => document.getElementById("media-production")?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }, [course]);

  const persistLesson = useCallback(async (
    lesson: Lesson,
    expectedRevision?: number,
    quiet = false,
  ) => {
    if (!courseId) return false;
    if (!quiet) setMessage("Saving lesson.");
    const accessToken = await token();
    const lessonResponse = await fetch("/api/lessons", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        courseId,
        lesson: {
          ...lesson,
          resourceIds: lesson.resources.map((resource) => resource.assetId),
        },
      }),
    });
    const lessonResult = await lessonResponse.json() as { error?: string; updatedAt?: number };
    if (!lessonResponse.ok) {
      setMessage(lessonResult.error || "Lesson could not be saved.");
      return false;
    }

    const quizResponse = await fetch("/api/quizzes", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        lessonId: lesson.id,
        title: lesson.quiz?.title,
        passingScore: lesson.quiz?.passingScore,
        maxAttempts: lesson.quiz?.maxAttempts,
        questions: lesson.quiz?.questions || [],
      }),
    });
    const quizResult = await quizResponse.json() as { error?: string };
    if (!quizResponse.ok) {
      setMessage(quizResult.error || "Quiz could not be saved.");
      return false;
    }
    setDirty((current) =>
      current?.id === lesson.id &&
      (expectedRevision === undefined || current.revision === expectedRevision)
        ? null
        : current
    );
    setCourse((current) => current ? {
      ...current,
      lessons: current.lessons.map((item) =>
        item.id === lesson.id ? { ...item, updatedAt: lessonResult.updatedAt || item.updatedAt } : item
      ),
    } : current);
    setMessage(quiet ? "Autosaved" : "Lesson saved");
    return true;
  }, [courseId, token]);

  useEffect(() => {
    if (!selected || dirty?.id !== selected.id) return;
    const expectedRevision = dirty.revision;
    const timer = window.setTimeout(() => {
      void persistLesson(selected, expectedRevision, true);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [dirty, persistLesson, selected]);

  function markDirty(id: string) {
    revision.current += 1;
    setDirty({ id, revision: revision.current });
    setMessage("Unsaved changes");
  }

  function editLesson(patch: Partial<Lesson>) {
    if (!course || !selected) return;
    const selectedLessonId = selected.id;
    setCourse((current) => current ? {
      ...current,
      lessons: current.lessons.map((item) =>
        item.id === selectedLessonId ? { ...item, ...patch } : item
      ),
    } : current);
    markDirty(selectedLessonId);
  }

  function editQuiz(patch: Partial<Quiz>) {
    if (!selected) return;
    const quiz = selected.quiz || {
      title: "Lesson quiz",
      passingScore: 80,
      maxAttempts: 0,
      questions: [blankQuestion()],
    };
    editLesson({ quiz: { ...quiz, ...patch } });
  }

  function editQuestion(index: number, patch: Partial<QuizQuestion>) {
    if (!selected?.quiz) return;
    editQuiz({
      questions: selected.quiz.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question
      ),
    });
  }

  function editOption(questionIndex: number, optionIndex: number, value: string) {
    if (!selected?.quiz) return;
    const question = selected.quiz.questions[questionIndex];
    editQuestion(questionIndex, {
      options: question.options.map((option, index) => index === optionIndex ? value : option),
    });
  }

  function openQualityIssue(issue: CourseReadinessIssue) {
    if (issue.id === "course-narrated-teaching") {
      setWorkspaceTab("review");
      requestAnimationFrame(() => {
        document.getElementById("production-queue")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
      return;
    }
    if (issue.lessonId) {
      setSelectedId(issue.lessonId);
      const lesson = course?.lessons.find((item) => item.id === issue.lessonId);
      if (lesson) revealSection(lesson.sectionId);
    }
    setWorkspaceTab(issue.tab);
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(".lesson-editor")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  async function openProductionLesson(lessonId: string) {
    await chooseLesson(lessonId);
    setWorkspaceTab("lesson");
    window.setTimeout(() => {
      document.getElementById("media-production")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  async function chooseLesson(lessonId: string) {
    if (!course || selected?.id === lessonId) return;
    const nextLesson = course.lessons.find((lesson) => lesson.id === lessonId);
    if (selected && dirty?.id === selected.id) {
      const saved = await persistLesson(selected, dirty.revision, true);
      if (!saved) return;
    } else if (selected && isBlankNewLesson(selected)) {
      setCourse({
        ...course,
        lessons: course.lessons.filter((lesson) => lesson.id !== selected.id),
      });
      setMessage("Empty lesson discarded");
    }
    setSelectedId(lessonId);
    if (nextLesson) revealSection(nextLesson.sectionId);
    setWorkspaceTab("lesson");
    setContentMode("write");
  }

  async function addLesson(sectionId: string, lessonType = "text") {
    if (!course) return;
    if (selected && dirty?.id === selected.id) {
      if (!await persistLesson(selected, dirty.revision, true)) return;
    }
    const currentLessons = course.lessons.filter((lesson) => !isBlankNewLesson(lesson));
    const sectionLessons = currentLessons.filter((lesson) => lesson.sectionId === sectionId);
    const lesson: Lesson = {
      id: crypto.randomUUID(),
      sectionId,
      title: lessonType === "quiz" ? "Knowledge check" : "Untitled lesson",
      lessonType,
      content: "",
      contentFormat: "markdown",
      durationMinutes: 0,
      isPreview: false,
      availableAfterDays: 0,
      requiredWatchPercent: 0,
      transcript: "",
      position: sectionLessons.length,
      updatedAt: 0,
      resources: [],
      quiz: lessonType === "quiz" ? {
        title: "Knowledge check",
        passingScore: 80,
        maxAttempts: 0,
        questions: [blankQuestion()],
      } : null,
    };
    setCourse({ ...course, lessons: [...currentLessons, lesson] });
    setSelectedId(lesson.id);
    revealSection(sectionId);
    setWorkspaceTab("lesson");
    setDirty(null);
    setMessage("New lesson started - add a title or material to save it");
    window.setTimeout(() => {
      const titleInput = document.querySelector<HTMLInputElement>(".lesson-meta-grid input");
      titleInput?.focus();
      titleInput?.select();
      document.querySelector<HTMLElement>(".lesson-editor")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  async function deleteLesson(lesson: Lesson) {
    if (!course || !confirm(`Delete "${lesson.title}" and its learner progress?`)) return;
    if (!lesson.updatedAt) {
      const remaining = course.lessons.filter((item) => item.id !== lesson.id);
      setCourse({ ...course, lessons: remaining });
      setSelectedId(remaining[0]?.id || "");
      setDirty(null);
      setMessage("Unsaved lesson removed");
      return;
    }
    const response = await fetch(
      `/api/lessons?courseId=${encodeURIComponent(course.id)}&lessonId=${encodeURIComponent(lesson.id)}`,
      {
        method: "DELETE",
        headers: { authorization: `Bearer ${await token()}` },
      },
    );
    const result = await response.json() as { error?: string };
    if (!response.ok) {
      setMessage(result.error || "Lesson could not be deleted.");
      return;
    }
    const remaining = course.lessons.filter((item) => item.id !== lesson.id);
    setCourse({ ...course, lessons: remaining });
    setSelectedId(remaining[0]?.id || "");
    setDirty(null);
    setMessage("Lesson deleted");
  }

  async function addSection() {
    if (!course) return;
    const section: Section = {
      id: crypto.randomUUID(),
      title: `Section ${course.sections.length + 1}`,
      position: course.sections.length,
      createdAt: 0,
    };
    const response = await fetch("/api/sections", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ courseId: course.id, section }),
    });
    if (!response.ok) {
      setMessage("Section could not be added.");
      return;
    }
    setCourse({ ...course, sections: [...course.sections, section] });
    revealSection(section.id);
    setMessage("Section added");
  }

  function revealSection(sectionId: string) {
    if (!sectionId) return;
    setOpenSectionIds((current) => {
      if (current.has(sectionId)) return current;
      const next = new Set(current);
      next.add(sectionId);
      return next;
    });
  }

  function toggleSection(sectionId: string) {
    setOpenSectionIds((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }

  function focusCurrentSection() {
    const sectionId = selected?.sectionId || course?.sections[0]?.id || "";
    setCurriculumQuery("");
    revealSection(sectionId);
    setOpenSectionIds(new Set(sectionId ? [sectionId] : []));
  }

  function editSection(sectionId: string, title: string) {
    if (!course) return;
    setCourse({
      ...course,
      sections: course.sections.map((section) =>
        section.id === sectionId ? { ...section, title } : section
      ),
    });
  }

  async function saveSection(section: Section) {
    if (!course || !section.title.trim()) return;
    const response = await fetch("/api/sections", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ courseId: course.id, section }),
    });
    setMessage(response.ok ? "Section saved" : "Section could not be saved.");
  }

  async function deleteSection(section: Section) {
    if (!course || !confirm(`Delete "${section.title}"? Its lessons will move to another section.`)) return;
    const response = await fetch(
      `/api/sections?courseId=${encodeURIComponent(course.id)}&sectionId=${encodeURIComponent(section.id)}`,
      { method: "DELETE", headers: { authorization: `Bearer ${await token()}` } },
    );
    const result = await response.json() as { error?: string; replacementSectionId?: string };
    if (!response.ok || !result.replacementSectionId) {
      setMessage(result.error || "Section could not be deleted.");
      return;
    }
    setCourse({
      ...course,
      sections: course.sections.filter((item) => item.id !== section.id),
      lessons: course.lessons.map((lesson) =>
        lesson.sectionId === section.id
          ? { ...lesson, sectionId: result.replacementSectionId! }
          : lesson
      ),
    });
    setMessage("Section deleted");
  }

  async function saveOrder(nextCourse: Course) {
    setCourse(nextCourse);
    const response = await fetch("/api/sections", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({
        courseId: nextCourse.id,
        sections: nextCourse.sections.map((section, position) => ({ id: section.id, position })),
        lessons: nextCourse.lessons.map((lesson) => ({
          id: lesson.id,
          sectionId: lesson.sectionId,
          position: lesson.position,
        })),
      }),
    });
    setMessage(response.ok ? "Curriculum order saved" : "Curriculum order could not be saved.");
  }

  function moveSection(sectionId: string, direction: -1 | 1) {
    if (!course) return;
    const sorted = [...course.sections].sort((a, b) => a.position - b.position);
    const index = sorted.findIndex((section) => section.id === sectionId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= sorted.length) return;
    [sorted[index], sorted[target]] = [sorted[target], sorted[index]];
    void saveOrder({
      ...course,
      sections: sorted.map((section, position) => ({ ...section, position })),
    });
  }

  function moveLesson(lessonId: string, direction: -1 | 1) {
    if (!course) return;
    const lesson = course.lessons.find((item) => item.id === lessonId);
    if (!lesson) return;
    const siblings = course.lessons
      .filter((item) => item.sectionId === lesson.sectionId)
      .sort((a, b) => a.position - b.position);
    const index = siblings.findIndex((item) => item.id === lessonId);
    const target = index + direction;
    if (target < 0 || target >= siblings.length) return;
    [siblings[index], siblings[target]] = [siblings[target], siblings[index]];
    const positions = new Map(siblings.map((item, position) => [item.id, position]));
    void saveOrder({
      ...course,
      lessons: course.lessons.map((item) =>
        positions.has(item.id) ? { ...item, position: positions.get(item.id)! } : item
      ),
    });
  }

  function dropLesson(sectionId: string, beforeLessonId?: string) {
    if (!course || !draggedLessonId) return;
    const dragged = course.lessons.find((lesson) => lesson.id === draggedLessonId);
    if (!dragged) return;
    const targetLessons = course.lessons
      .filter((lesson) => lesson.sectionId === sectionId && lesson.id !== draggedLessonId)
      .sort((a, b) => a.position - b.position);
    const insertAt = beforeLessonId
      ? Math.max(0, targetLessons.findIndex((lesson) => lesson.id === beforeLessonId))
      : targetLessons.length;
    targetLessons.splice(insertAt, 0, { ...dragged, sectionId });
    const positions = new Map(targetLessons.map((lesson, position) => [lesson.id, position]));
    void saveOrder({
      ...course,
      lessons: course.lessons.map((lesson) =>
        lesson.id === draggedLessonId
          ? { ...lesson, sectionId, position: positions.get(lesson.id) || 0 }
          : positions.has(lesson.id)
            ? { ...lesson, position: positions.get(lesson.id)! }
            : lesson
      ),
    });
    setDraggedLessonId("");
  }

  async function saveCourse(status = course?.status || "draft") {
    if (!course) return;
    setPublishingErrors([]);
    if (selected && dirty?.id === selected.id) {
      if (!await persistLesson(selected, dirty.revision)) return;
    }
    setMessage(status === "published" ? "Checking and publishing." : "Saving course.");
    const response = await fetch(`/api/courses/${encodeURIComponent(course.id)}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({
        title: course.title,
        description: course.description,
        status,
        priceCents: course.priceCents,
        truthOutcome: course.truthOutcome,
        truthAudience: course.truthAudience,
        truthNotFor: course.truthNotFor,
        truthPrerequisites: course.truthPrerequisites,
        truthEvidence: course.truthEvidence,
        truthSourceStandard: course.truthSourceStandard,
        truthLevel: course.truthLevel,
        truthDelivery: course.truthDelivery,
        truthReviewedAt: course.truthReviewedAt,
        enforceLessonOrder: Boolean(course.enforceLessonOrder),
        availableFrom: course.availableFrom,
        certificateTitle: course.certificateTitle,
        certificateAccent: course.certificateAccent,
        certificateValidDays: course.certificateValidDays,
      }),
    });
    const result = await response.json() as { error?: string; errors?: string[] };
    if (!response.ok) {
      setPublishingErrors(result.errors || []);
      if (result.errors?.length) setWorkspaceTab("settings");
      setMessage(result.error || "Course could not be saved.");
      return;
    }
    setCourse((current) => current
      ? { ...current, status, pendingSourceFiles: status === "published" ? 0 : current.pendingSourceFiles }
      : current);
    setMessage(status === "published" ? "Course published - learners can enrol" : status === "draft" && course.status === "published" ? "Course unpublished" : "Course saved");
  }

  async function deleteCourse() {
    if (!course) return;
    const confirmation = prompt(
      `This permanently removes the course, learner progress, assessments, certificates, and media used only by this course.\n\nType the course title to continue:\n${course.title}`,
    );
    if (confirmation !== course.title) {
      if (confirmation !== null) setMessage("Course title did not match. Nothing was deleted.");
      return;
    }
    setMessage("Deleting course and cleaning up its data...");
    const response = await fetch(`/api/courses/${encodeURIComponent(course.id)}`, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${await token()}`,
        "x-delete-confirmation": course.id,
      },
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) {
      setMessage(result.error || "Course could not be deleted.");
      return;
    }
    location.href = "/dashboard";
  }

  async function uploadFile(file: File): Promise<Asset | null> {
    if (!course) return null;
    setUploading(true);
    setUploadProgress(0);
    setMessage(`Uploading ${file.name}.`);
    const accessToken = await token();
    const result = await new Promise<{ ok: boolean; asset?: Asset; error?: string }>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `/api/uploads?courseId=${encodeURIComponent(course.id)}&filename=${encodeURIComponent(file.name)}`,
      );
      xhr.setRequestHeader("authorization", `Bearer ${accessToken}`);
      xhr.setRequestHeader("content-type", file.type || "application/octet-stream");
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) setUploadProgress(Math.round(event.loaded / event.total * 100));
      };
      xhr.onload = () => {
        let body = {} as Asset & { error?: string };
        try {
          body = JSON.parse(xhr.responseText || "{}") as Asset & { error?: string };
        } catch {
          body.error = "The upload service returned an invalid response.";
        }
        resolve(xhr.status >= 200 && xhr.status < 300
          ? { ok: true, asset: body }
          : { ok: false, error: body.error || "Upload failed." });
      };
      xhr.onerror = () => resolve({ ok: false, error: "Upload failed. Check your connection and try again." });
      xhr.send(file);
    });
    setUploading(false);
    setUploadProgress(0);
    if (!result.ok || !result.asset) {
      setMessage(result.error || "Upload failed.");
      return null;
    }
    setCourse((current) => current ? { ...current, media: [result.asset!, ...current.media] } : current);
    setMessage(`${result.asset.filename} added to the media library`);
    return result.asset;
  }

  async function attachProducedMedia(asset: Asset, lesson: Lesson, successMessage: string) {
    const updatedLesson: Lesson = {
      ...lesson,
      primaryAssetId: asset.id,
      primaryAsset: asset,
      videoKey: "",
      lessonType: asset.kind === "audio" ? "audio" : asset.kind === "video" ? "video" : lesson.lessonType,
    };
    setCourse((current) => current ? {
      ...current,
      lessons: current.lessons.map((item) => item.id === lesson.id ? updatedLesson : item),
    } : current);
    setSelectedId(lesson.id);
    setDirty((current) => current?.id === lesson.id ? null : current);
    const saved = await persistLesson(updatedLesson);
    setMessage(saved ? successMessage : `${asset.filename} is safe in the media library, but could not be attached automatically.`);
  }

  async function attachProducedIntro(asset: Asset, lesson: Lesson) {
    const updatedLesson: Lesson = {
      ...lesson,
      introAssetId: asset.id,
      introAsset: asset,
    };
    setCourse((current) => current ? {
      ...current,
      lessons: current.lessons.map((item) => item.id === lesson.id ? updatedLesson : item),
    } : current);
    setSelectedId(lesson.id);
    setDirty((current) => current?.id === lesson.id ? null : current);
    const saved = await persistLesson(updatedLesson);
    setMessage(saved
      ? "Branded intro created and placed before the lesson media. The teaching video was left untouched."
      : `${asset.filename} is safe in the media library, but could not be attached as the intro automatically.`);
  }

  async function startNarrationRecording() {
    if (!selected || mediaProduction) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMessage("Direct recording is not supported in this browser. Use Upload narration instead.");
      return;
    }
    if (selected.primaryAsset && !confirm("Replace this lesson's current primary media with the new narration?")) return;
    try {
      const lesson = selected;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      const mimeType = supportedRecorderType(["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]);
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      narrationRecorder.current = recorder;
      narrationStream.current = stream;
      narrationChunks.current = [];
      setRecordingSeconds(0);
      setMediaProduction("recording");
      setMessage("Recording narration. Speak clearly, then choose Stop & attach.");
      recorder.ondataavailable = (event) => {
        if (event.data.size) narrationChunks.current.push(event.data);
      };
      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (recordingTimer.current) window.clearInterval(recordingTimer.current);
        setMediaProduction("");
        setMessage("The recording stopped unexpectedly. Try again or upload an audio file.");
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        narrationStream.current = null;
        narrationRecorder.current = null;
        if (recordingTimer.current) window.clearInterval(recordingTimer.current);
        recordingTimer.current = null;
        setMediaProduction("processing");
        const resolvedType = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(narrationChunks.current, { type: resolvedType });
        narrationChunks.current = [];
        if (!blob.size) {
          setMediaProduction("");
          setMessage("No audio was captured. Check microphone permission and try again.");
          return;
        }
        const extension = resolvedType.startsWith("audio/mp4") ? "m4a" : "webm";
        const file = new File([blob], `${safeMediaFilename(lesson.title)}-narration.${extension}`, { type: resolvedType });
        const asset = await uploadFile(file);
        if (asset) await attachProducedMedia(asset, lesson, "Narration recorded, protected, and attached to this lesson.");
        setMediaProduction("");
      };
      recorder.start(500);
      recordingTimer.current = window.setInterval(() => setRecordingSeconds((seconds) => seconds + 1), 1000);
    } catch (error) {
      setMediaProduction("");
      setMessage(error instanceof DOMException && error.name === "NotAllowedError"
        ? "Microphone access was not allowed. Enable it for NorthstarLabs or upload an audio file."
        : "The microphone could not be started. Try again or upload an audio file.");
    }
  }

  function stopNarrationRecording() {
    if (narrationRecorder.current?.state !== "recording") return;
    setMessage("Finishing and protecting your narration.");
    narrationRecorder.current.stop();
  }

  async function createCinematicIntro() {
    if (!course || !selected || mediaProduction) return;
    if (typeof MediaRecorder === "undefined") {
      setMessage("Local video creation is not supported in this browser. Use Upload finished video instead.");
      return;
    }
    const canvas = document.createElement("canvas");
    if (typeof canvas.captureStream !== "function") {
      setMessage("Local video creation is not supported in this browser. Use Upload finished video instead.");
      return;
    }
    if (selected.introAsset && !confirm("Replace this lesson's existing opening clip with a new branded intro?")) return;
    const lesson = selected;
    const lessonNumber = course.lessons.findIndex((item) => item.id === lesson.id) + 1;
    const mimeType = supportedRecorderType(["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]);
    let stream: MediaStream | null = null;
    let recorder: MediaRecorder | null = null;
    try {
      setMediaProduction("cinematic");
      setMessage("Creating a six-second NorthstarLabs lesson intro in your browser.");
      canvas.width = 1280;
      canvas.height = 720;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      drawCinematicFrame(context, 0, course.title, lesson.title, lessonNumber);
      stream = canvas.captureStream(30);
      const activeRecorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 4_000_000 } : undefined);
      recorder = activeRecorder;
      const chunks: Blob[] = [];
      const completed = new Promise<Blob>((resolve, reject) => {
        activeRecorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
        activeRecorder.onerror = () => reject(new Error("Video encoder failed"));
        activeRecorder.onstop = () => resolve(new Blob(chunks, { type: (activeRecorder.mimeType || mimeType || "video/webm").split(";")[0] }));
      });
      activeRecorder.start(500);
      const startedAt = performance.now();
      await new Promise<void>((resolve) => {
        const animate = (now: number) => {
          const progress = Math.min(1, (now - startedAt) / 6000);
          drawCinematicFrame(context, progress, course.title, lesson.title, lessonNumber);
          if (progress < 1) requestAnimationFrame(animate);
          else resolve();
        };
        requestAnimationFrame(animate);
      });
      activeRecorder.stop();
      const blob = await completed;
      if (!blob.size) throw new Error("No video created");
      const resolvedType = (blob.type || activeRecorder.mimeType || mimeType || "video/webm").split(";")[0];
      const extension = resolvedType === "video/mp4" ? "mp4" : "webm";
      const file = new File([blob], `${safeMediaFilename(lesson.title)}-northstar-intro.${extension}`, { type: resolvedType });
      const asset = await uploadFile(file);
      if (asset) await attachProducedIntro(asset, lesson);
    } catch {
      setMessage("The branded intro could not be created in this browser. Upload a finished MP4 or WebM instead.");
    } finally {
      if (recorder?.state === "recording") recorder.stop();
      stream?.getTracks().forEach((track) => track.stop());
      setMediaProduction("");
    }
  }

  async function generateStudioNarration() {
    if (!course || !selected?.transcript.trim() || studioBusy) return;
    setStudioBusy(true);
    setMessage("Creating AI-assisted narration.");
    const accessToken = await token();
    const studioResponse = await fetch("/api/creator-studio", {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    const studioResult = await studioResponse.json() as {
      error?: string;
      projects?: Array<{ id: string; courseId: string | null }>;
    };
    const project = studioResult.projects?.find((item) => item.courseId === course.id);
    if (!studioResponse.ok || !project) {
      setMessage(studioResult.error || "Narration is available for courses exported from Creator Studio.");
      setStudioBusy(false);
      return;
    }
    if (dirty?.id === selected.id && !await persistLesson(selected, dirty.revision)) {
      setStudioBusy(false);
      return;
    }
    const response = await fetch("/api/creator-studio", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ action: "narrate", projectId: project.id, lessonId: selected.id }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) {
      setMessage(result.error || "Narration could not be generated.");
      setStudioBusy(false);
      return;
    }
    setMessage("Narration created and attached. Review it before publishing.");
    location.reload();
  }

  function attachPrimary(asset: Asset) {
    if (!selected) return;
    editLesson({
      primaryAssetId: asset.id,
      primaryAsset: asset,
      videoKey: "",
      lessonType: ["video", "audio"].includes(asset.kind) ? asset.kind : selected.lessonType,
    });
    setWorkspaceTab("lesson");
    setMessage(`${asset.filename} attached as lesson media`);
  }

  function toggleResource(asset: Asset) {
    if (!selected) return;
    const existing = selected.resources.some((resource) => resource.assetId === asset.id);
    editLesson({
      resources: existing
        ? selected.resources.filter((resource) => resource.assetId !== asset.id)
        : [...selected.resources, {
            id: crypto.randomUUID(),
            assetId: asset.id,
            title: asset.filename,
            filename: asset.filename,
            contentType: asset.contentType,
            sizeBytes: asset.sizeBytes,
            kind: asset.kind,
            position: selected.resources.length,
          }],
    });
    setMessage(existing ? "Resource removed from lesson" : "Resource added to lesson");
  }

  function updateAsset(assetId: string, patch: Partial<Asset>) {
    if (!course) return;
    setCourse((current) => current ? {
      ...current,
      media: current.media.map((asset) => asset.id === assetId ? { ...asset, ...patch } : asset),
    } : current);
  }

  async function saveAssetAlt(asset: Asset) {
    if (!course) return;
    const response = await fetch("/api/uploads", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ courseId: course.id, assetId: asset.id, altText: asset.altText }),
    });
    setMessage(response.ok ? "Image description saved" : "Image description could not be saved.");
  }

  async function deleteAsset(asset: Asset) {
    if (!course || !confirm(`Delete ${asset.filename} from the academy media library?`)) return;
    const response = await fetch(
      `/api/uploads?courseId=${encodeURIComponent(course.id)}&assetId=${encodeURIComponent(asset.id)}`,
      { method: "DELETE", headers: { authorization: `Bearer ${await token()}` } },
    );
    const result = await response.json() as { error?: string };
    if (!response.ok) {
      setMessage(result.error || "File could not be deleted.");
      return;
    }
    setCourse((current) => current ? {
      ...current,
      media: current.media.filter((item) => item.id !== asset.id),
    } : current);
    setMessage("File deleted from media library");
  }

  function applyFormat(prefix: string, suffix = prefix, placeholder = "text") {
    if (!selected || !contentEditor.current) return;
    const textarea = contentEditor.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const chosen = selected.content.slice(start, end) || placeholder;
    const next = `${selected.content.slice(0, start)}${prefix}${chosen}${suffix}${selected.content.slice(end)}`;
    editLesson({ content: next });
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + chosen.length);
    });
  }

  if (!course) {
    return <main className="system-loading"><div><b>NorthstarLabs</b><p>{message}</p></div></main>;
  }

  const filteredMedia = course.media.filter((asset) =>
    mediaFilter === "all" || asset.kind === mediaFilter
  );
  const firstLesson = course.lessons[0] || null;
  const firstLessonShaped = Boolean(
    firstLesson &&
    firstLesson.title.trim() &&
    firstLesson.title.trim().toLowerCase() !== "untitled lesson" &&
    (firstLesson.content.trim() || firstLesson.primaryAssetId || firstLesson.videoKey?.trim())
  );
  const showLaunchGuide = !launchGuideDismissed && (openedFromCreation || course.lessons.length === 0);
  const curriculumSearch = curriculumQuery.trim().toLowerCase();
  const orderedSections = [...course.sections].sort((a, b) => a.position - b.position);
  const visibleSections = curriculumSearch
    ? orderedSections.filter((section) =>
        section.title.toLowerCase().includes(curriculumSearch) ||
        course.lessons.some((lesson) =>
          lesson.sectionId === section.id &&
          lesson.title.toLowerCase().includes(curriculumSearch)
        )
      )
    : orderedSections;
  const pinnedSectionIds = new Set([
    ...openSectionIds,
    ...(selected?.sectionId ? [selected.sectionId] : []),
  ]);
  const renderedSections = visibleSections.filter((section, index) =>
    index < curriculumSectionLimit || pinnedSectionIds.has(section.id)
  );
  const remainingSectionCount = Math.max(0, visibleSections.length - renderedSections.length);
  const productionSections = readiness?.productionQueue.filter((section) =>
    section.missingLessons.length > 0
  ) || [];
  const visibleProductionSections = showAllProductionSections
    ? productionSections
    : productionSections.slice(0, 8);

  return <main className="builder-page builder-page-expanded">
    <header className="builder-top">
      <div className="builder-context">
        <Link href="/dashboard?area=courses">&larr; {course.schoolName} courses</Link>
        <span>NorthstarLabs / {course.schoolName} / Course editor</span>
      </div>
      <div>
        <input
          aria-label="Course title"
          value={course.title}
          onChange={(event) => setCourse({ ...course, title: event.target.value })}
        />
        <span className={dirty ? "builder-save-state pending" : "builder-save-state"}>
          {course.status} | {message}
        </span>
      </div>
      <div>
        <button
          className={`builder-tool quality-review-button${readiness && readiness.blockers.length ? " has-blockers" : ""}`}
          onClick={() => setWorkspaceTab("review")}
        >
          Production {readiness?.score || 0}%
        </button>
        <button className="builder-tool" onClick={() => setWorkspaceTab("settings")}>Course settings</button>
        <Link className="builder-preview" href={`/learn/${course.id}?preview=1`}>Learner preview</Link>
        <button className="builder-tool" onClick={() => saveCourse(course.status === "published" ? "draft" : "published")}>
          {course.status === "published" ? "Unpublish" : "Publish"}
        </button>
        <button className="sys-primary" onClick={() => saveCourse(course.status)}>Save</button>
      </div>
    </header>

    {showLaunchGuide && <section className="builder-launch-guide" aria-labelledby="builder-launch-title">
      <header>
        <div><p className="sys-kicker">PRIVATE COURSE DRAFT</p><h2 id="builder-launch-title">Build this course in three moves.</h2><p>Start with one useful lesson. Add the teaching and evidence that make it worth completing. Then preview the exact learner experience before publishing.</p></div>
        <button type="button" aria-label="Hide course start guide" onClick={()=>setLaunchGuideDismissed(true)}>&times;</button>
      </header>
      <ol>
        <li className={course.lessons.length ? "done" : "current"}><span>1</span><div><b>Add the first lesson</b><small>Name the useful thing a learner should understand or do next.</small></div><em>{course.lessons.length ? "Started" : "Do this now"}</em></li>
        <li className={firstLessonShaped ? "done" : course.lessons.length ? "current" : ""}><span>2</span><div><b>Make it teach</b><small>Add concise explanation, an example, media and a meaningful check.</small></div><em>{firstLessonShaped ? "Taking shape" : "Next"}</em></li>
        <li className={firstLessonShaped ? "current" : ""}><span>3</span><div><b>Preview, improve, publish</b><small>Use Production Review and Learner Preview before anyone sees it.</small></div><em>Never automatic</em></li>
      </ol>
      <div>
        {!course.lessons.length
          ? <button className="sys-primary" type="button" disabled={!course.sections[0]} onClick={()=>course.sections[0]&&addLesson(course.sections[0].id,"text")}>Add my first lesson</button>
          : <button className="sys-primary" type="button" onClick={()=>{setSelectedId(firstLesson!.id);setWorkspaceTab("lesson");document.querySelector<HTMLElement>(".lesson-editor")?.scrollIntoView({behavior:"smooth"});}}>Continue the first lesson</button>}
        <button type="button" onClick={()=>setWorkspaceTab("review")}>See the quality standard</button>
        <small>Nothing is public. NorthstarLabs saves the draft as you work.</small>
      </div>
    </section>}

    <div className="builder-layout">
      <aside className="curriculum curriculum-expanded">
        <div className="curriculum-heading">
          <div><p className="sys-kicker">CURRICULUM</p><b>{course.sections.length} sections · {course.lessons.length} lessons</b></div>
          <button onClick={addSection}>+ Section</button>
        </div>
        <div className="curriculum-tools">
          <label>
            <span>Find a section or lesson</span>
            <input
              type="search"
              aria-label="Search curriculum"
              value={curriculumQuery}
              onChange={(event) => {
                const nextQuery = event.target.value;
                setCurriculumQuery(nextQuery);
                setCurriculumSectionLimit(CURRICULUM_SECTION_BATCH);
                if (!nextQuery.trim() && selected?.sectionId) {
                  revealSection(selected.sectionId);
                }
              }}
              placeholder={`Search ${course.lessons.length} lessons`}
            />
          </label>
          <div>
            <button type="button" onClick={() => setOpenSectionIds(new Set())}>Collapse all</button>
            <button type="button" onClick={focusCurrentSection}>Current lesson</button>
          </div>
          {curriculumSearch && <small>{visibleSections.length
            ? `${visibleSections.length} matching section${visibleSections.length === 1 ? "" : "s"}`
            : "No matching sections or lessons"}</small>}
        </div>
        <div className="curriculum-sections">
          {renderedSections.map((section) => {
            const sectionIndex = orderedSections.findIndex((item) => item.id === section.id);
            const sectionLessons = course.lessons
              .filter((lesson) => lesson.sectionId === section.id)
              .sort((a, b) => a.position - b.position);
            const sectionTitleMatches = section.title.toLowerCase().includes(curriculumSearch);
            const visibleLessons = curriculumSearch && !sectionTitleMatches
              ? sectionLessons.filter((lesson) => lesson.title.toLowerCase().includes(curriculumSearch))
              : sectionLessons;
            const issueCount = sectionLessons.reduce(
              (total, lesson) => total + (readiness?.lessonIssueCounts[lesson.id] || 0),
              0,
            );
            const productionSection = readiness?.productionQueue.find((item) => item.sectionId === section.id);
            const narrationRemaining = productionSection?.missingLessons.length || 0;
            const isOpen = Boolean(curriculumSearch) || openSectionIds.has(section.id);
            return <section
              className={`curriculum-section${isOpen ? " open" : ""}`}
              key={section.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropLesson(section.id)}
            >
              <header>
                <button
                  type="button"
                  className="curriculum-section-toggle"
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? "Collapse" : "Expand"} ${section.title}`}
                  onClick={() => toggleSection(section.id)}
                >
                  <span>{isOpen ? "−" : "+"}</span>
                  <b>{String(sectionIndex + 1).padStart(2, "0")}</b>
                </button>
                <label className="curriculum-section-title">
                  <span className="sr-only">Section {sectionIndex + 1} title</span>
                  <input
                    aria-label={`Section ${sectionIndex + 1} title`}
                    value={section.title}
                    onChange={(event) => editSection(section.id, event.target.value)}
                    onBlur={() => saveSection(section)}
                  />
                  <small className={sectionLessons.length ? "" : "needs-work"}>
                    {sectionLessons.length
                      ? `${sectionLessons.length} lesson${sectionLessons.length === 1 ? "" : "s"} · ${narrationRemaining
                          ? `${productionSection?.ready || 0}/${productionSection?.total || 0} narrated`
                          : issueCount
                            ? `${issueCount} quality fix${issueCount === 1 ? "" : "es"}`
                            : "production ready"}`
                      : "Empty section · add a lesson"}
                  </small>
                </label>
                <div>
                  <button aria-label="Move section up" title="Move section up" disabled={sectionIndex === 0} onClick={() => moveSection(section.id, -1)}>&uarr;</button>
                  <button aria-label="Move section down" title="Move section down" disabled={sectionIndex === course.sections.length - 1} onClick={() => moveSection(section.id, 1)}>&darr;</button>
                  <button aria-label="Delete section" title="Delete section" onClick={() => deleteSection(section)}>&times;</button>
                </div>
              </header>
              {isOpen && <div className="curriculum-lessons">
                {visibleLessons.map((lesson) => {
                  const lessonIndex = sectionLessons.findIndex((item) => item.id === lesson.id);
                  const narrationMissing = productionMissingLessonIds.has(lesson.id);
                  const lessonIssueCount = readiness?.lessonIssueCounts[lesson.id] || 0;
                  return <article
                      draggable
                      className={selected?.id === lesson.id ? "active" : ""}
                      key={lesson.id}
                      onDragStart={() => setDraggedLessonId(lesson.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.stopPropagation();
                        dropLesson(section.id, lesson.id);
                      }}
                    >
                      <button className="lesson-select" onClick={() => chooseLesson(lesson.id)}>
                        <span>{assetIcon(lesson.primaryAsset?.kind || lesson.lessonType)}</span>
                        <div>
                          <b>{lesson.title}</b>
                          <small>{lesson.lessonType}{lesson.quiz ? " | quiz" : ""}</small>
                          <em className={lessonIssueCount || narrationMissing ? "lesson-quality-signal needs-work" : "lesson-quality-signal"}>
                            {lessonIssueCount
                              ? `${lessonIssueCount} quality fix${lessonIssueCount === 1 ? "" : "es"}`
                              : narrationMissing
                                ? "Narration needed"
                                : "Production ready"}
                          </em>
                        </div>
                      </button>
                      <div className="lesson-order-controls">
                        <button aria-label={`Move ${lesson.title} up`} disabled={lessonIndex === 0} onClick={() => moveLesson(lesson.id, -1)}>&uarr;</button>
                        <button aria-label={`Move ${lesson.title} down`} disabled={lessonIndex === sectionLessons.length - 1} onClick={() => moveLesson(lesson.id, 1)}>&darr;</button>
                      </div>
                    </article>;
                })}
              </div>}
              {isOpen && <div className="lesson-add-row">
                <button onClick={() => addLesson(section.id, "text")}>+ Text</button>
                <button onClick={() => addLesson(section.id, "video")}>+ Video</button>
                <button onClick={() => addLesson(section.id, "quiz")}>+ Quiz</button>
              </div>}
            </section>;
          })}
        </div>
        {remainingSectionCount > 0 && <div className="curriculum-load-more">
          <p><b>{renderedSections.length} of {visibleSections.length}</b> {curriculumSearch ? "matching sections shown" : "sections loaded"}</p>
          <button type="button" onClick={() => setCurriculumSectionLimit((current) =>
            Math.min(visibleSections.length, current + CURRICULUM_SECTION_BATCH)
          )}>
            Load more sections
          </button>
          <small>The complete curriculum remains searchable. Loading it in stages keeps large courses fast.</small>
        </div>}
        <button className="media-library-button" onClick={() => setWorkspaceTab("media")}>
          <span>MEDIA</span><div><b>Academy media library</b><small>{course.media.length} reusable files</small></div>
        </button>
      </aside>

      <section className="lesson-editor">
        {workspaceTab === "review" && readiness && <div className="course-quality-review">
          <div className="editor-heading quality-review-heading">
            <div>
              <p className="sys-kicker">PRODUCTION READINESS REVIEW</p>
              <h1>See the course a learner will experience.</h1>
              <p>Fix what weakens trust, learning, accessibility, or completion before you invite people in.</p>
            </div>
            <Link className="builder-preview" href={`/learn/${course.id}?preview=1`}>Preview as learner</Link>
          </div>

          <section className="quality-score-card">
            <div className="quality-score">
              <strong>{readiness.score}</strong><span>/100</span>
            </div>
            <div>
              <p className="sys-kicker">CURRENT STANDARD</p>
              <h2>{readiness.label}</h2>
              <p>{readiness.blockers.length
                ? `${readiness.blockers.length} publishing blocker${readiness.blockers.length === 1 ? "" : "s"} must be fixed.`
                : readiness.improvements.length
                  ? `${readiness.improvements.length} improvement${readiness.improvements.length === 1 ? "" : "s"} would make the learner experience stronger.`
                  : "Automated production checks are covered. Human subject review and a full learner preview still matter."}</p>
              <div className="quality-progress" aria-label={`Course production readiness ${readiness.score}%`}>
                <i style={{ width: `${readiness.score}%` }} />
              </div>
            </div>
            <dl>
              <div><dt>Lessons</dt><dd>{course.lessons.length}</dd></div>
              <div><dt>Blockers</dt><dd>{readiness.blockers.length}</dd></div>
              <div><dt>Improvements</dt><dd>{readiness.improvements.length}</dd></div>
            </dl>
          </section>

          <section className="production-coverage-grid" aria-label="Course production coverage">
            {Object.values(readiness.productionCoverage).map((signal) => <article key={signal.label}>
              <div>
                <span>{signal.label}</span>
                <strong>{signal.percent}%</strong>
              </div>
              <div className="production-coverage-meter" aria-label={`${signal.label}: ${signal.ready} of ${signal.total}`}>
                <i style={{ width: `${signal.percent}%` }} />
              </div>
              <p>{signal.ready} of {signal.total} covered</p>
              <small>{signal.detail}</small>
            </article>)}
          </section>

          <section className="production-queue" id="production-queue">
            <header>
              <div>
                <p className="sys-kicker">PRODUCTION QUEUE</p>
                <h2>{productionSections.length
                  ? `${readiness.productionCoverage.narratedTeaching.total - readiness.productionCoverage.narratedTeaching.ready} lessons still need narrated teaching.`
                  : "Every instructional lesson has narrated teaching."}</h2>
                <p>{productionSections.length
                  ? "Work module by module. Northstar opens the exact lesson, script and media tools so you never hunt through the curriculum."
                  : "Keep the queue clear by reviewing replacement media and transcripts before publishing."}</p>
              </div>
              {productionSections.length > 0 && <button
                className="sys-primary"
                type="button"
                onClick={() => openProductionLesson(productionSections[0].missingLessons[0].id)}
              >Continue production &rarr;</button>}
            </header>
            {visibleProductionSections.length > 0 && <div className="production-queue-list">
              {visibleProductionSections.map((section, index) => {
                const nextLesson = section.missingLessons[0];
                return <article key={section.sectionId}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <small>{section.ready} of {section.total} narrated</small>
                    <h3>{section.sectionTitle}</h3>
                    <p><b>Next:</b> {nextLesson.title}</p>
                    <em>{nextLesson.hasTranscript
                      ? nextLesson.hasMedia
                        ? "Media and script need a final production review"
                        : "Script ready · record, upload or generate narration"
                      : "Write and review the narration script first"}</em>
                  </div>
                  <div className="production-queue-progress" aria-label={`${section.sectionTitle}: ${section.percent}% narrated`}>
                    <i style={{ width: `${section.percent}%` }} />
                  </div>
                  <button type="button" onClick={() => openProductionLesson(nextLesson.id)}>Open lesson &rarr;</button>
                </article>;
              })}
            </div>}
            {productionSections.length > 8 && <button
              className="production-queue-more"
              type="button"
              onClick={() => setShowAllProductionSections((current) => !current)}
            >{showAllProductionSections
              ? "Show the next eight modules only"
              : `Show all ${productionSections.length} modules needing production`}</button>}
          </section>

          {readiness.blockers.length > 0 && <section className="quality-issue-section blockers">
            <div>
              <p className="sys-kicker">FIX BEFORE PUBLISHING</p>
              <h2>These gaps break the learning journey.</h2>
            </div>
            <div className="quality-issue-list">
              {readiness.blockers.map((issue, index) => <article key={issue.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  {issue.lessonTitle && <small>{issue.lessonTitle}</small>}
                  <h3>{issue.title}</h3>
                  <p>{issue.detail}</p>
                </div>
                <button onClick={() => openQualityIssue(issue)}>{issue.action} &rarr;</button>
              </article>)}
            </div>
          </section>}

          {readiness.improvements.length > 0 && <section className="quality-issue-section improvements">
            <div>
              <p className="sys-kicker">MAKE IT WORTH RECOMMENDING</p>
              <h2>Turn a functional course into a credible one.</h2>
            </div>
            <div className="quality-issue-list">
              {readiness.improvements.map((issue, index) => <article key={issue.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  {issue.lessonTitle && <small>{issue.lessonTitle}</small>}
                  <h3>{issue.title}</h3>
                  <p>{issue.detail}</p>
                </div>
                <button onClick={() => openQualityIssue(issue)}>{issue.action} &rarr;</button>
              </article>)}
            </div>
          </section>}

          {!readiness.issues.length && <section className="quality-complete">
            <span>READY</span>
            <div><p className="sys-kicker">AUTOMATED CHECKS COMPLETE</p><h2>Production checks have passed.</h2><p>Run a human subject review and preview the full learner journey before publishing.</p></div>
            <Link className="sys-primary" href={`/learn/${course.id}?preview=1`}>Run final preview</Link>
          </section>}

          <footer className="quality-review-note">
            <b>This automated score is guidance, not accreditation or subject approval.</b>
            <span>It checks completeness, clarity, narrated teaching, guided practice, accessibility, assessment feedback, and learner navigation. Human subject-matter review still matters.</span>
          </footer>
        </div>}

        {workspaceTab === "settings" && <div className="course-settings-editor">
          <div className="editor-heading">
            <div><p className="sys-kicker">COURSE SETTINGS</p><h1>Describe and publish your course.</h1></div>
          </div>
          {!!course.pendingSourceFiles && <section className="builder-import-blocker" role="alert">
            <div>
              <p className="sys-kicker">IMPORT NOT YET VERIFIED</p>
              <h2>{course.pendingSourceFiles} source file{course.pendingSourceFiles === 1 ? "" : "s"} still need to be attached.</h2>
              <p>The course draft is safe, but it cannot be published until every imported module has its original source file.</p>
            </div>
            <Link href="/dashboard/import">Finish file upload</Link>
          </section>}
          <label>Course title<input value={course.title} onChange={(event) => setCourse({ ...course, title: event.target.value })} /></label>
          <label>Course description<textarea value={course.description} onChange={(event) => setCourse({ ...course, description: event.target.value })} placeholder="Explain the result learners can expect and who the course is for." /></label>
          <label>Price in South African rand<input type="number" min="0" step="1" value={course.priceCents / 100} onChange={(event) => setCourse({ ...course, priceCents: Math.max(0, Math.round(Number(event.target.value || 0) * 100)) })} /></label>
          <section className="course-truth-editor">
            <header>
              <div>
                <p className="sys-kicker">COURSE TRUTH CARD</p>
                <h2>Remove doubt before learners join.</h2>
                <p>These facts appear publicly as &quot;Before you commit&quot;. Be specific, honest and useful.</p>
              </div>
              <div className={course.lessons.some((lesson) => Boolean(lesson.isPreview)) ? "truth-preview-status ready" : "truth-preview-status"}>
                <b>{course.lessons.filter((lesson) => Boolean(lesson.isPreview)).length}</b>
                <span>public preview {course.lessons.filter((lesson) => Boolean(lesson.isPreview)).length === 1 ? "lesson" : "lessons"}</span>
                <small>Mark a lesson &quot;Free preview&quot; in its lesson settings.</small>
              </div>
            </header>
            <div className="course-truth-grid">
              <label className="truth-wide">The promise
                <textarea maxLength={1000} value={course.truthOutcome} onChange={(event) => setCourse({ ...course, truthOutcome: event.target.value })} placeholder="After this course, learners will be able to." />
                <small>Describe a result a learner can recognise or demonstrate.</small>
              </label>
              <label>Who this is for
                <textarea maxLength={1000} value={course.truthAudience} onChange={(event) => setCourse({ ...course, truthAudience: event.target.value })} placeholder={"Working professionals\nIndependent learners\nTeam leaders"} />
                <small>Use one audience per line.</small>
              </label>
              <label>Who this is not for
                <textarea maxLength={1000} value={course.truthNotFor} onChange={(event) => setCourse({ ...course, truthNotFor: event.target.value })} placeholder="For example: people looking for investment advice or a shortcut." />
              </label>
              <label>Prerequisites
                <textarea maxLength={1000} value={course.truthPrerequisites} onChange={(event) => setCourse({ ...course, truthPrerequisites: event.target.value })} placeholder="State the knowledge, tools or experience learners need-or say none." />
              </label>
              <label>Evidence learners produce
                <textarea maxLength={1000} value={course.truthEvidence} onChange={(event) => setCourse({ ...course, truthEvidence: event.target.value })} placeholder="A completed plan, assessment, portfolio piece or practical output." />
              </label>
              <label className="truth-wide">Source and review standard
                <textarea maxLength={1000} value={course.truthSourceStandard} onChange={(event) => setCourse({ ...course, truthSourceStandard: event.target.value })} placeholder="Explain what sources, expertise or review process support this course." />
              </label>
              <label>Level
                <input maxLength={80} value={course.truthLevel} onChange={(event) => setCourse({ ...course, truthLevel: event.target.value })} placeholder="Beginner to intermediate" />
              </label>
              <label>Delivery
                <input maxLength={120} value={course.truthDelivery} onChange={(event) => setCourse({ ...course, truthDelivery: event.target.value })} placeholder="Self-paced | video, text and assessments" />
              </label>
              <label>Last human review
                <input type="date" value={dateInputValue(course.truthReviewedAt)} onChange={(event) => setCourse({ ...course, truthReviewedAt: event.target.value ? new Date(`${event.target.value}T12:00:00`).getTime() : null })} />
                <small>Shows learners when the course facts were last checked.</small>
              </label>
              <button type="button" className="truth-review-button" onClick={() => setCourse({ ...course, truthReviewedAt: Date.now() })}>Mark reviewed today</button>
            </div>
          </section>
          <section className="learning-controls-editor">
            <div>
              <p className="sys-kicker">LEARNER CONTROLS</p>
              <h2>Set a clear path through the course.</h2>
            </div>
            <label className="builder-check">
              <input
                type="checkbox"
                checked={Boolean(course.enforceLessonOrder)}
                onChange={(event) => setCourse({ ...course, enforceLessonOrder: event.target.checked })}
              />
              <span><b>Require lessons in order</b><small>Learners unlock the next lesson only after completing everything before it.</small></span>
            </label>
            <label>Course opens on
              <input
                type="datetime-local"
                value={dateTimeInputValue(course.availableFrom)}
                onChange={(event) => setCourse({
                  ...course,
                  availableFrom: event.target.value ? new Date(event.target.value).getTime() : null,
                })}
              />
              <small>Leave blank for immediate access. Individual lessons can still be released later.</small>
            </label>
          </section>
          <section className="certificate-settings-editor">
            <div>
              <p className="sys-kicker">PDF CERTIFICATE</p>
              <h2>Make completion feel official.</h2>
            </div>
            <label>Certificate heading<input maxLength={100} value={course.certificateTitle} onChange={(event) => setCourse({ ...course, certificateTitle: event.target.value })} /></label>
            <label>Accent colour<input type="color" value={course.certificateAccent} onChange={(event) => setCourse({ ...course, certificateAccent: event.target.value })} /></label>
            <label>Valid for days<input type="number" min="0" max="3650" value={course.certificateValidDays} onChange={(event) => setCourse({ ...course, certificateValidDays: Math.max(0, Number(event.target.value || 0)) })} /><small>Use 0 for a certificate that does not expire.</small></label>
          </section>
          <div className="publishing-checklist">
            <p className="sys-kicker">MINIMUM PUBLISHING CHECKS</p>
            <ul>
              <li className={course.title.trim().length >= 3 ? "done" : ""}>Clear course title</li>
              <li className={course.description.trim().length >= 20 ? "done" : ""}>Useful course description</li>
              <li className={course.lessons.length ? "done" : ""}>At least one complete lesson</li>
              <li className={course.sections.length && course.sections.every((section) => section.title.trim()) ? "done" : ""}>Curriculum organised into named sections</li>
              <li className={course.truthOutcome.trim().length >= 20 ? "done" : ""}>Specific learner outcome disclosed</li>
              <li className={course.truthAudience.trim().length >= 3 ? "done" : ""}>Right-fit audience disclosed</li>
              <li className={course.lessons.some((lesson) => Boolean(lesson.isPreview)) ? "done" : ""}>At least one lesson available as a public preview</li>
              <li className={course.truthReviewedAt ? "done" : ""}>Course truth card human-reviewed</li>
            </ul>
            {!!publishingErrors.length && <div className="publishing-errors">{publishingErrors.map((error) => <p key={error}>{error}</p>)}</div>}
            <button className="quality-review-cta" onClick={() => setWorkspaceTab("review")}>
              Open the full learner-quality review <b>{readiness?.score || 0}%</b> &rarr;
            </button>
          </div>
          <div className="editor-save-row">
            <button className="builder-tool" onClick={() => setWorkspaceTab("lesson")}>Back to lessons</button>
            <button className="sys-primary" onClick={() => saveCourse(course.status)}>Save course settings</button>
          </div>
          <section className="course-danger-zone">
            <div><p className="sys-kicker">DANGER ZONE</p><h2>Delete this course permanently</h2><p>NorthstarLabs removes course content, enrolments, progress, assessments, certificates, playback grants, and media that is not used anywhere else.</p></div>
            <button className="danger-button" onClick={deleteCourse}>Delete course</button>
          </section>
        </div>}

        {workspaceTab === "media" && <div className="media-library">
          <div className="editor-heading">
            <div><p className="sys-kicker">MEDIA LIBRARY</p><h1>Upload once. Reuse anywhere.</h1><p>Videos, audio, images, PDFs, Office files, text files, and ZIP resources.</p></div>
            <button className="sys-primary" onClick={() => fileInput.current?.click()} disabled={uploading}>{uploading ? `Uploading ${uploadProgress}%` : "Upload files"}</button>
          </div>
          <input
            hidden
            multiple
            ref={fileInput}
            type="file"
            accept="video/mp4,video/webm,video/ogg,audio/*,image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
            onChange={async (event) => {
              for (const file of Array.from(event.target.files || [])) await uploadFile(file);
              event.target.value = "";
            }}
          />
          {uploading && <div className="upload-progress"><i style={{ width: `${uploadProgress}%` }} /><span>{uploadProgress}% uploaded</span></div>}
          <div className="media-filters">
            {["all", "video", "audio", "image", "document", "archive"].map((kind) =>
              <button className={mediaFilter === kind ? "active" : ""} key={kind} onClick={() => setMediaFilter(kind)}>{kind}</button>
            )}
          </div>
          <div className="media-grid">
            {filteredMedia.map((asset) => {
              const isPrimary = selected?.primaryAssetId === asset.id;
              const isResource = selected?.resources.some((resource) => resource.assetId === asset.id);
              return <article className="media-card" key={asset.id}>
                <div className={`media-card-icon ${asset.kind}`}>{assetIcon(asset.kind)}</div>
                <div><b title={asset.filename}>{asset.filename}</b><small>{asset.kind} | {formatBytes(asset.sizeBytes)}</small></div>
                {asset.kind === "image" && <label>Image description<input value={asset.altText || ""} onChange={(event) => updateAsset(asset.id, { altText: event.target.value })} onBlur={() => saveAssetAlt(asset)} placeholder="Describe the image for learners" /></label>}
                <div className="media-card-actions">
                  {selected && ["video", "audio", "image"].includes(asset.kind) && <button className={isPrimary ? "active" : ""} onClick={() => isPrimary ? editLesson({ primaryAssetId: null, primaryAsset: null }) : attachPrimary(asset)}>{isPrimary ? "Remove media" : "Use as media"}</button>}
                  {selected && <button className={isResource ? "active" : ""} onClick={() => toggleResource(asset)}>{isResource ? "Remove resource" : "Add resource"}</button>}
                  <button className="delete-media" onClick={() => deleteAsset(asset)}>Delete</button>
                </div>
              </article>;
            })}
            {!filteredMedia.length && <div className="media-empty"><b>No {mediaFilter === "all" ? "" : mediaFilter} files yet.</b><p>Upload a file to add it to this academy&apos;s reusable library.</p></div>}
          </div>
        </div>}

        {workspaceTab === "lesson" && selected && <>
          <div className="editor-heading">
            <div><p className="sys-kicker">LESSON EDITOR</p><h1>{selected.title}</h1><p>{dirty?.id === selected.id ? "Autosave pending." : "Changes are saved automatically."}</p></div>
            <button className="danger-plain" onClick={() => deleteLesson(selected)}>Delete lesson</button>
          </div>
          <form onSubmit={(event: FormEvent) => {
            event.preventDefault();
            void persistLesson(selected, dirty?.revision);
          }}>
            <div className="lesson-meta-grid">
              <label>Lesson title<input required value={selected.title} onChange={(event) => editLesson({ title: event.target.value })} /></label>
              <label>Lesson type<select value={selected.lessonType} onChange={(event) => editLesson({ lessonType: event.target.value })}><option value="text">Text lesson</option><option value="video">Video lesson</option><option value="audio">Audio lesson</option><option value="interactive">Interactive lesson</option><option value="resource">Resource lesson</option><option value="quiz">Quiz lesson</option></select></label>
              <label>Estimated minutes<input type="number" min="0" max="1440" value={selected.durationMinutes || 0} onChange={(event) => editLesson({ durationMinutes: Number(event.target.value) })} /></label>
              {selected.videoKey?.startsWith("r2:")
                ? <label>Existing secure upload<input readOnly value="Secure lesson video attached" /></label>
                : <label>External media URL<input type="url" value={selected.videoKey || ""} onChange={(event) => editLesson({ videoKey: event.target.value, primaryAssetId: event.target.value ? null : selected.primaryAssetId, primaryAsset: event.target.value ? null : selected.primaryAsset })} placeholder="https://example.com/lesson.mp4" /></label>}
            </div>
            <section className="lesson-compliance-editor">
              <div><p className="sys-kicker">ACCESS & COMPLETION</p><h2>Control when this lesson unlocks.</h2></div>
              <label>Release after enrolment
                <span><input type="number" min="0" max="3650" value={selected.availableAfterDays || 0} onChange={(event) => editLesson({ availableAfterDays: Math.max(0, Number(event.target.value || 0)) })} /> days</span>
                <small>Use 0 to make it available with the course.</small>
              </label>
              <label>Required video watch
                <span><input type="number" min="0" max="100" value={selected.requiredWatchPercent || 0} onChange={(event) => editLesson({ requiredWatchPercent: Math.max(0, Math.min(100, Number(event.target.value || 0))) })} />%</span>
                <small>Use 0 when this lesson has no required media.</small>
              </label>
            </section>

            <section className={`primary-media-editor${selected.primaryAssetId && !selected.primaryAsset && !selected.videoKey ? " missing-media" : ""}`}>
              <div><p className="sys-kicker">PRIMARY MEDIA</p><h2>{selected.primaryAsset ? selected.primaryAsset.filename : selected.videoKey?.startsWith("r2:") ? "Existing lesson video" : selected.primaryAssetId ? "Media file missing" : "Add video, audio, or an image"}</h2><p>{selected.primaryAsset ? `${selected.primaryAsset.kind} | ${formatBytes(selected.primaryAsset.sizeBytes)}` : selected.videoKey?.startsWith("r2:") ? "This earlier upload remains securely attached. Upload it again only if you want it in the reusable library." : selected.primaryAssetId ? "The saved media reference no longer points to a reusable academy file. Replace it before publishing." : "Choose from your academy library or upload something new."}</p></div>
              <button type="button" onClick={() => setWorkspaceTab("media")}>{selected.primaryAsset ? "Change media" : "Open media library"}</button>
              {selected.primaryAsset && <button type="button" onClick={() => editLesson({ primaryAssetId: null, primaryAsset: null })}>Remove</button>}
              {!selected.primaryAsset && selected.primaryAssetId && <button type="button" onClick={() => editLesson({ primaryAssetId: null, primaryAsset: null })}>Clear missing reference</button>}
              {!selected.primaryAsset && selected.videoKey?.startsWith("r2:") && <button type="button" onClick={() => editLesson({ videoKey: "" })}>Remove</button>}
            </section>

            <section className="content-workspace">
              <div className="content-workspace-top">
                <div><p className="sys-kicker">LESSON CONTENT</p><span>Simple formatting, safe learner rendering</span></div>
                <div><button className={contentMode === "write" ? "active" : ""} type="button" onClick={() => setContentMode("write")}>Write</button><button className={contentMode === "preview" ? "active" : ""} type="button" onClick={() => setContentMode("preview")}>Preview</button></div>
              </div>
              {contentMode === "write" ? <>
                <div className="format-toolbar" aria-label="Text formatting">
                  <button type="button" onClick={() => applyFormat("## ", "", "Heading")}>Heading</button>
                  <button type="button" onClick={() => applyFormat("**", "**", "bold text")}><b>Bold</b></button>
                  <button type="button" onClick={() => applyFormat("*", "*", "italic text")}><i>Italic</i></button>
                  <button type="button" onClick={() => applyFormat("- ", "", "List item")}>. List</button>
                  <button type="button" onClick={() => applyFormat("[", "](https://)", "link text")}>Link</button>
                  <button type="button" onClick={() => applyFormat("> ", "", "Helpful callout")}>Callout</button>
                </div>
                <textarea ref={contentEditor} className="content-editor" value={selected.content} onChange={(event) => editLesson({ content: event.target.value })} placeholder={"## What you will learn\n\nExplain the idea in plain language.\n\n- Add a practical step\n- Include an example\n\n> End with a useful prompt or action."} />
              </> : <div className="builder-content-preview">{selected.content ? <LessonContent content={selected.content} lessonTitle={selected.title || "Lesson"} slideDeckMode /> : <p>Start writing to preview the learner experience.</p>}</div>}
            </section>

            <label className="transcript-editor">Captions / transcript
              <textarea
                value={selected.transcript || ""}
                onChange={(event) => editLesson({ transcript: event.target.value })}
                placeholder="Paste a reviewed transcript. Video lessons use it for selectable captions and every learner can read it below the lesson."
              />
              <small>{selected.primaryAsset?.kind === "video" && selected.transcript.trim()
                ? "Ready: Northstar turns this transcript into selectable captions in the learner video player."
                : "Add a reviewed transcript to improve accessibility, search and revision. Video transcripts become selectable captions automatically."}</small>
            </label>

            <section className="self-media-studio" id="media-production">
              <header>
                <div><p className="sys-kicker">SELF-SERVICE MEDIA STUDIO</p><h2>Record, caption and open every lesson professionally.</h2></div>
                <span>Core tools included<br/>AI generation optional</span>
              </header>
              <div className="self-media-grid">
                <article className="narration-production-card">
                  <div className={`narration-meter ${mediaProduction === "recording" ? "active" : ""}`} aria-hidden="true">
                    {Array.from({ length: 17 }, (_, index) => <i key={index} />)}
                  </div>
                  <p className="sys-kicker">NARRATION</p>
                  <h3>Record your own lesson voice.</h3>
                  <p>Use the transcript above as your script, or speak naturally. Northstar records, uploads and attaches the protected audio in one flow.</p>
                  <div className="media-production-status" aria-live="polite">
                    {mediaProduction === "recording" ? <><b>Recording live</b><span>{String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:{String(recordingSeconds % 60).padStart(2, "0")}</span></>
                      : mediaProduction === "processing" ? <><b>Protecting audio</b><span>Please wait.</span></>
                      : <><b>Microphone or upload</b><span>No provider needed</span></>}
                  </div>
                  <div className="media-production-actions">
                    {mediaProduction === "recording"
                      ? <button className="record-stop" type="button" onClick={stopNarrationRecording}>Stop &amp; attach</button>
                      : <button className="production-primary" type="button" disabled={Boolean(mediaProduction)} onClick={startNarrationRecording}>Record narration</button>}
                    <button type="button" disabled={Boolean(mediaProduction)} onClick={() => narrationInput.current?.click()}>Upload audio</button>
                  </div>
                  {selected.transcript.trim() && <button className="advanced-media-action" type="button" disabled={studioBusy || Boolean(mediaProduction)} onClick={generateStudioNarration}>{studioBusy ? "AI narrator is working." : "Use a connected AI narrator"}</button>}
                </article>

                <article className="caption-production-card">
                  <div className="caption-preview" aria-hidden="true">
                    <span>CC</span>
                    <p>{selected.transcript.trim()
                      ? selected.transcript.trim().split(/\s+/).slice(0, 15).join(" ") + (selected.transcript.trim().split(/\s+/).length > 15 ? "." : "")
                      : "Add a reviewed transcript to create learner captions."}</p>
                  </div>
                  <p className="sys-kicker">CAPTIONS</p>
                  <h3>Make the lesson easier to follow.</h3>
                  <p>Northstar converts the reviewed transcript into selectable English captions and keeps the full transcript available below the lesson.</p>
                  <div className="media-production-status">
                    {selected.primaryAsset?.kind !== "video" ? <><b>Add lesson video</b><span>Captions need video</span></>
                      : selected.transcript.trim() ? <><b>Captions ready</b><span>Included</span></>
                      : <><b>Transcript needed</b><span>Paste it above</span></>}
                  </div>
                  <div className="media-production-actions">
                    <Link className="production-link" href={`/learn/${course.id}?preview=1`}>Preview learner captions</Link>
                  </div>
                </article>

                <article className="cinematic-production-card">
                  <div className="cinematic-preview" aria-hidden="true"><span>NORTHSTARLABS</span><b>{selected.title}</b><i /></div>
                  <p className="sys-kicker">CINEMATIC INTRO</p>
                  <h3>Generate a branded opening clip.</h3>
                  <p>Create a polished six-second 16:9 title animation that plays before the main lesson media. No model, credits or external key required.</p>
                  <div className="media-production-status" aria-live="polite">
                    {mediaProduction === "cinematic" ? <><b>Rendering video</b><span>About 6 seconds.</span></>
                      : selected.introAsset ? <><b>Opening attached</b><span>Main media preserved</span></>
                      : <><b>1280 | 720 WebM</b><span>Northstar branded</span></>}
                  </div>
                  <div className="media-production-actions">
                    <button className="production-primary" type="button" disabled={Boolean(mediaProduction)} onClick={createCinematicIntro}>{mediaProduction === "cinematic" ? "Creating intro." : selected.introAsset ? "Replace branded intro" : "Create branded intro"}</button>
                    <button type="button" disabled={Boolean(mediaProduction)} onClick={() => videoInput.current?.click()}>Upload main video</button>
                  </div>
                  {selected.introAsset && <button className="advanced-media-action" type="button" onClick={() => editLesson({ introAssetId: null, introAsset: null })}>Remove opening clip</button>}
                  <Link className="advanced-media-action" href="/dashboard/integrations#creator-studio-providers">Advanced AI production options &rarr;</Link>
                </article>
              </div>
              <footer><b>Nothing is published automatically.</b><span>Preview the complete sequence as a learner. The opening, main media and captions remain separate so one can never destroy another.</span></footer>
              <input
                hidden
                ref={narrationInput}
                type="file"
                accept="audio/mpeg,audio/mp4,audio/webm,audio/ogg,audio/wav"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  const lesson = selected;
                  const asset = await uploadFile(file);
                  if (asset && (!lesson.primaryAsset || confirm("Replace this lesson's current primary media with the uploaded narration?"))) {
                    await attachProducedMedia(asset, lesson, "Narration uploaded, protected, and attached to this lesson.");
                  }
                }}
              />
              <input
                hidden
                ref={videoInput}
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  const lesson = selected;
                  const asset = await uploadFile(file);
                  if (asset && (!lesson.primaryAsset || confirm("Replace this lesson's current primary media with the uploaded video?"))) {
                    await attachProducedMedia(asset, lesson, "Video uploaded, protected, and attached to this lesson.");
                  }
                }}
              />
            </section>

            <section className="resource-editor">
              <div><p className="sys-kicker">DOWNLOADS & RESOURCES</p><h2>Give learners something useful to keep.</h2></div>
              <button type="button" onClick={() => setWorkspaceTab("media")}>Add from media library</button>
              <div>
                {selected.resources.map((resource) => <article key={resource.assetId}><span>{assetIcon(resource.kind)}</span><div><b>{resource.title}</b><small>{formatBytes(resource.sizeBytes)}</small></div><button type="button" onClick={() => editLesson({ resources: selected.resources.filter((item) => item.assetId !== resource.assetId) })}>Remove</button></article>)}
                {!selected.resources.length && <p>No downloadable resources attached.</p>}
              </div>
            </section>

            <fieldset className="quiz-editor">
              <legend>Completion rule</legend>
              {!selected.quiz ? <div className="quiz-empty">
                <div><b>Complete button</b><p>Learners mark this lesson complete themselves.</p></div>
                <button type="button" onClick={() => editQuiz({})}>Add a quiz</button>
              </div> : <>
                <div className="quiz-settings">
                  <label>Quiz title<input value={selected.quiz.title} onChange={(event) => editQuiz({ title: event.target.value })} /></label>
                  <label>Passing score<input type="number" min="1" max="100" value={selected.quiz.passingScore} onChange={(event) => editQuiz({ passingScore: Number(event.target.value) })} /></label>
                  <label>Maximum attempts<input type="number" min="0" max="100" value={selected.quiz.maxAttempts || 0} onChange={(event) => editQuiz({ maxAttempts: Math.max(0, Number(event.target.value || 0)) })} /><small>Use 0 for unlimited attempts.</small></label>
                </div>
                {selected.quiz.questions.map((question, questionIndex) =>
                  <article className="quiz-question-editor" key={question.id}>
                    <div><b>Question {questionIndex + 1}</b><button type="button" onClick={() => editQuiz({ questions: selected.quiz!.questions.filter((_, index) => index !== questionIndex) })}>Remove</button></div>
                    <input aria-label={`Question ${questionIndex + 1}`} value={question.prompt} onChange={(event) => editQuestion(questionIndex, { prompt: event.target.value })} placeholder="Ask a clear question" />
                    {question.options.map((option, optionIndex) =>
                      <label className="quiz-option-editor" key={optionIndex}>
                        <input type="radio" name={`correct-${question.id}`} checked={question.correctIndex === optionIndex} onChange={() => editQuestion(questionIndex, { correctIndex: optionIndex })} />
                        <input value={option} onChange={(event) => editOption(questionIndex, optionIndex, event.target.value)} placeholder={`Answer ${optionIndex + 1}`} />
                      </label>
                    )}
                    <label className="quiz-explanation-editor">
                      Concept to master
                      <input
                        maxLength={100}
                        value={question.conceptLabel || ""}
                        onChange={(event) => editQuestion(questionIndex, { conceptLabel: event.target.value })}
                        placeholder="e.g. Bitcoin scarcity or constructive feedback"
                      />
                      <small>This becomes the learner&apos;s named revision concept after an incorrect answer.</small>
                    </label>
                    <label className="quiz-explanation-editor">
                      Why is the correct answer right?
                      <textarea
                        maxLength={1200}
                        value={question.explanation || ""}
                        onChange={(event) => editQuestion(questionIndex, { explanation: event.target.value })}
                        placeholder="Explain the principle, evidence, or example that makes this answer correct."
                      />
                      <small>Shown after submission so the assessment teaches, not only scores.</small>
                    </label>
                    <button type="button" onClick={() => editQuestion(questionIndex, { options: [...question.options, ""] })}>+ Add answer</button>
                  </article>
                )}
                <div className="quiz-controls">
                  <button type="button" onClick={() => editQuiz({ questions: [...selected.quiz!.questions, blankQuestion()] })}>+ Add question</button>
                  <button type="button" onClick={() => editLesson({ quiz: null })}>Use complete button instead</button>
                </div>
              </>}
            </fieldset>
            <div className="editor-save-row">
              <span>{dirty?.id === selected.id ? "Waiting to autosave." : "Saved"}</span>
              <button className="sys-primary">Save lesson now</button>
            </div>
          </form>
        </>}

        {workspaceTab === "lesson" && !selected && <div className="empty-dashboard builder-empty">
          <p className="sys-kicker">START THE CURRICULUM</p>
          <h2>Add your first lesson.</h2>
          <p>Choose a section on the left and add a text, video, or quiz lesson.</p>
          <button className="sys-primary" disabled={!course.sections[0]} onClick={() => course.sections[0] && addLesson(course.sections[0].id, "text")}>+ Add first lesson</button>
        </div>}
      </section>
    </div>
  </main>;
}

