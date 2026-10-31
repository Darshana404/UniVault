"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types/auth";

// Query key constants
export const AUTH_QUERY_KEY = ["auth", "me"] as const;

// Fetch current user
async function fetchCurrentUser(): Promise<User | null> {
  const res = await fetch("/api/auth/me");
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Failed to fetch user.");
  const data = await res.json();
  return data.data?.user ?? null;
}

// Request OTP
async function requestOTP(email: string) {
  const res = await fetch("/api/auth/request-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to send code.");
  return data.data as { message: string; devOtp?: string };
}

// Verify OTP
async function verifyOTP(email: string, otp: string) {
  const res = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Verification failed.");
  return data.data;
}

// Logout
async function logout() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // ignore network failure so UI can still redirect and clear state
  }
}

// Hooks
export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

export function useRequestOTP() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) => requestOTP(email),
  });
}

export function useVerifyOTP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      verifyOTP(email, otp),
    onSuccess: () => {
      // Invalidate the auth cache so /dashboard picks up the new session.
      // Navigation is handled by the verify page itself so we avoid a race.
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear();
      // Hard redirect to /login?logout=true ensuring cookies are cleared and page state completely resets
      window.location.href = "/login?logout=true";
    },
  });
}
