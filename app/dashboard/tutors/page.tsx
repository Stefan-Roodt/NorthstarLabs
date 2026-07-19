"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

type Tutor = {
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
  contactEmail: string;
  phoneNumber: string;
  whatsappNumber: string;
  bookingUrl: string | null;
  showDirectContact: boolean;
  verified: boolean;
  status: string;
  inquiryCount: number;
  newInquiryCount: number;
};

type Inquiry = {
  id: string;
  tutorId: string;
  slotId: string | null;
  tutorName: string;
  learnerName: string;
  learnerEmail: string;
  phoneNumber: string;
  subject: string;
  message: string;
  preferredTimes: string;
  contactPreference: string;
  status: string;
  creatorNote: string;
  createdAt: number;
  startsAt: number | null;
  endsAt: number | null;
  timezone: string | null;
  sessionMode: string | null;
  meetingDetails: string | null;
  slotStatus: string | null;
};

type TutorSlot = {
  id: string;
  tutorId: string;
  tutorName: string;
  startsAt: number;
  endsAt: number;
  timezone: string;
  sessionMode: string;
  meetingDetails: string;
  status: string;
  inquiryId: string | null;
  learnerName: string | null;
  inquiryStatus: string | null;
};

type TutorData = {
  school: { id: string; slug: string; name: string };
  tutors: Tutor[];
};

type TutorDraft = {
  displayName: string;
  headline: string;
  bio: string;
  subjects: string;
  languages: string;
  qualifications: string;
  experienceYears: string;
  priceRand: string;
  priceUnit: string;
  sessionMode: string;
  location: string;
  timezone: string;
  availability: string;
  photoUrl: string;
  contactEmail: string;
  phoneNumber: string;
  whatsappNumber: string;
  bookingUrl: string;
  showDirectContact: boolean;
};

const emptyDraft: TutorDraft = {
  displayName: "",
  headline: "",
  bio: "",
  subjects: "",
  languages: "",
  qualifications: "",
  experienceYears: "0",
  priceRand: "0",
  priceUnit: "hour",
  sessionMode: "online",
  location: "",
  timezone: "Africa/Johannesburg",
  availability: "",
  photoUrl: "",
  contactEmail: "",
  phoneNumber: "",
  whatsappNumber: "",
  bookingUrl: "",
  showDirectContact: false,
};

function list(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export default function TutorAdminPage() {
  const supabase = getSupabaseBrowser();
  const [data, setData] = useState<TutorData | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [slots, setSlots] = useState<TutorSlot[]>([]);
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState<TutorDraft>(emptyDraft);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("Opening your tutor desk…");
  const [busy, setBusy] = useState("");
  const [slotTutorId, setSlotTutorId] = useState("");
  const [slotStarts, setSlotStarts] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [repeatWeeks, setRepeatWeeks] = useState("1");
  const [slotMode, setSlotMode] = useState("online");
  const [slotTimezone, setSlotTimezone] = useState("Africa/Johannesburg");
  const [meetingDetails, setMeetingDetails] = useState("");

  const token = useCallback(async () => {
    return (await supabase?.auth.getSession())?.data.session?.access_token || "";
  }, [supabase]);

  const authed = useCallback(async (path: string, init?: RequestInit) => {
    const accessToken = await token();
    return fetch(path, {
      ...init,
      headers: {
        ...(init?.body ? { "content-type": "application/json" } : {}),
        authorization: `Bearer ${accessToken}`,
        ...(init?.headers || {}),
      },
    });
  }, [token]);

  const load = useCallback(async () => {
    if (!supabase) return;
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      location.href = "/login?next=/dashboard/tutors";
      return;
    }
    const [tutorsResponse, inquiriesResponse, slotsResponse] = await Promise.all([
      authed("/api/tutors"),
      authed("/api/tutor-inquiries"),
      authed("/api/tutor-slots"),
    ]);
    if (tutorsResponse.ok) {
      const tutorData = await tutorsResponse.json() as TutorData;
      setData(tutorData);
      setSlotTutorId((current) => current || tutorData.tutors[0]?.id || "");
      setMessage("");
    } else {
      setMessage("Your tutor desk could not be loaded.");
    }
    if (inquiriesResponse.ok) {
      const result = await inquiriesResponse.json() as { inquiries: Inquiry[] };
      setInquiries(result.inquiries);
      setNotes(Object.fromEntries(result.inquiries.map((inquiry) => [inquiry.id, inquiry.creatorNote || ""])));
    }
    if (slotsResponse.ok) {
      const result = await slotsResponse.json() as { slots: TutorSlot[] };
      setSlots(result.slots);
    }
  }, [authed, supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const activeTutors = useMemo(
    () => data?.tutors.filter((tutor) => tutor.status === "published").length || 0,
    [data],
  );
  const newInquiries = useMemo(
    () => inquiries.filter((inquiry) => inquiry.status === "new").length,
    [inquiries],
  );

  function updateDraft<Key extends keyof TutorDraft>(key: Key, value: TutorDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function resetEditor() {
    setEditingId("");
    setDraft(emptyDraft);
  }

  function editTutor(tutor: Tutor) {
    setEditingId(tutor.id);
    setDraft({
      displayName: tutor.displayName,
      headline: tutor.headline,
      bio: tutor.bio,
      subjects: tutor.subjects.join(", "),
      languages: tutor.languages.join(", "),
      qualifications: tutor.qualifications,
      experienceYears: String(tutor.experienceYears || 0),
      priceRand: String(tutor.priceCents / 100),
      priceUnit: tutor.priceUnit,
      sessionMode: tutor.sessionMode,
      location: tutor.location,
      timezone: tutor.timezone,
      availability: tutor.availability,
      photoUrl: tutor.photoUrl || "",
      contactEmail: tutor.contactEmail,
      phoneNumber: tutor.phoneNumber,
      whatsappNumber: tutor.whatsappNumber,
      bookingUrl: tutor.bookingUrl || "",
      showDirectContact: tutor.showDirectContact,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveTutor(event: FormEvent) {
    event.preventDefault();
    setBusy("profile");
    setMessage("");
    const response = await authed("/api/tutors", {
      method: editingId ? "PATCH" : "POST",
      body: JSON.stringify({
        ...(editingId ? { id: editingId } : {}),
        displayName: draft.displayName,
        headline: draft.headline,
        bio: draft.bio,
        subjects: list(draft.subjects),
        languages: list(draft.languages),
        qualifications: draft.qualifications,
        experienceYears: Number(draft.experienceYears || 0),
        priceCents: Math.round(Math.max(0, Number(draft.priceRand || 0)) * 100),
        priceUnit: draft.priceUnit,
        sessionMode: draft.sessionMode,
        location: draft.location,
        timezone: draft.timezone,
        availability: draft.availability,
        photoUrl: draft.photoUrl,
        contactEmail: draft.contactEmail,
        phoneNumber: draft.phoneNumber,
        whatsappNumber: draft.whatsappNumber,
        bookingUrl: draft.bookingUrl,
        showDirectContact: draft.showDirectContact,
      }),
    });
    const result = await response.json();
    setMessage(response.ok
      ? editingId ? "Tutor profile updated." : "Tutor profile created as a private draft."
      : result.error || "The tutor profile could not be saved.");
    if (response.ok) {
      resetEditor();
      await load();
    }
    setBusy("");
  }

  async function setStatus(tutor: Tutor, status: "published" | "draft" | "paused") {
    setBusy(tutor.id);
    const response = await authed("/api/tutors", {
      method: "PATCH",
      body: JSON.stringify({ id: tutor.id, status }),
    });
    const result = await response.json();
    setMessage(response.ok
      ? status === "published"
        ? `${tutor.displayName} is now visible in the academy tutor directory.`
        : status === "paused"
          ? `${tutor.displayName} is hidden while unavailable.`
          : `${tutor.displayName} returned to draft.`
      : result.error || "The tutor status could not be changed.");
    await load();
    setBusy("");
  }

  async function archiveTutor(tutor: Tutor) {
    if (!confirm(`Archive ${tutor.displayName}? Existing enquiries remain in your records.`)) return;
    setBusy(tutor.id);
    const response = await authed(`/api/tutors?id=${encodeURIComponent(tutor.id)}`, { method: "DELETE" });
    const result = await response.json();
    setMessage(response.ok ? "Tutor archived." : result.error || "The tutor could not be archived.");
    await load();
    setBusy("");
  }

  async function updateInquiry(inquiry: Inquiry, status: string) {
    setBusy(inquiry.id);
    const response = await authed("/api/tutor-inquiries", {
      method: "PATCH",
      body: JSON.stringify({
        id: inquiry.id,
        status,
        creatorNote: notes[inquiry.id] || "",
      }),
    });
    const result = await response.json();
    setMessage(response.ok ? `Enquiry marked ${status}.` : result.error || "The enquiry could not be updated.");
    await load();
    setBusy("");
  }

  async function createSlots(event: FormEvent) {
    event.preventDefault();
    setBusy("slots");
    setMessage("");
    const response = await authed("/api/tutor-slots", {
      method: "POST",
      body: JSON.stringify({
        tutorId: slotTutorId,
        startsAt: new Date(slotStarts).getTime(),
        durationMinutes: Number(durationMinutes),
        repeatWeeks: Number(repeatWeeks),
        timezone: slotTimezone,
        sessionMode: slotMode,
        meetingDetails,
      }),
    });
    const result = await response.json();
    setMessage(response.ok
      ? `${result.created} appointment ${result.created === 1 ? "time" : "times"} added.`
      : result.error || "The appointment times could not be added.");
    if (response.ok) {
      setSlotStarts("");
      setRepeatWeeks("1");
      await load();
    }
    setBusy("");
  }

  async function cancelSlot(slot: TutorSlot) {
    if (!confirm(`Remove ${new Date(slot.startsAt).toLocaleString("en-ZA")}?`)) return;
    setBusy(slot.id);
    const response = await authed("/api/tutor-slots", {
      method: "PATCH",
      body: JSON.stringify({ id: slot.id }),
    });
    const result = await response.json();
    setMessage(response.ok ? "Appointment time removed." : result.error || "The time could not be removed.");
    await load();
    setBusy("");
  }

  if (!data) return <main className="system-loading"><div><b>NorthStarLabs</b><p>{message}</p></div></main>;

  return <main className="tutor-admin-page">
    <header className="product-admin-top">
      <Link className="system-brand" href="/dashboard">✦ NORTHSTARLABS</Link>
      <nav>
        <Link href="/dashboard/products">Products</Link>
        <Link href="/dashboard/live">Live learning</Link>
        <Link href={`/schools/${data.school.slug}/tutors`}>Public directory</Link>
      </nav>
    </header>

    <section className="tutor-admin-hero">
      <div>
        <p className="sys-kicker">ONE-TO-ONE SERVICES</p>
        <h1>Turn expertise into personal support.</h1>
        <p>Create trusted tutor profiles, publish clear prices and availability, then manage every learner enquiry from one place.</p>
      </div>
      <dl>
        <div><dt>Visible tutors</dt><dd>{activeTutors}</dd></div>
        <div><dt>New enquiries</dt><dd>{newInquiries}</dd></div>
      </dl>
    </section>

    <section className="tutor-admin-grid">
      {message && <div className="notice tutor-admin-notice" role="status">{message}</div>}

      <form className="panel tutor-editor" onSubmit={saveTutor}>
        <div className="product-section-heading">
          <span>{editingId ? "EDIT" : "NEW"}</span>
          <div><h2>{editingId ? "Update tutor profile" : "Add a tutor"}</h2><p>Start with the information a learner needs to choose confidently.</p></div>
        </div>
        <div className="product-form-grid">
          <label>Tutor name<input required minLength={2} maxLength={100} value={draft.displayName} onChange={(event) => updateDraft("displayName", event.target.value)} placeholder="Lindiwe Mokoena" /></label>
          <label>Professional headline<input required maxLength={160} value={draft.headline} onChange={(event) => updateDraft("headline", event.target.value)} placeholder="Mathematics tutor for Grades 10–12" /></label>
          <label className="product-span-two">About the tutor<textarea maxLength={3000} value={draft.bio} onChange={(event) => updateDraft("bio", event.target.value)} placeholder="Approach, strengths and the learners this tutor helps best." /></label>
          <label>Subjects<input required value={draft.subjects} onChange={(event) => updateDraft("subjects", event.target.value)} placeholder="Mathematics, Physical Science" /><small>Separate subjects with commas.</small></label>
          <label>Languages<input value={draft.languages} onChange={(event) => updateDraft("languages", event.target.value)} placeholder="English, Afrikaans" /></label>
          <label className="product-span-two">Qualifications and experience<textarea maxLength={1200} value={draft.qualifications} onChange={(event) => updateDraft("qualifications", event.target.value)} placeholder="Degrees, teaching credentials and relevant experience." /></label>
          <label>Years of experience<input min={0} max={80} type="number" value={draft.experienceYears} onChange={(event) => updateDraft("experienceYears", event.target.value)} /></label>
          <label>Session format<select value={draft.sessionMode} onChange={(event) => updateDraft("sessionMode", event.target.value)}><option value="online">Online</option><option value="in_person">In person</option><option value="both">Online and in person</option></select></label>
          <label>Price in rand<input min={0} step="0.01" type="number" value={draft.priceRand} onChange={(event) => updateDraft("priceRand", event.target.value)} /></label>
          <label>Price per<select value={draft.priceUnit} onChange={(event) => updateDraft("priceUnit", event.target.value)}><option value="hour">Hour</option><option value="session">Session</option></select></label>
          <label>Location<input maxLength={160} value={draft.location} onChange={(event) => updateDraft("location", event.target.value)} placeholder="Windhoek or online" /></label>
          <label>Timezone<input maxLength={80} value={draft.timezone} onChange={(event) => updateDraft("timezone", event.target.value)} /></label>
          <label className="product-span-two">Availability<input maxLength={500} value={draft.availability} onChange={(event) => updateDraft("availability", event.target.value)} placeholder="Weekdays after 16:00 and Saturday mornings" /></label>
          <label className="product-span-two">Profile photo URL<input type="url" value={draft.photoUrl} onChange={(event) => updateDraft("photoUrl", event.target.value)} placeholder="https://…" /><small>Optional. Initials are used when no photograph is supplied.</small></label>
          <label>Private contact email<input required type="email" value={draft.contactEmail} onChange={(event) => updateDraft("contactEmail", event.target.value)} placeholder="tutor@example.com" /></label>
          <label>Phone number<input type="tel" value={draft.phoneNumber} onChange={(event) => updateDraft("phoneNumber", event.target.value)} placeholder="+264 81 000 0000" /></label>
          <label>WhatsApp number<input type="tel" value={draft.whatsappNumber} onChange={(event) => updateDraft("whatsappNumber", event.target.value)} placeholder="+264 81 000 0000" /></label>
          <label>Booking calendar URL<input type="url" value={draft.bookingUrl} onChange={(event) => updateDraft("bookingUrl", event.target.value)} placeholder="https://calendly.com/…" /></label>
          <label className="academy-switch product-span-two"><input type="checkbox" checked={draft.showDirectContact} onChange={(event) => updateDraft("showDirectContact", event.target.checked)} /><span><b>Show direct contact buttons publicly</b><small>When off, learners use the protected enquiry form and private contact details remain hidden.</small></span></label>
        </div>
        <div className="tutor-editor-actions">
          <button className="sys-primary" disabled={busy === "profile"}>{busy === "profile" ? "Saving…" : editingId ? "Save tutor changes" : "Create tutor draft"}</button>
          {editingId && <button type="button" onClick={resetEditor}>Cancel editing</button>}
        </div>
      </form>

      <section className="tutor-admin-section">
        <div className="product-section-heading">
          <span>LIVE</span>
          <div><h2>Your tutors</h2><p>Publish complete profiles and pause them when their availability changes.</p></div>
        </div>
        {data.tutors.length ? <div className="tutor-admin-card-grid">
          {data.tutors.map((tutor) => <article className="panel tutor-admin-card" key={tutor.id}>
            <div className="tutor-admin-card-top"><span>{tutor.displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span><i className={`status ${tutor.status}`}>{tutor.status}</i></div>
            <p className="sys-kicker">{tutor.verified ? "✓ VERIFIED" : tutor.sessionMode.replaceAll("_", " ").toUpperCase()}</p>
            <h3>{tutor.displayName}</h3>
            <p>{tutor.headline || "Add a clear professional headline before publishing."}</p>
            <div className="tutor-admin-tags">{tutor.subjects.slice(0, 4).map((subject) => <span key={subject}>{subject}</span>)}</div>
            <dl><div><dt>Price</dt><dd>{tutor.priceCents ? `R${(tutor.priceCents / 100).toLocaleString("en-ZA")}/${tutor.priceUnit}` : "Not set"}</dd></div><div><dt>Enquiries</dt><dd>{tutor.inquiryCount}{tutor.newInquiryCount ? ` · ${tutor.newInquiryCount} new` : ""}</dd></div></dl>
            <div className="tutor-admin-actions">
              <button onClick={() => editTutor(tutor)}>Edit</button>
              {tutor.status !== "published" && <button className="sys-primary" disabled={busy === tutor.id} onClick={() => setStatus(tutor, "published")}>Publish</button>}
              {tutor.status === "published" && <Link href={`/schools/${data.school.slug}/tutors/${tutor.slug}`}>View public</Link>}
              {tutor.status === "published" && <button onClick={() => setStatus(tutor, "paused")}>Pause</button>}
              {tutor.status === "paused" && <button onClick={() => setStatus(tutor, "draft")}>Return to draft</button>}
              <button className="danger-text" onClick={() => archiveTutor(tutor)}>Archive</button>
            </div>
          </article>)}
        </div> : <article className="panel product-empty"><h3>No tutor profiles yet</h3><p>Add the first tutor above. Profiles stay private until you publish them.</p></article>}
      </section>

      <section className="tutor-admin-section" id="availability">
        <div className="product-section-heading">
          <span>CALENDAR</span>
          <div><h2>Bookable appointment times</h2><p>Offer exact times, prevent double-booking and keep joining details private until you confirm.</p></div>
        </div>
        <div className="tutor-slot-manager">
          <form className="panel tutor-slot-form" onSubmit={createSlots}>
            <label>Tutor
              <select required value={slotTutorId} onChange={(event) => setSlotTutorId(event.target.value)}>
                <option value="">Choose a tutor</option>
                {data.tutors.map((tutor) => <option key={tutor.id} value={tutor.id}>{tutor.displayName}</option>)}
              </select>
            </label>
            <label>First date and time<input required type="datetime-local" value={slotStarts} onChange={(event) => setSlotStarts(event.target.value)} /></label>
            <label>Duration
              <select value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)}>
                <option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">60 minutes</option><option value="90">90 minutes</option><option value="120">2 hours</option>
              </select>
            </label>
            <label>Repeat weekly
              <select value={repeatWeeks} onChange={(event) => setRepeatWeeks(event.target.value)}>
                <option value="1">Only this time</option><option value="4">For 4 weeks</option><option value="8">For 8 weeks</option><option value="12">For 12 weeks</option>
              </select>
            </label>
            <label>Session format
              <select value={slotMode} onChange={(event) => setSlotMode(event.target.value)}>
                <option value="online">Online</option><option value="in_person">In person</option>
              </select>
            </label>
            <label>Timezone<input required value={slotTimezone} onChange={(event) => setSlotTimezone(event.target.value)} /></label>
            <label className="product-span-two">Private joining or venue details<textarea value={meetingDetails} onChange={(event) => setMeetingDetails(event.target.value)} maxLength={1000} placeholder="Video link, venue address or instructions. Learners see this only after confirmation." /></label>
            <button className="sys-primary product-span-two" disabled={busy === "slots" || !data.tutors.length}>
              {busy === "slots" ? "Adding times…" : "Add appointment times"}
            </button>
          </form>
          <div className="tutor-slot-list">
            {slots.length ? slots.map((slot) => <article className={`panel tutor-slot-card status-${slot.status}`} key={slot.id}>
              <div>
                <p className="sys-kicker">{slot.status.toUpperCase()} · {slot.sessionMode.replaceAll("_", " ").toUpperCase()}</p>
                <h3>{new Date(slot.startsAt).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })}</h3>
                <strong>{new Date(slot.startsAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}–{new Date(slot.endsAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}</strong>
                <small>{slot.tutorName} · {slot.timezone}</small>
                {slot.learnerName && <p>Requested by <b>{slot.learnerName}</b></p>}
              </div>
              {slot.status === "open"
                ? <button disabled={busy === slot.id} onClick={() => cancelSlot(slot)}>Remove time</button>
                : <span>{slot.status === "reserved" ? "Resolve the enquiry below" : "Appointment confirmed"}</span>}
            </article>) : <article className="panel product-empty"><h3>No appointment times yet</h3><p>Add a time above. It will appear on the tutor&apos;s public profile.</p></article>}
          </div>
        </div>
      </section>

      <section className="tutor-admin-section" id="inquiries">
        <div className="product-section-heading">
          <span>INBOX</span>
          <div><h2>Learner enquiries</h2><p>Contact the learner, record the outcome and keep the handover organised.</p></div>
        </div>
        {inquiries.length ? <div className="tutor-inquiry-list">
          {inquiries.map((inquiry) => <article className={`panel tutor-inquiry-card status-${inquiry.status}`} key={inquiry.id}>
            <header>
              <div><p className="sys-kicker">{inquiry.status.toUpperCase()} · FOR {inquiry.tutorName.toUpperCase()}</p><h3>{inquiry.subject}</h3></div>
              <time>{new Date(inquiry.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</time>
            </header>
            <blockquote>{inquiry.message}</blockquote>
            <dl>
              <div><dt>Learner</dt><dd>{inquiry.learnerName}</dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${inquiry.learnerEmail}`}>{inquiry.learnerEmail}</a></dd></div>
              <div><dt>Preferred contact</dt><dd>{inquiry.contactPreference}{inquiry.phoneNumber ? ` · ${inquiry.phoneNumber}` : ""}</dd></div>
              <div><dt>{inquiry.startsAt ? "Requested appointment" : "Preferred times"}</dt><dd>{inquiry.startsAt
                ? `${new Date(inquiry.startsAt).toLocaleString("en-ZA")} · ${inquiry.sessionMode?.replaceAll("_", " ")}`
                : inquiry.preferredTimes || "Not supplied"}</dd></div>
            </dl>
            {inquiry.startsAt && <p className="tutor-booking-note"><b>{inquiry.slotStatus === "booked" ? "Confirmed" : "Reserved while you decide"}:</b> {inquiry.timezone}{inquiry.status === "booked" && inquiry.meetingDetails ? ` · ${inquiry.meetingDetails}` : ""}</p>}
            <label>Private team note<textarea value={notes[inquiry.id] || ""} onChange={(event) => setNotes((current) => ({ ...current, [inquiry.id]: event.target.value }))} maxLength={1000} placeholder="What was agreed, follow-up date, or booking details." /></label>
            <div className="tutor-inquiry-actions">
              <a href={`mailto:${inquiry.learnerEmail}?subject=${encodeURIComponent(`Tutoring: ${inquiry.subject}`)}`}>Reply by email</a>
              {inquiry.phoneNumber && <a href={`tel:${inquiry.phoneNumber}`}>Call learner</a>}
              {inquiry.status === "new" && <button disabled={busy === inquiry.id} onClick={() => updateInquiry(inquiry, "contacted")}>Mark contacted</button>}
              {!["booked", "declined", "closed"].includes(inquiry.status) && <button className="sys-primary" disabled={busy === inquiry.id} onClick={() => updateInquiry(inquiry, "booked")}>{inquiry.slotId ? "Confirm booking" : "Mark booked"}</button>}
              {inquiry.slotId && !["booked", "declined", "closed"].includes(inquiry.status) && <button disabled={busy === inquiry.id} onClick={() => updateInquiry(inquiry, "declined")}>Decline time</button>}
              {!["closed", "declined"].includes(inquiry.status) && <button disabled={busy === inquiry.id} onClick={() => updateInquiry(inquiry, "closed")}>Close</button>}
            </div>
          </article>)}
        </div> : <article className="panel product-empty"><h3>No tutor enquiries yet</h3><p>Published tutors will receive protected learner enquiries here.</p></article>}
      </section>
    </section>
  </main>;
}
