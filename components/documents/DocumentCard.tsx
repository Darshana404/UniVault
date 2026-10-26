"use client";

import Link from "next/link";
import { formatFileSize, formatRelativeTime } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
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
    <div className="group bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-teal-500/50 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        {/* PDF Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-red-400"
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
        <div className="flex-1 min-w-0">
          <Link href={`/documents/${document.id}`}>
            <h3 className="font-semibold text-slate-100 hover:text-teal-400 transition-colors truncate cursor-pointer">
              {document.title}
            </h3>
          </Link>

          {document.description && (
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">
              {document.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="info">{document.subject}</Badge>
            <span className="text-xs text-slate-500">
              {formatFileSize(document.file_size)}
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-500">
              {formatRelativeTime(document.created_at)}
            </span>
            {document.uploader_email && (
              <>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-500">
                  {document.uploader_email}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <Link
            href={`/documents/${document.id}`}
            className="text-xs text-slate-400 hover:text-teal-400 transition-colors px-2 py-1 rounded hover:bg-slate-700"
          >
            View
          </Link>

          {showOwnerActions && onDelete && (
            <button
              onClick={() => onDelete(document.id)}
              disabled={isDeleting}
              className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded hover:bg-slate-700 disabled:opacity-50"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

