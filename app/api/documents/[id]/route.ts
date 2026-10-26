import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  safeErrorResponse,
} from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth-guard";
import {
  AuthenticationError,
  AuthorizationError,
} from "@/lib/api/errors";
import {
  getDocumentById,
  getDocumentByIdForOwner,
} from "@/lib/search/keyword";
import { DocumentIdSchema } from "@/lib/api/schemas";
import { createServiceClient } from "@/lib/supabase/server";

// GET /api/documents/[id] — get document metadata
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

    // Try to get as approved document first
    let document = await getDocumentById(id);

    // If not found as approved, check if requester is the owner
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

// DELETE /api/documents/[id] — delete own document
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

    // Fetch document — verify ownership
    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("id, uploader_id, storage_path")
      .eq("id", id)
      .single();

    if (fetchError || !document) {
      return errorResponse("Document not found.", 404);
    }

    if (document.uploader_id !== auth.user.id) {
      return errorResponse("You do not have permission to delete this document.", 403);
    }

    // Delete storage object first
    const { error: storageError } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET ?? "univault-documents")
      .remove([document.storage_path]);

    if (storageError) {
      // Log but continue — we still want to remove the DB record
      console.error("[Delete] Storage removal failed:", storageError.message);
    }

    // Delete embedding record (cascade handles this via FK,
    // but being explicit for clarity)
    await supabase
      .from("document_embeddings")
      .delete()
      .eq("document_id", id);

    // Delete document record
    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .eq("id", id)
      .eq("uploader_id", auth.user.id); // Double-check ownership in query

    if (deleteError) {
      return safeErrorResponse(deleteError, "Failed to delete document.");
    }

    return successResponse({ message: "Document deleted successfully." });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return errorResponse(err.message, 401);
    }
    if (err instanceof AuthorizationError) {
      return errorResponse(err.message, 403);
    }
    return safeErrorResponse(err, "Failed to delete document.");
  }
}

