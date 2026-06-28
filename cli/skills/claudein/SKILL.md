---
name: claudein
description: Create social media posts (LinkedIn, Facebook, Instagram, YouTube) and manage brand metadata using the claudein CLI. Use when the user wants to write, draft, or schedule posts, or when working with a brand.yml file.
allowed-tools: Edit, Write, Bash(cin *), Bash(pgrep *), Bash(curl *)
---

# claudein — social media posts from the CLI

## Live schema

Read the current schema before writing any posts file — do not rely on memory:

!`curl -s https://raw.githubusercontent.com/claudein-org/main/refs/heads/main/claudein.schema.yml`

## Brand file

The default file is `brand.yml` but users can use any `.yml` file (pass it to `cin start my-brand.yml`). Write to whichever file the user specifies or is already working with.

A brand file has two top-level keys: `brand` (metadata shown on the dashboard's **Brand** view) and `posts` (shown on the **Posts** view).

`cin start` watches the file — and every asset it references (logo, brand images, post media) — and updates the browser dashboard live. Always edit the file in place, never delete and recreate it.

### Brand metadata

```yaml
brand:
  title: My Brand
  description: A short description of the brand — what it is and who it is for.
  logo: logo.svg            # .svg, .png or .jpg
  features:
    - A short selling point
    - Another selling point
  images:                   # .png/.jpg gallery shown on the Brand view
    - shot-1.png
    - shot-2.png
```

## Platforms

Each post must include a `platforms` field listing the target platforms. The client decides which platforms a post is for — the web app uses this list to show the correct publish buttons.

Available platforms: `LinkedIn`, `Facebook`, `Instagram`, `YouTube`

```yaml
posts:
  - type: text
    created: 2026-01-01
    platforms: [LinkedIn]
    text: "Hello LinkedIn!"

  - type: media
    created: 2026-01-02
    platforms: [Instagram, Facebook]
    media:
      type: image
      src: photo.jpg
```

## Workflow

1. Write or edit the `brand.yml` file (brand metadata and/or posts)
2. Check if `cin start` is already running: `pgrep -fa "cin start"` — if it is, skip step 3
3. If not running: `cin start [file]` — opens the live browser dashboard
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
