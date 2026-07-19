"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-client";

type Enrolment = {
  courseId: string;
  title: string;
  description: string;
  progress: number;
};
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
      const [coursesResponse, productsResponse] = await Promise.all([
        fetch("/api/enrollments", { headers }),
        fetch("/api/products/claim", { headers }),
      ]);
      if (coursesResponse.ok) setItems(await coursesResponse.json());
      if (productsResponse.ok) {
        const result = await productsResponse.json() as { products: LearnerProduct[] };
        setProducts(result.products);
      }
      setLoading(false);
    })();
  }, [supabase]);

  async function signOut() {
    await supabase?.auth.signOut();
    location.href = "/";
  }

  return <main className="learner-home">
    <header>
      <Link className="system-brand" href="/">✦ NORTHSTARLABS</Link>
      <nav>
        <Link href="/courses">Explore courses</Link>
        <Link href="/live">Live learning</Link>
        <Link href="/community">Community</Link>
        <Link href="/account">Account</Link>
        <button onClick={signOut}>Sign out</button>
      </nav>
    </header>
    <section className="learner-welcome">
      <p className="sys-kicker">MY LEARNING</p>
      <h1>Keep moving forward.</h1>
      <p>Your courses, memberships, live sessions, and next lessons live here.</p>
      <Link className="learner-live-shortcut" href="/live">Open my live calendar →</Link>
    </section>
    <section className="learner-library">
      {products.length > 0 && <>
        <div className="library-heading">
          <div><h2>Your programmes</h2><p>Bundles, memberships and cohorts you can access.</p></div>
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
              <Link href={`/schools/${product.schoolSlug}`}>Academy</Link>
            </div>
          </article>)}
        </div>
      </>}

      <div className="library-heading" id="courses">
        <div><h2>Your courses</h2><p>Continue exactly where you left off.</p></div>
        <Link className="builder-preview" href="/courses">Browse all courses →</Link>
      </div>
      {loading
        ? <p>Loading your learning…</p>
        : items.length
          ? <div className="learning-grid">{items.map((item) => <article className="panel" key={item.courseId}>
            <span className="course-art">{item.title.slice(0, 2).toUpperCase()}</span>
            <p className="sys-kicker">IN PROGRESS</p>
            <h3>{item.title}</h3>
            <p>{item.description || "Continue your next lesson and put your learning into practice."}</p>
            <div className="progress-line"><i><b style={{ width: `${item.progress || 0}%` }} /></i><span>{item.progress || 0}%</span></div>
            <Link className="sys-primary" href={`/learn/${item.courseId}`}>Continue learning →</Link>
          </article>)}</div>
          : <article className="panel empty-dashboard">
            <h2>Your learning space is ready</h2>
            <p>Join a course, bundle or membership and it will appear here automatically.</p>
            <Link className="sys-primary" href="/courses">Explore courses →</Link>
          </article>}
    </section>
  </main>;
}
