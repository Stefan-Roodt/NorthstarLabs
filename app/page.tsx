"use client";

import { useState } from "react";

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
    answer: "Yes. Create an account, build your first course, and explore the starter learning collection without entering payment details.",
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
        <a className="brand" href="#top" aria-label="NorthstarLabs home"><span className="brand-mark">✦</span> NORTHSTARLABS</a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Main navigation">
          <a href="#platform">Platform</a>
          <a href="/courses">Free courses</a>
          <a href="#product-tour">Product tour</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="nav-actions"><a className="login" href="/login">Log in</a><a className="button small" href="/login">Start free</a></div>
        <button className="menu" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation">{menuOpen ? "Close" : "Menu"}</button>
      </header>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Courses <span>•</span> Communities <span>•</span> Learner success</p>
          <h1>Turn what you know into <em>growth</em> that compounds.</h1>
          <p className="lede">NorthstarLabs gives creators and training teams one clear place to build learning, guide people, and understand what helps them succeed.</p>
          <div className="hero-actions"><a className="button" href="/login">Start building free <span>↗</span></a><a className="text-link" href="/courses">Take a free course <span>→</span></a></div>
          <div className="micro-proof"><span className="micro-mark">✓</span><p><strong>No credit card required.</strong> Start with a real course or build your own.</p></div>
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
        <div><strong>Engage</strong><span>learners in one community</span></div>
        <div><strong>Support</strong><span>individual progress and access</span></div>
        <div><strong>Improve</strong><span>with practical reporting</span></div>
      </div></section>

      <section className="logos shell" aria-label="Who NorthstarLabs is designed for">
        <p>Designed for people who teach, guide, and enable others</p>
        <div><span>INDEPENDENT EDUCATORS</span><span>COACHES</span><span>TRAINING TEAMS</span><span>CUSTOMER ACADEMIES</span><span>MEMBERSHIP CREATORS</span></div>
      </section>

      <section className="platform shell" id="platform">
        <p className="section-kicker">ONE PLATFORM. EVERY USEFUL STEP.</p>
        <div className="section-title"><h2>Build the learning business you’ve imagined.</h2><p>From your first lesson to a growing learner community, NorthstarLabs keeps creation, delivery, support, and reporting connected.</p></div>
        <div className="feature-grid">{features.map((feature) => <article key={feature.n}><span>{feature.n}</span><div className="feature-icon">{feature.n === "01" ? "◫" : feature.n === "02" ? "◎" : "↗"}</div><h3>{feature.title}</h3><p>{feature.text}</p><a href={feature.href}>{feature.link} <b>→</b></a></article>)}</div>
      </section>

      <section className="story" id="solutions"><div className="shell story-grid">
        <div className="story-copy"><p className="section-kicker">MADE FOR MOMENTUM</p><h2>One home for your knowledge—and your next chapter.</h2><p>Launch a signature course. Train customers. Build a member academy. NorthstarLabs adapts to the learning business you have and the one you’re building.</p><ul><li><span>✓</span> Your brand, courses, and learner experience together</li><li><span>✓</span> Quizzes, progress rules, and certificates built in</li><li><span>✓</span> Community, analytics, and learner support connected</li></ul><a className="button dark" href="/courses">Experience a real course</a></div>
        <div className="course-card"><div className="course-visual"><span>NORTHSTARLABS ORIGINAL</span><div className="sun"/><h4>Ideas into<br/>impact.</h4></div><div className="course-meta"><div><small>FREE STARTER COURSE</small><b>Launch Your First Online Course</b></div><span>6 lessons<br/>90 minutes</span></div><div className="progress"><i/><span>72% complete</span></div></div>
      </div></section>

      <section className="product-tour shell" id="product-tour">
        <div className="tour-heading"><p className="section-kicker">A CLEAR PATH FROM IDEA TO IMPACT</p><h2>See how the work fits together.</h2><p>NorthstarLabs is built around the actual journey: create something useful, publish it clearly, then help learners succeed.</p></div>
        <div className="tour-steps">
          <article><span>01</span><p className="sys-kicker">BUILD</p><h3>Shape the curriculum.</h3><p>Create lessons, add private video, design knowledge checks, and decide what completion means.</p><a href="/login?next=/dashboard">Open the creator workspace →</a></article>
          <article><span>02</span><p className="sys-kicker">PUBLISH</p><h3>Give the course a real home.</h3><p>Present the promise, curriculum, format, and enrolment path in a focused branded storefront.</p><a href="/courses">Explore a live example →</a></article>
          <article><span>03</span><p className="sys-kicker">GUIDE</p><h3>Support learner progress.</h3><p>Review enrolment and completion, manage access, take support notes, and improve the learning experience.</p><a href="/login?next=/dashboard/analytics">See creator analytics →</a></article>
        </div>
      </section>

      <section className="pricing" id="pricing"><div className="shell">
        <p className="section-kicker">PRICING BUILT FOR MOMENTUM</p>
        <div className="pricing-head"><h2>Plans that grow with your learning business.</h2><div><p>Start free today. Choose a paid plan only when live upgrades open and you need more capacity or support.</p><span>Prices shown in ZAR · paid upgrades are not yet active</span></div></div>
        <div className="momentum-kit"><div><span>INCLUDED FROM DAY ONE</span><h3>The NorthstarLabs Momentum Kit</h3><p>A practical launch checklist, pricing worksheet, email prompts, milestone guidance, and a seven-day path from blank course to publish-ready first version.</p></div><strong>FREE<br/><small>with every plan</small></strong></div>
        <div className="pricing-grid">{plans.map((plan) => <article className={plan.popular ? "price-card popular" : "price-card"} key={plan.name}>
          {plan.popular && <b className="popular-label">FOR GROWING ACADEMIES</b>}<p className="plan-name">{plan.name}</p><p className="plan-description">{plan.description}</p>
          <div className="plan-price"><span>R{plan.price.toLocaleString("en-ZA")}</span><small>/ month</small></div>
          <a className="button" href={`/login?plan=${plan.name.toLowerCase()}`}>Start free <span>→</span></a><ul><li className="kit-feature"><span>✦</span>Momentum Kit included</li>{plan.features.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}</ul>
        </article>)}</div>
        <p className="pricing-note">Create an account and build for free now. Paid upgrades will be enabled only after live billing passes final testing.</p>
      </div></section>

      <section className="faq shell" id="faq">
        <div className="faq-heading"><p className="section-kicker">FREQUENTLY ASKED QUESTIONS</p><h2>Clear answers before you start.</h2></div>
        <div className="faq-list">{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}</div>
      </section>

      <section className="cta"><div className="shell"><p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p><h2>Knowledge grows<br/>when you share it.</h2><p>Build your first course or experience NorthstarLabs as a learner.</p><div><a className="button" href="/login">Start building free <span>↗</span></a><a className="text-link light" href="/courses">Explore free courses →</a></div></div></section>

      <footer className="footer shell"><div className="brand">✦ NORTHSTARLABS</div><p>One connected platform for practical learning businesses.</p><div className="footer-links"><a href="#platform">Platform</a><a href="/courses">Courses</a><a href="#product-tour">Product tour</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a><a href="/legal/terms">Terms</a><a href="/legal/privacy">Privacy</a></div><small>© 2026 Northstar Labs. All rights reserved.</small></footer>
    </main>
  );
}
