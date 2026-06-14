# syntax=docker/dockerfile:1

# ── Build-Stufe ────────────────────────────────────────────────
FROM node:22-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

# Beim Build wird die DB NICHT benötigt (alle Seiten sind dynamisch).
ENV NODE_ENV=production
ENV PAYLOAD_SECRET=build-time-placeholder
RUN npm run build

# ── Laufzeit-Stufe ─────────────────────────────────────────────
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates wget \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/src ./src
COPY --from=builder /app/seed-assets ./seed-assets

# Verzeichnisse für persistente Daten (werden per Volume gemountet)
RUN mkdir -p /app/data /app/media

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3001/admin || exit 1

# Beim Start zuerst Datenbank-Migrationen ausführen, dann Server starten.
CMD ["npm", "run", "start:prod"]
