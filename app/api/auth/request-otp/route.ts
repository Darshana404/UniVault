import { NextRequest } from "next/server";
import { z } from "zod";
import { successResponse, errorResponse, safeErrorResponse } from "@/lib/api/response";
import { validateUniversityEmail } from "@/lib/auth/email-validator";
import { requestOTP } from "@/lib/auth/auth-service";
import { otpRequestLimiter } from "@/lib/middleware/rate-limit";

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

const RequestOTPSchema = z.object({
  email: z.string().min(1, "Email is required").max(254).email("Invalid email format"),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = getIp(request);
    const rateLimit = otpRequestLimiter(ip);

    if (!rateLimit.allowed) {
      return errorResponse(
        "Too many requests. Please try again later.",
        429
      );
    }

    // Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const parsed = RequestOTPSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Invalid request.",
        400
      );
    }

    const { email } = parsed.data;

    // Validate university domain
    const emailValidation = validateUniversityEmail(email);
    if (!emailValidation.valid) {
      return errorResponse(emailValidation.reason ?? "Invalid email.", 400);
    }

    // Request OTP
    const result = await requestOTP(email);

    if (!result.success) {
      return errorResponse(result.message, 429);
    }

    return successResponse({ message: result.message }, result.message);
  } catch (err) {
    return safeErrorResponse(err, "Failed to send verification code.");
  }
}
