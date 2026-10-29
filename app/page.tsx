import Link from "next/link";
import "@/styles/pages/home.css";

export default function Home() {
  return (
    <div className="layout">
      {/* Navigation */}
      <header className="navbar">
        <Link href="/" className="navbar__logo logo">
          <span>Uni</span>
          <span className="navbar__logo-accent">Vault</span>
        </Link>

        <div className="navbar__search" />

        <div className="navbar__actions">
          <Link href="/login" className="btn btn--secondary">
            Sign In
          </Link>
          <Link href="/login" className="btn btn--primary">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section - Centered */}
      <main className="layout__main layout__main--center">
        <div className="badge badge--accent">
          University-Gated Academic Sharing
        </div>

        <h1 className="page-title hero-title">
          The Secure Academic Vault for University Students
        </h1>

        <p className="pdf-meta hero-subtitle">
          Upload, discover, and organize lecture notes, study materials, and past
          papers. Authenticated exclusively through verified institutional email domains.
        </p>

        {/* CTA Buttons */}
        <div className="hero-cta">
          <div className="navbar__actions">
            <Link href="/login" className="btn btn--primary">
              <span>Access Your Vault</span>
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link href="/dashboard" className="btn btn--secondary">
              <span>Browse Documents</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="categories-grid hero-grid">
          {/* Feature 1 */}
          <div className="card card--feature">
            <div className="card--category__icon card--feature__icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 className="card__name card--feature__title">Verified Access</h3>
            <p className="pdf-meta">
              One-time code verification restricted strictly to registered university email domains.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card card--feature">
            <div className="card--category__icon card--feature__icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="card__name card--feature__title">Academic Repository</h3>
            <p className="pdf-meta">
              Organized by course and semester. Access vetted lecture slides and past papers.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card card--feature">
            <div className="card--category__icon card--feature__icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="card__name card--feature__title">Instant Search</h3>
            <p className="pdf-meta">
              Find exactly what you need quickly with semantic document embeddings and taxonomy.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="navbar footer-nav">
        <p className="pdf-meta">© {new Date().getFullYear()} UniVault — Academic Resource Platform</p>
        <div className="navbar__actions">
          <Link href="/login" className="section-header__link">
            Login
          </Link>
          <span className="pdf-meta">•</span>
          <span className="pdf-meta">Encrypted Storage</span>
        </div>
      </footer>
    </div>
  );
}
