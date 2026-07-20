"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-client";
import {
  coachImprovementTags,
  coachPraiseTags,
  RATING_WINDOW_MS,
} from "../../lib/tutor-rating-policy";

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
  reviewId: string | null;
  reviewStatus: string | null;
  reviewVisibleAfter: number | null;
  coachRatingId: string | null;
};

type LearnerReputation = {
  ratingCount: number;
  minimumRatings: number;
  averageRating: number | null;
  themes: Array<{ tag: string; count: number }>;
};

const ratingTagLabels: Record<string, string> = {
  clear_explanations: "Clear explanations",
  knowledgeable: "Knowledgeable",
  supportive: "Supportive",
  prepared: "Prepared",
  punctual: "On time",
  needs_clearer_explanations: "Explanations need work",
  knowledge_gap: "Knowledge gap",
  limited_support: "Limited support",
  unprepared: "Unprepared",
  late: "Late",
  engaged: "Engaged",
  communicative: "Communicative",
  respectful: "Respectful",
  needs_preparation: "Needs preparation",
  low_engagement: "Low engagement",
  communication_issue: "Communication issue",
  conduct_concern: "Conduct concern",
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
  completed: {
    label: "Completed",
    text: "This session is complete. Anonymous feedback helps both sides build trust.",
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
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [ratingTags, setRatingTags] = useState<Record<string, string[]>>({});
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({});
  const [reputation, setReputation] = useState<LearnerReputation | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) {
      location.href = "/login?next=/tutoring";
      return;
    }
    const headers = { authorization: `Bearer ${session.access_token}` };
    const [response, reputationResponse] = await Promise.all([
      fetch("/api/tutor-inquiries?view=learner", { headers }),
      fetch("/api/learner-ratings", { headers }),
    ]);
    if (response.ok) {
      const result = await response.json() as { inquiries: TutoringRequest[] };
      setItems(result.inquiries);
    } else {
      setMessage("Your tutoring requests could not be loaded.");
    }
    if (reputationResponse.ok) {
      setReputation(await reputationResponse.json() as LearnerReputation);
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

  async function submitReview(item: TutoringRequest) {
    const session = (await supabase?.auth.getSession())?.data.session;
    if (!session) return;
    setBusy(`review-${item.id}`);
    setMessage("");
    const response = await fetch("/api/tutor-reviews", {
      method: "POST",
      headers: {
        authorization: `Bearer ${session.access_token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        inquiryId: item.id,
        rating: ratings[item.id] || 0,
        tags: ratingTags[item.id] || [],
        comment: reviewComments[item.id] || "",
      }),
    });
    const result = await response.json();
    setMessage(response.ok
      ? result.status === "published"
        ? `Thank you. Both sides have now rated the session, so your anonymous review for ${item.tutorName} is visible.`
        : "Thank you. Your anonymous review is sealed until the coach responds or the seven-day blind period ends."
      : result.error || "Your review could not be saved.");
    if (response.ok) await load();
    setBusy("");
  }

  function chooseRating(inquiryId: string, rating: number) {
    setRatings((current) => ({ ...current, [inquiryId]: rating }));
    setRatingTags((current) => ({ ...current, [inquiryId]: [] }));
  }

  function toggleRatingTag(inquiryId: string, tag: string) {
    setRatingTags((current) => {
      const currentTags = current[inquiryId] || [];
      return {
        ...current,
        [inquiryId]: currentTags.includes(tag)
          ? currentTags.filter((item) => item !== tag)
          : [...currentTags, tag],
      };
    });
  }

  async function signOut() {
    await supabase?.auth.signOut();
    location.href = "/";
  }

  const upcoming = items.filter((item) =>
    !["declined", "closed", "completed"].includes(item.status) &&
    (!item.startsAt || item.startsAt > currentTime)
  );
  const history = items.filter((item) => !upcoming.includes(item));

  const card = (item: TutoringRequest, cancellable: boolean) =>
    <TutoringCard
      key={item.id}
      item={item}
      busy={cancellable && busy === item.id}
      now={currentTime}
      onCancel={cancelAppointment}
      onReview={submitReview}
      rating={ratings[item.id] || 0}
      tags={ratingTags[item.id] || []}
      comment={reviewComments[item.id] || ""}
      reviewBusy={busy === `review-${item.id}`}
      onRating={(rating) => chooseRating(item.id, rating)}
      onToggleTag={(tag) => toggleRatingTag(item.id, tag)}
      onComment={(comment) => setReviewComments((current) => ({
        ...current,
        [item.id]: comment,
      }))}
    />;

  return <main className="tutoring-page">
    <header className="tutoring-nav">
      <Link className="system-brand" href="/learn">✦ NORTHSTARLABS</Link>
      <nav>
        <Link href="/learn">My learning</Link>
        <Link href="/tutors">Find a tutor</Link>
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
      {loading
        ? <article className="panel product-empty"><h2>Loading your tutoring desk…</h2></article>
        : <>
          {reputation && <article className="panel learner-reputation-card">
            <div>
              <p className="sys-kicker">PRIVATE LEARNER REPUTATION</p>
              <h2>{reputation.averageRating === null
                ? "Your reliability history is taking shape."
                : `${reputation.averageRating} ★ from verified sessions`}</h2>
              <p>{reputation.averageRating === null
                ? `${reputation.ratingCount} of ${reputation.minimumRatings} ratings received. Your score stays hidden until enough sessions protect individual coach anonymity.`
                : `${reputation.ratingCount} completed-session ratings. This aggregate is visible only to you and academy staff handling your request—never on a public profile.`}</p>
            </div>
            {reputation.averageRating !== null && <strong>{reputation.averageRating}</strong>}
            {reputation.themes.length > 0 && <div>{reputation.themes.map((theme) =>
              <span key={theme.tag}>{ratingTagLabels[theme.tag] || theme.tag.replaceAll("_", " ")}</span>
            )}</div>}
          </article>}
          <div className="tutoring-heading"><div><p className="sys-kicker">NEXT</p><h2>Upcoming requests</h2></div><Link href="/courses">Explore learning</Link></div>
          {upcoming.length
            ? <div className="tutoring-grid">{upcoming.map((item) => card(item, true))}</div>
            : <article className="panel tutoring-empty">
              <span>1:1</span>
              <div><h2>No upcoming tutoring yet.</h2><p>Open an academy&apos;s tutor directory, compare expertise and request a time that works for you.</p><Link className="sys-primary" href="/courses">Find an academy</Link></div>
            </article>}

          {history.length > 0 && <div className="tutoring-history">
            <div className="tutoring-heading"><div><p className="sys-kicker">HISTORY</p><h2>Earlier requests</h2></div></div>
            <div className="tutoring-grid">{history.map((item) => card(item, false))}</div>
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
  onReview,
  rating,
  tags,
  comment,
  reviewBusy,
  onRating,
  onToggleTag,
  onComment,
}: {
  item: TutoringRequest;
  busy: boolean;
  now: number;
  onCancel: (item: TutoringRequest) => void;
  onReview: (item: TutoringRequest) => void;
  rating: number;
  tags: string[];
  comment: string;
  reviewBusy: boolean;
  onRating: (rating: number) => void;
  onToggleTag: (tag: string) => void;
  onComment: (comment: string) => void;
}) {
  const copy = statusCopy[item.status] || statusCopy.new;
  const canCancel = ["new", "contacted", "booked"].includes(item.status) &&
    (!item.startsAt || item.startsAt > now);
  const ratingWindowOpen = item.updatedAt + RATING_WINDOW_MS >= now;
  const availableTags = rating === 5 ? coachPraiseTags : coachImprovementTags;
  const needsReason = rating > 0 && rating < 5;
  return <article className={`panel tutoring-card status-${item.status}`}>
    <header>
      <div><p className="sys-kicker">{item.schoolName.toUpperCase()}</p><h3>{item.tutorName}</h3></div>
      <span>{copy.label}</span>
    </header>
    {item.startsAt
      ? <div className="tutoring-time">
        <strong>{new Date(item.startsAt).toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" })}</strong>
        <b>{new Date(item.startsAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
          {item.endsAt ? `–${new Date(item.endsAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}` : ""}</b>
        <small>{item.sessionMode?.replaceAll("_", " ")} · {item.timezone}</small>
      </div>
      : <div className="tutoring-time tutoring-time-general"><strong>General tutoring enquiry</strong><small>{item.preferredTimes || "The academy will contact you to arrange a time."}</small></div>}
    <p>{copy.text}</p>
    {item.status === "booked" && <div className="tutoring-joining">
      <small>JOINING OR VENUE DETAILS</small>
      <p>{item.meetingDetails || "The tutor or academy will share the final details before your appointment."}</p>
    </div>}
    {item.status === "completed" && !item.reviewId && ratingWindowOpen && <section className="tutoring-review-form">
      <p className="sys-kicker">VERIFIED SESSION RATING</p>
      <h4>How was your session?</h4>
      <div aria-label="Choose a rating">{[1, 2, 3, 4, 5].map((value) =>
        <button aria-label={`${value} star${value === 1 ? "" : "s"}`} aria-pressed={rating === value} key={value} onClick={() => onRating(value)} type="button">★</button>
      )}</div>
      {rating > 0 && <div className="rating-tag-picker" aria-label={needsReason ? "Choose at least one reason" : "Choose helpful highlights"}>
        {availableTags.map((tag) =>
          <button aria-pressed={tags.includes(tag)} key={tag} onClick={() => onToggleTag(tag)} type="button">{ratingTagLabels[tag]}</button>
        )}
      </div>}
      <textarea maxLength={800} value={comment} onChange={(event) => onComment(event.target.value)} placeholder="What helped, and who would you recommend this coach or tutor to?" />
      <button className="sys-primary" disabled={reviewBusy || !rating || (needsReason && !tags.length)} onClick={() => onReview(item)} type="button">{reviewBusy ? "Saving…" : "Submit anonymous rating"}</button>
      <small>Your identity is never shown publicly. The rating stays sealed until both sides submit or seven days pass.</small>
    </section>}
    {item.status === "completed" && !item.reviewId && !ratingWindowOpen && <p className="tutoring-rating-closed">The 14-day rating window for this session has closed.</p>}
    {item.reviewId && <p className="tutoring-reviewed">✓ {item.reviewStatus === "pending" && Number(item.reviewVisibleAfter || 0) > now
      ? "Your anonymous rating is sealed during the blind period."
      : "Your anonymous completed-session rating is counted."}</p>}
    {item.coachRatingId && <p className="tutoring-coach-rated">The coach has submitted private feedback. You will see only your protected aggregate once enough sessions have been rated.</p>}
    <div className="tutoring-actions">
      <Link href={`/schools/${item.schoolSlug}/tutors/${item.tutorSlug}`}>
        {item.status === "declined" ? "Choose another time" : "View tutor"}
      </Link>
      {canCancel && <button disabled={busy} onClick={() => onCancel(item)}>{busy ? "Cancelling…" : "Cancel request"}</button>}
    </div>
  </article>;
}
