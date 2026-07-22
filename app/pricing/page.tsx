import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Start learning, coaching, or building an academy on NorthstarLabs. See the free options and planned academy tiers clearly.",
  alternates: { canonical: "/pricing" },
};

const academyPlans = [
  { name: "Launch", price: "R549", for: "Your first learning products", includes: "Courses, protected video, quizzes, certificates, progress, and community" },
  { name: "Build", price: "R1,249", for: "A growing academy", includes: "Multiple products, learner administration, moderation, and priority support" },
  { name: "Grow", price: "R2,699", for: "An established learning business", includes: "Analytics, performance reporting, exports, and deeper operational support" },
  { name: "Scale", price: "R5,699", for: "High-volume delivery", includes: "Higher capacity, advanced administration, and launch planning support" },
];

export default function PricingPage() {
  return <main className="compact-pricing">
    <header className="compact-pricing-nav">
      <Link href="/">← NorthstarLabs</Link>
      <b>Clear pricing</b>
      <Link href="/login?mode=login">Sign in</Link>
    </header>

    <section className="compact-pricing-hero">
      <div><p className="sys-kicker">START WITHOUT RISK</p><h1>Choose the value. Pay only when it earns its place.</h1></div>
      <p>Learning and coach discovery are free. Coaches can publish a standard profile free. Academy paid plans open after live billing completes final activation and testing.</p>
    </section>

    <section className="compact-pricing-entry" aria-label="Ways to join NorthstarLabs">
      <article><span>LEARNER</span><strong>R0</strong><h2>Learn and find help</h2><p>Browse courses, create an account, track progress, and search for a coach without paying NorthstarLabs.</p><Link href="/courses">Browse courses →</Link></article>
      <article><span>COACH</span><strong>R0</strong><h2>Publish your expertise</h2><p>Create a standard profile, choose your topics, set your own rate, and receive relevant enquiries.</p><Link href="/login?mode=signup&role=coach&next=%2Fwelcome%3Fpath%3Dcoach">Create a coach profile →</Link></article>
      <article className="verified"><span>VERIFIED COACH</span><strong>R200<small>/month</small></strong><h2>Earn stronger exposure</h2><p>Apply for credential review, a visible verification status, and enhanced marketplace placement. Verification is reviewed, not bought.</p><Link href="/login?mode=signup&role=coach&next=%2Fwelcome%3Fpath%3Dcoach">Start as a coach →</Link></article>
    </section>

    <section className="compact-pricing-academy">
      <header><div><p className="sys-kicker">FOR ACADEMIES</p><h2>Build free. Upgrade when you need more operating room.</h2></div><Link href="/login?mode=signup&role=creator&next=%2Fwelcome%3Fpath%3Dcreator">Open my free workspace →</Link></header>
      <div>{academyPlans.map((plan) => <article key={plan.name}><span>{plan.name}</span><strong>{plan.price}<small>/month</small></strong><h3>{plan.for}</h3><p>{plan.includes}</p></article>)}</div>
      <small>Paid academy upgrades remain unavailable until PayFast live billing completes activation and a verified transaction test.</small>
    </section>

    <footer className="compact-pricing-footer"><Link href="/">✦ NORTHSTARLABS</Link><nav><Link href="/about">What Northstar does</Link><Link href="/courses">Courses</Link><Link href="/tutors">Coaches</Link></nav></footer>
  </main>;
}
