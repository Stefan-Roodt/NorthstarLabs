"use client";

import { useState } from "react";

const features = [
  { n: "01", title: "Build learning people finish", text: "Turn expertise into polished courses with flexible lessons, quizzes, certificates, live cohorts, and AI-assisted creation." },
  { n: "02", title: "Create a place they belong", text: "Bring courses, conversations, events, and member profiles together in one branded learning community." },
  { n: "03", title: "Grow without adding tools", text: "Sell globally with subscriptions, bundles, upsells, automated tax, and the insights to make every launch stronger." },
];

const plans = [
  { name: "Launch", price: 549, compareAt: 699, description: "For new creators publishing their first learning products.", features: ["5 published products", "100 active learners", "Courses, coaching, and downloads", "Quizzes and completion certificates", "Integrated checkout and coupons", "Community discussions", "Email support"] },
  { name: "Build", price: 1249, compareAt: 1580, description: "For growing businesses ready to sell a complete product suite.", features: ["10 published products", "1,000 active learners", "Courses, communities, and memberships", "Subscriptions and payment plans", "Bundles, upsells, and cart recovery", "Affiliate program", "Live support", "0% NorthstarLabs transaction fee"] },
  { name: "Grow", price: 2699, compareAt: 3420, description: "For established academies scaling revenue, reach, and teams.", popular: true, features: ["50 published products", "5,000 active learners", "Everything in Build", "Remove NorthstarLabs branding", "Advanced analytics and reporting", "Student imports and bulk actions", "5 admin seats with permissions", "Automated subtitles and translations", "Priority support"] },
  { name: "Scale", price: 5699, compareAt: 7215, description: "For high-volume education businesses needing more control.", features: ["100 published products", "10,000 active learners", "Everything in Grow", "Unlimited integrations", "Advanced roles and team workflows", "API and automation access", "Dedicated onboarding", "Priority success support", "Custom growth planning"] },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="#top" aria-label="NorthstarLabs home"><span className="brand-mark">✦</span> NORTHSTARLABS</a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Main navigation">
          <a href="#platform">Platform</a><a href="#solutions">Solutions</a><a href="#results">Customers</a><a href="#pricing">Pricing</a>
        </nav>
        <div className="nav-actions"><a className="login" href="/login">Log in</a><a className="button small" href="/login">Start free</a></div>
        <button className="menu" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation">{menuOpen ? "Close" : "Menu"}</button>
      </header>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Courses <span>•</span> Communities <span>•</span> Commerce</p>
          <h1>Turn what you know into <em>growth</em> that compounds.</h1>
          <p className="lede">NorthstarLabs gives creators and training teams everything they need to build learning, engage audiences, and grow revenue—in one beautifully simple platform.</p>
          <div className="hero-actions"><a className="button" href="/login">Start building free <span>↗</span></a><a className="text-link" href="#demo">Book a demo <span>→</span></a></div>
          <div className="micro-proof"><div className="faces"><i>A</i><i>M</i><i>J</i></div><p><strong>4.8/5</strong> from 600+ learning businesses</p></div>
        </div>

        <div className="product-stage" aria-label="NorthstarLabs product dashboard preview">
          <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
          <div className="dashboard">
            <aside><div className="dash-logo">✦</div><div className="side-line active"/><div className="side-line"/><div className="side-line short"/><div className="side-spacer"/><div className="avatar">NS</div></aside>
            <div className="dash-main">
              <div className="dash-head"><div><small>GOOD MORNING, MAYA</small><h3>Your business</h3></div><button>+ Create</button></div>
              <div className="metrics"><article><small>NET REVENUE</small><b>$84,290</b><span>↑ 18.4%</span></article><article><small>ACTIVE LEARNERS</small><b>12,840</b><span>↑ 9.2%</span></article><article><small>COMPLETION</small><b>87%</b><span>Top 10%</span></article></div>
              <div className="dash-grid"><article className="chart-card"><div className="card-head"><span>Revenue</span><small>Last 6 months</small></div><div className="chart"><div className="grid-lines"/><div className="bars"><i style={{height:"31%"}}/><i style={{height:"47%"}}/><i style={{height:"42%"}}/><i style={{height:"64%"}}/><i style={{height:"58%"}}/><i style={{height:"86%"}}/></div></div><div className="months"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div></article>
              <article className="activity"><div className="card-head"><span>Live activity</span><b>•••</b></div><div className="person"><i>KL</i><p><b>Kai enrolled</b><small>Brand Strategy Lab</small></p><time>Now</time></div><div className="person"><i>AM</i><p><b>Ana completed</b><small>Leadership Essentials</small></p><time>4m</time></div><div className="person"><i>DR</i><p><b>Dev purchased</b><small>Community Pro</small></p><time>12m</time></div></article></div>
            </div>
          </div>
          <div className="float-card"><span>THIS WEEK</span><strong>+1,248</strong><small>new enrollments</small></div>
        </div>
      </section>

      <section className="proof-strip" id="results"><div className="shell stats"><div><strong>32k+</strong><span>learning businesses</span></div><div><strong>$1.4B</strong><span>creator revenue earned</span></div><div><strong>96M</strong><span>learners reached</span></div><div><strong>190</strong><span>countries worldwide</span></div></div></section>

      <section className="logos shell" aria-label="Trusted customers"><p>Trusted by ambitious educators and teams at</p><div><span>FIELDWORK</span><span>SONAR</span><span>ARCSTONE</span><span>MONUMENT</span><span>CANOPY</span></div></section>

      <section className="platform shell" id="platform"><p className="section-kicker">ONE PLATFORM. EVERY POSSIBILITY.</p><div className="section-title"><h2>Build the learning business you’ve imagined.</h2><p>From your first lesson to your millionth learner, NorthstarLabs makes every step feel clear, connected, and ready to scale.</p></div><div className="feature-grid">{features.map((f) => <article key={f.n}><span>{f.n}</span><div className="feature-icon">{f.n === "01" ? "◫" : f.n === "02" ? "◎" : "↗"}</div><h3>{f.title}</h3><p>{f.text}</p><a href="#">Explore <b>→</b></a></article>)}</div></section>

      <section className="story" id="solutions"><div className="shell story-grid"><div className="story-copy"><p className="section-kicker">MADE FOR MOMENTUM</p><h2>One home for your knowledge—and your next chapter.</h2><p>Launch a signature course. Train every customer. Build a global academy. NorthstarLabs adapts to the business you have and the one you’re building.</p><ul><li><span>✓</span> Your brand, front and center</li><li><span>✓</span> AI that speeds up the work, not the thinking</li><li><span>✓</span> Payments, tax, and reporting built in</li></ul><a className="button dark" href="#demo">See NorthstarLabs in action</a></div><div className="course-card"><div className="course-visual"><span>STUDIO / 04</span><div className="sun"/><h4>Ideas into<br/>impact.</h4></div><div className="course-meta"><div><small>FEATURED PROGRAM</small><b>The Creative Systems Lab</b></div><span>12 lessons<br/>6 weeks</span></div><div className="progress"><i/><span>72% complete</span></div></div></div></section>

      <section className="testimonial shell"><blockquote>“NorthstarLabs gave us the confidence to stop stitching tools together and start thinking bigger. We doubled enrollment in six months—and our learners are more engaged than ever.”</blockquote><div className="quote-person"><span>AL</span><p><strong>Avery Lin</strong><small>Founder, Fieldwork Academy</small></p><b>2× enrollment</b></div></section>

      <section className="pricing" id="pricing"><div className="shell">
        <p className="section-kicker">PRICING BUILT FOR MOMENTUM</p>
        <div className="pricing-head"><h2>Everything you need.<br/>21% less.</h2><div><p>Start with the plan that fits today. Upgrade as your products, audience, and team grow.</p><span>All prices in ZAR · billed monthly through PayFast</span></div></div>
        <div className="momentum-kit"><div><span>FREE WITH EVERY PLAN</span><h3>The NorthstarLabs Momentum Kit</h3><p>Launch checklist, pricing calculator, email templates, weekly momentum score, milestone celebrations, and our guided 7-day launch sprint if you haven’t published within 30 days.</p></div><strong>R3,499<br/><small>included value</small></strong></div>
        <div className="pricing-grid">{plans.map((plan) => <article className={plan.popular ? "price-card popular" : "price-card"} key={plan.name}>
          {plan.popular && <b className="popular-label">MOST POPULAR</b>}<p className="plan-name">{plan.name}</p><p className="plan-description">{plan.description}</p>
          <div className="plan-price"><span>R{plan.price.toLocaleString("en-ZA")}</span><small>/ month</small></div><p className="compare-price"><s>R{plan.compareAt.toLocaleString("en-ZA")}</s> comparable platform price</p>
          <a className="button" href="/login">Start free <span>→</span></a><ul><li className="kit-feature"><span>✦</span>Momentum Kit included</li>{plan.features.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}</ul>
        </article>)}</div>
        <p className="pricing-note">NorthstarLabs plan prices are 21% below the comparable current monthly plan prices used for this benchmark. Payment-processing charges may still apply.</p>
      </div></section>

      <section className="cta"><div className="shell"><p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p><h2>Knowledge grows<br/>when you share it.</h2><p>Build your first course free. Upgrade when you’re ready.</p><div><a className="button" href="/login">Start building free <span>↗</span></a><a className="text-link light" href="#demo">Talk to our team →</a></div></div></section>

      <footer className="footer shell" id="demo"><div className="brand">✦ NORTHSTARLABS</div><p>The all-in-one platform for learning businesses.</p><div className="footer-links"><a href="#platform">Platform</a><a href="#solutions">Solutions</a><a href="#results">Customers</a><a href="#pricing">Pricing</a></div><small>© 2026 Northstar Labs. All rights reserved.</small></footer>
    </main>
  );
}
