# -----------------------------------------------------------------------------
# UniVault - Production Multi-Stage Dockerfile
# -----------------------------------------------------------------------------

# Stage 1: Base image
FROM node:22-bookworm-slim AS base
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    libcairo2 \
    libpango-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

# Stage 2: Install dependencies
FROM base AS deps
WORKDIR /app

# Native compilation tools required by canvas if prebuilt binaries
# cannot be downloaded
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHON=/usr/bin/python3

COPY package.json package-lock.json ./
RUN npm ci || npm install --no-audit

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

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
    libcairo2 \
    libpango-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Native and external runtime packages
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Local embedding models
COPY --from=builder --chown=nextjs:nodejs /app/models ./models

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]