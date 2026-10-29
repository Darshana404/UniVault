"use client";

import { useState, useCallback } from "react";
import { useCurrentUser } from "@/hooks/useAuth";
import {
  useDocuments,
  useSemanticSearch,
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
  const [useSemanticMode, setUseSemanticMode] = useState(false);

  const [params, setParams] = useState<DocumentSearchParams>({
    q: "",
    subject: "",
    sort: "created_at",
    order: "desc",
    page: 1,
    limit: 20,
  });

  const queryText = params.q?.trim() ?? "";
  const isSemanticActive = useSemanticMode && queryText.length >= 3;

  // Use semantic or keyword search exclusively so we don't double fetch
  const keywordResult = useDocuments(params, !isSemanticActive);
  const semanticResult = useSemanticSearch(params, isSemanticActive);

  const activeResult = isSemanticActive ? semanticResult : keywordResult;

  const { data, isLoading, error } = activeResult;
  const { data: subjects } = useSubjects();

  const handleSearch = useCallback((q: string) => {
    setParams((prev) => ({ ...prev, q, page: 1 }));
  }, []);

  const handleSubject = useCallback((subject: string) => {
    setParams((prev) => ({ ...prev, subject, page: 1 }));
  }, []);

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
      alert(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  }

  const searchType = data && "searchType" in data
    ? data.searchType
    : "keyword";

  const fallbackReason = data && "fallbackReason" in data
    ? (data.fallbackReason as string | undefined)
    : undefined;

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
            placeholder="Search documents…"
          />
        </div>

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

        {/* Only show sort when not in semantic mode */}
        {!useSemanticMode && (
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
        )}
      </div>

      {/* Semantic search toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Toggle button */}
          <button
            onClick={() => setUseSemanticMode((v) => !v)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full
              transition-colors focus:outline-none focus:ring-2
              focus:ring-teal-500 focus:ring-offset-2
              focus:ring-offset-slate-900
              ${useSemanticMode ? "bg-teal-500" : "bg-slate-700"}
            `}
            role="switch"
            aria-checked={useSemanticMode}
            aria-label="Toggle semantic search"
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white
                transition-transform
                ${useSemanticMode ? "translate-x-6" : "translate-x-1"}
              `}
            />
          </button>
          <span className="text-sm text-slate-400">
            Semantic search
            {useSemanticMode && queryText && (
              <span className="ml-2 text-xs text-teal-400">
                {queryText.length < 3
                  ? "— type 3+ characters"
                  : searchType === "semantic"
                  ? "— AI content-matched"
                  : "— using keyword fallback"}
              </span>
            )}
          </span>
        </div>

        {/* Results count */}
        {!isLoading && data && (
          <p className="text-sm text-slate-500">
            {data.pagination.total === 0
              ? "No documents found"
              : `${data.pagination.total} result${
                  data.pagination.total === 1 ? "" : "s"
                }`}
            {params.q && (
              <span>
                {" "}for{" "}
                <span className="text-slate-300">&quot;{params.q}&quot;</span>
              </span>
            )}
          </p>
        )}
      </div>

      {/* Fallback notice */}
      {fallbackReason && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3">
          <p className="text-sm text-yellow-400">{fallbackReason}</p>
        </div>
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
