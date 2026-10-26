// Browser-side Supabase client
// Uses ONLY the anon key — safe to use in React components
import { createBrowserClient } from "@supabase/ssr";

function sanitize(val?: string): string {
  return (val ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/+$/, "")
    .replace(/\/rest\/v1\/?$/i, "");
}

export function createClient() {
  return createBrowserClient(
    sanitize(process.env.NEXT_PUBLIC_SUPABASE_URL),
    sanitize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}