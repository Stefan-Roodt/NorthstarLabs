"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useState } from "react";
import type { CatalogCourse } from "../../../lib/starter-courses";
import { getSupabaseBrowser } from "../../../lib/supabase-client";

type School = {
  id: string;
  slug: string;
  name: string;
  description: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  primaryColor: string;
  accentColor: string;
  heroTitle: string;
  heroDescription: string;
  fontTheme: string;
  supportEmail: string;
  websiteUrl: string | null;
  seoTitle: string;
  seoDescription: string;
  showCommunity: number;
  termsUrl: string | null;
  privacyUrl: string | null;
};

type SchoolData = {
  school: School;
  community: { name: string; description: string; accessType: string } | null;
  products: Array<{
    id: string;
    name: string;
    description: string;
    productType: string;
    priceCents: number;
    billingInterval: string;
    includesCommunity: number;
    accessDurationDays: number;
    courseCount: number;
    liveSessionCount: number;
  }>;
  courses: CatalogCourse[];
};

export default function SchoolPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState("");
  const [data, setData] = useState<SchoolData | null>(null);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState("");
  const [notice, setNotice] = useState("");
  const supabase = getSupabaseBrowser();

  useEffect(() => {
    params.then(({ slug: schoolSlug }) => setSlug(schoolSlug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/schools/${encodeURIComponent(slug)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("This academy could not be found.");
        return response.json() as Promise<SchoolData>;
      })
      .then(setData)
      .catch((reason: Error) => setError(reason.message));
  }, [slug]);

  if (error) {
    return <main className="system-loading"><div>
      <b>NorthStarLabs</b>
      <p>{error}</p>
      <Link href="/courses">Browse all courses</Link>
    </div></main>;
  }
  if (!data) return <main className="system-loading"><p>Opening the academy...</p></main>;

  const { school } = data;
  const style = {
    "--school-primary": school.primaryColor,
    "--school-accent": school.accentColor,
    "--blue": school.primaryColor,
    "--acid": school.accentColor,
  } as CSSProperties;
  const heroTitle = school.heroTitle || `Learn with ${school.name}`;
  const heroDescription = school.heroDescription || school.description ||
    "Practical learning, gathered in one focused academy.";
  const terms = school.termsUrl || "/legal/terms";
  const privacy = school.privacyUrl || "/legal/privacy";

  async function joinProduct(productId: string) {
    if (!supabase) return;
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) {
      window.location.assign(`/login?next=${encodeURIComponent(`/schools/${school.slug}#products`)}`);
      return;
    }
    setJoining(productId);
    setNotice("");
    const response = await fetch("/api/products/claim", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ productId }),
    });
    const result = await response.json();
    if (!response.ok) {
      setNotice(result.error || "This product could not be joined.");
      setJoining("");
      return;
    }
    setNotice("Access granted. Your courses and live sessions are ready.");
    window.location.assign(result.courseIds?.[0] ? `/learn/${result.courseIds[0]}` : "/live");
  }

  return <main className={`school-storefront font-${school.fontTheme}`} style={style}>
    <header className="school-storefront-nav">
      <Link className="school-brand" href={`/schools/${school.slug}`}>
        <SchoolLogo school={school} />
      </Link>
      <nav>
        {data.products.length > 0 && <a href="#products">Products</a>}
        <a href="#courses">Courses</a>
        {school.showCommunity && data.community &&
          <Link href={`/schools/${school.slug}/community`}>Community</Link>}
        {school.websiteUrl && <a href={school.websiteUrl}>Website</a>}
        <Link className="school-sign-in" href={`/login?next=${encodeURIComponent(`/schools/${school.slug}`)}`}>Sign in</Link>
      </nav>
    </header>

    <section className={`school-storefront-hero ${school.coverImageUrl ? "with-cover" : ""}`}>
      {school.coverImageUrl && <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={school.coverImageUrl} alt="" />
      </>}
      <div>
        <p className="sys-kicker">WELCOME TO {school.name.toUpperCase()}</p>
        <h1>{heroTitle}</h1>
        <p>{heroDescription}</p>
        <div className="school-hero-actions">
          <a className="school-primary-action" href={data.products.length ? "#products" : "#courses"}>{data.products.length ? "Explore programmes" : "Explore courses"}</a>
          {school.showCommunity && data.community &&
            <Link href={`/schools/${school.slug}/community`}>Enter the community →</Link>}
        </div>
      </div>
      <aside>
        <strong>{String(data.products.length + data.courses.length).padStart(2, "0")}</strong>
        <span>ways to learn</span>
      </aside>
    </section>

    <section className="school-trust-strip">
      <span>Learn at your pace</span>
      <span>Track your progress</span>
      <span>Earn certificates</span>
      {data.products.some((product) => product.liveSessionCount > 0) && <span>Join live sessions</span>}
      {school.showCommunity && data.community && <span>Learn with a community</span>}
    </section>

    {notice && <div className="school-product-notice" role="status">{notice}</div>}
    {data.products.length > 0 && <>
      <section className="school-catalog-heading" id="products">
        <div><p className="sys-kicker">PROGRAMMES & MEMBERSHIPS</p><h2>Choose the complete path.</h2></div>
        <p>Bundles bring courses, live learning and community access together, so you can focus on the outcome instead of assembling it yourself.</p>
      </section>
      <section className="school-product-grid">
        {data.products.map((product) => <article className="school-product-card" key={product.id}>
          <div className="school-product-type"><span>{product.productType.replaceAll("_", " ")}</span><b>{product.priceCents ? `R${(product.priceCents / 100).toLocaleString("en-ZA")}` : "Free"}</b></div>
          <h3>{product.name}</h3>
          <p>{product.description || "A complete learning path with everything you need to make progress."}</p>
          <ul>
            {product.courseCount > 0 && <li>{product.courseCount} {product.courseCount === 1 ? "course" : "courses"}</li>}
            {product.liveSessionCount > 0 && <li>{product.liveSessionCount} upcoming live {product.liveSessionCount === 1 ? "session" : "sessions"}</li>}
            {product.includesCommunity ? <li>Private community</li> : null}
            {product.accessDurationDays > 0 ? <li>{product.accessDurationDays} days of access</li> : <li>Ongoing access</li>}
          </ul>
          {product.priceCents === 0
            ? <button className="school-primary-action" disabled={joining === product.id} onClick={() => joinProduct(product.id)}>{joining === product.id ? "Joining..." : "Join free"}</button>
            : school.supportEmail
              ? <a className="school-primary-action" href={`mailto:${school.supportEmail}?subject=${encodeURIComponent(`Access to ${product.name}`)}`}>Ask about access</a>
              : <button className="school-primary-action" disabled>Paid checkout coming next</button>}
          <small>{product.billingInterval === "monthly" ? "Billed monthly" : product.billingInterval === "yearly" ? "Billed yearly" : product.priceCents ? "One-time access" : "No payment required"}</small>
        </article>)}
      </section>
    </>}

    <section className="school-catalog-heading" id="courses">
      <div><p className="sys-kicker">COURSE CATALOGUE</p><h2>Choose where to begin.</h2></div>
      <p>Every course is created and supported by {school.name}. Sign in once, learn anywhere, and return to your progress at any time.</p>
    </section>

    {data.courses.length ? <section className="school-course-grid">
      {data.courses.map((course, index) => <article className="school-course-card" key={course.id}>
        <div className="school-course-art">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <b>{course.title.slice(0, 2).toUpperCase()}</b>
          <small>{course.lessonCount} lessons</small>
        </div>
        <div className="school-course-copy">
          <p className="sys-kicker">{course.priceCents ? "PREMIUM COURSE" : "FREE COURSE"}</p>
          <h3>{course.title}</h3>
          <p>{course.description || "A focused learning experience designed to help you make practical progress."}</p>
          <div><span>By {course.creator || school.name}</span><b>{course.priceCents ? `R${(course.priceCents / 100).toFixed(0)}` : "Free"}</b></div>
          <Link href={`/courses/${course.id}`}>Explore course <span>→</span></Link>
        </div>
      </article>)}
    </section> : <section className="school-empty-catalog">
      <p className="sys-kicker">COMING SOON</p>
      <h2>This academy is preparing its first course.</h2>
      <p>Check back after the creator publishes their first learning experience.</p>
    </section>}

    {school.showCommunity && data.community && <section className="school-community-cta">
      <div>
        <p className="sys-kicker">PRIVATE LEARNING COMMUNITY</p>
        <h2>{data.community.name}</h2>
        <p>{data.community.description}</p>
      </div>
      <Link href={`/schools/${school.slug}/community`}>Join the conversation →</Link>
    </section>}

    <footer className="school-storefront-footer">
      <div>
        <SchoolLogo school={school} />
        <p>{school.description || "Learning that moves people forward."}</p>
      </div>
      <nav>
        {data.products.length > 0 && <a href="#products">Products</a>}
        <a href="#courses">Courses</a>
        {school.supportEmail && <a href={`mailto:${school.supportEmail}`}>Support</a>}
        <a href={terms}>Terms</a>
        <a href={privacy}>Privacy</a>
      </nav>
      <small>Powered by <Link href="/">NorthStarLabs</Link></small>
    </footer>
  </main>;
}

function SchoolLogo({ school }: { school: School }) {
  return <>
    {school.logoUrl ? <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={school.logoUrl} alt="" />
    </> : <i>{school.name.slice(0, 2).toUpperCase()}</i>}
    <b>{school.name}</b>
  </>;
}
