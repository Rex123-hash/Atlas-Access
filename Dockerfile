# --- Build stage ---
FROM node:22-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Runtime stage: minimal standalone server for Cloud Run ---
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# Cloud Run provides $PORT; Next respects it.
ENV PORT=8080

# Next.js "standalone" output bundles only what the server needs.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8080
CMD ["node", "server.js"]
