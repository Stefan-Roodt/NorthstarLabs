"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { useSignedIn } from "../../../../lib/use-signed-in";

type PublicTutor = {
  id: string;
  slug: string;
  displayName: string;
  headline: string;
  bio: string;
  subjects: string[];
  languages: string[];
  experienceYears: number;
  priceCents: number;
  priceUnit: string;
  sessionMode: string;
  location: string;
  availability: string;
  photoUrl: string | null;
  verified: boolean;
};

type TutorDirectory = {
  school: {
    slug: string;
    name: string;
    description: string;
    logoUrl: string | null;
    primaryColor: string;
    accentColor: string;
  };
  tutors: PublicTutor[];
};

export default function TutorDirectoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const signedIn = useSignedIn();
  const [slug, setSlug] = useState("");
  const [data, setData] = useState<TutorDirectory | null>(null);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    params.then((result) => setSlug(result.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/tutors?schoolSlug=${encodeURIComponent(slug)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("This tutor directory could not be opened.");
        return response.json() as Promise<TutorDirectory>;
      })
      .then(setData)
      .catch((reason: Error) => setError(reason.message));
  }, [slug]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data?.tutors || []).filter((tutor) => {
      const modeMatch = mode === "all" || tutor.sessionMode === mode || tutor.sessionMode === "both";
      const queryMatch = !query || [
        tutor.displayName,
        tutor.headline,
        tutor.bio,
        tutor.location,
        ...tutor.subjects,
        ...tutor.languages,
      ].some((value) => value.toLowerCase().includes(query));
      return modeMatch && queryMatch;
    });
  }, [data, mode, search]);

  if (error) return <main className="system-loading"><div><b>NorthstarLabs</b><p>{error}</p><Link href={`/schools/${slug}`}>Back to academy</Link></div></main>;
  if (!data) return <main className="system-loading"><p>Finding available tutors...</p></main>;

  const style = {
    "--school-primary": data.school.primaryColor,
    "--school-accent": data.school.accentColor,
    "--blue": data.school.primaryColor,
    "--acid": data.school.accentColor,
  } as CSSProperties;

  return <main className="tutor-directory" style={style}>
    <header className="tutor-public-nav">
      <Link href={`/schools/${data.school.slug}`}>
        {data.school.logoUrl ? <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.school.logoUrl} alt="" />
        </> : <span>{data.school.name.slice(0, 2).toUpperCase()}</span>}
        <b>{data.school.name}</b>
      </Link>
      <nav>
        <Link href={`/schools/${data.school.slug}`}>Academy</Link>
        {signedIn ? <>
          <Link href="/learn">My learning</Link>
          <Link href="/tutoring">My coaching</Link>
          <Link href="/account">Account</Link>
        </> : <Link href={`/login?next=${encodeURIComponent(`/schools/${data.school.slug}/tutors`)}`}>Sign in</Link>}
      </nav>
    </header>

    <section className="tutor-directory-hero">
      <div>
        <p className="sys-kicker">REAL PEOPLE - PERSONAL SUPPORT</p>
        <h1>Find a tutor who fits how you learn.</h1>
        <p>Compare expertise, price and session style. Then book directly or send a private enquiry without exposing your details publicly.</p>
      </div>
      <aside><strong>{String(data.tutors.length).padStart(2, "0")}</strong><span>available {data.tutors.length === 1 ? "tutor" : "tutors"}</span></aside>
    </section>

    <section className="tutor-finder" aria-label="Filter tutors">
      <label><span>Search by subject, name or language</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try Mathematics, English or Afrikaans" /></label>
      <div>
        <button className={mode === "all" ? "active" : ""} onClick={() => setMode("all")}>All tutors</button>
        <button className={mode === "online" ? "active" : ""} onClick={() => setMode("online")}>Online</button>
        <button className={mode === "in_person" ? "active" : ""} onClick={() => setMode("in_person")}>In person</button>
      </div>
    </section>

    <section className="tutor-results">
      <div className="tutor-results-heading"><p><b>{filtered.length}</b> {filtered.length === 1 ? "match" : "matches"}</p><span>Prices are set by each tutor.</span></div>
      {filtered.length ? <div className="tutor-directory-grid">
        {filtered.map((tutor) => <article className="tutor-directory-card" key={tutor.id}>
          <div className="tutor-directory-person">
            {tutor.photoUrl ? <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tutor.photoUrl} alt="" />
            </> : <span>{tutor.displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>}
            <div><small>{tutor.verified ? "\u2713 VERIFIED TUTOR" : data.school.name}</small><h2>{tutor.displayName}</h2><p>{tutor.headline}</p></div>
          </div>
          <div className="tutor-directory-subjects">{tutor.subjects.slice(0, 5).map((subject) => <span key={subject}>{subject}</span>)}</div>
          <dl>
            <div><dt>Format</dt><dd>{tutor.sessionMode.replaceAll("_", " ")}</dd></div>
            <div><dt>Experience</dt><dd>{tutor.experienceYears ? `${tutor.experienceYears}+ years` : "Academy listed"}</dd></div>
            <div><dt>Price</dt><dd>{tutor.priceCents ? `R${(tutor.priceCents / 100).toLocaleString("en-ZA")}/${tutor.priceUnit}` : "Ask tutor"}</dd></div>
          </dl>
          {tutor.availability && <p className="tutor-availability"><span aria-hidden="true">&#9675;</span>{tutor.availability}</p>}
          <Link href={`/schools/${data.school.slug}/tutors/${tutor.slug}`}>View profile & book</Link>
        </article>)}
      </div> : <article className="tutor-empty">
        <h2>No exact matches yet.</h2>
        <p>Try a broader subject or include both online and in-person tutors.</p>
        <button onClick={() => { setSearch(""); setMode("all"); }}>Clear filters</button>
      </article>}
    </section>

    <section className="tutor-how">
      <div><p className="sys-kicker">HOW IT WORKS</p><h2>Personal help without the run-around.</h2></div>
      <ol>
        <li><span>01</span><b>Choose a tutor</b><p>Compare subjects, format, experience and price.</p></li>
        <li><span>02</span><b>Make contact</b><p>Use direct contact when offered or send a protected enquiry.</p></li>
        <li><span>03</span><b>Agree the details</b><p>Confirm the time, place and payment directly with the tutor.</p></li>
      </ol>
    </section>

    <footer className="tutor-public-footer">
      <Link href={`/schools/${data.school.slug}`}>{data.school.name}</Link>
      <p>Tutoring arrangements and payment are agreed directly with the tutor.</p>
      <small>Powered by <Link href="/">NorthstarLabs</Link></small>
    </footer>
  </main>;
}
