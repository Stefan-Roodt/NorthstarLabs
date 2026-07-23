"use client";

import Link from "next/link";
import { type CSSProperties, FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../../../../lib/supabase-client";
import { tutorServiceMode } from "../../../../../lib/tutor-service-mode";
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

function schoolInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function inquiryDraftKey(tutorId: string) {
  return `northstar:tutor-inquiry:${tutorId}`;
}

function clearInquiryDraft(tutorId: string) {
  try {
    sessionStorage.removeItem(inquiryDraftKey(tutorId));
  } catch {
    // Storage can be unavailable in locked-down browsers; enquiry still works.
  }
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
        try {
          const stored = sessionStorage.getItem(inquiryDraftKey(tutorId));
          if (stored) {
            const draft = JSON.parse(stored) as {
              tutorId?: string;
              subject?: string;
              message?: string;
              preferredTimes?: string;
              contactPreference?: string;
              phoneNumber?: string;
              selectedSlotId?: string;
              savedAt?: number;
            };
            const savedRecently = Date.now() - Number(draft.savedAt || 0) < 2 * 60 * 60 * 1000;
            if (draft.tutorId === tutorId && savedRecently) {
              setSubject(String(draft.subject || "").slice(0, 160));
              setMessage(String(draft.message || "").slice(0, 2000));
              setPreferredTimes(String(draft.preferredTimes || "").slice(0, 500));
              setContactPreference(["email", "phone", "whatsapp"].includes(String(draft.contactPreference))
                ? String(draft.contactPreference)
                : "email");
              setPhoneNumber(String(draft.phoneNumber || "").slice(0, 80));
              setSelectedSlotId(detail.slots.some((slot) => slot.id === draft.selectedSlotId)
                ? String(draft.selectedSlotId)
                : "");
              setNotice("Your saved request is ready. Review it, then send when you are comfortable.");
            } else {
              clearInquiryDraft(tutorId);
            }
          }
        } catch {
          clearInquiryDraft(tutorId);
        }
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
      try {
        sessionStorage.setItem(inquiryDraftKey(data.tutors[0].id), JSON.stringify({
          tutorId: data.tutors[0].id,
          subject,
          message,
          preferredTimes,
          contactPreference,
          phoneNumber,
          selectedSlotId,
          savedAt: Date.now(),
        }));
      } catch {
        // Do not block sign-in when browser storage is unavailable.
      }
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
        ? `Your appointment request was sent to ${result.tutorName}. Track confirmation in My coaching.`
        : `Your enquiry was sent to ${result.tutorName}. The tutor or academy will reply using your preferred method.`
      : result.error || "Your enquiry could not be sent.");
    if (response.ok) {
      clearInquiryDraft(data.tutors[0].id);
      setSubject("");
      setMessage("");
      setPreferredTimes("");
      setPhoneNumber("");
      setSelectedSlotId("");
    }
    setBusy(false);
  }

  if (!data) return <main className="system-loading"><div><b>NorthstarLabs</b><p>{notice || "Opening tutor profile..."}</p>{notice && <Link href={`/schools/${path.slug}/tutors`}>Back to tutors</Link>}</div></main>;
  const tutor = data.tutors[0];
  const serviceMode = tutorServiceMode({
    displayName: tutor.displayName,
    availableSlotCount: data.slots.length,
  });
  const isBookable = serviceMode === "bookable";
  const isFacultySupport = serviceMode === "faculty_support";
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
        </> : <span>{schoolInitials(data.school.name)}</span>}
        <b>{data.school.name}</b>
      </Link>
      <nav>
        <Link href={`/schools/${data.school.slug}/tutors`}>All tutors</Link>
        {signedIn ? <>
          <Link href="/learn">My learning</Link>
          <Link href="/tutoring">My coaching</Link>
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
        <div><p className="sys-kicker">{tutor.verified ? tutor.verifiedCredentialCount > 0 ? `\u2713 VERIFIED - ${tutor.verifiedCredentialCount} APPROVED ${tutor.verifiedCredentialCount === 1 ? "CREDENTIAL" : "CREDENTIALS"}` : "\u2713 VERIFIED PROFILE" : `COACH OR TUTOR AT ${data.school.name.toUpperCase()}`}</p><h1>{tutor.displayName}</h1><p>{tutor.headline}</p>{tutor.reviewCount > 0 && <div className="tutor-profile-rating"><b>{tutor.averageRating} {"\u2605"}</b><span>{tutor.reviewCount} verified-session {tutor.reviewCount === 1 ? "review" : "reviews"}</span></div>}</div>
      </div>
      <aside className="tutor-book-card">
        <small>{isBookable ? "PUBLISHED APPOINTMENTS" : isFacultySupport ? "COURSE FACULTY SUPPORT" : "PRIVATE COACHING ENQUIRY"}</small>
        <strong>{tutor.priceCents ? `R${(tutor.priceCents / 100).toLocaleString("en-ZA")}` : "Rate on request"}</strong>
        {tutor.priceCents > 0 && <span>per {tutor.priceUnit}</span>}
        <dl>
          <div><dt>Format</dt><dd>{tutor.sessionMode.replaceAll("_", " ")}</dd></div>
          {tutor.location && <div><dt>Location</dt><dd>{tutor.location}</dd></div>}
          {tutor.availability && <div><dt>Availability</dt><dd>{tutor.availability}</dd></div>}
        </dl>
        <a className="tutor-primary-action" href="#enquire">{isBookable ? "Choose an appointment" : isFacultySupport ? "Ask the faculty" : "Send a private enquiry"}</a>
        {tutor.showDirectContact && <div className="tutor-direct-actions">
          {tutor.phoneNumber && <a href={`tel:${tutor.phoneNumber}`}>Call tutor</a>}
          {tutor.whatsappNumber && <a href={whatsappLink(tutor.whatsappNumber)} target="_blank" rel="noreferrer">WhatsApp</a>}
          {tutor.bookingUrl && <a href={tutor.bookingUrl} target="_blank" rel="noreferrer">Open calendar</a>}
        </div>}
        <p>{isBookable
          ? "Your chosen time is requested through NorthstarLabs. Session details and payment are agreed directly with the coach."
          : isFacultySupport
            ? "This is an academy faculty contact, not a published one-to-one appointment. The faculty will explain what support is available."
            : "No appointment times are published. Send an enquiry to agree availability, session details and payment directly."}</p>
      </aside>
    </section>

    <section className="tutor-profile-body">
      <article>
        <p className="sys-kicker">{isFacultySupport ? "ABOUT THE FACULTY" : "ABOUT YOUR COACH OR TUTOR"}</p>
        <h2>{isFacultySupport ? "Subject support from the people behind the learning." : "Personal help, shaped around your goal."}</h2>
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
            <header><strong>{"\u2605".repeat(review.rating)}{"\u2606".repeat(5 - review.rating)}</strong><span>{"\u2713"} VERIFIED SESSION</span></header>
            {review.tags.length > 0 && <div className="tutor-review-tags">{review.tags.map((tag) => <span key={tag}>{reviewTagLabels[tag] || tag.replaceAll("_", " ")}</span>)}</div>}
            {review.comment && <blockquote>{review.comment}</blockquote>}
            <footer><b>{review.reviewerName}</b><time>{new Date(review.createdAt).toLocaleDateString("en-ZA", { month: "short", year: "numeric" })}</time></footer>
          </article>)}</div>}
        </section>
      </article>

      <form className="tutor-enquiry-form" id="enquire" onSubmit={enquire}>
        <p className="sys-kicker">{isBookable ? "CHOOSE A TIME" : isFacultySupport ? "ASK THE FACULTY" : "SEND AN ENQUIRY"}</p>
        <h2>{isBookable ? `Request time with ${tutor.displayName}.` : isFacultySupport ? `Ask ${tutor.displayName} for subject support.` : `Ask ${tutor.displayName} about working together.`}</h2>
        <p>Your request goes privately to the {isFacultySupport ? "faculty and academy" : "coach and academy"}. You can track every update in My coaching.</p>
        {!signedIn && <aside className="tutor-auth-handoff">
          <b>Write your request before creating an account.</b>
          <span>If you need to sign in, NorthstarLabs will save this form in this browser and bring it back exactly where you left it.</span>
        </aside>}
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
          </div> : <p>{isFacultySupport
            ? "This faculty team has not published one-to-one appointment times. Describe the support you need and the academy will explain the appropriate next step."
            : "No appointment times are published right now. Send a general enquiry and suggest what works for you."}</p>}
          {selectedSlotId && <button className="tutor-slot-clear" type="button" onClick={() => setSelectedSlotId("")}>Choose timing later instead</button>}
        </fieldset>
        <label>What do you need help with?<input required minLength={2} maxLength={160} value={subject} onChange={(event) => setSubject(event.target.value)} placeholder={tutor.subjects.length ? `e.g. Help me understand ${tutor.subjects[0]}` : "e.g. Prepare for an important decision or assessment"} /></label>
        <label>Tell the tutor a little more<textarea required minLength={10} maxLength={2000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="The topics, level and outcome you are working towards." /></label>
        <label>{selectedSlotId ? "Alternative timing note (optional)" : "Preferred days or times"}<textarea maxLength={500} value={preferredTimes} onChange={(event) => setPreferredTimes(event.target.value)} placeholder="Weekdays after 16:00, ideally Tuesday or Thursday." /></label>
        <div className="tutor-enquiry-row">
          <label>How should the tutor reply?<select value={contactPreference} onChange={(event) => setContactPreference(event.target.value)}><option value="email">Email</option><option value="phone">Phone call</option><option value="whatsapp">WhatsApp</option></select></label>
          <label>Phone number{contactPreference === "email" && " (optional)"}<input required={contactPreference !== "email"} type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="+264 81 000 0000" /></label>
        </div>
        <button className="tutor-primary-action" disabled={busy}>{busy
          ? "Sending request..."
          : !signedIn
            ? "Continue to sign in & send"
            : selectedSlotId
              ? "Request this appointment"
              : isFacultySupport ? "Send faculty enquiry" : "Send coaching enquiry"}</button>
        <small>By sending this request, you agree that the tutor and academy may contact you about this session.</small>
      </form>
    </section>

    <footer className="tutor-public-footer">
      <Link href={`/schools/${data.school.slug}/tutors`}>Back to all tutors</Link>
      <p>NorthstarLabs provides the connection; tutors remain responsible for their services and arrangements.</p>
      <small>Powered by <Link href="/">NorthstarLabs</Link></small>
    </footer>
  </main>;
}
