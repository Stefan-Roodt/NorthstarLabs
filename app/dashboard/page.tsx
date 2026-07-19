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
  activeSchool: { id: string; slug: string; name: string; memberRole: string } | null;
};
type Course = { id: string; title: string; students: number; status: string; priceCents: number };

export default function Dashboard() {
  const [tab, setTab] = useState("Overview");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
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
  const launchSteps = [
    { label: "Academy created", detail: "Your branded creator workspace is ready.", done: true },
    { label: "First course created", detail: "Shape your expertise into a clear learning path.", done: courses.length > 0 },
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

  if (loading) return <main className="system-loading"><div><b>✦ NORTHSTARLABS</b><p>Preparing your creator workspace…</p></div></main>;

  const email = profile?.email ?? "";
  const name = profile?.displayName ?? email.split("@")[0];
  return <main className="system-shell"><aside className="system-side"><Link className="system-brand" href="/">✦ NORTHSTARLABS</Link><nav>{["Overview","Courses","Learners","Community","Products","Live","Plan","Analytics"].map(item=><button key={item} className={tab===item?"active":""} onClick={()=>setTab(item)}><span>{item==="Overview"?"⌂":item==="Courses"?"▣":item==="Learners"?"♙":item==="Community"?"◎":item==="Products"?"◇":item==="Live"?"◉":item==="Plan"?"R":"↗"}</span>{item}</button>)}<Link className="side-nav-link" href="/dashboard/academy"><span>✦</span>Storefront</Link><Link className="side-nav-link" href="/dashboard/tutors"><span>◎</span>Tutors</Link><Link className="side-nav-link" href="/dashboard/integrations"><span>⇄</span>Integrations</Link><Link className="side-nav-link" href="/dashboard/operations"><span>⚙</span>Operations</Link></nav><div className="side-bottom"><Link href={profile?.activeSchool ? `/schools/${profile.activeSchool.slug}` : "/courses"}>{profile?.activeSchool ? "View my academy" : "View course marketplace"}</Link>{profile?.isPlatformAdmin&&<Link href="/admin">Platform administration</Link>}<a href="/account">Account settings</a><button onClick={signOut}>Sign out</button></div></aside><section className="system-main"><header className="system-top"><div><p className="sys-kicker">{profile?.activeSchool?.name || "YOUR ACADEMY"} · CREATOR WORKSPACE</p><h1>{tab}</h1></div><div className="user-chip"><span>{name.slice(0,2).toUpperCase()}</span><div><b>{name}</b><small>{profile?.activeSchool?.memberRole || "creator"} · {email}</small></div></div></header>
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
        <Link href="/dashboard/academy"><span>✦</span><b>Edit storefront</b><small>Sharpen the promise people see.</small></Link>
        <Link href={profile?.activeSchool ? `/schools/${profile.activeSchool.slug}` : "/courses"}><span>↗</span><b>Preview academy</b><small>See what a visitor experiences.</small></Link>
        <Link href="/dashboard/learners"><span>+</span><b>Invite learners</b><small>Grant access and welcome people in.</small></Link>
        <Link href="/dashboard/tutors"><span>◎</span><b>Manage tutors</b><small>Publish personal support and handle enquiries.</small></Link>
      </div>
    </section>
  </>}
  {tab==="Courses"&&<><div className="action-bar"><div><h2>Your courses</h2><p>Build, publish, and improve every learning experience.</p></div><form onSubmit={createCourse}><input required value={title} onChange={event=>setTitle(event.target.value)} placeholder="New course title"/><button disabled={creating} className="sys-primary">{creating?"Creating…":"+ Create course"}</button></form></div>{notice&&<div className="notice">{notice}</div>}{courses.length===0?<div className="panel empty-courses"><h3>No courses yet</h3><p>Enter a course title above to create your first draft.</p></div>:<div className="course-table"><div className="table-head"><span>Course</span><span>Students</span><span>Price</span><span>Status</span></div>{courses.map(course=><div className="table-row" key={course.id}><div><i>{course.title.slice(0,2).toUpperCase()}</i><a href={`/dashboard/courses/${course.id}`}><b>{course.title}</b><small className="edit-label">Edit curriculum →</small></a></div><span>{course.students}</span><span>{course.priceCents ? `$${(course.priceCents/100).toFixed(2)}` : "Free"}</span><span className={`status ${course.status}`}>{course.status}</span></div>)}</div>}</>}
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
  return <><div className="action-bar"><div><h2>Choose your NorthstarLabs plan</h2><p>Secure recurring billing in South African rand through PayFast.</p></div><span className="payment-provider">PAYFAST SANDBOX</span></div>{message&&<div className="notice">{message}</div>}<div className="subscription-grid">{subscriptionPlans.map(plan=><article className="panel subscription-card" key={plan.id}><p className="sys-kicker">{plan.name.toUpperCase()}</p><h3>R{plan.price.toLocaleString("en-ZA")}<span>/month</span></h3><p>{plan.note}</p><button className="sys-primary" disabled={!!busy} onClick={()=>checkout(plan.id)}>{busy===plan.id?"Opening PayFast…":"Continue with PayFast →"}</button></article>)}</div><p className="payment-note">Recurring PayFast subscriptions use card payments. No real payment is taken while sandbox mode is active.</p></>;
}
