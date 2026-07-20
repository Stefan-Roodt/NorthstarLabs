"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabaseBrowser } from "../../../lib/supabase-client";
import { getStarterCourse, type CatalogCourse } from "../../../lib/starter-courses";

type CourseSection = {
  id: string;
  title: string;
  position: number;
  lessons: Array<{
    id: string;
    title: string;
    type: string;
    durationMinutes: number;
    hasVideo: boolean;
    hasAssessment: boolean;
  }>;
};

type CourseDetail = CatalogCourse & {
  certificateTitle?: string;
  facultyHeadline?: string | null;
  facultyBio?: string | null;
  sectionCount?: number;
  assessmentCount?: number;
  playableVideoCount?: number;
  resourceCount?: number;
  durationMinutes?: number;
  sections?: CourseSection[];
};

function lessonLabel(lesson: CourseSection["lessons"][number]) {
  if (lesson.hasAssessment || lesson.type === "quiz") return "Assessment";
  if (lesson.hasVideo) return "Video";
  if (lesson.type === "text") return "Lesson";
  return lesson.type.replaceAll("_", " ");
}

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [id, setId] = useState("");
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const autoEnrolAttempted = useRef(false);

  useEffect(() => {
    params.then((value) => setId(value.courseId));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/catalog/${encodeURIComponent(id)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Course not found.");
        return response.json() as Promise<CourseDetail>;
      })
      .then(setCourse)
      .catch(() => setCourse(getStarterCourse(id) || null))
      .finally(() => setLoaded(true));
  }, [id]);

  const enrol = useCallback(async () => {
    if (enrolling) return;
    setEnrolling(true);
    setMessage("Joining your course…");
    const supabase = getSupabaseBrowser();
    const session = (await supabase?.auth.getSession())?.data.session;
    if (!session) {
      const returnTo = `/courses/${id}?enrol=1`;
      location.href = `/login?next=${encodeURIComponent(returnTo)}`;
      return;
    }
    const response = await fetch("/api/enrollments", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ courseId: id }),
    });
    if (response.ok) {
      location.href = `/learn/${id}`;
    } else {
      const result = await response.json().catch(() => ({ error: "We could not enrol you. Please try again." }));
      setMessage(result.error || "We could not enrol you. Please try again.");
      setEnrolling(false);
    }
  }, [enrolling, id]);

  useEffect(() => {
    if (!loaded || !course || autoEnrolAttempted.current) return;
    const shouldEnrol = new URLSearchParams(location.search).get("enrol") === "1";
    if (!shouldEnrol) return;
    autoEnrolAttempted.current = true;
    const timeout = window.setTimeout(() => void enrol(), 0);
    return () => window.clearTimeout(timeout);
  }, [course, enrol, loaded]);

  if (!loaded) return <main className="system-loading"><p>Preparing course details…</p></main>;
  if (!course) return (
    <main className="system-loading">
      <div>
        <b>Course not found</b>
        <p>This course may have been unpublished or moved.</p>
        <Link className="sys-primary" href="/courses">Browse all courses</Link>
      </div>
    </main>
  );

  const starter = getStarterCourse(course.id);
  const curriculum = course.sections || [];
  const hasRealCurriculum = curriculum.length > 0;
  const assessmentCount = Number(course.assessmentCount || 0);
  const videoCount = Number(course.playableVideoCount || 0);
  const durationHours = course.durationMinutes
    ? Math.max(1, Math.round(course.durationMinutes / 60))
    : null;
  const facultyInitials = (course.creator || "NorthstarLabs")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <main className="course-sales course-sales-expanded">
      <header>
        <Link className="system-brand" href={course.schoolSlug ? `/schools/${course.schoolSlug}` : "/"}>✦ {course.schoolName || "NORTHSTARLABS"}</Link>
        <nav>
          <a href={course.schoolSlug ? `/schools/${course.schoolSlug}` : "/courses"}>{course.schoolSlug ? "Academy" : "All courses"}</a>
          <a href={`/login?next=${encodeURIComponent(`/courses/${id}`)}`}>Sign in</a>
        </nav>
      </header>

      <section className="course-sales-hero">
        <div>
          <p className="sys-kicker">{starter?.category || "PRACTICAL COURSE"} · {course.lessonCount} LESSONS</p>
          <h1>{course.title}</h1>
          <p>{starter?.promise || course.description || "A practical learning experience designed to move you from knowing to doing."}</p>
          <div className="course-byline">
            <span>{facultyInitials}</span>
            <p>
              <b>{course.creator || "NorthstarLabs"}</b>
              <small>{course.facultyHeadline || "Practical learning, built for action"}</small>
            </p>
          </div>
        </div>

        <aside className="panel course-enrol-card">
          <div className={`course-art ${starter?.artClass || ""}`}>
            <span>{course.title.slice(0, 2).toUpperCase()}</span>
            <small>{starter?.category || "Course"}</small>
          </div>
          <p className="sys-kicker">START LEARNING TODAY</p>
          <h2>{course.priceCents ? `R${(course.priceCents / 100).toFixed(0)}` : "Free"}</h2>
          <button className="sys-primary" disabled={enrolling} onClick={enrol}>
            {enrolling ? "Joining course…" : course.priceCents ? "Continue to checkout" : "Enrol for free →"}
          </button>
          {message && <p className="form-message" role="status">{message}</p>}
          <ul>
            <li>{course.lessonCount} practical lessons</li>
            <li>{assessmentCount || "Built-in"} knowledge checks</li>
            <li>{videoCount ? `${videoCount} faculty video${videoCount === 1 ? "" : "s"} plus guided lessons` : "Guided written lessons and labs"}</li>
            <li>{course.certificateTitle || "Verifiable completion certificate"}</li>
            <li>Progress saved to your account</li>
          </ul>
          <small>Secure access through your NorthstarLabs account.</small>
        </aside>
      </section>

      <section className="course-proof-bar">
        <div><span>LEVEL</span><b>{starter?.level || "All levels"}</b></div>
        <div><span>FORMAT</span><b>{starter?.format || "Self-paced"}</b></div>
        <div><span>TIME</span><b>{durationHours ? `${durationHours} guided hours` : starter?.duration || `${course.lessonCount} lessons`}</b></div>
        <div><span>PRICE</span><b>{course.priceCents ? `R${(course.priceCents / 100).toFixed(0)}` : "Free"}</b></div>
      </section>

      <section className="course-details">
        <div className="course-outcomes">
          <p className="sys-kicker">WHAT YOU WILL LEAVE WITH</p>
          <h2>Useful progress—not more information.</h2>
          <p>{course.description}</p>
          <ul>
            {(starter?.outcomes || [
              "A clear understanding of the core ideas",
              "Practical actions you can apply immediately",
              "A record of your learning progress",
            ]).map((outcome) => <li key={outcome}><span>✓</span>{outcome}</li>)}
          </ul>
        </div>

        <aside className="course-audience panel">
          <p className="sys-kicker">THIS COURSE IS FOR</p>
          <h3>People ready to put ideas into practice.</h3>
          <ul>
            {(starter?.audience || ["Independent learners", "Working professionals", "Curious builders"])
              .map((person) => <li key={person}>{person}</li>)}
          </ul>
          {course.facultyBio && <div className="course-faculty-note">
            <small>YOUR FACULTY</small>
            <p>{course.facultyBio}</p>
          </div>}
        </aside>
      </section>

      <section className="course-curriculum">
        <div className="course-curriculum-heading">
          <div>
            <p className="sys-kicker">COURSE CURRICULUM</p>
            <h2>See exactly what you will learn.</h2>
          </div>
          <p>
            {course.sectionCount || curriculum.length || 1} modules · {course.lessonCount} lessons
            {assessmentCount ? ` · ${assessmentCount} assessments` : ""}
          </p>
        </div>
        {hasRealCurriculum
          ? <div className="course-module-list">
              {curriculum.map((section, sectionIndex) => (
                <article className="course-module" key={section.id}>
                  <header>
                    <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
                    <div>
                      <small>MODULE {sectionIndex + 1}</small>
                      <h3>{section.title}</h3>
                    </div>
                    <b>{section.lessons.length} lessons</b>
                  </header>
                  <ol>
                    {section.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <span>{lesson.title}</span>
                        <small>
                          {lessonLabel(lesson)}
                          {lesson.durationMinutes ? ` · ${lesson.durationMinutes} min` : ""}
                        </small>
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          : <div className="curriculum-list">
              {(starter?.curriculum || []).map((lesson, index) => (
                <article key={lesson.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><h3>{lesson.title}</h3><p>{lesson.description}</p></div>
                  <small>{index === (starter?.curriculum.length || 0) - 1 ? "Finish" : "Learn"}</small>
                </article>
              ))}
            </div>}
      </section>

      <section className="course-completion-standard">
        <div>
          <p className="sys-kicker">A CERTIFICATE THAT MEANS SOMETHING</p>
          <h2>Complete the work. Prove the learning.</h2>
          <p>This is not a click-through certificate. Your progress is recorded lesson by lesson and every required assessment must be passed.</p>
        </div>
        <ol>
          <li><span>01</span><div><b>Complete the curriculum</b><p>Work through all {course.lessonCount} lessons in order.</p></div></li>
          <li><span>02</span><div><b>Pass the assessments</b><p>{assessmentCount ? `Demonstrate understanding across ${assessmentCount} knowledge checks.` : "Meet the course assessment standard."}</p></div></li>
          <li><span>03</span><div><b>Earn verifiable proof</b><p>Receive your {course.certificateTitle || "NorthstarLabs certificate"}, with a public verification code.</p></div></li>
        </ol>
      </section>

      <section className="course-final-cta">
        <p className="sys-kicker">YOUR NEXT USEFUL STEP</p>
        <h2>Start the course. Build as you learn.</h2>
        <p>{course.priceCents ? "Sign in to continue to secure checkout." : "No credit card required for this course."}</p>
        <button className="sys-primary" disabled={enrolling} onClick={enrol}>{enrolling ? "Joining course…" : course.priceCents ? "Continue to checkout" : "Enrol for free →"}</button>
      </section>

      <footer className="catalog-footer">
        <Link className="system-brand" href={course.schoolSlug ? `/schools/${course.schoolSlug}` : "/"}>✦ {course.schoolName || "NORTHSTARLABS"}</Link>
        <nav><a href={course.schoolSlug ? `/schools/${course.schoolSlug}` : "/courses"}>Courses</a><a href="/legal/terms">Terms</a><a href="/legal/privacy">Privacy</a></nav>
      </footer>
    </main>
  );
}
