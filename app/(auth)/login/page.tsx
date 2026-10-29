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
    <main className="auth-page">
      <div className="auth-container">
        {/* Back Link */}
        <Link href="/" className="auth-back">
          <svg
            width="12"
            height="12"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>Back to home</span>
        </Link>

        {/* Brand Header */}
        <div className="auth-brand">
          <div className="auth-brand__badge">
            <div className="auth-brand__icon">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                />
              </svg>
            </div>
            <span className="logo">
              Uni<span className="logo__accent">Vault</span>
            </span>
          </div>
          <h1 className="page-title">Sign in</h1>
          <p className="pdf-meta">
            Enter your university email to receive a login code
          </p>
        </div>

        {/* Card Form */}
        <Card>
          <form onSubmit={handleSubmit} noValidate className="auth-form">
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
              className="btn--full"
            >
              {requestOTP.isPending ? "Sending code…" : "Send verification code"}
            </Button>
          </form>
        </Card>

        {/* Security / Verification footer */}
        <div className="auth-footer">
          <svg
            width="12"
            height="12"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
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
