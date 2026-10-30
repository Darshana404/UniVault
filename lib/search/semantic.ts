// Semantic search using pgvector cosine similarity across document chunks
// Falls back to keyword search if embedding generation fails
// or if pgvector is unavailable

import { createServiceClient } from "@/lib/supabase/server";
import { generateEmbeddingSafe, prepareTextForEmbedding } from "./embedding";
import { keywordSearch } from "./keyword";
import type { DocumentListItem } from "@/types/documents";

// Default cosine similarity threshold for all-MiniLM-L6-v2 (normalized embeddings)
export const DEFAULT_SIMILARITY_THRESHOLD = 0.2;
export const MIN_SEMANTIC_QUERY_LENGTH = 3;

export interface SemanticSearchOptions {
  query: string;
  subject?: string;
  limit?: number;
  page?: number;
  similarityThreshold?: number;
}

export interface SemanticSearchResult {
  data: (DocumentListItem & { similarity?: number; matched_snippet?: string })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchType: "semantic" | "keyword_fallback";
  fallbackReason?: string;
}

export async function semanticSearch(
  options: SemanticSearchOptions
): Promise<SemanticSearchResult> {
  const cleanQuery = options.query.trim();
  const limit = Math.min(50, Math.max(1, options.limit ?? 20));
  const page = Math.max(1, options.page ?? 1);
  const threshold = options.similarityThreshold ?? DEFAULT_SIMILARITY_THRESHOLD;

  // Minimum query length guard to prevent wasteful vector queries for single letters
  if (cleanQuery.length < MIN_SEMANTIC_QUERY_LENGTH) {
    const fallback = await keywordSearch({
      q: cleanQuery,
      subject: options.subject,
      page,
      limit,
      sort: "created_at",
      order: "desc",
    });

    return {
      ...fallback,
      searchType: "keyword_fallback",
      fallbackReason: `Enter at least ${MIN_SEMANTIC_QUERY_LENGTH} characters for semantic search.`,
    };
  }

  // Step 1: Generate query embedding
  const embeddingResult = await generateEmbeddingSafe(
    prepareTextForEmbedding(cleanQuery)
  );

  if (!embeddingResult) {
    // Embedding generation failed — fall back to keyword search
    const fallback = await keywordSearch({
      q: cleanQuery,
      subject: options.subject,
      page,
      limit,
      sort: "created_at",
      order: "desc",
    });

    return {
      ...fallback,
      searchType: "keyword_fallback",
      fallbackReason:
        "Semantic search is temporarily unavailable. Showing keyword results.",
    };
  }

  const supabase = createServiceClient();

  // Step 2: Run vector similarity search across document chunks using pgvector
  const offset = (page - 1) * limit;

  const { data, error } = await supabase.rpc("search_documents_semantic", {
    query_embedding: JSON.stringify(embeddingResult.embedding),
    similarity_threshold: threshold,
    subject_filter: options.subject ?? null,
    result_limit: limit,
    result_offset: offset,
  });

  if (error) {
    console.error("[Semantic Search] RPC failed:", error.message);

    // Fall back to keyword search
    const fallback = await keywordSearch({
      q: cleanQuery,
      subject: options.subject,
      page,
      limit,
      sort: "created_at",
      order: "desc",
    });

    return {
      ...fallback,
      searchType: "keyword_fallback",
      fallbackReason: "Falling back to keyword search.",
    };
  }

  const results = (data ?? []) as Array<
    DocumentListItem & {
      similarity: number;
      matched_snippet?: string;
      total_count: number;
    }
  >;

  // If vector search returns 0 matches, automatically fallback to keyword search
  // so the user receives keyword matches rather than an empty result set
  if (results.length === 0) {
    const fallback = await keywordSearch({
      q: cleanQuery,
      subject: options.subject,
      page,
      limit,
      sort: "created_at",
      order: "desc",
    });

    return {
      ...fallback,
      searchType: "keyword_fallback",
      fallbackReason: "No strong semantic matches found. Showing keyword results.",
    };
  }

  const total = results[0]?.total_count ?? 0;

  return {
    data: results.map(({ total_count: _, ...doc }) => doc),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    searchType: "semantic",
  };
}
