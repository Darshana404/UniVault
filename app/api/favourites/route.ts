import { NextRequest } from "next/server";
import { successResponse, errorResponse, safeErrorResponse } from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth-guard";
import { AuthenticationError } from "@/lib/api/errors";
import { createServiceClient } from "@/lib/supabase/server";

// GET /api/favourites — list all favourited documents for current user
export async function GET(_request: NextRequest) {
  try {
    const auth = await requireAuth();
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("favourites")
      .select("created_at, documents(*)")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const documents = (data ?? [])
      .map((row: { documents: unknown }) =>
        Array.isArray(row.documents) ? row.documents[0] : row.documents
      )
      .filter(Boolean);

    return successResponse(documents);
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return errorResponse(err.message, 401);
    }
    return safeErrorResponse(err, "Failed to fetch favourites.");
  }
}

// POST /api/favourites — add favourite
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await request.json();
    const { documentId } = body;

    if (!documentId) {
      return errorResponse("documentId is required", 400);
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from("favourites")
      .upsert(
        { user_id: auth.user.id, document_id: documentId },
        { onConflict: "user_id,document_id" }
      );

    if (error) throw error;

    return successResponse({ success: true, favourited: true });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return errorResponse(err.message, 401);
    }
    return safeErrorResponse(err, "Failed to add favourite.");
  }
}

// DELETE /api/favourites?documentId=... — remove favourite
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return errorResponse("documentId is required", 400);
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from("favourites")
      .delete()
      .eq("user_id", auth.user.id)
      .eq("document_id", documentId);

    if (error) throw error;

    return successResponse({ success: true, favourited: false });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return errorResponse(err.message, 401);
    }
    return safeErrorResponse(err, "Failed to remove favourite.");
  }
}

