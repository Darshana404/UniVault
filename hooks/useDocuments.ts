"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type {
  DocumentListItem,
  DocumentListResponse,
} from "@/types/documents";
import type { DocumentSearchParams } from "@/types/api";

// Query key factory
export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (params: DocumentSearchParams) =>
    [...documentKeys.lists(), params] as const,
  detail: (id: string) => [...documentKeys.all, "detail", id] as const,
  subjects: () => [...documentKeys.all, "subjects"] as const,
};

// Fetch documents list
async function fetchDocuments(
  params: DocumentSearchParams
): Promise<DocumentListResponse & { searchType: string }> {
  const query = new URLSearchParams();

  if (params.q) query.set("q", params.q);
  if (params.subject) query.set("subject", params.subject);
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.semantic) query.set("semantic", "true");

  const res = await fetch(`/api/documents?${query.toString()}`);
  const data = await res.json();

  if (!res.ok) throw new Error(data.error ?? "Failed to fetch documents.");
  return data.data;
}

// Fetch single document
async function fetchDocument(id: string): Promise<DocumentListItem> {
  const res = await fetch(`/api/documents/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Document not found.");
  return data.data.document;
}

// Fetch subjects
async function fetchSubjects(): Promise<string[]> {
  const res = await fetch("/api/documents/subjects");
  const data = await res.json();
  if (!res.ok) return [];
  return data.data.subjects ?? [];
}

// Delete document
async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to delete document.");
}

// Hooks
export function useDocuments(
  params: DocumentSearchParams,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => fetchDocuments(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useSemanticSearch(
  params: DocumentSearchParams,
  enabled: boolean = true
) {
  const query = params.q?.trim() ?? "";
  return useQuery({
    queryKey: [...documentKeys.list(params), "semantic"] as const,
    queryFn: () => fetchDocuments({ ...params, semantic: true }),
    enabled: enabled && query.length >= 3,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => fetchDocument(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSubjects() {
  return useQuery({
    queryKey: documentKeys.subjects(),
    queryFn: fetchSubjects,
    staleTime: 1000 * 60 * 10, // 10 minutes — subjects change rarely
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      // Invalidate all document lists after deletion
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}
