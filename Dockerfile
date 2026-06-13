FROM node:22.12-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --no-audit --no-fund

COPY . .

# Build-time variables injected by docker-compose via the root .env file.
# No default values here – the build will fail clearly if they are missing,
# preventing a silently broken image with hardcoded localhost URLs.
ARG PUBLIC_API_URL
ARG PUBLIC_PORTAINER_URL
ARG PUBLIC_PLEX_URL
ARG PUBLIC_PIHOLE_URL
ARG PUBLIC_HOMEASSISTANT_URL

# Expose as ENV so Astro's Vite build can read them via import.meta.env.*
ENV PUBLIC_API_URL=$PUBLIC_API_URL
ENV PUBLIC_PORTAINER_URL=$PUBLIC_PORTAINER_URL
ENV PUBLIC_PLEX_URL=$PUBLIC_PLEX_URL
ENV PUBLIC_PIHOLE_URL=$PUBLIC_PIHOLE_URL
ENV PUBLIC_HOMEASSISTANT_URL=$PUBLIC_HOMEASSISTANT_URL

RUN npm run build

FROM node:22.12-bookworm-slim

WORKDIR /app

RUN npm install -g serve@14 --no-audit --no-fund

COPY --from=builder /app/dist ./dist

EXPOSE 4321

CMD ["serve", "dist", "-l", "4321", "--no-clipboard"]
