# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package configurations
COPY server/package*.json ./
RUN npm ci

# Copy server files
COPY server/ ./

# Generate Prisma Client
RUN npx prisma generate

# Compile TypeScript
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Copy packages and install production dependencies only
COPY server/package*.json ./
RUN npm ci --only=production

# Copy compiled files and schema from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Environment defaults
ENV PORT=5000
ENV NODE_ENV=production
ENV DATABASE_URL="file:./prod.db"

# Expose server port
EXPOSE 5000

# Execute database migrations and start server
CMD npx prisma migrate deploy && node dist/index.js
