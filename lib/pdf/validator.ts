// Orchestrates the full PDF validation pipeline:
// Format → Extraction → Garbage Detection → Subject Classification

import { validatePDFFormat, computeContentHash } from "./format-validator";
import { extractTextFromPDF, MIN_READABLE_CHARS } from "./extractor";
import { detectGarbage } from "./garbage-detector";
import { classifySubject } from "./subject-classifier";

export type ValidationStatus =
  | "PENDING_VALIDATION"
  | "APPROVED"
  | "REJECTED";

export interface ValidationResult {
  status: "APPROVED" | "REJECTED";
  failureReason?: string;
  extractedTextLength: number;
  extractedText?: string;
  pageCount: number;
  contentHash: string;
  garbageScore?: number;
  subjectMatchCount?: number;
}

export interface ValidatorInput {
  buffer: Buffer;
  originalFilename: string;
  title: string;
  declaredSubject: string;
}

export async function validatePDF(
  input: ValidatorInput
): Promise<ValidationResult> {
  const { buffer, originalFilename, title, declaredSubject } = input;

  // Step 1: Compute content hash (always, even if validation fails)
  const contentHash = computeContentHash(buffer);

  // Step 2: Format and size validation
  const formatResult = validatePDFFormat(buffer, originalFilename);
  if (!formatResult.valid) {
    return {
      status: "REJECTED",
      failureReason: formatResult.reason,
      extractedTextLength: 0,
      pageCount: 0,
      contentHash,
    };
  }

  // Step 3: Text extraction
  const extractionResult = await extractTextFromPDF(buffer);
  if (!extractionResult.success) {
    return {
      status: "REJECTED",
      failureReason:
        extractionResult.error ??
        "Failed to extract text from the PDF.",
      extractedTextLength: 0,
      pageCount: extractionResult.pageCount,
      contentHash,
    };
  }

  // Step 4: Minimum readable text check
  if (extractionResult.text.length < MIN_READABLE_CHARS) {
    return {
      status: "REJECTED",
      failureReason: `PDF contains insufficient readable text (${extractionResult.text.length} characters). Minimum is ${MIN_READABLE_CHARS} characters. The PDF may be image-based or scanned without OCR.`,
      extractedTextLength: extractionResult.text.length,
    extractedText: extractionResult.text,
      pageCount: extractionResult.pageCount,
      contentHash,
    };
  }

  // Step 5: Garbage detection
  const garbageResult = detectGarbage(extractionResult.text);
  if (!garbageResult.passed) {
    return {
      status: "REJECTED",
      failureReason:
        garbageResult.reason ?? "Document content quality check failed.",
      extractedTextLength: extractionResult.text.length,
    extractedText: extractionResult.text,
      pageCount: extractionResult.pageCount,
      contentHash,
      garbageScore: garbageResult.score,
    };
  }

  // Step 6: Subject classification
  const classificationResult = classifySubject(
    extractionResult.text,
    declaredSubject,
    title
  );

  if (!classificationResult.passed) {
    return {
      status: "REJECTED",
      failureReason:
        classificationResult.reason ??
        "Document subject classification failed.",
      extractedTextLength: extractionResult.text.length,
    extractedText: extractionResult.text,
      pageCount: extractionResult.pageCount,
      contentHash,
      garbageScore: garbageResult.score,
      subjectMatchCount: classificationResult.matchCount,
    };
  }

  // All checks passed
  return {
    status: "APPROVED",
    extractedTextLength: extractionResult.text.length,
    extractedText: extractionResult.text,
    pageCount: extractionResult.pageCount,
    contentHash,
    garbageScore: garbageResult.score,
    subjectMatchCount: classificationResult.matchCount,
  };
}

