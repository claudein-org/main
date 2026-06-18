# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`claudein` is a multi-package monorepo for posting to LinkedIn from the command line:

- **web/** — Next.js app handling LinkedIn OAuth and issuing access tokens. Deployed to claudein.org on DigitalOcean. See `web/CLAUDE.md` for Next.js-specific rules.
- **cli/** — CLI tool (`claudein`) that opens the browser for auth and downloads the access token locally. Distributed via npm.

Auth flow: CLI opens the browser → web handles LinkedIn OAuth → user downloads a token (JSON) from web.

## Package manager

Use **Bun** for install and run in every package (root, web, cli) — even though only `web/` has a `bun.lock`.

## Commands

- web: `cd web && bun run dev` (dev server), `bun run build`, `bun run start`, `bun run lint`
- cli: `cd cli && bun run dev` (run via tsx), `bun run build` (tsc → `dist/`), `bun run lint`

Lint each package with `bun run lint` (ESLint flat config). There is no test setup yet.

## Deploy

Pushing to `main` auto-deploys `web` to production (claudein.org) via DigitalOcean App Platform (`web/app.yml`). Be careful pushing to `main` — there is no staging.

## Environment

`web` requires `CLIENT_ID` and `CLIENT_SECRET` (LinkedIn OAuth app), validated by `web/lib/env.ts` via zod. Local values live in `web/.env` (gitignored).
