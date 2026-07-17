"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
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
  questions: QuizQuestion[];
};
type Lesson = {
  id: string;
  title: string;
  content: string;
  videoKey?: string;
  position: number;
  quiz?: Quiz | null;
};
type Course = {
  id: string;
  title: string;
  description: string;
  status: string;
  priceCents: number;
  lessons: Lesson[];
};

const blankQuestion = (): QuizQuestion => ({
  id: crypto.randomUUID(),
  prompt: "",
  options: ["", ""],
  correctIndex: 0,
});

export default function CourseBuilder({ params }: { params: Promise<{ courseId: string }> }) {
  const [courseId, setCourseId] = useState("");
  const [course, setCourse] = useState<Course | null>(null);
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [message, setMessage] = useState("Loading course...");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const supabase = getSupabaseBrowser();

  async function token() {
    return (await supabase?.auth.getSession())?.data.session?.access_token || "";
  }

  useEffect(() => {
    params.then(({ courseId }) => setCourseId(courseId));
  }, [params]);

  useEffect(() => {
    if (!courseId || !supabase) return;
    (async () => {
      const response = await fetch(`/api/courses/${courseId}`, {
        headers: { authorization: `Bearer ${await token()}` },
      });
      if (response.status === 401) {
        location.href = "/login";
        return;
      }
      if (!response.ok) {
        setMessage("Course not found.");
        return;
      }
      const loaded = await response.json() as Course;
      setCourse(loaded);
      setSelected(loaded.lessons[0] || null);
      setMessage("");
    })();
  }, [courseId, supabase]);

  function editLesson(patch: Partial<Lesson>) {
    if (!course || !selected) return;
    const next = { ...selected, ...patch };
    setSelected(next);
    setCourse({
      ...course,
      lessons: course.lessons.map((item) => item.id === next.id ? next : item),
    });
  }

  function editQuiz(patch: Partial<Quiz>) {
    if (!selected) return;
    const quiz = selected.quiz || {
      title: "Lesson quiz",
      passingScore: 80,
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

  function addLesson() {
    if (!course) return;
    const lesson: Lesson = {
      id: crypto.randomUUID(),
      title: "Untitled lesson",
      content: "",
      position: course.lessons.length,
      quiz: null,
    };
    setCourse({ ...course, lessons: [...course.lessons, lesson] });
    setSelected(lesson);
    setMessage("New lesson ready to edit.");
  }

  async function uploadVideo(file: File) {
    if (!selected) return;
    if (file.size > 200 * 1024 * 1024) {
      setMessage("Video files must be 200 MB or smaller.");
      return;
    }
    setUploading(true);
    setMessage("Uploading video...");
    const response = await fetch(`/api/uploads?filename=${encodeURIComponent(file.name)}`, {
      method: "POST",
      headers: {
        "content-type": file.type,
        authorization: `Bearer ${await token()}`,
      },
      body: file,
    });
    const result = await response.json() as { key?: string; error?: string };
    setUploading(false);
    if (!response.ok || !result.key) {
      setMessage(result.error || "Video upload failed.");
      return;
    }
    editLesson({ videoKey: result.key });
    setMessage("Video uploaded. Save the lesson to attach it.");
  }

  async function saveLesson(event?: FormEvent) {
    event?.preventDefault();
    if (!selected) return false;
    setMessage("Saving lesson...");

    const lessonResponse = await fetch("/api/lessons", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ courseId, lesson: selected }),
    });
    if (!lessonResponse.ok) {
      setMessage("Lesson could not be saved.");
      return false;
    }

    const quizResponse = await fetch("/api/quizzes", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({
        lessonId: selected.id,
        title: selected.quiz?.title,
        passingScore: selected.quiz?.passingScore,
        questions: selected.quiz?.questions || [],
      }),
    });
    const quizResult = await quizResponse.json() as { error?: string };
    if (!quizResponse.ok) {
      setMessage(quizResult.error || "Quiz could not be saved.");
      return false;
    }
    setMessage("Lesson and completion rules saved.");
    return true;
  }

  async function saveCourse(status = course?.status || "draft") {
    if (!course) return;
    if (status === "published" && !course.lessons.length) {
      setMessage("Add at least one lesson before publishing.");
      return;
    }
    setMessage(status === "published" ? "Publishing..." : "Saving...");
    if (selected && !(await saveLesson())) return;
    const response = await fetch(`/api/courses/${courseId}`, {
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
      }),
    });
    if (response.ok) {
      setCourse({ ...course, status });
      setMessage(status === "published"
        ? "Course published - learners can now enrol."
        : "Course saved.");
    } else {
      setMessage("Course could not be saved.");
    }
  }

  if (!course) {
    return <main className="system-loading"><div><b>NorthStarLabs</b><p>{message}</p></div></main>;
  }

  return <main className="builder-page">
    <header className="builder-top">
      <a href="/dashboard">← Courses</a>
      <div>
        <input
          aria-label="Course title"
          value={course.title}
          onChange={(event) => setCourse({ ...course, title: event.target.value })}
        />
        <span>{course.status} · {message || "Ready"}</span>
      </div>
      <div>
        <a className="builder-preview" href={course.status === "published" ? `/courses/${course.id}` : "#"}>
          Preview
        </a>
        <button
          className="sys-primary"
          onClick={() => saveCourse(course.status === "published" ? "draft" : "published")}
        >
          {course.status === "published" ? "Unpublish" : "Save & publish"}
        </button>
      </div>
    </header>

    <div className="builder-layout">
      <aside className="curriculum">
        <div><p className="sys-kicker">CURRICULUM</p><b>{course.lessons.length} lessons</b></div>
        <section>
          {course.lessons.map((lesson, index) =>
            <button
              className={selected?.id === lesson.id ? "active" : ""}
              onClick={() => setSelected(lesson)}
              key={lesson.id}
            >
              <span>{index + 1}</span>
              <div><b>{lesson.title}</b><small>{lesson.quiz ? "Lesson + quiz" : "Lesson"}</small></div>
              <i>{lesson.videoKey ? "▶" : "○"}</i>
            </button>
          )}
        </section>
        <div className="add-menu"><button onClick={addLesson}>＋ Add lesson</button></div>
      </aside>

      <section className="lesson-editor">
        {selected ? <>
          <div className="editor-heading">
            <div><p className="sys-kicker">LESSON EDITOR</p><h1>{selected.title}</h1></div>
          </div>
          <form onSubmit={saveLesson}>
            <label>
              Lesson title
              <input value={selected.title} onChange={(event) => editLesson({ title: event.target.value })} />
            </label>
            <label>
              Lesson content
              <textarea
                className="content-editor"
                value={selected.content}
                onChange={(event) => editLesson({ content: event.target.value })}
                placeholder="Write the lesson, instructions, links, and resources here."
              />
            </label>

            <fieldset className="video-editor">
              <legend>Lesson video</legend>
              <p>Upload an MP4, WebM, or Ogg file up to 200 MB, or paste a direct video-file URL.</p>
              <input
                ref={fileInput}
                hidden
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={(event) => event.target.files?.[0] && uploadVideo(event.target.files[0])}
              />
              <div>
                <button type="button" onClick={() => fileInput.current?.click()} disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload video"}
                </button>
                {selected.videoKey && <button type="button" onClick={() => editLesson({ videoKey: "" })}>Remove</button>}
              </div>
              <label>
                Video URL or uploaded file
                <input
                  value={selected.videoKey || ""}
                  onChange={(event) => editLesson({ videoKey: event.target.value })}
                  placeholder="https://example.com/lesson.mp4"
                />
              </label>
            </fieldset>

            <fieldset className="quiz-editor">
              <legend>Completion rule</legend>
              {!selected.quiz ? <div className="quiz-empty">
                <div>
                  <b>Complete button</b>
                  <p>Learners mark this lesson complete themselves.</p>
                </div>
                <button type="button" onClick={() => editQuiz({})}>Add a quiz</button>
              </div> : <>
                <div className="quiz-settings">
                  <label>
                    Quiz title
                    <input
                      value={selected.quiz.title}
                      onChange={(event) => editQuiz({ title: event.target.value })}
                    />
                  </label>
                  <label>
                    Passing score
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={selected.quiz.passingScore}
                      onChange={(event) => editQuiz({ passingScore: Number(event.target.value) })}
                    />
                  </label>
                </div>
                {selected.quiz.questions.map((question, questionIndex) =>
                  <article className="quiz-question-editor" key={question.id}>
                    <div>
                      <b>Question {questionIndex + 1}</b>
                      <button
                        type="button"
                        onClick={() => editQuiz({
                          questions: selected.quiz!.questions.filter((_, index) => index !== questionIndex),
                        })}
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      aria-label={`Question ${questionIndex + 1}`}
                      value={question.prompt}
                      onChange={(event) => editQuestion(questionIndex, { prompt: event.target.value })}
                      placeholder="Ask a clear question"
                    />
                    {question.options.map((option, optionIndex) =>
                      <label className="quiz-option-editor" key={optionIndex}>
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={question.correctIndex === optionIndex}
                          onChange={() => editQuestion(questionIndex, { correctIndex: optionIndex })}
                        />
                        <input
                          value={option}
                          onChange={(event) => editOption(questionIndex, optionIndex, event.target.value)}
                          placeholder={`Answer ${optionIndex + 1}`}
                        />
                      </label>
                    )}
                    <button
                      type="button"
                      onClick={() => editQuestion(questionIndex, { options: [...question.options, ""] })}
                    >
                      + Add answer
                    </button>
                  </article>
                )}
                <div className="quiz-controls">
                  <button
                    type="button"
                    onClick={() => editQuiz({ questions: [...selected.quiz!.questions, blankQuestion()] })}
                  >
                    + Add question
                  </button>
                  <button type="button" onClick={() => editLesson({ quiz: null })}>Use complete button instead</button>
                </div>
              </>}
            </fieldset>

            <button className="sys-primary">Save lesson</button>
          </form>
        </> : <div className="empty-dashboard">
          <h2>Add your first lesson</h2>
          <p>Courses need at least one lesson before they can be published.</p>
          <button className="sys-primary" onClick={addLesson}>＋ Add lesson</button>
        </div>}
      </section>
    </div>
  </main>;
}
