import Image from "next/image";
import Link from "next/link";

export const WAITLIST = "mailto:hello@zazu.org.uk?subject=Zazu%20waitlist";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Zazu home">
      <Image src="/images/zazu-mark.png" alt="" width={24} height={32} priority />
      <span className="brand-word">zazu</span>
    </Link>
  );
}

export function Nav() {
  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Brand />
        <nav className="nav-links" aria-label="Main">
          <a href="#how" className="hide-sm">How it works</a>
          <a href="#gold" className="hide-sm">Gold</a>
          <a href="#faq" className="hide-sm">Questions</a>
          <a href={WAITLIST} className="btn">Join the waitlist</a>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <Brand />
          <nav aria-label="Footer">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/accessibility">Accessibility</Link>
            <Link href="/delete-account">Delete account</Link>
            <a href="mailto:support@zazu.org.uk">Support</a>
          </nav>
        </div>
        <p className="footer-legal">© 2026 Lewis White, trading as Zazu. A new word every morning.</p>
      </div>
    </footer>
  );
}
