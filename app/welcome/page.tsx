"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "../../lib/supabase-client";

export default function WelcomePage() {
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const supabase = getSupabaseBrowser();
  const preferredPath = typeof window === "undefined"
    ? ""
    : new URLSearchParams(location.search).get("path") || "";
  const focusedPath = preferredPath === "creator" || preferredPath === "learner" || preferredPath === "coach" ? preferredPath : "";

  useEffect(() => {
    if (!supabase) {
      location.href = "/login?next=/welcome";
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        location.href = "/login?next=/welcome";
        return;
      }
      const email = data.session.user.email || "";
      const displayName = String(data.session.user.user_metadata?.full_name || email.split("@")[0] || "there");
      setName(displayName.split(" ")[0]);
      setSchoolName(`${displayName}'s Academy`);
      const response = await fetch("/api/profile", {
        headers: { authorization: `Bearer ${data.session.access_token}` },
      });
      if (response.ok) {
        const profile = await response.json() as {
          displayName?: string;
          onboardingCompleted?: boolean;
          onboardingPath?: string | null;
          hasCreatorSchool?: boolean;
        };
        if (profile.displayName) {
          setName(profile.displayName.split(" ")[0]);
          setSchoolName(`${profile.displayName}'s Academy`);
        }
        if (profile.onboardingCompleted) {
          location.href = preferredPath === "coach" || profile.onboardingPath === "coach"
            ? "/dashboard/tutors?setup=1"
            : profile.hasCreatorSchool ? "/dashboard" : "/courses";
          return;
        }
        if (
          (preferredPath === "creator" || preferredPath === "learner" || preferredPath === "coach") &&
          profile.onboardingPath !== preferredPath
        ) {
          await fetch("/api/profile", {
            method: "PATCH",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${data.session.access_token}`,
            },
            body: JSON.stringify({ onboardingPath: preferredPath }),
          });
        }
      }
      setReady(true);
    });
  }, [preferredPath, supabase]);

  async function choosePath(role: "creator" | "learner" | "coach") {
    if (!supabase || busy) return;
    setBusy(role);
    setMessage("");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      location.href = `/login?next=${encodeURIComponent(`/welcome?path=${role}`)}`;
      return;
    }
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        role,
        schoolName: role === "creator" || role === "coach" ? schoolName : undefined,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "We could not finish setting up your account.");
      setBusy("");
      return;
    }
    location.href = role === "coach" ? "/dashboard/tutors?setup=1" : role === "creator" ? "/dashboard" : "/courses";
  }

  if (!ready) return (
    <main className="system-loading">
      <div><b>✦ NORTHSTARLABS</b><p>Preparing your starting point…</p></div>
    </main>
  );

  return (
    <main className="welcome-page">
      <header>
        <Link className="system-brand" href="/">✦ NORTHSTARLABS</Link>
        <a href="/account">Account settings</a>
      </header>

      <section className="welcome-hero">
        <p className="sys-kicker">YOUR ACCOUNT IS READY</p>
        <h1>{focusedPath === "creator" ? `Welcome, ${name}. Create your academy.` : focusedPath === "learner" ? `Welcome, ${name}. Choose a module.` : focusedPath === "coach" ? `Welcome, ${name}. Set up your coaching.` : `Welcome, ${name}. What do you want to do first?`}</h1>
        <p>{focusedPath ? "You have already chosen your route. Finish this one simple step; you can add the other roles later from your account." : "Choose one path now. Your account includes creating, coaching, and learning, so you can switch whenever you like."}</p>
      </section>

      <section className={`welcome-paths${focusedPath ? ` focused-${focusedPath}` : ""}`} aria-label="Choose how to start">
        <article className={preferredPath === "creator" ? "welcome-path preferred" : "welcome-path"}>
          <div className="welcome-path-number">01</div>
          <p className="sys-kicker">I WANT TO CREATE</p>
          <h2>Create my academy and first module.</h2>
          <p>Name your academy now. Next you will create a module and shape its syllabus; you are not enrolling as a learner.</p>
          <ul>
            <li>Create your own separate academy</li>
            <li>Add text, video, and quizzes</li>
            <li>Keep your courses and learners together</li>
          </ul>
          <label className="welcome-school-field">
            Name your academy
            <input
              required
              minLength={2}
              maxLength={80}
              value={schoolName}
              onChange={(event) => setSchoolName(event.target.value)}
            />
          </label>
          <button
            className="sys-primary"
            disabled={busy !== "" || schoolName.trim().length < 2}
            onClick={() => choosePath("creator")}
          >
            {busy === "creator" ? "Creating your academy…" : "Create my academy →"}
          </button>
          <Link className="welcome-secondary" href="/courses/launch-your-first-online-course">See how a strong course is structured</Link>
        </article>

        <article className={preferredPath === "learner" ? "welcome-path preferred" : "welcome-path"}>
          <div className="welcome-path-number">02</div>
          <p className="sys-kicker">I WANT TO LEARN</p>
          <h2>Start a practical free course.</h2>
          <p>Choose a focused NorthstarLabs Original, enrol free, and keep your lessons, progress, and certificate together.</p>
          <ul>
            <li>Six practical free courses</li>
            <li>Short, action-focused lessons</li>
            <li>Progress saved automatically</li>
          </ul>
          <button
            className="sys-primary"
            disabled={busy !== ""}
            onClick={() => choosePath("learner")}
          >
            {busy === "learner" ? "Preparing your learning space…" : "Choose my first course →"}
          </button>
          <Link className="welcome-secondary" href="/learn">Open my learning space</Link>
        </article>

        <article className={preferredPath === "coach" ? "welcome-path preferred" : "welcome-path"}>
          <div className="welcome-path-number">03</div>
          <p className="sys-kicker">I WANT TO COACH</p>
          <h2>Advertise my coaching.</h2>
          <p>Create a searchable professional profile, choose your visibility plan, set your own hourly rate, and offer times learners can request.</p>
          <ul>
            <li>Appear in topic-based learner searches</li>
            <li>Set your own hourly rate and availability</li>
            <li>Receive protected enquiries and booking requests</li>
          </ul>
          <label className="welcome-school-field">
            Practice or academy name
            <input
              required
              minLength={2}
              maxLength={80}
              value={schoolName}
              onChange={(event) => setSchoolName(event.target.value)}
            />
          </label>
          <button
            className="sys-primary"
            disabled={busy !== "" || schoolName.trim().length < 2}
            onClick={() => choosePath("coach")}
          >
            {busy === "coach" ? "Preparing your coach profile…" : "Set up my coach profile →"}
          </button>
          <Link className="welcome-secondary" href="/tutors">See how learners find coaches</Link>
        </article>
      </section>

      {message && <div className="welcome-message" role="status">{message}</div>}

      <section className="welcome-help">
        <p><b>Not sure yet?</b> Start with the free “Launch Your First Online Course” learning experience. It shows you the learner view while helping you plan something of your own.</p>
        <Link href="/courses/launch-your-first-online-course">Explore the recommended first course →</Link>
      </section>
    </main>
  );
}
