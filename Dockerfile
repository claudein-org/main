# BUILDER
FROM oven/bun AS builder

WORKDIR /build

COPY web/package.json web/bun.lock ./
RUN bun install --frozen-lockfile

COPY web/ .

RUN bun next build


# RUNTIME
FROM oven/bun

WORKDIR /app

COPY --from=builder /build/.next/standalone ./
COPY --from=builder /build/.next/static ./.next/static
COPY --from=builder /build/public ./public

EXPOSE 3000

CMD ["bun", "server.js"]
