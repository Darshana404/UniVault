"use client";

import { useState, useCallback } from "react";
import { useCurrentUser } from "@/hooks/useAuth";
import {
  useDocuments,
  useSubjects,
  useDeleteDocument,
} from "@/hooks/useDocuments";
import { DocumentList } from "@/components/documents/DocumentList";
import { DocumentSearch } from "@/components/documents/DocumentSearch";
import { Pagination } from "@/components/documents/Pagination";
import type { DocumentSearchParams } from "@/types/api";

export default function DocumentsPage() {
  const { data: user } = useCurrentUser();
  const deleteDocument = useDeleteDocument();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [params, setParams] = useState<DocumentSearchParams>({
    q: "",
    subject: "",
    sort: "created_at",
    order: "desc",
    page: 1,
    limit: 20,
  });

  const { data, isLoading, error } = useDocuments(params);
  const { data: subjects } = useSubjects();

  const handleSearch = useCallback((q: string) => {
    setParams((prev) => ({ ...prev, q, page: 1 }));
  }, []);

  const handleSubject = useCallback(
    (subject: string) => {
      setParams((prev) => ({ ...prev, subject, page: 1 }));
    },
    []
  );

  const handleSort = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const [sort, order] = e.target.value.split("-") as [
        "created_at" | "title",
        "asc" | "desc"
      ];
      setParams((prev) => ({ ...prev, sort, order, page: 1 }));
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this document?")) return;
    setDeletingId(id);
    try {
      await deleteDocument.mutateAsync(id);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to delete document."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Document Library</h1>
        <p className="text-slate-400 text-sm mt-1">
          Browse and search academic resources shared by your peers.
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <DocumentSearch
            value={params.q ?? ""}
            onChange={handleSearch}
            placeholder="Search by title or description…"
          />
        </div>

        {/* Subject filter */}
        <select
          value={params.subject ?? ""}
          onChange={(e) => handleSubject(e.target.value)}
          className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
        >
          <option value="">All subjects</option>
          {(subjects ?? []).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={`${params.sort ?? "created_at"}-${params.order ?? "desc"}`}
          onChange={handleSort}
          className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
        >
          <option value="created_at-desc">Newest first</option>
          <option value="created_at-asc">Oldest first</option>
          <option value="title-asc">Title A–Z</option>
          <option value="title-desc">Title Z–A</option>
        </select>
      </div>

      {/* Results count */}
      {!isLoading && data && (
        <p className="text-sm text-slate-500">
          {data.pagination.total === 0
            ? "No documents found"
            : `${data.pagination.total} document${data.pagination.total === 1 ? "" : "s"} found`}
          {params.q && (
            <span>
              {" "}for <span className="text-slate-300">&quot;{params.q}&quot;</span>
            </span>
          )}
        </p>
      )}

      {/* Document list */}
      <DocumentList
        documents={data?.data ?? []}
        isLoading={isLoading}
        error={error}
        currentUserId={user?.id}
        onDelete={handleDelete}
        deletingId={deletingId}
      />

      {/* Pagination */}
      {data?.pagination && (
        <Pagination
          pagination={data.pagination}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

