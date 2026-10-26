import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  safeErrorResponse,
} from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth-guard";
import { AuthenticationError } from "@/lib/api/errors";
import { getSubjects } from "@/lib/search/keyword";

export async function GET(_request: NextRequest) {
  try {
    await requireAuth();
    const subjects = await getSubjects();
    return successResponse({ subjects });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return errorResponse(err.message, 401);
    }
    return safeErrorResponse(err, "Failed to fetch subjects.");
  }
}

