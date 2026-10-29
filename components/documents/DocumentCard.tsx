"use client";

import Link from "next/link";
import { formatFileSize } from "@/lib/utils/format";
import type { DocumentListItem } from "@/types/documents";

interface DocumentCardProps {
  document: DocumentListItem;
  showOwnerActions?: boolean;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function DocumentCard({
  document,
  showOwnerActions = false,
  onDelete,
  isDeleting = false,
}: DocumentCardProps) {
  return (
    <div className="card--pdf">
      {/* PDF icon block: 36×44px, background --color-bg, border --border, border-radius 4px */}
      <div className="card--pdf__icon">
        <svg
          width="18"
          height="22"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="card--pdf__content">
        <Link href={`/documents/${document.id}`}>
          <h3 className="card--pdf__title card__name">
            {document.title}
          </h3>
        </Link>

        <div className="card--pdf__meta pdf-meta">
          <span>{document.subject}</span>
          <span> · </span>
          <span>{formatFileSize(document.file_size)}</span>
        </div>

        {showOwnerActions && onDelete && (
          <div className="card--pdf__actions">
            <button
              onClick={() => onDelete(document.id)}
              disabled={isDeleting}
              className="btn btn--danger"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        )}
      </div>

      {/* Badge: bottom-right absolute, background --color-accent, text --color-bg, 8px bold uppercase */}
      <span className="card--pdf__badge badge">PDF</span>
    </div>
  );
}
