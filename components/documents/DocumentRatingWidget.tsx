"use client";

import { useState, useEffect } from "react";
import { submitDocumentRating } from "@/lib/ratings";

interface DocumentRatingWidgetProps {
  documentId: string;
  initialAvg?: number;
  initialCount?: number;
  initialUserRating?: number | null;
  onRatingUpdated?: (stats: { rating_avg: number; rating_count: number; user_rating: number | null }) => void;
}

export function DocumentRatingWidget({
  documentId,
  initialAvg = 0,
  initialCount = 0,
  initialUserRating = null,
  onRatingUpdated,
}: DocumentRatingWidgetProps) {
  const [avg, setAvg] = useState(initialAvg);
  const [count, setCount] = useState(initialCount);
  const [userRating, setUserRating] = useState<number | null>(initialUserRating);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when props arrive asynchronously from API
  useEffect(() => {
    if (initialUserRating !== undefined) {
      setUserRating(initialUserRating);
    }
  }, [initialUserRating]);

  useEffect(() => {
    if (initialAvg !== undefined) {
      setAvg(initialAvg);
    }
  }, [initialAvg]);

  useEffect(() => {
    if (initialCount !== undefined) {
      setCount(initialCount);
    }
  }, [initialCount]);

  const hasRated = userRating !== null && userRating > 0;
  const activeRating = hoverRating !== null ? hoverRating : (userRating ?? 0);

  async function handleStarClick(ratingValue: number) {
    if (isSubmitting || hasRated) return;
    setIsSubmitting(true);
    try {
      const updated = await submitDocumentRating(documentId, ratingValue);
      setAvg(updated.rating_avg);
      setCount(updated.rating_count);
      setUserRating(updated.user_rating);
      if (onRatingUpdated) onRatingUpdated(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit rating.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="meta-card" style={{ gridColumn: "1 / -1" }}>
      <span className="meta-card__label meta-label">Rating & Feedback</span>
      <div
        className="meta-card__content"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        {/* Left side: Average display */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: avg > 0 ? "#F0547C" : "var(--color-text-secondary)",
            }}
          >
            {avg > 0 ? avg.toFixed(1) : "—"}
          </span>
          <span style={{ color: "#F0547C", display: "inline-flex" }}>
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </span>
          <span
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
            }}
          >
            ({count} {count === 1 ? "rating" : "ratings"})
          </span>
        </div>

        {/* Right side: Interactive stars for current user */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              marginRight: "0.25rem",
            }}
          >
            {hasRated ? "You rated:" : "Rate this document:"}
          </span>
          <div
            style={{ display: "inline-flex", gap: "3px" }}
            onMouseLeave={() => {
              if (!hasRated) setHoverRating(null);
            }}
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= activeRating;
              return (
                <button
                  key={star}
                  type="button"
                  disabled={isSubmitting || hasRated}
                  aria-label={hasRated ? `Rated ${userRating} stars` : `Rate ${star} star${star > 1 ? "s" : ""}`}
                  title={hasRated ? `You already rated this document ${userRating} stars` : `Rate ${star} star${star > 1 ? "s" : ""}`}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => {
                    if (!hasRated) setHoverRating(star);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "2px",
                    cursor: hasRated ? "default" : isSubmitting ? "not-allowed" : "pointer",
                    color: isFilled ? "#F0547C" : "var(--color-border, #d1d5db)",
                    transition: "transform 0.1s ease, color 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: hasRated && !isFilled ? 0.35 : 1,
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    fill={isFilled ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={isFilled ? "0" : "1.5"}
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

