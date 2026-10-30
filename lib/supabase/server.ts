// Server-side Supabase client
// Uses the service-role key — NEVER import this in client components
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function sanitize(val?: string): string {
  return (val ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/+$/, "")
    .replace(/\/rest\/v1\/?$/i, "");
}

function getRuntimeEnv(key: string): string | undefined {
  // Using dynamic bracket access prevents Turbopack/Next.js from inlining
  // build-time placeholder strings into server-side code bundles.
  return process.env[key];
}

// Service-role client: bypasses RLS — use only for trusted server operations
export function createServiceClient() {
  const url = sanitize(
    getRuntimeEnv("SUPABASE_URL") ||
    getRuntimeEnv("NEXT_PUBLIC_SUPABASE_URL")
  );
  const key = sanitize(
    getRuntimeEnv("SUPABASE_SERVICE_ROLE_KEY")
  );

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createSupabaseClient(url, key, {
    auth: {
      // Disable auto-refresh and session persistence on the server
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Anon client for server-side operations that should respect RLS
export function createAnonServerClient() {
  const url = sanitize(
    getRuntimeEnv("SUPABASE_URL") ||
    getRuntimeEnv("NEXT_PUBLIC_SUPABASE_URL")
  );
  const key = sanitize(
    getRuntimeEnv("SUPABASE_ANON_KEY") ||
    getRuntimeEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}