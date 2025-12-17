# Stage 1: build frontend
FROM oven/bun:1.1 AS builder
WORKDIR /app

COPY bun.lock* bun.lock package.json tsconfig.json vite.config.ts tailwind.config.js postcss.config.js ./
COPY src ./src

RUN bun install --frozen-lockfile
RUN bun run build

# Stage 2: runtime
FROM oven/bun:1.1 AS runner
WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/vite.config.ts ./vite.config.ts
COPY --from=builder /app/tailwind.config.js ./tailwind.config.js
COPY --from=builder /app/postcss.config.js ./postcss.config.js

RUN mkdir -p /app/data /app/uploads

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "src/server/index.ts"]

