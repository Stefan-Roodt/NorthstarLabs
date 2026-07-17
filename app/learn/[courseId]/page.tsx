"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

type Quiz = {
  id: string;
  title: string;
  passingScore: number;
  questions: Array<{ id: string; prompt: string; options: string[] }>;
};
type Lesson = {
  id: string;
  title: string;
  content: string;
  videoKey?: string;
  completed: number;
  quiz?: Quiz | null;
};
type Certificate = { code: string; issuedAt: number };

function VideoPlayer({ videoKey, accessToken }: { videoKey: string; accessToken: () => Promise<string> }) {
  const [source, setSource] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;
    setError("");
    setSource("");

    if (!videoKey.startsWith("r2:")) {
      setSource(videoKey);
      return;
    }

    (async () => {
      const response = await fetch(`/api/uploads?key=${encodeURIComponent(videoKey)}`, {
        headers: { authorization: `Bearer ${await accessToken()}` },
      });
      if (!response.ok) {
        if (!cancelled) setError("This video could not be loaded.");
        return;
      }
      objectUrl = URL.createObjectURL(await response.blob());
      if (!cancelled) setSource(objectUrl);
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [videoKey]);

  if (error) return <div className="video-placeholder"><p>{error}</p></div>;
  if (!source) return <div className="video-placeholder"><p>Loading lesson video...</p></div>;
  return <div className="lesson-video">
    <video controls preload="metadata" src={source}>
      Your browser does not support video playback.
    </video>
  </div>;
}

export default function Learn({ params }: { params: Promise<{ courseId: string }> }) {
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState("");
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const supabase = getSupabaseBrowser();

  async function token() {
    return (await supabase?.auth.getSession())?.data.session?.access_token || "";
  }

  useEffect(() => {
    params.then((value) => setId(value.courseId));
  }, [params]);

  useEffect(() => {
    if (!id || !supabase) return;
    (async () => {
      const accessToken = await token();
      if (!accessToken) {
        location.href = "/login";
        return;
      }
      const response = await fetch(`/api/learn/${id}`, {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
        return;
      }
      setTitle(data.course.title);
      setLessons(data.lessons);
      setCertificate(data.certificate || null);
    })();
  }, [id, supabase]);

  useEffect(() => {
    setAnswers([]);
    setQuizResult("");
  }, [current]);

  function continueToNext() {
    if (current < lessons.length - 1) setCurrent(current + 1);
  }

  async function completeLesson() {
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
    const lesson = lessons[current];
    if (!lesson.quiz) return;
    if (lesson.quiz.questions.some((_, index) => !Number.isInteger(answers[index]))) {
      setQuizResult("Choose an answer for every question.");
      return;
    }
    setQuizResult("Checking your answers...");
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

  if (error) {
    return <main className="system-loading"><div>
      <b>Access needed</b><p>{error}</p>
      <a className="sys-primary" href={`/courses/${id}`}>View course</a>
    </div></main>;
  }
  if (!lessons.length) return <main className="system-loading"><p>Preparing your course...</p></main>;

  const done = lessons.filter((lesson) => lesson.completed).length;
  const progress = Math.round(done / lessons.length * 100);
  const lesson = lessons[current];

  return <main className="learn-page">
    <header>
      <a className="system-brand" href="/dashboard">✦ NORTHSTARLABS</a>
      <div><span>{progress}% complete</span><i><b style={{ width: `${progress}%` }} /></i></div>
      <a href="/courses">Course library</a>
    </header>
    {certificate && <div className="certificate-ready">
      <div><b>Course completed</b><span>Your verified NorthStarLabs certificate is ready.</span></div>
      <a href={`/certificates/${certificate.code}`}>View certificate</a>
    </div>}
    <div className="learn-layout">
      <aside>
        <p className="sys-kicker">{title}</p>
        <h2>Your curriculum</h2>
        {lessons.map((item, index) =>
          <button
            key={item.id}
            className={index === current ? "active" : item.completed ? "done" : ""}
            onClick={() => setCurrent(index)}
          >
            <span>{item.completed ? "✓" : index + 1}</span>
            <span className="lesson-nav-title">{item.title}{item.quiz && <small>Quiz required</small>}</span>
          </button>
        )}
      </aside>
      <section>
        {lesson.videoKey
          ? <VideoPlayer videoKey={lesson.videoKey} accessToken={token} />
          : <div className="lesson-banner">NORTHSTARLABS · LESSON {current + 1}</div>}
        <p className="sys-kicker">LESSON {current + 1} OF {lessons.length}</p>
        <h1>{lesson.title}</h1>
        <div className="lesson-copy">
          {lesson.content || "Your creator is still adding the content for this lesson."}
        </div>

        {lesson.quiz && <section className="learner-quiz">
          <div>
            <p className="sys-kicker">KNOWLEDGE CHECK</p>
            <h2>{lesson.quiz.title}</h2>
            <span>Score {lesson.quiz.passingScore}% or higher to complete this lesson.</span>
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
          {lesson.completed
            ? <button className="sys-primary" onClick={continueToNext}>
                {current === lessons.length - 1 ? "Lesson complete" : "Continue to next lesson →"}
              </button>
            : <button className="sys-primary" onClick={submitQuiz}>Submit quiz</button>}
        </section>}

        {!lesson.quiz && <div className="lesson-actions">
          <button disabled={current === 0} onClick={() => setCurrent(current - 1)}>← Previous</button>
          <button className="sys-primary" onClick={completeLesson}>
            {lesson.completed
              ? current === lessons.length - 1 ? "Lesson completed" : "Completed - continue →"
              : "Complete & continue →"}
          </button>
        </div>}
      </section>
    </div>
  </main>;
}
