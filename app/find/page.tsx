"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStarterCourse, starterCourses, type CatalogCourse } from "../../lib/starter-courses";
import { LearningRequestForm } from "../learning-request-form";

const bitcoinCourseHref = "/courses/stefan-bitcoin-genesis-next-era";

export default function FindCoursesPage() {
  const [courses, setCourses] = useState<CatalogCourse[]>(starterCourses);

  useEffect(() => {
    fetch("/api/catalog")
      .then((response) => response.ok ? response.json() as Promise<CatalogCourse[]> : Promise.reject())
      .then(setCourses)
      .catch(() => undefined);
  }, []);

  return <main className="navigator-page">
    <header className="navigator-nav">
      <Link className="system-brand" href="/">✦ NORTHSTARLABS</Link>
      <nav><Link href="/courses">Courses</Link><Link href="/tutors">Coaches</Link><Link href="/about">Why Northstar?</Link><Link href="/login?mode=login">Sign in</Link></nav>
    </header>

    <section className="navigator-hero">
      <p className="sys-kicker">NORTHSTARLABS COURSES</p>
      <h1>Choose a real course. Start when it fits.</h1>
      <p>There is no pretend personalisation here. Every course has a visible curriculum, a clear learning promise, and a direct path to join.</p>
      <div><span>Inspect the curriculum</span><span>Decide if it fits</span><span>Join when ready</span></div>
    </section>

    <section className="navigator-direct" aria-labelledby="direct-course-title">
      <div>
        <p className="sys-kicker">FEATURED COURSE</p>
        <h2 id="direct-course-title">Start the Bitcoin course now.</h2>
        <p><b>Bitcoin Intelligence: From Genesis Block to Boardroom</b> is a structured NorthstarLabs course with 35 short lessons on Bitcoin’s origins, engineering, money, custody, governance, risks, and plausible futures.</p>
        <small>See the full curriculum before joining. No questionnaire required.</small>
      </div>
      <div className="navigator-direct-actions">
        <Link className="button" href={bitcoinCourseHref}>Explore the Bitcoin course <span>→</span></Link>
        <Link href="/courses">Browse all courses →</Link>
      </div>
    </section>

    <section className="navigator-course-picker" aria-labelledby="course-picker-title">
      <div className="navigator-course-picker-heading">
        <div><p className="sys-kicker">LIVE NORTHSTARLABS COURSES</p><h2 id="course-picker-title">Pick the subject you came for.</h2><p>These are the courses we actually offer today. Open one to see exactly what you will learn, how it is structured, and what completion requires.</p></div>
        <Link href="/courses">Open the full catalogue →</Link>
      </div>
      <div className="navigator-course-grid">
        {courses.map((course) => {
          const starter = getStarterCourse(course.id);
          return <article key={course.id}>
            <div><span>{course.title.slice(0, 2).toUpperCase()}</span><small>{starter?.category || "NorthstarLabs course"}</small></div>
            <p className="sys-kicker">{course.lessonCount} LESSONS · {course.priceCents ? `R${(course.priceCents / 100).toFixed(0)}` : "FREE"}</p>
            <h3>{course.title}</h3>
            <p>{course.description || "A structured course with practical learning and visible progress."}</p>
            <Link href={`/courses/${course.id}`}>See course and curriculum →</Link>
          </article>;
        })}
      </div>
    </section>

    <section className="navigator-request" id="request-a-course">
      <div>
        <p className="sys-kicker">NOT HERE YET?</p>
        <h2>Tell us what should exist.</h2>
        <p>If we do not offer the course you need, send the detail. NorthstarLabs will use it to look for a credible coach, identify demand, or consider what to build next—without pretending an unrelated course is a match.</p>
      </div>
      <LearningRequestForm defaultType="course" source="course-finder" compact />
    </section>

    <footer className="navigator-footer"><Link className="system-brand" href="/">✦ NORTHSTARLABS</Link><p>Learn. Ask. Progress.</p><div><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link></div></footer>
  </main>;
}
