"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

export default function ResetPassword() {
  const supabase = getSupabaseBrowser();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(supabase
    ? "Checking your secure reset link..."
    : "Password recovery is temporarily unavailable.");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    (async () => {
      let session = (await supabase.auth.getSession()).data.session;
      const code = new URLSearchParams(location.search).get("code");
      if (!session && code) {
        const result = await supabase.auth.exchangeCodeForSession(code);
        session = result.data.session;
      }
      if (!active) return;
      if (session) {
        setReady(true);
        setMessage("");
      } else {
        setMessage("This reset link is invalid or has expired. Request a new one.");
      }
    })();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
        setMessage("");
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !ready) return;
    if (password.length < 8) {
      setMessage("Use at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Password updated. Redirecting to your account...");
    setTimeout(() => { location.href = "/account"; }, 900);
  }

  return <main className="auth-page">
    <Link className="system-brand" href="/">* NORTHSTARLABS</Link>
    <section className="auth-card compact-auth-card">
      <p className="sys-kicker">SECURE PASSWORD</p>
      <h1>Choose a new password.</h1>
      <p>Use a unique password with at least 8 characters.</p>
      {ready && <form onSubmit={savePassword}>
        <label>
          New password
          <input
            required
            minLength={8}
            autoComplete="new-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label>
          Confirm new password
          <input
            required
            minLength={8}
            autoComplete="new-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>
        <button className="sys-primary" disabled={busy}>
          {busy ? "Updating..." : "Update password"}
        </button>
      </form>}
      {message && <p className="form-message" role="status">{message}</p>}
      {!ready && <Link className="auth-back" href="/forgot-password">Request another reset link</Link>}
    </section>
  </main>;
}
