"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useVerifyOTP, useRequestOTP } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;
const EMAIL_KEY = "univault_pending_email";
const GENERIC_ERROR = "Invalid or expired code. Please request a new one.";

const emptyOtp = (): string[] => Array<string>(OTP_LENGTH).fill("");

export default function VerifyPage() {
  const router = useRouter();
  const { mutateAsync: verifyAsync, isPending: verifying } = useVerifyOTP();
  const { mutateAsync: requestAsync, isPending: resending } = useRequestOTP();

  const [otp, setOtp] = useState<string[]>(emptyOtp);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [locked, setLocked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const submittingRef = useRef(false);
  const code = otp.join("");

  const focusInput = (i: number) => inputRefs.current[i]?.focus();

  // Entry guard: redirect to /login if there's no pending email
  useEffect(() => {
    const pending = sessionStorage.getItem(EMAIL_KEY);
    if (!pending) {
      router.replace("/login");
      return;
    }
    setEmail(pending);
    setTimeout(() => focusInput(0), 100);
  }, [router]);

  // Resend cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const submit = useCallback(
    async (value: string) => {
      if (submittingRef.current || !email || value.length !== OTP_LENGTH) return;
      submittingRef.current = true;
      setError("");
      setInfo("");

      try {
        await verifyAsync({ email, otp: value });

        // Clean up session storage after successful verification
        sessionStorage.removeItem(EMAIL_KEY);

        setSuccess(true);

        // Redirect to dashboard
        router.push("/dashboard");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (/too many/i.test(msg)) {
          setLocked(true);
          setError("Too many attempts. Please request a new code to continue.");
        } else {
          setError(msg || GENERIC_ERROR);
        }
        setOtp(emptyOtp());
        setTimeout(() => focusInput(0), 50);
      } finally {
        submittingRef.current = false;
      }
    },
    [email, verifyAsync, router]
  );

  function fillFrom(start: number, digits: string) {
    const next = [...otp];
    digits.split("").forEach((d, i) => {
      if (start + i < OTP_LENGTH) next[start + i] = d;
    });
    setOtp(next);
    const targetIdx = Math.min(start + digits.length, OTP_LENGTH - 1);
    focusInput(targetIdx);

    // If fully filled via paste, auto submit
    const fullCode = next.join("");
    if (fullCode.length === OTP_LENGTH && !locked && !success) {
      void submit(fullCode);
    }
  }

  function handleChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    setError("");
    if (digits.length === 0) {
      const next = [...otp];
      next[index] = "";
      setOtp(next);
      return;
    }
    fillFrom(index, digits.length > 1 ? digits : digits.slice(-1));
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (digits) fillFrom(0, digits);
  }

  async function handleResend() {
    if (cooldown > 0 || !email || resending) return;
    setError("");
    setInfo("");
    try {
      await requestAsync({ email });
      setOtp(emptyOtp());
      setLocked(false);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setInfo("New verification code sent. Check your email.");
      setTimeout(() => focusInput(0), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== OTP_LENGTH) {
      setError("Please enter all 6 digits.");
      return;
    }
    void submit(code);
  }

  const inputsDisabled = verifying || locked || success;

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
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(EMAIL_KEY);
              router.replace("/login");
            }}
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
            <span>Use a different email</span>
          </button>
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
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Check your inbox
            </span>
          </div>
          <p className="text-slate-400 text-xs">
            Enter the 6-digit code sent to{" "}
            <span className="text-teal-300 font-medium">{email || "your email"}</span>
          </p>
        </div>

        {/* Card Form */}
        <Card className="p-6 sm:p-7">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="block text-xs font-medium text-slate-300">
                  Verification code
                </label>
                <span className="text-[10px] text-slate-500">Expires in 10m</span>
              </div>

              {/* Compact OTP 6-box inputs */}
              <div className="flex gap-1.5 sm:gap-2 justify-between" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    disabled={inputsDisabled}
                    aria-label={`Digit ${i + 1}`}
                    aria-invalid={Boolean(error)}
                    maxLength={1}
                    className={`w-10 h-12 sm:w-11 sm:h-13 text-center text-lg sm:text-xl font-mono font-bold rounded-lg bg-slate-950 text-white border transition-all focus:outline-none focus:ring-1.5 focus:ring-teal-400 focus:border-teal-400 disabled:opacity-50 ${
                      error
                        ? "border-red-500/80 focus:ring-red-400"
                        : digit
                        ? "border-teal-500/60 bg-teal-500/[0.04]"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  />
                ))}
              </div>

              {error && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-red-400" role="alert">
                  <svg
                    width={12}
                    height={12}
                    style={{ width: "12px", height: "12px", maxWidth: "12px", maxHeight: "12px", flexShrink: 0 }}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {info && !error && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-teal-400" role="status">
                  <svg
                    width={12}
                    height={12}
                    style={{ width: "12px", height: "12px", maxWidth: "12px", maxHeight: "12px", flexShrink: 0 }}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{info}</span>
                </div>
              )}

              {success && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-teal-300" role="status">
                  <svg
                    className="animate-spin"
                    width={12}
                    height={12}
                    style={{ width: "12px", height: "12px", maxWidth: "12px", maxHeight: "12px", flexShrink: 0 }}
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Verified. Redirecting…</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              size="md"
              loading={verifying}
              disabled={code.length !== OTP_LENGTH || locked || success}
              className="w-full"
            >
              {success ? "Verified!" : verifying ? "Verifying code…" : "Verify OTP"}
            </Button>

            <div className="pt-1 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
              <span>Didn&apos;t receive code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || resending || success}
                className="font-medium text-teal-400 hover:text-teal-300 disabled:cursor-not-allowed disabled:text-slate-600 transition-colors"
              >
                {resending
                  ? "Sending..."
                  : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend code"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
