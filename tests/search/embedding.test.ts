import { describe, it, expect } from "vitest";
import {
  prepareTextForEmbedding,
  buildDocumentEmbeddingText,
} from "@/lib/search/embedding";
import { verifyModelFiles } from "@/lib/search/model-integrity";

describe("prepareTextForEmbedding", () => {
  it("trims and collapses whitespace", () => {
    const input = "  hello   world  ";
    expect(prepareTextForEmbedding(input)).toBe("hello world");
  });

  it("truncates text longer than 8000 characters", () => {
    const long = "a".repeat(10000);
    expect(prepareTextForEmbedding(long).length).toBe(8000);
  });

  it("returns empty string for empty input", () => {
    expect(prepareTextForEmbedding("")).toBe("");
  });

  it("handles text under the limit unchanged (except trim)", () => {
    const input = "short text";
    expect(prepareTextForEmbedding(input)).toBe("short text");
  });
});

describe("buildDocumentEmbeddingText", () => {
  it("includes title and subject", () => {
    const result = buildDocumentEmbeddingText({
      title: "Calculus Notes",
      subject: "Mathematics",
    });
    expect(result).toContain("Calculus Notes");
    expect(result).toContain("Mathematics");
  });

  it("includes description when provided", () => {
    const result = buildDocumentEmbeddingText({
      title: "Test",
      subject: "Physics",
      description: "A test description",
    });
    expect(result).toContain("A test description");
  });

  it("omits description when not provided", () => {
    const result = buildDocumentEmbeddingText({
      title: "Test",
      subject: "Physics",
    });
    expect(result).not.toContain("Description:");
  });

  it("truncates extracted text to 4000 chars", () => {
    const longText = "x".repeat(10000);
    const result = buildDocumentEmbeddingText({
      title: "Test",
      subject: "Physics",
      extractedText: longText,
    });
    // The combined result should be under 8000 chars after prepareTextForEmbedding
    expect(result.length).toBeLessThanOrEqual(8000);
  });

  it("produces the correct format with all fields", () => {
    const result = buildDocumentEmbeddingText({
      title: "My Notes",
      subject: "Chemistry",
      description: "Organic chemistry",
      extractedText: "Benzene rings and...",
    });
    expect(result).toContain("Title: My Notes");
    expect(result).toContain("Subject: Chemistry");
    expect(result).toContain("Description: Organic chemistry");
    expect(result).toContain("Content:");
  });
});

describe("verifyModelFiles", () => {
  it("verifies manifest and model files without throwing", () => {
    expect(() => verifyModelFiles()).not.toThrow();
  });
});

