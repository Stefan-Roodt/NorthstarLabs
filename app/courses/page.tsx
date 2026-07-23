"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStarterCourse, starterCourses, type CatalogCourse } from "../../lib/starter-courses";
import { getSupabaseBrowser } from "../../lib/supabase-client";
import { LearningRequestForm } from "../learning-request-form";

function guidedDuration(course: CatalogCourse, fallback?: string) {
  if (!course.durationMinutes) return fallback || `${course.lessonCount} lessons`;
  const hours = Math.max(1, Math.round(course.durationMinutes / 60));
  const project = fallback?.match(/\+\s*(.+)$/)?.[1];
  return `${hours} guided ${hours === 1 ? "hour" : "hours"}${project ? ` + ${project}` : ""}`;
}

export default function Catalog() {
  const [courses, setCourses] = useState<CatalogCourse[]>(starterCourses);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const queryFrame = requestAnimationFrame(() => {
      const requestedGoal = new URLSearchParams(location.search).get("query");
      if (requestedGoal) setQuery(requestedGoal);
    });
    fetch("/api/catalog")
      .then((response) => {
        if (!response.ok) throw new Error("catalog unavailable");
        return response.json() as Promise<CatalogCourse[]>;
      })
      .then(setCourses)
      .catch(() => setNotice("Showing the NorthstarLabs starter collection."));
    return () => cancelAnimationFrame(queryFrame);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.session));
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setSignedIn(Boolean(session));
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const keyword = query.trim().toLowerCase();
  const filteredCourses = courses.filter((course) => [
    course.title,
    course.description,
    course.creator,
    getStarterCourse(course.id)?.category,
  ].filter(Boolean).join(" ").toLowerCase().includes(keyword));

  function updateQuery(value: string) {
    setQuery(value);
    const url = new URL(location.href);
    if (value.trim()) url.searchParams.set("query", value.trim());
    else url.searchParams.delete("query");
    history.replaceState(null, "", `${url.pathname}${url.search}`);
  }

  return (
    <main className="catalog-page">
      <header>
        <Link className="system-brand" href="/">* NORTHSTARLABS</Link>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/tutors">Work with a coach</Link>
          {signedIn ? <>
            <Link href="/learn">My learning</Link>
            <Link href="/account">Account</Link>
          </> : <>
            <Link href="/login?mode=signup&next=%2Fwelcome%3Fpath%3Dcreator">Build a course</Link>
            <Link href="/login">Sign in</Link>
          </>}
        </nav>
      </header>

      <section className="catalog-hero">
        <p className="sys-kicker">NORTHSTARLABS ORIGINALS</p>
        <h1>Choose a course that moves you forward.</h1>
        <p>This is the learner catalogue. Open a course, inspect its modules and lessons, then enrol only when the fit is right.</p>
        <div className="catalog-promises" aria-label="Course collection benefits">
          <span>See the syllabus first</span>
          <span>Start as a learner</span>
          <span>Earn completion evidence</span>
        </div>
        <label className="catalog-search">
          <span>What would you like to achieve?</span>
          <div><input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Search a topic, skill, project, or outcome" /><b aria-hidden="true">&#128269;</b></div>
        </label>
      </section>

      <section className="catalog-intro">
        <div>
          <p className="sys-kicker">{keyword ? "GOAL-MATCHED RESULTS" : "STARTER COLLECTION"}</p>
          <h2>{keyword ? `${filteredCourses.length} ${filteredCourses.length === 1 ? "course" : "courses"} for "${query.trim()}"` : "Choose your next useful step."}</h2>
        </div>
        <p>{keyword ? "Inspect the promise and structure before enrolling. If nothing fits, NorthstarLabs can look for a coach or a more relevant course." : "Each course is outcome-led, action-focused, and built inside the same learning experience your own students can use."}</p>
      </section>

      {notice && <p className="catalog-notice" role="status">{notice}</p>}

      <section className="catalog-grid">
        {filteredCourses.map((course) => {
          const starter = getStarterCourse(course.id);
          return (
            <article className="panel catalog-card" key={course.id}>
              <div className={`course-art ${starter?.artClass || ""}`}>
                <span>{course.title.slice(0, 2).toUpperCase()}</span>
                <small>{starter?.category || "Independent course"}</small>
              </div>
              <p className="sys-kicker">
                {course.lessonCount} LESSONS
                {` - ${guidedDuration(course, starter?.duration).toUpperCase()}`}
              </p>
              <h2>{course.title}</h2>
              <p>{course.description || "A focused course designed to help you make meaningful progress."}</p>
              <div className="catalog-card-proof" aria-label="Course structure">
                <span>{course.sectionCount || "—"} modules</span>
                <span>{course.assessmentCount || "—"} assessed checks</span>
                <span>{course.playableVideoCount
                  ? `${course.playableVideoCount} faculty video${course.playableVideoCount === 1 ? "" : "s"}`
                  : "Guided lessons"}</span>
              </div>
              <div className="catalog-card-meta">
                <span>By {course.creator || "NorthstarLabs"}</span>
                <b>{course.priceCents ? `R${(course.priceCents / 100).toFixed(0)}` : "Free"}</b>
              </div>
              <a className="sys-primary" href={`/courses/${course.id}`}>View course syllabus →</a>
            </article>
          );
        })}
      </section>

      {!filteredCourses.length && <section className="catalog-empty">
        <span aria-hidden="true">&#128269;</span>
        <div><p className="sys-kicker">NO FORCED MATCHES</p><h2>We do not have a credible course match yet.</h2><p>Try a broader phrase, look for a coach who works in this area, or send NorthstarLabs the detail below so we can investigate.</p><div><button type="button" onClick={() => updateQuery("")}>Show all courses</button><Link href={`/tutors?topic=${encodeURIComponent(query.trim())}`}>Look for a coach →</Link></div></div>
      </section>}

      <section className="catalog-request" id="request-a-course">
        <div>
          <p className="sys-kicker">CAN&apos;T FIND THE RIGHT COURSE?</p>
          <h2>Tell Northstar what you want to learn.</h2>
          <p>Describe the topic, your level, and the result you want. We will check for a suitable course, coach, or expert instead of sending you to something unrelated.</p>
        </div>
        <LearningRequestForm key={query || "open"} defaultType="course" defaultTopic={query} source="course-catalogue" compact />
      </section>

      <section className="catalog-creator-cta">
        <div>
          <p className="sys-kicker">CREATOR ROUTE</p>
          <h2>Want to teach instead?</h2>
          <p>Create an academy, build a course from modules and lessons, then publish it for your learners.</p>
        </div>
        <a className="sys-primary" href="/login?mode=signup&next=%2Fwelcome%3Fpath%3Dcreator">Build a course →</a>
      </section>

      <footer className="catalog-footer">
        <Link className="system-brand" href="/">* NORTHSTARLABS</Link>
        <nav>
          <Link href="/">Platform</Link>
          <a href="/legal/terms">Terms</a>
          <a href="/legal/privacy">Privacy</a>
        </nav>
      </footer>
    </main>
  );
}
