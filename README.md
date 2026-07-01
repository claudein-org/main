# ClaudeIn

Post to LinkedIn, Facebook, Instagram, YouTube, and DEV.to from the command line — or let Claude Code do it for you.

[![GitHub Stars](https://img.shields.io/github/stars/claudein-org/main?style=social)](https://github.com/claudein-org/main)

## What it does

ClaudeIn manages a local `claudein/` project — a YAML file plus a folder of media and articles — and publishes it through a live browser dashboard at [claudein.org](https://claudein.org).

The CLI (`cin`) starts a local WebSocket server, opens the dashboard in your browser, and streams your project to it in real time. You (or Claude Code) edit `claudein.yml`; the dashboard updates live; you hit Publish when a post is ready.

## How it works

```
claudein/ (claudein.yml + media/ + articles/)  ←→  cin (local WS server)  ←→  claudein.org  →  LinkedIn / Facebook / Instagram / YouTube / DEV.to
```

1. `cin init` scaffolds a `claudein/` project and installs Claude Code commands for it
2. Ask Claude Code to draft content — scan the project (`/claudein-init`), write a full article from a synopsis (`/claudein-write-article`), or refresh it later (`/claudein-update`) — or edit `claudein/claudein.yml` by hand
3. `cin start` opens the dashboard, showing what's due Today / Next 7 Days / Next 30 Days, plus Analytics
4. Publish each post from the dashboard; `claudein.yml` stays the source of truth for content

## Getting started

### 1. Install the CLI

```sh
npm install -g @claudein.org/cli
```

### 2. Sign in and connect platforms

Visit [claudein.org](https://claudein.org), sign in with Google, and connect the platforms you want to post to (LinkedIn, Facebook, Instagram, YouTube, DEV.to). You can connect as many as you like — each asset in `claudein.yml` targets one or more of them.

### 3. Scaffold a project

```sh
cin init
```

This creates a `claudein/` project (`claudein.yml`, `media/`, `articles/`) in the current directory and installs three Claude Code commands into `~/.claude/commands/`:

| Command | What it does |
|---|---|
| `/claudein-init` | Scans the current project and generates a starter `claudein.yml` with seed posts, media, and articles |
| `/claudein-update` | Refreshes an existing `claudein/` project with project changes and new posts |
| `/claudein-write-article` | Expands a synopsis (`$ARGUMENTS`) into a full article post, with public media and links back to the project |

Reload Claude Code after `cin init` for the new commands to show up.

### 4. Start the live preview

```sh
cin start
```

This opens the dashboard in your browser. Edit `claudein/claudein.yml` directly, or ask Claude Code to — the dashboard updates automatically on every save.

## File format

Assets live in `claudein/claudein.yml`, validated against [`claudein.schema.yml`](./claudein.schema.yml). Every asset has a `created` date, a `schedule` date (when it should go out — today for an immediate post, later to queue it up), and a `target` list of platforms.

### Post

```yaml
- type: post
  created: 2024-06-05
  schedule: 2024-06-05
  target: [LinkedIn, Facebook]
  text: "Hello from ClaudeIn!"
```

### Image

```yaml
- type: image
  created: 2024-06-05
  schedule: 2024-06-05
  target: [LinkedIn, Facebook]
  title: "Optional title"
  description: "Optional caption"
  src: photo.png          # resolved from claudein/media/
```

### Video

```yaml
- type: video
  created: 2024-06-05
  schedule: 2024-06-10
  target: [Instagram, YouTube]
  title: "Optional title"
  description: "Optional description"
  src: clip.mp4           # resolved from claudein/media/
```

### Article

```yaml
- type: article
  created: 2024-06-05
  schedule: 2024-06-05
  target: ['DEV.to']
  src: my-article.md      # resolved from claudein/articles/
```

## Platform support

Not every platform accepts every asset type:

| Platform | Supported asset types |
|---|---|
| LinkedIn | post, image, video |
| Facebook | post, image, video |
| Instagram | video |
| YouTube | video |
| DEV.to | article |

## Using with Claude Code

ClaudeIn is designed to work seamlessly with Claude Code:

```
/claudein-init
```

scans the project and drafts an initial round of posts, or:

```
/claudein-write-article a deep dive on how we cut our API's p99 latency in half
```

expands a synopsis into a full article, complete with publicly-hosted media and links back to the project. Then run `cin start` to preview and publish.

## Monorepo structure

| Package | Description |
|---|---|
| `cli/` | `@claudein.org/cli` — the `cin` CLI tool, published to npm |
| `web/` | Next.js app at claudein.org — Google/platform OAuth, the live dashboard, publishing, and analytics |
| `common/` | Shared Zod schemas and types used by both `cli` and `web` |
| `video/` | Remotion project used to render marketing/demo videos |

## Development

**Prerequisites:** [Bun](https://bun.sh), Node 20+, PostgreSQL 18

### Web app

```sh
cd web
bun install
bun run dev          # HTTP dev server
bun run dev-https    # HTTPS (required for OAuth callback testing)
```

Create `web/.env` with the required values:

| Variable | Purpose |
|---|---|
| `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth app secret |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret (used for both Google sign-in and YouTube) |
| `META_CLIENT_SECRET` | Facebook OAuth app secret |
| `INSTAGRAM_CLIENT_SECRET` | Instagram OAuth app secret |
| `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`, `DB_NAME` | PostgreSQL connection |
| `COOKIE_SECRET` | HMAC secret for signed cookies |
| `SPACE_SECRET_KEY` | DigitalOcean Spaces (S3-compatible) secret, used to host media |

OAuth client/app IDs are public and already checked in (`web/lib/settings.ts`) — only the secrets above are required locally.

### CLI

```sh
cd cli
bun install
bun run dev          # run via tsx (no build needed)
bun run build        # compile to dist/
```

To point the CLI at your local web app:

```sh
CIN_ENV=dev cin start
```

### Database

Schema lives in `web/init.sql`; Kysely types in `web/lib/db.ts` are kept in sync with it by hand. Apply `init.sql` to a local Postgres instance to get started.

## Contributing

1. Fork the repo and create a feature branch
2. Make your changes — `web/` for the dashboard and auth, `cli/` for the CLI, `common/` for shared types, `video/` for demo/marketing videos
3. Merge to `main` when ready — there's no PR process for this repo

There are no automated tests yet. Manual testing via `cin start` and the browser dashboard is the current approach.

## License

MIT
