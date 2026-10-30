import { NextRequest } from "next/server";
import { successResponse, errorResponse, safeErrorResponse } from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth-guard";
import { AuthenticationError } from "@/lib/api/errors";
import { createServiceClient } from "@/lib/supabase/server";

// GET /api/my-uploads — list all documents uploaded by current user
export async function GET(_request: NextRequest) {
  try {
    const auth = await requireAuth();
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("uploader_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return successResponse(data ?? []);
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return errorResponse(err.message, 401);
    }
    return safeErrorResponse(err, "Failed to fetch user uploads.");
  }
}

