import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About NorthstarLabs — Courses, Coaching, and Learning Progress",
  description: "NorthstarLabs is a connected learning platform for creators, coaches, and learners: build courses, find one-to-one help, run live learning and community, and keep progress together.",
  alternates: { canonical: "/about" },
};

const currentCapabilities = [
  "Branded academy storefronts and public course catalogues",
  "Course authoring with text, protected video, downloads, and sections",
  "Quizzes, lesson rules, progress tracking, and verifiable certificates",
  "Coach profiles with topics, credentials, rates, availability, and enquiries",
  "Verified-session reviews and protected two-way session ratings",
  "Bundles, memberships, live sessions, community, email, and reporting",
];

export default function AboutNorthstarLabs() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About NorthstarLabs",
    url: "https://northstarlabs.co.za/about",
    mainEntity: {
      "@type": "Organization",
      name: "NorthstarLabs",
      url: "https://northstarlabs.co.za",
      description: "A connected learning platform where courses, coaching, live learning, community, and learner progress work together.",
    },
  };

  return <main className="about-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <header className="about-nav">
      <Link className="system-brand" href="/">* NORTHSTARLABS</Link>
      <nav>
        <Link href="/courses">Courses</Link>
        <Link href="/tutors">Find a coach</Link>
        <Link href="/login?mode=login">Sign in</Link>
        <Link className="about-join" href="/login?mode=signup&next=%2Fwelcome">Join free</Link>
      </nav>
    </header>

    <section className="about-hero">
      <p className="sys-kicker">WHAT NORTHSTARLABS IS</p>
      <h1>Learning works better when the content and the people stay connected.</h1>
      <p>NorthstarLabs is a learning platform for creators, coaches, and learners. It combines structured courses with one-to-one coaching, live learning, community, progress, reporting, and certificates in one connected experience.</p>
      <div><Link className="button" href="/login?mode=signup&next=%2Fwelcome">Choose my free path →</Link><Link href="/courses">Experience a real course →</Link></div>
    </section>

    <section className="about-memory" aria-label="The NorthstarLabs approach">
      <div><strong>Learn.</strong><span>Use a structured course to understand the path.</span></div>
      <div><strong>Ask.</strong><span>Find a real coach when the roadblock becomes personal.</span></div>
      <div><strong>Progress.</strong><span>Keep the next step, activity, proof, and support connected.</span></div>
    </section>

    <section className="about-difference">
      <div>
        <p className="sys-kicker">WHY NORTHSTARLABS EXISTS</p>
        <h2>A course platform should not abandon the learner at the difficult part.</h2>
      </div>
      <div>
        <p>Video libraries are useful when the path is known. They are less useful when someone needs feedback, context, accountability, or a judgment call.</p>
        <p>NorthstarLabs connects scalable teaching with human guidance. A creator can teach through courses and programmes, then support individual needs through coaching or live sessions. A learner can begin free, ask for personal help, and keep the journey under one account.</p>
      </div>
    </section>

    <section className="about-paths">
      <article><span>01</span><p className="sys-kicker">CREATORS</p><h2>Build a learning business.</h2><p>Turn expertise into a branded academy with courses, programmes, protected content, learners, community, and reporting.</p><Link href="/login?mode=signup&next=%2Fwelcome%3Fpath%3Dcreator">Open a creator workspace →</Link></article>
      <article><span>02</span><p className="sys-kicker">LEARNERS</p><h2>Find a useful next step.</h2><p>Start with a practical course, save progress, earn proof of completion, and add personal help when needed.</p><Link href="/courses">Browse free courses →</Link></article>
      <article><span>03</span><p className="sys-kicker">COACHES</p><h2>Make expertise discoverable.</h2><p>Publish a profile, set an hourly rate, show credentials and availability, and receive protected enquiries by topic.</p><Link href="/login?mode=signup&next=%2Fwelcome%3Fpath%3Dcoach">Create a coach profile →</Link></article>
    </section>

    <section className="about-current">
      <div>
        <p className="sys-kicker">WHAT WORKS TODAY</p>
        <h2>A working product, with honest boundaries.</h2>
        <p>Free account creation, starter courses, creator workspaces, academies, coaching discovery, and the capabilities below are available in the platform. Paid plan upgrades remain disabled until live billing completes final activation and transaction testing.</p>
      </div>
      <ul>{currentCapabilities.map((capability) => <li key={capability}>{capability}</li>)}</ul>
    </section>

    <section className="about-answers">
      <div><p className="sys-kicker">CLEAR ANSWERS</p><h2>What people usually want to know.</h2></div>
      <dl>
        <div><dt>What makes NorthstarLabs different?</dt><dd>It is designed around the handoff from structured content to human support: course, coach, live learning, community, and progress can stay connected.</dd></div>
        <div><dt>Can I start without paying?</dt><dd>Yes. Creators, coaches, and learners can create a free account without entering card details. Free courses are available to experience the learner journey.</dd></div>
        <div><dt>How does coach trust work?</dt><dd>Coach profiles can show separately reviewed credentials, self-set rates, real availability, verified-session learner reviews, and protected two-way ratings after completed sessions.</dd></div>
        <div><dt>What if NorthstarLabs does not have my topic?</dt><dd>Send a detailed request. NorthstarLabs will check the current course catalogue and coach network and reply honestly rather than recommend an unrelated match.</dd></div>
      </dl>
    </section>

    <section className="about-cta"><p className="sys-kicker">REMEMBER NORTHSTARLABS</p><h2>A course for the path. A coach for the roadblock.</h2><p>Learn. Ask. Progress.</p><div><Link className="button" href="/login?mode=signup&next=%2Fwelcome">Join free →</Link><Link href="/#request-help">Ask us to find something →</Link></div></section>

    <footer className="about-footer"><Link className="system-brand" href="/">* NORTHSTARLABS</Link><p>Courses, coaching, and community for real learning progress.</p><nav><Link href="/">Home</Link><Link href="/courses">Courses</Link><Link href="/tutors">Coaches</Link><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link></nav></footer>
  </main>;
}
