import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock embedding provider
const mockGenerateEmbedding = vi.fn();
vi.mock("@/lib/search/embedding", () => ({
  getEmbeddingProvider: vi.fn(() => ({
    generateEmbedding: mockGenerateEmbedding,
    generateBatchEmbeddings: (texts: string[]) =>
      Promise.all(texts.map((t) => mockGenerateEmbedding(t))),
  })),
  buildDocumentEmbeddingText: vi.fn().mockReturnValue("sample text"),
  prepareTextForEmbedding: vi.fn((t: string) => t),
}));

// Mock Supabase
const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });
const mockDelete = vi.fn(() => ({ eq: mockDeleteEq }));
const mockFrom = vi.fn(() => ({
  upsert: mockUpsert,
  insert: mockInsert,
  delete: mockDelete,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: () => ({ from: mockFrom }),
}));

import { generateAndStoreEmbedding } from "@/lib/search/embedding-service";

describe("generateAndStoreEmbedding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsert.mockResolvedValue({ error: null });
  });

  it("returns true and stores embedding on success", async () => {
    mockGenerateEmbedding.mockResolvedValueOnce({
      embedding: [0.1, 0.2, 0.3],
      model: "text-embedding-3-small",
      dimensions: 3,
    });

    const result = await generateAndStoreEmbedding({
      documentId: "doc-123",
      title: "Test Doc",
      subject: "Mathematics",
    });

    expect(result).toBe(true);
    // Should have been called twice: once for PENDING, once for SUCCESS
    expect(mockUpsert).toHaveBeenCalledTimes(2);
    expect(mockUpsert).toHaveBeenLastCalledWith(
      expect.objectContaining({ embedding_status: "SUCCESS" }),
      expect.any(Object)
    );
  });

  it("returns false and marks FAILED when provider throws", async () => {
    mockGenerateEmbedding.mockRejectedValueOnce(
      new Error("API rate limited")
    );

    const result = await generateAndStoreEmbedding({
      documentId: "doc-456",
      title: "Test Doc",
      subject: "Physics",
    });

    expect(result).toBe(false);
    expect(mockUpsert).toHaveBeenLastCalledWith(
      expect.objectContaining({
        embedding_status: "FAILED",
        error_message: "API rate limited",
      }),
      expect.any(Object)
    );
  });

  it("does not throw when provider fails", async () => {
    mockGenerateEmbedding.mockRejectedValueOnce(
      new Error("Network error")
    );

    await expect(
      generateAndStoreEmbedding({
        documentId: "doc-789",
        title: "Test",
        subject: "Biology",
      })
    ).resolves.toBe(false);
  });
});

