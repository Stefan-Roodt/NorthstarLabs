"use client";

import Link from "next/link";
import { type CSSProperties, FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../../../../lib/supabase-client";
import { useSignedIn } from "../../../../../lib/use-signed-in";

type PublicTutor = {
  id: string;
  slug: string;
  displayName: string;
  headline: string;
  bio: string;
  subjects: string[];
  languages: string[];
  qualifications: string;
  experienceYears: number;
  priceCents: number;
  priceUnit: string;
  sessionMode: string;
  location: string;
  timezone: string;
  availability: string;
  photoUrl: string | null;
  phoneNumber: string;
  whatsappNumber: string;
  bookingUrl: string | null;
  showDirectContact: boolean;
  verified: boolean;
  verifiedCredentialCount: number;
  reviewCount: number;
  averageRating: number | null;
  profileCompleteness: number;
};

type TutorDetail = {
  school: {
    slug: string;
    name: string;
    description: string;
    logoUrl: string | null;
    primaryColor: string;
    accentColor: string;
  };
  tutors: PublicTutor[];
  slots: AvailableSlot[];
};

type AvailableSlot = {
  id: string;
  tutorId: string;
  startsAt: number;
  endsAt: number;
  timezone: string;
  sessionMode: string;
};

type TutorReview = {
  id: string;
  rating: number;
  tags: string[];
  comment: string;
  reviewerName: string;
  createdAt: number;
  verifiedSession: boolean;
};

const reviewTagLabels: Record<string, string> = {
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
};

function whatsappLink(number: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}`;
}

export default function TutorDetailPage({ params }: {
  params: Promise<{ slug: string; tutorSlug: string }>;
}) {
  const supabase = getSupabaseBrowser();
  const signedIn = useSignedIn();
  const [path, setPath] = useState({ slug: "", tutorSlug: "" });
  const [data, setData] = useState<TutorDetail | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [preferredTimes, setPreferredTimes] = useState("");
  const [contactPreference, setContactPreference] = useState("email");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [reviews, setReviews] = useState<TutorReview[]>([]);

  useEffect(() => {
    params.then(setPath);
  }, [params]);

  useEffect(() => {
    if (!path.slug || !path.tutorSlug) return;
    fetch(`/api/tutors?schoolSlug=${encodeURIComponent(path.slug)}&slug=${encodeURIComponent(path.tutorSlug)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("This tutor profile is unavailable.");
        return response.json() as Promise<TutorDetail>;
      })
      .then(async (detail) => {
        setData(detail);
        const tutorId = detail.tutors[0]?.id;
        if (!tutorId) return;
        const reviewsResponse = await fetch(`/api/tutor-reviews?tutorId=${encodeURIComponent(tutorId)}`);
        if (reviewsResponse.ok) {
          const result = await reviewsResponse.json() as { reviews: TutorReview[] };
          setReviews(result.reviews);
        }
      })
      .catch((reason: Error) => setNotice(reason.message));
  }, [path]);

  async function enquire(event: FormEvent) {
    event.preventDefault();
    if (!data?.tutors[0] || !supabase || busy) return;
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) {
      const returnTo = `/schools/${data.school.slug}/tutors/${data.tutors[0].slug}#enquire`;
      location.href = `/login?next=${encodeURIComponent(returnTo)}`;
      return;
    }
    setBusy(true);
    setNotice("");
    const response = await fetch("/api/tutor-inquiries", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        tutorId: data.tutors[0].id,
        slotId: selectedSlotId || null,
        subject,
        message,
        preferredTimes,
        contactPreference,
        phoneNumber,
      }),
    });
    const result = await response.json();
    setNotice(response.ok
      ? selectedSlotId
        ? `Your appointment request was sent to ${result.tutorName}. Track confirmation in My tutoring.`
        : `Your enquiry was sent to ${result.tutorName}. The tutor or academy will reply using your preferred method.`
      : result.error || "Your enquiry could not be sent.");
    if (response.ok) {
      setSubject("");
      setMessage("");
      setPreferredTimes("");
      setPhoneNumber("");
      setSelectedSlotId("");
    }
    setBusy(false);
  }

  if (!data) return <main className="system-loading"><div><b>NorthStarLabs</b><p>{notice || "Opening tutor profile..."}</p>{notice && <Link href={`/schools/${path.slug}/tutors`}>Back to tutors</Link>}</div></main>;
  const tutor = data.tutors[0];
  const style = {
    "--school-primary": data.school.primaryColor,
    "--school-accent": data.school.accentColor,
    "--blue": data.school.primaryColor,
    "--acid": data.school.accentColor,
  } as CSSProperties;

  return <main className="tutor-profile-page" style={style}>
    <header className="tutor-public-nav">
      <Link href={`/schools/${data.school.slug}`}>
        {data.school.logoUrl ? <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.school.logoUrl} alt="" />
        </> : <span>{data.school.name.slice(0, 2).toUpperCase()}</span>}
        <b>{data.school.name}</b>
      </Link>
      <nav>
        <Link href={`/schools/${data.school.slug}/tutors`}>All tutors</Link>
        {signedIn ? <>
          <Link href="/learn">My learning</Link>
          <Link href="/tutoring">Coaching requests</Link>
          <Link href="/account">Account</Link>
        </> : <Link href={`/login?next=${encodeURIComponent(`/schools/${data.school.slug}/tutors/${tutor.slug}`)}`}>Sign in</Link>}
      </nav>
    </header>

    <section className="tutor-profile-hero">
      <div className="tutor-profile-identity">
        {tutor.photoUrl ? <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={tutor.photoUrl} alt="" />
        </> : <span>{tutor.displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>}
        <div><p className="sys-kicker">{tutor.verified ? tutor.verifiedCredentialCount > 0 ? `[OK] VERIFIED - ${tutor.verifiedCredentialCount} APPROVED ${tutor.verifiedCredentialCount === 1 ? "CREDENTIAL" : "CREDENTIALS"}` : "[OK] VERIFIED PROFILE" : `COACH OR TUTOR AT ${data.school.name.toUpperCase()}`}</p><h1>{tutor.displayName}</h1><p>{tutor.headline}</p>{tutor.reviewCount > 0 && <div className="tutor-profile-rating"><b>{tutor.averageRating} *</b><span>{tutor.reviewCount} verified-session {tutor.reviewCount === 1 ? "review" : "reviews"}</span></div>}</div>
      </div>
      <aside className="tutor-book-card">
        <small>ONE-TO-ONE SESSION</small>
        <strong>{tutor.priceCents ? `R${(tutor.priceCents / 100).toLocaleString("en-ZA")}` : "Ask for price"}</strong>
        {tutor.priceCents > 0 && <span>per {tutor.priceUnit}</span>}
        <dl>
          <div><dt>Format</dt><dd>{tutor.sessionMode.replaceAll("_", " ")}</dd></div>
          {tutor.location && <div><dt>Location</dt><dd>{tutor.location}</dd></div>}
          {tutor.availability && <div><dt>Availability</dt><dd>{tutor.availability}</dd></div>}
        </dl>
        <a className="tutor-primary-action" href="#enquire">{data.slots.length ? "Choose an appointment" : "Ask about a session"}</a>
        {tutor.showDirectContact && <div className="tutor-direct-actions">
          {tutor.phoneNumber && <a href={`tel:${tutor.phoneNumber}`}>Call tutor</a>}
          {tutor.whatsappNumber && <a href={whatsappLink(tutor.whatsappNumber)} target="_blank" rel="noreferrer">WhatsApp</a>}
          {tutor.bookingUrl && <a href={tutor.bookingUrl} target="_blank" rel="noreferrer">Open calendar</a>}
        </div>}
        <p>Session details and payment are agreed directly with the tutor.</p>
      </aside>
    </section>

    <section className="tutor-profile-body">
      <article>
        <p className="sys-kicker">ABOUT YOUR TUTOR</p>
        <h2>Personal help, shaped around your goal.</h2>
        <p className="tutor-bio">{tutor.bio || `${tutor.displayName} offers one-to-one support through ${data.school.name}.`}</p>
        <div className="tutor-profile-subjects">{tutor.subjects.map((item) => <span key={item}>{item}</span>)}</div>
        <dl className="tutor-profile-facts">
          <div><dt>Experience</dt><dd>{tutor.experienceYears ? `${tutor.experienceYears}+ years` : "Academy-listed tutor"}</dd></div>
          <div><dt>Languages</dt><dd>{tutor.languages.length ? tutor.languages.join(", ") : "Ask the tutor"}</dd></div>
          <div><dt>Timezone</dt><dd>{tutor.timezone}</dd></div>
        </dl>
        {tutor.qualifications && <section className="tutor-qualifications"><p className="sys-kicker">QUALIFICATIONS & EXPERIENCE</p><p>{tutor.qualifications}</p></section>}
        <section className="tutor-review-section">
          <div><p className="sys-kicker">VERIFIED LEARNER PROOF</p><h2>{reviews.length ? "What learners experienced." : "Reviews will appear after completed sessions."}</h2><p>Only learners connected to a completed NorthstarLabs session can publish a review.</p></div>
          {reviews.length > 0 && <div>{reviews.map((review) => <article key={review.id}>
            <header><strong>{"*".repeat(review.rating)}{"*".repeat(5 - review.rating)}</strong><span>[OK] VERIFIED SESSION</span></header>
            {review.tags.length > 0 && <div className="tutor-review-tags">{review.tags.map((tag) => <span key={tag}>{reviewTagLabels[tag] || tag.replaceAll("_", " ")}</span>)}</div>}
            {review.comment && <blockquote>{review.comment}</blockquote>}
            <footer><b>{review.reviewerName}</b><time>{new Date(review.createdAt).toLocaleDateString("en-ZA", { month: "short", year: "numeric" })}</time></footer>
          </article>)}</div>}
        </section>
      </article>

      <form className="tutor-enquiry-form" id="enquire" onSubmit={enquire}>
        <p className="sys-kicker">{data.slots.length ? "CHOOSE A TIME" : "REQUEST A SESSION"}</p>
        <h2>{data.slots.length ? `Book time with ${tutor.displayName}.` : `Ask ${tutor.displayName} about a session.`}</h2>
        <p>Your request goes privately to the coach and academy. You can track every update in My coaching.</p>
        {notice && <div className="notice" role="status">{notice}</div>}
        {notice.startsWith("Your ") && <Link className="tutor-track-request" href="/tutoring">Open My coaching {"\u2192"}</Link>}
        <fieldset className="tutor-slot-picker">
          <legend>Choose an available appointment</legend>
          {data.slots.length ? <div>
            {data.slots.slice(0, 12).map((slot) => <button
              className={selectedSlotId === slot.id ? "active" : ""}
              key={slot.id}
              onClick={() => setSelectedSlotId(slot.id)}
              type="button"
            >
              <b>{new Date(slot.startsAt).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })}</b>
              <span>{new Date(slot.startsAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })} - {slot.sessionMode.replaceAll("_", " ")}</span>
            </button>)}
          </div> : <p>No published times right now. Send a general enquiry and suggest what works for you.</p>}
          {selectedSlotId && <button className="tutor-slot-clear" type="button" onClick={() => setSelectedSlotId("")}>Choose timing later instead</button>}
        </fieldset>
        <label>What do you need help with?<input required minLength={2} maxLength={160} value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Grade 11 Mathematics exam preparation" /></label>
        <label>Tell the tutor a little more<textarea required minLength={10} maxLength={2000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="The topics, level and outcome you are working towards." /></label>
        <label>{selectedSlotId ? "Alternative timing note (optional)" : "Preferred days or times"}<textarea maxLength={500} value={preferredTimes} onChange={(event) => setPreferredTimes(event.target.value)} placeholder="Weekdays after 16:00, ideally Tuesday or Thursday." /></label>
        <div className="tutor-enquiry-row">
          <label>How should the tutor reply?<select value={contactPreference} onChange={(event) => setContactPreference(event.target.value)}><option value="email">Email</option><option value="phone">Phone call</option><option value="whatsapp">WhatsApp</option></select></label>
          <label>Phone number{contactPreference === "email" && " (optional)"}<input required={contactPreference !== "email"} type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="+264 81 000 0000" /></label>
        </div>
        <button className="tutor-primary-action" disabled={busy}>{busy ? "Sending request..." : selectedSlotId ? "Request this appointment" : "Send session request"}</button>
        <small>By sending this request, you agree that the tutor and academy may contact you about this session.</small>
      </form>
    </section>

    <footer className="tutor-public-footer">
      <Link href={`/schools/${data.school.slug}/tutors`}>Back to all tutors</Link>
      <p>NorthstarLabs provides the connection; tutors remain responsible for their services and arrangements.</p>
      <small>Powered by <Link href="/">NorthStarLabs</Link></small>
    </footer>
  </main>;
}
