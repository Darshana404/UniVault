import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase server client
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOr = vi.fn();
const mockOrder = vi.fn();
const mockRange = vi.fn();
const mockSingle = vi.fn();

const mockQuery = {
  select: mockSelect,
  eq: mockEq,
  or: mockOr,
  order: mockOrder,
  range: mockRange,
  single: mockSingle,
};

// Chain all methods back to mockQuery
beforeEach(() => {
  vi.clearAllMocks();
  mockSelect.mockReturnValue(mockQuery);
  mockEq.mockReturnValue(mockQuery);
  mockOr.mockReturnValue(mockQuery);
  mockOrder.mockReturnValue(mockQuery);
  mockRange.mockReturnValue({
    data: [],
    error: null,
    count: 0,
  });
});

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: () => ({
    from: () => mockQuery,
  }),
}));

import { keywordSearch } from "@/lib/search/keyword";

describe("keywordSearch", () => {
  it("returns empty results when no documents exist", async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null, count: 0 });

    const result = await keywordSearch({});
    expect(result.data).toEqual([]);
    expect(result.pagination.total).toBe(0);
  });

  it("applies default pagination values", async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null, count: 0 });

    await keywordSearch({});

    // page=1, limit=20 → offset=0, end=19
    expect(mockRange).toHaveBeenCalledWith(0, 19);
  });

  it("calculates correct offset for page 2", async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null, count: 0 });

    await keywordSearch({ page: 2, limit: 10 });

    // page=2, limit=10 → offset=10, end=19
    expect(mockRange).toHaveBeenCalledWith(10, 19);
  });

  it("caps limit at 50", async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null, count: 0 });

    await keywordSearch({ limit: 999 });

    // Should be capped to 50 → range(0, 49)
    expect(mockRange).toHaveBeenCalledWith(0, 49);
  });

  it("calculates totalPages correctly", async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null, count: 45 });

    const result = await keywordSearch({ limit: 20 });

    expect(result.pagination.total).toBe(45);
    expect(result.pagination.totalPages).toBe(3);
  });

  it("applies subject filter when provided", async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null, count: 0 });

    await keywordSearch({ subject: "Mathematics" });

    expect(mockEq).toHaveBeenCalledWith("subject", "Mathematics");
  });

  it("applies keyword search when q is provided", async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null, count: 0 });

    await keywordSearch({ q: "calculus" });

    expect(mockOr).toHaveBeenCalledWith(
      expect.stringContaining("calculus")
    );
  });

  it("throws when supabase returns an error", async () => {
    mockRange.mockResolvedValueOnce({
      data: null,
      error: { message: "DB error" },
      count: 0,
    });

    await expect(keywordSearch({})).rejects.toThrow("Search query failed");
  });
});

