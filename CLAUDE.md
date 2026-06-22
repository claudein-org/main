# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`claudein` is a multi-package monorepo for posting to LinkedIn from the command line:

- **web/** — Next.js 16.2.9 (App Router) handling Google login, LinkedIn OAuth, and token delivery. Deployed to claudein.org on DigitalOcean. See `web/CLAUDE.md` for Next.js-specific rules.
- **cli/** — CLI tool (`claudein`) that opens the browser for auth and downloads the access token locally. Distributed via npm.

Auth flow: user visits web → logs in via Google → connects LinkedIn → downloads `claudein_token.json` → CLI reads it to post.

## Package manager

Use **Bun** for install and run in every package (root, web, cli) — even though only `web/` has a `bun.lock`.

## Commands

**web** (`cd web && ...`):
- `bun run dev` — dev server (HTTP)
- `bun run dev-https` — dev server with HTTPS via Turbopack; **required for local OAuth testing** (redirect URIs must match `https://`)
- `bun run build`, `bun run start`, `bun run lint`

**cli** (`cd cli && ...`):
- `bun run dev` — run via tsx
- `bun run build` — tsc → `dist/`
- `bun run lint`

No test setup exists.

## Database

PostgreSQL 18 on DigitalOcean managed cluster. Accessed via `pg` + Kysely (no ORM).

- **Schema source of truth**: `web/init.sql`
- **Kysely types**: `web/lib/db.ts` — keep these in sync with `init.sql`
- `pg` and `kysely` must remain in `serverExternalPackages` in `next.config.ts` or the Next.js build will break

## Deploy

Pushing to `main` auto-deploys `web` to production (claudein.org) via DigitalOcean App Platform (`web/app.yml`). There is no staging — be careful.

## Git workflow

Feature branches. Merge locally to `main` without opening a PR.

## Environment

All env access goes through `web/lib/env.ts` (zod-validated) — never use `process.env` directly in app code. Local values live in `web/.env` (gitignored).

Required vars:

| Variable | Purpose |
|---|---|
| `CLIENT_ID` | LinkedIn OAuth client ID |
| `CLIENT_SECRET` | LinkedIn OAuth client secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`, `DB_NAME` | PostgreSQL connection |
| `COOKIE_SECRET` | HMAC secret for signed cookies |

## Code conventions

- Utility modules use TypeScript `namespace` pattern (see `lib/auth.ts`, `lib/cookie.ts`)
- Path alias `@/*` maps to `web/` root (e.g. `@/lib/env`)
- **Next.js 16.2.9 has breaking changes vs. training data** — always read `node_modules/next/dist/docs/` before writing Next.js-specific code; heed deprecation notices

## In-progress / known gaps

- **LinkedIn callback** (`app/auth/linkedin/route.ts`) is not yet complete — it exchanges the code but doesn't write the token to the DB
- **CLI** opens `https://claudein.org/auth/login`, but that route doesn't exist yet in the web app
