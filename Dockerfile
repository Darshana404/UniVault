# -----------------------------------------------------------------------------
# UniVault - Production Multi-Stage Dockerfile
# Optimized for security, lean image size, and fast build caching
# -----------------------------------------------------------------------------

# Stage 1: Base image
FROM node:22-bookworm-slim AS base
WORKDIR /app

# Install curl and ca-certificates for health checks and secure external requests
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Stage 2: Install dependencies
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables for Next.js static asset compilation
ARG NEXT_PUBLIC_SUPABASE_URL=""
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=""
ARG NEXT_PUBLIC_APP_URL="http://localhost:3000"

ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Stage 4: Production Runner
FROM node:22-bookworm-slim AS runner
WORKDIR /app

# Security: Non-root user setup
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nextjs && \
    apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Copy static assets and standalone server output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Ensure full node_modules are present for native/external packages (@huggingface/transformers, onnxruntime-node, onnxruntime-common)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy local embedding models required for runtime verification and inference
COPY --from=builder --chown=nextjs:nodejs /app/models ./models

USER nextjs

EXPOSE 3000

# Health check endpoint for zero-downtime rolling deploys
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]

