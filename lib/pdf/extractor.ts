// Server-side PDF text extraction using pdfjs-dist
// Handles malformed, encrypted, empty, and textless PDFs safely

import { pathToFileURL } from "url";
import path from "path";

// Minimum readable characters required for a valid document
export const MIN_READABLE_CHARS = 200;

// Maximum characters to extract (avoids excessive memory use)
const MAX_EXTRACT_CHARS = 50_000;

// Processing timeout in milliseconds
const EXTRACTION_TIMEOUT_MS = 30_000;

export interface ExtractionResult {
  success: boolean;
  text: string;
  pageCount: number;
  error?: string;
}

// Normalize extracted text:
// - Collapse whitespace
// - Remove non-printable characters
// - Trim
export function normalizeText(raw: string): string {
  return raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control chars
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();
}

// Resolve the worker path using pathToFileURL — handles Windows drive letters
// and backslashes correctly. Always resolves relative to process.cwd() so it
// works in both dev (Turbopack) and production (Next.js server) contexts.
function getWorkerSrc(): string {
  const workerAbsPath = path.resolve(
    process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
  );
  return pathToFileURL(workerAbsPath).href;
}

export async function extractTextFromPDF(
  buffer: Buffer
): Promise<ExtractionResult> {
  // Wrap entire extraction in a timeout
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error("PDF processing timed out.")),
      EXTRACTION_TIMEOUT_MS
    )
  );

  return Promise.race([doExtraction(buffer), timeoutPromise]);
}

async function doExtraction(buffer: Buffer): Promise<ExtractionResult> {
  try {
    // Dynamically import pdfjs-dist to avoid issues with
    // Next.js module resolution in the App Router
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

    // Point to the real worker — required by pdfjs-dist v4+
    // Setting workerSrc to "" causes "Setting up fake worker failed" errors
    pdfjsLib.GlobalWorkerOptions.workerSrc = getWorkerSrc();

    const uint8Array = new Uint8Array(buffer);

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      // Disable features not needed for text extraction
      disableFontFace: true,
      verbosity: 0,
      // Disable streaming to work correctly in Next.js server environment
      disableStream: true,
      disableAutoFetch: true,
    });

    let pdfDoc: Awaited<typeof loadingTask.promise>;

    try {
      pdfDoc = await loadingTask.promise;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown PDF load error";

      if (message.includes("encrypted") || message.includes("password")) {
        return {
          success: false,
          text: "",
          pageCount: 0,
          error: "PDF is password-protected and cannot be processed.",
        };
      }

      return {
        success: false,
        text: "",
        pageCount: 0,
        error: `PDF file is malformed or corrupted: ${message}`,
      };
    }

    const pageCount = pdfDoc.numPages;
    const textParts: string[] = [];
    let totalChars = 0;

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      if (totalChars >= MAX_EXTRACT_CHARS) break;

      try {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item: unknown) => {
            if (typeof item === "object" && item !== null && "str" in item) {
              return String((item as { str: unknown }).str);
            }
            return "";
          })
          .join(" ");

        const normalized = normalizeText(pageText);
        textParts.push(normalized);
        totalChars += normalized.length;
      } catch {
        // Skip pages that fail to render — don't abort entire extraction
        continue;
      }
    }

    const fullText = normalizeText(textParts.join(" "));

    return {
      success: true,
      text: fullText.slice(0, MAX_EXTRACT_CHARS),
      pageCount,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected extraction error";
    return {
      success: false,
      text: "",
      pageCount: 0,
      error: message,
    };
  }
}
