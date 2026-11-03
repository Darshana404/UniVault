import Link from "next/link";
import "@/styles/pages/home.css";

export default function Home() {
  return (
    <div className="layout">
      {/* Navigation */}
      <header className="navbar">
        <Link
          href="/"
          className="navbar__logo logo"
          style={{ fontSize: "20px" }}
        >
          <span>Uni</span>
          <span className="navbar__logo-accent" style={{ color: "#F4917A" }}>
            Vault
          </span>
        </Link>

        <div className="navbar__search" />

        <div className="navbar__actions">
          <Link
            href="/login"
            className="btn btn--secondary"
            style={{
              background: "transparent",
              border: "1px solid #F4917A",
              color: "#F4917A",
              fontSize: "15px",
            }}
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section - Centered */}
      <main className="layout__main" style={{ alignItems: "center", padding: "0", maxWidth: "none" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", padding: "var(--spacing-page) var(--spacing-page) 0" }}>
          <div
            className="badge badge--accent"
            style={{
              background: "rgba(240,84,124,0.15)",
              border: "1px solid #F4917A",
              color: "#F4917A",
              fontSize: "13px",
              padding: "4px 12px",
            }}
          >
            University-Gated Academic Sharing
          </div>

          <div
            className="landing-brand"
            style={{ fontSize: "clamp(34px, 5.5vw, 48px)" }}
          >
            Uni<span style={{ color: "#F4917A" }}>Vault</span>
          </div>

          <h1
            className="page-title hero-title"
            style={{ fontSize: "clamp(26px, 3.8vw, 36px)", lineHeight: 1.25 }}
          >
            The Secure Academic Vault for University Students
          </h1>

          <p
            className="pdf-meta hero-subtitle"
            style={{ fontSize: "15px", lineHeight: 1.6 }}
          >
            Upload, discover, and organize lecture notes, study materials, and past
            papers. Authenticated exclusively through verified institutional email domains.
          </p>
        </div>

        {/* Section wrapping Access Your Vault button AND the three feature cards */}
        <div
          style={{
            background:
            "linear-gradient(180deg, #101522 0%, #443044 32%, #F4917A 100%)",
            width: "100%",
            padding: "40px 20px 100px",
            minHeight: "520px",
            boxSizing: "border-box"
          }}
        >
          {/* CTA Buttons */}
          <div className="hero-cta" style={{ margin: "0 auto 32px", display: "flex", justifyContent: "center" }}>
            <div className="navbar__actions">
              <Link
                href="/login"
                className="btn btn--primary"
                style={{
                  background: "linear-gradient(135deg, #F0547C 0%, #F4917A 55%, #F9C4A8 100%)",
                  color: "#ffffff",
                  border: "none",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                <span>Access Your Vault</span>
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div
            className="hero-grid"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "24px",
              flexWrap: "nowrap",
              width: "100%",
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            {/* Feature 1 */}
            <div
              className="card card--feature"
              style={{
                flex: 1,
                minWidth: 0,
                maxWidth: "280px",
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(6px)",
              }}
            >
              <div
                className="card--category__icon card--feature__icon"
                style={{ background: " rgba(255, 255, 255, 0.18)", border: "1px solid rgba(255, 255, 255, 0.9)" }}
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.75}
                  stroke="currentColor"
                  style={{ color: "#ffffff" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>
              <h3
                className="card__name card--feature__title"
                style={{ color: "#ffffff", fontSize: "16px", fontWeight: 700 }}
              >
                Verified Access
              </h3>
              <p
                className="pdf-meta"
                style={{ color: "#ffffff", fontSize: "13px", lineHeight: 1.5 }}
              >
                One-time code verification restricted strictly to registered
                university email domains.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className="card card--feature"
              style={{
                flex: 1,
                minWidth: 0,
                maxWidth: "280px",
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(6px)",
              }}
            >
              <div
                className="card--category__icon card--feature__icon"
                style={{ background: " rgba(255, 255, 255, 0.18)", border: "1px solid rgba(255, 255, 255, 0.9)" }}
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.75}
                  stroke="currentColor"
                  style={{ color: "#ffffff" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <h3
                className="card__name card--feature__title"
                style={{ color: "#ffffff", fontSize: "16px", fontWeight: 700 }}
              >
                Academic Repository
              </h3>
              <p
                className="pdf-meta"
                style={{ color: "#ffffff", fontSize: "13px", lineHeight: 1.5 }}
              >
                Organized by course and semester. Access vetted lecture slides
                and past papers.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="card card--feature"
              style={{
                flex: 1,
                minWidth: 0,
                maxWidth: "280px",
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(6px)",
              }}
            >
              <div
                className="card--category__icon card--feature__icon"
                style={{ background: " rgba(255, 255, 255, 0.18)", border: "1px solid rgba(255, 255, 255, 0.9)" }}
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.75}
                  stroke="currentColor"
                  style={{ color: "#ffffff" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <h3
                className="card__name card--feature__title"
                style={{ color: "#ffffff", fontSize: "16px", fontWeight: 700 }}
              >
                Instant Search
              </h3>
              <p
                className="pdf-meta"
                style={{ color: "#ffffff", fontSize: "13px", lineHeight: 1.5 }}
              >
                Find exactly what you need quickly with semantic document
                embeddings and taxonomy.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
