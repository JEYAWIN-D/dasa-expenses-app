# ==============================================================================
# Multi-Stage Production Dockerfile for DASA EXPENCES SaaS Platform
# Optimized for Render, Railway, Fly.io, Google Cloud Run, and Docker Swarm/K8s
# ==============================================================================

# Stage 1: Build the Vite Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci || npm install

COPY frontend ./
RUN npm run build

# Stage 2: Build and Run Backend
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install openssl for Prisma on Alpine
RUN apk add --no-cache openssl

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && (npm ci --production=false || npm install)

# Copy Prisma schema and generate client
COPY backend/prisma ./backend/prisma
RUN cd backend && npx prisma generate

# Copy backend source code
COPY backend ./backend

# Copy compiled frontend from Stage 1 into the location backend serves
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose standard container port
EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/api/health || exit 1

# Start server
CMD ["node", "backend/src/app/server.js"]

