import type { Document } from "@/types/documents";

export async function addFavourite(documentId: string): Promise<void> {
  const res = await fetch("/api/favourites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documentId }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || "Failed to add favourite");
  }
}

export async function removeFavourite(documentId: string): Promise<void> {
  const res = await fetch(`/api/favourites?documentId=${encodeURIComponent(documentId)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || "Failed to remove favourite");
  }
}

export async function isFavourited(documentId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/favourites/${encodeURIComponent(documentId)}`);
    if (!res.ok) return false;
    const json = await res.json();
    return Boolean(json.data?.isFavourited);
  } catch {
    return false;
  }
}

export async function getUserFavourites(): Promise<Document[]> {
  const res = await fetch("/api/favourites");
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || "Failed to fetch favourites");
  }
  const json = await res.json();
  return (json.data ?? []) as Document[];
}
