# BUILDER
FROM oven/bun:latest AS builder

WORKDIR /app

# DEBUG
RUN apt-get update && apt-get install -y tree && rm -rf /var/lib/apt/lists/*

RUN mkdir web cli common

COPY package.json bun.lock ./

COPY common/package.json ./common/
COPY web/package.json ./web/
COPY cli/package.json ./cli/

RUN bun install --frozen-lockfile 

COPY . . 

RUN cd web && bun run build