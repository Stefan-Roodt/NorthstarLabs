"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "../../lib/supabase-client";

type JoiningCourse = {
  title: string;
  lessonCount: number;
  assessmentCount?: number;
  schoolName?: string;
};

type OnboardingRole = "learner" | "coach" | "creator";

const roleDetails: Record<OnboardingRole, {
  label: string;
  title: string;
  description: string;
  destination: string;
}> = {
  learner: {
    label: "Learn",
    title: "Take a course",
    description: "Go straight to the course catalogue. Choose a course only when you see one you want.",
    destination: "Choose your first course",
  },
  coach: {
    label: "Coach",
    title: "Offer coaching",
    description: "Create a searchable profile, set your rate and publish your available times.",
    destination: "Set up your coach profile",
  },
  creator: {
    label: "Teach",
    title: "Build an academy",
    description: "Name your academy, enter its private workspace and start your first course draft.",
    destination: "Name your academy",
  },
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(
    () => searchParams.get("mode") === "login" ? "login" : "signup",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [joiningCourseDetail, setJoiningCourseDetail] = useState<JoiningCourse | null>(null);
  const supabase = getSupabaseBrowser();
  const requestedDestination = safeDestination(searchParams.get("next"));
  const roleParameter = accountRole(searchParams.get("role"));
  const directedRole = roleParameter || onboardingPathFrom(requestedDestination);
  const [joiningAs, setJoiningAs] = useState<OnboardingRole | "">(() => directedRole || "");
  // Local state is authoritative after the first render so changing a choice
  // cannot be undone by a stale query-string snapshot.
  const selectedRole = joiningAs;
  // A role describes the account; it must never discard the page the person was trying to reach.
  const destination = requestedDestination.startsWith("/welcome") && selectedRole ? `/welcome?path=${selectedRole}` : requestedDestination;
  const joiningCourse = destination.startsWith("/courses/");
  const activeRole: OnboardingRole | null = joiningCourse ? "learner" : selectedRole || null;
  const needsRoleChoice = mode === "signup" && !joiningCourse && !activeRole;
  const joiningCourseId = joiningCourse
    ? destination.split("?")[0].split("/").filter(Boolean)[1] || ""
    : "";
  const onboardingPath = onboardingPathFrom(destination);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) location.href = destination;
    });
  }, [destination, supabase]);

  useEffect(() => {
    if (!joiningCourseId) return;
    fetch(`/api/catalog/${encodeURIComponent(joiningCourseId)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Course unavailable.");
        return response.json() as Promise<JoiningCourse>;
      })
      .then(setJoiningCourseDetail)
      .catch(() => setJoiningCourseDetail(null));
  }, [joiningCourseId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (needsRoleChoice) {
      setMessage("Choose whether you want to learn, coach, or build an academy first.");
      return;
    }
    if (!supabase) {
      setMessage("Registration is temporarily unavailable. Please try again shortly.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: new URL(destination, location.origin).toString(),
            data: activeRole || onboardingPath ? { onboarding_path: activeRole || onboardingPath } : undefined,
          },
        });

        if (error) throw error;
        if (data.session) {
          location.href = destination;
          return;
        }
        setMessage(`Account created. Confirm the email we sent to ${email}, then we will take you straight to your next step.`);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        location.href = destination;
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Please try again.";
      setMessage(detail === "Invalid login credentials"
        ? "That email or password is incorrect. Please try again."
        : detail);
    } finally {
      setBusy(false);
    }
  }

  async function continueWithGoogle() {
    if (needsRoleChoice) {
      setMessage("Choose your starting route first. You can add the others later.");
      return;
    }
    if (!supabase) {
      setMessage("Google sign-in is temporarily unavailable. Please try again shortly.");
      return;
    }
    setBusy(true);
    setMessage("");
    sessionStorage.setItem("northstar:post-auth-destination", destination);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: new URL(destination, location.origin).toString() },
    });
    if (error) {
      setMessage(error.message);
      setBusy(false);
    }
  }

  function changeMode(nextMode: "login" | "signup") {
    setMode(nextMode);
    setMessage("");
    if (nextMode === "login" && !directedRole) setJoiningAs("");
    const rolePart = nextMode === "signup" && activeRole ? `&role=${activeRole}` : "";
    history.replaceState(null, "", `/login?mode=${nextMode}${rolePart}&next=${encodeURIComponent(destination)}`);
  }

  function chooseJoiningRole(role: OnboardingRole) {
    setJoiningAs(role);
    setMessage("");
    const returnTo = requestedDestination.startsWith("/welcome") ? `/welcome?path=${role}` : requestedDestination;
    history.replaceState(null, "", `/login?mode=${mode}&role=${role}&next=${encodeURIComponent(returnTo)}`);
  }

  function resetJoiningRole() {
    setJoiningAs("");
    setMessage("");
    history.replaceState(null, "", `/login?mode=signup&next=${encodeURIComponent("/welcome")}`);
  }

  return (
    <main className="auth-page auth-page-expanded">
      <Link className="system-brand" href="/">✦ NORTHSTARLABS</Link>
      <div className="auth-layout">
        <aside className="auth-promise">
          <p className="sys-kicker">{joiningCourse ? "YOUR COURSE IS READY" : activeRole === "creator" ? "CREATE YOUR ACADEMY" : activeRole === "coach" ? "SET UP YOUR COACH PROFILE" : activeRole === "learner" ? "START LEARNING" : "START FREE IN ABOUT 60 SECONDS"}</p>
          <h1>{joiningCourse ? "Join once. Start learning next." : activeRole === "creator" ? "Build under your own academy name." : activeRole === "coach" ? "Make your expertise easy to find." : activeRole === "learner" ? "Choose a course worth your time." : "Start where you mean to go."}</h1>
          <p>{joiningCourse
            ? "Create your free account and we will enrol you in the course automatically."
            : activeRole
              ? `One free account. Then ${roleDetails[activeRole].destination.toLowerCase()}—without another role questionnaire.`
              : "Choose one starting route. We will remember it through Google or email and take you to the right place."}</p>
          {joiningCourseDetail && <div className="auth-course-context">
            <span>YOU ARE JOINING</span>
            <b>{joiningCourseDetail.title}</b>
            <small>
              {joiningCourseDetail.schoolName || "NorthstarLabs"} · {joiningCourseDetail.lessonCount} lessons
              {joiningCourseDetail.assessmentCount ? ` · ${joiningCourseDetail.assessmentCount} assessments` : ""}
            </small>
          </div>}
          <ul>
            <li><span>01</span><div><b>Choose your starting route</b><small>Learn, coach, or build an academy. This is not a permanent limitation.</small></div></li>
            <li><span>02</span><div><b>Create one free account</b><small>Google is fastest. Email also works. No card or sales call.</small></div></li>
            <li><span>03</span><div><b>Arrive where the work begins</b><small>{activeRole ? roleDetails[activeRole].destination : "Courses, coach setup, or your academy workspace—never a generic dead end."}</small></div></li>
          </ul>
          <p className="auth-reassurance">Free starter access · No credit card · Switch paths anytime</p>
        </aside>

        <section className="auth-card">
          <Link className="auth-back" href="/">← Back to NorthstarLabs</Link>
          {needsRoleChoice ? <div className="auth-role-gateway">
            <p className="sys-kicker">CHOOSE YOUR FIRST DESTINATION</p>
            <h2>What do you want to do first?</h2>
            <p>One account can do all three later. This choice only removes irrelevant setup now.</p>
            <div className="auth-role-cards">
              {(Object.keys(roleDetails) as OnboardingRole[]).map((role, index) => <button type="button" key={role} onClick={() => chooseJoiningRole(role)}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><small>{roleDetails[role].label}</small><b>{roleDetails[role].title}</b><p>{roleDetails[role].description}</p></div>
                <strong>→</strong>
              </button>)}
            </div>
            <button className="auth-existing" type="button" onClick={() => changeMode("login")}>I already have an account →</button>
          </div> : <>
            <p className="sys-kicker">{mode === "signup" ? "FREE ACCOUNT · STEP 2 OF 3" : "WELCOME BACK"}</p>
            <h2>{mode === "signup" ? joiningCourseDetail ? "Create your account to start." : activeRole === "creator" ? "Create your academy account." : activeRole === "coach" ? "Create your coach account." : "Create your learner account." : "Sign in and continue."}</h2>
            <p>{mode === "signup"
              ? joiningCourse
                ? "You are one short step away from starting this course."
                : activeRole === "creator"
                  ? "After this, name your academy and enter its workspace."
                  : activeRole === "coach"
                    ? "After this, confirm your professional name and build your public profile."
                    : "After this, go directly to the courses. No second role decision."
              : "Return to the work already attached to your account."}</p>

            {mode === "signup" && activeRole && !joiningCourse && <div className="auth-route-confirmation">
              <div><small>YOUR START</small><b>{roleDetails[activeRole].title}</b><span>{roleDetails[activeRole].destination}</span></div>
              <button type="button" onClick={resetJoiningRole}>Change</button>
            </div>}

            <div className="auth-progress" aria-label="Registration progress">
              <span className="done"><b>✓</b><small>Route chosen</small></span>
              <span className={mode === "signup" ? "current" : "done"}><b>{mode === "signup" ? "2" : "✓"}</b><small>{mode === "signup" ? "Create account" : "Account ready"}</small></span>
              <span><b>3</b><small>{activeRole ? roleDetails[activeRole].destination : "Continue"}</small></span>
            </div>

            <button className="google-btn" disabled={busy} type="button" onClick={continueWithGoogle}>
              G&nbsp;&nbsp; {mode === "signup" ? activeRole === "creator" ? "Create academy account with Google" : activeRole === "coach" ? "Create coach account with Google" : "Join with Google" : "Continue with Google"}
            </button>
            <div className="or"><span/>or use your email<span/></div>

            <div className="auth-tabs" aria-label="Account access">
              <button className={mode === "signup" ? "active" : ""} type="button" onClick={() => changeMode("signup")}>Create account</button>
              <button className={mode === "login" ? "active" : ""} type="button" onClick={() => changeMode("login")}>Sign in</button>
            </div>

            <form onSubmit={submit}>
              <label>
                Email address
                <input required autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" />
              </label>
              <label>
                Password
                <input required autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" />
              </label>
              {mode === "login" && <a className="forgot-link" href="/forgot-password">Forgot your password?</a>}
              <button className="sys-primary" disabled={busy} type="submit">
                {busy ? "Please wait…" : mode === "signup" ? joiningCourse ? "Create account and enrol →" : activeRole === "creator" ? "Create account, then name academy →" : activeRole === "coach" ? "Create account, then set up profile →" : "Create account and browse courses →" : "Sign in and continue →"}
              </button>
            </form>
          </>}

          {message && <p className="form-message" role="status">{message}</p>}
          <p className="auth-note">By continuing, you agree to our <a href="/legal/terms">Terms of Service</a> and acknowledge our <a href="/legal/privacy">Privacy Policy</a>.</p>
        </section>
      </div>
    </main>
  );
}

function onboardingPathFrom(destination: string): "creator" | "learner" | "coach" | null {
  try {
    const url = new URL(destination, "https://northstarlabs.local");
    const path = url.searchParams.get("path");
    return path === "creator" || path === "learner" || path === "coach" ? path : null;
  } catch {
    return null;
  }
}

function accountRole(value: string | null): "creator" | "learner" | "coach" | null {
  return value === "creator" || value === "learner" || value === "coach" ? value : null;
}

function safeDestination(value: string | null): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/welcome";
  try {
    const url = new URL(value, "https://northstarlabs.local");
    return url.origin === "https://northstarlabs.local"
      ? `${url.pathname}${url.search}${url.hash}`
      : "/welcome";
  } catch {
    return "/welcome";
  }
}
