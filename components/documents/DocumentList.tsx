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
      <div className="home__empty">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="home__empty">
        <p className="text-danger">Failed to load documents</p>
        <p className="pdf-meta">{error.message}</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="home__empty">
        <p className="page-title">No documents found</p>
        <p className="pdf-meta">
          Try a different search or subject filter.
        </p>
      </div>
    );
  }

  return (
    <div className="home__section">
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
