"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PublicPortfolio = {
  portfolio: { learnerName: string; headline: string; bio: string; updatedAt: number };
  certificates: Array<{ code: string; title: string; courseTitle: string; issuerName: string; achievedAt: number }>;
  assessments: Array<{ id: string; title: string; lessonTitle: string; courseTitle: string; issuerName: string; achievedAt: number; score: number | null }>;
  evidence: Array<{ evidenceType: string; title: string; description: string; skills: string; evidenceUrl: string | null; achievedAt: number | null }>;
  proofCount: number;
};

export default function PublicPortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const [data, setData] = useState<PublicPortfolio | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(async ({ slug }) => {
      const response = await fetch(`/api/portfolio/${encodeURIComponent(slug)}`);
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Portfolio not found.");
        return;
      }
      setData(result);
    });
  }, [params]);

  if (error) return <main className="system-loading"><div><b>Portfolio unavailable</b><p>{error}</p><Link href="/courses">Explore NorthstarLabs courses</Link></div></main>;
  if (!data) return <main className="system-loading"><p>Checking learning evidence…</p></main>;
  const initials = data.portfolio.learnerName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return <main className="public-portfolio">
    <header className="public-portfolio-nav">
      <Link className="system-brand" href="/">✦ NORTHSTARLABS</Link>
      <nav><Link href="/courses">Explore courses</Link><Link className="sys-primary" href="/login?mode=signup&next=%2Fwelcome%3Fpath%3Dlearner">Build your free portfolio</Link></nav>
    </header>
    <section className="public-portfolio-hero">
      <div className="public-portfolio-person"><span>{initials}</span><div><p className="sys-kicker">PROOF-OF-LEARNING PORTFOLIO</p><h1>{data.portfolio.learnerName}</h1></div></div>
      <div className="public-portfolio-promise"><h2>{data.portfolio.headline}</h2><p>{data.portfolio.bio || "A learner-controlled record of verified achievement and practical work."}</p></div>
      <dl><div><dt>Evidence selected</dt><dd>{data.proofCount}</dd></div><div><dt>Verified certificates</dt><dd>{data.certificates.length}</dd></div><div><dt>Recorded assessments</dt><dd>{data.assessments.length}</dd></div></dl>
    </section>

    <section className="public-portfolio-body">
      {data.certificates.length > 0 && <section className="public-proof-section">
        <header><p className="sys-kicker">ACADEMY-VERIFIED</p><h2>Certificates with live status.</h2><p>Each record links to the issuing academy’s independent verification page.</p></header>
        <div className="public-certificate-grid">{data.certificates.map((item) => <article key={item.code}>
          <span>✓</span><small>{item.issuerName}</small><h3>{item.title}</h3><p>{item.courseTitle}</p><footer><time>{new Date(item.achievedAt).toLocaleDateString("en-ZA")}</time><Link href={`/certificates/${item.code}`}>Verify certificate →</Link></footer>
        </article>)}</div>
      </section>}

      {data.assessments.length > 0 && <section className="public-proof-section public-assessment-section">
        <header><p className="sys-kicker">NORTHSTAR-RECORDED</p><h2>Assessments passed.</h2><p>Completion is drawn from saved platform attempts. Scores appear only when the learner chooses to disclose them.</p></header>
        <div className="public-assessment-list">{data.assessments.map((item) => <article key={item.id}>
          <div><small>{item.issuerName} · {item.courseTitle}</small><h3>{item.title}</h3><p>{item.lessonTitle}</p></div>
          <div><b>{item.score === null ? "PASSED" : `${item.score}%`}</b><span>{item.score === null ? "Score kept private" : "Best recorded result"}</span></div>
        </article>)}</div>
      </section>}

      {data.evidence.length > 0 && <section className="public-proof-section public-work-section">
        <header><p className="sys-kicker">LEARNER-SUBMITTED</p><h2>Projects and practical proof.</h2><p>These items are selected by the learner and are not presented as academy-verified evidence.</p></header>
        <div className="public-work-grid">{data.evidence.map((item, index) => <article key={`${item.title}-${index}`}>
          <div><span>{String(index + 1).padStart(2, "0")}</span><small>{item.evidenceType.replaceAll("_", " ")}</small></div><h3>{item.title}</h3><p>{item.description}</p>
          {item.skills && <ul>{item.skills.split(/[,\n]/).map((skill) => skill.trim()).filter(Boolean).map((skill) => <li key={skill}>{skill}</li>)}</ul>}
          <footer>{item.achievedAt ? <time>{new Date(item.achievedAt).toLocaleDateString("en-ZA")}</time> : <span>Evidence selected by learner</span>}{item.evidenceUrl && <a href={item.evidenceUrl} target="_blank" rel="noreferrer">Open evidence ↗</a>}</footer>
        </article>)}</div>
      </section>}

      {!data.proofCount && <section className="public-no-proof"><h2>This portfolio is published, but no evidence is visible yet.</h2><p>The learner controls every item and may add proof later.</p></section>}
    </section>
    <footer className="public-portfolio-footer"><div><b>What the labels mean</b><p>Verified = live academy certificate. Recorded = saved Northstar assessment. Submitted = learner-provided work.</p></div><div><span>Last updated {new Date(data.portfolio.updatedAt).toLocaleDateString("en-ZA")}</span><Link href="/">Powered by NorthstarLabs →</Link></div></footer>
  </main>;
}
