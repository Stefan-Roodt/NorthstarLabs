"use client";

import { useState } from "react";
import Link from "next/link";
import { LearningRequestForm } from "./learning-request-form";

const creatorSignupHref = "/login?mode=signup&role=creator&next=%2Fwelcome%3Fpath%3Dcreator";
const coachSignupHref = "/login?mode=signup&role=coach&next=%2Fwelcome%3Fpath%3Dcoach";
const learnerPortfolioSignupHref = "/login?mode=signup&role=learner&next=%2Fportfolio";
const homeSearchPaths = [
  { slug: "online-courses-south-africa", title: "Online courses in South Africa", description: "Choose practical courses by outcome, effort, evidence, and available human support." },
  { slug: "find-business-coach-south-africa", title: "Find a business coach", description: "Compare topic fit, rates, credentials, availability, and verified-session proof." },
  { slug: "bitcoin-web3-courses", title: "Bitcoin and Web3 courses", description: "Learn from first principles without price hype or invented certainty." },
  { slug: "become-a-coach", title: "Become a Northstar coach", description: "Make your expertise searchable, set your rate, and receive protected enquiries." },
  { slug: "create-and-sell-online-course", title: "Create and sell an online course", description: "Turn expertise into a structured learning product people can finish." },
  { slug: "corporate-training-platform", title: "Corporate training platform", description: "Connect branded learning, live support, administration, and useful reporting." },
];

const platformFlow = [
  {
    n: "01",
    label: "START WITH THE GOAL",
    title: "Tell Northstar what you need to achieve.",
    text: "Describe the result, your starting point, and how you prefer to learn. You do not need to know which product to choose.",
    href: "/find",
    link: "Use the Northstar Navigator",
  },
  {
    n: "02",
    label: "GET A CREDIBLE ROUTE",
    title: "See the right course, coach, or combination.",
    text: "Compare the learning promise, expertise, verified proof, price, and availability. If nothing fits, Northstar says so.",
    href: "/courses",
    link: "Explore real courses",
  },
  {
    n: "03",
    label: "LEARN, THEN ASK",
    title: "Use human help where it changes the outcome.",
    text: "Follow structured lessons, then bring the exact roadblock to a coach, live session, or community without losing the context.",
    href: "/tutors",
    link: "Find a relevant coach",
  },
  {
    n: "04",
    label: "MAKE PROGRESS VISIBLE",
    title: "Leave with evidence—not just videos watched.",
    text: "Keep projects, assessments, feedback, milestones, ratings, and certificates connected to the result you came to achieve.",
    href: "/login?mode=signup&next=%2Fwelcome",
    link: "Create my free account",
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
        <a className="brand" href="#top" aria-label="NorthstarLabs home">
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span><span className="brand-wordmark">NORTHSTARLABS</span><small>Learn. Ask. Progress.</small></span>
        </a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Main navigation">
          <Link className="nav-route" href="/courses"><small>LEARN</small><b>Browse courses</b></Link>
          <Link className="nav-route" href="/tutors"><small>GET UNSTUCK</small><b>Find a coach</b></Link>
          <a className="nav-route" href={creatorSignupHref}><small>TEACH</small><b>Build an academy</b></a>
          <a className="nav-how" href="#value">Why Northstar?</a>
        </nav>
        <div className="nav-actions"><a className="login" href="/login?mode=login">Sign in</a><Link className="button small" href="/find">Explore academies <span>→</span></Link></div>
        <button className="menu" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation">{menuOpen ? "Close" : "Menu"}</button>
      </header>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow">For creators <span>•</span> Coaches <span>•</span> Learners</p>
          <h1>Where courses, coaching, and community become <em>real progress.</em></h1>
          <p className="lede">Build and deliver structured learning—or find the course and human support that helps you move forward. NorthstarLabs keeps content, live sessions, community, and progress connected.</p>
          <div className="hero-actions"><Link className="button" href="/find">I want to learn <span>→</span></Link><a className="text-link" href={creatorSignupHref}>I want to create modules <span>→</span></a></div>
          <ul className="hero-benefits" aria-label="Free account benefits">
            <li><span>✓</span> No credit card</li>
            <li><span>✓</span> A guided starting point</li>
            <li><span>✓</span> Creator, coach, and learner paths</li>
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

      <section className="audience-switch shell" id="choose-your-path" aria-labelledby="audience-switch-title">
        <div className="audience-switch-heading">
          <p className="section-kicker">START WITH WHAT YOU CAME TO DO</p>
          <h2 id="audience-switch-title">One account. Three clear doors.</h2>
        </div>
        <a href={creatorSignupHref}>
          <span>01 / CREATE</span>
          <h3>Build an academy</h3>
          <p>Turn expertise into courses, programmes, community, and a branded learner experience.</p>
          <b>Start creating free →</b>
        </a>
        <Link href="/courses">
          <span>02 / LEARN</span>
          <h3>Start a course</h3>
          <p>Try practical learning now, save your progress, and add human support when you need it.</p>
          <b>Browse free courses →</b>
        </Link>
        <a href={coachSignupHref}>
          <span>03 / COACH</span>
          <h3>Offer one-to-one help</h3>
          <p>Publish your expertise, set your own hourly rate, and let learners find you by topic.</p>
          <b>Create my coach profile →</b>
        </a>
      </section>

      <section className="proof-strip" id="results"><div className="shell stats">
        <div><strong>Free</strong><span>courses and accounts to begin</span></div>
        <div><strong>Human</strong><span>coaching with visible rates</span></div>
        <div><strong>Connected</strong><span>content, community, and live learning</span></div>
        <div><strong>Visible</strong><span>progress, certificates, and ratings</span></div>
      </div></section>

      <section className="home-tutor-discovery shell">
        <div>
          <p className="section-kicker">THE NORTHSTAR DIFFERENCE</p>
          <h2>A course gives you the path. A coach helps with the roadblock.</h2>
        </div>
        <div className="home-tutor-proof">
          <p>Move naturally from self-paced learning to one-to-one help without losing the context of what you are trying to achieve.</p>
          <ul>
            <li>Search by the topic you need</li>
            <li>Compare rates, credentials, and availability</li>
            <li>Use two-way ratings after a completed session</li>
          </ul>
        </div>
        <div className="home-tutor-actions">
          <Link href="/tutors">Find the right coach <span>→</span></Link>
          <a href={coachSignupHref}>Become a Northstar coach <span>→</span></a>
        </div>
      </section>

      <section className="logos shell" aria-label="Who NorthstarLabs is designed for">
        <p>Designed for people who teach, guide, and enable others</p>
        <div><span>INDEPENDENT EDUCATORS</span><span>COACHES</span><span>TRAINING TEAMS</span><span>CUSTOMER ACADEMIES</span><span>MEMBERSHIP CREATORS</span></div>
      </section>

      <section className="value shell" id="value">
        <div className="value-heading">
          <p className="section-kicker">WHY NORTHSTAR</p>
          <h2>The learning platform that does not stop at the lesson.</h2>
          <p>A learner can begin with structured content, join a live session or community, and find a coach when the problem becomes personal. The creator keeps the whole journey—and the signals that improve it—in one place.</p>
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
          <div><p className="section-kicker">TRY BEFORE YOU TRUST</p><h3>Use a real course, search the coach marketplace, or open your own workspace. No sales call required.</h3></div>
          <Link className="button" href="/find">Find my next step <span>→</span></Link>
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
            <small>Free practical courses available now</small>
          </article>
          <article>
            <span>03</span>
            <p className="section-kicker">FOR COACHES</p>
            <h3>I want learners to find my expertise.</h3>
            <p>Create a public profile, choose your coaching tier, set your own hourly rate, and receive enquiries from people searching by topic.</p>
            <a className="button coach-button" href={coachSignupHref}>Create my coach profile →</a>
            <small>You control your rate and availability</small>
          </article>
        </div>
      </section>

      <section className="platform shell" id="platform">
        <div className="platform-plain">
          <p className="section-kicker">THE PRODUCT, IN PLAIN ENGLISH</p>
          <h2>One place to find what to learn, who can help, and what to do next.</h2>
          <div>
            <p><b>For learners</b> NorthstarLabs is a marketplace for useful courses and credible human expertise, organized around the result you want.</p>
            <p><b>For educators and coaches</b> it is the workspace to build, deliver, support, and improve that entire learning journey.</p>
          </div>
        </div>

        <div className="platform-demo" aria-label="Example NorthstarLabs learning route">
          <article className="platform-goal">
            <span>A LEARNER ARRIVES WITH A GOAL</span>
            <strong>“I need to understand Bitcoin well enough to brief my board.”</strong>
            <Link href="/find">Try it with my goal <b>→</b></Link>
          </article>
          <div className="platform-route">
            <header><span>NORTHSTAR ROUTE</span><b>The best next step—not the biggest sale.</b></header>
            <div>
              <article><small>01 · LEARN</small><b>Relevant course</b><span>Build the foundation</span></article>
              <i>→</i>
              <article><small>02 · ASK</small><b>Matched coach</b><span>Resolve the real roadblock</span></article>
              <i>→</i>
              <article><small>03 · PROGRESS</small><b>Useful evidence</b><span>Brief, project, or certificate</span></article>
            </div>
            <footer><span>Northstar keeps the goal, activity, support, feedback, and proof connected.</span><strong>LEARN. ASK. PROGRESS.</strong></footer>
          </div>
        </div>

        <div className="platform-flow">{platformFlow.map((step) => <article key={step.n}>
          <span>{step.n}</span>
          <p className="section-kicker">{step.label}</p>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
          <a href={step.href}>{step.link} <b>→</b></a>
        </article>)}</div>

        <div className="platform-creator">
          <div><p className="section-kicker">THE OTHER HALF OF THE PRODUCT</p><h3>Experts do not merely upload content. They run the learning business.</h3></div>
          <ul>
            <li><b>Build</b><span>Courses, programmes, protected video, quizzes, and projects</span></li>
            <li><b>Deliver</b><span>Storefronts, memberships, live sessions, community, and coaching</span></li>
            <li><b>Improve</b><span>Progress, learner support, reporting, unmet demand, and trusted feedback</span></li>
          </ul>
          <a className="button" href={creatorSignupHref}>Open my creator workspace <span>→</span></a>
        </div>
      </section>

      <section className="portfolio-advantage shell" aria-labelledby="portfolio-advantage-title">
        <div className="portfolio-advantage-copy">
          <p className="section-kicker">FREE FOR EVERY LEARNER</p>
          <h2 id="portfolio-advantage-title">A certificate says finished. Your portfolio shows capable.</h2>
          <p>Select verified certificates and passed assessments, add practical projects, and share one proof-of-learning page. You control every item and whether a score is visible.</p>
          <ul><li><b>Verified</b><span>Live academy certificate status</span></li><li><b>Recorded</b><span>Assessments actually passed</span></li><li><b>Submitted</b><span>Projects clearly labelled as your evidence</span></li></ul>
          <a className="button" href={learnerPortfolioSignupHref}>Build my free proof portfolio <span>→</span></a>
          <small>No public page until you publish · No email or private notes exposed</small>
        </div>
        <div className="portfolio-advantage-demo" aria-label="Example proof-of-learning portfolio">
          <header><span>SR</span><div><small>PROOF-OF-LEARNING PORTFOLIO</small><b>Evidence, not attendance.</b></div></header>
          <article className="verified"><span>✓</span><div><small>ACADEMY-VERIFIED</small><b>Bitcoin Intelligence</b><p>Certificate status active</p></div><strong>VERIFY →</strong></article>
          <article><span>%</span><div><small>NORTHSTAR-RECORDED</small><b>Scenario analysis</b><p>Assessment passed · score private</p></div><strong>PASSED</strong></article>
          <article><span>01</span><div><small>LEARNER-SUBMITTED</small><b>Board intelligence briefing</b><p>Research · risk analysis · communication</p></div><strong>OPEN ↗</strong></article>
          <footer><span>1 verified certificate · 1 assessment · 1 project</span><b>SHAREABLE</b></footer>
        </div>
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

      <section className="home-search-paths shell" aria-labelledby="home-search-paths-title">
        <header>
          <div><p className="section-kicker">POPULAR NORTHSTAR ROUTES</p><h2 id="home-search-paths-title">Start with the decision you are trying to make.</h2></div>
          <p>Use a practical guide to compare what good looks like, what NorthstarLabs offers now, and the most useful next action for your goal.</p>
        </header>
        <div className="home-search-grid">
          {homeSearchPaths.map((page, index) => <Link href={`/solutions/${page.slug}`} key={page.slug}>
            <span>{String(index + 1).padStart(2, "0")} / GUIDE</span>
            <h3>{page.title}</h3>
            <p>{page.description}</p>
            <strong>Explore this route →</strong>
          </Link>)}
        </div>
        <Link className="home-search-all" href="/solutions">See every NorthstarLabs solution →</Link>
      </section>

      <section className="northstar-promise shell" id="request-help">
        <div className="northstar-promise-copy">
          <p className="section-kicker">THE NORTHSTAR PROMISE</p>
          <h2>If we do not have what you need, tell us exactly what you are looking for.</h2>
          <p>We will check the current course catalogue and coach network, then do our best to find the right course, coach, or subject expert. If we cannot find a credible match, we will tell you honestly.</p>
          <div className="northstar-memory" aria-label="The NorthstarLabs learning approach">
            <span><b>Learn.</b> Get the path.</span>
            <span><b>Ask.</b> Find human help.</span>
            <span><b>Progress.</b> Keep moving.</span>
          </div>
        </div>
        <LearningRequestForm source="homepage" />
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

      <footer className="footer shell"><div className="brand"><span className="brand-mark" aria-hidden="true">✦</span><span className="brand-wordmark">NORTHSTARLABS</span></div><p>Courses for the path. Human coaching for the roadblocks.</p><div className="footer-links"><Link href="/about">About NorthstarLabs</Link><a href="#platform">How it works</a><Link href="/solutions">Solutions</Link><Link href="/courses">Courses</Link><Link href="/tutors">Coaches</Link><a href="#pricing">Pricing</a><a href="#faq">FAQ</a><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link></div><small>© 2026 Northstar Labs. All rights reserved.</small></footer>
    </main>
  );
}
