---
name: claudein
description: Create social media posts (LinkedIn, Facebook, Instagram, YouTube) and manage brand metadata using the claudein CLI. Use when the user wants to write, draft, or schedule posts, or when working with a claudein/ project (claudein.yml + media/ + articles/).
allowed-tools: Edit, Write, Bash(cin *), Bash(pgrep *), Bash(curl *)
---

# claudein — social media posts from the CLI

## Live schema

Read the current schema before writing any posts file — do not rely on memory:

!`curl -s https://raw.githubusercontent.com/claudein-org/main/refs/heads/main/claudein.schema.yml`

## Project layout

A claudein project is a **directory** (default `claudein/`, or pass another with `cin start my-brand`):

```
claudein/
  claudein.yml      # brand reference + posts
  brand.md          # brand description in Markdown — shown on the Brand view
  media/            # images and video referenced by posts
    logo.svg
    shot.png
    clip.mp4
  articles/         # Markdown articles referenced by article posts
    welcome.md
```

`claudein.yml` holds the brand reference and posts list. It references media assets by **bare filename**: the CLI resolves images/video against `media/` and article markdown against `articles/`. So a media `src: shot.png` means `claudein/media/shot.png`, and an article `src: welcome.md` means `claudein/articles/welcome.md`. Put new images/videos in `media/` and new articles in `articles/`, then reference them by name.

`claudein.yml` has two top-level keys: `brand` (points to `brand.md`) and `posts` (shown on the **Posts** and **Articles** views).

`cin start` watches `claudein.yml`, `brand.md`, and every asset referenced by posts, updating the browser dashboard live. Always edit files in place, never delete and recreate them. If the directory doesn't exist, `cin start` scaffolds it with a sample post and example article.

### Brand metadata

The brand is written as a plain Markdown file named `brand.md` in the project root. The dashboard's **Brand** view renders it directly. Write whatever describes the brand — heading, description, bullet points, etc.:

```markdown
# My Brand

A short description of the brand — what it is and who it is for.

## What makes it special

- A selling point
- Another selling point
```

`claudein.yml` simply points to it:

```yaml
brand:
  src: brand.md
```

## Post types

| Type | Required fields | Notes |
|------|-----------------|-------|
| `text` | `text` | Plain text — supported by LinkedIn, Facebook |
| `image` | `src` | Image file in `media/` (`.jpg`, `.jpeg`, `.png`) — supported by LinkedIn, Facebook |
| `video` | `src` | Video file in `media/` (`.mp4`, `.mkv`, `.avi`) — supported by LinkedIn, Facebook, Instagram, YouTube |
| `article` | `src` | Markdown file in `articles/` (`.md`) — supported by DEV.to |

## Platforms and supported post types

| Platform | Supported types |
|----------|----------------|
| `LinkedIn` | `text`, `image`, `video` |
| `Facebook` | `text`, `image`, `video` |
| `Instagram` | `video` |
| `YouTube` | `video` |
| `DEV.to` | `article` |

Each post must include a `platforms` field listing the target platforms. The web app only shows publish buttons for platforms that support the post type.

```yaml
posts:
  - type: text
    created: 2026-01-01
    platforms: [LinkedIn]
    text: "Hello LinkedIn!"

  - type: image
    created: 2026-01-02
    platforms: [LinkedIn, Facebook]
    src: photo.jpg            # media/photo.jpg

  - type: video
    created: 2026-01-03
    platforms: [Instagram, YouTube]
    src: clip.mp4             # media/clip.mp4

  - type: article
    created: 2026-01-04
    platforms: ['DEV.to']
    src: my-article.md        # articles/my-article.md
```

## Workflow

1. Edit `claudein/claudein.yml` (brand metadata and/or posts); drop any new media in `claudein/media/` and articles in `claudein/articles/`
2. Check if `cin start` is already running: `pgrep -fa "cin start"` — if it is, skip step 3
3. If not running: `cin start [dir]` — scaffolds `claudein/` if missing and opens the live browser dashboard
4. Click the platform button in the browser to publish

## Media guidelines

### LinkedIn

**Images:** PNG or JPG, max 20 MB, aspect ratio 1:2.4 to 2.4:1
**Videos:** MP4 H.264, max 5 GB, 3–600 seconds, aspect ratio 1:1 to 4:5 recommended

### Instagram

**Images:** PNG or JPG, max 8 MB, aspect ratio 4:5 to 1.91:1
**Videos:** MP4, max 650 MB, 3–60 seconds

### YouTube

**Videos:** MP4, any duration

### Remotion

Set the composition to exactly the target resolution:

```ts
<Composition width={1080} height={1080} ... />  // or height={1350} for 4:5
```

Any SVG used inside a composition must have its `width`, `height`, and `viewBox` match the composition dimensions — do not rely on SVG auto-scaling:

```tsx
<svg width={1080} height={1080} viewBox="0 0 1080 1080">...</svg>
```

Render with high quality settings:

```bash
npx remotion render --codec h264 --crf 18 --pixel-format yuv420p
```

Low CRF (≤18) means high quality. Do not use default CRF — it produces noticeably lower quality video.
