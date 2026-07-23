"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-client";

type Profile = {
  email: string;
  displayName: string;
  role: string;
  createdAt: number;
};
type NotificationPreferences = {
  enrollmentEmails: number;
  completionEmails: number;
  communityEmails: number;
  liveSessionReminders: number;
  creatorSummaries: number;
  productUpdates: number;
};
type InboxNotification = {
  id: string;
  templateKey: string;
  title: string;
  body: string;
  actionLabel: string;
  actionUrl: string;
  readAt: number | null;
  createdAt: number;
};

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [providers, setProviders] = useState<string[]>([]);
  const [verifiedAt, setVerifiedAt] = useState("");
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [inbox, setInbox] = useState<InboxNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [message, setMessage] = useState("Loading your account...");
  const [busy, setBusy] = useState("");
  const supabase = getSupabaseBrowser();

  const sessionToken = useCallback(async () => {
    return (await supabase?.auth.getSession())?.data.session?.access_token || "";
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        location.href = "/login?next=/account";
        return;
      }
      const response = await fetch("/api/profile", {
        headers: { authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) {
        setMessage("Your account details could not be loaded.");
        return;
      }
      const result = await response.json() as Profile;
      setProfile(result);
      setDisplayName(result.displayName);
      setEmail(session.user.email || result.email);
      setProviders(Array.from(new Set(
        (session.user.identities || []).map((identity) => identity.provider).filter(Boolean),
      )));
      setVerifiedAt(session.user.email_confirmed_at || "");
      const preferencesResponse = await fetch("/api/notifications", {
        headers: { authorization: `Bearer ${session.access_token}` },
      });
      if (preferencesResponse.ok) {
        const notificationData = await preferencesResponse.json() as NotificationPreferences & {
          inbox?: InboxNotification[];
          unreadCount?: number;
        };
        setPreferences(notificationData);
        setInbox(notificationData.inbox || []);
        setUnreadCount(Number(notificationData.unreadCount || 0));
      }
      setMessage("");
    })();
  }, [sessionToken, supabase]);

  async function updatePreference(
    key: keyof NotificationPreferences,
    enabled: boolean,
  ) {
    if (!preferences) return;
    const next = { ...preferences, [key]: enabled ? 1 : 0 };
    setPreferences(next);
    setMessage("Saving notification preferences...");
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await sessionToken()}`,
      },
      body: JSON.stringify({ [key]: enabled }),
    });
    setMessage(response.ok ? "Notification preferences saved." : "Preferences could not be saved.");
  }

  async function markNotificationRead(notification: InboxNotification) {
    if (notification.readAt) return;
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await sessionToken()}`,
      },
      body: JSON.stringify({ action: "mark_read", id: notification.id }),
    });
    if (!response.ok) {
      setMessage("That notification could not be updated.");
      return;
    }
    const result = await response.json() as { readAt: number };
    setInbox((current) => current.map((item) =>
      item.id === notification.id ? { ...item, readAt: result.readAt } : item
    ));
    setUnreadCount((current) => Math.max(0, current - 1));
  }

  async function markAllNotificationsRead() {
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await sessionToken()}`,
      },
      body: JSON.stringify({ action: "mark_all_read" }),
    });
    if (!response.ok) {
      setMessage("Notifications could not be updated.");
      return;
    }
    const result = await response.json() as { readAt: number };
    setInbox((current) => current.map((item) => ({ ...item, readAt: item.readAt || result.readAt })));
    setUnreadCount(0);
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !profile) return;
    setBusy("profile");
    setMessage("");
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await sessionToken()}`,
      },
      body: JSON.stringify({ displayName }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Your profile could not be updated.");
      setBusy("");
      return;
    }
    const metadata = await supabase.auth.updateUser({ data: { full_name: displayName.trim() } });
    if (metadata.error) {
      setMessage(metadata.error.message);
    } else {
      setProfile({ ...profile, displayName: displayName.trim() });
      setMessage("Profile updated.");
    }
    setBusy("");
  }

  async function changeEmail(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !profile || email.trim().toLowerCase() === profile.email.toLowerCase()) return;
    setBusy("email");
    setMessage("");
    const { error } = await supabase.auth.updateUser(
      { email: email.trim() },
      { emailRedirectTo: `${location.origin}/account?email=confirmed` },
    );
    setBusy("");
    setMessage(error
      ? error.message
      : "Confirmation links have been sent. Your email changes after the required confirmations.");
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    if (newPassword.length < 8) {
      setMessage("Use at least 8 characters for your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("The new passwords do not match.");
      return;
    }
    setBusy("password");
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setBusy("");
    if (error) {
      setMessage(error.message);
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    setMessage("Password updated successfully.");
  }

  async function signOutEverywhere() {
    if (!supabase || !confirm("Sign out this account on every device?")) return;
    setBusy("signout");
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) {
      setMessage(error.message);
      setBusy("");
      return;
    }
    location.href = "/";
  }

  async function signOutCurrentDevice() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage(error.message);
      return;
    }
    location.href = "/";
  }

  async function exportMyData() {
    setBusy("export");
    setMessage("Preparing your personal-data export...");
    const response = await fetch("/api/account/data", {
      headers: { authorization: `Bearer ${await sessionToken()}` },
    });
    if (!response.ok) {
      const result = await response.json();
      setMessage(result.error || "Your data export could not be created.");
      setBusy("");
      return;
    }
    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `northstarlabs-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(href);
    setBusy("");
    setMessage("Your personal-data export has been downloaded.");
  }

  async function requestDeletion() {
    const confirmation = prompt(
      "Account deletion is permanent. Type DELETE to continue. Academy owners must transfer or close their academy first.",
    );
    if (confirmation !== "DELETE") {
      if (confirmation !== null) setMessage("Deletion was not confirmed.");
      return;
    }
    setBusy("delete");
    setMessage("Securing your deletion request...");
    const response = await fetch("/api/account/data", {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await sessionToken()}`,
      },
      body: JSON.stringify({ confirmation }),
    });
    const result = await response.json();
    setBusy("");
    if (!response.ok) {
      setMessage(result.error || "The deletion request could not be accepted.");
      return;
    }
    if (response.status === 202) {
      setMessage(result.message || "Your deletion request has been recorded.");
      return;
    }
    await supabase?.auth.signOut({ scope: "global" });
    location.href = "/";
  }

  if (!profile) return <main className="system-loading"><div><b>NorthstarLabs</b><p>{message}</p></div></main>;

  return <main className="account-page">
    <header className="account-top">
      <Link className="system-brand" href="/">* NORTHSTARLABS</Link>
      <nav>
        <Link href="/learn">My learning</Link>
        <Link href="/dashboard">Creator workspace</Link>
      </nav>
      <div className="account-actions">
        <button className="account-signout-mini" type="button" onClick={signOutCurrentDevice}>
          Sign out
        </button>
      </div>
    </header>
    <section className="account-hero">
      <div>
        <p className="sys-kicker">ACCOUNT & SECURITY</p>
        <h1>Your NorthstarLabs account.</h1>
        <p>Keep your profile, sign-in details, and account security current.</p>
      </div>
      <span>{displayName.slice(0, 2).toUpperCase()}</span>
    </section>
    <section className="account-grid">
      {message && <div className="notice account-notice" role="status">{message}</div>}

      <article className="panel account-card notification-inbox">
        <div className="notification-inbox-heading">
          <div>
            <p className="sys-kicker">YOUR UPDATES</p>
            <h2>Notifications {unreadCount ? `(${unreadCount} new)` : ""}</h2>
          </div>
          {unreadCount > 0 && <button type="button" onClick={markAllNotificationsRead}>Mark all read</button>}
        </div>
        {inbox.length ? <div className="notification-inbox-list">
          {inbox.map((notification) => <article className={notification.readAt ? "read" : "unread"} key={notification.id}>
            <div>
              <span>{notification.readAt ? "READ" : "NEW"}</span>
              <time>{new Date(notification.createdAt).toLocaleDateString("en-ZA")}</time>
            </div>
            <h3>{notification.title}</h3>
            <p>{notification.body}</p>
            <Link href={notification.actionUrl} onClick={() => { void markNotificationRead(notification); }}>
              {notification.actionLabel} →
            </Link>
          </article>)}
        </div> : <p className="notification-inbox-empty">Course, booking, certificate, educator and live-session updates will appear here—even when external email is unavailable.</p>}
      </article>

      <article className="panel account-card">
        <div><p className="sys-kicker">PROFILE</p><h2>How people see you</h2></div>
        <form onSubmit={saveProfile}>
          <label>
            Display name
            <input required minLength={2} maxLength={80} value={displayName}
              onChange={(event) => setDisplayName(event.target.value)} />
          </label>
          <button className="sys-primary" disabled={busy === "profile"}>
            {busy === "profile" ? "Saving..." : "Save profile"}
          </button>
        </form>
      </article>

      <article className="panel account-card">
        <div><p className="sys-kicker">EMAIL ADDRESS</p><h2>Your sign-in email</h2></div>
        <form onSubmit={changeEmail}>
          <label>
            Email
            <input required type="email" autoComplete="email" value={email}
              onChange={(event) => setEmail(event.target.value)} />
          </label>
          <button className="sys-primary"
            disabled={busy === "email" || email.trim().toLowerCase() === profile.email.toLowerCase()}>
            {busy === "email" ? "Sending..." : "Change email"}
          </button>
        </form>
        <small>{verifiedAt ? `Verified ${new Date(verifiedAt).toLocaleDateString("en-ZA")}` : "Verification pending"}</small>
      </article>

      <article className="panel account-card">
        <div><p className="sys-kicker">PASSWORD</p><h2>Update your password</h2></div>
        <form onSubmit={changePassword}>
          <label>
            New password
            <input required minLength={8} type="password" autoComplete="new-password"
              value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
          </label>
          <label>
            Confirm new password
            <input required minLength={8} type="password" autoComplete="new-password"
              value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </label>
          <button className="sys-primary" disabled={busy === "password"}>
            {busy === "password" ? "Updating..." : "Update password"}
          </button>
        </form>
        <a className="account-text-link" href="/forgot-password">Send a password recovery email instead</a>
      </article>

      <article className="panel account-card security-card">
        <div><p className="sys-kicker">SECURITY</p><h2>Sessions and connections</h2></div>
        <dl>
          <div><dt>Connected sign-in</dt><dd>{providers.length ? providers.join(", ") : "Email"}</dd></div>
          <div><dt>Member since</dt><dd>{new Date(profile.createdAt).toLocaleDateString("en-ZA")}</dd></div>
        </dl>
        <button className="danger-button" disabled={busy === "signout"} onClick={signOutEverywhere}>
          {busy === "signout" ? "Signing out..." : "Sign out on every device"}
        </button>
      </article>

      {preferences && <article className="panel account-card notification-card">
        <div><p className="sys-kicker">NOTIFICATIONS</p><h2>Choose what reaches your inbox</h2></div>
        <div className="notification-options">
          {[
            ["enrollmentEmails", "Course enrolments", "Confirmation when you join a course."],
            ["completionEmails", "Completion and certificates", "Your verified certificate and completion notice."],
            ["communityEmails", "Community activity", "Relevant community and moderation notifications."],
            ["liveSessionReminders", "Live session reminders", "Email reminders before registered 1:1 and group sessions."],
            ["creatorSummaries", "Creator summaries", "Scheduled learning-performance reports."],
            ["productUpdates", "Product updates", "Occasional NorthstarLabs product news."],
          ].map(([key, label, description]) => <label key={key}>
            <span><b>{label}</b><small>{description}</small></span>
            <input type="checkbox" checked={Boolean(preferences[key as keyof NotificationPreferences])}
              onChange={(event) => updatePreference(key as keyof NotificationPreferences, event.target.checked)} />
          </label>)}
        </div>
      </article>}

      <article className="panel account-card account-data-card">
        <div><p className="sys-kicker">PRIVACY & YOUR DATA</p><h2>Export or remove your account</h2></div>
        <p>Download the profile, learning activity, quiz attempts, mastery and practice history, certificates, community posts, and preferences NorthstarLabs stores for you.</p>
        <button className="sys-primary" disabled={Boolean(busy)} onClick={exportMyData}>
          {busy === "export" ? "Preparing export..." : "Download my data"}
        </button>
        <hr />
        <p>Deleting an account removes personal learning records and anonymises retained community and audit history. Academy owners must transfer or close their academy first.</p>
        <button className="danger-button" disabled={Boolean(busy)} onClick={requestDeletion}>
          {busy === "delete" ? "Submitting request..." : "Delete my account"}
        </button>
      </article>
    </section>
  </main>;
}
