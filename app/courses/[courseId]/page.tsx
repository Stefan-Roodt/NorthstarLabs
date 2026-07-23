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
    isPreview: boolean;
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
  truthOutcome?: string;
  truthAudience?: string;
  truthNotFor?: string;
  truthPrerequisites?: string;
  truthEvidence?: string;
  truthSourceStandard?: string;
  truthLevel?: string;
  truthDelivery?: string;
  truthReviewedAt?: number | null;
  updatedAt?: number;
  previewCount?: number;
  transcriptCount?: number;
  captionedVideoCount?: number;
  minimumPassingScore?: number;
  sections?: CourseSection[];
};

function splitTruth(value?: string) {
  return (value || "")
    .split(/\r?\n|\\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

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
  const [signedIn, setSignedIn] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
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

  useEffect(() => {
    if (!id) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    let active = true;
    async function loadEnrollment(accessToken: string) {
      const response = await fetch("/api/enrollments", {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      if (!active || !response.ok) return;
      const enrollments = await response.json() as Array<{ courseId: string }>;
      setEnrolled(enrollments.some((item) => item.courseId === id));
    }
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSignedIn(Boolean(data.session));
      if (data.session) void loadEnrollment(data.session.access_token);
      else setEnrolled(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setSignedIn(Boolean(session));
      if (session) void loadEnrollment(session.access_token);
      else setEnrolled(false);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [id]);

  const enrol = useCallback(async () => {
    if (enrolling) return;
    if (enrolled) {
      location.href = `/learn/${id}`;
      return;
    }
    setEnrolling(true);
    setMessage("Joining your course...");
    const supabase = getSupabaseBrowser();
    const session = (await supabase?.auth.getSession())?.data.session;
    if (!session) {
      const returnTo = `/courses/${id}?enrol=1`;
      location.href = `/login?next=${encodeURIComponent(returnTo)}`;
      return;
    }
    const paid = Number(course?.priceCents || 0) > 0;
    const response = await fetch(paid ? "/api/payfast/checkout" : "/api/enrollments", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ courseId: id }),
    });
    const result = await response.json().catch(() => ({
      error: "We could not enrol you. Please try again.",
      newEnrollment: false,
    }));
    if (response.ok && result.action && result.fields) {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = result.action;
      for (const [name, value] of Object.entries(result.fields as Record<string, string>)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } else if (response.ok) {
      location.href = `/learn/${id}${result.newEnrollment ? "?welcome=1" : ""}`;
    } else {
      setMessage(result.error || "We could not enrol you. Please try again.");
      setEnrolling(false);
    }
  }, [course?.priceCents, enrolled, enrolling, id]);

  useEffect(() => {
    if (!loaded || !course || autoEnrolAttempted.current) return;
    const shouldEnrol = new URLSearchParams(location.search).get("enrol") === "1";
    if (!shouldEnrol) return;
    autoEnrolAttempted.current = true;
    const timeout = window.setTimeout(() => void enrol(), 0);
    return () => window.clearTimeout(timeout);
  }, [course, enrol, loaded]);

  if (!loaded) return <main className="system-loading"><p>Preparing course details...</p></main>;
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
  const previewCount = Number(course.previewCount || 0);
  const transcriptCount = Number(course.transcriptCount || 0);
  const captionedVideoCount = Number(course.captionedVideoCount || 0);
  const audience = splitTruth(course.truthAudience).length
    ? splitTruth(course.truthAudience)
    : starter?.audience || ["Independent learners", "Working professionals", "Curious builders"];
  const notFor = splitTruth(course.truthNotFor);
  const truthOutcome = course.truthOutcome?.trim() || starter?.promise || course.description;
  const reviewedAt = course.truthReviewedAt || course.updatedAt;
  const reviewedLabel = reviewedAt
    ? new Intl.DateTimeFormat("en-ZA", { month: "long", year: "numeric" }).format(new Date(reviewedAt))
    : "Review date pending";
  const facultyInitials = (course.creator || "NorthstarLabs")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <main className="course-sales course-sales-expanded">
      <header>
        <Link className="system-brand" href={course.schoolSlug ? `/schools/${course.schoolSlug}` : "/"}>* {course.schoolName || "NORTHSTARLABS"}</Link>
        <nav>
          <a href={course.schoolSlug ? `/schools/${course.schoolSlug}` : "/courses"}>{course.schoolSlug ? "Academy" : "All courses"}</a>
          {signedIn
            ? <Link href="/learn">My learning</Link>
            : <Link href={`/login?next=${encodeURIComponent(`/courses/${id}`)}`}>Sign in</Link>}
        </nav>
      </header>

      <section className="course-sales-hero">
        <div>
          <p className="sys-kicker">{starter?.category || "PRACTICAL COURSE"} - {course.lessonCount} LESSONS</p>
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
            {enrolling ? "Joining course..." : enrolled ? "Continue learning" : course.priceCents ? "Continue to checkout" : "Enrol for free"}
          </button>
          {previewCount > 0 && <Link className="course-preview-action" href={`/courses/${id}/preview`}>
            Preview a real lesson - no sign-up
          </Link>}
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
        <div><span>LEVEL</span><b>{course.truthLevel || starter?.level || "All levels"}</b></div>
        <div><span>FORMAT</span><b>{course.truthDelivery || starter?.format || "Self-paced"}</b></div>
        <div><span>TIME</span><b>{durationHours ? `${durationHours} guided hours` : starter?.duration || `${course.lessonCount} lessons`}</b></div>
        <div><span>PRICE</span><b>{course.priceCents ? `R${(course.priceCents / 100).toFixed(0)}` : "Free"}</b></div>
      </section>

      <section className="course-truth">
        <header className="course-truth-heading">
          <div>
            <p className="sys-kicker">COURSE TRUTH CARD</p>
            <h2>Before you commit.</h2>
          </div>
          <p>No vague promises. See the fit, standard, evidence and access before you create an account.</p>
        </header>
        <div className="course-truth-grid">
          <article className="truth-outcome">
            <span>01</span><small>THE PROMISE</small>
            <h3>{truthOutcome}</h3>
          </article>
          <article>
            <span>02</span><small>RIGHT FIT</small>
            <h3>Built for</h3>
            <ul>{audience.map((item) => <li key={item}>{item}</li>)}</ul>
            {!!notFor.length && <><h4>Not designed for</h4><ul>{notFor.map((item) => <li key={item}>{item}</li>)}</ul></>}
          </article>
          <article>
            <span>03</span><small>BEFORE YOU START</small>
            <h3>Prerequisites</h3>
            <p>{course.truthPrerequisites || "No prior specialist knowledge is required. Bring curiosity and time to do the work."}</p>
          </article>
          <article>
            <span>04</span><small>WHAT YOU CAN SHOW</small>
            <h3>Evidence, not attendance</h3>
            <p>{course.truthEvidence || `Completed lessons, saved progress and ${assessmentCount ? `${assessmentCount} assessed knowledge checks` : "practical course work"}.`}</p>
          </article>
          <article>
            <span>05</span><small>LEARNING STANDARD</small>
            <h3>{assessmentCount ? `${assessmentCount} assessed checks` : "Guided practice"}</h3>
            <p>{assessmentCount && course.minimumPassingScore ? `The course assessment threshold starts at ${course.minimumPassingScore}%. ` : ""}{course.certificateTitle || "A verifiable completion certificate"} records successful completion.</p>
          </article>
          <article className="truth-transparency">
            <span>06</span><small>ACCESS & TRANSPARENCY</small>
            <h3>Inspect the learning before joining.</h3>
            <dl>
              <div><dt>Public preview</dt><dd>{previewCount ? `${previewCount} lesson${previewCount === 1 ? "" : "s"}` : "Not yet available"}</dd></div>
              <div><dt>Transcripts</dt><dd>{course.lessonCount ? `${transcriptCount}/${course.lessonCount} lessons` : "None"}</dd></div>
              <div><dt>Captioned videos</dt><dd>{videoCount ? `${captionedVideoCount}/${videoCount}` : "No video required"}</dd></div>
              <div><dt>Last reviewed</dt><dd>{reviewedLabel}</dd></div>
            </dl>
            <p>{course.truthSourceStandard || "Academy-authored material. Review the faculty, curriculum and assessment standard shown on this page."}</p>
            {previewCount > 0 && <Link href={`/courses/${id}/preview`}>Open the public lesson preview</Link>}
          </article>
        </div>
      </section>

      <section className="course-details">
        <div className="course-outcomes">
          <p className="sys-kicker">WHAT YOU WILL LEAVE WITH</p>
          <h2>Useful progress-not more information.</h2>
          <p>{course.description}</p>
          <ul>
            {(starter?.outcomes || [
              "A clear understanding of the core ideas",
              "Practical actions you can apply immediately",
              "A record of your learning progress",
            ]).map((outcome) => <li key={outcome}><span aria-hidden="true">&#10003;</span>{outcome}</li>)}
          </ul>
        </div>

        <aside className="course-audience panel">
          <p className="sys-kicker">THIS COURSE IS FOR</p>
          <h3>People ready to put ideas into practice.</h3>
          <ul>
            {audience
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
            {course.sectionCount || curriculum.length || 1} modules - {course.lessonCount} lessons
            {assessmentCount ? ` - ${assessmentCount} assessments` : ""}
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
                          {lesson.durationMinutes ? ` - ${lesson.durationMinutes} min` : ""}
                          {lesson.isPreview && <b className="public-preview-badge">PUBLIC PREVIEW</b>}
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
        <p>{enrolled ? "Your progress is saved. Continue where you left off." : course.priceCents ? "Sign in to continue to secure checkout." : "No credit card required for this course."}</p>
        <button className="sys-primary" disabled={enrolling} onClick={enrol}>{enrolling ? "Joining course..." : enrolled ? "Continue learning" : course.priceCents ? "Continue to checkout" : "Enrol for free"}</button>
      </section>

      <footer className="catalog-footer">
        <Link className="system-brand" href={course.schoolSlug ? `/schools/${course.schoolSlug}` : "/"}>* {course.schoolName || "NORTHSTARLABS"}</Link>
        <nav><a href={course.schoolSlug ? `/schools/${course.schoolSlug}` : "/courses"}>Courses</a><a href="/legal/terms">Terms</a><a href="/legal/privacy">Privacy</a></nav>
      </footer>
    </main>
  );
}
