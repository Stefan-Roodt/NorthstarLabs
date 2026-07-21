"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-client";

type PlatformData = {
  metrics: Record<string, number>;
  provider: { configured: boolean; sender: string | null };
  schools: Array<{ id: string; name: string; slug: string; status: string; owner: string; courses: number; members: number }>;
  users: Array<{ id: string; email: string; displayName: string; role: string; status: string; createdAt: number }>;
  messages: Array<{ id: string; recipientEmail: string; subject: string; status: string; lastError: string | null; schoolName: string | null; createdAt: number }>;
  learningRequests: Array<{
    id: string;
    requesterName: string;
    requesterEmail: string;
    requestType: string;
    topic: string;
    detail: string;
    source: string;
    status: string;
    adminNote: string;
    createdAt: number;
    updatedAt: number;
  }>;
  demandTopics: Array<{
    id: string;
    learningRequestId: string | null;
    title: string;
    summary: string;
    category: string;
    preferredFormat: string;
    status: string;
    visibility: string;
    publicNote: string;
    matchedUrl: string | null;
    score: number;
    supporters: number;
    followers: number;
    createdAt: number;
    updatedAt: number;
  }>;
  audit: Array<{ id: string; actor: string; action: string; targetType: string; schoolName: string | null; createdAt: number }>;
};
type ReliabilityData = {
  metrics: {
    openEvents: number;
    openErrors: number;
    serverErrors24h: number;
    activeRateBuckets: number;
    storedBytes: number;
    storedFiles: number;
    pendingDataRequests: number;
    openContentReports: number;
    lastBackupAt: number | null;
  };
  configuration: { automatedMaintenance: boolean; storageQuotaBytes: number };
  events: Array<{
    id: string;
    severity: string;
    source: string;
    eventType: string;
    message: string;
    requestId: string | null;
    route: string | null;
    status: string;
    createdAt: number;
  }>;
  backups: Array<{
    id: string;
    status: string;
    tableCount: number;
    rowCount: number;
    sizeBytes: number;
    failureMessage: string | null;
    createdAt: number;
    completedAt: number | null;
    verifiedAt: number | null;
  }>;
  storage: Array<{ id: string; name: string; slug: string; files: number; bytes: number }>;
  dataRequests: Array<{
    id: string;
    requestType: string;
    status: string;
    failureMessage: string | null;
    createdAt: number;
    email: string | null;
    displayName: string | null;
  }>;
  contentReports: Array<{
    id: string;
    schoolId: string;
    schoolName: string;
    postId: string;
    reason: string;
    detail: string;
    status: string;
    createdAt: number;
    reporter: string;
    author: string;
    postBody: string;
  }>;
};
type TutorTrustData = {
  metrics: {
    pendingCredentials: number;
    verifiedCredentials: number;
    verifiedProfiles: number;
    publishedReviews: number;
    learnerRatings: number;
  };
  credentials: Array<{
    id: string;
    tutorId: string;
    schoolId: string;
    title: string;
    issuer: string;
    awardedYear: number | null;
    evidenceUrl: string | null;
    status: string;
    reviewerNote: string;
    createdAt: number;
    reviewedAt: number | null;
    tutorName: string;
    headline: string;
    schoolName: string;
    submittedBy: string;
  }>;
  reviews: Array<{
    id: string;
    tutorId: string;
    schoolId: string;
    rating: number;
    comment: string;
    status: string;
    createdAt: number;
    tutorName: string;
    schoolName: string;
    reviewerName: string;
  }>;
  learnerRatings: Array<{
    id: string;
    inquiryId: string;
    tutorId: string;
    schoolId: string;
    learnerId: string;
    rating: number;
    tagsJson: string;
    privateNote: string;
    status: string;
    visibleAfter: number;
    createdAt: number;
    tutorName: string;
    schoolName: string;
    learnerName: string;
    ratedBy: string;
  }>;
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(0, Math.round(bytes / 1024))} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function ratingTags(value: string) {
  try {
    const tags = JSON.parse(value);
    return Array.isArray(tags)
      ? tags.filter((tag): tag is string => typeof tag === "string")
      : [];
  } catch {
    return [];
  }
}

export default function PlatformAdministration() {
  const [data, setData] = useState<PlatformData | null>(null);
  const [tab, setTab] = useState("Schools");
  const [message, setMessage] = useState("Checking administrator access...");
  const [busy, setBusy] = useState("");
  const [reliability, setReliability] = useState<ReliabilityData | null>(null);
  const [tutorTrust, setTutorTrust] = useState<TutorTrustData | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [demandNotes, setDemandNotes] = useState<Record<string, string>>({});
  const [demandUrls, setDemandUrls] = useState<Record<string, string>>({});
  const supabase = getSupabaseBrowser();

  const token = useCallback(async () => {
    return (await supabase?.auth.getSession())?.data.session?.access_token || "";
  }, [supabase]);

  const load = useCallback(async () => {
    const accessToken = await token();
    if (!accessToken) {
      location.href = "/login?next=/admin";
      return;
    }
    const response = await fetch("/api/platform/overview", {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Platform administration is unavailable.");
      return;
    }
    setData(result);
    setDemandNotes(Object.fromEntries((result.demandTopics || []).map((topic: PlatformData["demandTopics"][number]) => [topic.id, topic.publicNote || ""])));
    setDemandUrls(Object.fromEntries((result.demandTopics || []).map((topic: PlatformData["demandTopics"][number]) => [topic.id, topic.matchedUrl || ""])));
    setMessage("");
  }, [token]);

  useEffect(() => {
    if (!supabase) return;
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load, supabase]);

  const loadReliability = useCallback(async () => {
    const response = await fetch("/api/platform/reliability", {
      headers: { authorization: `Bearer ${await token()}` },
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Reliability information is unavailable.");
      return;
    }
    setReliability(result);
    setMessage("");
  }, [token]);

  useEffect(() => {
    if (tab !== "Reliability" || !supabase) return;
    const timeout = window.setTimeout(() => void loadReliability(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadReliability, supabase, tab]);

  const loadTutorTrust = useCallback(async () => {
    const response = await fetch("/api/platform/tutor-trust", {
      headers: { authorization: `Bearer ${await token()}` },
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Coach trust information is unavailable.");
      return;
    }
    setTutorTrust(result);
    setReviewNotes(Object.fromEntries(result.credentials.map(
      (credential: TutorTrustData["credentials"][number]) =>
        [credential.id, credential.reviewerNote || ""],
    )));
    setMessage("");
  }, [token]);

  useEffect(() => {
    if (tab !== "Coach trust" || !supabase) return;
    const timeout = window.setTimeout(() => void loadTutorTrust(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadTutorTrust, supabase, tab]);

  async function update(targetType: string, targetId: string, action: string) {
    const label = action === "suspend" ? "suspend" : action === "reactivate" ? "reactivate" : "retry";
    if (label !== "retry" && !confirm(`${label[0].toUpperCase()}${label.slice(1)} this ${targetType}?`)) return;
    setBusy(targetId);
    const response = await fetch("/api/platform/overview", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ targetType, targetId, action }),
    });
    const result = await response.json();
    setBusy("");
    setMessage(response.ok ? "Administration action completed." : result.error || "Action failed.");
    if (response.ok) await load();
  }

  async function reliabilityAction(
    action: string,
    extra: Record<string, unknown> = {},
  ) {
    setBusy(`${action}-${String(extra.backupId || extra.eventId || "")}`);
    setMessage(action === "backup" ? "Creating a protected platform backup..." : "Running reliability action...");
    const response = await fetch("/api/platform/reliability", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ action, ...extra }),
    });
    const result = await response.json();
    setBusy("");
    setMessage(response.ok
      ? action === "backup"
        ? "Backup completed and stored securely."
        : action === "verify"
          ? "Backup integrity verified."
          : "Reliability action completed."
      : result.error || "Reliability action failed.");
    if (response.ok) await loadReliability();
  }

  async function demandAction(topicId: string, action: string) {
    const topic = data?.demandTopics.find((item) => item.id === topicId);
    if (!topic) return;
    if (action === "released" && !demandUrls[topicId]?.trim()) {
      setMessage("Add the public course, coach, or live-learning URL before marking this topic available.");
      return;
    }
    setBusy(`demand-${topicId}`);
    const response = await fetch("/api/platform/overview", {
      method: "PATCH",
      headers: { "content-type": "application/json", authorization: `Bearer ${await token()}` },
      body: JSON.stringify({ targetType: "demand_topic", targetId: topicId, action, note: demandNotes[topicId] || "", url: demandUrls[topicId] || "" }),
    });
    const result = await response.json();
    setMessage(response.ok ? `Demand topic updated to ${action}. Followers were notified where appropriate.` : result.error || "Demand topic update failed.");
    if (response.ok) await load();
    setBusy("");
  }

  async function reviewCredential(credentialId: string, status: "verified" | "rejected") {
    setBusy(credentialId);
    const response = await fetch("/api/platform/tutor-trust", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({
        credentialId,
        status,
        reviewerNote: reviewNotes[credentialId] || "",
      }),
    });
    const result = await response.json();
    setMessage(response.ok
      ? status === "verified"
        ? "Credential verified and the coach trust badge updated."
        : "Credential rejected with the review note saved."
      : result.error || "Credential review failed.");
    if (response.ok) await loadTutorTrust();
    setBusy("");
  }

  async function moderateTutorReview(reviewId: string, status: "hidden" | "published") {
    setBusy(reviewId);
    const response = await fetch("/api/platform/tutor-trust", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ reviewId, status }),
    });
    const result = await response.json();
    setMessage(response.ok
      ? status === "hidden" ? "Review hidden from public profiles." : "Review republished."
      : result.error || "Review moderation failed.");
    if (response.ok) await loadTutorTrust();
    setBusy("");
  }

  async function moderateLearnerRating(
    learnerRatingId: string,
    status: "hidden" | "published",
  ) {
    setBusy(learnerRatingId);
    const response = await fetch("/api/platform/tutor-trust", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await token()}`,
      },
      body: JSON.stringify({ learnerRatingId, status }),
    });
    const result = await response.json();
    setMessage(response.ok
      ? status === "hidden"
        ? "Learner rating removed from the private aggregate."
        : "Learner rating restored to the private aggregate."
      : result.error || "Learner-rating moderation failed.");
    if (response.ok) await loadTutorTrust();
    setBusy("");
  }

  if (!data) return <main className="system-loading"><div><b>Platform administration</b><p>{message}</p>{message.includes("required") && <Link href="/">Return home</Link>}</div></main>;

  return <main className="platform-admin">
    <aside>
      <Link className="system-brand" href="/">✦ NORTHSTARLABS</Link>
      <p>PLATFORM ADMIN</p>
      <nav>{["Schools", "Users", "Requests", "Email", "Coach trust", "Reliability", "Audit"].map((item) =>
        <button className={tab === item ? "active" : ""} key={item} onClick={() => setTab(item)}>{item}</button>
      )}</nav>
      <Link href="/dashboard">Creator workspace</Link>
    </aside>
    <section>
      <header><div><p className="sys-kicker">OPERATIONS & CONTROL</p><h1>{tab}</h1></div><span className={data.provider.configured ? "admin-healthy" : "admin-warning"}>{data.provider.configured ? "Email connected" : "Email setup needed"}</span></header>
      {message && <div className="notice">{message}</div>}
      <div className="platform-metrics">
        <article><span>Active schools</span><strong>{data.metrics.activeSchools || 0}</strong><small>{data.metrics.schools || 0} total</small></article>
        <article><span>Members</span><strong>{data.metrics.users || 0}</strong><small>{data.metrics.suspendedUsers || 0} suspended</small></article>
        <article><span>Published courses</span><strong>{data.metrics.publishedCourses || 0}</strong><small>{data.metrics.activeEnrollments || 0} active enrolments</small></article>
        <article><span>Prospect requests</span><strong>{data.metrics.openLearningRequests || 0}</strong><small>Need a course or coach match</small></article>
      </div>

      {tab === "Schools" && <article className="platform-panel">
        <div className="platform-table platform-school-table"><b>School</b><b>Owner</b><b>Usage</b><b>Status</b><b>Action</b>
          {data.schools.map((school) => <div className="platform-row" key={school.id}>
            <div><strong>{school.name}</strong><small>/{school.slug}</small></div>
            <span>{school.owner}</span>
            <span>{school.courses} courses · {school.members} members</span>
            <span className={`delivery-status ${school.status}`}>{school.status}</span>
            <button disabled={busy === school.id} onClick={() => update("school", school.id, school.status === "active" ? "suspend" : "reactivate")}>{school.status === "active" ? "Suspend" : "Reactivate"}</button>
          </div>)}
        </div>
      </article>}

      {tab === "Users" && <article className="platform-panel">
        <div className="platform-table platform-user-table"><b>Member</b><b>Role</b><b>Joined</b><b>Status</b><b>Action</b>
          {data.users.map((user) => <div className="platform-row" key={user.id}>
            <div><strong>{user.displayName}</strong><small>{user.email}</small></div>
            <span>{user.role}</span>
            <span>{new Date(user.createdAt).toLocaleDateString("en-ZA")}</span>
            <span className={`delivery-status ${user.status}`}>{user.status}</span>
            <button disabled={busy === user.id} onClick={() => update("user", user.id, user.status === "active" ? "suspend" : "reactivate")}>{user.status === "active" ? "Suspend" : "Reactivate"}</button>
          </div>)}
        </div>
      </article>}

      {tab === "Requests" && <article className="platform-panel">
        <div className="operations-heading">
          <div><p className="sys-kicker">UNMET LEARNING DEMAND</p><h2>Find the right course, coach, or expert</h2></div>
          <span>{data.demandTopics.filter((item) => item.visibility === "pending").length} awaiting publication</span>
        </div>
        <section className="demand-admin-section">
          <header><div><p className="sys-kicker">PUBLIC DEMAND BOARD</p><h3>Turn private need into a visible, honest roadmap</h3><p>Moderate the public wording, explain decisions, and link a real course, coach, or live programme before marking anything available.</p></div><Link href="/demand">Open public board →</Link></header>
          <div className="demand-admin-list">{data.demandTopics.length ? data.demandTopics.map((item) => <article key={item.id}>
            <header><div><span className={`delivery-status ${item.visibility}`}>{item.visibility}</span><span className={`delivery-status ${item.status}`}>{item.status}</span></div><div><b>{item.score} score</b><small>{item.supporters} supporting · {item.followers} following</small></div></header>
            <p className="sys-kicker">{item.category.toUpperCase()} · {item.preferredFormat.toUpperCase()}</p><h4>{item.title}</h4><p>{item.summary}</p>
            <label>Public Northstar update<textarea maxLength={1_000} value={demandNotes[item.id] || ""} onChange={(event) => setDemandNotes((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Explain the decision, current research, or what must happen next." /></label>
            <label>Matched public URL<input maxLength={500} value={demandUrls[item.id] || ""} onChange={(event) => setDemandUrls((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="/courses/... or https://..." /></label>
            <footer><small>Submitted {new Date(item.createdAt).toLocaleDateString("en-ZA")}</small><div>
              {item.visibility !== "published" && <button className="sys-primary" disabled={busy === `demand-${item.id}`} onClick={() => void demandAction(item.id, "publish")}>Publish to board</button>}
              {item.visibility === "published" && <button disabled={busy === `demand-${item.id}`} onClick={() => void demandAction(item.id, "hide")}>Hide</button>}
              {item.status !== "open" && <button disabled={busy === `demand-${item.id}`} onClick={() => void demandAction(item.id, "open")}>Open</button>}
              {item.status !== "planned" && <button disabled={busy === `demand-${item.id}`} onClick={() => void demandAction(item.id, "planned")}>Plan</button>}
              {item.status !== "building" && <button disabled={busy === `demand-${item.id}`} onClick={() => void demandAction(item.id, "building")}>Building</button>}
              {item.status !== "released" && <button className="sys-primary" disabled={busy === `demand-${item.id}`} onClick={() => void demandAction(item.id, "released")}>Mark available</button>}
              {item.status !== "declined" && <button disabled={busy === `demand-${item.id}`} onClick={() => void demandAction(item.id, "declined")}>Decline honestly</button>}
            </div></footer>
          </article>) : <p>No Demand Board topics yet.</p>}</div>
        </section>
        <div className="operations-heading private-request-heading"><div><p className="sys-kicker">PRIVATE REQUEST DETAILS</p><h3>Contact and match queue</h3></div><span>{data.learningRequests.filter((item) => ["new", "reviewing"].includes(item.status)).length} open</span></div>
        <div className="learning-request-admin-list">{data.learningRequests.length
          ? data.learningRequests.map((item) => <section key={item.id}>
            <header>
              <div><p className="sys-kicker">{item.requestType.toUpperCase()} REQUEST</p><h3>{item.topic}</h3><span>{item.requesterName} · {item.requesterEmail} · from {item.source.replaceAll("-", " ")}</span></div>
              <span className={`delivery-status ${item.status}`}>{item.status}</span>
            </header>
            <p>{item.detail}</p>
            <footer>
              <small>Received {new Date(item.createdAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</small>
              <div>
                <a href={`mailto:${item.requesterEmail}?subject=${encodeURIComponent(`Your NorthstarLabs request: ${item.topic}`)}`}>Reply by email</a>
                {item.status === "new" && <button disabled={busy === item.id} onClick={() => update("learning_request", item.id, "reviewing")}>Start review</button>}
                {!["matched", "closed"].includes(item.status) && <button className="sys-primary" disabled={busy === item.id} onClick={() => update("learning_request", item.id, "matched")}>Mark matched</button>}
                {item.status !== "closed" && <button disabled={busy === item.id} onClick={() => update("learning_request", item.id, "closed")}>Close</button>}
              </div>
            </footer>
          </section>)
          : <p>No prospective user requests have arrived yet.</p>}
        </div>
      </article>}

      {tab === "Email" && <article className="platform-panel">
        <div className="operations-heading"><div><p className="sys-kicker">PROVIDER & QUEUE</p><h2>{data.provider.configured ? `Sending from ${data.provider.sender}` : "Connect Resend to deliver queued messages"}</h2></div></div>
        <div className="delivery-list">{data.messages.map((item) => <div className="delivery-row" key={item.id}>
          <div><b>{item.subject}</b><small>{item.schoolName || "Platform"} · {item.recipientEmail}</small></div>
          <span className={`delivery-status ${item.status}`}>{item.status.replaceAll("_", " ")}</span>
          <small>{new Date(item.createdAt).toLocaleString("en-ZA", { dateStyle: "short", timeStyle: "short" })}</small>
          {item.status !== "sent" && <button disabled={busy === item.id} onClick={() => update("email", item.id, "retry")}>Retry</button>}
          {item.lastError && <p>{item.lastError}</p>}
        </div>)}</div>
      </article>}

      {tab === "Coach trust" && <article className="platform-panel tutor-trust-admin">
        {!tutorTrust ? <div className="empty-activity"><strong>Loading credential reviews...</strong></div> : <>
          <div className="operations-heading">
            <div><p className="sys-kicker">INDEPENDENT REVIEW</p><h2>Coach credentials and learner proof</h2><p>Advertising plans never affect verification. Review evidence consistently and leave a useful note when rejecting a submission.</p></div>
          </div>
          <div className="reliability-metrics">
            <div><span>Awaiting review</span><strong>{tutorTrust.metrics.pendingCredentials || 0}</strong><small>Credential submissions</small></div>
            <div><span>Verified credentials</span><strong>{tutorTrust.metrics.verifiedCredentials || 0}</strong><small>Across all coach profiles</small></div>
            <div><span>Verified profiles</span><strong>{tutorTrust.metrics.verifiedProfiles || 0}</strong><small>At least one approved credential</small></div>
            <div><span>Verified reviews</span><strong>{tutorTrust.metrics.publishedReviews || 0}</strong><small>From completed sessions</small></div>
            <div><span>Private learner ratings</span><strong>{tutorTrust.metrics.learnerRatings || 0}</strong><small>Eligible for protected aggregates</small></div>
          </div>
          <div className="tutor-trust-list">
            {tutorTrust.credentials.length ? tutorTrust.credentials.map((credential) => <section key={credential.id}>
              <header>
                <div><p className="sys-kicker">{credential.schoolName.toUpperCase()}</p><h3>{credential.tutorName}</h3><span>{credential.headline}</span></div>
                <span className={`delivery-status ${credential.status}`}>{credential.status}</span>
              </header>
              <dl><div><dt>Credential</dt><dd>{credential.title}</dd></div><div><dt>Issuer</dt><dd>{credential.issuer}</dd></div><div><dt>Year</dt><dd>{credential.awardedYear || "Not supplied"}</dd></div><div><dt>Submitted by</dt><dd>{credential.submittedBy}</dd></div></dl>
              {credential.evidenceUrl ? <a href={credential.evidenceUrl} target="_blank" rel="noreferrer">Open private evidence ↗</a> : <p className="admin-warning-copy">No evidence URL was supplied. Verify directly with the issuing organisation before approval.</p>}
              <label>Review note<textarea value={reviewNotes[credential.id] || ""} onChange={(event) => setReviewNotes((current) => ({ ...current, [credential.id]: event.target.value }))} maxLength={1000} placeholder="What was checked, or what the coach needs to correct." /></label>
              <footer>
                <small>Submitted {new Date(credential.createdAt).toLocaleDateString("en-ZA")}</small>
                <div><button disabled={busy === credential.id} onClick={() => reviewCredential(credential.id, "rejected")}>Reject</button><button className="sys-primary" disabled={busy === credential.id} onClick={() => reviewCredential(credential.id, "verified")}>Verify credential</button></div>
              </footer>
            </section>) : <p>No credentials have been submitted yet.</p>}
          </div>
          <section className="tutor-review-moderation">
            <div className="operations-heading"><div><p className="sys-kicker">VERIFIED-SESSION REVIEWS</p><h2>Review moderation</h2><p>Reviews are tied to completed sessions. Hide only content that breaches platform standards; do not remove fair criticism.</p></div><span>{tutorTrust.reviews.filter((review) => review.status === "published").length} public</span></div>
            <div>{tutorTrust.reviews.length ? tutorTrust.reviews.map((review) => <article key={review.id}>
              <header><div><b>{review.rating} ★ · {review.tutorName}</b><small>{review.schoolName} · {review.reviewerName} · {new Date(review.createdAt).toLocaleDateString("en-ZA")}</small></div><span className={`delivery-status ${review.status}`}>{review.status}</span></header>
              <p>{review.comment || "Rating submitted without a written comment."}</p>
              <button disabled={busy === review.id} onClick={() => moderateTutorReview(review.id, review.status === "published" ? "hidden" : "published")}>{review.status === "published" ? "Hide review" : "Republish review"}</button>
            </article>) : <p>No completed-session reviews have been published yet.</p>}</div>
          </section>
          <section className="tutor-review-moderation">
            <div className="operations-heading"><div><p className="sys-kicker">COACH-TO-LEARNER RATINGS</p><h2>Private reputation safeguards</h2><p>These ratings are never public. Moderate only abuse or demonstrably unfair feedback; private notes must not be shared with other coaches.</p></div><span>{tutorTrust.learnerRatings.length} submitted</span></div>
            <div>{tutorTrust.learnerRatings.length ? tutorTrust.learnerRatings.map((rating) => <article key={rating.id}>
              <header><div><b>{rating.rating} ★ · {rating.learnerName}</b><small>{rating.schoolName} · Coach: {rating.tutorName} · Rated by {rating.ratedBy} · {new Date(rating.createdAt).toLocaleDateString("en-ZA")}</small></div><span className={`delivery-status ${rating.status}`}>{rating.status}</span></header>
              {ratingTags(rating.tagsJson).length > 0 && <p>{ratingTags(rating.tagsJson).map((tag) => tag.replaceAll("_", " ")).join(" · ")}</p>}
              {rating.privateNote && <blockquote><b>Private academy note:</b> {rating.privateNote}</blockquote>}
              <button disabled={busy === rating.id} onClick={() => moderateLearnerRating(rating.id, rating.status === "hidden" ? "published" : "hidden")}>{rating.status === "hidden" ? "Restore rating" : "Remove from aggregate"}</button>
            </article>) : <p>No coach-to-learner ratings have been submitted yet.</p>}</div>
          </section>
        </>}
      </article>}

      {tab === "Reliability" && <article className="platform-panel reliability-panel">
        {!reliability ? <div className="empty-activity"><strong>Loading reliability controls...</strong></div> : <>
          <div className="reliability-heading">
            <div><p className="sys-kicker">HEALTH, SECURITY & RECOVERY</p><h2>Production reliability</h2><p>Monitor errors, verify backups, review storage usage, and keep temporary security data clean.</p></div>
            <div>
              <button className="sys-primary" disabled={Boolean(busy)} onClick={() => reliabilityAction("backup")}>Create backup</button>
              <button disabled={Boolean(busy)} onClick={() => reliabilityAction("prune")}>Run cleanup</button>
            </div>
          </div>
          <div className="reliability-metrics">
            <div><span>Open errors</span><strong>{reliability.metrics.openErrors || 0}</strong><small>{reliability.metrics.serverErrors24h || 0} server errors in 24 hours</small></div>
            <div><span>Last backup</span><strong className="metric-word">{reliability.metrics.lastBackupAt ? new Date(reliability.metrics.lastBackupAt).toLocaleDateString("en-ZA") : "None"}</strong><small>{reliability.configuration.automatedMaintenance ? "Automation key configured" : "Automation setup needed"}</small></div>
            <div><span>Stored media</span><strong className="metric-word">{formatBytes(reliability.metrics.storedBytes || 0)}</strong><small>{reliability.metrics.storedFiles || 0} files</small></div>
            <div><span>Needs review</span><strong>{(reliability.metrics.pendingDataRequests || 0) + (reliability.metrics.openContentReports || 0)}</strong><small>{reliability.metrics.openContentReports || 0} content reports · {reliability.metrics.pendingDataRequests || 0} data requests</small></div>
          </div>

          <section className="reliability-section">
            <div className="operations-heading"><div><p className="sys-kicker">BACKUP HISTORY</p><h2>Recoverable snapshots</h2></div></div>
            <div className="delivery-list">{reliability.backups.length ? reliability.backups.map((backup) => <div className="delivery-row" key={backup.id}>
              <div><b>{new Date(backup.createdAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</b><small>{backup.rowCount} records · {formatBytes(backup.sizeBytes)}</small></div>
              <span className={`delivery-status ${backup.status}`}>{backup.status}</span>
              <small>{backup.verifiedAt ? `Verified ${new Date(backup.verifiedAt).toLocaleDateString("en-ZA")}` : "Not yet verified"}</small>
              {backup.status === "completed" && <button disabled={Boolean(busy)} onClick={() => reliabilityAction("verify", { backupId: backup.id })}>Verify</button>}
              {backup.failureMessage && <p>{backup.failureMessage}</p>}
            </div>) : <p>No platform backup has been created yet.</p>}</div>
          </section>

          {!!reliability.contentReports.length && <section className="reliability-section">
            <div className="operations-heading"><div><p className="sys-kicker">CONTENT REPORTS</p><h2>Moderation queue</h2></div><span>{reliability.metrics.openContentReports || 0} open</span></div>
            <div className="content-report-list">{reliability.contentReports.map((report) => <div key={report.id}>
              <div><strong>{report.schoolName} · {report.reason}</strong><small>Reported by {report.reporter} · posted by {report.author} · {new Date(report.createdAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</small><p>{report.postBody}</p>{report.detail && <em>Reporter note: {report.detail}</em>}</div>
              <span className={`delivery-status ${report.status}`}>{report.status}</span>
              {report.status === "open" && <div><button disabled={Boolean(busy)} onClick={() => reliabilityAction("hide_reported_post", { reportId: report.id })}>Hide post</button><button disabled={Boolean(busy)} onClick={() => reliabilityAction("dismiss_report", { reportId: report.id })}>Dismiss</button></div>}
            </div>)}</div>
          </section>}

          <section className="reliability-section">
            <div className="operations-heading"><div><p className="sys-kicker">SYSTEM EVENTS</p><h2>Errors and operational alerts</h2></div></div>
            <div className="audit-list">{reliability.events.length ? reliability.events.map((event) => <div key={event.id}>
              <span className={`event-severity ${event.severity}`}>{event.severity}</span>
              <p><b>{event.eventType}</b> · {event.message}</p>
              <small>{event.route || event.source} · {new Date(event.createdAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}{event.requestId ? ` · ${event.requestId}` : ""}</small>
              {event.status === "open" && <button disabled={Boolean(busy)} onClick={() => reliabilityAction("resolve", { eventId: event.id })}>Resolve</button>}
            </div>) : <p>No system alerts have been recorded.</p>}</div>
          </section>

          <section className="reliability-section">
            <div className="operations-heading"><div><p className="sys-kicker">STORAGE BY ACADEMY</p><h2>Quota visibility</h2></div><span>{formatBytes(reliability.configuration.storageQuotaBytes)} per academy</span></div>
            <div className="storage-list">{reliability.storage.map((school) => <div key={school.id}><strong>{school.name}</strong><span>{school.files} files</span><span>{formatBytes(school.bytes)}</span></div>)}</div>
          </section>

          {!!reliability.dataRequests.length && <section className="reliability-section">
            <div className="operations-heading"><div><p className="sys-kicker">PRIVACY REQUESTS</p><h2>Data export and deletion activity</h2></div></div>
            <div className="storage-list">{reliability.dataRequests.map((item) => <div key={item.id}><strong>{item.displayName || item.email || "Deleted member"}</strong><span>{item.requestType}</span><span className={`delivery-status ${item.status}`}>{item.status}</span></div>)}</div>
          </section>}
        </>}
      </article>}

      {tab === "Audit" && <article className="platform-panel"><div className="audit-list">
        {data.audit.map((item) => <div key={item.id}><span>{item.action}</span><p><b>{item.actor}</b> · {item.schoolName || "Platform"} · {item.targetType}</p><small>{new Date(item.createdAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</small></div>)}
      </div></article>}
    </section>
  </main>;
}
