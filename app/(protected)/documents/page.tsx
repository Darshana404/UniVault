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
      {params.subject ? (
        <div>
          <h1 className="page-title">{`${params.subject} Documents`}</h1>
          <p className="pdf-meta mt-1">
            Showing academic resources categorized under{" "}
            <strong className="text-white">{params.subject}</strong>.{" "}
            <button
              type="button"
              onClick={() => handleSubject("")}
              className="underline text-teal-400 hover:text-teal-300 ml-1 cursor-pointer"
            >
              Clear filter
            </button>
          </p>
        </div>
      ) : (
        <div
          style={{
            background:
              "linear-gradient(135deg, #F0547C 0%, #F4917A 55%, #F9C4A8 100%)",
            padding: "20px 24px",
            width: "100%",
          }}
        >
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff" }}>
            Document Library
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.8)",
              marginTop: "4px",
            }}
          >
            Browse and search academic resources shared by your peers.
          </div>
        </div>
      )}

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
          aria-label="Filter by subject"
          className="select"
        >
          <option value="">All Subjects</option>
          {subjects?.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={`${paginationAndSort.sort}-${paginationAndSort.order}`}
          onChange={handleSort}
          aria-label="Sort order"
          className="select"
        >
          <option value="created_at-desc">Newest First</option>
          <option value="created_at-asc">Oldest First</option>
          <option value="title-asc">Title (A–Z)</option>
          <option value="title-desc">Title (Z–A)</option>
        </select>
      </div>

      {/* Semantic search toggle banner */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
            AI Search
          </span>
          <span className="text-xs text-slate-300">
            {useSemanticMode
              ? "Semantic search enabled — finds documents by topic meaning"
              : "Keyword search enabled — finds exact text matches"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setUseSemanticMode((prev) => !prev)}
          className={`text-xs px-3 py-1 rounded transition-colors font-medium ${
            useSemanticMode
              ? "bg-teal-500 text-slate-900 font-semibold"
              : "bg-slate-700 hover:bg-slate-600 text-slate-200"
          }`}
        >
          {useSemanticMode ? "Switch to Keyword Search" : "Enable Semantic Search"}
        </button>
      </div>

      {/* Search mode indicators */}
      {isSemanticActive && !isLoading && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            {searchType === "semantic" ? (
              <span className="text-teal-400">
                ✨ Showing semantic search results for &quot;{queryText}&quot;
              </span>
            ) : fallbackReason === "gemini_unavailable" ? (
              <span className="text-amber-400">
                ⚠️ Semantic search unavailable, fell back to keyword search
              </span>
            ) : null}
          </span>
          {data && "total" in data && (
            <span>
              {Number(data.total)} {data.total === 1 ? "result" : "results"}
            </span>
          )}
        </div>
      )}

      {/* Documents List */}
      <DocumentList
        documents={data?.data ?? []}
        isLoading={isLoading}
        error={error}
        currentUserId={user?.id}
        onDelete={handleDelete}
        deletingId={deletingId}
      />

      {/* Pagination */}
      {data && "pagination" in data && (
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
          <Spinner size="lg" />
        </div>
      }
    >
      <DocumentsContent />
    </Suspense>
  );
}
