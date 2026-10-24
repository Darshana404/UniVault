// In-memory rate limiter
// Suitable for single-instance development and small deployments
// Replace with Redis-backed limiter (e.g. Upstash) for multi-instance production

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes to prevent memory leaks
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

export interface RateLimitOptions {
  // Maximum number of requests allowed in the window
  limit: number;
  // Window duration in seconds
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const key = identifier;

  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    // First request in this window
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: options.limit - 1,
      resetAt,
    };
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: options.limit - existing.count,
    resetAt: existing.resetAt,
  };
}

// Pre-configured limiters for common use cases
export const otpRequestLimiter = (ip: string) =>
  checkRateLimit(`otp-request:${ip}`, { limit: 5, windowSeconds: 300 });

export const otpVerifyLimiter = (ip: string) =>
  checkRateLimit(`otp-verify:${ip}`, { limit: 10, windowSeconds: 300 });

export const uploadLimiter = (userId: string) =>
  checkRateLimit(`upload:${userId}`, { limit: 10, windowSeconds: 3600 });

export const generalApiLimiter = (ip: string) =>
  checkRateLimit(`api:${ip}`, { limit: 100, windowSeconds: 60 });