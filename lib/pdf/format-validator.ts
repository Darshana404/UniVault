// Validates PDF format and size before text extraction
import crypto from "crypto";

export interface FormatValidationResult {
  valid: boolean;
  reason?: string;
}

// PDF magic bytes: all valid PDFs start with %PDF-
const PDF_MAGIC_BYTES = Buffer.from("%PDF-");

// File size limits
export const MIN_FILE_SIZE = 100 * 1024;        // 100 KB
export const MAX_FILE_SIZE = 50 * 1024 * 1024;  // 50 MB

export function validatePDFFormat(
  buffer: Buffer,
  originalFilename: string
): FormatValidationResult {
  // Size checks
  if (buffer.length < MIN_FILE_SIZE) {
    return {
      valid: false,
      reason: `File is too small (${Math.round(buffer.length / 1024)} KB). Minimum size is 100 KB.`,
    };
  }

  if (buffer.length > MAX_FILE_SIZE) {
    return {
      valid: false,
      reason: `File is too large (${Math.round(buffer.length / (1024 * 1024))} MB). Maximum size is 50 MB.`,
    };
  }

  // Magic bytes check — validates actual file content, not just extension
  const fileHeader = buffer.slice(0, 5);
  if (!fileHeader.equals(PDF_MAGIC_BYTES)) {
    return {
      valid: false,
      reason:
        "File does not appear to be a valid PDF. Please upload a genuine PDF document.",
    };
  }

  // Extension check (secondary — magic bytes are the primary check)
  const ext = originalFilename.split(".").pop()?.toLowerCase();
  if (ext !== "pdf") {
    return {
      valid: false,
      reason: "Only PDF files are accepted.",
    };
  }

  return { valid: true };
}

// Compute SHA-256 content hash for deduplication
export function computeContentHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

