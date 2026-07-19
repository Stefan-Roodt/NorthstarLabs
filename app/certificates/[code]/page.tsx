"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useState } from "react";

type Certificate = {
  code: string;
  issuedAt: number;
  courseTitle: string;
  learnerName: string;
  certificateTitle: string;
  accentColor: string;
  status: string;
  expiresAt: number | null;
  replacedByCode: string | null;
  issuerName: string;
  valid: boolean;
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
      <Link href="/learn">← My learning</Link>
      <div>
        <button onClick={() => window.print()}>Print</button>
        {certificate.valid && <a href={`/api/certificates/${certificate.code}/pdf`}>Download PDF</a>}
      </div>
    </div>
    <article
      className={`certificate ${certificate.valid ? "" : "certificate-invalid"}`}
      style={{ "--certificate-accent": certificate.accentColor } as CSSProperties}
    >
      <div className={`certificate-status ${certificate.valid ? "valid" : "invalid"}`}>
        {certificate.valid ? "Verified · active" : certificate.status === "active" ? "Expired" : certificate.status}
      </div>
      <div className="certificate-mark">✦</div>
      <p className="sys-kicker">{certificate.issuerName}</p>
      <h1>{certificate.certificateTitle}</h1>
      <p>This certifies that</p>
      <h2>{certificate.learnerName}</h2>
      <p>has successfully completed</p>
      <h3>{certificate.courseTitle}</h3>
      <footer>
        <div><span>Issued</span><b>{new Date(certificate.issuedAt).toLocaleDateString()}</b></div>
        <div><span>Certificate ID</span><b>{certificate.code}</b></div>
        <div><span>Valid until</span><b>{certificate.expiresAt ? new Date(certificate.expiresAt).toLocaleDateString() : "No expiry"}</b></div>
      </footer>
      <p className="certificate-verification">This public page verifies the certificate’s current status.</p>
      {certificate.replacedByCode && <Link className="certificate-replacement" href={`/certificates/${certificate.replacedByCode}`}>View the replacement certificate →</Link>}
    </article>
  </main>;
}
