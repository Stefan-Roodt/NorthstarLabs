"use client";

import { useState } from "react";
import Link from "next/link";

const creatorSignupHref = "/login?mode=signup&next=%2Fwelcome%3Fpath%3Dcreator";
const coachSignupHref = "/login?mode=signup&next=%2Fwelcome%3Fpath%3Dcoach";
const generalSignupHref = "/login?mode=signup&next=%2Fwelcome";

const features = [
  {
    n: "01",
    title: "Build learning people finish",
    text: "Create structured courses with flexible lessons, private video, quizzes, progress rules, and completion certificates.",
    href: "/courses",
    link: "Explore free courses",
  },
  {
    n: "02",
    title: "Create a place they belong",
    text: "Bring learning, member conversations, moderation, and community access together in one branded experience.",
    href: "#product-tour",
    link: "See the workflow",
  },
  {
    n: "03",
    title: "Guide growth with clear signals",
    text: "Understand enrolment, progress, completion, course performance, and where individual learners need support.",
    href: "#product-tour",
    link: "Explore the platform",
  },
];

const valueStack = [
  {
    n: "01",
    title: "Course creation",
    text: "Turn your expertise into structured lessons with text, protected video, downloads, quizzes, prerequisites, and completion rules.",
  },
  {
    n: "02",
    title: "Learning with human guidance",
    text: "Give every learner one clear home for lessons, bookable one-to-one coaching, live sessions, saved progress, community, and certificates.",
  },
  {
    n: "03",
    title: "Products that retain",
    text: "Package courses with personal coaching, bundles, memberships, and live programmes instead of selling disconnected files.",
  },
  {
    n: "04",
    title: "Less administration",
    text: "Invite learners, grant or pause access, review progress, send updates, and manage support without a spreadsheet maze.",
  },
  {
    n: "05",
    title: "A brand people remember",
    text: "Bring your academy, catalogue, courses, community, and learner experience together under one consistent identity.",
  },
  {
    n: "06",
    title: "Clarity as you grow",
    text: "Use reporting, exports, audit history, and backups to understand what is working and operate with confidence.",
  },
];

const disconnectedTools = [
  "Course builder",
  "Video host",
  "Quiz tool",
  "Community app",
  "Live calendar",
  "Progress reports",
];

const plans = [
  {
    name: "Launch",
    price: 549,
    description: "For new creators publishing their first learning products.",
    features: ["Course builder and storefront", "Private video lessons", "Quizzes and certificates", "Learner progress tracking", "Community discussions", "Email support"],
  },
  {
    name: "Build",
    price: 1249,
    description: "For growing businesses managing courses and a learning community.",
    features: ["Everything in Launch", "Multiple learning products", "Community member management", "Moderation controls", "Learner administration", "Priority email support"],
  },
  {
    name: "Grow",
    price: 2699,
    description: "For established academies that need deeper visibility and support.",
    popular: true,
    features: ["Everything in Build", "Creator analytics dashboard", "Course performance reporting", "Learner CSV exports", "Private learner support notes", "Priority support"],
  },
  {
    name: "Scale",
    price: 5699,
    description: "For high-volume learning businesses needing more operational control.",
    features: ["Everything in Grow", "Higher product capacity", "Higher active learner capacity", "Advanced administration", "Launch planning support", "Priority success support"],
  },
];

const faqs = [
  {
    question: "Can I try NorthstarLabs before choosing a plan?",
    answer: "Yes. Create one free account, choose whether to create or learn, and start immediately without entering payment details.",
  },
  {
    question: "What do I get immediately after signing up?",
    answer: "Creators can open an academy workspace and begin a course draft. Learners can choose a practical starter course. Both paths keep learning, progress, live sessions, and community access under one account.",
  },
  {
    question: "What can I publish?",
    answer: "You can build structured courses with text, private video, quizzes, completion requirements, and certificates. You can also run a member community alongside the learning experience.",
  },
  {
    question: "Can I manage individual learners?",
    answer: "Yes. Creators can grant or pause access, review progress, reset progress when needed, keep private support notes, and export learner records.",
  },
  {
    question: "Does NorthstarLabs work on mobile?",
    answer: "The public site, course catalogue, learner experience, community, and creator administration are designed to adapt to phones, tablets, and desktop screens.",
  },
  {
    question: "Are paid plan upgrades available now?",
    answer: "Account creation and the starter courses are available now. Paid upgrades will open after live billing has completed final activation and transaction testing.",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="#top" aria-label="NorthstarLabs home"><span className="brand-mark" aria-hidden="true">✦</span><span className="brand-wordmark">NORTHSTARLABS</span></a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Main navigation">
          <a href="#platform">Platform</a>
          <a href="#value">Why Northstar</a>
          <Link href="/courses">Free courses</Link>
          <Link href="/tutors">Find a coach</Link>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="nav-actions"><a className="login" href="/login?mode=login">Log in</a><a className="button small" href={generalSignupHref}>Join free</a></div>
        <button className="menu" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation">{menuOpen ? "Close" : "Menu"}</button>
      </header>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Courses <span>•</span> Live learning <span>•</span> Human coaching <span>•</span> Progress</p>
          <h1>One place to build, deliver, and grow <em>learning that works.</em></h1>
          <p className="lede">Create courses, host protected video, run live sessions and a community, invite learners, track progress, and award certificates—from one branded platform.</p>
          <div className="hero-actions"><a className="button" href={creatorSignupHref}>Build my academy free <span>↗</span></a><a className="text-link" href="#value">See everything included <span>↓</span></a></div>
          <ul className="hero-benefits" aria-label="Free account benefits">
            <li><span>✓</span> No credit card</li>
            <li><span>✓</span> Guided setup</li>
            <li><span>✓</span> Start with one useful idea</li>
          </ul>
        </div>

        <div className="product-stage" aria-label="Sample NorthstarLabs creator dashboard">
          <div className="sample-label">SAMPLE CREATOR WORKSPACE</div>
          <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
          <div className="dashboard">
            <aside><div className="dash-logo">✦</div><div className="side-line active"/><div className="side-line"/><div className="side-line short"/><div className="side-spacer"/><div className="avatar">NS</div></aside>
            <div className="dash-main">
              <div className="dash-head"><div><small>GOOD MORNING, MAYA</small><h3>Your learning business</h3></div><button>+ Create</button></div>
              <div className="metrics"><article><small>ENROLMENTS</small><b>284</b><span>↑ this month</span></article><article><small>ACTIVE LEARNERS</small><b>163</b><span>3 courses</span></article><article><small>COMPLETION</small><b>78%</b><span>Across courses</span></article></div>
              <div className="dash-grid"><article className="chart-card"><div className="card-head"><span>Learner progress</span><small>Last 6 months</small></div><div className="chart"><div className="grid-lines"/><div className="bars"><i style={{height:"31%"}}/><i style={{height:"47%"}}/><i style={{height:"42%"}}/><i style={{height:"64%"}}/><i style={{height:"58%"}}/><i style={{height:"86%"}}/></div></div><div className="months"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div></article>
              <article className="activity"><div className="card-head"><span>Live activity</span><b>•••</b></div><div className="person"><i>KL</i><p><b>Kai enrolled</b><small>Course Launch Lab</small></p><time>Now</time></div><div className="person"><i>AM</i><p><b>Ana completed</b><small>Pricing Your Expertise</small></p><time>4m</time></div><div className="person"><i>DR</i><p><b>Dev posted</b><small>Creator Community</small></p><time>12m</time></div></article></div>
            </div>
          </div>
          <div className="float-card"><span>THIS WEEK</span><strong>+28</strong><small>new enrolments</small></div>
        </div>
      </section>

      <section className="proof-strip" id="results"><div className="shell stats">
        <div><strong>Build</strong><span>courses, quizzes, and certificates</span></div>
        <div><strong>Deliver</strong><span>protected media and live learning</span></div>
        <div><strong>Engage</strong><span>learners through one community</span></div>
        <div><strong>Improve</strong><span>with progress and reporting</span></div>
      </div></section>

      <section className="home-tutor-discovery shell">
        <div>
          <p className="section-kicker">WHEN YOU NEED A PERSON, NOT ANOTHER VIDEO</p>
          <h2>Find one-to-one help for the part that has you stuck.</h2>
        </div>
        <p>Search coaches and tutors by topic, experience, self-set hourly rate, format, and real appointment availability.</p>
        <div className="home-tutor-actions">
          <Link href="/tutors">Find my coach <span>→</span></Link>
          <a href={coachSignupHref}>Advertise my services <span>→</span></a>
        </div>
      </section>

      <section className="logos shell" aria-label="Who NorthstarLabs is designed for">
        <p>Designed for people who teach, guide, and enable others</p>
        <div><span>INDEPENDENT EDUCATORS</span><span>COACHES</span><span>TRAINING TEAMS</span><span>CUSTOMER ACADEMIES</span><span>MEMBERSHIP CREATORS</span></div>
      </section>

      <section className="value shell" id="value">
        <div className="value-heading">
          <p className="section-kicker">THE VALUE OF ONE CONNECTED PLATFORM</p>
          <h2>Stop stitching tools together. Start building learner momentum.</h2>
          <p>NorthstarLabs connects the work before enrolment, structured learning, and the personal coaching that helps people make progress. Nothing important gets stranded in another app.</p>
        </div>

        <div className="value-comparison" aria-label="Disconnected tools compared with NorthstarLabs">
          <div className="tool-pile">
            <p className="sys-kicker">THE SCATTERED SETUP</p>
            <div>{disconnectedTools.map((tool) => <span key={tool}>{tool}</span>)}</div>
            <small>Separate logins, bills, data, and learner journeys.</small>
          </div>
          <div className="value-arrow" aria-hidden="true">→</div>
          <div className="northstar-core">
            <p className="sys-kicker">THE NORTHSTAR WAY</p>
            <strong><i>✦</i> One academy workspace</strong>
            <ul>
              <li>One creator workflow</li>
              <li>One learner experience</li>
              <li>One source of progress data</li>
            </ul>
          </div>
        </div>

        <div className="value-grid">{valueStack.map((item) => <article key={item.n}>
          <span>{item.n}</span>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>)}</div>

        <div className="value-cta">
          <div><p className="section-kicker">BUILD BEFORE YOU BUY</p><h3>Start with the complete workflow, not another disconnected trial.</h3></div>
          <a className="button" href={creatorSignupHref}>Create my free academy <span>→</span></a>
        </div>
      </section>

      <section className="join-path shell" id="start">
        <div className="join-path-heading">
          <p className="section-kicker">SIMPLE TO JOIN. USEFUL FROM THE FIRST SESSION.</p>
          <h2>Three clear steps. No blank dashboard.</h2>
          <p>Join with Google or email, choose what you want to do first, and arrive in the right workspace with a useful next step waiting.</p>
        </div>
        <div className="signup-steps" aria-label="How to join NorthstarLabs">
          <div><span>01</span><p><b>Create your free account</b><small>Google or email. No payment details.</small></p></div>
          <div><span>02</span><p><b>Choose your starting path</b><small>Create, coach, or begin learning.</small></p></div>
          <div><span>03</span><p><b>Start in the right place</b><small>Build, advertise your expertise, or choose a course.</small></p></div>
        </div>
        <div className="join-path-grid">
          <article>
            <span>01</span>
            <p className="section-kicker">FOR CREATORS</p>
            <h3>I want to build a course.</h3>
            <p>Open a guided workspace, create your first draft, and turn one useful idea into a clear learning path.</p>
            <a className="button" href={creatorSignupHref}>Start creating free →</a>
            <small>No payment details required</small>
          </article>
          <article>
            <span>02</span>
            <p className="section-kicker">FOR LEARNERS</p>
            <h3>I want to learn something useful.</h3>
            <p>Choose a short practical course, enrol free, and keep your lessons, progress, and certificate together.</p>
            <Link className="button dark" href="/courses">Choose a free course →</Link>
            <small>Six free practical courses available</small>
          </article>
        </div>
      </section>

      <section className="platform shell" id="platform">
        <p className="section-kicker">ONE PLATFORM. EVERY USEFUL STEP.</p>
        <div className="section-title"><h2>Build the learning business you’ve imagined.</h2><p>From your first lesson to a growing learner community, NorthstarLabs keeps creation, delivery, support, and reporting connected.</p></div>
        <div className="feature-grid">{features.map((feature) => <article key={feature.n}><span>{feature.n}</span><div className="feature-icon">{feature.n === "01" ? "◫" : feature.n === "02" ? "◎" : "↗"}</div><h3>{feature.title}</h3><p>{feature.text}</p><a href={feature.href}>{feature.link} <b>→</b></a></article>)}</div>
      </section>

      <section className="story" id="solutions"><div className="shell story-grid">
        <div className="story-copy"><p className="section-kicker">MADE FOR MOMENTUM</p><h2>One home for your knowledge—and your next chapter.</h2><p>Launch a signature course. Train customers. Build a member academy. NorthstarLabs adapts to the learning business you have and the one you’re building.</p><ul><li><span>✓</span> Your brand, courses, and learner experience together</li><li><span>✓</span> Quizzes, progress rules, and certificates built in</li><li><span>✓</span> Community, analytics, and learner support connected</li></ul><Link className="button dark" href="/courses">Experience a real course</Link></div>
        <div className="course-card"><div className="course-visual"><span>NORTHSTARLABS ORIGINAL</span><div className="sun"/><h4>Ideas into<br/>impact.</h4></div><div className="course-meta"><div><small>FREE STARTER COURSE</small><b>Launch Your First Online Course</b></div><span>6 lessons<br/>90 minutes</span></div><div className="progress"><i/><span>72% complete</span></div></div>
      </div></section>

      <section className="product-tour shell" id="product-tour">
        <div className="tour-heading"><p className="section-kicker">A CLEAR PATH FROM IDEA TO IMPACT</p><h2>See how the work fits together.</h2><p>NorthstarLabs is built around the actual journey: create something useful, publish it clearly, then help learners succeed.</p></div>
        <div className="tour-steps">
          <article><span>01</span><p className="sys-kicker">BUILD</p><h3>Shape the curriculum.</h3><p>Create lessons, add private video, design knowledge checks, and decide what completion means.</p><a href={creatorSignupHref}>Open the creator workspace →</a></article>
          <article><span>02</span><p className="sys-kicker">PUBLISH</p><h3>Give the course a real home.</h3><p>Present the promise, curriculum, format, and enrolment path in a focused branded storefront.</p><Link href="/courses">Explore a live example →</Link></article>
          <article><span>03</span><p className="sys-kicker">GUIDE</p><h3>Support learner progress.</h3><p>Review enrolment and completion, manage access, take support notes, and improve the learning experience.</p><a href={creatorSignupHref}>Start with the guided setup →</a></article>
        </div>
      </section>

      <section className="pricing" id="pricing"><div className="shell">
        <p className="section-kicker">START FREE. GROW WHEN THE VALUE IS CLEAR.</p>
        <div className="pricing-head"><h2>Build before you make a buying decision.</h2><div><p>Create your academy, begin a course draft, and experience the learner journey before choosing a paid plan.</p><span>Prices shown in ZAR · paid upgrades are not yet active</span></div></div>
        <div className="free-start">
          <div><span>YOUR STARTING PLAN</span><h3>Free to begin</h3><p>Open your academy workspace, shape your first course, and explore NorthstarLabs without entering payment details.</p></div>
          <ul><li>Creator and learner paths</li><li>Guided academy setup</li><li>Practical starter courses</li></ul>
          <a className="button" href={creatorSignupHref}>Start building free <span>→</span></a>
        </div>
        <div className="pricing-grid">{plans.map((plan) => <article className={plan.popular ? "price-card popular" : "price-card"} key={plan.name}>
          {plan.popular && <b className="popular-label">FOR GROWING ACADEMIES</b>}<p className="plan-name">{plan.name}</p><p className="plan-description">{plan.description}</p>
          <div className="plan-price"><span>R{plan.price.toLocaleString("en-ZA")}</span><small>/ month</small></div>
          <a className="button" href={creatorSignupHref}>Start building free <span>→</span></a><ul>{plan.features.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}</ul>
        </article>)}</div>
        <p className="pricing-note">Create an account and build for free now. Paid upgrades will be enabled only after live billing passes final testing.</p>
      </div></section>

      <section className="faq shell" id="faq">
        <div className="faq-heading"><p className="section-kicker">FREQUENTLY ASKED QUESTIONS</p><h2>Clear answers before you start.</h2></div>
        <div className="faq-list">{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}</div>
      </section>

      <section className="cta"><div className="shell"><p className="eyebrow">YOUR KNOWLEDGE DESERVES A WORKING SYSTEM</p><h2>Build it once.<br/>Help people grow.</h2><p>Give your expertise a clear structure, a memorable home, and a learner experience you can improve over time.</p><div><a className="button" href={creatorSignupHref}>Build my academy free <span>↗</span></a><Link className="text-link light" href="/courses">Experience a real course →</Link></div><small className="cta-reassurance">No credit card · Guided setup · Switch between creating and learning anytime</small></div></section>

      <footer className="footer shell"><div className="brand"><span className="brand-mark" aria-hidden="true">✦</span><span className="brand-wordmark">NORTHSTARLABS</span></div><p>One connected platform for practical learning businesses.</p><div className="footer-links"><a href="#platform">Platform</a><Link href="/courses">Courses</Link><a href="#product-tour">Product tour</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link></div><small>© 2026 Northstar Labs. All rights reserved.</small></footer>
    </main>
  );
}
