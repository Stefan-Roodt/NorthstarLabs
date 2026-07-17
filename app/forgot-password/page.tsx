"use client";

import { FormEvent, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const supabase = getSupabaseBrowser();

  async function requestReset(event: FormEvent) {
    event.preventDefault();
    if (!supabase) {
      setMessage("Password recovery is temporarily unavailable.");
      return;
    }
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/account/reset-password`,
    });
    setBusy(false);
    setMessage(error
      ? error.message
      : "If an account exists for that email, a secure reset link is on its way.");
  }

  return <main className="auth-page">
    <a className="system-brand" href="/">✦ NORTHSTARLABS</a>
    <section className="auth-card compact-auth-card">
      <p className="sys-kicker">ACCOUNT RECOVERY</p>
      <h1>Reset your password.</h1>
      <p>Enter the email connected to your NorthStarLabs account.</p>
      <form onSubmit={requestReset}>
        <label>
          Email address
          <input
            required
            autoComplete="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
          />
        </label>
        <button className="sys-primary" disabled={busy}>
          {busy ? "Sending..." : "Send secure reset link"}
        </button>
      </form>
      {message && <p className="form-message" role="status">{message}</p>}
      <a className="auth-back" href="/login">← Return to sign in</a>
    </section>
  </main>;
}
