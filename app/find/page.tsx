"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { starterCourses, type CatalogCourse } from "../../lib/starter-courses";

type Academy = {
  slug: string;
  name: string;
  modules: CatalogCourse[];
};

export default function AcademyDirectory() {
  const [modules, setModules] = useState<CatalogCourse[]>(starterCourses);

  useEffect(() => {
    fetch("/api/catalog")
      .then((response) => response.ok ? response.json() as Promise<CatalogCourse[]> : Promise.reject())
      .then(setModules)
      .catch(() => undefined);
  }, []);

  const academies = useMemo(() => {
    const grouped = new Map<string, Academy>();
    modules.forEach((module) => {
      const slug = module.schoolSlug || "northstarlabs";
      const academy = grouped.get(slug) || { slug, name: module.schoolName || "NorthstarLabs", modules: [] };
      academy.modules.push(module);
      grouped.set(slug, academy);
    });
    return [...grouped.values()];
  }, [modules]);

  return <main className="navigator-page">
    <header className="navigator-nav">
      <Link className="system-brand" href="/">✦ NORTHSTARLABS</Link>
      <nav><Link href="/courses">All modules</Link><Link href="/tutors">Coaches</Link><Link href="/login?mode=login">Sign in</Link></nav>
    </header>

    <section className="navigator-hero">
      <p className="sys-kicker">NORTHSTARLABS</p>
      <h1>Choose an academy. Then choose your module.</h1>
      <p>That is the learning journey. An academy is the home for its own modules, faculty, learning standards, and learner community.</p>
      <div><span>1. Choose academy</span><span>2. Choose module</span><span>3. Start learning</span></div>
    </section>

    <section className="navigator-course-picker" aria-labelledby="academy-directory-title">
      <div className="navigator-course-picker-heading">
        <div><p className="sys-kicker">ACADEMIES</p><h2 id="academy-directory-title">Your academy. Your modules.</h2><p>Open an academy to see only the modules it offers. Every module shows its curriculum before you join.</p></div>
        <Link href="/courses">See every module →</Link>
      </div>
      <div className="navigator-course-grid">
        {academies.map((academy) => <article key={academy.slug}>
          <div><span>{academy.name.slice(0, 2).toUpperCase()}</span><small>Academy</small></div>
          <p className="sys-kicker">{academy.modules.length} {academy.modules.length === 1 ? "MODULE" : "MODULES"}</p>
          <h3>{academy.name}</h3>
          <p>{academy.modules.slice(0, 3).map((module) => module.title).join(" · ")}</p>
          <Link href={`/schools/${academy.slug}`}>Open academy and modules →</Link>
        </article>)}
      </div>
    </section>

    <section className="navigator-direct" aria-labelledby="coach-title">
      <div><p className="sys-kicker">NEED INDIVIDUAL HELP?</p><h2 id="coach-title">A coach is the tailored option.</h2><p>Modules follow a defined syllabus. Coaching is where a person can adapt the pace, examples, exercises, and support around your specific need.</p></div>
      <div className="navigator-direct-actions"><Link className="button" href="/tutors">Meet a coach <span>→</span></Link></div>
    </section>

    <footer className="navigator-footer"><Link className="system-brand" href="/">✦ NORTHSTARLABS</Link><p>Academies. Modules. Progress.</p><div><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link></div></footer>
  </main>;
}
