FROM node:22.12-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --no-audit --no-fund

COPY . .

ARG PUBLIC_API_URL=http://localhost:3001
ENV PUBLIC_API_URL=$PUBLIC_API_URL

RUN npm run build

FROM node:22.12-bookworm-slim

WORKDIR /app

RUN npm install -g serve@14 --no-audit --no-fund

COPY --from=builder /app/dist ./dist

EXPOSE 4321

CMD ["serve", "dist", "-l", "4321", "--no-clipboard"]
