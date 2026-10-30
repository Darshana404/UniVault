import { NextRequest } from "next/server";
import { successResponse, errorResponse, safeErrorResponse } from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth-guard";
import { AuthenticationError } from "@/lib/api/errors";
import { createServiceClient } from "@/lib/supabase/server";

// GET /api/favourites/[id] — check if document is favourited by current user
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    const { id: documentId } = await params;
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("favourites")
      .select("id")
      .eq("user_id", auth.user.id)
      .eq("document_id", documentId)
      .maybeSingle();

    if (error) throw error;

    return successResponse({ isFavourited: Boolean(data) });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return errorResponse(err.message, 401);
    }
    return safeErrorResponse(err, "Failed to check favourite status.");
  }
}

