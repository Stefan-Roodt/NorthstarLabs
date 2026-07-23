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
  tutors: PublicTutor[];
};

type PublicTutor = {
  id: string;
  slug: string;
  displayName: string;
  headline: string;
  subjects: string[];
  priceCents: number;
  priceUnit: string;
  sessionMode: string;
  location: string;
  availability: string;
  photoUrl: string | null;
  verified: boolean;
};

function productFit(productType: string) {
  if (productType === "membership") return "Ongoing learning, support and fresh material";
  if (productType === "live_program") return "Accountability, deadlines and learning together";
  return "A complete, structured path you can follow at your pace";
}

export default function SchoolPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState("");
  const [data, setData] = useState<SchoolData | null>(null);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState("");
  const [notice, setNotice] = useState("");
  const [signedIn, setSignedIn] = useState(false);
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

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: sessionData }) => setSignedIn(Boolean(sessionData.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  if (error) {
    return <main className="system-loading"><div>
      <b>NorthstarLabs</b>
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
  const hasLiveLearning = data.products.some((product) => product.liveSessionCount > 0);
  const hasCommunity = Boolean(school.showCommunity && data.community);
  const primaryDestination = data.products.length
    ? "#products"
    : data.courses.length
      ? "#courses"
      : data.tutors.length
        ? "#tutors"
        : "#courses";
  const primaryLabel = data.products.length
    ? "Explore programmes"
    : data.courses.length
      ? "Explore courses"
      : data.tutors.length
        ? "Find a tutor"
        : "Explore courses";

  async function joinProduct(productId: string, paid = false) {
    if (!supabase) return;
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) {
      window.location.assign(`/login?next=${encodeURIComponent(`/schools/${school.slug}#products`)}`);
      return;
    }
    setJoining(productId);
    setNotice("");
    const response = await fetch(paid ? "/api/payfast/checkout" : "/api/products/claim", {
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
    if (result.action && result.fields) {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = result.action;
      for (const [name, value] of Object.entries(result.fields as Record<string, string>)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
      return;
    }
    setNotice("Access granted. Your courses and live sessions are ready.");
    window.location.assign(result.courseIds?.[0] ? `/learn/${result.courseIds[0]}` : "/live");
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.assign(`/schools/${school.slug}`);
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
        {signedIn ? <div className="school-account-actions">
          <Link href="/learn">My learning</Link>
          <Link href="/account">Account settings</Link>
          <button type="button" onClick={signOut}>Sign out</button>
        </div> : <Link className="school-sign-in" href={`/login?next=${encodeURIComponent(`/schools/${school.slug}`)}`}>Sign in</Link>}
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
          <a className="school-primary-action" href={primaryDestination}>{primaryLabel}</a>
          {school.showCommunity && data.community &&
            <Link href={`/schools/${school.slug}/community`}>Enter the community →</Link>}
        </div>
      </div>
      <aside>
        <strong>{String(data.products.length + data.courses.length).padStart(2, "0")}</strong>
        <span>learning options</span>
      </aside>
    </section>

    <section className="school-trust-strip">
      <span>Learn at your pace</span>
      <span>Track your progress</span>
      <span>Earn certificates</span>
      {hasLiveLearning && <span>Join live sessions</span>}
      {hasCommunity && <span>Learn with a community</span>}
    </section>

    {(data.courses.length > 0 || data.products.length > 0) && <section className="school-learning-modes" aria-labelledby="learning-mode-title">
      <div className="school-mode-heading">
        <p className="sys-kicker">CHOOSE WHAT FITS YOU</p>
        <h2 id="learning-mode-title">How do you learn best?</h2>
        <p>Start with the experience that matches the support, pace and accountability you want.</p>
      </div>
      <div>
        {data.courses.length > 0 && <a href="#courses">
          <span>01</span>
          <small>FLEXIBLE</small>
          <h3>Learn at your pace</h3>
          <p>Choose a focused course, work through it when it suits you and return to saved progress.</p>
          <b>Explore courses →</b>
        </a>}
        {data.products.length > 0 && <a href="#products">
          <span>02</span>
          <small>STRUCTURED</small>
          <h3>Follow a complete path</h3>
          <p>Join a bundle or membership designed around an outcome, not a collection of disconnected lessons.</p>
          <b>Explore programmes →</b>
        </a>}
        {(hasLiveLearning || hasCommunity) && <a href={hasLiveLearning ? "#products" : `/schools/${school.slug}/community`}>
          <span>03</span>
          <small>SUPPORTED</small>
          <h3>Learn with people</h3>
          <p>Use live sessions and community support to ask questions, stay accountable and keep moving.</p>
          <b>{hasLiveLearning ? "Find guided learning" : "Enter the community"} →</b>
        </a>}
      </div>
    </section>}

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
          <p className="school-product-fit"><span>BEST FOR</span>{productFit(product.productType)}</p>
          <ul>
            {product.courseCount > 0 && <li>{product.courseCount} {product.courseCount === 1 ? "course" : "courses"}</li>}
            {product.liveSessionCount > 0 && <li>{product.liveSessionCount} upcoming live {product.liveSessionCount === 1 ? "session" : "sessions"}</li>}
            {product.includesCommunity ? <li>Private community</li> : null}
            {product.accessDurationDays > 0 ? <li>{product.accessDurationDays} days of access</li> : <li>Ongoing access</li>}
          </ul>
          <button
            className="school-primary-action"
            disabled={joining === product.id}
            onClick={() => joinProduct(product.id, product.priceCents > 0)}
          >
            {joining === product.id
              ? product.priceCents > 0 ? "Opening PayFast..." : "Joining..."
              : product.priceCents > 0 ? "Pay securely with PayFast" : "Join free"}
          </button>
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

    {data.tutors.length > 0 && <>
      <section className="school-catalog-heading" id="tutors">
        <div><p className="sys-kicker">ONE-TO-ONE SUPPORT</p><h2>Find the person who can help.</h2></div>
        <p>Compare subjects, session formats and published rates, then open the profile to check availability or send a protected enquiry through NorthstarLabs.</p>
      </section>
      <section className="school-tutor-grid">
        {data.tutors.slice(0, 3).map((tutor) => <article className="school-tutor-card" key={tutor.id}>
          <div className="school-tutor-person">
            {tutor.photoUrl
              ? <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tutor.photoUrl} alt="" />
              </>
              : <span>{tutor.displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>}
            <div><small>{tutor.verified ? "✓ VERIFIED TUTOR" : "ACADEMY TUTOR"}</small><h3>{tutor.displayName}</h3></div>
          </div>
          <p>{tutor.headline}</p>
          <div className="school-tutor-subjects">{tutor.subjects.slice(0, 4).map((subject) => <span key={subject}>{subject}</span>)}</div>
          <dl>
            <div><dt>Sessions</dt><dd>{tutor.sessionMode.replaceAll("_", " ")}</dd></div>
            <div><dt>Rate</dt><dd>{tutor.priceCents ? `R${(tutor.priceCents / 100).toLocaleString("en-ZA")}/${tutor.priceUnit}` : "On enquiry"}</dd></div>
          </dl>
          <Link href={`/schools/${school.slug}/tutors/${tutor.slug}`}>View profile & availability →</Link>
        </article>)}
      </section>
      <div className="school-tutor-all"><Link href={`/schools/${school.slug}/tutors`}>See every available tutor →</Link></div>
    </>}

    {school.showCommunity && data.community && <section className="school-community-cta">
      <div>
        <p className="sys-kicker">PRIVATE LEARNING COMMUNITY</p>
        <h2>{data.community.name}</h2>
        <p>{data.community.description}</p>
      </div>
      <Link href={`/schools/${school.slug}/community`}>Join the conversation →</Link>
    </section>}

    {(data.courses.length > 0 || data.products.length > 0) && <section className="school-after-join">
      <div>
        <p className="sys-kicker">SIMPLE FROM THE START</p>
        <h2>What happens after you join?</h2>
        <p>One account keeps the whole learning experience together.</p>
      </div>
      <ol>
        <li><span>01</span><div><b>Get immediate access</b><p>Free learning opens in your library as soon as you join.</p></div></li>
        <li><span>02</span><div><b>Know your next step</b><p>Your learning home brings the right course, live session and community back into view.</p></div></li>
        <li><span>03</span><div><b>Keep proof of progress</b><p>Your progress is saved and completed courses stay available for review.</p></div></li>
      </ol>
    </section>}

    <footer className="school-storefront-footer">
      <div>
        <SchoolLogo school={school} />
        <p>{school.description || "Learning that moves people forward."}</p>
      </div>
      <nav>
        {data.products.length > 0 && <a href="#products">Products</a>}
        <a href="#courses">Courses</a>
        {data.tutors.length > 0 && <Link href={`/schools/${school.slug}/tutors`}>Tutors</Link>}
        {school.supportEmail && <a href={`mailto:${school.supportEmail}`}>Support</a>}
        <a href={terms}>Terms</a>
        <a href={privacy}>Privacy</a>
      </nav>
      <small>Powered by <Link href="/">NorthstarLabs</Link></small>
    </footer>
    {(data.courses.length > 0 || data.products.length > 0 || data.tutors.length > 0) && <div className="school-mobile-join">
      <div><small>Ready when you are</small><b>Choose your learning path</b></div>
      <a href={primaryDestination}>Explore →</a>
    </div>}
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
