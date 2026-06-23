# ClaudeIn

Post to LinkedIn from the command line — or let Claude Code do it for you.

[![GitHub Stars](https://img.shields.io/github/stars/claudein-org/main?style=social)](https://github.com/claudein-org/main)

## What it does

ClaudeIn lets you manage LinkedIn posts in a local YAML file and publish them through a browser-based preview UI at [claudein.org](https://claudein.org).

The CLI (`cin`) starts a local WebSocket server, opens the web app in your browser, and streams your posts to it in real time. You (or Claude Code) edit the YAML file; the browser preview updates live; you hit Publish when ready.

## How it works

```
posts.yml  ←→  cin (local WS server)  ←→  claudein.org  →  LinkedIn API
```

1. You write posts in a local YAML file (see [File format](#file-format))
2. `cin start posts.yml` opens a browser preview at claudein.org
3. Edit, delete, or publish each post from the UI
4. Published post IDs are stored in the web app; the YAML file is the source of truth for content

## Getting started

### 1. Install the CLI

```sh
npm install -g @claudein/cli
```

### 2. Sign in

Visit [claudein.org](https://claudein.org), sign in with Google, and connect your LinkedIn account.

### 3. Create a posts file

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/claudein-org/main/refs/heads/main/claudein.schema.yml

posts:
  - type: text
    post_id: 0
    created: 2024-06-05T12:00:00Z
    text: "Hello from ClaudeIn!"
```

### 4. Start the preview

```sh
cin start posts.yml
```

This opens the web UI in your browser. Edit posts there or directly in the YAML file — the preview updates automatically on every save.

## File format

Posts are stored in a YAML file validated against [`claudein.schema.yml`](./claudein.schema.yml).

### Text post

```yaml
- type: text
  post_id: 0          # unique ID; 0 = unpublished
  created: 2024-06-05T12:00:00Z
  text: "Your post text"
```

### Image post

```yaml
- type: image
  post_id: 0
  created: 2024-06-05T12:00:00Z
  text: "Caption for your image"
  image:
    src: "./photo.png"        # path relative to the YAML file
    title: "Optional title"
    description: "Optional alt text"
```

## Using with Claude Code

ClaudeIn is designed to work seamlessly with Claude Code. You can ask Claude to draft LinkedIn posts and write them directly to your posts file:

```
Write a LinkedIn post about my new open-source project and add it to posts.yml
```

Then run `cin start posts.yml` to preview and publish.

## Monorepo structure

| Package | Description |
|---|---|
| `cli/` | `@claudein/cli` — the `cin` CLI tool, published to npm |
| `web/` | Next.js web app at claudein.org — Google/LinkedIn auth and post preview UI |
| `common/` | Shared TypeScript types and Zod schemas used by both cli and web |

## Development

**Prerequisites:** [Bun](https://bun.sh), Node 20+, PostgreSQL

### Web app

```sh
cd web
bun install
bun run dev          # HTTP dev server
bun run dev-https    # HTTPS (required for OAuth callback testing)
```

Copy `web/.env.example` to `web/.env` and fill in the required values:

| Variable | Purpose |
|---|---|
| `CLIENT_ID` / `CLIENT_SECRET` | LinkedIn OAuth app credentials |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`, `DB_NAME` | PostgreSQL connection |
| `COOKIE_SECRET` | HMAC secret for signed cookies |

### CLI

```sh
cd cli
bun install
bun run dev          # run via tsx (no build needed)
bun run build        # compile to dist/
```

To point the CLI at your local web app:

```sh
CIN_ENV=dev cin start posts.yml
```

### Database

Schema lives in `web/init.sql`. Apply it to a local Postgres instance to get started.

## Contributing

1. Fork the repo and create a feature branch
2. Make your changes — `web/` for the UI, `cli/` for the CLI, `common/` for shared types
3. Open a pull request against `main`

There are no automated tests yet. Manual testing via `cin start` and the browser UI is the current approach.

## License

MIT
