"use client";

import { useEffect, useState } from "react";
import { getStarterCourse, starterCourses, type CatalogCourse } from "../../lib/starter-courses";

export default function Catalog() {
  const [courses, setCourses] = useState<CatalogCourse[]>(starterCourses);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/catalog")
      .then((response) => {
        if (!response.ok) throw new Error("catalog unavailable");
        return response.json() as Promise<CatalogCourse[]>;
      })
      .then(setCourses)
      .catch(() => setNotice("Showing the NorthstarLabs starter collection."));
  }, []);

  return (
    <main className="catalog-page">
      <header>
        <a className="system-brand" href="/">✦ NORTHSTARLABS</a>
        <nav>
          <a href="/">Home</a>
          <a href="/login">Sign in</a>
        </nav>
      </header>

      <section className="catalog-hero">
        <p className="sys-kicker">NORTHSTARLABS ORIGINALS</p>
        <h1>Learn by building something real.</h1>
        <p>Free, practical field guides for turning expertise into learning people can use.</p>
        <div className="catalog-promises" aria-label="Course collection benefits">
          <span>Free to enrol</span>
          <span>Practical lessons</span>
          <span>Completion certificates</span>
        </div>
      </section>

      <section className="catalog-intro">
        <div>
          <p className="sys-kicker">STARTER COLLECTION</p>
          <h2>Choose your next useful step.</h2>
        </div>
        <p>Each course is deliberately short, action-focused, and built inside the same learning experience your own students can use.</p>
      </section>

      {notice && <p className="catalog-notice" role="status">{notice}</p>}

      <section className="catalog-grid">
        {courses.map((course) => {
          const starter = getStarterCourse(course.id);
          return (
            <article className="panel catalog-card" key={course.id}>
              <div className={`course-art ${starter?.artClass || ""}`}>
                <span>{course.title.slice(0, 2).toUpperCase()}</span>
                <small>{starter?.category || "Independent course"}</small>
              </div>
              <p className="sys-kicker">
                {course.lessonCount} LESSONS
                {starter?.duration ? ` · ${starter.duration.toUpperCase()}` : ""}
              </p>
              <h2>{course.title}</h2>
              <p>{course.description || "A focused course designed to help you make meaningful progress."}</p>
              <div className="catalog-card-meta">
                <span>By {course.creator || "NorthstarLabs"}</span>
                <b>{course.priceCents ? `R${(course.priceCents / 100).toFixed(0)}` : "Free"}</b>
              </div>
              <a className="sys-primary" href={`/courses/${course.id}`}>Explore course →</a>
            </article>
          );
        })}
      </section>

      <section className="catalog-creator-cta">
        <div>
          <p className="sys-kicker">TEACH SOMETHING NEXT</p>
          <h2>Have expertise worth sharing?</h2>
          <p>Use NorthstarLabs to turn it into a course, guide learners, and see where they need support.</p>
        </div>
        <a className="sys-primary" href="/login?next=/welcome?path=creator">Build your course free →</a>
      </section>

      <footer className="catalog-footer">
        <a className="system-brand" href="/">✦ NORTHSTARLABS</a>
        <nav>
          <a href="/">Platform</a>
          <a href="/legal/terms">Terms</a>
          <a href="/legal/privacy">Privacy</a>
        </nav>
      </footer>
    </main>
  );
}
