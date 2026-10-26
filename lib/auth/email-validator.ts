import { config } from "@/lib/config";

export interface EmailValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateUniversityEmail(email: string): EmailValidationResult {
  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, reason: "Invalid email format." };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const domain = normalizedEmail.split("@")[1];

  if (!domain) {
    return { valid: false, reason: "Invalid email format." };
  }

  // Check against allowed domains
  const isAllowed = config.auth.allowedDomains.some(
    (allowedDomain) =>
      domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
  );

  if (!isAllowed) {
    return {
      valid: false,
      reason: "Only university email addresses are permitted.",
    };
  }

  return { valid: true };
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}