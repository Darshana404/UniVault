// Returns the embedding status for a document
// Used to show users whether their document is searchable semantically

import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  safeErrorResponse,
} from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth-guard";
import { AuthenticationError } from "@/lib/api/errors";
import { createServiceClient } from "@/lib/supabase/server";
import { DocumentIdSchema } from "@/lib/api/schemas";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const parsed = DocumentIdSchema.safeParse({ id });
    if (!parsed.success) {
      return errorResponse("Invalid document ID.", 400);
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("document_embeddings")
      .select("embedding_status, embedding_model, error_message, updated_at")
      .eq("document_id", id)
      .single();

    if (error || !data) {
      return successResponse({
        embedding_status: "NOT_FOUND",
        message: "No embedding record found for this document.",
      });
    }

    return successResponse({
      embedding_status: data.embedding_status,
      embedding_model: data.embedding_model,
      error_message:
        data.embedding_status === "FAILED" ? data.error_message : null,
      updated_at: data.updated_at,
    });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return errorResponse(err.message, 401);
    }
    return safeErrorResponse(err, "Failed to fetch embedding status.");
  }
}

