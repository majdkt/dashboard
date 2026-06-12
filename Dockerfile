# dashboard/Dockerfile
# Stage 1 – build
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
ARG PUBLIC_API_URL=http://api:3001
ENV PUBLIC_API_URL=$PUBLIC_API_URL

RUN npm run build

# Stage 2 – serve with a tiny static file server
FROM node:22-alpine

WORKDIR /app
RUN npm install -g serve@14

COPY --from=builder /app/dist ./dist

EXPOSE 4321
CMD ["serve", "dist", "-p", "4321", "--no-clipboard"]
