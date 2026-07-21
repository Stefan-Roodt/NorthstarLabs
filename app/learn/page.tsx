"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-client";

type Enrolment = {
  courseId: string;
  title: string;
  description: string;
  progress: number;
  schoolName: string;
  schoolSlug: string;
};
type LearnerProfile = { displayName: string; email: string };
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

export default function LearnerHome() {
  const [items, setItems] = useState<Enrolment[]>([]);
  const [products, setProducts] = useState<LearnerProduct[]>([]);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowser();

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) {
        location.href = "/login?next=/learn";
        return;
      }
      const headers = { authorization: `Bearer ${session.access_token}` };
      const [coursesResponse, productsResponse, profileResponse] = await Promise.all([
        fetch("/api/enrollments", { headers }),
        fetch("/api/products/claim", { headers }),
        fetch("/api/profile", { headers }),
      ]);
      if (coursesResponse.ok) setItems(await coursesResponse.json());
      if (productsResponse.ok) {
        const result = await productsResponse.json() as { products: LearnerProduct[] };
        setProducts(result.products);
      }
      if (profileResponse.ok) setProfile(await profileResponse.json());
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

  return <main className="learner-home">
    <header>
      <Link className="system-brand" href="/">✦ NORTHSTARLABS</Link>
      <nav>
        <Link href="/courses">Explore modules</Link>
        <Link href="/live">My live classes</Link>
        <Link href="/community">My communities</Link>
        <Link href="/portfolio">Proof portfolio</Link>
        <Link href="/account">Account</Link>
        <button onClick={signOut}>Sign out</button>
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

    {!loading && <section className="learner-next-wrap">
      {nextCourse ? <article className="learner-next-card">
        <div className="learner-next-art" aria-hidden="true">{nextCourse.title.slice(0, 2).toUpperCase()}</div>
        <div className="learner-next-copy">
          <p className="sys-kicker">{nextCourse.progress > 0 ? "JUMP BACK IN" : "YOUR NEXT START"}</p>
          <span>{nextCourse.schoolName}</span>
          <h2>{nextCourse.title}</h2>
          <p>{nextCourse.progress > 0
            ? `You are ${Math.round(nextCourse.progress)}% through. A focused next lesson keeps the momentum going.`
            : "This course is ready when you are. Start the first lesson and turn intention into progress."}</p>
          <div className="learner-next-progress">
            <i><b style={{ width: `${Math.min(100, Math.max(0, nextCourse.progress))}%` }} /></i>
            <span>{Math.round(nextCourse.progress)}%</span>
          </div>
          <Link className="sys-primary" href={`/learn/${nextCourse.courseId}`}>
            {nextCourse.progress > 0 ? "Continue learning" : "Start course"} <span>→</span>
          </Link>
        </div>
      </article> : completed.length > 0 ? <article className="learner-finish-card">
        <div><span>✓</span></div>
        <section>
          <p className="sys-kicker">A STRONG FINISH</p>
          <h2>You completed {completed.length} {completed.length === 1 ? "course" : "courses"}.</h2>
          <p>Take a moment to recognise the work, then choose the next useful skill when you are ready.</p>
          <Link className="sys-primary" href="/courses">Explore what is next →</Link>
        </section>
      </article> : <article className="learner-finish-card learner-start-card">
        <div><span>01</span></div>
        <section>
          <p className="sys-kicker">YOUR NEXT USEFUL STEP</p>
          <h2>Choose one course worth finishing.</h2>
          <p>Explore practical learning from independent academies and keep every course, programme and milestone together here.</p>
          <Link className="sys-primary" href="/courses">Explore courses →</Link>
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
              {product.upcomingSessions > 0 && <Link href="/live">Live calendar →</Link>}
              {product.includesCommunity
                ? <Link href={`/schools/${product.schoolSlug}/community`}>Community</Link>
                : <Link href={`/schools/${product.schoolSlug}`}>Academy</Link>}
            </div>
          </article>)}
        </div>
      </>}

      <div className="library-heading" id="courses">
        <div><p className="sys-kicker">YOUR LIBRARY</p><h2>{activeCourses.length ? "Courses in motion" : "Your courses"}</h2><p>{activeCourses.length ? "Continue or begin with a clear next action." : "Completed learning stays here whenever you need it."}</p></div>
        <Link className="builder-preview" href="/courses">Browse all courses →</Link>
      </div>
      {loading
        ? <div className="learner-loading"><span /><p>Preparing your learning space…</p></div>
        : activeCourses.length
          ? <div className="learning-grid">{activeCourses.map((item) => {
            const progress = Math.min(100, Math.max(0, item.progress || 0));
            const started = progress > 0;
            return <article className="panel learner-course-card" key={item.courseId}>
              <span className="course-art">{item.title.slice(0, 2).toUpperCase()}</span>
              <div className="learner-course-meta"><p className="sys-kicker">{started ? "IN PROGRESS" : "READY TO START"}</p><small>{item.schoolName}</small></div>
              <h3>{item.title}</h3>
              <p>{item.description || "Continue your next lesson and put your learning into practice."}</p>
              <div className="progress-line"><i><b style={{ width: `${progress}%` }} /></i><span>{Math.round(progress)}%</span></div>
              <Link className="sys-primary" href={`/learn/${item.courseId}`}>{started ? "Continue learning" : "Start course"} →</Link>
            </article>;
          })}</div>
          : completed.length === 0 && <article className="panel empty-dashboard">
            <h2>Your learning space is ready</h2>
            <p>Join a course, bundle or membership and it will appear here automatically.</p>
            <Link className="sys-primary" href="/courses">Explore courses →</Link>
          </article>}

      {completed.length > 0 && <section className="learner-completed">
        <div className="library-heading">
          <div><p className="sys-kicker">COMPLETED</p><h2>Progress worth keeping.</h2><p>Revisit a course, verify its certificate, or add the evidence to your public learning portfolio.</p></div>
          <Link className="builder-preview" href="/portfolio">Build my proof portfolio →</Link>
        </div>
        <div className="learner-completed-list">
          {completed.map(item => <article className="panel" key={item.courseId}>
            <span>✓</span>
            <div><small>{item.schoolName}</small><h3>{item.title}</h3></div>
            <Link href={`/learn/${item.courseId}`}>Review course →</Link>
          </article>)}
        </div>
      </section>}
    </section>
  </main>;
}
