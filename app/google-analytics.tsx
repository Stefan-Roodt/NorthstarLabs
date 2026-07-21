"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Consent = "granted" | "denied" | null;

function sendPageView(measurementId: string) {
  const browser = window as typeof window & {
    dataLayer?: unknown[];
    gtag?: (...values: unknown[]) => void;
  };
  browser.dataLayer = browser.dataLayer || [];
  browser.gtag = browser.gtag || function gtag(...values: unknown[]) {
    browser.dataLayer!.push(values);
  };
  browser.gtag("js", new Date());
  browser.gtag("config", measurementId, {
    send_page_view: false,
    anonymize_ip: true,
  });
  browser.gtag("event", "page_view", {
    page_title: document.title,
    page_location: location.href,
    page_path: `${location.pathname}${location.search}`,
  });
  if (!document.querySelector(`script[data-northstar-ga="${measurementId}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.northstarGa = measurementId;
    document.head.appendChild(script);
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const [measurementId, setMeasurementId] = useState("");
  const [consent, setConsent] = useState<Consent>(null);

  useEffect(() => {
    setConsent(localStorage.getItem("northstar_analytics_consent") as Consent);
  }, []);

  useEffect(() => {
    fetch(`/api/analytics-config?path=${encodeURIComponent(pathname || "/")}`)
      .then((response) => response.ok ? response.json() : { measurementId: "" })
      .then((result: { measurementId?: string }) => setMeasurementId(result.measurementId || ""))
      .catch(() => setMeasurementId(""));
  }, [pathname]);

  useEffect(() => {
    if (measurementId && consent === "granted") sendPageView(measurementId);
  }, [consent, measurementId, pathname]);

  function choose(value: Exclude<Consent, null>) {
    localStorage.setItem("northstar_analytics_consent", value);
    setConsent(value);
  }

  if (!measurementId || consent !== null) return null;
  return <aside className="analytics-consent" aria-label="Analytics choice">
    <div><b>Help us improve NorthstarLabs</b><p>Allow anonymous usage measurement so we can see what works. Learning content, private notes and assessment answers are never sent to Analytics. <Link href="/legal/privacy">Privacy details</Link></p></div>
    <div><button className="sys-primary" onClick={() => choose("granted")}>Allow analytics</button><button onClick={() => choose("denied")}>No thanks</button></div>
  </aside>;
}
