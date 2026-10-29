import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  safeErrorResponse,
} from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth-guard";
import {
  AuthenticationError,
} from "@/lib/api/errors";
import {
  getDocumentById,
  getDocumentByIdForOwner,
} from "@/lib/search/keyword";
import { DocumentIdSchema } from "@/lib/api/schemas";
import { createServiceClient } from "@/lib/supabase/server";
import { deletePDFFromStorage } from "@/lib/storage/documents";

// GET /api/documents/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    const { id } = await params;

    const parsed = DocumentIdSchema.safeParse({ id });
    if (!parsed.success) {
      return errorResponse("Invalid document ID.", 400);
    }

    let document = await getDocumentById(id);

    if (!document) {
      document = await getDocumentByIdForOwner(id, auth.user.id);
      if (!document) {
        return errorResponse("Document not found.", 404);
      }
    }

    return successResponse({ document });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return errorResponse(err.message, 401);
    }
    return safeErrorResponse(err, "Failed to fetch document.");
  }
}

// DELETE /api/documents/[id]
// Full cleanup sequence:
// 1. Verify ownership
// 2. Delete from Supabase Storage
// 3. Delete embedding record
// 4. Delete document metadata
// On partial failure, logs the error and continues
// to avoid orphaned records in either direction
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    const { id } = await params;

    const parsed = DocumentIdSchema.safeParse({ id });
    if (!parsed.success) {
      return errorResponse("Invalid document ID.", 400);
    }

    const supabase = createServiceClient();

    // Fetch document and verify ownership in a single query
    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("id, uploader_id, storage_path, validation_status, title")
      .eq("id", id)
      .single();

    if (fetchError || !document) {
      return errorResponse("Document not found.", 404);
    }

    // Authorization check — only the uploader can delete
    if (document.uploader_id !== auth.user.id) {
      return errorResponse(
        "You do not have permission to delete this document.",
        403
      );
    }

    const cleanupErrors: string[] = [];

    // Step 1: Delete from storage
    // Only attempt if the document was approved and has a real storage path
    if (
      document.validation_status === "APPROVED" &&
      document.storage_path.startsWith("uploads/")
    ) {
      try {
        await deletePDFFromStorage(document.storage_path);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Storage delete failed";
        cleanupErrors.push(`Storage: ${msg}`);
        console.error("[Delete] Storage cleanup failed:", msg);
        // Continue — we still want to remove DB records
      }
    }

    // Step 2: Delete embedding record
    // FK cascade should handle this, but being explicit
    const { error: embeddingError } = await supabase
      .from("document_embeddings")
      .delete()
      .eq("document_id", id);

    if (embeddingError) {
      cleanupErrors.push(`Embedding: ${embeddingError.message}`);
      console.error("[Delete] Embedding cleanup failed:", embeddingError.message);
    }

    // Step 3: Delete document record
    // Include uploader_id check as a safety net
    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .eq("id", id)
      .eq("uploader_id", auth.user.id);

    if (deleteError) {
      return safeErrorResponse(
        deleteError,
        "Failed to delete document record."
      );
    }

    // Return success even if storage/embedding cleanup had issues
    // The DB record is gone — the document is inaccessible
    if (cleanupErrors.length > 0) {
      console.warn(
        `[Delete] Document ${id} deleted with cleanup warnings:`,
        cleanupErrors
      );
    }

    return successResponse({
      message: "Document deleted successfully.",
      id,
    });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return errorResponse(err.message, 401);
    }
    return safeErrorResponse(err, "Failed to delete document.");
  }
}
