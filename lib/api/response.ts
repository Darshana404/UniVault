import { NextResponse } from "next/server";
import type { ApiSuccess, ApiError } from "@/types/api.ts";

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    {
      success: true as const,
      data,
      ...(message ? { message } : {}),
    },
    { status }
  );
}

export function errorResponse(
  error: string,
  status: number = 400,
  code?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false as const,
      error,
      ...(code ? { code } : {}),
    },
    { status }
  );
}

// Safe error: never exposes stack traces or internal messages
export function safeErrorResponse(
  err: unknown,
  fallback: string = "An unexpected error occurred",
  status: number = 500
): NextResponse<ApiError> {
  // Log the real error server-side only
  console.error("[UniVault API Error]", err);

  return NextResponse.json(
    {
      success: false as const,
      error: fallback,
      code: "INTERNAL_ERROR",
    },
    { status }
  );
}