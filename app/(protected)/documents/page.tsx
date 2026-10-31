"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { Spinner } from "@/components/ui/Spinner";
import type { DocumentSearchParams } from "@/types/api";

function DocumentsContent() {
  const { data: user } = useCurrentUser();
  const deleteDocument = useDeleteDocument();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [useSemanticMode, setUseSemanticMode] = useState(false);

  const urlSubject = searchParams.get("subject") ?? "";
  const urlQ = searchParams.get("q") ?? "";

  const [paginationAndSort, setPaginationAndSort] = useState<{
    sort: "created_at" | "title";
    order: "asc" | "desc";
    page: number;
    limit: number;
  }>({
    sort: "created_at",
    order: "desc",
    page: 1,
    limit: 20,
  });

  const params: DocumentSearchParams = {
    q: urlQ,
    subject: urlSubject,
    sort: paginationAndSort.sort,
    order: paginationAndSort.order,
    page: paginationAndSort.page,
    limit: paginationAndSort.limit,
  };

  const queryText = params.q?.trim() ?? "";
  const isSemanticActive = useSemanticMode && queryText.length >= 3;

  // Use semantic or keyword search exclusively so we don't double fetch
  const keywordResult = useDocuments(params, !isSemanticActive);
  const semanticResult = useSemanticSearch(params, isSemanticActive);

  const activeResult = isSemanticActive ? semanticResult : keywordResult;

  const { data, isLoading, error } = activeResult;
  const { data: subjects } = useSubjects();

  const updateSearchAndSubject = useCallback(
    (newQ: string, newSubject: string) => {
      const sp = new URLSearchParams();
      if (newQ) sp.set("q", newQ);
      if (newSubject) sp.set("subject", newSubject);
      const qs = sp.toString();
      setPaginationAndSort((prev) => ({ ...prev, page: 1 }));
      router.replace(qs ? `/documents?${qs}` : "/documents", { scroll: false });
    },
    [router, setPaginationAndSort]
  );

  const handleSearch = useCallback(
    (q: string) => {
      updateSearchAndSubject(q, urlSubject);
    },
    [updateSearchAndSubject, urlSubject]
  );

  const handleSubject = useCallback(
    (subject: string) => {
      updateSearchAndSubject(urlQ, subject);
    },
    [updateSearchAndSubject, urlQ]
  );

  const handleSort = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const [sort, order] = e.target.value.split("-") as [
        "created_at" | "title",
        "asc" | "desc"
      ];
      setPaginationAndSort((prev) => ({ ...prev, sort, order, page: 1 }));
    },
    [setPaginationAndSort]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setPaginationAndSort((prev) => ({ ...prev, page }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setPaginationAndSort]
  );

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

  const searchType =
    data && "searchType" in data ? data.searchType : "keyword";

  const fallbackReason =
    data && "fallbackReason" in data
      ? (data.fallbackReason as string | undefined)
      : undefined;

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div>
        <h1 className="page-title">
          {params.subject ? `${params.subject} Documents` : "Document Library"}
        </h1>
        <p className="pdf-meta mt-1">
          {params.subject ? (
            <span>
              Showing academic resources categorized under{" "}
              <strong className="text-white">{params.subject}</strong>.{" "}
              <button
                type="button"
                onClick={() => handleSubject("")}
                className="underline text-teal-400 hover:text-teal-300 ml-1 cursor-pointer"
              >
                Clear filter
              </button>
            </span>
          ) : (
            "Browse and search academic resources shared by your peers."
          )}
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
          className="select"
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
            className="select"
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
            type="button"
            onClick={() => setUseSemanticMode((v) => !v)}
            className={`toggle-switch ${useSemanticMode ? "toggle-switch--active" : ""}`}
            role="switch"
            aria-checked={useSemanticMode}
            aria-label="Toggle semantic search"
          >
            <span className="toggle-switch__thumb" />
          </button>
          <span className="pdf-meta">
            Semantic search
            {useSemanticMode && queryText && (
              <span className="logo__accent">
                {queryText.length < 3
                  ? " — type 3+ characters"
                  : searchType === "semantic"
                  ? " — AI content-matched"
                  : " — using keyword fallback"}
              </span>
            )}
          </span>
        </div>

        {/* Results count */}
        {!isLoading && data && (
          <p className="pdf-meta">
            {data.pagination.total === 0
              ? "No documents found"
              : `${data.pagination.total} result${
                  data.pagination.total === 1 ? "" : "s"
                }`}
            {params.q && (
              <span>
                {" "}for <span className="logo__accent">&quot;{params.q}&quot;</span>
              </span>
            )}
          </p>
        )}
      </div>

      {/* Fallback notice */}
      {fallbackReason && (
        <div className="card">
          <p className="pdf-meta text-yellow-400">{fallbackReason}</p>
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

export default function DocumentsPage() {
  return (
    <Suspense
      fallback={
        <div className="home__empty">
          <Spinner size="md" />
        </div>
      }
    >
      <DocumentsContent />
    </Suspense>
  );
}
