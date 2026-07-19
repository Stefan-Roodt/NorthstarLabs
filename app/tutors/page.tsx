"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type MarketplaceTutor = {
  id: string;
  slug: string;
  displayName: string;
  headline: string;
  bio: string;
  subjects: string[];
  languages: string[];
  qualifications: string;
  experienceYears: number;
  priceCents: number;
  priceUnit: string;
  sessionMode: string;
  location: string;
  availability: string;
  photoUrl: string | null;
  verified: boolean;
  schoolName: string;
  schoolSlug: string;
  schoolLogoUrl: string | null;
  schoolPrimaryColor: string;
  availableSlotCount: number;
  nextAvailableAt: number | null;
};

type SortMode = "available" | "experience" | "price";

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function sessionLabel(mode: string) {
  if (mode === "both") return "Online & in person";
  return mode === "in_person" ? "In person" : "Online";
}

function priceLabel(tutor: MarketplaceTutor) {
  return tutor.priceCents
    ? `R${(tutor.priceCents / 100).toLocaleString("en-ZA")}/${tutor.priceUnit}`
    : "Ask for price";
}

export default function TutorMarketplacePage() {
  const [tutors, setTutors] = useState<MarketplaceTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [mode, setMode] = useState("all");
  const [sort, setSort] = useState<SortMode>("available");
  const [comparedIds, setComparedIds] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/tutors?marketplace=1")
      .then((response) => {
        if (!response.ok) throw new Error("marketplace unavailable");
        return response.json() as Promise<{ tutors: MarketplaceTutor[] }>;
      })
      .then((result) => setTutors(result.tutors))
      .catch(() => setNotice("Tutor discovery is temporarily unavailable. Please try again shortly."))
      .finally(() => setLoading(false));
  }, []);

  const subjects = useMemo(() => [...new Set(tutors.flatMap((tutor) => tutor.subjects))]
    .sort((a, b) => a.localeCompare(b)), [tutors]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const result = tutors.filter((tutor) => {
      const searchable = [
        tutor.displayName,
        tutor.headline,
        tutor.schoolName,
        tutor.location,
        ...tutor.subjects,
        ...tutor.languages,
      ].join(" ").toLowerCase();
      const subjectMatch = subject === "all" || tutor.subjects.includes(subject);
      const modeMatch = mode === "all" || tutor.sessionMode === mode || tutor.sessionMode === "both";
      return (!keyword || searchable.includes(keyword)) && subjectMatch && modeMatch;
    });
    return [...result].sort((a, b) => {
      if (sort === "experience") return b.experienceYears - a.experienceYears;
      if (sort === "price") {
        const aPrice = a.priceCents || Number.MAX_SAFE_INTEGER;
        const bPrice = b.priceCents || Number.MAX_SAFE_INTEGER;
        return aPrice - bPrice;
      }
      const aTime = a.nextAvailableAt || Number.MAX_SAFE_INTEGER;
      const bTime = b.nextAvailableAt || Number.MAX_SAFE_INTEGER;
      return aTime - bTime || Number(b.verified) - Number(a.verified);
    });
  }, [mode, query, sort, subject, tutors]);

  const compared = comparedIds
    .map((id) => tutors.find((tutor) => tutor.id === id))
    .filter((tutor): tutor is MarketplaceTutor => Boolean(tutor));

  function toggleCompare(tutor: MarketplaceTutor) {
    setComparedIds((current) => {
      if (current.includes(tutor.id)) return current.filter((id) => id !== tutor.id);
      if (current.length >= 3) {
        setNotice("You can compare up to three tutors at a time.");
        return current;
      }
      setNotice("");
      return [...current, tutor.id];
    });
  }

  function clearFilters() {
    setQuery("");
    setSubject("all");
    setMode("all");
    setSort("available");
  }

  return <main className="marketplace-page">
    <header className="marketplace-nav">
      <Link className="system-brand" href="/">✦ NORTHSTARLABS</Link>
      <nav>
        <Link href="/courses">Courses</Link>
        <Link className="active" href="/tutors">Tutors</Link>
        <Link href="/login?mode=login">Sign in</Link>
        <Link className="marketplace-join" href="/login?mode=signup&next=%2Fwelcome">Join free</Link>
      </nav>
    </header>

    <section className="marketplace-hero">
      <div>
        <p className="sys-kicker">HUMAN HELP, WHEN A COURSE ISN&apos;T ENOUGH</p>
        <h1>Find the person who can get you <em>unstuck.</em></h1>
        <p>Compare real expertise, clear pricing and actual appointment availability—then request a time without sharing your details publicly.</p>
        <div className="marketplace-search">
          <label htmlFor="tutor-search">What do you need help with?</label>
          <div><input id="tutor-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Mathematics, exam preparation or Afrikaans…" /><a href="#tutor-results">Find my tutor</a></div>
        </div>
      </div>
      <aside>
        <span>1:1</span>
        <p><b>Personal guidance</b><small>Built around your next useful step.</small></p>
      </aside>
    </section>

    <section className="marketplace-trust" aria-label="Marketplace promises">
      <div><b>Compare clearly</b><span>Expertise, format and price</span></div>
      <div><b>Request safely</b><span>Your details stay private</span></div>
      <div><b>Book confidently</b><span>A time is held until confirmed</span></div>
    </section>

    <section className="marketplace-body" id="tutor-results">
      <aside className="marketplace-filters">
        <div><p className="sys-kicker">REFINE YOUR MATCH</p><button onClick={clearFilters}>Reset</button></div>
        <fieldset>
          <legend>Subject</legend>
          <select value={subject} onChange={(event) => setSubject(event.target.value)}>
            <option value="all">All subjects</option>
            {subjects.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </fieldset>
        <fieldset>
          <legend>Session format</legend>
          {[
            ["all", "Any format"],
            ["online", "Online"],
            ["in_person", "In person"],
          ].map(([value, label]) => <label key={value}><input type="radio" name="session-mode" value={value} checked={mode === value} onChange={() => setMode(value)} /><span>{label}</span></label>)}
        </fieldset>
        <div className="marketplace-filter-help">
          <b>Not sure who to choose?</b>
          <p>Select up to three tutors and compare them side by side.</p>
        </div>
      </aside>

      <div className="marketplace-results">
        <header>
          <div><p className="sys-kicker">YOUR MATCHES</p><h2>{loading ? "Finding tutors…" : `${filtered.length} ${filtered.length === 1 ? "tutor" : "tutors"} to consider`}</h2></div>
          <label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}><option value="available">Available soonest</option><option value="experience">Most experienced</option><option value="price">Lowest price</option></select></label>
        </header>
        {notice && <p className="notice" role="status">{notice}</p>}
        {!loading && filtered.length ? <div className="marketplace-grid">{filtered.map((tutor) =>
          <article className="marketplace-card" key={tutor.id} style={{ borderTopColor: tutor.schoolPrimaryColor || "#3556d8" }}>
            <div className="marketplace-card-person">
              {tutor.photoUrl ? <Image src={tutor.photoUrl} alt="" width={84} height={98} unoptimized /> : <span>{initials(tutor.displayName)}</span>}
              <div>
                <small>{tutor.verified ? "✓ VERIFIED TUTOR" : tutor.schoolName.toUpperCase()}</small>
                <h3>{tutor.displayName}</h3>
                <p>{tutor.headline}</p>
              </div>
            </div>
            <p className="marketplace-academy">From <Link href={`/schools/${tutor.schoolSlug}`}>{tutor.schoolName}</Link></p>
            <div className="marketplace-card-subjects">{tutor.subjects.slice(0, 4).map((item) => <span key={item}>{item}</span>)}</div>
            <dl>
              <div><dt>Experience</dt><dd>{tutor.experienceYears ? `${tutor.experienceYears} years` : "See profile"}</dd></div>
              <div><dt>Format</dt><dd>{sessionLabel(tutor.sessionMode)}</dd></div>
              <div><dt>From</dt><dd>{priceLabel(tutor)}</dd></div>
            </dl>
            <div className={`marketplace-availability ${tutor.availableSlotCount ? "open" : ""}`}>
              <span>{tutor.availableSlotCount ? "●" : "○"}</span>
              <p><b>{tutor.availableSlotCount
                ? `Next opening ${new Date(tutor.nextAvailableAt || 0).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })}`
                : "Ask about availability"}</b><small>{tutor.availableSlotCount ? `${tutor.availableSlotCount} requestable ${tutor.availableSlotCount === 1 ? "time" : "times"}` : tutor.availability || "Send a private enquiry"}</small></p>
            </div>
            <div className="marketplace-card-actions">
              <Link href={`/schools/${tutor.schoolSlug}/tutors/${tutor.slug}`}>View profile & times</Link>
              <button aria-pressed={comparedIds.includes(tutor.id)} onClick={() => toggleCompare(tutor)}>
                {comparedIds.includes(tutor.id) ? "✓ Comparing" : "+ Compare"}
              </button>
            </div>
          </article>
        )}</div> : !loading && <article className="marketplace-empty">
          <span>?</span><div><h2>No exact match yet.</h2><p>Try a broader subject, another format, or clear the filters to see every available tutor.</p><button onClick={clearFilters}>Show all tutors</button></div>
        </article>}
      </div>
    </section>

    {compared.length > 0 && <section className="marketplace-compare" id="compare">
      <div className="marketplace-compare-heading">
        <div><p className="sys-kicker">SIDE-BY-SIDE</p><h2>Compare what matters.</h2><p>Select up to three tutors. The strongest choice is the one whose expertise and availability fit your next step.</p></div>
        <button onClick={() => setComparedIds([])}>Clear comparison</button>
      </div>
      <div className="marketplace-compare-grid" style={{ gridTemplateColumns: `170px repeat(${compared.length}, minmax(210px, 1fr))` }}>
        <b>Tutor</b>{compared.map((tutor) => <strong key={`name-${tutor.id}`}>{tutor.displayName}<small>{tutor.schoolName}</small></strong>)}
        <b>Subjects</b>{compared.map((tutor) => <span key={`subject-${tutor.id}`}>{tutor.subjects.slice(0, 3).join(", ")}</span>)}
        <b>Experience</b>{compared.map((tutor) => <span key={`experience-${tutor.id}`}>{tutor.experienceYears ? `${tutor.experienceYears} years` : "See profile"}</span>)}
        <b>Format</b>{compared.map((tutor) => <span key={`mode-${tutor.id}`}>{sessionLabel(tutor.sessionMode)}</span>)}
        <b>Price</b>{compared.map((tutor) => <span key={`price-${tutor.id}`}>{priceLabel(tutor)}</span>)}
        <b>Availability</b>{compared.map((tutor) => <span key={`availability-${tutor.id}`}>{tutor.availableSlotCount ? `${tutor.availableSlotCount} open times` : "Enquire directly"}</span>)}
        <i aria-hidden="true" />{compared.map((tutor) => <Link key={`action-${tutor.id}`} href={`/schools/${tutor.schoolSlug}/tutors/${tutor.slug}`}>Choose {tutor.displayName.split(" ")[0]}</Link>)}
      </div>
    </section>}

    {compared.length > 0 && <div className="marketplace-compare-dock">
      <p><b>{compared.length}/3 selected</b><span>{compared.map((tutor) => tutor.displayName.split(" ")[0]).join(", ")}</span></p>
      <a href="#compare">Compare tutors</a>
    </div>}

    <section className="marketplace-bottom">
      <div><p className="sys-kicker">TEACH ONE-TO-ONE?</p><h2>Put your expertise where learners can find it.</h2></div>
      <Link href="/login?mode=signup&next=%2Fwelcome%3Fpath%3Dcreator">Create your academy free →</Link>
    </section>
  </main>;
}
