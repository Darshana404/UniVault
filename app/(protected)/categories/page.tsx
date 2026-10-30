"use client";

import Link from "next/link";
import { VALID_SUBJECTS } from "@/lib/pdf/taxonomy";

export default function ProtectedCategoriesPage() {
  return (
    <div className="categories-page">
      <Link href="/home" className="pdf-detail__back">
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>Back to home</span>
      </Link>

      <h1 className="page-title">All Categories</h1>

      <div className="categories-grid">
        {VALID_SUBJECTS.map((subject) => (
          <Link
            key={subject}
            href={`/library?subject=${encodeURIComponent(subject)}`}
            className="category-card card--category"
          >
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
            <span className="card--category__label section-label">
              {subject}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

