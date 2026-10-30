import type { Document } from "@/types/documents";

export async function getUserUploads(): Promise<Document[]> {
  const res = await fetch("/api/my-uploads");
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || "Failed to fetch uploads");
  }
  const json = await res.json();
  return (json.data ?? []) as Document[];
}
