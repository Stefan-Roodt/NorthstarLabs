import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="legal-page">
      <header className="legal-top">
        <Link className="system-brand" href="/">* NORTHSTARLABS</Link>
        <nav aria-label="Legal navigation">
          <Link href="/legal/terms">Terms of Service</Link>
          <Link href="/legal/privacy">Privacy Policy</Link>
          <Link href="/login">Sign in</Link>
        </nav>
      </header>
      {children}
      <footer className="legal-footer">
        <span>(c) 2026 NorthstarLabs. All rights reserved.</span>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/privacy">Privacy</Link>
        </nav>
      </footer>
    </main>
  );
}
