import Link from 'next/link';

export function Footer(): JSX.Element {
  return (
    <footer className="footer footer-center bg-primary font-custombold text-primary-content rounded p-6">
      <nav className="grid grid-flow-col gap-4">
        <Link href="/disclaimer" className="link link-hover">Disclaimer</Link>
        <Link href="/terms" className="link link-hover">Terms of Service</Link>
        <Link href="/privacy" className="link link-hover">Privacy Policy</Link>
      </nav>
      <aside>
        <p>Copyright © {new Date().getFullYear()} Audric Serador / IllinEats. All rights reserved.</p>
      </aside>
    </footer>
  );
}