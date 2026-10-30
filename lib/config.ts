// Validates all required environment variables at startup
// Import this at the top of any server-side module that needs config

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    // During Next.js build time (static page / route data collection), return
    // a placeholder so compilation succeeds without baking secrets into image layers.
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return `build-placeholder-${key.toLowerCase().replace(/_/g, "-")}`;
    }
    throw new Error(
      `Missing required environment variable: ${key}. Check your .env.local file.`
    );
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  supabase: {
    url: optionalEnv("SUPABASE_URL", "") || requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: optionalEnv("SUPABASE_ANON_KEY", "") || requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    storageBucket: optionalEnv("SUPABASE_STORAGE_BUCKET", "univault-documents"),
  },
  auth: {
    sessionSecret: requireEnv("SESSION_SECRET"),
    allowedDomains: requireEnv("ALLOWED_EMAIL_DOMAINS")
      .split(",")
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean),
    otpExpiryMinutes: parseInt(optionalEnv("OTP_EXPIRY_MINUTES", "10"), 10),
    otpMaxAttempts: parseInt(optionalEnv("OTP_MAX_ATTEMPTS", "5"), 10),
    otpResendCooldownSeconds: parseInt(
      optionalEnv("OTP_RESEND_COOLDOWN_SECONDS", "60"),
      10
    ),
    sessionExpiryDays: 7,
  },
  smtp: {
    host: requireEnv("SMTP_HOST"),
    port: parseInt(optionalEnv("SMTP_PORT", "587"), 10),
    secure: optionalEnv("SMTP_SECURE", "false") === "true",
    user: requireEnv("SMTP_USER"),
    pass: requireEnv("SMTP_PASS"),
    from: requireEnv("SMTP_FROM"),
  },
  embedding: {
    provider: optionalEnv("EMBEDDING_PROVIDER", "openai"),
    apiKey: process.env.EMBEDDING_API_KEY || process.env.OPENAI_API_KEY || "",
    model: optionalEnv("EMBEDDING_MODEL", "text-embedding-3-small"),
    dimensions: parseInt(optionalEnv("EMBEDDING_DIMENSIONS", "1536"), 10),
  },
  app: {
    url: optionalEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
    nodeEnv: optionalEnv("NODE_ENV", "development"),
    isDev: optionalEnv("NODE_ENV", "development") === "development",
  },
} as const;