---
name: claudein
description: Create LinkedIn posts using the claudein CLI. Use when the user wants to write, draft, or schedule LinkedIn posts, or when working with any .yml posts file.
allowed-tools: Edit, Write, Bash(cin *), Bash(pgrep *), Bash(curl *)
---

# claudein — LinkedIn posts from the CLI

## Live schema

Read the current schema before writing any posts file — do not rely on memory:

!`curl -s https://raw.githubusercontent.com/claudein-org/main/refs/heads/main/claudein.schema.yml`

## Posts file

The default file is `posts.yml` but users can use any `.yml` file (pass it to `cin start my-posts.yml`). Write to whichever file the user specifies or is already working with.

`cin start` watches the file for changes and updates the browser preview live — always edit the file in place, never delete and recreate it.

## Workflow

1. Write or edit the `.yml` posts file
2. Check if `cin start` is already running: `pgrep -fa "cin start"` — if it is, skip step 3
3. If not running: `cin start [file]` — opens the live browser preview
4. Click "Post" in the browser to publish to LinkedIn

## Media guidelines (LinkedIn)

When generating or sourcing images and videos (e.g. with Remotion), target LinkedIn's specs:

**Both images and videos:** 1:1 to 4:5 aspect ratio, 1080×1080 px up to 1080×1350 px

**Images:** PNG or JPG

**Videos:** MP4, H.264

Content outside the 1:1–4:5 range may be cropped or rejected by LinkedIn.
