// Internal admin endpoint to retry failed embeddings
// Protected — only callable with service role awareness
// In production, this would be called by a scheduled job

import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  safeErrorResponse,
} from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth-guard";
import { AuthenticationError } from "@/lib/api/errors";
import { retryFailedEmbeddings } from "@/lib/search/embedding-service";

export async function POST(_request: NextRequest) {
  try {
    // Require authentication (extend to admin check in production)
    await requireAuth();

    const result = await retryFailedEmbeddings();

    return successResponse({
      attempted: result.attempted,
      succeeded: result.succeeded,
      message: `Retried ${result.attempted} embeddings. ${result.succeeded} succeeded.`,
    });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return errorResponse(err.message, 401);
    }
    return safeErrorResponse(err, "Failed to retry embeddings.");
  }
}
