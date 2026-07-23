"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

type InvitationPreview = {
  schoolName: string;
  courseTitle: string | null;
  role: string;
  roleLabel: string;
  maskedEmail: string;
  status: string;
  expiresAt: number;
};

export default function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState("");
  const [invitation, setInvitation] = useState<InvitationPreview | null>(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const supabase = getSupabaseBrowser();

  useEffect(() => {
    params.then(({ token: invitationToken }) => setToken(invitationToken));
  }, [params]);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`/api/invitations/${encodeURIComponent(token)}`).then(async (response) => {
        if (!response.ok) throw new Error("This invitation could not be found.");
        return response.json() as Promise<InvitationPreview>;
      }),
      supabase?.auth.getSession(),
    ])
      .then(([preview, sessionResult]) => {
        setInvitation(preview);
        setAccountEmail(sessionResult?.data.session?.user.email || "");
      })
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setLoaded(true));
  }, [supabase, token]);

  async function acceptInvitation() {
    if (!supabase || !token || busy) return;
    setBusy(true);
    setMessage("");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      location.href = `/login?mode=signup&next=${encodeURIComponent(`/invite/${token}`)}`;
      return;
    }
    const response = await fetch(`/api/invitations/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { authorization: `Bearer ${data.session.access_token}` },
    });
    const result = await response.json() as { destination?: string; error?: string };
    if (!response.ok) {
      setMessage(result.error || "This invitation could not be accepted.");
      setBusy(false);
      return;
    }
    location.href = result.destination || "/learn";
  }

  async function useAnotherAccount() {
    await supabase?.auth.signOut();
    location.href = `/login?mode=login&next=${encodeURIComponent(`/invite/${token}`)}`;
  }

  if (!loaded) {
    return <main className="system-loading"><p>Opening your invitation...</p></main>;
  }
  if (!invitation) {
    return (
      <main className="invite-page">
        <section className="invite-card">
          <Link className="system-brand" href="/">* NORTHSTARLABS</Link>
          <p className="sys-kicker">INVITATION UNAVAILABLE</p>
          <h1>We cannot open this invitation.</h1>
          <p>{message || "Ask the academy to send you a fresh invitation link."}</p>
          <Link className="sys-primary" href="/">Return to NorthstarLabs</Link>
        </section>
      </main>
    );
  }

  const unavailable = invitation.status !== "pending";
  return (
    <main className="invite-page">
      <section className="invite-card">
        <Link className="system-brand" href="/">* NORTHSTARLABS</Link>
        <div className="invite-mark">*</div>
        <p className="sys-kicker">{unavailable ? "INVITATION UPDATE" : "YOU ARE INVITED"}</p>
        <h1>{unavailable ? "This invitation is no longer available." : `Join ${invitation.schoolName}.`}</h1>
        <p className="invite-summary">
          {unavailable
            ? invitation.status === "expired"
              ? "The secure link has expired. Ask the academy to send a new invitation."
              : `This invitation has already been ${invitation.status}.`
            : invitation.courseTitle
              ? `You have been invited as a ${invitation.roleLabel.toLowerCase()} with access to "${invitation.courseTitle}".`
              : `You have been invited to join as a ${invitation.roleLabel.toLowerCase()}.`}
        </p>

        {!unavailable && (
          <dl className="invite-details">
            <div><dt>Academy</dt><dd>{invitation.schoolName}</dd></div>
            <div><dt>Access</dt><dd>{invitation.roleLabel}</dd></div>
            {invitation.courseTitle && <div><dt>Course</dt><dd>{invitation.courseTitle}</dd></div>}
            <div><dt>Invited account</dt><dd>{invitation.maskedEmail}</dd></div>
            <div><dt>Link expires</dt><dd>{new Date(invitation.expiresAt).toLocaleDateString("en-ZA")}</dd></div>
          </dl>
        )}

        {!unavailable && !accountEmail && (
          <div className="invite-actions">
            <Link className="sys-primary" href={`/login?mode=signup&next=${encodeURIComponent(`/invite/${token}`)}`}>
              Create account and accept
            </Link>
            <Link className="invite-secondary" href={`/login?mode=login&next=${encodeURIComponent(`/invite/${token}`)}`}>
              I already have an account
            </Link>
            <small>Free account - No credit card - Your invitation is kept while you join</small>
          </div>
        )}

        {!unavailable && accountEmail && (
          <div className="invite-actions">
            <p>Signed in as <b>{accountEmail}</b></p>
            <button className="sys-primary" disabled={busy} onClick={acceptInvitation}>
              {busy ? "Accepting invitation..." : "Accept invitation"}
            </button>
            <button className="invite-secondary" type="button" onClick={useAnotherAccount}>
              Use a different account
            </button>
          </div>
        )}
        {message && invitation && <p className="form-message" role="status">{message}</p>}
        {unavailable && <Link className="invite-secondary" href="/">Return to NorthstarLabs</Link>}
      </section>
    </main>
  );
}
