# syntax=docker/dockerfile:1

# ---------- 1) Build: Astro-Seite statisch bauen ----------
FROM node:22-alpine AS build
WORKDIR /app

# Abhängigkeiten zuerst (besseres Layer-Caching)
COPY package.json package-lock.json ./
RUN npm ci

# Quellcode + Inhalte, dann statisch bauen → /app/dist
COPY . .
RUN npm run build

# ---------- 2) Runtime: schlankes Nginx, das dist/ ausliefert ----------
FROM nginx:1.27-alpine AS runtime

# Eigene Server-Konfiguration (Caching, saubere URLs, 404)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nur das fertige Build-Ergebnis ins Image
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Einfacher Healthcheck (busybox wget ist im Alpine-Image vorhanden)
HEALTHCHECK --interval=30s --timeout=4s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
