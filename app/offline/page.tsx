import Link from "next/link";

export default function OfflinePage() {
  return <main className="offline-page">
    <section>
      <p className="sys-kicker">YOU ARE OFFLINE</p>
      <h1>Your learning is still here.</h1>
      <p>Reconnect to open protected lessons, live meeting links and saved progress. NorthStarLabs will retry when your connection returns.</p>
      <Link className="sys-primary" href="/learn">Try my learning again</Link>
    </section>
  </main>;
}
