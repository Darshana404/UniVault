import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the embedding module
vi.mock("@/lib/search/embedding", () => ({
  generateEmbeddingSafe: vi.fn(),
  prepareTextForEmbedding: (text: string) => text.trim().slice(0, 8000),
  buildDocumentEmbeddingText: vi.fn().mockReturnValue("test text"),
  getEmbeddingProvider: vi.fn(),
}));

// Mock Supabase
const mockRpc = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: () => ({ rpc: mockRpc }),
}));

// Mock keyword search for fallback testing
vi.mock("@/lib/search/keyword", () => ({
  keywordSearch: vi.fn().mockResolvedValue({
    data: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  }),
}));

import { semanticSearch } from "@/lib/search/semantic";
import { generateEmbeddingSafe } from "@/lib/search/embedding";
import { keywordSearch } from "@/lib/search/keyword";

const mockGenerateEmbedding = vi.mocked(generateEmbeddingSafe);
const mockKeywordSearch = vi.mocked(keywordSearch);

describe("semanticSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("falls back to keyword search when embedding generation fails", async () => {
    mockGenerateEmbedding.mockResolvedValueOnce(null);

    const result = await semanticSearch({ query: "calculus notes" });

    expect(result.searchType).toBe("keyword_fallback");
    expect(mockKeywordSearch).toHaveBeenCalledWith(
      expect.objectContaining({ q: "calculus notes" })
    );
  });

  it("returns semantic results when embedding succeeds", async () => {
    const fakeEmbedding = Array.from({ length: 1536 }, () => 0.1);
    mockGenerateEmbedding.mockResolvedValueOnce({
      embedding: fakeEmbedding,
      model: "text-embedding-3-small",
      dimensions: 1536,
    });

    mockRpc.mockResolvedValueOnce({
      data: [
        {
          id: "doc-1",
          title: "Calculus Notes",
          subject: "Mathematics",
          description: null,
          original_filename: "calc.pdf",
          file_size: 500000,
          content_type: "application/pdf",
          uploader_id: "user-1",
          validation_status: "APPROVED",
          validation_failure_reason: null,
          validated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          uploader_email: "student@uni.edu",
          similarity: 0.87,
          total_count: 1,
        },
      ],
      error: null,
    });

    const result = await semanticSearch({ query: "calculus notes" });

    expect(result.searchType).toBe("semantic");
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.title).toBe("Calculus Notes");
    expect(mockKeywordSearch).not.toHaveBeenCalled();
  });

  it("falls back to keyword search when RPC fails", async () => {
    const fakeEmbedding = Array.from({ length: 1536 }, () => 0.1);
    mockGenerateEmbedding.mockResolvedValueOnce({
      embedding: fakeEmbedding,
      model: "text-embedding-3-small",
      dimensions: 1536,
    });

    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { message: "RPC function not found" },
    });

    const result = await semanticSearch({ query: "test query" });

    expect(result.searchType).toBe("keyword_fallback");
    expect(mockKeywordSearch).toHaveBeenCalled();
  });

  it("applies subject filter to RPC call", async () => {
    const fakeEmbedding = Array.from({ length: 1536 }, () => 0.1);
    mockGenerateEmbedding.mockResolvedValueOnce({
      embedding: fakeEmbedding,
      model: "text-embedding-3-small",
      dimensions: 1536,
    });

    mockRpc.mockResolvedValueOnce({ data: [], error: null });

    await semanticSearch({
      query: "test",
      subject: "Mathematics",
    });

    expect(mockRpc).toHaveBeenCalledWith(
      "search_documents_semantic",
      expect.objectContaining({
        subject_filter: "Mathematics",
      })
    );
  });

  it("calculates correct pagination offset", async () => {
    const fakeEmbedding = Array.from({ length: 1536 }, () => 0.1);
    mockGenerateEmbedding.mockResolvedValueOnce({
      embedding: fakeEmbedding,
      model: "text-embedding-3-small",
      dimensions: 1536,
    });

    mockRpc.mockResolvedValueOnce({ data: [], error: null });

    await semanticSearch({ query: "test", page: 3, limit: 10 });

    expect(mockRpc).toHaveBeenCalledWith(
      "search_documents_semantic",
      expect.objectContaining({
        result_limit: 10,
        result_offset: 20, // (page 3 - 1) * limit 10
      })
    );
  });
});

