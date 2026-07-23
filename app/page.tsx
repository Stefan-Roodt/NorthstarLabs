import Link from "next/link";

const learnerSignupHref = "/login?mode=signup&role=learner&next=%2Fwelcome%3Fpath%3Dlearner";
const coachSignupHref = "/login?mode=signup&role=coach&next=%2Fwelcome%3Fpath%3Dcoach";
const creatorSignupHref = "/login?mode=signup&role=creator&next=%2Fwelcome%3Fpath%3Dcreator";

const paths = [
  {
    number: "01",
    label: "ONE-TO-ONE HELP",
    title: "Find your coach",
    description:
      "Tell us what you want to achieve. Compare relevant people by expertise, rate, availability, and verified-session reviews.",
    href: "/tutors",
    action: "Find a coach",
    detail: "Any topic - no fee to search",
    tone: "coach",
  },
  {
    number: "02",
    label: "LEARN AT YOUR PACE",
    title: "Take a course",
    description:
      "Start with a structured path, keep your progress in one place, and bring in a coach whenever you need personal help.",
    href: "/courses",
    action: "Browse courses",
    detail: "New subjects can grow continuously",
    tone: "learn",
  },
  {
    number: "03",
    label: "SHARE YOUR EXPERTISE",
    title: "Coach or teach",
    description:
      "Offer one-to-one sessions, publish courses, run live learning, and build a trusted practice around what you know.",
    href: creatorSignupHref,
    action: "Start earning",
    detail: "No credit card required",
    tone: "create",
  },
];

const popularTopics = ["Career", "Business", "Technology", "Money", "Languages", "Wellbeing", "Creative skills", "School support"];

export default function Home() {
  return (
    <main className="decision-home">
      <header className="decision-nav">
        <Link className="decision-brand" href="/" aria-label="NorthstarLabs home">
          <span aria-hidden="true">*</span>
          <b>NORTHSTARLABS</b>
        </Link>

        <nav aria-label="Main navigation">
          <Link href="/courses">Courses</Link>
          <Link href="/tutors">Coaches</Link>
          <Link href="/community">Community</Link>
          <Link href="/about">What Northstar does</Link>
          <Link href="/pricing">Pricing</Link>
        </nav>

        <div className="decision-account">
          <Link href="/login?mode=login">Sign in</Link>
          <Link href={learnerSignupHref}>Join free as Student</Link>
        </div>

        <details className="decision-menu">
          <summary>Menu</summary>
          <div>
            <Link href="/courses">Take a course</Link>
            <Link href={learnerSignupHref}>Join as Student</Link>
            <Link href={coachSignupHref}>Join as Coach/Tutor</Link>
            <a href={creatorSignupHref}>Build an academy</a>
            <Link href="/about">What Northstar does</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/login?mode=login">Sign in</Link>
          </div>
        </details>
      </header>

      <section className="decision-hero" aria-labelledby="home-title">
        <div className="decision-intro">
          <p className="decision-kicker">REAL PEOPLE - REAL PROGRESS</p>
          <h1 id="home-title">
            Whatever you want to learn, <em>find someone who can help.</em>
          </h1>
          <p>
            NorthstarLabs brings one-to-one coaching, structured courses, and useful communities together across the topics people
            care about. Start with your goal-not a maze of products.
          </p>
          <div className="decision-trust" aria-label="Why it is easy to start">
            <span><b>Any</b> useful topic</span>
            <span><b>Human</b> one-to-one support</span>
            <span><b>One</b> place to keep progressing</span>
          </div>
        </div>

        <div className="decision-paths" aria-label="Choose your NorthstarLabs path">
          {paths.map((path) => (
            <a className={`decision-path ${path.tone}`} href={path.href} key={path.number}>
              <span className="decision-path-number">{path.number}</span>
              <div>
                <p>{path.label}</p>
                <h2>{path.title}</h2>
                <span>{path.description}</span>
              </div>
              <footer>
                <small>{path.detail}</small>
                <b>{path.action}</b>
              </footer>
            </a>
          ))}
        </div>
      </section>

      <section className="decision-topics" aria-labelledby="topics-title">
        <div>
          <p className="decision-kicker">START WITH WHAT YOU NEED</p>
          <h2 id="topics-title">One platform. Thousands of possible goals.</h2>
        </div>
        <div className="decision-topic-list">
          {popularTopics.map((topic) => <Link href={`/tutors?q=${encodeURIComponent(topic)}`} key={topic}>{topic}<span> more</span></Link>)}
        </div>
        <Link className="decision-topic-request" href="/demand">
          <span>Can&apos;t find it?</span>
          <b>Request any topic and let Northstar look for the right coach</b>
        </Link>
      </section>

      <section className="decision-dock" aria-label="Useful shortcuts">
        <Link href="/learn">
          <span>Already learning?</span>
          <b>Continue my course</b>
        </Link>
        <Link href="/tutors">
          <span>Need personal help?</span>
          <b>Compare available coaches</b>
        </Link>
        <Link href="/community">
          <span>Learn with other people</span>
          <b>Join the community</b>
        </Link>
        <Link href="/demand">
          <span>Can&apos;t find the topic?</span>
          <b>Tell Northstar what you need</b>
        </Link>
      </section>

      <footer className="decision-footer">
        <div><b>* NORTHSTARLABS</b><span>Courses for the path. Human help for the roadblocks.</span></div>
        <nav><Link href="/about">About</Link><Link href="/solutions">All solutions</Link><Link href="/demand">Demand board</Link><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link></nav>
        <small>(c) 2026 NorthstarLabs</small>
      </footer>
    </main>
  );
}
