"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { coachListingWeight } from "../../lib/coach-listing-plans";
import { LearningRequestForm } from "../learning-request-form";

type MarketplaceTutor = {
  id: string;
  slug: string;
  displayName: string;
  headline: string;
  bio: string;
  serviceType: string;
  subjects: string[];
  languages: string[];
  qualifications: string;
  experienceYears: number;
  priceCents: number;
  priceUnit: string;
  listingTier: string;
  listingMonthlyCents: number;
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
  verifiedCredentialCount: number;
  reviewCount: number;
  averageRating: number | null;
  profileCompleteness: number;
};

type SortMode = "recommended" | "available" | "experience" | "price";

const topicGroups = [
  { name: "Career & work", topics: ["Career change", "Interview preparation", "Leadership", "Executive coaching"] },
  { name: "Business", topics: ["Business strategy", "Sales", "Entrepreneurship", "Small business"] },
  { name: "Learning", topics: ["Mathematics", "Study skills", "Exam preparation", "Physical Science"] },
  { name: "Technology", topics: ["Coding", "Artificial intelligence", "Data analysis", "Bitcoin"] },
] as const;
const topicCatalog = topicGroups.flatMap((group) => [...group.topics]);

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function sessionLabel(mode: string) {
  if (mode === "both") return "Online & in person";
  return mode === "in_person" ? "In person" : "Online";
}

function priceLabel(tutor: MarketplaceTutor) {
  return tutor.priceCents
    ? `R${(tutor.priceCents / 100).toLocaleString("en-ZA")}/hour`
    : "Ask for price";
}

export default function TutorMarketplacePage() {
  const [tutors, setTutors] = useState<MarketplaceTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [mode, setMode] = useState("all");
  const [sort, setSort] = useState<SortMode>("recommended");
  const [comparedIds, setComparedIds] = useState<string[]>([]);

  useEffect(() => {
    const topicFrame = requestAnimationFrame(() => {
      const topic = new URLSearchParams(location.search).get("topic");
      if (!topic) return;
      const canonicalTopic = topicCatalog.find(
        (item) => item.toLowerCase() === topic.toLowerCase(),
      );
      if (canonicalTopic) setSubject(canonicalTopic);
      else setQuery(topic);
    });
    fetch("/api/tutors?marketplace=1")
      .then((response) => {
        if (!response.ok) throw new Error("marketplace unavailable");
        return response.json() as Promise<{ tutors: MarketplaceTutor[] }>;
      })
      .then((result) => setTutors(result.tutors))
      .catch(() => setNotice("Tutor discovery is temporarily unavailable. Please try again shortly."))
      .finally(() => setLoading(false));
    return () => cancelAnimationFrame(topicFrame);
  }, []);

  const subjects = useMemo(() => [...new Set([
    ...topicCatalog,
    ...tutors.flatMap((tutor) => tutor.subjects),
  ])]
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
      const subjectMatch = subject === "all" || tutor.subjects.some(
        (item) => item.toLowerCase() === subject.toLowerCase(),
      );
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
      if (sort === "recommended") {
        const placement = coachListingWeight(a.listingTier) - coachListingWeight(b.listingTier);
        if (placement) return placement;
        const verification = Number(b.verified) - Number(a.verified);
        if (verification) return verification;
        const learnerProof = Number(b.averageRating || 0) - Number(a.averageRating || 0);
        if (learnerProof) return learnerProof;
      }
      const aTime = a.nextAvailableAt || Number.MAX_SAFE_INTEGER;
      const bTime = b.nextAvailableAt || Number.MAX_SAFE_INTEGER;
      return aTime - bTime || Number(b.verified) - Number(a.verified);
    });
  }, [mode, query, sort, subject, tutors]);

  const compared = comparedIds
    .map((id) => tutors.find((tutor) => tutor.id === id))
    .filter((tutor): tutor is MarketplaceTutor => Boolean(tutor));
  const selectedTopic = subject !== "all" ? subject : query.trim();

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
    setSort("recommended");
    const url = new URL(location.href);
    url.searchParams.delete("topic");
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function chooseTopic(topic: string) {
    setQuery("");
    setSubject(topic);
    setNotice("");
    const url = new URL(location.href);
    url.searchParams.set("topic", topic);
    history.replaceState(null, "", `${url.pathname}${url.search}#tutor-results`);
    window.requestAnimationFrame(() => {
      document.getElementById("tutor-results")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function chooseSubject(value: string) {
    setSubject(value);
    setQuery("");
    const url = new URL(location.href);
    if (value === "all") url.searchParams.delete("topic");
    else url.searchParams.set("topic", value);
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  return <main className="marketplace-page">
    <header className="marketplace-nav">
      <Link className="system-brand" href="/">✦ NORTHSTARLABS</Link>
      <nav>
        <Link href="/courses">Courses</Link>
        <Link className="active" href="/tutors">Find a coach</Link>
        <Link href="/login?mode=login">Sign in</Link>
        <Link className="marketplace-join" href="/login?mode=signup&next=%2Fwelcome%3Fpath%3Dcoach">Advertise</Link>
      </nav>
    </header>

    <section className="marketplace-hero">
      <div>
        <p className="sys-kicker">HUMAN HELP, WHEN A COURSE ISN&apos;T ENOUGH</p>
        <h1>Find the person who can get you <em>unstuck.</em></h1>
        <p>Search the topic you want to investigate, compare real expertise and self-set hourly rates, then request a time without sharing your details publicly.</p>
        <div className="marketplace-search">
          <label htmlFor="tutor-search">What do you need help with?</label>
          <div><input id="tutor-search" value={query} onChange={(event) => { setQuery(event.target.value); setSubject("all"); }} placeholder="Try career change, Bitcoin, mathematics or leadership…" /><a href="#tutor-results">Find my coach</a></div>
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

    <section className="marketplace-topics" aria-label="Browse coaching and tutoring topics">
      <header>
        <div><p className="sys-kicker">EXPLORE BY TOPIC</p><h2>What would you like to work through?</h2></div>
        <p>Start broad or choose a specific topic. Your search can include a goal, problem, school subject, or professional skill.</p>
      </header>
      <div>{topicGroups.map((group) => <article key={group.name}>
        <h3>{group.name}</h3>
        <div>{group.topics.map((topic) => <button className={subject.toLowerCase() === topic.toLowerCase() ? "active" : ""} key={topic} onClick={() => chooseTopic(topic)} type="button">{topic}<span>→</span></button>)}</div>
      </article>)}</div>
    </section>

    <section className="marketplace-body" id="tutor-results">
      <aside className="marketplace-filters">
        <div><p className="sys-kicker">REFINE YOUR MATCH</p><button onClick={clearFilters}>Reset</button></div>
        <fieldset>
          <legend>Topic</legend>
          <select value={subject} onChange={(event) => chooseSubject(event.target.value)}>
            <option value="all">All topics</option>
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
          <p>Select up to three coaches or tutors and compare them side by side.</p>
        </div>
      </aside>

      <div className="marketplace-results">
        <header>
          <div><p className="sys-kicker">YOUR MATCHES</p><h2>{loading ? "Finding people…" : selectedTopic ? `${filtered.length} ${filtered.length === 1 ? "match" : "matches"} for “${selectedTopic}”` : `${filtered.length} ${filtered.length === 1 ? "coach or tutor" : "coaches and tutors"} to consider`}</h2></div>
          <label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}><option value="recommended">Recommended</option><option value="available">Available soonest</option><option value="experience">Most experienced</option><option value="price">Lowest hourly rate</option></select></label>
        </header>
        <p className="marketplace-placement-note">Featured placement is paid advertising. Verification is assessed separately and never purchased.</p>
        {notice && <p className="notice" role="status">{notice}</p>}
        {!loading && filtered.length ? <div className="marketplace-grid">{filtered.map((tutor) =>
          <article className={`marketplace-card tier-${tutor.listingTier || "listed"}`} key={tutor.id} style={{ borderTopColor: tutor.schoolPrimaryColor || "#3556d8" }}>
            {tutor.listingTier === "spotlight" && <span className="marketplace-paid-badge">SPONSORED SPOTLIGHT</span>}
            {tutor.listingTier === "featured" && <span className="marketplace-paid-badge featured">FEATURED</span>}
            <div className="marketplace-card-person">
              {tutor.photoUrl ? <Image src={tutor.photoUrl} alt="" width={84} height={98} unoptimized /> : <span>{initials(tutor.displayName)}</span>}
              <div>
                <small>{tutor.verified ? "✓ VERIFIED · " : ""}{tutor.serviceType === "both" ? "COACH & TUTOR" : tutor.serviceType === "tutoring" ? "TUTOR" : "COACH"}</small>
                <h3>{tutor.displayName}</h3>
                <p>{tutor.headline}</p>
              </div>
            </div>
            <p className="marketplace-academy">From <Link href={`/schools/${tutor.schoolSlug}`}>{tutor.schoolName}</Link>{tutor.reviewCount > 0 && <span><b>{tutor.averageRating} ★</b> {tutor.reviewCount} verified {tutor.reviewCount === 1 ? "review" : "reviews"}</span>}</p>
            <div className="marketplace-card-subjects">{tutor.subjects.slice(0, 4).map((item) => <span key={item}>{item}</span>)}</div>
            <dl>
              <div><dt>Experience</dt><dd>{tutor.experienceYears ? `${tutor.experienceYears} years` : "See profile"}</dd></div>
              <div><dt>Format</dt><dd>{sessionLabel(tutor.sessionMode)}</dd></div>
              <div><dt>Hourly rate</dt><dd>{priceLabel(tutor)}</dd></div>
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
          <span>?</span><div><h2>{selectedTopic ? `No ${selectedTopic} coach is published yet.` : "No coaches are published yet."}</h2><p>{selectedTopic
            ? `Your ${selectedTopic} selection worked. NorthstarLabs does not currently have a published profile offering that topic, so we will not show you an unrelated coach.`
            : "Published coach and tutor profiles will appear here as soon as they are available."}</p><div className="marketplace-empty-actions"><button onClick={clearFilters}>Show all available coaches</button><a href="#request-a-match">Ask Northstar to find it</a><Link href="/login?mode=signup&next=%2Fwelcome%3Fpath%3Dcoach">Offer this topic</Link></div></div>
        </article>}
      </div>
    </section>

    <section className="marketplace-request" id="request-a-match">
      <div>
        <p className="sys-kicker">NO STRONG MATCH YET?</p>
        <h2>Tell us what the right person should help you achieve.</h2>
        <p>NorthstarLabs will use your detail to check the coach network and look for a credible subject expert. We will not substitute an unrelated profile just to fill the page.</p>
      </div>
      <LearningRequestForm key={selectedTopic || "open"} defaultType="coach" defaultTopic={selectedTopic} source="coach-marketplace" compact />
    </section>

    {compared.length > 0 && <section className="marketplace-compare" id="compare">
      <div className="marketplace-compare-heading">
        <div><p className="sys-kicker">SIDE-BY-SIDE</p><h2>Compare what matters.</h2><p>Select up to three people. The strongest choice is the one whose expertise, approach, rate, and availability fit your next step.</p></div>
        <button onClick={() => setComparedIds([])}>Clear comparison</button>
      </div>
      <div className="marketplace-compare-grid" style={{ gridTemplateColumns: `170px repeat(${compared.length}, minmax(210px, 1fr))` }}>
        <b>Coach or tutor</b>{compared.map((tutor) => <strong key={`name-${tutor.id}`}>{tutor.displayName}<small>{tutor.schoolName}</small></strong>)}
        <b>Topics</b>{compared.map((tutor) => <span key={`subject-${tutor.id}`}>{tutor.subjects.slice(0, 3).join(", ")}</span>)}
        <b>Experience</b>{compared.map((tutor) => <span key={`experience-${tutor.id}`}>{tutor.experienceYears ? `${tutor.experienceYears} years` : "See profile"}</span>)}
        <b>Learner proof</b>{compared.map((tutor) => <span key={`reviews-${tutor.id}`}>{tutor.reviewCount ? `${tutor.averageRating} ★ from ${tutor.reviewCount}` : "No verified reviews yet"}</span>)}
        <b>Format</b>{compared.map((tutor) => <span key={`mode-${tutor.id}`}>{sessionLabel(tutor.sessionMode)}</span>)}
        <b>Price</b>{compared.map((tutor) => <span key={`price-${tutor.id}`}>{priceLabel(tutor)}</span>)}
        <b>Availability</b>{compared.map((tutor) => <span key={`availability-${tutor.id}`}>{tutor.availableSlotCount ? `${tutor.availableSlotCount} open times` : "Enquire directly"}</span>)}
        <i aria-hidden="true" />{compared.map((tutor) => <Link key={`action-${tutor.id}`} href={`/schools/${tutor.schoolSlug}/tutors/${tutor.slug}`}>Choose {tutor.displayName.split(" ")[0]}</Link>)}
      </div>
    </section>}

    {compared.length > 0 && <div className="marketplace-compare-dock">
      <p><b>{compared.length}/3 selected</b><span>{compared.map((tutor) => tutor.displayName.split(" ")[0]).join(", ")}</span></p>
      <a href="#compare">Compare people</a>
    </div>}

    <section className="marketplace-bottom">
      <div><p className="sys-kicker">COACH OR TEACH ONE-TO-ONE?</p><h2>Put your expertise where learners can find it.</h2><p>Choose your visibility plan, set your own hourly rate, and receive protected enquiries.</p></div>
      <Link href="/login?mode=signup&next=%2Fwelcome%3Fpath%3Dcoach">Advertise my coaching →</Link>
    </section>
  </main>;
}
