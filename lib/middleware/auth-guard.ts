// Server-side auth guard for API route handlers
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { AuthenticationError } from "@/lib/api/errors";
import type { User } from "@/types/auth";

export interface AuthContext {
  user: User;
  sessionId: string;
}

export async function requireAuth(): Promise<AuthContext> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("univault_session")?.value;

  if (!sessionId) {
    throw new AuthenticationError("No session found. Please log in.");
  }

  const supabase = createServiceClient();

  // Look up the session in the database
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, user_id, expires_at, invalidated_at")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    throw new AuthenticationError("Session not found. Please log in again.");
  }

  if (session.invalidated_at !== null) {
    throw new AuthenticationError("Session has been invalidated. Please log in again.");
  }

  if (new Date(session.expires_at) <= new Date()) {
    throw new AuthenticationError("Session has expired. Please log in again.");
  }

  // Fetch the user
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, email, created_at, last_login_at")
    .eq("id", session.user_id)
    .single();

  if (userError || !user) {
    throw new AuthenticationError("User not found. Please log in again.");
  }

  return {
    user: user as User,
    sessionId: session.id,
  };
}

// Helper to extract IP address from request for rate limiting
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}