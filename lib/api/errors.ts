// Typed error classes for consistent error handling across the API layer

export class UniVaultError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "UniVaultError";
  }
}

export class ValidationError extends UniVaultError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends UniVaultError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "UNAUTHENTICATED");
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends UniVaultError {
  constructor(message: string = "You do not have permission to do this") {
    super(message, 403, "UNAUTHORIZED");
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends UniVaultError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends UniVaultError {
  constructor(message: string = "Too many requests. Please try again later.") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
    this.name = "RateLimitError";
  }
}

export class ConflictError extends UniVaultError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

// Helper: convert any caught error into a safe API response body
export function toSafeError(err: unknown): {
  message: string;
  statusCode: number;
  code: string;
} {
  if (err instanceof UniVaultError) {
    return {
      message: err.message,
      statusCode: err.statusCode,
      code: err.code,
    };
  }

  // Unknown errors never leak details to the client
  return {
    message: "An unexpected error occurred",
    statusCode: 500,
    code: "INTERNAL_ERROR",
  };
}