import { NextRequest } from "next/server";
import { z } from "zod";
import { successResponse, errorResponse, safeErrorResponse } from "@/lib/api/response";
import { validateUniversityEmail, normalizeEmail } from "@/lib/auth/email-validator";
import { verifyOTP } from "@/lib/auth/auth-service";
import { createSession } from "@/lib/auth/session";
import { otpVerifyLimiter } from "@/lib/middleware/rate-limit";

const GENERIC_INVALID = "Invalid or expired verification code.";

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

const VerifyOTPSchema = z.object({
  email: z.string().min(1).max(254).email(),
  otp: z.string().regex(/^\d{6}$/, "Verification code must be 6 digits"),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getIp(request);
    if (!otpVerifyLimiter(ip).allowed) {
      return errorResponse("Too many attempts. Please try again later.", 429);
    }

    const body = await request.json().catch(() => ({}));
    const parsed = VerifyOTPSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(GENERIC_INVALID, 400);
    }

    const { email, otp } = parsed.data;

    if (!validateUniversityEmail(email).valid) {
      return errorResponse(GENERIC_INVALID, 400);
    }

    const result = await verifyOTP(email, otp);

    if (!result.success || !result.userId) {
      // Attempts exhausted -> 429 so the UI can lock; everything else is generic
      if (/too many/i.test(result.message)) {
        return errorResponse(
          "Too many attempts. Request a new code to continue.",
          429
        );
      }
      return errorResponse(GENERIC_INVALID, 400);
    }

    await createSession(result.userId);

    return successResponse(
      { user: { id: result.userId, email: normalizeEmail(email) } },
      "Login successful."
    );
  } catch (err) {
    return safeErrorResponse(err, "Verification failed.");
  }
}