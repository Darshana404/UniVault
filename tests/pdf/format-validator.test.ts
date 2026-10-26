import { describe, it, expect } from "vitest";
import {
  validatePDFFormat,
  computeContentHash,
  MIN_FILE_SIZE,
  MAX_FILE_SIZE,
} from "@/lib/pdf/format-validator";

// Helper: create a buffer with PDF magic bytes
function makePDFBuffer(size: number): Buffer {
  const buf = Buffer.alloc(size, 0x20); // Fill with spaces
  buf.write("%PDF-1.4", 0, "ascii");   // Valid PDF header
  return buf;
}

// Helper: create a non-PDF buffer
function makeNonPDFBuffer(size: number): Buffer {
  const buf = Buffer.alloc(size, 0x20);
  buf.write("NOTPDF!!", 0, "ascii");
  return buf;
}

describe("validatePDFFormat", () => {
  it("accepts a valid PDF buffer with correct size", () => {
    const buf = makePDFBuffer(200 * 1024); // 200 KB
    const result = validatePDFFormat(buf, "test.pdf");
    expect(result.valid).toBe(true);
  });

  it("rejects a file that is too small", () => {
    const buf = makePDFBuffer(50 * 1024); // 50 KB — below 100 KB min
    const result = validatePDFFormat(buf, "test.pdf");
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("too small");
  });

  it("rejects a file that is too large", () => {
    const buf = makePDFBuffer(MAX_FILE_SIZE + 1);
    const result = validatePDFFormat(buf, "test.pdf");
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("too large");
  });

  it("rejects a file without PDF magic bytes", () => {
    const buf = makeNonPDFBuffer(200 * 1024);
    const result = validatePDFFormat(buf, "test.pdf");
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("valid PDF");
  });

  it("rejects a file with wrong extension", () => {
    const buf = makePDFBuffer(200 * 1024);
    const result = validatePDFFormat(buf, "document.docx");
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("PDF");
  });

  it("accepts exactly the minimum file size", () => {
    const buf = makePDFBuffer(MIN_FILE_SIZE);
    const result = validatePDFFormat(buf, "test.pdf");
    expect(result.valid).toBe(true);
  });
});

describe("computeContentHash", () => {
  it("produces a 64-character hex string", () => {
    const buf = Buffer.from("test content");
    const hash = computeContentHash(buf);
    expect(hash).toHaveLength(64);
    expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true);
  });

  it("produces the same hash for identical content", () => {
    const buf = Buffer.from("same content");
    expect(computeContentHash(buf)).toBe(computeContentHash(buf));
  });

  it("produces different hashes for different content", () => {
    const hash1 = computeContentHash(Buffer.from("content a"));
    const hash2 = computeContentHash(Buffer.from("content b"));
    expect(hash1).not.toBe(hash2);
  });
});

