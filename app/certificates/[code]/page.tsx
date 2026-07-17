"use client";

import { useEffect, useState } from "react";

type Certificate = {
  code: string;
  issuedAt: number;
  courseTitle: string;
  learnerName: string;
};

export default function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(async ({ code }) => {
      const response = await fetch(`/api/certificates/${encodeURIComponent(code)}`);
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Certificate not found.");
        return;
      }
      setCertificate(result);
    });
  }, [params]);

  if (error) return <main className="system-loading"><div><b>Certificate unavailable</b><p>{error}</p></div></main>;
  if (!certificate) return <main className="system-loading"><p>Preparing certificate...</p></main>;

  return <main className="certificate-page">
    <div className="certificate-toolbar">
      <a href="/learn">← My learning</a>
      <button onClick={() => window.print()}>Print or save PDF</button>
    </div>
    <article className="certificate">
      <div className="certificate-mark">✦</div>
      <p className="sys-kicker">NORTHSTARLABS</p>
      <h1>Certificate<br />of Completion</h1>
      <p>This certifies that</p>
      <h2>{certificate.learnerName}</h2>
      <p>has successfully completed</p>
      <h3>{certificate.courseTitle}</h3>
      <footer>
        <div><span>Issued</span><b>{new Date(certificate.issuedAt).toLocaleDateString()}</b></div>
        <div><span>Certificate ID</span><b>{certificate.code}</b></div>
      </footer>
    </article>
  </main>;
}
