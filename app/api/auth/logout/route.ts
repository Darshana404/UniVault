import { NextRequest } from "next/server";
import { successResponse, safeErrorResponse } from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth-guard";
import { invalidateSession } from "@/lib/auth/session";

export async function POST(_request: NextRequest) {
  try {
    const auth = await requireAuth();
    await invalidateSession(auth.sessionId);
    return successResponse({ message: "Logged out successfully." });
  } catch {
    // Even if session validation fails, clear the cookie
    // by calling invalidateSession with an empty string guard
    return safeErrorResponse(null, "Logout failed.", 500);
  }
}