# =====================================
# Stage 1 - Build
# =====================================
FROM node:20-slim AS builder

WORKDIR /app

# Install required packages
RUN apt-get update && \
    apt-get install -y openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY server/package*.json ./

# Install all dependencies
RUN npm ci

# Copy server source
COPY server/ ./

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build


# =====================================
# Stage 2 - Production
# =====================================
FROM node:20-slim

WORKDIR /app

# Install required runtime packages
RUN apt-get update && \
    apt-get install -y openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=5000

# Copy package files
COPY server/package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy compiled application
COPY --from=builder /app/dist ./dist

# Copy Prisma schema
COPY --from=builder /app/prisma ./prisma

# Copy generated Prisma Client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Generate Prisma Client again in production
RUN npx prisma generate

# Expose Render port
EXPOSE 5000

# Start application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]