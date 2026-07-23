import Link from "next/link";

const learnerSignupHref = "/login?mode=signup&role=learner&next=%2Fwelcome%3Fpath%3Dlearner";
const coachSignupHref = "/login?mode=signup&role=coach&next=%2Fwelcome%3Fpath%3Dcoach";
const creatorSignupHref = "/login?mode=signup&role=creator&next=%2Fwelcome%3Fpath%3Dcreator";

const paths = [
  {
    number: "01",
    label: "LEARN AT YOUR PACE",
    title: "Take a course",
    description:
      "Choose a structured learning path, preview the syllabus, and keep your lessons, progress, assessments, and certificates together.",
    href: "/courses",
    action: "Browse courses",
    detail: "Preview before you enrol",
    tone: "learn",
  },
  {
    number: "02",
    label: "PERSONAL LEARNING HELP",
    title: "Find a coach",
    description:
      "Compare coaches by expertise, rate, availability, credentials, and verified-session reviews. Searching is always free.",
    href: "/tutors",
    action: "Compare coaches",
    detail: "Any topic - no fee to search",
    tone: "coach",
  },
  {
    number: "03",
    label: "OFFER ONE-TO-ONE HELP",
    title: "Become a coach",
    description:
      "Create a professional profile, set your own rate and availability, receive enquiries, and build trust through completed-session reviews.",
    href: coachSignupHref,
    action: "Create coach profile",
    detail: "Free listing - you control your rate",
    tone: "coach",
  },
  {
    number: "04",
    label: "BUILD AND TEACH",
    title: "Open an academy",
    description:
      "Create your branded learning space, import modules, publish courses, invite learners, and manage teaching from one workspace.",
    href: creatorSignupHref,
    action: "Build my academy",
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
          <Link href={learnerSignupHref}>Join free as a learner</Link>
        </div>

        <details className="decision-menu">
          <summary>Menu</summary>
          <div>
            <Link href="/courses">Take a course</Link>
            <Link href={learnerSignupHref}>Join as a learner</Link>
            <Link href={coachSignupHref}>Join as Coach/Tutor</Link>
            <Link href={creatorSignupHref}>Build an academy</Link>
            <Link href="/about">What Northstar does</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/login?mode=login">Sign in</Link>
          </div>
        </details>
      </header>

      <section className="decision-hero" aria-labelledby="home-title">
        <div className="decision-intro">
          <p className="decision-kicker">COURSES THAT LEAD TO PROGRESS</p>
          <h1 id="home-title">
            Learn with a clear path. <em>Get human help when you need it.</em>
          </h1>
          <p>
            NorthstarLabs brings structured courses, practical assessments, useful communities, and optional one-to-one coaching
            together. Start learning immediately, or choose the professional path that fits your work.
          </p>
          <div className="decision-trust" aria-label="Why it is easy to start">
            <span><b>Preview</b> before enrolling</span>
            <span><b>Human</b> help when needed</span>
            <span><b>One</b> place for your progress</span>
          </div>
        </div>

        <div className="decision-paths" aria-label="Choose your NorthstarLabs path">
          {paths.map((path) => (
            <Link className={`decision-path ${path.tone}`} href={path.href} key={path.number}>
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
            </Link>
          ))}
        </div>
      </section>

      <section className="decision-topics" aria-labelledby="topics-title">
        <div>
          <p className="decision-kicker">START WITH WHAT YOU NEED</p>
          <h2 id="topics-title">One platform. Thousands of possible goals.</h2>
        </div>
        <div className="decision-topic-list">
          {popularTopics.map((topic) => <Link href={`/courses?query=${encodeURIComponent(topic)}`} key={topic}>{topic}<span> explore</span></Link>)}
        </div>
        <Link className="decision-topic-request" href="/demand">
          <span>Can&apos;t find it?</span>
          <b>Request a topic and let Northstar look for the right course or expert</b>
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
