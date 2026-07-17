"use client";

import { FormEvent, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-client";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const supabase = getSupabaseBrowser();
  const destination = typeof window === "undefined" ? "/dashboard" : new URLSearchParams(location.search).get("next") || "/dashboard";

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
          options: { emailRedirectTo: `${location.origin}/dashboard` },
        });

        if (error) throw error;
        if (data.session) {
          location.href = destination;
          return;
        }
        setMessage("Account created. Check your inbox and confirm your email to continue.");
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
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}${destination}` } });
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
    <main className="auth-page">
      <a className="system-brand" href="/">✦ NORTHSTARLABS</a>
      <section className="auth-card">
        <p className="sys-kicker">BUILD. TEACH. GROW.</p>
        <h1>{mode === "signup" ? "Create your account." : "Welcome back."}</h1>
        <p>{mode === "signup"
          ? "Start building courses, communities, and memberships in minutes."
          : "Sign in to manage your learning business."}</p>

        <button className="google-btn" disabled={busy} type="button" onClick={continueWithGoogle}>G&nbsp;&nbsp; Continue with Google</button>
        <div className="or"><span/>or continue with email<span/></div>

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
            {busy ? "Please wait…" : mode === "signup" ? "Create my account →" : "Sign in →"}
          </button>
        </form>

        {message && <p className="form-message" role="status">{message}</p>}
        <p className="auth-note">By continuing, you agree to NorthstarLabs’ terms and privacy policy.</p>
      </section>
    </main>
  );
}
