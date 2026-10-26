"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRequestOTP } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const router = useRouter();
  const requestOTP = useRequestOTP();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setFormError("Please enter your university email address.");
      return;
    }

    try {
      await requestOTP.mutateAsync({ email: trimmed });

      // Store email in sessionStorage for the verify page
      sessionStorage.setItem("univault_pending_email", trimmed);

      router.push("/verify");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to send code. Try again."
      );
    }
  }

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center bg-slate-950 px-4 py-8 overflow-hidden">
      {/* Subtle background ambient light */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-teal-500/10 blur-[100px] rounded-full"
        aria-hidden="true"
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors"
          >
            <svg
              width={12}
              height={12}
              style={{ width: "12px", height: "12px", maxWidth: "12px", maxHeight: "12px", flexShrink: 0 }}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span>Back to home</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400"
              style={{ width: "28px", height: "28px", minWidth: "28px", minHeight: "28px" }}
            >
              <svg
                width={14}
                height={14}
                style={{ width: "14px", height: "14px", maxWidth: "14px", maxHeight: "14px", flexShrink: 0 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Uni<span className="text-teal-400">Vault</span>
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Sign in</h1>
          <p className="text-slate-400 mt-1 text-xs">
            Enter your university email to receive a login code
          </p>
        </div>

        {/* Card Form */}
        <Card className="p-6 sm:p-7">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="University Email"
              type="email"
              placeholder="you@snuchennai.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={formError}
              autoComplete="email"
              autoFocus
              disabled={requestOTP.isPending}
            />

            <Button
              type="submit"
              size="md"
              loading={requestOTP.isPending}
              className="w-full mt-1"
            >
              {requestOTP.isPending ? "Sending code…" : "Send verification code"}
            </Button>
          </form>
        </Card>

        {/* Security / Verification footer */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-slate-500 text-[11px] text-center">
          <svg
            width={12}
            height={12}
            style={{ width: "12px", height: "12px", maxWidth: "12px", maxHeight: "12px", flexShrink: 0 }}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="text-teal-500/70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
          <span>Restricted to authorized university domains</span>
        </div>
      </div>
    </main>
  );
}
