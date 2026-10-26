import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";
import type { User } from "@/types/auth";

const SESSION_COOKIE_NAME = "univault_session";
const SESSION_EXPIRY_DAYS = config.auth.sessionExpiryDays;

// Cookie options
function getCookieOptions(expiresAt: Date) {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  };
}

// Create a new session for a user and set the cookie
export async function createSession(userId: string): Promise<string> {
  const supabase = createServiceClient();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  const { data: session, error } = await supabase
    .from("sessions")
    .insert({
      user_id: userId,
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (error || !session) {
    throw new Error("Failed to create session.");
  }

  // Set HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set({
    ...getCookieOptions(expiresAt),
    value: session.id,
  });

  return session.id;
}

// Validate the current session from cookie
export async function getSession(): Promise<{
  user: User;
  sessionId: string;
} | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) return null;

  const supabase = createServiceClient();

  const { data: session, error } = await supabase
    .from("sessions")
    .select("id, user_id, expires_at, invalidated_at")
    .eq("id", sessionId)
    .single();

  if (error || !session) return null;
  if (session.invalidated_at !== null) return null;
  if (new Date(session.expires_at) <= new Date()) return null;

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, email, created_at, last_login_at")
    .eq("id", session.user_id)
    .single();

  if (userError || !user) return null;

  return { user: user as User, sessionId: session.id };
}

// Invalidate session on logout
export async function invalidateSession(sessionId: string): Promise<void> {
  const supabase = createServiceClient();

  await supabase
    .from("sessions")
    .update({ invalidated_at: new Date().toISOString() })
    .eq("id", sessionId);

  // Clear the cookie
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0, // Immediately expire
  });
}

// Invalidate all sessions for a user (e.g. on password change)
export async function invalidateAllUserSessions(
  userId: string
): Promise<void> {
  const supabase = createServiceClient();

  await supabase
    .from("sessions")
    .update({ invalidated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("invalidated_at", null);
}