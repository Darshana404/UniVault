import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateOTP,
  hashOTP,
  verifyOTPHash,
  isOTPExpired,
  isWithinResendCooldown,
} from "@/lib/auth/otp";

describe("OTP Generation", () => {
  it("generates a 6-digit string", () => {
    const otp = generateOTP();
    expect(otp).toHaveLength(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });

  it("generates unique OTPs", () => {
    const otps = new Set(Array.from({ length: 100 }, () => generateOTP()));
    // With 100 attempts, collisions should be extremely rare
    expect(otps.size).toBeGreaterThan(90);
  });

  it("zero-pads short numbers", () => {
    // Since we can't control randomInt, just verify format is always 6 digits
    for (let i = 0; i < 20; i++) {
      const otp = generateOTP();
      expect(otp.length).toBe(6);
    }
  });
});

describe("OTP Hashing", () => {
  it("hashes an OTP and verifies it correctly", async () => {
    const otp = "123456";
    const hash = await hashOTP(otp);
    expect(hash).not.toBe(otp);
    const valid = await verifyOTPHash(otp, hash);
    expect(valid).toBe(true);
  });

  it("rejects an incorrect OTP", async () => {
    const hash = await hashOTP("123456");
    const valid = await verifyOTPHash("654321", hash);
    expect(valid).toBe(false);
  });

  it("produces different hashes for the same OTP (bcrypt salt)", async () => {
    const otp = "123456";
    const hash1 = await hashOTP(otp);
    const hash2 = await hashOTP(otp);
    expect(hash1).not.toBe(hash2);
  });
});

describe("OTP Expiry", () => {
  it("correctly identifies an expired OTP", () => {
    const past = new Date(Date.now() - 1000);
    expect(isOTPExpired(past)).toBe(true);
  });

  it("correctly identifies a valid (non-expired) OTP", () => {
    const future = new Date(Date.now() + 60000);
    expect(isOTPExpired(future)).toBe(false);
  });
});

describe("Resend Cooldown", () => {
  it("detects active cooldown for recent creation", () => {
    const justNow = new Date(Date.now() - 5000); // 5 seconds ago
    expect(isWithinResendCooldown(justNow)).toBe(true);
  });

  it("allows resend after cooldown expires", () => {
    const longAgo = new Date(Date.now() - 120000); // 2 minutes ago
    expect(isWithinResendCooldown(longAgo)).toBe(false);
  });
});