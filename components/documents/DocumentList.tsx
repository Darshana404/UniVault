"use client";

import { DocumentCard } from "./DocumentCard";
import { Spinner } from "@/components/ui/Spinner";
import type { DocumentListItem } from "@/types/documents";

interface DocumentListProps {
  documents: DocumentListItem[];
  isLoading: boolean;
  error: Error | null;
  currentUserId?: string;
  onDelete?: (id: string) => void;
  deletingId?: string | null;
}

export function DocumentList({
  documents,
  isLoading,
  error,
  currentUserId,
  onDelete,
  deletingId,
}: DocumentListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4">
          <svg
            className="w-6 h-6 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-red-400 font-medium">Failed to load documents</p>
        <p className="text-slate-500 text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 mb-4">
          <svg
            className="w-6 h-6 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-slate-400 font-medium">No documents found</p>
        <p className="text-slate-500 text-sm mt-1">
          Try a different search or subject filter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          showOwnerActions={doc.uploader_id === currentUserId}
          onDelete={onDelete}
          isDeleting={deletingId === doc.id}
        />
      ))}
    </div>
  );
}

