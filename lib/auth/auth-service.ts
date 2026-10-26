// Core authentication business logic
// Keeps all auth operations in one place, separate from HTTP handlers

import { createServiceClient } from "@/lib/supabase/server";
import { normalizeEmail } from "./email-validator";
import {
  generateOTP,
  hashOTP,
  verifyOTPHash,
  getOTPExpiry,
  isOTPExpired,
  isWithinResendCooldown,
} from "./otp";
import { sendOTPEmail } from "./email";
import { config } from "@/lib/config";

export interface RequestOTPResult {
  success: boolean;
  message: string;
  // Only populated in development to avoid email sending
  devOtp?: string;
}

export interface VerifyOTPResult {
  success: boolean;
  userId?: string;
  message: string;
}

export async function requestOTP(
  rawEmail: string
): Promise<RequestOTPResult> {
  const email = normalizeEmail(rawEmail);
  const supabase = createServiceClient();

  // Find or create user
  // We upsert to avoid revealing whether email exists
  const { data: user, error: upsertError } = await supabase
    .from("users")
    .upsert({ email }, { onConflict: "email" })
    .select("id, created_at")
    .single();

  if (upsertError || !user) {
    console.error("[Supabase upsertError in requestOTP]:", upsertError);
    throw new Error(
      `Failed to process authentication request: ${upsertError?.message ?? "User not found"}`
    );
  }

  // Check resend cooldown — find the most recent active challenge
  const { data: existingChallenge } = await supabase
    .from("otp_challenges")
    .select("id, created_at, superseded_at")
    .eq("email", email)
    .is("superseded_at", null)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (
    existingChallenge &&
    isWithinResendCooldown(existingChallenge.created_at)
  ) {
    const cooldown = config.auth.otpResendCooldownSeconds;
    return {
      success: false,
      message: `Please wait ${cooldown} seconds before requesting a new code.`,
    };
  }

  // Supersede any existing active challenges for this email
  if (existingChallenge) {
    await supabase
      .from("otp_challenges")
      .update({ superseded_at: new Date().toISOString() })
      .eq("email", email)
      .is("superseded_at", null)
      .is("used_at", null);
  }

  // Generate and hash OTP
  const otp = generateOTP();
  const otpHash = await hashOTP(otp);
  const expiresAt = getOTPExpiry();

  // Store the challenge
  const { error: insertError } = await supabase
    .from("otp_challenges")
    .insert({
      user_id: user.id,
      email,
      otp_hash: otpHash,
      expires_at: expiresAt.toISOString(),
    });

  if (insertError) {
    console.error("[Supabase insertError in requestOTP]:", insertError);
    throw new Error("Failed to create authentication challenge.");
  }

  // Send email (skip in test environment)
  if (config.app.nodeEnv !== "test") {
    try {
      await sendOTPEmail(email, otp);
    } catch (emailErr) {
      console.error("[Email Dispatch Error]:", emailErr);
      if (!config.app.isDev) {
        throw new Error("Failed to send verification email. Please verify SMTP settings.");
      }
    }
  }

  // In development, log and return OTP for easy testing
  if (config.app.isDev) {
    console.warn(
      `[DEV ONLY] OTP for ${email}: ${otp} — Use this code on the verification screen`
    );
    return {
      success: true,
      message: "Verification code sent to your email.",
      devOtp: otp,
    };
  }

  return {
    success: true,
    message: "Verification code sent to your email.",
  };
}

export async function verifyOTP(
  rawEmail: string,
  submittedOtp: string
): Promise<VerifyOTPResult> {
  const email = normalizeEmail(rawEmail);
  const supabase = createServiceClient();

  // Find the active challenge for this email
  const { data: challenge, error: challengeError } = await supabase
    .from("otp_challenges")
    .select("id, otp_hash, expires_at, used_at, attempt_count, user_id")
    .eq("email", email)
    .is("superseded_at", null)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Return same message for not found, used, or superseded
  // This prevents enumeration attacks
  if (challengeError || !challenge) {
    return {
      success: false,
      message: "Invalid or expired verification code.",
    };
  }

  // Check expiry
  if (isOTPExpired(challenge.expires_at)) {
    return {
      success: false,
      message: "Verification code has expired. Please request a new one.",
    };
  }

  // Check attempt limit
  if (challenge.attempt_count >= config.auth.otpMaxAttempts) {
    return {
      success: false,
      message:
        "Too many incorrect attempts. Please request a new verification code.",
    };
  }

  // Increment attempt count first (before verification)
  // This prevents race conditions on concurrent requests
  const { data: updated, error: updateError } = await supabase
    .from("otp_challenges")
    .update({ attempt_count: challenge.attempt_count + 1 })
    .eq("id", challenge.id)
    .eq("attempt_count", challenge.attempt_count) // Optimistic lock
    .is("used_at", null)
    .select("id")
    .single();

  if (updateError || !updated) {
    // Another concurrent request modified this challenge
    return {
      success: false,
      message: "Invalid or expired verification code.",
    };
  }

  // Verify OTP hash
  const isValid = await verifyOTPHash(submittedOtp, challenge.otp_hash);

  if (!isValid) {
    return {
      success: false,
      message: "Incorrect verification code.",
    };
  }

  // Mark challenge as used (atomic single-use enforcement)
  const { data: consumed, error: consumeError } = await supabase
    .from("otp_challenges")
    .update({ used_at: new Date().toISOString() })
    .eq("id", challenge.id)
    .is("used_at", null) // Only mark as used if not already used
    .select("id")
    .single();

  if (consumeError || !consumed) {
    // Race condition: another request already consumed this OTP
    return {
      success: false,
      message: "Verification code has already been used.",
    };
  }

  // Update last login timestamp
  await supabase
    .from("users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", challenge.user_id);

  return {
    success: true,
    userId: challenge.user_id,
    message: "Verification successful.",
  };
}
