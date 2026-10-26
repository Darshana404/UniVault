import { NextRequest } from "next/server";
import { successResponse, errorResponse, safeErrorResponse } from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth-guard";
import { AuthenticationError } from "@/lib/api/errors";

export async function GET(_request: NextRequest) {
  try {
    const auth = await requireAuth();
    return successResponse({ user: auth.user });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return errorResponse(err.message, 401);
    }
    return safeErrorResponse(err);
  }
}