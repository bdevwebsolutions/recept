# Stage 1: Build frontend
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source and config files needed for build
COPY tsconfig.json vite.config.ts tailwind.config.js postcss.config.js ./
COPY src ./src

# Build the frontend
RUN bun run build

# Stage 2: Production runtime
FROM oven/bun:1 AS runner
WORKDIR /app

# Copy only what's needed for runtime
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/server ./src/server
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Create directories for persistent data
RUN mkdir -p /app/data /app/uploads

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "src/server/index.ts"]
