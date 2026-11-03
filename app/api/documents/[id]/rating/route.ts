import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  safeErrorResponse,
} from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth-guard";
import { AuthenticationError } from "@/lib/api/errors";
import { createServiceClient } from "@/lib/supabase/server";
import { DocumentIdSchema, RatingSchema } from "@/lib/api/schemas";

// GET /api/documents/[id]/rating — Get rating summary and user's rating for this document
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

    const supabase = createServiceClient();

    // Fetch document rating stats
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("rating_avg, rating_count")
      .eq("id", id)
      .single();

    if (docError || !document) {
      return errorResponse("Document not found.", 404);
    }

    // Fetch current user's rating if any
    const { data: userRatingRecord } = await supabase
      .from("document_ratings")
      .select("rating")
      .eq("document_id", id)
      .eq("user_id", auth.user.id)
      .maybeSingle();

    return successResponse({
      rating_avg: Number(document.rating_avg ?? 0),
      rating_count: Number(document.rating_count ?? 0),
      user_rating: userRatingRecord ? userRatingRecord.rating : null,
    });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return errorResponse(err.message, 401);
    }
    return safeErrorResponse(err, "Failed to retrieve rating.");
  }
}

// POST /api/documents/[id]/rating — Submit or update rating
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    const { id } = await params;

    const parsedId = DocumentIdSchema.safeParse({ id });
    if (!parsedId.success) {
      return errorResponse("Invalid document ID.", 400);
    }

    const body = await request.json().catch(() => ({}));
    const parsedRating = RatingSchema.safeParse(body);
    if (!parsedRating.success) {
      return errorResponse(
        parsedRating.error.issues[0]?.message ?? "Invalid rating.",
        400
      );
    }

    const supabase = createServiceClient();

    // Verify document exists and is approved
    const { data: doc, error: docCheckError } = await supabase
      .from("documents")
      .select("id, uploader_id")
      .eq("id", id)
      .eq("validation_status", "APPROVED")
      .single();

    if (docCheckError || !doc) {
      return errorResponse("Document not found or not approved for ratings.", 404);
    }

    // Check if the user has already rated this document
    const { data: existingRating } = await supabase
      .from("document_ratings")
      .select("rating")
      .eq("document_id", id)
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (existingRating) {
      return errorResponse("You have already rated this document.", 409);
    }

    // Insert rating in document_ratings
    const { error: insertError } = await supabase
      .from("document_ratings")
      .insert({
        document_id: id,
        user_id: auth.user.id,
        rating: parsedRating.data.rating,
      });

    if (insertError) {
      throw insertError;
    }

    // Fetch the updated document stats (updated by trigger, or fallback calculate)
    const { data: updatedDoc } = await supabase
      .from("documents")
      .select("rating_avg, rating_count")
      .eq("id", id)
      .single();

    return successResponse({
      rating_avg: Number(updatedDoc?.rating_avg ?? parsedRating.data.rating),
      rating_count: Number(updatedDoc?.rating_count ?? 1),
      user_rating: parsedRating.data.rating,
    });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return errorResponse(err.message, 401);
    }
    return safeErrorResponse(err, "Failed to submit rating.");
  }
}

// DELETE /api/documents/[id]/rating — Remove current user's rating
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

    const { error: deleteError } = await supabase
      .from("document_ratings")
      .delete()
      .eq("document_id", id)
      .eq("user_id", auth.user.id);

    if (deleteError) {
      throw deleteError;
    }

    const { data: updatedDoc } = await supabase
      .from("documents")
      .select("rating_avg, rating_count")
      .eq("id", id)
      .single();

    return successResponse({
      rating_avg: Number(updatedDoc?.rating_avg ?? 0),
      rating_count: Number(updatedDoc?.rating_count ?? 0),
      user_rating: null,
    });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return errorResponse(err.message, 401);
    }
    return safeErrorResponse(err, "Failed to remove rating.");
  }
}
