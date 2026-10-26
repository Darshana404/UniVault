import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  safeErrorResponse,
} from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth-guard";
import { AuthenticationError } from "@/lib/api/errors";
import { createServiceClient } from "@/lib/supabase/server";
import { generateSignedDownloadURL } from "@/lib/storage/documents";
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

    // Only allow downloads of approved documents
    const { data: document, error } = await supabase
      .from("documents")
      .select("id, storage_path, validation_status, title")
      .eq("id", id)
      .eq("validation_status", "APPROVED")
      .single();

    if (error || !document) {
      return errorResponse("Document not found or not available.", 404);
    }

    // Generate a signed URL (expires in 5 minutes)
    const signedUrl = await generateSignedDownloadURL(
      document.storage_path,
      300
    );

    return successResponse({
      url: signedUrl,
      filename: `${document.title}.pdf`,
      expiresIn: 300,
    });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return errorResponse(err.message, 401);
    }
    return safeErrorResponse(err, "Failed to generate download link.");
  }
}

