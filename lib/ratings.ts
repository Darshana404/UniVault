import type { DocumentRatingStats } from "@/types/documents";

export async function getDocumentRating(
  documentId: string
): Promise<DocumentRatingStats> {
  const res = await fetch(`/api/documents/${encodeURIComponent(documentId)}/rating`);
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || "Failed to fetch document rating");
  }
  const json = await res.json();
  return json.data as DocumentRatingStats;
}

export async function submitDocumentRating(
  documentId: string,
  rating: number
): Promise<DocumentRatingStats> {
  const res = await fetch(`/api/documents/${encodeURIComponent(documentId)}/rating`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || "Failed to submit rating");
  }
  const json = await res.json();
  return json.data as DocumentRatingStats;
}

export async function deleteDocumentRating(
  documentId: string
): Promise<DocumentRatingStats> {
  const res = await fetch(`/api/documents/${encodeURIComponent(documentId)}/rating`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || "Failed to remove rating");
  }
  const json = await res.json();
  return json.data as DocumentRatingStats;
}

