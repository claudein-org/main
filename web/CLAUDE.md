# This is NOT the Next.js you know

This is Next.js 16.2.9. It has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Commands

Use Bun: `bun run dev` (dev), `bun run build`, `bun run start`. `bun run dev-https` runs the dev server over HTTPS (needed for OAuth callback testing).

## Environment

`CLIENT_ID` and `CLIENT_SECRET` (LinkedIn OAuth) are validated at startup by `lib/env.ts` via zod. Import `env` from there rather than reading `process.env` directly.

## Routes

- `app/auth/linkedin/route.ts` — LinkedIn OAuth callback
- `app/api/token/route.ts` — token download endpoint
