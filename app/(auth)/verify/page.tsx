"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useVerifyOTP, useRequestOTP } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;
const EMAIL_KEY = "univault_pending_email";
const GENERIC_ERROR = "Invalid or expired code. Please request a new one.";

const emptyOtp = (): string[] => Array<string>(OTP_LENGTH).fill("");

const noopSubscribe = () => () => {};
const readPendingEmail = () => sessionStorage.getItem(EMAIL_KEY) ?? "";
const serverEmail = () => "";

export default function VerifyPage() {
  const router = useRouter();
  const { mutateAsync: verifyAsync, isPending: verifying } = useVerifyOTP();
  const { mutateAsync: requestAsync, isPending: resending } = useRequestOTP();

  const [otp, setOtp] = useState<string[]>(emptyOtp);
  const email = useSyncExternalStore(noopSubscribe, readPendingEmail, serverEmail);
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

    const timer = setTimeout(() => {
      focusInput(0);
    }, 100);

    return () => clearTimeout(timer);
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
        sessionStorage.removeItem(EMAIL_KEY);
        setSuccess(true);
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
    <main className="auth-page">
      <div className="auth-container">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem(EMAIL_KEY);
            router.replace("/login");
          }}
          className="auth-back"
        >
          <svg
            width={12}
            height={12}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>Use a different email</span>
        </button>

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
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <span className="logo">
              Uni<span className="logo__accent">Vault</span>
            </span>
          </div>
          <h1 className="page-title">Verify code</h1>
          <p className="pdf-meta">
            We sent a 6-digit verification code to
          </p>
          <p className="section-label">
            {email || "your university email"}
          </p>
        </div>

        {/* Card Form */}
        <Card>
          <form onSubmit={handleSubmit} noValidate className="auth-form">
            <div className="form-field">
              <label
                htmlFor="otp-0"
                className="form-field__label text-center"
              >
                Enter 6-digit code
              </label>

              {/* 6 Digit Input Group */}
              <div
                className="otp-group"
                onPaste={handlePaste}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    disabled={inputsDisabled}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    aria-label={`Digit ${i + 1} of 6`}
                    className="otp-input"
                  />
                ))}
              </div>

              {error && (
                <div className="status-message status-message--error" role="alert">
                  <svg
                    width={12}
                    height={12}
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
                <div className="status-message status-message--info" role="status">
                  <svg
                    width={12}
                    height={12}
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
                <div className="status-message status-message--success" role="status">
                  <svg
                    className="animate-spin"
                    width={12}
                    height={12}
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
              className="btn--full"
            >
              {success ? "Verified!" : verifying ? "Verifying code…" : "Verify OTP"}
            </Button>

            <div className="auth-footer">
              <span>Didn&apos;t receive code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || resending || success}
                className="section-header__link"
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