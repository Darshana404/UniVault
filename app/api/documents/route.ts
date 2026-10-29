import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  safeErrorResponse,
} from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth-guard";
import { AuthenticationError } from "@/lib/api/errors";
import { keywordSearch } from "@/lib/search/keyword";
import { semanticSearch } from "@/lib/search/semantic";
import { generateAndStoreEmbedding } from "@/lib/search/embedding-service";
import { DocumentSearchSchema, UploadMetadataSchema } from "@/lib/api/schemas";
import { validatePDF } from "@/lib/pdf/validator";
import { uploadPDFToStorage, deletePDFFromStorage } from "@/lib/storage/documents";
import { createServiceClient } from "@/lib/supabase/server";
import { uploadLimiter } from "@/lib/middleware/rate-limit";
import { VALID_SUBJECTS } from "@/lib/pdf/taxonomy";
import { z } from "zod";

// Maximum file size enforced at the API layer (50 MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// GET /api/documents — list and search approved documents
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const rawParams = {
      q: searchParams.get("q") ?? undefined,
      subject: searchParams.get("subject") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      order: searchParams.get("order") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      semantic: searchParams.get("semantic") ?? undefined,
    };

    const parsed = DocumentSearchSchema.safeParse(rawParams);
    if (!parsed.success) {
      const firstError =
        parsed.error.issues?.[0]?.message ??
        (parsed.error as unknown as { errors?: Array<{ message?: string }> })
          .errors?.[0]?.message ??
        "Invalid query parameters.";
      return errorResponse(firstError, 400);
    }

    const { q, subject, sort, order, page, limit, semantic } = parsed.data;

    // Use semantic search when requested and a query is provided
    if (semantic && q) {
      const result = await semanticSearch({
        query: q,
        subject,
        page,
        limit,
      });
      return successResponse(result);
    }

    const result = await keywordSearch({
      q,
      subject,
      sort,
      order,
      page,
      limit,
    });

    return successResponse({
      ...result,
      searchType: "keyword",
    });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return errorResponse(err.message, 401);
    }
    return safeErrorResponse(err, "Failed to fetch documents.");
  }
}

// POST /api/documents — upload a new PDF
export async function POST(request: NextRequest) {
  let storagePath: string | null = null;

  try {
    const auth = await requireAuth();

    // Rate limit uploads per user
    const rateLimit = uploadLimiter(auth.user.id);
    if (!rateLimit.allowed) {
      return errorResponse(
        "Upload limit reached. You can upload up to 10 files per hour.",
        429
      );
    }

    // Parse multipart form data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return errorResponse("Invalid form data.", 400);
    }

    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const subject = formData.get("subject") as string | null;

    // Validate file presence
    if (!file) {
      return errorResponse("No file provided.", 400);
    }

    // Validate file size at API level
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(
        `File is too large (${Math.round(file.size / (1024 * 1024))} MB). Maximum is 50 MB.`,
        413
      );
    }

    // Validate metadata with Zod
    const metadataSchema = UploadMetadataSchema.extend({
      subject: z.enum(VALID_SUBJECTS as [string, ...string[]], {
        message: `Subject must be one of: ${VALID_SUBJECTS.join(", ")}`,
      }),
    });

    const metadataParsed = metadataSchema.safeParse({
      title: title?.trim(),
      description: description?.trim() || undefined,
      subject: subject?.trim(),
    });

    if (!metadataParsed.success) {
      const firstError =
        metadataParsed.error.issues?.[0]?.message ??
        (metadataParsed.error as unknown as { errors?: Array<{ message?: string }> })
          .errors?.[0]?.message ??
        "Invalid metadata.";
      return errorResponse(firstError, 400);
    }

    const metadata = metadataParsed.data;

    // Convert File to Buffer for processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Run the PDF validation pipeline
    const validationResult = await validatePDF({
      buffer,
      originalFilename: file.name,
      title: metadata.title,
      declaredSubject: metadata.subject,
    });

    const supabase = createServiceClient();

    if (validationResult.status === "REJECTED") {
      // Store rejected document record for audit trail
      await supabase.from("documents").insert({
        title: metadata.title,
        description: metadata.description ?? null,
        subject: metadata.subject,
        original_filename: file.name,
        storage_path: `rejected/${auth.user.id}/${validationResult.contentHash}`,
        file_size: buffer.length,
        content_type: "application/pdf",
        content_hash: validationResult.contentHash,
        uploader_id: auth.user.id,
        validation_status: "REJECTED",
        validation_failure_reason: validationResult.failureReason,
        validated_at: new Date().toISOString(),
      }).maybeSingle(); // Don't fail if duplicate hash

      return errorResponse(
        validationResult.failureReason ??
          "Document failed validation checks.",
        400
      );
    }

    // Upload approved PDF to storage
    const uploadResult = await uploadPDFToStorage(
      buffer,
      auth.user.id,
      file.name,
      validationResult.contentHash
    );

    storagePath = uploadResult.storagePath;

    // Check for duplicate content hash from this uploader
    const { data: existing } = await supabase
      .from("documents")
      .select("id")
      .eq("content_hash", validationResult.contentHash)
      .eq("uploader_id", auth.user.id)
      .eq("validation_status", "APPROVED")
      .maybeSingle();

    if (existing) {
      // Clean up the uploaded file since it's a duplicate
      await deletePDFFromStorage(storagePath);
      return errorResponse(
        "You have already uploaded this document.",
        409
      );
    }

    // Save approved document metadata to database
    const { data: document, error: insertError } = await supabase
      .from("documents")
      .insert({
        title: metadata.title,
        description: metadata.description ?? null,
        subject: metadata.subject,
        original_filename: file.name,
        storage_path: storagePath,
        file_size: buffer.length,
        content_type: "application/pdf",
        content_hash: validationResult.contentHash,
        uploader_id: auth.user.id,
        validation_status: "APPROVED",
        validated_at: new Date().toISOString(),
      })
      .select("id, title, validation_status, created_at")
      .single();

    if (insertError || !document) {
      // DB insert failed — clean up storage
      await deletePDFFromStorage(storagePath);
      return safeErrorResponse(
        insertError,
        "Failed to save document. Please try again."
      );
    }

    // Trigger embedding generation
    // Non-blocking: document is approved even if this fails
    // generateAndStoreEmbedding handles its own error logging
    generateAndStoreEmbedding({
      documentId: document.id,
      title: metadata.title,
      subject: metadata.subject,
      description: metadata.description,
      extractedText: validationResult.extractedText,
    }).catch((err) =>
      console.error("[Upload] Embedding generation error:", err)
    );

    return successResponse(
      {
        document: {
          id: document.id,
          title: document.title,
          validation_status: document.validation_status,
          created_at: document.created_at,
        },
      },
      "Document uploaded and approved successfully.",
      201
    );
  } catch (err) {
    // If storage upload succeeded but something else failed,
    // clean up the orphaned storage object
    if (storagePath) {
      await deletePDFFromStorage(storagePath).catch((cleanupErr) =>
        console.error("[Upload] Cleanup failed:", cleanupErr)
      );
    }

    if (err instanceof AuthenticationError) {
      return errorResponse(err.message, 401);
    }

    return safeErrorResponse(err, "Upload failed. Please try again.");
  }
}
