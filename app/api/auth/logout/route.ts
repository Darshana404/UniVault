import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { successResponse } from "@/lib/api/response";
import { invalidateSession } from "@/lib/auth/session";

const SESSION_COOKIE_NAME = "univault_session";

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionId) {
      await invalidateSession(sessionId);
    } else {
      // Clear cookie if present or stale
      cookieStore.set({
        name: SESSION_COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
    }

    return successResponse({ message: "Logged out successfully." });
  } catch {
    // In any error case, ensure the cookie is cleared
    try {
      const cookieStore = await cookies();
      cookieStore.set({
        name: SESSION_COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
    } catch {
      // ignore
    }

    return successResponse({ message: "Logged out successfully." });
  }
}
