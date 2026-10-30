"use client";

import Link from "next/link";
import "@/styles/pages/home.css";
//import { useCurrentUser } from "@/hooks/useAuth";
import { useDocuments, useSubjects } from "@/hooks/useDocuments";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { Spinner } from "@/components/ui/Spinner";

export default function DashboardPage() {
  //const { data: user } = useCurrentUser();
  const { data: subjects } = useSubjects();

  // Fetch the 6 most recent approved documents
  const { data, isLoading, error } = useDocuments({
    limit: 6,
    sort: "created_at",
    order: "desc",
  });

  const displaySubjects = (subjects && subjects.length > 0
    ? subjects.slice(0, 8)
    : [
        "Common (First Year)",
        "B.Tech CSE (Core)",
        "B.Tech AI & DS",
        "B.Tech CSE (Cyber Security)",
        "B.Tech IT",
        "B.Tech ECE",
        "B.Tech Mechanical",
        "B.Com General",
      ]
  );

  return (
    <div className="home">
      {/* Upload button placement */}
      <div className="home__upload-container">
        <Link href="/upload" className="btn btn--primary btn--upload">
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Upload Academic PDF</span>
        </Link>
      </div>

      {/* Recents row section */}
      <section className="home__section">
        <div className="section-header">
          <span className="section-header__label section-label">
            Recent Documents
          </span>
          <Link href="/documents" className="section-header__link">
            <span>View all</span>
            <svg
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {isLoading ? (
          <div className="home__empty">
            <Spinner size="md" />
          </div>
        ) : error ? (
          <div className="home__empty">
            <p className="text-danger">Failed to load recent documents</p>
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="home__empty">
            <p>No documents uploaded yet. Be the first to share one!</p>
          </div>
        ) : (
          <div className="recents-row">
            {data.data.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </section>

      {/* Categories grid section */}
      <section className="home__section">
        <div className="section-header">
          <span className="section-header__label section-label">
            Academic Categories
          </span>
          <Link href="/categories" className="section-header__link">
            <span>View all</span>
            <svg
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        <div className="categories-grid">
          {displaySubjects.map((subject) => (
            <Link
              key={subject}
              href={`/documents?subject=${encodeURIComponent(subject)}`}
              className="card--category"
            >
              {/* Icon container: 32px square, background --color-bg, border --border, border-radius --radius-icon, icon colour --color-accent */}
              <div className="card--category__icon">
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              {/* Label: 11px, --color-text-secondary */}
              <span className="card--category__label section-label">
                {subject}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
