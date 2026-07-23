import type { Metadata } from "next";
import Link from "next/link";
import { searchLandingPages } from "../../lib/search-landing-pages";

export const metadata: Metadata = {
  title: "Learning, Coaching, and Training Solutions",
  description: "Explore NorthstarLabs solutions for online learning, business coaching, Bitcoin education, course creation, coach discovery, and workplace training.",
  alternates: { canonical: "/solutions" },
  openGraph: {
    title: "Learning, Coaching, and Training Solutions | NorthstarLabs",
    description: "Start with the outcome you need. Find a course, coach, creator workspace, or training route that moves you forward.",
    url: "/solutions",
  },
};

export default function SolutionsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "NorthstarLabs learning, coaching, and training solutions",
    url: "https://northstarlabs.co.za/solutions",
    description: "Practical routes for learners, coaches, course creators, and training teams.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: searchLandingPages.map((page, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: page.shortTitle,
        url: `https://northstarlabs.co.za/solutions/${page.slug}`,
      })),
    },
  };

  return <main className="search-hub">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <header className="search-nav">
      <Link className="system-brand" href="/">* NORTHSTARLABS</Link>
      <nav>
        <Link href="/courses">Courses</Link>
        <Link href="/tutors">Coaches</Link>
        <Link href="/about">Why Northstar?</Link>
        <Link href="/login?mode=login">Sign in</Link>
        <Link className="search-nav-join" href="/login?mode=signup&next=%2Fwelcome">Join free</Link>
      </nav>
    </header>

    <section className="search-hub-hero">
      <div>
        <p className="sys-kicker">START WITH THE RESULT</p>
        <h1>What do you need to learn, build, or solve?</h1>
      </div>
      <div>
        <p>Choose the route closest to your goal. Each guide explains what good looks like, what NorthstarLabs offers now, and the most useful next action.</p>
        <Link className="button" href="/find">Help me choose →</Link>
      </div>
    </section>

    <section className="search-hub-grid" aria-label="NorthstarLabs solution guides">
      {searchLandingPages.map((page, index) => <Link href={`/solutions/${page.slug}`} key={page.slug}>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <p className="sys-kicker">{page.eyebrow}</p>
        <h2>{page.shortTitle}</h2>
        <p>{page.description}</p>
        <strong>Explore this route →</strong>
      </Link>)}
    </section>

    <section className="search-hub-promise">
      <div><p className="sys-kicker">THE NORTHSTAR PROMISE</p><h2>No forced match. No invented certainty.</h2></div>
      <div><p>If the current course catalogue or coach network does not contain a credible fit, tell NorthstarLabs what you need. The team will look for a useful match and say so honestly if one is not available.</p><Link href="/#request-help">Ask us to find something →</Link></div>
    </section>

    <footer className="search-footer">
      <Link className="system-brand" href="/">* NORTHSTARLABS</Link>
      <p>Courses for the path. Human coaching for the roadblocks.</p>
      <nav><Link href="/about">About</Link><Link href="/courses">Courses</Link><Link href="/tutors">Coaches</Link><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link></nav>
    </footer>
  </main>;
}
