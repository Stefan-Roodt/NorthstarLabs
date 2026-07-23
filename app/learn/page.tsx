"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLowBandwidthMode } from "../../lib/low-bandwidth";
import { getSupabaseBrowser } from "../../lib/supabase-client";

type Enrolment = {
  courseId: string;
  title: string;
  description: string;
  progress: number;
  schoolName: string;
  schoolSlug: string;
  lessonCount: number;
  completedLessons: number;
  nextLessonTitle: string | null;
};
type LearnerProfile = { displayName: string; email: string };
type MasterySummary = { ready: number; strengthening: number; mastered: number; total: number };
type LearnerProduct = {
  id: string;
  productId: string;
  name: string;
  description: string;
  productType: string;
  schoolName: string;
  schoolSlug: string;
  courseCount: number;
  upcomingSessions: number;
  includesCommunity: number;
  expiresAt: number | null;
};
type CoachingRequest = {
  id: string;
  status: string;
  tutorName: string;
  schoolName: string;
  startsAt: number | null;
  endsAt: number | null;
  meetingDetails: string | null;
  reviewId: string | null;
  updatedAt: number;
};

export default function LearnerHome() {
  const [items, setItems] = useState<Enrolment[]>([]);
  const [products, setProducts] = useState<LearnerProduct[]>([]);
  const [coaching, setCoaching] = useState<CoachingRequest[]>([]);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [mastery, setMastery] = useState<MasterySummary>({ ready: 0, strengthening: 0, mastered: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const supabase = getSupabaseBrowser();
  const { enabled: lowBandwidth, toggle: toggleLowBandwidth } = useLowBandwidthMode();

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) {
        location.href = "/login?next=/learn";
        return;
      }
      const headers = { authorization: `Bearer ${session.access_token}` };
      const [coursesResponse, productsResponse, profileResponse, masteryResponse, coachingResponse] = await Promise.all([
        fetch("/api/enrollments", { headers }),
        fetch("/api/products/claim", { headers }),
        fetch("/api/profile", { headers }),
        fetch("/api/mastery?summary=1", { headers }),
        fetch("/api/tutor-inquiries?view=learner", { headers }),
      ]);
      if (coursesResponse.ok) setItems(await coursesResponse.json());
      if (productsResponse.ok) {
        const result = await productsResponse.json() as { products: LearnerProduct[] };
        setProducts(result.products);
      }
      if (profileResponse.ok) setProfile(await profileResponse.json());
      if (masteryResponse.ok) {
        const result = await masteryResponse.json() as { summary: MasterySummary };
        setMastery(result.summary);
      }
      if (coachingResponse.ok) {
        const result = await coachingResponse.json() as { inquiries: CoachingRequest[] };
        setCoaching(result.inquiries);
      }
      setCurrentTime(Date.now());
      setLoading(false);
    })();
  }, [supabase]);

  async function signOut() {
    await supabase?.auth.signOut();
    location.href = "/";
  }

  const inProgress = items.filter(item => item.progress > 0 && item.progress < 100);
  const notStarted = items.filter(item => item.progress <= 0);
  const completed = items.filter(item => item.progress >= 100);
  const activeCourses = [...inProgress, ...notStarted];
  const nextCourse = [...inProgress].sort((a, b) => b.progress - a.progress)[0] || notStarted[0];
  const upcomingLive = products.reduce((sum, product) => sum + Number(product.upcomingSessions || 0), 0);
  const firstName = (profile?.displayName || profile?.email?.split("@")[0] || "").trim().split(/\s+/)[0];
  const activeCoaching = coaching.filter((request) =>
    ["new", "contacted", "booked"].includes(request.status) &&
    (!request.startsAt || request.startsAt > currentTime)
  );
  const confirmedCoaching = activeCoaching.filter((request) => request.status === "booked");
  const pendingCoaching = activeCoaching.filter((request) => request.status !== "booked");
  const reviewDue = coaching.filter((request) => request.status === "completed" && !request.reviewId);
  const nextCoaching = [...activeCoaching]
    .sort((a, b) => (a.startsAt || Number.MAX_SAFE_INTEGER) - (b.startsAt || Number.MAX_SAFE_INTEGER))[0];

  return <main className="learner-home">
      <header>
        <Link className="system-brand" href="/">* NORTHSTARLABS</Link>
      <nav>
        <Link href="/courses">Explore modules</Link>
        <Link href="/tutoring"><span className="learner-nav-desktop">My coaching</span><span className="learner-nav-mobile">Coaching</span></Link>
        <Link href="/live">My live classes</Link>
        <Link href="/community">My communities</Link>
        <Link href="/mastery">Mastery</Link>
        <Link href="/portfolio">Proof portfolio</Link>
        <Link href="/account"><span className="learner-nav-desktop">Account settings</span><span className="learner-nav-mobile">Account</span></Link>
        <button className={`learner-bandwidth-toggle ${lowBandwidth ? "active" : ""}`} aria-pressed={lowBandwidth} onClick={toggleLowBandwidth}>{lowBandwidth ? "Low-data on" : "Low-data off"}</button>
        <button className="learner-signout" onClick={signOut}>Sign out</button>
      </nav>
    </header>

    <section className="learner-welcome learner-welcome-focused">
      <div>
        <p className="sys-kicker">MY LEARNING</p>
        <h1>{firstName ? `Welcome back, ${firstName}.` : "Welcome back."}</h1>
        <p>Pick up the right next step without searching for where you left off.</p>
      </div>
      {!loading && <dl className="learner-rhythm">
        <div><dt>Active courses</dt><dd>{activeCourses.length}</dd></div>
        <div><dt>Completed</dt><dd>{completed.length}</dd></div>
        <div><dt>Live sessions</dt><dd>{upcomingLive}</dd></div>
      </dl>}
    </section>

    {lowBandwidth && <section className="learner-bandwidth-notice"><div><p className="sys-kicker">LOW-BANDWIDTH MODE</p><h2>Courses will load text first.</h2><p>Only the lesson you open is transferred. Video, audio, and images stay paused until you choose to load them.</p></div><button onClick={toggleLowBandwidth}>Return to standard mode</button></section>}

    {!loading && mastery.total > 0 && <section className="learner-mastery-strip">
      <div>
        <p className="sys-kicker">PERSONAL MASTERY LOOP</p>
        <h2>{mastery.ready > 0 ? `${mastery.ready} concept${mastery.ready === 1 ? " is" : "s are"} ready for review.` : "Your understanding is strengthening."}</h2>
        <p>Practise only what needs attention. Two correct follow-up checks move a concept to mastered.</p>
      </div>
      <dl><div><dt>Ready</dt><dd>{mastery.ready}</dd></div><div><dt>Strengthening</dt><dd>{mastery.strengthening}</dd></div><div><dt>Mastered</dt><dd>{mastery.mastered}</dd></div></dl>
      <Link className="sys-primary" href="/mastery">{mastery.ready > 0 ? "Start focused review" : "See my concept map"} {"\u2192"}</Link>
    </section>}

    {!loading && <section className={`learner-coaching-strip ${activeCoaching.length || reviewDue.length ? "active" : ""}`}>
      <div className="learner-coaching-mark" aria-hidden="true">1:1</div>
      <div className="learner-coaching-copy">
        <p className="sys-kicker">HUMAN HELP DESK</p>
        {reviewDue.length > 0
          ? <>
            <h2>{reviewDue.length === 1 ? "Your session is ready for review." : `${reviewDue.length} sessions are ready for review.`}</h2>
            <p>Share protected feedback while the session is still fresh.</p>
          </>
          : nextCoaching
            ? <>
              <h2>{nextCoaching.status === "booked"
                ? `Your session with ${nextCoaching.tutorName} is confirmed.`
                : `${nextCoaching.tutorName} is reviewing your request.`}</h2>
              <p>{nextCoaching.startsAt
                ? `${new Date(nextCoaching.startsAt).toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" })} at ${new Date(nextCoaching.startsAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}.`
                : `Your request through ${nextCoaching.schoolName} is safely recorded.`}</p>
            </>
            : <>
              <h2>Get personal help when a course is not enough.</h2>
              <p>Compare real expertise, choose an available time, and keep the entire session journey in one place.</p>
            </>}
      </div>
      {(activeCoaching.length > 0 || reviewDue.length > 0) && <dl>
        <div><dt>Confirmed</dt><dd>{confirmedCoaching.length}</dd></div>
        <div><dt>Awaiting reply</dt><dd>{pendingCoaching.length}</dd></div>
      </dl>}
      <div className="learner-coaching-actions">
        {(activeCoaching.length > 0 || reviewDue.length > 0) && <Link className="sys-primary" href="/tutoring">{reviewDue.length ? "Review session" : "Open my coaching"} {"\u2192"}</Link>}
        <Link href="/tutors">{activeCoaching.length || reviewDue.length ? "Find another coach" : "Find a coach"} {"\u2192"}</Link>
      </div>
    </section>}

    {!loading && <section className="learner-next-wrap">
      {nextCourse ? <article className="learner-next-card">
        <div className="learner-next-art" aria-hidden="true">{nextCourse.title.slice(0, 2).toUpperCase()}</div>
        <div className="learner-next-copy">
          <p className="sys-kicker">{nextCourse.progress > 0 ? "JUMP BACK IN" : "YOUR NEXT START"}</p>
          <span>{nextCourse.schoolName}</span>
          <h2>{nextCourse.title}</h2>
          <p>{nextCourse.progress > 0
            ? `You are ${Math.round(nextCourse.progress)}% through. Your exact next lesson is ready.`
            : "This course is ready when you are. Your first lesson is waiting below."}</p>
          {nextCourse.nextLessonTitle && <p className="learner-next-lesson">
            <span>{nextCourse.progress > 0 ? "Continue with" : "Start with"}</span>
            <b>{nextCourse.nextLessonTitle}</b>
          </p>}
          <div className="learner-next-progress">
            <i><b style={{ width: `${Math.min(100, Math.max(0, nextCourse.progress))}%` }} /></i>
            <span>{Math.round(nextCourse.progress)}%</span>
          </div>
          <Link className="sys-primary" href={`/learn/${nextCourse.courseId}`}>
            {nextCourse.progress > 0 ? "Continue learning" : "Start course"} {"\u2192"}
          </Link>
        </div>
      </article> : completed.length > 0 ? <article className="learner-finish-card">
        <div><span aria-hidden="true">&#9733;</span></div>
        <section>
          <p className="sys-kicker">A STRONG FINISH</p>
          <h2>You completed {completed.length} {completed.length === 1 ? "course" : "courses"}.</h2>
          <p>Take a moment to recognise the work, then choose the next useful skill when you are ready.</p>
          <Link className="sys-primary" href="/courses">Explore what is next {"\u2192"}</Link>
        </section>
      </article> : <article className="learner-finish-card learner-start-card">
        <div><span>01</span></div>
        <section>
          <p className="sys-kicker">YOUR NEXT USEFUL STEP</p>
          <h2>Choose one course worth finishing.</h2>
          <p>Explore practical learning from independent academies and keep every course, programme and milestone together here.</p>
          <Link className="sys-primary" href="/courses">Explore courses {"\u2192"}</Link>
        </section>
      </article>}
    </section>}

    <section className="learner-library">
      {products.length > 0 && <>
        <div className="library-heading">
          <div><p className="sys-kicker">YOUR ACCESS</p><h2>Programmes & memberships</h2><p>Everything included in the learning experiences you joined.</p></div>
        </div>
        <div className="learner-product-grid">
          {products.map((product) => <article className="panel learner-product-card" key={product.id}>
            <div><span>{product.productType.replaceAll("_", " ")}</span><small>{product.schoolName}</small></div>
            <h3>{product.name}</h3>
            <p>{product.description || "Your complete learning programme is ready."}</p>
            <ul>
              {product.courseCount > 0 && <li>{product.courseCount} included {product.courseCount === 1 ? "course" : "courses"}</li>}
              {product.upcomingSessions > 0 && <li>{product.upcomingSessions} upcoming live {product.upcomingSessions === 1 ? "session" : "sessions"}</li>}
              {product.includesCommunity ? <li>Private community access</li> : null}
            </ul>
            <small>{product.expiresAt ? `Access until ${new Date(product.expiresAt).toLocaleDateString("en-ZA")}` : "Ongoing access"}</small>
            <div>
              {product.courseCount > 0 && <a className="sys-primary" href="#courses">Open courses</a>}
              {product.upcomingSessions > 0 && <Link href="/live">Live calendar {"\u2192"}</Link>}
              {product.includesCommunity
                ? <Link href={`/schools/${product.schoolSlug}/community`}>Community</Link>
                : <Link href={`/schools/${product.schoolSlug}`}>Academy</Link>}
            </div>
          </article>)}
        </div>
      </>}

      <div className="library-heading" id="courses">
        <div><p className="sys-kicker">YOUR LIBRARY</p><h2>{activeCourses.length ? "Courses in motion" : "Your courses"}</h2><p>{activeCourses.length ? "Continue or begin with a clear next action." : "Completed learning stays here whenever you need it."}</p></div>
        <Link className="builder-preview" href="/courses">Browse all courses {"\u2192"}</Link>
      </div>
      {loading
        ? <div className="learner-loading"><span /><p>Preparing your learning space.</p></div>
        : activeCourses.length
          ? <div className="learning-grid">{activeCourses.map((item) => {
            const progress = Math.min(100, Math.max(0, item.progress || 0));
            const started = progress > 0;
            return <article className="panel learner-course-card" key={item.courseId}>
              <span className="course-art">{item.title.slice(0, 2).toUpperCase()}</span>
              <div className="learner-course-meta"><p className="sys-kicker">{started ? "IN PROGRESS" : "READY TO START"}</p><small>{item.schoolName}</small></div>
              <h3>{item.title}</h3>
              <p>{item.description || "Continue your next lesson and put your learning into practice."}</p>
              {item.nextLessonTitle && <p className="learner-course-next"><span>Next lesson</span><b>{item.nextLessonTitle}</b></p>}
              <div className="progress-line"><i><b style={{ width: `${progress}%` }} /></i><span>{Math.round(progress)}%</span></div>
              <Link className="sys-primary" href={`/learn/${item.courseId}`}>{started ? "Continue learning" : "Start course"} {"\u2192"}</Link>
            </article>;
          })}</div>
          : completed.length === 0 && <article className="panel empty-dashboard">
            <h2>Your learning space is ready</h2>
            <p>Join a course, bundle or membership and it will appear here automatically.</p>
            <Link className="sys-primary" href="/courses">Explore courses {"\u2192"}</Link>
          </article>}

      {completed.length > 0 && <section className="learner-completed">
        <div className="library-heading">
          <div><p className="sys-kicker">COMPLETED</p><h2>Progress worth keeping.</h2><p>Revisit a course, verify its certificate, or add the evidence to your public learning portfolio.</p></div>
          <Link className="builder-preview" href="/portfolio">Build my proof portfolio {"\u2192"}</Link>
        </div>
        <div className="learner-completed-list">
          {completed.map(item => <article className="panel" key={item.courseId}>
            <span aria-hidden="true">&#10003;</span>
            <div><small>{item.schoolName}</small><h3>{item.title}</h3></div>
            <Link href={`/learn/${item.courseId}`}>Review course {"\u2192"}</Link>
          </article>)}
        </div>
      </section>}
    </section>
  </main>;
}
