"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDocument, useDeleteDocument } from "@/hooks/useDocuments";
import { useCurrentUser } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatFileSize, formatDate } from "@/lib/utils/format";

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
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 font-medium">Document not found</p>
        <Link
          href="/documents"
          className="text-teal-400 hover:text-teal-300 text-sm mt-2 inline-block"
        >
          ← Back to library
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === document.uploader_id;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back link */}
      <Link
        href="/documents"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-teal-400 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to library
      </Link>

      {/* Document header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="info">{document.subject}</Badge>
              <Badge variant="success">Approved</Badge>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {document.title}
            </h1>
            {document.description && (
              <p className="text-slate-400 mt-2">{document.description}</p>
            )}
          </div>

          {/* PDF icon */}
          <div className="flex-shrink-0 w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
            <svg
              className="w-7 h-7 text-red-400"
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
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              File size
            </p>
            <p className="text-sm text-slate-300 mt-1">
              {formatFileSize(document.file_size)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Uploaded
            </p>
            <p className="text-sm text-slate-300 mt-1">
              {formatDate(document.created_at)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Uploaded by
            </p>
            <p className="text-sm text-slate-300 mt-1 truncate">
              {document.uploader_email ?? "Unknown"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Filename
            </p>
            <p className="text-sm text-slate-300 mt-1 truncate">
              {document.original_filename}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <Button onClick={handleDownload} variant="primary">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download PDF
          </Button>

          {isOwner && (
            <Button
              onClick={handleDelete}
              variant="danger"
              loading={deleteDocument.isPending}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

