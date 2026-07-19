"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LessonContent } from "../../../../lib/lesson-content";
import { getSupabaseBrowser } from "../../../../lib/supabase-client";

type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
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
  title: string;
  description: string;
  status: string;
  priceCents: number;
  enforceLessonOrder: number | boolean;
  availableFrom: number | null;
  certificateTitle: string;
  certificateAccent: string;
  certificateValidDays: number;
  sections: Section[];
  lessons: Lesson[];
  media: Asset[];
};

const blankQuestion = (): QuizQuestion => ({
  id: crypto.randomUUID(),
  prompt: "",
  options: ["", ""],
  correctIndex: 0,
});

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(bytes > 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

function assetIcon(kind: string) {
  if (kind === "video") return "▶";
  if (kind === "audio") return "♫";
  if (kind === "image") return "▧";
  if (kind === "archive") return "ZIP";
  return "DOC";
}

function dateTimeInputValue(timestamp: number | null) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function CourseBuilder({ params }: { params: Promise<{ courseId: string }> }) {
  const [courseId, setCourseId] = useState("");
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("Loading course…");
  const [dirty, setDirty] = useState<{ id: string; revision: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaFilter, setMediaFilter] = useState("all");
  const [workspaceTab, setWorkspaceTab] = useState<"lesson" | "media" | "settings">("lesson");
  const [contentMode, setContentMode] = useState<"write" | "preview">("write");
  const [draggedLessonId, setDraggedLessonId] = useState("");
  const [publishingErrors, setPublishingErrors] = useState<string[]>([]);
  const revision = useRef(0);
  const contentEditor = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const supabase = getSupabaseBrowser();

  const selected = useMemo(
    () => course?.lessons.find((lesson) => lesson.id === selectedId) || null,
    [course, selectedId],
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
      setMessage("All changes saved");
    })();
  }, [courseId, supabase, token]);

  const persistLesson = useCallback(async (
    lesson: Lesson,
    expectedRevision?: number,
    quiet = false,
  ) => {
    if (!courseId) return false;
    if (!quiet) setMessage("Saving lesson…");
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
    setCourse({
      ...course,
      lessons: course.lessons.map((item) =>
        item.id === selected.id ? { ...item, ...patch } : item
      ),
    });
    markDirty(selected.id);
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

  async function chooseLesson(lessonId: string) {
    if (selected && dirty?.id === selected.id) {
      const saved = await persistLesson(selected, dirty.revision, true);
      if (!saved) return;
    }
    setSelectedId(lessonId);
    setWorkspaceTab("lesson");
    setContentMode("write");
  }

  async function addLesson(sectionId: string, lessonType = "text") {
    if (!course) return;
    if (selected && dirty?.id === selected.id) {
      if (!await persistLesson(selected, dirty.revision, true)) return;
    }
    const sectionLessons = course.lessons.filter((lesson) => lesson.sectionId === sectionId);
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
    setCourse({ ...course, lessons: [...course.lessons, lesson] });
    setSelectedId(lesson.id);
    setWorkspaceTab("lesson");
    markDirty(lesson.id);
    setMessage("New lesson created — autosaving…");
  }

  async function deleteLesson(lesson: Lesson) {
    if (!course || !confirm(`Delete “${lesson.title}” and its learner progress?`)) return;
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
      createdAt: Date.now(),
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
    setMessage("Section added");
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
    if (!course || !confirm(`Delete “${section.title}”? Its lessons will move to another section.`)) return;
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
    setMessage(status === "published" ? "Checking and publishing…" : "Saving course…");
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
    setCourse((current) => current ? { ...current, status } : current);
    setMessage(status === "published" ? "Course published — learners can enrol" : status === "draft" && course.status === "published" ? "Course unpublished" : "Course saved");
  }

  async function uploadFile(file: File) {
    if (!course) return;
    setUploading(true);
    setUploadProgress(0);
    setMessage(`Uploading ${file.name}…`);
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
      return;
    }
    setCourse((current) => current ? { ...current, media: [result.asset!, ...current.media] } : current);
    setMessage(`${result.asset.filename} added to the media library`);
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
    return <main className="system-loading"><div><b>NorthStarLabs</b><p>{message}</p></div></main>;
  }

  const filteredMedia = course.media.filter((asset) =>
    mediaFilter === "all" || asset.kind === mediaFilter
  );

  return <main className="builder-page builder-page-expanded">
    <header className="builder-top">
      <Link href="/dashboard">← Creator workspace</Link>
      <div>
        <input
          aria-label="Course title"
          value={course.title}
          onChange={(event) => setCourse({ ...course, title: event.target.value })}
        />
        <span className={dirty ? "builder-save-state pending" : "builder-save-state"}>
          {course.status} · {message}
        </span>
      </div>
      <div>
        <button className="builder-tool" onClick={() => setWorkspaceTab("settings")}>Course settings</button>
        <Link className="builder-preview" href={`/learn/${course.id}?preview=1`}>Learner preview</Link>
        <button className="builder-tool" onClick={() => saveCourse(course.status === "published" ? "draft" : "published")}>
          {course.status === "published" ? "Unpublish" : "Publish"}
        </button>
        <button className="sys-primary" onClick={() => saveCourse(course.status)}>Save</button>
      </div>
    </header>

    <div className="builder-layout">
      <aside className="curriculum curriculum-expanded">
        <div className="curriculum-heading">
          <div><p className="sys-kicker">CURRICULUM</p><b>{course.lessons.length} lessons</b></div>
          <button onClick={addSection}>＋ Section</button>
        </div>
        <div className="curriculum-sections">
          {[...course.sections].sort((a, b) => a.position - b.position).map((section, sectionIndex) =>
            <section
              className="curriculum-section"
              key={section.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropLesson(section.id)}
            >
              <header>
                <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
                <input
                  aria-label={`Section ${sectionIndex + 1} title`}
                  value={section.title}
                  onChange={(event) => editSection(section.id, event.target.value)}
                  onBlur={() => saveSection(section)}
                />
                <div>
                  <button title="Move section up" disabled={sectionIndex === 0} onClick={() => moveSection(section.id, -1)}>↑</button>
                  <button title="Move section down" disabled={sectionIndex === course.sections.length - 1} onClick={() => moveSection(section.id, 1)}>↓</button>
                  <button title="Delete section" onClick={() => deleteSection(section)}>×</button>
                </div>
              </header>
              <div className="curriculum-lessons">
                {course.lessons
                  .filter((lesson) => lesson.sectionId === section.id)
                  .sort((a, b) => a.position - b.position)
                  .map((lesson, lessonIndex, siblings) =>
                    <article
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
                        <div><b>{lesson.title}</b><small>{lesson.lessonType}{lesson.quiz ? " · quiz" : ""}</small></div>
                      </button>
                      <div className="lesson-order-controls">
                        <button disabled={lessonIndex === 0} onClick={() => moveLesson(lesson.id, -1)}>↑</button>
                        <button disabled={lessonIndex === siblings.length - 1} onClick={() => moveLesson(lesson.id, 1)}>↓</button>
                      </div>
                    </article>
                  )}
              </div>
              <div className="lesson-add-row">
                <button onClick={() => addLesson(section.id, "text")}>＋ Text</button>
                <button onClick={() => addLesson(section.id, "video")}>＋ Video</button>
                <button onClick={() => addLesson(section.id, "quiz")}>＋ Quiz</button>
              </div>
            </section>
          )}
        </div>
        <button className="media-library-button" onClick={() => setWorkspaceTab("media")}>
          <span>▦</span><div><b>Academy media library</b><small>{course.media.length} reusable files</small></div>
        </button>
      </aside>

      <section className="lesson-editor">
        {workspaceTab === "settings" && <div className="course-settings-editor">
          <div className="editor-heading">
            <div><p className="sys-kicker">COURSE SETTINGS</p><h1>Describe and publish your course.</h1></div>
          </div>
          <label>Course title<input value={course.title} onChange={(event) => setCourse({ ...course, title: event.target.value })} /></label>
          <label>Course description<textarea value={course.description} onChange={(event) => setCourse({ ...course, description: event.target.value })} placeholder="Explain the result learners can expect and who the course is for." /></label>
          <label>Price in South African rand<input type="number" min="0" step="1" value={course.priceCents / 100} onChange={(event) => setCourse({ ...course, priceCents: Math.max(0, Math.round(Number(event.target.value || 0) * 100)) })} /></label>
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
            <p className="sys-kicker">PUBLISHING CHECKLIST</p>
            <ul>
              <li className={course.title.trim().length >= 3 ? "done" : ""}>Clear course title</li>
              <li className={course.description.trim().length >= 20 ? "done" : ""}>Useful course description</li>
              <li className={course.lessons.length ? "done" : ""}>At least one complete lesson</li>
              <li className={course.sections.length && course.sections.every((section) => section.title.trim()) ? "done" : ""}>Curriculum organised into named sections</li>
            </ul>
            {!!publishingErrors.length && <div className="publishing-errors">{publishingErrors.map((error) => <p key={error}>{error}</p>)}</div>}
          </div>
          <div className="editor-save-row">
            <button className="builder-tool" onClick={() => setWorkspaceTab("lesson")}>Back to lessons</button>
            <button className="sys-primary" onClick={() => saveCourse(course.status)}>Save course settings</button>
          </div>
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
                <div><b title={asset.filename}>{asset.filename}</b><small>{asset.kind} · {formatBytes(asset.sizeBytes)}</small></div>
                {asset.kind === "image" && <label>Image description<input value={asset.altText || ""} onChange={(event) => updateAsset(asset.id, { altText: event.target.value })} onBlur={() => saveAssetAlt(asset)} placeholder="Describe the image for learners" /></label>}
                <div className="media-card-actions">
                  {selected && ["video", "audio", "image"].includes(asset.kind) && <button className={isPrimary ? "active" : ""} onClick={() => isPrimary ? editLesson({ primaryAssetId: null, primaryAsset: null }) : attachPrimary(asset)}>{isPrimary ? "Remove media" : "Use as media"}</button>}
                  {selected && <button className={isResource ? "active" : ""} onClick={() => toggleResource(asset)}>{isResource ? "Remove resource" : "Add resource"}</button>}
                  <button className="delete-media" onClick={() => deleteAsset(asset)}>Delete</button>
                </div>
              </article>;
            })}
            {!filteredMedia.length && <div className="media-empty"><b>No {mediaFilter === "all" ? "" : mediaFilter} files yet.</b><p>Upload a file to add it to this academy’s reusable library.</p></div>}
          </div>
        </div>}

        {workspaceTab === "lesson" && selected && <>
          <div className="editor-heading">
            <div><p className="sys-kicker">LESSON EDITOR</p><h1>{selected.title}</h1><p>{dirty?.id === selected.id ? "Autosave pending…" : "Changes are saved automatically."}</p></div>
            <button className="danger-plain" onClick={() => deleteLesson(selected)}>Delete lesson</button>
          </div>
          <form onSubmit={(event: FormEvent) => {
            event.preventDefault();
            void persistLesson(selected, dirty?.revision);
          }}>
            <div className="lesson-meta-grid">
              <label>Lesson title<input required value={selected.title} onChange={(event) => editLesson({ title: event.target.value })} /></label>
              <label>Lesson type<select value={selected.lessonType} onChange={(event) => editLesson({ lessonType: event.target.value })}><option value="text">Text lesson</option><option value="video">Video lesson</option><option value="audio">Audio lesson</option><option value="resource">Resource lesson</option><option value="quiz">Quiz lesson</option></select></label>
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

            <section className="primary-media-editor">
              <div><p className="sys-kicker">PRIMARY MEDIA</p><h2>{selected.primaryAsset ? selected.primaryAsset.filename : selected.videoKey?.startsWith("r2:") ? "Existing lesson video" : "Add video, audio, or an image"}</h2><p>{selected.primaryAsset ? `${selected.primaryAsset.kind} · ${formatBytes(selected.primaryAsset.sizeBytes)}` : selected.videoKey?.startsWith("r2:") ? "This earlier upload remains securely attached. Upload it again only if you want it in the reusable library." : "Choose from your academy library or upload something new."}</p></div>
              <button type="button" onClick={() => setWorkspaceTab("media")}>{selected.primaryAsset ? "Change media" : "Open media library"}</button>
              {selected.primaryAsset && <button type="button" onClick={() => editLesson({ primaryAssetId: null, primaryAsset: null })}>Remove</button>}
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
                  <button type="button" onClick={() => applyFormat("- ", "", "List item")}>• List</button>
                  <button type="button" onClick={() => applyFormat("[", "](https://)", "link text")}>Link</button>
                  <button type="button" onClick={() => applyFormat("> ", "", "Helpful callout")}>Callout</button>
                </div>
                <textarea ref={contentEditor} className="content-editor" value={selected.content} onChange={(event) => editLesson({ content: event.target.value })} placeholder={"## What you will learn\n\nExplain the idea in plain language.\n\n- Add a practical step\n- Include an example\n\n> End with a useful prompt or action."} />
              </> : <div className="builder-content-preview">{selected.content ? <LessonContent content={selected.content} /> : <p>Start writing to preview the learner experience.</p>}</div>}
            </section>

            <label className="transcript-editor">Captions / transcript
              <textarea
                value={selected.transcript || ""}
                onChange={(event) => editLesson({ transcript: event.target.value })}
                placeholder="Paste a readable transcript for video or audio learners. It will appear beneath the lesson."
              />
              <small>Transcripts improve accessibility and make the lesson searchable.</small>
            </label>

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
                    <button type="button" onClick={() => editQuestion(questionIndex, { options: [...question.options, ""] })}>＋ Add answer</button>
                  </article>
                )}
                <div className="quiz-controls">
                  <button type="button" onClick={() => editQuiz({ questions: [...selected.quiz!.questions, blankQuestion()] })}>＋ Add question</button>
                  <button type="button" onClick={() => editLesson({ quiz: null })}>Use complete button instead</button>
                </div>
              </>}
            </fieldset>
            <div className="editor-save-row">
              <span>{dirty?.id === selected.id ? "Waiting to autosave…" : "Saved"}</span>
              <button className="sys-primary">Save lesson now</button>
            </div>
          </form>
        </>}

        {workspaceTab === "lesson" && !selected && <div className="empty-dashboard builder-empty">
          <p className="sys-kicker">START THE CURRICULUM</p>
          <h2>Add your first lesson.</h2>
          <p>Choose a section on the left and add a text, video, or quiz lesson.</p>
          <button className="sys-primary" disabled={!course.sections[0]} onClick={() => course.sections[0] && addLesson(course.sections[0].id, "text")}>＋ Add first lesson</button>
        </div>}
      </section>
    </div>
  </main>;
}
