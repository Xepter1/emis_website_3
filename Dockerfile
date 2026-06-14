# syntax=docker/dockerfile:1
#
# Emis Website – jetzt als Astro-SSR-Server (Node), damit die Inhalte LIVE
# aus dem CMS (Payload) kommen. Früher war das ein statisches Nginx-Image;
# SSR braucht einen laufenden Node-Prozess.

# ---------- 1) Build ----------
FROM node:22-bookworm-slim AS build
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Produktions-Abhängigkeiten separat (schlankeres Runtime-Image)
RUN npm prune --omit=dev

# ---------- 2) Runtime: Node serviert den SSR-Build ----------
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# @astrojs/node (standalone) liest HOST/PORT aus der Umgebung
ENV HOST=0.0.0.0
ENV PORT=4321

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates wget \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 4321

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:4321/ || exit 1

CMD ["node", "./dist/server/entry.mjs"]
