"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "@/styles/pages/pdf-detail.css";
import { useDocument, useDeleteDocument } from "@/hooks/useDocuments";
import { useCurrentUser } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";
import { formatFileSize, formatDate } from "@/lib/utils/format";
import { isFavourited, addFavourite, removeFavourite } from "@/lib/favourites";
import { DocumentRatingWidget } from "@/components/documents/DocumentRatingWidget";
import { getDocumentRating } from "@/lib/ratings";

export default function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { data: document, isLoading, error } = useDocument(id);
  const deleteDocument = useDeleteDocument();
  const [isFavourite, setIsFavourite] = useState(false);
  const [ratingStats, setRatingStats] = useState<{
    rating_avg: number;
    rating_count: number;
    user_rating: number | null;
  } | null>(null);

  useEffect(() => {
    if (id) {
      isFavourited(id).then(setIsFavourite).catch(console.error);
      getDocumentRating(id)
        .then((data) => setRatingStats(data))
        .catch(console.error);
    }
  }, [id]);

  async function handleToggleFavourite() {
    const nextState = !isFavourite;
    setIsFavourite(nextState);
    try {
      if (nextState) {
        await addFavourite(id);
      } else {
        await removeFavourite(id);
      }
    } catch (err) {
      setIsFavourite(!nextState);
      console.error(err);
    }
  }

  async function handleDownload() {
    const res = await fetch(`/api/documents/${id}/download`);
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Failed to get download link.");
      return;
    }
    window.open(data.data.url, "_blank");
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await deleteDocument.mutateAsync(id);
      router.push("/documents");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete.");
    }
  }

  if (isLoading) {
    return (
      <div className="home__empty">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="home__empty">
        <p className="card__name text-danger">Document not found</p>
        <Link href="/documents" className="section-header__link">
          ← Back to library
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === document.uploader_id;

  return (
    <div className="pdf-detail">
      {/* Back link */}
      <Link href="/documents" className="pdf-detail__back">
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
        <span>Back to library</span>
      </Link>

      {/* 1. File preview block */}
      <div
        className="pdf-detail__preview"
        style={{
          background: "linear-gradient(135deg, #F0547C 0%, #F4917A 55%, #F9C4A8 100%)",
        }}
      >
        <div className="pdf-detail__preview-header">
          <div className="pdf-detail__preview-info">
            <div className="pdf-detail__badges">
              <span
                className="badge"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  color: "#ffffff",
                }}
              >
                {document.subject}
              </span>
              <span
                className="badge badge--accent"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  color: "#F0547C",
                }}
              >
                Approved
              </span>
            </div>
            <h1
              className="pdf-detail__title page-title"
              style={{ color: "#ffffff" }}
            >
              {document.title}
            </h1>
          </div>

          <div
            className="pdf-detail__icon-box"
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.4)",
              color: "#ffffff",
            }}
          >
            <svg
              width="18"
              height="22"
              fill="currentColor"
              viewBox="0 0 20 20"
              style={{ color: "#ffffff" }}
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. Meta cards grid (2-column fluid, uploader full width) */}
      <div className="meta-grid">
        <div className="meta-card">
          <span className="meta-card__label meta-label">File size</span>
          <div className="meta-card__content">
            <span className="meta-card__icon">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "#F4917A" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </span>
            <span className="meta-card__value">
              {formatFileSize(document.file_size)}
            </span>
          </div>
        </div>

        <div className="meta-card">
          <span className="meta-card__label meta-label">Uploaded</span>
          <div className="meta-card__content">
            <span className="meta-card__icon">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "#F4917A" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </span>
            <span className="meta-card__value">
              {formatDate(document.created_at)}
            </span>
          </div>
        </div>

        <div className="meta-card">
          <span className="meta-card__label meta-label">Filename</span>
          <div className="meta-card__content">
            <span className="meta-card__icon">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "#F4917A" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </span>
            <span className="meta-card__value">
              {document.original_filename}
            </span>
          </div>
        </div>

        <div className="meta-card">
          <span className="meta-card__label meta-label">Downloads</span>
          <div className="meta-card__content">
            <span className="meta-card__icon">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "#F4917A" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </span>
            <span className="meta-card__value">
              {document.download_count ?? 0}
            </span>
          </div>
        </div>

        {/* Uploader email card spans full width (grid-column 1 / -1) */}
        <div className="meta-card meta-card--full">
          <span className="meta-card__label meta-label">Uploaded by</span>
          <div className="meta-card__content">
            <span className="meta-card__icon">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "#F4917A" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            </span>
            <span className="meta-card__value">
              {document.uploader_email ?? "Unknown"}
            </span>
          </div>
        </div>

        {/* Rating widget card */}
        <DocumentRatingWidget
          documentId={id}
          initialAvg={ratingStats?.rating_avg ?? Number(document.rating_avg ?? 0)}
          initialCount={ratingStats?.rating_count ?? Number(document.rating_count ?? 0)}
          initialUserRating={ratingStats?.user_rating ?? null}
          onRatingUpdated={(newStats) => setRatingStats(newStats)}
        />
      </div>

      {/* 3. Description block */}
      {document.description && (
        <div className="description-block">
          <span className="description-block__label meta-label">
            Description
          </span>
          <p className="description-block__body">
            {document.description}
          </p>
        </div>
      )}

      {/* 4. Action row */}
      <div className="pdf-detail__actions">
        <button
          type="button"
          onClick={handleDownload}
          className="btn btn--primary"
          style={{
            background: "linear-gradient(135deg, #F0547C 0%, #F4917A 55%, #F9C4A8 100%)",
            color: "#ffffff",
            border: "none",
            boxShadow: "0 4px 14px rgba(240,84,124,0.45)",
          }}
        >
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span>Download PDF</span>
        </button>

        {/* Icon button (favourite): 44px square, background --color-surface, border --border, icon --color-text-secondary */}
        <button
          type="button"
          onClick={handleToggleFavourite}
          className="btn btn--icon"
          aria-label="Toggle favourite"
        >
          <svg
            width="18"
            height="18"
            fill={isFavourite ? "#F0547C" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: "#F0547C" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {isOwner && (
          <button
            type="button"
            onClick={handleDelete}
            className="btn btn--danger"
            disabled={deleteDocument.isPending}
          >
            {deleteDocument.isPending ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>
    </div>
  );
}
