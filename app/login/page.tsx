"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-client";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const supabase = getSupabaseBrowser();
  const destination = typeof window === "undefined"
    ? "/welcome"
    : safeDestination(new URLSearchParams(location.search).get("next"));
  const joiningCourse = destination.startsWith("/courses/");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) location.href = destination;
    });
  }, [destination, supabase]);

  async function submit(event: FormEvent) {
    event.preventDefault();
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
    if (!supabase) {
      setMessage("Google sign-in is temporarily unavailable. Please try again shortly.");
      return;
    }
    setBusy(true);
    setMessage("");
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
  }

  return (
    <main className="auth-page auth-page-expanded">
      <a className="system-brand" href="/">✦ NORTHSTARLABS</a>
      <div className="auth-layout">
        <aside className="auth-promise">
          <p className="sys-kicker">{joiningCourse ? "YOUR COURSE IS READY" : "START WITH A CLEAR NEXT STEP"}</p>
          <h1>{joiningCourse ? "Join once. Start learning next." : "Turn your knowledge into useful progress."}</h1>
          <p>{joiningCourse
            ? "Create your free account and we will enrol you in the course automatically."
            : "One free account gives you a creator workspace and access to practical starter courses."}</p>
          <ul>
            <li><span>01</span><div><b>Create one free account</b><small>Use Google or email. No payment details.</small></div></li>
            <li><span>02</span><div><b>Choose your path</b><small>Build a course or start learning immediately.</small></div></li>
            <li><span>03</span><div><b>Keep everything together</b><small>Your courses, progress, and community stay in one place.</small></div></li>
          </ul>
          <p className="auth-reassurance">Free starter access · No credit card · Switch paths anytime</p>
        </aside>

        <section className="auth-card">
          <a className="auth-back" href="/">← Back to NorthstarLabs</a>
          <p className="sys-kicker">{mode === "signup" ? "FREE ACCOUNT" : "WELCOME BACK"}</p>
          <h2>{mode === "signup" ? "Create your account." : "Sign in and continue."}</h2>
          <p>{mode === "signup"
            ? joiningCourse
              ? "You are one short step away from starting this course."
              : "Start creating or learning. You can decide after joining."
            : "Return to your courses, learning, and community."}</p>

          <button className="google-btn" disabled={busy} type="button" onClick={continueWithGoogle}>
            G&nbsp;&nbsp; {mode === "signup" ? "Join with Google" : "Continue with Google"}
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
              {busy ? "Please wait…" : mode === "signup" ? joiningCourse ? "Create account and enrol →" : "Create free account →" : "Sign in and continue →"}
            </button>
          </form>

          {message && <p className="form-message" role="status">{message}</p>}
          <p className="auth-note">By continuing, you agree to our <a href="/legal/terms">Terms of Service</a> and acknowledge our <a href="/legal/privacy">Privacy Policy</a>.</p>
        </section>
      </div>
    </main>
  );
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
