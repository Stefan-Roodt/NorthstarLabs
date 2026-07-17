"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-client";

type Profile = { email: string; displayName: string; role: string };
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
      const [profileResponse, coursesResponse] = await Promise.all([
        fetch("/api/profile", { headers }),
        fetch("/api/courses", { headers }),
      ]);
      if (profileResponse.status === 401) { await supabase.auth.signOut(); location.href = "/login"; return; }
      if (profileResponse.ok) setProfile(await profileResponse.json());
      if (coursesResponse.ok) setCourses(await coursesResponse.json());
      setLoading(false);
    }
    loadWorkspace();
  }, [supabase]);

  const learners = useMemo(() => courses.reduce((sum, course) => sum + Number(course.students || 0), 0), [courses]);
  const published = useMemo(() => courses.filter(course => course.status === "published").length, [courses]);

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
  return <main className="system-shell"><aside className="system-side"><a className="system-brand" href="/">✦ NORTHSTARLABS</a><nav>{["Overview","Courses","Community","Memberships","Analytics"].map(item=><button key={item} className={tab===item?"active":""} onClick={()=>setTab(item)}><span>{item==="Overview"?"⌂":item==="Courses"?"▣":item==="Community"?"◎":item==="Memberships"?"◇":"↗"}</span>{item}</button>)}</nav><div className="side-bottom"><a href="/courses">View course marketplace</a><button onClick={signOut}>Sign out</button></div></aside><section className="system-main"><header className="system-top"><div><p className="sys-kicker">CREATOR WORKSPACE</p><h1>{tab}</h1></div><div className="user-chip"><span>{name.slice(0,2).toUpperCase()}</span><div><b>{name}</b><small>{email}</small></div></div></header>
  {tab==="Overview"&&<><div className="metric-row"><article><span>Courses</span><strong>{courses.length}</strong><small>{published} published</small></article><article><span>Active learners</span><strong>{learners}</strong><small>Across all your courses</small></article><article><span>Net revenue</span><strong>$0</strong><small>Payments connect in the next phase</small></article></div><div className="system-grid"><article className="panel chart-panel empty-dashboard"><p className="sys-kicker">YOUR NEXT MOVE</p><h2>{courses.length ? "Keep building your school" : "Create your first course"}</h2><p>{courses.length ? "Add lessons, publish your course, then invite your first learners." : "Start with a title. You can add video, text, quizzes and pricing next."}</p><button className="sys-primary" onClick={()=>setTab("Courses")}>{courses.length ? "Open courses →" : "Create a course →"}</button></article><article className="panel activity-panel"><div className="panel-title"><b>Recent activity</b></div><div className="empty-activity"><strong>No learner activity yet</strong><p>Enrollments, completions and community posts will appear here.</p></div></article></div></>}
  {tab==="Courses"&&<><div className="action-bar"><div><h2>Your courses</h2><p>Build, publish, and improve every learning experience.</p></div><form onSubmit={createCourse}><input required value={title} onChange={event=>setTitle(event.target.value)} placeholder="New course title"/><button disabled={creating} className="sys-primary">{creating?"Creating…":"+ Create course"}</button></form></div>{notice&&<div className="notice">{notice}</div>}{courses.length===0?<div className="panel empty-courses"><h3>No courses yet</h3><p>Enter a course title above to create your first draft.</p></div>:<div className="course-table"><div className="table-head"><span>Course</span><span>Students</span><span>Price</span><span>Status</span></div>{courses.map(course=><div className="table-row" key={course.id}><div><i>{course.title.slice(0,2).toUpperCase()}</i><a href={`/dashboard/courses/${course.id}`}><b>{course.title}</b><small className="edit-label">Edit curriculum →</small></a></div><span>{course.students}</span><span>{course.priceCents ? `$${(course.priceCents/100).toFixed(2)}` : "Free"}</span><span className={`status ${course.status}`}>{course.status}</span></div>)}</div>}</>}
  {tab==="Community"&&<article className="panel empty-dashboard"><p className="sys-kicker">COMMUNITY IS LIVE</p><h2>Bring your learners together</h2><p>The Northstar Circle is ready for questions, insights, milestones, and peer support.</p><a className="sys-primary" href="/community">Open the community →</a></article>}{tab==="Memberships"&&<SubscriptionPanel/>}{tab==="Analytics"&&<ComingSoon title="Analytics" text="Real enrollment, engagement and revenue reporting will appear here."/>}</section></main>;
}

function ComingSoon({title,text}:{title:string;text:string}) { return <article className="panel empty-dashboard"><p className="sys-kicker">NEXT BUILD PHASE</p><h2>{title}</h2><p>{text}</p></article>; }

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
