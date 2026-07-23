"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "../../lib/supabase-client";

type Profile = {
  email: string;
  displayName: string;
  role: string;
  hasCreatorSchool: boolean;
  isPlatformAdmin: boolean;
  activeSchool: {
    id: string; slug: string; name: string; memberRole: string; description: string;
    supportEmail: string; heroTitle: string; heroDescription: string; seoTitle: string; seoDescription: string;
  } | null;
  schools: Array<{ id: string; slug: string; name: string; memberRole: string }>;
};
type Course = {
  id: string; title: string; students: number; status: string; priceCents: number;
  lessonCount: number; mediaLessonCount: number; quizCount: number;
};

export default function Dashboard() {
  const [tab, setTab] = useState("Overview");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [academyName, setAcademyName] = useState("");
  const [academyBusy, setAcademyBusy] = useState(false);
  const [showAcademyForm, setShowAcademyForm] = useState(false);
  const supabase = getSupabaseBrowser();

  useEffect(() => {
    async function loadWorkspace() {
      if (!supabase) { location.href = "/login"; return; }
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) { location.href = "/login"; return; }
      const headers = { authorization: `Bearer ${token}` };
      let profileResponse = await fetch("/api/profile", { headers });
      if (profileResponse.status === 401) { await supabase.auth.signOut(); location.href = "/login"; return; }
      let profileResult = profileResponse.ok ? await profileResponse.json() as Profile : null;
      if (!profileResult?.hasCreatorSchool) {
        location.href = "/welcome?path=creator";
        return;
      }
      if (profileResult.role !== "creator") {
        profileResponse = await fetch("/api/profile", {
          method: "PATCH",
          headers: { ...headers, "content-type": "application/json" },
          body: JSON.stringify({ role: "creator" }),
        });
        if (profileResponse.ok) profileResult = await profileResponse.json() as Profile;
      }
      const coursesResponse = await fetch("/api/courses", { headers });
      if (profileResult) setProfile(profileResult);
      if (coursesResponse.ok) setCourses(await coursesResponse.json());
      setLoading(false);
    }
    loadWorkspace();
  }, [supabase]);

  const learners = useMemo(() => courses.reduce((sum, course) => sum + Number(course.students || 0), 0), [courses]);
  const published = useMemo(() => courses.filter(course => course.status === "published").length, [courses]);
  const identityReady = Boolean(
    profile?.activeSchool?.description?.trim().length >= 40 &&
    profile?.activeSchool?.supportEmail &&
    profile?.activeSchool?.heroTitle &&
    profile?.activeSchool?.heroDescription?.trim().length >= 40
  );
  const curriculumReady = courses.some((course) => Number(course.lessonCount || 0) >= 6);
  const assessmentReady = courses.some((course) => Number(course.quizCount || 0) > 0);
  const mediaReady = courses.some((course) => Number(course.mediaLessonCount || 0) > 0);
  const launchSteps = [
    { label: "Identity complete", detail: "Name, promise, support and learner-facing description are ready.", done: identityReady },
    { label: "First course created", detail: "Shape your expertise into a clear learning path.", done: courses.length > 0 },
    { label: "Real curriculum built", detail: "At least one course has six or more complete lessons.", done: curriculumReady },
    { label: "Assessment included", detail: "Learners can test understanding, not merely consume content.", done: assessmentReady },
    { label: "Playable media attached", detail: "At least one protected audio or video asset is attached and reviewable.", done: mediaReady },
    { label: "First course published", detail: "Preview the learner experience, then make it available.", done: published > 0 },
    { label: "First learner joined", detail: "Invite a learner and start building momentum.", done: learners > 0 },
  ];
  const launchProgress = Math.round((launchSteps.filter(step => step.done).length / launchSteps.length) * 100);
  const draftCourse = courses.find(course => course.status !== "published");
  const nextMove = !courses.length
    ? {
        kicker: "START WITH THE OUTCOME",
        title: "Create the course learners need.",
        copy: "Give it a working title, then shape the lessons, media and checkpoints around one useful result.",
        label: "Create your first course",
        tab: "Courses",
        href: "",
      }
    : !published
      ? {
          kicker: "READY THE EXPERIENCE",
          title: "Turn your draft into a confident launch.",
          copy: "Finish the curriculum, preview it as a learner and publish when every lesson earns its place.",
          label: "Finish your draft",
          tab: "",
          href: `/dashboard/courses/${draftCourse?.id || courses[0].id}`,
        }
      : !learners
        ? {
            kicker: "BRING IN YOUR FIRST LEARNERS",
            title: "Your academy is ready to be experienced.",
            copy: "Invite a small first group, learn from their progress and make the experience stronger with real feedback.",
            label: "Invite learners",
            tab: "",
            href: "/dashboard/learners",
          }
        : {
            kicker: "GROW THE OUTCOME",
            title: "Build the next layer of value.",
            copy: "Package courses, live learning and community into a programme people can understand and join.",
            label: "Build a programme",
            tab: "",
            href: "/dashboard/products",
          };

  async function createCourse(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !supabase || creating) return;
    setCreating(true);
    setNotice("");
    const { data } = await supabase.auth.getSession();
    const response = await fetch("/api/courses", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token ?? ""}` },
      body: JSON.stringify({ title }),
    });
    if (response.ok) {
      const course = await response.json();
      setCourses(current => [course, ...current]);
      setTitle("");
      setNotice("Course created. Open it to add your curriculum.");
    } else setNotice("We couldn't create that course. Please try again.");
    setCreating(false);
  }

  async function signOut() { await supabase?.auth.signOut(); location.href = "/"; }

  async function switchAcademy(activeSchoolId: string) {
    if (!supabase || !activeSchoolId || activeSchoolId === profile?.activeSchool?.id) return;
    setAcademyBusy(true);
    const { data } = await supabase.auth.getSession();
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token ?? ""}` },
      body: JSON.stringify({ activeSchoolId }),
    });
    if (response.ok) location.reload();
    else {
      setNotice("That academy could not be opened. Check that your account still has access.");
      setAcademyBusy(false);
    }
  }

  async function createAcademy(event: FormEvent) {
    event.preventDefault();
    if (!supabase || academyBusy || academyName.trim().length < 2) return;
    setAcademyBusy(true);
    const { data } = await supabase.auth.getSession();
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token ?? ""}` },
      body: JSON.stringify({ createSchoolName: academyName.trim() }),
    });
    const result = await response.json() as { error?: string };
    if (response.ok) location.href = "/dashboard/academy";
    else {
      setNotice(result.error || "The new academy could not be created.");
      setAcademyBusy(false);
    }
  }

  if (loading) return <main className="system-loading"><div><b>* NORTHSTARLABS</b><p>Preparing your creator workspace…</p></div></main>;

  const email = profile?.email ?? "";
  const name = profile?.displayName ?? email.split("@")[0];
  const workspaceIdentity = profile?.activeSchool?.name || name;
  return <main className="system-shell"><aside className="system-side"><Link className="system-brand" href="/">* NORTHSTARLABS</Link><nav>{["Overview","Courses","Learners","Community","Products","Live","Plan","Analytics"].map(item=><button key={item} className={tab===item?"active":""} onClick={()=>setTab(item)}><span>{item==="Overview"?"⌂":item==="Courses"?"▣":item==="Learners"?"♙":item==="Community"?"◎":item==="Products"?"*":item==="Live"?"◉":item==="Plan"?"R":"↗"}</span>{item}</button>)}<Link className="side-nav-link" href="/dashboard/studio"><span>*</span>Creator Studio</Link><Link className="side-nav-link" href="/dashboard/import"><span>⇥</span>Import courses</Link><Link className="side-nav-link" href="/dashboard/exports"><span>⇲</span>Export academy</Link><Link className="side-nav-link" href="/dashboard/academy"><span>*</span>Storefront</Link><Link className="side-nav-link" href="/dashboard/tutors"><span>◎</span>Tutors</Link><Link className="side-nav-link" href="/dashboard/integrations"><span>⇄</span>Integrations</Link><Link className="side-nav-link" href="/dashboard/operations"><span>⚙</span>Operations</Link></nav><div className="side-bottom"><Link href={profile?.activeSchool ? `https://northstarlabs.co.za/schools/${profile.activeSchool.slug}` : "/courses"}>{profile?.activeSchool ? "View my academy" : "View course marketplace"}</Link>{profile?.isPlatformAdmin&&<Link href="/admin">Platform administration</Link>}<a href="/account">Account settings</a><button onClick={signOut}>Sign out</button></div></aside><section className="system-main"><header className="system-top"><div><p className="sys-kicker">{profile?.activeSchool?.name || "YOUR ACADEMY"} - CREATOR WORKSPACE</p><h1>{tab}</h1></div><div className="workspace-controls"><label><span>Working in</span><select aria-label="Switch academy" disabled={academyBusy} value={profile?.activeSchool?.id || ""} onChange={(event)=>switchAcademy(event.target.value)}>{profile?.schools?.map((academy)=><option key={academy.id} value={academy.id}>{academy.name}</option>)}</select></label><button type="button" onClick={()=>setShowAcademyForm((current)=>!current)}>+ New academy</button><div className="user-chip"><span>{workspaceIdentity.slice(0,2).toUpperCase()}</span><div><b>{workspaceIdentity}</b><small>{name} - {profile?.activeSchool?.memberRole || "creator"} - {email}</small><Link href="/dashboard/academy#academy-identity">Edit this academy</Link></div></div></div></header>
  {showAcademyForm&&<form className="academy-quick-create" onSubmit={createAcademy}><div><b>Create a separate academy</b><small>It gets its own courses, learners, brand and public address. Nothing from {profile?.activeSchool?.name} is moved.</small></div><input autoFocus required minLength={2} maxLength={80} value={academyName} onChange={(event)=>setAcademyName(event.target.value)} placeholder="e.g. Stefan Roodt Academy"/><button className="sys-primary" disabled={academyBusy||academyName.trim().length<2}>{academyBusy?"Creating…":"Create and open"}</button><button type="button" onClick={()=>setShowAcademyForm(false)}>Cancel</button></form>}
  {tab==="Overview"&&<>
    <div className="metric-row">
      <article><span>Courses</span><strong>{courses.length}</strong><small>{published} published</small></article>
      <article><span>Active learners</span><strong>{learners}</strong><small>Across all your courses</small></article>
      <article><span>Launch readiness</span><strong>{launchProgress}%</strong><small>{launchProgress === 100 ? "Ready to grow" : "Keep following the launch path"}</small></article>
    </div>
    <div className="creator-next-grid">
      <article className="panel creator-next-card">
        <p className="sys-kicker">{nextMove.kicker}</p>
        <h2>{nextMove.title}</h2>
        <p>{nextMove.copy}</p>
        {nextMove.href
          ? <Link className="sys-primary" href={nextMove.href}>{nextMove.label} <span>→</span></Link>
          : <button className="sys-primary" onClick={()=>setTab(nextMove.tab)}>{nextMove.label} <span>→</span></button>}
      </article>
      <article className="panel creator-launch-path">
        <div className="creator-launch-heading">
          <div><p className="sys-kicker">YOUR LAUNCH PATH</p><h2>Know exactly what comes next.</h2></div>
          <strong>{launchProgress}%</strong>
        </div>
        <div className="creator-progress"><i style={{ width: `${launchProgress}%` }} /></div>
        <ol>
          {launchSteps.map((step, index) => <li className={step.done ? "done" : ""} key={step.label}>
            <span>{step.done ? "✓" : index + 1}</span>
            <div><b>{step.label}</b><small>{step.detail}</small></div>
          </li>)}
        </ol>
      </article>
    </div>
    <section className="creator-quick-actions" aria-labelledby="quick-actions-title">
      <div><p className="sys-kicker">QUICK ACTIONS</p><h2 id="quick-actions-title">Keep the academy moving.</h2></div>
      <div>
        <Link href="/dashboard/academy"><span>*</span><b>Edit storefront</b><small>Sharpen the promise people see.</small></Link>
        <Link href={profile?.activeSchool ? `/schools/${profile.activeSchool.slug}` : "/courses"}><span>↗</span><b>Preview academy</b><small>See what a visitor experiences.</small></Link>
        <Link href="/dashboard/learners"><span>+</span><b>Invite learners</b><small>Grant access and welcome people in.</small></Link>
        <Link href="/dashboard/tutors"><span>◎</span><b>Manage tutors</b><small>Publish personal support and handle enquiries.</small></Link>
        <Link href="/dashboard/questions"><span>?</span><b>Answer lesson questions</b><small>Respond where learners become stuck.</small></Link>
      </div>
    </section>
  </>}
  {tab==="Courses"&&<><div className="action-bar"><div><h2>Your courses</h2><p>Build, publish, and improve every learning experience.</p><Link href="/dashboard/import">Already have material? Import courses, documents and learners free →</Link></div><form onSubmit={createCourse}><input required value={title} onChange={event=>setTitle(event.target.value)} placeholder="New course title"/><button disabled={creating} className="sys-primary">{creating?"Creating…":"+ Create course"}</button></form></div>{notice&&<div className="notice">{notice}</div>}{courses.length===0?<div className="panel empty-courses"><h3>No courses yet</h3><p>Enter a course title above to create your first draft, or bring existing work across with Migration Studio.</p><Link className="sys-primary" href="/dashboard/import">Import existing material →</Link></div>:<div className="course-table"><div className="table-head"><span>Course</span><span>Students</span><span>Price</span><span>Status</span></div>{courses.map(course=><div className="table-row" key={course.id}><div><i>{course.title.slice(0,2).toUpperCase()}</i><a href={`/dashboard/courses/${course.id}`}><b>{course.title}</b><small className="edit-label">Edit curriculum →</small></a></div><span>{course.students}</span><span>{course.priceCents ? `$${(course.priceCents/100).toFixed(2)}` : "Free"}</span><span className={`status ${course.status}`}>{course.status}</span></div>)}</div>}</>}
  {tab==="Learners"&&<article className="panel empty-dashboard"><p className="sys-kicker">LEARNER ADMINISTRATION</p><h2>Support every learner</h2><p>Grant course or product access, monitor progress, pause enrolments, reset progress, and keep private support notes.</p><div className="dashboard-community-actions"><a className="sys-primary" href="/dashboard/learners">Manage learners →</a><a className="builder-preview" href="/dashboard/products">Grant products</a></div></article>}{tab==="Community"&&<article className="panel empty-dashboard"><p className="sys-kicker">COMMUNITY IS LIVE</p><h2>Bring your learners together</h2><p>Control membership access, appoint moderators, manage members, and keep conversations healthy.</p><div className="dashboard-community-actions"><a className="sys-primary" href="/dashboard/community">Manage members</a><a className="builder-preview" href={profile?.activeSchool ? `/schools/${profile.activeSchool.slug}/community` : "/community"}>Open community</a></div></article>}{tab==="Products"&&<article className="panel empty-dashboard"><p className="sys-kicker">BUNDLES & MEMBERSHIPS</p><h2>Package the full learning outcome</h2><p>Combine courses, community and live sessions, publish free or paid offers, and grant or revoke learner access from one product studio.</p><a className="sys-primary" href="/dashboard/products">Open product studio →</a></article>}{tab==="Live"&&<article className="panel empty-dashboard"><p className="sys-kicker">COHORTS & LIVE LEARNING</p><h2>Schedule learning together</h2><p>Create Zoom, Google Meet or Microsoft Teams sessions, register eligible learners, export calendar events and track attendance.</p><a className="sys-primary" href="/dashboard/live">Open live learning →</a></article>}{tab==="Plan"&&<SubscriptionPanel/>}{tab==="Analytics"&&<article className="panel empty-dashboard"><p className="sys-kicker">REPORTING & OPERATIONS</p><h2>Understand learning and keep delivery healthy</h2><p>Filter progress, assessments, certificates and engagement, export CSV reports, schedule summaries, and review email delivery.</p><div className="dashboard-community-actions"><a className="sys-primary" href="/dashboard/analytics">Open reporting →</a><a className="builder-preview" href="/dashboard/operations">Email & administration</a></div></article>}</section></main>;
}

const subscriptionPlans = [
  { id: "launch", name: "Launch", price: 549, note: "Publish your first products" },
  { id: "build", name: "Build", price: 1249, note: "Courses, communities and memberships" },
  { id: "grow", name: "Grow", price: 2699, note: "Advanced growth and analytics" },
  { id: "scale", name: "Scale", price: 5699, note: "High-volume teams and automation" },
] as const;

function SubscriptionPanel() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<{
    connected: boolean;
    mode: "sandbox" | "live";
    membership: { plan: string; status: string } | null;
  } | null>(null);
  async function authenticatedPost(path: string, body?: object) {
    const supabase = getSupabaseBrowser();
    const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
    return fetch(path, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token ?? ""}` }, body: body ? JSON.stringify(body) : undefined });
  }
  async function checkout(plan: string) {
    setBusy(plan); setMessage("");
    const response = await authenticatedPost("/api/payfast/checkout", { plan });
    const result = await response.json();
    if (result.action && result.fields) {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = result.action;
      for (const [name, value] of Object.entries(result.fields as Record<string, string>)) {
        const input = document.createElement("input"); input.type = "hidden"; input.name = name; input.value = value; form.appendChild(input);
      }
      document.body.appendChild(form); form.submit();
    } else { setMessage(result.error ?? "PayFast checkout is unavailable."); setBusy(""); }
  }
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase?.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      fetch("/api/payfast/status", {
        headers: { authorization: `Bearer ${data.session.access_token}` },
      }).then(async (response) => response.ok ? response.json() : null)
        .then((result) => result && setPaymentStatus(result));
    });
  }, []);
  const badge = !paymentStatus?.connected
    ? "PAYFAST SETUP REQUIRED"
    : paymentStatus.mode === "live" ? "PAYFAST LIVE" : "PAYFAST TEST MODE";
  return <><div className="action-bar"><div><h2>Choose your NorthstarLabs plan</h2><p>Secure recurring billing in South African rand through PayFast.</p>{paymentStatus?.membership&&<small>Your current plan: <b>{paymentStatus.membership.plan}</b> - {paymentStatus.membership.status.replaceAll("_", " ")}</small>}</div><span className="payment-provider">{badge}</span></div>{message&&<div className="notice">{message}</div>}<div className="subscription-grid">{subscriptionPlans.map(plan=><article className="panel subscription-card" key={plan.id}><p className="sys-kicker">{plan.name.toUpperCase()}</p><h3>R{plan.price.toLocaleString("en-ZA")}<span>/month</span></h3><p>{plan.note}</p><button className="sys-primary" disabled={!!busy||paymentStatus?.connected===false} onClick={()=>checkout(plan.id)}>{busy===plan.id?"Opening PayFast…":"Continue with PayFast →"}</button></article>)}</div><p className="payment-note">{paymentStatus?.mode === "live" ? "Recurring subscriptions are charged securely by PayFast in South African rand." : "Test mode is safe to use: no real payment is taken until PayFast is switched to live."}</p></>;
}
