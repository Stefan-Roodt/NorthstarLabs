"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-client";

type TutoringRequest = {
  id: string;
  tutorId: string;
  slotId: string | null;
  subject: string;
  message: string;
  preferredTimes: string;
  contactPreference: string;
  status: string;
  createdAt: number;
  updatedAt: number;
  tutorName: string;
  tutorSlug: string;
  schoolName: string;
  schoolSlug: string;
  startsAt: number | null;
  endsAt: number | null;
  timezone: string | null;
  sessionMode: string | null;
  meetingDetails: string | null;
};

const statusCopy: Record<string, { label: string; text: string }> = {
  new: {
    label: "Awaiting confirmation",
    text: "Your chosen time is protected while the academy reviews your request.",
  },
  contacted: {
    label: "In conversation",
    text: "The academy has started following up with you.",
  },
  booked: {
    label: "Confirmed",
    text: "Your appointment is confirmed. The joining details are below.",
  },
  declined: {
    label: "Choose another time",
    text: "This time could not be confirmed, but you can request another available slot.",
  },
  closed: {
    label: "Closed",
    text: "This tutoring request has been closed.",
  },
};

export default function TutoringPage() {
  const supabase = getSupabaseBrowser();
  const [items, setItems] = useState<TutoringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(0);

  const load = useCallback(async () => {
    if (!supabase) return;
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) {
      location.href = "/login?next=/tutoring";
      return;
    }
    const response = await fetch("/api/tutor-inquiries?view=learner", {
      headers: { authorization: `Bearer ${session.access_token}` },
    });
    if (response.ok) {
      const result = await response.json() as { inquiries: TutoringRequest[] };
      setItems(result.inquiries);
    } else {
      setMessage("Your tutoring requests could not be loaded.");
    }
    setCurrentTime(Date.now());
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function cancelAppointment(item: TutoringRequest) {
    if (!confirm(`Cancel your appointment request with ${item.tutorName}?`)) return;
    const session = (await supabase?.auth.getSession())?.data.session;
    if (!session) return;
    setBusy(item.id);
    setMessage("");
    const response = await fetch("/api/tutor-inquiries", {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${session.access_token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ id: item.id, action: "learner_cancel" }),
    });
    const result = await response.json();
    setMessage(response.ok
      ? "Your request was cancelled and the appointment time was released."
      : result.error || "The appointment could not be cancelled.");
    if (response.ok) await load();
    setBusy("");
  }

  async function signOut() {
    await supabase?.auth.signOut();
    location.href = "/";
  }

  const upcoming = items.filter((item) =>
    !["declined", "closed"].includes(item.status) &&
    (!item.startsAt || item.startsAt > currentTime)
  );
  const history = items.filter((item) => !upcoming.includes(item));

  return <main className="tutoring-page">
    <header className="tutoring-nav">
      <Link className="system-brand" href="/learn">✦ NORTHSTARLABS</Link>
      <nav>
        <Link href="/learn">My learning</Link>
        <Link href="/courses">Explore courses</Link>
        <Link href="/account">Account</Link>
        <button onClick={signOut}>Sign out</button>
      </nav>
    </header>

    <section className="tutoring-hero">
      <div>
        <p className="sys-kicker">MY TUTORING</p>
        <h1>Personal help, without the admin chase.</h1>
        <p>Request a time, follow its confirmation and keep every joining detail in one trusted place.</p>
      </div>
      {!loading && <dl>
        <div><dt>Upcoming</dt><dd>{upcoming.length}</dd></div>
        <div><dt>Confirmed</dt><dd>{upcoming.filter((item) => item.status === "booked").length}</dd></div>
      </dl>}
    </section>

    <section className="tutoring-content">
      {message && <div className="notice" role="status">{message}</div>}
      {loading ? <article className="panel product-empty"><h2>Loading your tutoring desk…</h2></article> : <>
        <div className="tutoring-heading"><div><p className="sys-kicker">NEXT</p><h2>Upcoming requests</h2></div><Link href="/courses">Explore learning</Link></div>
        {upcoming.length ? <div className="tutoring-grid">{upcoming.map((item) =>
          <TutoringCard key={item.id} item={item} busy={busy === item.id} now={currentTime} onCancel={cancelAppointment} />
        )}</div> : <article className="panel tutoring-empty">
          <span>1:1</span>
          <div><h2>No upcoming tutoring yet.</h2><p>Open an academy&apos;s tutor directory, compare expertise and request a time that works for you.</p><Link className="sys-primary" href="/courses">Find an academy</Link></div>
        </article>}

        {history.length > 0 && <div className="tutoring-history">
          <div className="tutoring-heading"><div><p className="sys-kicker">HISTORY</p><h2>Earlier requests</h2></div></div>
          <div className="tutoring-grid">{history.map((item) =>
            <TutoringCard key={item.id} item={item} busy={false} now={currentTime} onCancel={cancelAppointment} />
          )}</div>
        </div>}
      </>}
    </section>
  </main>;
}

function TutoringCard({
  item,
  busy,
  now,
  onCancel,
}: {
  item: TutoringRequest;
  busy: boolean;
  now: number;
  onCancel: (item: TutoringRequest) => void;
}) {
  const copy = statusCopy[item.status] || statusCopy.new;
  const canCancel = ["new", "contacted", "booked"].includes(item.status) &&
    (!item.startsAt || item.startsAt > now);
  return <article className={`panel tutoring-card status-${item.status}`}>
    <header>
      <div><p className="sys-kicker">{item.schoolName.toUpperCase()}</p><h3>{item.tutorName}</h3></div>
      <span>{copy.label}</span>
    </header>
    {item.startsAt ? <div className="tutoring-time">
      <strong>{new Date(item.startsAt).toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" })}</strong>
      <b>{new Date(item.startsAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
        {item.endsAt ? `–${new Date(item.endsAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}` : ""}</b>
      <small>{item.sessionMode?.replaceAll("_", " ")} · {item.timezone}</small>
    </div> : <div className="tutoring-time tutoring-time-general"><strong>General tutoring enquiry</strong><small>{item.preferredTimes || "The academy will contact you to arrange a time."}</small></div>}
    <p>{copy.text}</p>
    {item.status === "booked" && <div className="tutoring-joining">
      <small>JOINING OR VENUE DETAILS</small>
      <p>{item.meetingDetails || "The tutor or academy will share the final details before your appointment."}</p>
    </div>}
    <div className="tutoring-actions">
      <Link href={`/schools/${item.schoolSlug}/tutors/${item.tutorSlug}`}>
        {item.status === "declined" ? "Choose another time" : "View tutor"}
      </Link>
      {canCancel && <button disabled={busy} onClick={() => onCancel(item)}>{busy ? "Cancelling…" : "Cancel request"}</button>}
    </div>
  </article>;
}
