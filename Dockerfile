# BUILDER
FROM oven/bun:latest AS builder

WORKDIR /build

# DEBUG
RUN apt-get update && apt-get install -y tree && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./

COPY common/package.json ./common/
COPY web/package.json ./web/
COPY cli/package.json ./cli/

RUN bun install --frozen-lockfile 

COPY . . 

RUN cd web && bun run build

# RUNTIME
FROM oven/bun

WORKDIR /app

COPY --from=builder /build/web/.next/standalone ./
COPY --from=builder /build/web/.next/static ./web/.next/static
COPY --from=builder /build/web/public ./web/public

EXPOSE 3000

CMD ["bun", "web/server.js"]
