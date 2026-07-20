"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { LearningRequestForm } from "../learning-request-form";

type StartingPoint = "new" | "some" | "stuck";
type SupportPreference = "course" | "coach" | "blended" | "unsure";
type Pace = "week" | "month" | "exploring";

const startingPoints: Array<{ value: StartingPoint; title: string; text: string }> = [
  { value: "new", title: "Starting fresh", text: "I need the foundations and a clear route in." },
  { value: "some", title: "Building on experience", text: "I know some of it and want to move further." },
  { value: "stuck", title: "Stuck on something specific", text: "I need targeted help with a real roadblock." },
];

const supportOptions: Array<{ value: SupportPreference; title: string; text: string }> = [
  { value: "course", title: "Learn at my pace", text: "Give me structured lessons I can work through." },
  { value: "coach", title: "Talk to an expert", text: "I want personal feedback and a direct conversation." },
  { value: "blended", title: "Use both", text: "Give me the path and human help when I need it." },
  { value: "unsure", title: "Recommend it", text: "Use my goal to point me in the right direction." },
];

const paceLabels: Record<Pace, string> = {
  week: "I want to make progress this week",
  month: "I am working toward a result this month",
  exploring: "I am exploring before I commit",
};

export default function NorthstarNavigatorPage() {
  const [goal, setGoal] = useState("");
  const [startingPoint, setStartingPoint] = useState<StartingPoint>("new");
  const [support, setSupport] = useState<SupportPreference>("unsure");
  const [pace, setPace] = useState<Pace>("month");
  const [showResult, setShowResult] = useState(false);

  const encodedGoal = encodeURIComponent(goal.trim());
  const courseHref = `/courses?query=${encodedGoal}`;
  const coachHref = `/tutors?topic=${encodedGoal}`;
  const requestType = support === "course" ? "course" : support === "coach" ? "coach" : "either";
  const requestDetail = [
    `Starting point: ${startingPoints.find((item) => item.value === startingPoint)?.title}.`,
    `Preferred support: ${supportOptions.find((item) => item.value === support)?.title}.`,
    `Timing: ${paceLabels[pace]}.`,
    "Please help me find a credible next step for this goal.",
  ].join(" ");

  function findPath(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowResult(true);
    requestAnimationFrame(() => {
      document.getElementById("navigator-result")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return <main className="navigator-page">
    <header className="navigator-nav">
      <Link className="system-brand" href="/">✦ NORTHSTARLABS</Link>
      <nav><Link href="/courses">Courses</Link><Link href="/tutors">Coaches</Link><Link href="/about">Why Northstar?</Link><Link href="/login?mode=login">Sign in</Link></nav>
    </header>

    <section className="navigator-hero">
      <p className="sys-kicker">NORTHSTAR NAVIGATOR</p>
      <h1>Start with the result you want—not the product we want to sell.</h1>
      <p>Tell us where you want to go. We will give you a clear route into a relevant course, a human coach, or both. No account is required to see your next step.</p>
      <div><span>01 · Describe the goal</span><span>02 · Choose how you learn</span><span>03 · See the next step</span></div>
    </section>

    <form className="navigator-form" onSubmit={findPath}>
      <section>
        <div className="navigator-question"><span>01</span><div><p className="sys-kicker">YOUR OUTCOME</p><h2>What do you want to be able to do?</h2><p>Specific beats broad. Describe the result, problem, exam, project, or decision.</p></div></div>
        <label className="navigator-goal">
          <span>My goal</span>
          <textarea required minLength={3} maxLength={240} value={goal} onChange={(event) => { setGoal(event.target.value); setShowResult(false); }} placeholder="For example: understand Bitcoin well enough to explain its history, risks, and possible future to my board" />
          <small>{goal.length}/240</small>
        </label>
      </section>

      <section>
        <div className="navigator-question"><span>02</span><div><p className="sys-kicker">YOUR STARTING POINT</p><h2>Where are you now?</h2></div></div>
        <div className="navigator-options three">{startingPoints.map((item) => <label key={item.value} className={startingPoint === item.value ? "selected" : ""}>
          <input type="radio" name="starting-point" value={item.value} checked={startingPoint === item.value} onChange={() => { setStartingPoint(item.value); setShowResult(false); }} />
          <b>{item.title}</b><span>{item.text}</span>
        </label>)}</div>
      </section>

      <section>
        <div className="navigator-question"><span>03</span><div><p className="sys-kicker">THE RIGHT SUPPORT</p><h2>How would you prefer to make progress?</h2></div></div>
        <div className="navigator-options">{supportOptions.map((item) => <label key={item.value} className={support === item.value ? "selected" : ""}>
          <input type="radio" name="support" value={item.value} checked={support === item.value} onChange={() => { setSupport(item.value); setShowResult(false); }} />
          <b>{item.title}</b><span>{item.text}</span>
        </label>)}</div>
      </section>

      <section className="navigator-finish">
        <div>
          <label>When would this be useful?
            <select value={pace} onChange={(event) => { setPace(event.target.value as Pace); setShowResult(false); }}>
              <option value="week">{paceLabels.week}</option>
              <option value="month">{paceLabels.month}</option>
              <option value="exploring">{paceLabels.exploring}</option>
            </select>
          </label>
          <small>Your answers stay in this browser unless you choose to send NorthstarLabs a request.</small>
        </div>
        <button className="button" type="submit">Show my best next step <span>→</span></button>
      </section>
    </form>

    {showResult && <section className="navigator-result" id="navigator-result">
      <div className="navigator-result-heading">
        <p className="sys-kicker">YOUR NORTHSTAR ROUTE</p>
        <h2>Begin with a credible match. Add human help when it improves the outcome.</h2>
        <p>We use your goal to narrow the search. You can inspect the options before creating an account or contacting anyone.</p>
      </div>
      <div className="navigator-route">
        {(support === "course" || support === "blended" || support === "unsure") && <article>
          <span>1</span><p className="sys-kicker">STRUCTURE THE PATH</p><h3>Search courses for your exact goal.</h3><p>Compare the promise, lesson structure, creator, and expected result. Start only if the fit is useful.</p><Link href={courseHref}>Show relevant courses →</Link>
        </article>}
        {(support === "coach" || support === "blended" || support === "unsure" || startingPoint === "stuck") && <article>
          <span>{support === "coach" ? "1" : "2"}</span><p className="sys-kicker">GET PERSONAL HELP</p><h3>Find an expert for the roadblock.</h3><p>Compare topic fit, credentials, verified learner proof, availability, and self-set hourly rates.</p><Link href={coachHref}>Show relevant coaches →</Link>
        </article>}
        <article className="navigator-proof">
          <span>{support === "course" ? "2" : "3"}</span><p className="sys-kicker">KEEP THE PROGRESS</p><h3>Turn activity into evidence.</h3><p>Keep lessons, live sessions, coaching, completion, ratings, and certificates connected under one account.</p><Link href="/login?mode=signup&next=%2Fwelcome">Create my free account →</Link>
        </article>
      </div>
      <details className="navigator-fallback">
        <summary>No credible match? Ask NorthstarLabs to look further <span>+</span></summary>
        <div><p>We will check the current catalogue and coach network. If we cannot find something relevant, we will say so rather than force an unrelated result.</p>
          <LearningRequestForm
            key={`${goal}-${startingPoint}-${support}-${pace}`}
            defaultType={requestType}
            defaultTopic={goal}
            defaultDetail={requestDetail}
            source="northstar-navigator"
            compact
          />
        </div>
      </details>
    </section>}

    <footer className="navigator-footer"><Link className="system-brand" href="/">✦ NORTHSTARLABS</Link><p>Learn. Ask. Progress.</p><div><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link></div></footer>
  </main>;
}
