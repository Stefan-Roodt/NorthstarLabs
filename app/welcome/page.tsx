"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "../../lib/supabase-client";

export default function WelcomePage() {
  const [name, setName] = useState("");
  const [academyName, setAcademyName] = useState("");
  const [coachName, setCoachName] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const supabase = getSupabaseBrowser();
  const searchParams = useSearchParams();
  const preferredPath = searchParams.get("path") || "";
  const focusedPath = preferredPath === "creator" || preferredPath === "learner" || preferredPath === "coach" ? preferredPath : "";
  const welcomeDestination = focusedPath ? `/welcome?path=${focusedPath}` : "/welcome";

  useEffect(() => {
    if (!supabase) {
      location.replace(`/login?mode=signup&next=${encodeURIComponent(welcomeDestination)}`);
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        location.replace(`/login?mode=signup&next=${encodeURIComponent(welcomeDestination)}`);
        return;
      }
      const email = data.session.user.email || "";
      const displayName = String(data.session.user.user_metadata?.full_name || email.split("@")[0] || "there");
      setName(displayName.split(" ")[0]);
      setAcademyName(`${displayName}'s Academy`);
      setCoachName(`${displayName} Coaching`);
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
          setAcademyName(`${profile.displayName}'s Academy`);
          setCoachName(`${profile.displayName} Coaching`);
        }
        if (profile.onboardingCompleted && focusedPath === "learner") {
          location.replace("/courses?welcome=1");
          return;
        }
        if (profile.onboardingCompleted && focusedPath === "creator" && profile.hasCreatorSchool) {
          location.replace("/dashboard?welcome=creator&area=courses");
          return;
        }
      if (profile.onboardingCompleted && focusedPath === "coach" && profile.onboardingPath === "coach" && profile.hasCreatorSchool) {
        location.replace("/dashboard/tutors?setup=1");
        return;
      }
        if (profile.onboardingCompleted && !focusedPath) {
          location.replace(profile.onboardingPath === "coach"
            ? "/dashboard/tutors?setup=1"
            : profile.hasCreatorSchool ? "/dashboard" : "/courses");
          return;
        }
        if (focusedPath === "learner") {
          const learnerResponse = await fetch("/api/profile", {
            method: "PATCH",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${data.session.access_token}`,
            },
            body: JSON.stringify({ role: "learner" }),
          });
          if (!learnerResponse.ok) {
            const result = await learnerResponse.json() as { error?: string };
            setMessage(result.error || "We could not prepare your learning space.");
            setReady(true);
            return;
          }
          location.replace("/courses?welcome=1");
          return;
        }
        if (focusedPath && profile.onboardingPath !== focusedPath) {
          await fetch("/api/profile", {
            method: "PATCH",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${data.session.access_token}`,
            },
            body: JSON.stringify({ onboardingPath: focusedPath }),
          });
        }
      }
      setReady(true);
    });
  }, [focusedPath, supabase, welcomeDestination]);

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
          schoolName: role === "creator"
            ? academyName || `${name}'s Academy`
            : role === "coach"
              ? coachName || `${name} Coaching`
              : undefined,
        }),
      });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "We could not finish setting up your account.");
      setBusy("");
      return;
    }
    location.replace(role === "coach" ? "/dashboard/tutors?setup=1" : role === "creator" ? "/dashboard?welcome=creator&area=courses" : "/courses?welcome=1");
  }

  async function signOut() {
    await supabase?.auth.signOut();
    location.href = "/";
  }

  if (!ready) return (
    <main className="system-loading">
      <div><b>{"\u2726"} NORTHSTARLABS</b><p>Preparing your starting point...</p></div>
    </main>
  );

  return (
    <main className="welcome-page">
      <header>
        <Link className="system-brand" href="/">{"\u2726"} NORTHSTARLABS</Link>
        <button onClick={signOut}>Sign out</button>
      </header>

      <section className="welcome-hero">
        <p className="sys-kicker">YOUR ACCOUNT IS READY</p>
        <h1>{focusedPath === "creator" ? `One detail, ${name}. Then your academy is ready.` : focusedPath === "learner" ? `Welcome, ${name}. Your courses are ready.` : focusedPath === "coach" ? `One detail, ${name}. Then build your coach profile.` : `Welcome, ${name}. What do you want to do first?`}</h1>
        <p>{focusedPath === "creator" ? "Name the academy your learners will recognise. We will create its private workspace and take you straight there." : focusedPath === "coach" ? "Confirm the professional name learners will see. Your profile stays private until you decide it is ready." : focusedPath ? "Your learning space is being prepared now. No second role decision is required." : "Choose one path now. Your account includes creating, coaching, and learning, so you can switch whenever you like."}</p>
      </section>

      <section className={`welcome-paths${focusedPath ? ` focused-${focusedPath}` : ""}`} aria-label="Choose how to start">
        <article className={preferredPath === "creator" ? "welcome-path preferred" : "welcome-path"}>
          <div className="welcome-path-number">01</div>
          <p className="sys-kicker">FINAL STEP {"\u00B7"} ACADEMY</p>
          <h2>Name your academy.</h2>
          <p>We will create the private workspace where you build courses, manage learners, run live sessions, and grow your community.</p>
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
            value={academyName}
            onChange={(event) => setAcademyName(event.target.value)}
            />
          </label>
          <button
            className="sys-primary"
            disabled={busy !== "" || academyName.trim().length < 2}
            onClick={() => choosePath("creator")}
          >
            {busy === "creator" ? "Creating your academy..." : "Create my academy " + "\u2192"}
          </button>
          <Link className="welcome-secondary" href="/courses/northstar-ai-command-studio/preview">Preview a finished NorthstarLabs lesson</Link>
        </article>

        <article className={preferredPath === "learner" ? "welcome-path preferred" : "welcome-path"}>
          <div className="welcome-path-number">02</div>
          <p className="sys-kicker">I WANT TO LEARN</p>
          <h2>Start a practical free course.</h2>
          <p>Choose a focused NorthstarLabs Original, enrol free, and keep your lessons, progress, and certificate together.</p>
          <ul>
            <li>Three substantive signature courses</li>
            <li>Short, action-focused lessons</li>
            <li>Progress saved automatically</li>
          </ul>
          <button
            className="sys-primary"
            disabled={busy !== ""}
            onClick={() => choosePath("learner")}
          >
            {busy === "learner" ? "Preparing your learning space..." : "Choose my first course " + "\u2192"}
          </button>
          <Link className="welcome-secondary" href="/courses">Browse all courses</Link>
        </article>

        <article className={preferredPath === "coach" ? "welcome-path preferred" : "welcome-path"}>
          <div className="welcome-path-number">03</div>
          <p className="sys-kicker">FINAL STEP {"\u00B7"} COACHING</p>
          <h2>Name your coaching practice.</h2>
          <p>We will open your private coach desk. Add your expertise, rate, and availability there; nothing is advertised until you publish it.</p>
          <ul>
            <li>Appear in topic-based learner searches</li>
            <li>Set your own hourly rate and availability</li>
            <li>Receive protected enquiries and booking requests</li>
          </ul>
          <label className="welcome-school-field">
            Professional practice name
            <input
              required
              minLength={2}
              maxLength={80}
            value={coachName}
            onChange={(event) => setCoachName(event.target.value)}
            />
          </label>
          <button
            className="sys-primary"
            disabled={busy !== "" || coachName.trim().length < 2}
            onClick={() => choosePath("coach")}
          >
            {busy === "coach" ? "Preparing your coach profile..." : "Set up my coach profile " + "\u2192"}
          </button>
          <Link className="welcome-secondary" href="/tutors">See how learners find coaches</Link>
        </article>
      </section>

      {message && <div className="welcome-message" role="status">{message}</div>}

      <section className="welcome-help">
        <p><b>Not sure yet?</b> Preview a real lesson from our AI Command Studio. You can see the learner experience without creating another account or changing your route.</p>
        <Link href="/courses/northstar-ai-command-studio/preview">Preview a real lesson {"\u2192"}</Link>
      </section>
    </main>
  );
}
