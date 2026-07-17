export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="legal-page">
      <header className="legal-top">
        <a className="system-brand" href="/">✦ NORTHSTARLABS</a>
        <nav aria-label="Legal navigation">
          <a href="/legal/terms">Terms of Service</a>
          <a href="/legal/privacy">Privacy Policy</a>
          <a href="/login">Sign in</a>
        </nav>
      </header>
      {children}
      <footer className="legal-footer">
        <span>© 2026 Northstar Labs. All rights reserved.</span>
        <nav>
          <a href="/">Home</a>
          <a href="/legal/terms">Terms</a>
          <a href="/legal/privacy">Privacy</a>
        </nav>
      </footer>
    </main>
  );
}
