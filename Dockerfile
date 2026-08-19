# ─────────────────────────────────────────────
# Stage 1 — Builder (Node 20 + pnpm)
# ─────────────────────────────────────────────
FROM node:22-alpine AS builder

# Installer pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /build

# Copier les fichiers de dépendances en premier (cache layer pnpm)
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances (frozen pour reproductibilité)
RUN pnpm install --frozen-lockfile

# ARG injecté au moment du build — jamais stocké dans l'image finale
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Copier le code source et builder
COPY . .
RUN pnpm run build

# ─────────────────────────────────────────────
# Stage 2 — Runner (Nginx alpine)
# ─────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Supprimer la config nginx par défaut
RUN rm -rf /etc/nginx/conf.d/*

# Config nginx pour SPA React (react-router-dom)
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf

# Copier le build Vite depuis le builder
COPY --from=builder /build/dist /usr/share/nginx/html

# Utilisateur non-root nginx
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1
