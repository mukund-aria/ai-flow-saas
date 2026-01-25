# ============================================================================
# AI Flow Copilot - Multi-stage Dockerfile
# ============================================================================
# Builds both frontend and backend into a single production image.

# ----------------------------------------------------------------------------
# Stage 1: Build Frontend
# ----------------------------------------------------------------------------
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy source and build (skip tsc, Vite handles compilation)
COPY frontend/ ./
RUN npx vite build

# ----------------------------------------------------------------------------
# Stage 2: Build Backend
# ----------------------------------------------------------------------------
FROM node:20-alpine AS backend-build

WORKDIR /app/backend

# Copy package files and install dependencies
COPY backend/package*.json ./
RUN npm ci

# Copy source and build
COPY backend/ ./
RUN npm run build

# ----------------------------------------------------------------------------
# Stage 3: Production Image
# ----------------------------------------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy built backend
COPY --from=backend-build /app/backend/dist ./dist

# Copy frontend build to public folder (served by Express)
COPY --from=frontend-build /app/frontend/dist ./public

# Copy config files (needed at runtime)
COPY backend/config ./config

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port for Railway
EXPOSE 8080

# Start the server
CMD ["node", "dist/index.js"]
