FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --no-audit --no-fund

COPY . .

# PUBLIC_API_URL must be supplied as a build arg (via docker-compose + root .env).
# No default – build fails clearly if it is missing.
ARG PUBLIC_API_URL
ENV PUBLIC_API_URL=$PUBLIC_API_URL

RUN npm run build

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim

WORKDIR /app

RUN npm install -g serve@14 --no-audit --no-fund

COPY --from=builder /app/dist ./dist

EXPOSE 4321

CMD ["serve", "dist", "-l", "4321", "--no-clipboard"]
