"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-client";

export default function WelcomePage() {
  const [name, setName] = useState("");
  const [ready, setReady] = useState(false);
  const supabase = getSupabaseBrowser();
  const preferredPath = typeof window === "undefined"
    ? ""
    : new URLSearchParams(location.search).get("path") || "";

  useEffect(() => {
    if (!supabase) {
      location.href = "/login?next=/welcome";
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        location.href = "/login?next=/welcome";
        return;
      }
      const email = data.session.user.email || "";
      const displayName = String(data.session.user.user_metadata?.full_name || email.split("@")[0] || "there");
      setName(displayName.split(" ")[0]);
      setReady(true);
    });
  }, [supabase]);

  if (!ready) return (
    <main className="system-loading">
      <div><b>✦ NORTHSTARLABS</b><p>Preparing your starting point…</p></div>
    </main>
  );

  return (
    <main className="welcome-page">
      <header>
        <a className="system-brand" href="/">✦ NORTHSTARLABS</a>
        <a href="/account">Account settings</a>
      </header>

      <section className="welcome-hero">
        <p className="sys-kicker">YOUR ACCOUNT IS READY</p>
        <h1>Welcome, {name}. What do you want to do first?</h1>
        <p>Choose one path now. Your account includes both, and you can switch whenever you like.</p>
      </section>

      <section className="welcome-paths" aria-label="Choose how to start">
        <article className={preferredPath === "creator" ? "welcome-path preferred" : "welcome-path"}>
          <div className="welcome-path-number">01</div>
          <p className="sys-kicker">I WANT TO CREATE</p>
          <h2>Build my first course.</h2>
          <p>Open your creator workspace, name your course, and start shaping the curriculum. Your first draft can begin with a single idea.</p>
          <ul>
            <li>Create a course draft</li>
            <li>Add text, video, and quizzes</li>
            <li>Publish when you are ready</li>
          </ul>
          <a className="sys-primary" href="/dashboard">Open my creator workspace →</a>
          <a className="welcome-secondary" href="/courses/launch-your-first-online-course">See how a strong course is structured</a>
        </article>

        <article className={preferredPath === "learner" ? "welcome-path preferred" : "welcome-path"}>
          <div className="welcome-path-number">02</div>
          <p className="sys-kicker">I WANT TO LEARN</p>
          <h2>Start a practical free course.</h2>
          <p>Choose a focused NorthstarLabs Original, enrol free, and keep your lessons, progress, and certificate together.</p>
          <ul>
            <li>Three practical starter courses</li>
            <li>Short, action-focused lessons</li>
            <li>Progress saved automatically</li>
          </ul>
          <a className="sys-primary" href="/courses">Choose my first course →</a>
          <a className="welcome-secondary" href="/learn">Open my learning space</a>
        </article>
      </section>

      <section className="welcome-help">
        <p><b>Not sure yet?</b> Start with the free “Launch Your First Online Course” learning experience. It shows you the learner view while helping you plan something of your own.</p>
        <a href="/courses/launch-your-first-online-course">Explore the recommended first course →</a>
      </section>
    </main>
  );
}
