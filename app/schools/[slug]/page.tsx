"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CatalogCourse } from "../../../lib/starter-courses";

type SchoolData = {
  school: {
    id: string;
    slug: string;
    name: string;
    description: string;
    logoUrl: string | null;
    primaryColor: string;
  };
  courses: CatalogCourse[];
};

export default function SchoolPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState("");
  const [data, setData] = useState<SchoolData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ slug: schoolSlug }) => setSlug(schoolSlug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/schools/${encodeURIComponent(slug)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("This academy could not be found.");
        return response.json() as Promise<SchoolData>;
      })
      .then(setData)
      .catch((reason: Error) => setError(reason.message));
  }, [slug]);

  if (error) {
    return (
      <main className="system-loading">
        <div>
          <b>NorthStarLabs</b>
          <p>{error}</p>
          <Link href="/courses">Browse all courses</Link>
        </div>
      </main>
    );
  }
  if (!data) {
    return <main className="system-loading"><p>Opening the academy…</p></main>;
  }

  return (
    <main className="catalog-page">
      <header>
        <Link className="system-brand" href="/">✦ NORTHSTARLABS</Link>
        <nav>
          <Link href="/courses">All courses</Link>
          <Link href="/login">Sign in</Link>
        </nav>
      </header>

      <section className="catalog-hero school-catalog-hero">
        <p className="sys-kicker">INDEPENDENT NORTHSTARLABS ACADEMY</p>
        <h1>{data.school.name}</h1>
        <p>{data.school.description || "Practical learning, gathered in one focused academy."}</p>
        <div className="catalog-promises" aria-label="Academy details">
          <span>{data.courses.length} published {data.courses.length === 1 ? "course" : "courses"}</span>
          <span>One learner account</span>
          <span>Progress saved securely</span>
        </div>
      </section>

      <section className="catalog-intro">
        <div>
          <p className="sys-kicker">ACADEMY CATALOGUE</p>
          <h2>Choose where to begin.</h2>
        </div>
        <p>Every course below is published and managed by {data.school.name}.</p>
      </section>

      {data.courses.length ? (
        <section className="catalog-grid">
          {data.courses.map((course) => (
            <article className="panel catalog-card" key={course.id}>
              <div className="course-art">
                <span>{course.title.slice(0, 2).toUpperCase()}</span>
                <small>{data.school.name}</small>
              </div>
              <p className="sys-kicker">{course.lessonCount} LESSONS</p>
              <h2>{course.title}</h2>
              <p>{course.description || "A focused learning experience designed to help you make practical progress."}</p>
              <div className="catalog-card-meta">
                <span>By {course.creator || data.school.name}</span>
                <b>{course.priceCents ? `R${(course.priceCents / 100).toFixed(0)}` : "Free"}</b>
              </div>
              <Link className="sys-primary" href={`/courses/${course.id}`}>Explore course →</Link>
            </article>
          ))}
        </section>
      ) : (
        <section className="panel school-empty-catalog">
          <p className="sys-kicker">COMING SOON</p>
          <h2>This academy is preparing its first course.</h2>
          <p>Check back after the creator publishes their first learning experience.</p>
        </section>
      )}

      <footer className="catalog-footer">
        <strong>{data.school.name}</strong>
        <nav>
          <Link href="/courses">All courses</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/privacy">Privacy</Link>
        </nav>
      </footer>
    </main>
  );
}
