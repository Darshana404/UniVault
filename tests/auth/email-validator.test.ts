import { describe, it, expect, vi } from "vitest";

// Mock the config module before importing email-validator
vi.mock("@/lib/config", () => ({
  config: {
    auth: {
      allowedDomains: ["university.edu", "college.ac.in"],
      otpExpiryMinutes: 10,
      otpMaxAttempts: 5,
      otpResendCooldownSeconds: 60,
      sessionExpiryDays: 7,
    },
    app: { isDev: false, nodeEnv: "test", url: "http://localhost:3000" },
    smtp: {},
    supabase: {},
    embedding: {},
  },
}));

import {
  validateUniversityEmail,
  normalizeEmail,
} from "@/lib/auth/email-validator";

describe("validateUniversityEmail", () => {
  it("accepts a valid university email", () => {
    const result = validateUniversityEmail("student@university.edu");
    expect(result.valid).toBe(true);
  });

  it("accepts a valid second allowed domain", () => {
    const result = validateUniversityEmail("student@college.ac.in");
    expect(result.valid).toBe(true);
  });

  it("rejects a non-university email", () => {
    const result = validateUniversityEmail("user@gmail.com");
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("university");
  });

  it("rejects an invalid email format", () => {
    const result = validateUniversityEmail("notanemail");
    expect(result.valid).toBe(false);
  });

  it("rejects an empty string", () => {
    const result = validateUniversityEmail("");
    expect(result.valid).toBe(false);
  });

  it("is case-insensitive for domain", () => {
    const result = validateUniversityEmail("Student@UNIVERSITY.EDU");
    expect(result.valid).toBe(true);
  });
});

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  Student@University.EDU  ")).toBe(
      "student@university.edu"
    );
  });
});