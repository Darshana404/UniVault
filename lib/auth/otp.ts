import crypto from "crypto";
import bcrypt from "bcryptjs";
import { config } from "@/lib/config";

const BCRYPT_ROUNDS = 10;
const OTP_LENGTH = 6;

// Generate a cryptographically secure 6-digit OTP
export function generateOTP(): string {
  // Use crypto.randomInt for unbiased random number generation
  const otp = crypto.randomInt(0, 10 ** OTP_LENGTH);
  // Zero-pad to ensure always 6 digits
  return otp.toString().padStart(OTP_LENGTH, "0");
}

// Hash an OTP for safe storage
export async function hashOTP(otp: string): Promise<string> {
  return bcrypt.hash(otp, BCRYPT_ROUNDS);
}

// Verify an OTP against its stored hash
export async function verifyOTPHash(
  otp: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

// Calculate OTP expiry timestamp
export function getOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + config.auth.otpExpiryMinutes);
  return expiry;
}

// Check if an OTP challenge has expired
export function isOTPExpired(expiresAt: string | Date): boolean {
  return new Date(expiresAt) <= new Date();
}

// Check resend cooldown
export function isWithinResendCooldown(createdAt: string | Date): boolean {
  const cooldownMs = config.auth.otpResendCooldownSeconds * 1000;
  const elapsed = Date.now() - new Date(createdAt).getTime();
  return elapsed < cooldownMs;
}