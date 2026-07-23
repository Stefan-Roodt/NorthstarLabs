import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { searchLandingPage, searchLandingPages } from "../../../lib/search-landing-pages";

export function generateStaticParams() {
  return searchLandingPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = searchLandingPage(slug);
  if (!page) return { title: "Guide not found", robots: { index: false, follow: false } };
  return {
    title: page.metaTitle,
    description: page.description,
    keywords: [page.shortTitle, page.eyebrow.toLowerCase(), "NorthstarLabs"],
    alternates: { canonical: `/solutions/${page.slug}` },
    openGraph: {
      title: `${page.metaTitle} | NorthstarLabs`,
      description: page.description,
      url: `/solutions/${page.slug}`,
      type: "website",
    },
  };
}

export default async function SearchLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = searchLandingPage(slug);
  if (!page) notFound();
  const related = page.related
    .map((relatedSlug) => searchLandingPage(relatedSlug))
    .filter((item) => item !== undefined);
  const pageUrl = `https://northstarlabs.co.za/solutions/${page.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: page.metaTitle,
        description: page.description,
        isPartOf: { "@id": "https://northstarlabs.co.za/#website" },
        about: { "@id": "https://northstarlabs.co.za/#organization" },
        inLanguage: "en-ZA",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://northstarlabs.co.za" },
          { "@type": "ListItem", position: 2, name: "Solutions", item: "https://northstarlabs.co.za/solutions" },
          { "@type": "ListItem", position: 3, name: page.shortTitle, item: pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return <main className="search-landing">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <header className="search-nav">
      <Link className="system-brand" href="/">* NORTHSTARLABS</Link>
      <nav>
        <Link href="/solutions">Explore</Link>
        <Link href="/courses">Courses</Link>
        <Link href="/tutors">Coaches</Link>
        <Link href="/login?mode=login">Sign in</Link>
        <Link className="search-nav-join" href="/login?mode=signup&next=%2Fwelcome">Join free</Link>
      </nav>
    </header>

    <div className="search-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/solutions">Solutions</Link><span>/</span><b>{page.shortTitle}</b></div>

    <section className="search-hero">
      <div className="search-hero-copy">
        <p className="sys-kicker">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p>{page.lead}</p>
        <div><Link className="button" href={page.primary.href}>{page.primary.label} →</Link><Link className="search-secondary" href={page.secondary.href}>{page.secondary.label} →</Link></div>
      </div>
      <aside aria-label="What to expect">
        <span>YOUR NORTHSTAR ROUTE</span>
        <strong>Learn.</strong>
        <i />
        <strong>Ask.</strong>
        <i />
        <strong>Progress.</strong>
        <small>Use structured learning for the path and human expertise for the roadblock.</small>
      </aside>
    </section>

    <div className="search-chips">{page.chips.map((chip) => <span key={chip}>✓ {chip}</span>)}</div>

    <section className="search-problem">
      <div><p className="sys-kicker">THE DECISION BEHIND THE SEARCH</p><h2>{page.problemHeading}</h2></div>
      <p>{page.problemText}</p>
    </section>

    <section className="search-fit">
      {page.fitItems.map((item, index) => <article key={item.title}>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <h2>{item.title}</h2>
        <p>{item.text}</p>
      </article>)}
    </section>

    <section className="search-route">
      <header><p className="sys-kicker">HOW NORTHSTARLABS HELPS</p><h2>A useful route, not another dead end.</h2></header>
      <div>{page.route.map((step, index) => <article key={step.label}>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <p className="sys-kicker">{step.label}</p>
        <h3>{step.title}</h3>
        <p>{step.text}</p>
      </article>)}</div>
      <footer><p>{page.proofNote}</p><Link className="button" href={page.primary.href}>{page.primary.label} →</Link></footer>
    </section>

    <section className="search-checklist">
      <div><p className="sys-kicker">MAKE A BETTER DECISION</p><h2>{page.decisionTitle}</h2><p>{page.decisionIntro}</p></div>
      <ol>{page.checklist.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ol>
    </section>

    <section className="search-faq">
      <div><p className="sys-kicker">CLEAR ANSWERS</p><h2>What people ask before taking the next step.</h2></div>
      <div>{page.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}</div>
    </section>

    <section className="search-related">
      <header><p className="sys-kicker">RELATED ROUTES</p><h2>Keep exploring.</h2></header>
      <div>{related.map((item) => <Link href={`/solutions/${item.slug}`} key={item.slug}><span>EXPLORE</span><h3>{item.shortTitle}</h3><p>{item.description}</p><strong>See this guide →</strong></Link>)}</div>
    </section>

    <section className="search-cta"><p className="sys-kicker">LEARN. ASK. PROGRESS.</p><h2>Start with the outcome—not the product category.</h2><div><Link className="button" href="/find">Find my best next step →</Link><Link href="/#request-help">Ask NorthstarLabs to find something →</Link></div></section>

    <footer className="search-footer">
      <Link className="system-brand" href="/">* NORTHSTARLABS</Link>
      <p>Courses for the path. Human coaching for the roadblocks.</p>
      <nav><Link href="/about">About</Link><Link href="/solutions">Solutions</Link><Link href="/courses">Courses</Link><Link href="/tutors">Coaches</Link><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link></nav>
    </footer>
  </main>;
}
