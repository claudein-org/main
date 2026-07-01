---
description: Update an existing claudein/ project with project changes and new posts
allowed-tools: [Read, Edit, Write, Bash, Glob, Grep]
---

# claudein-update

Update the `claudein/` project that already exists in this directory (created earlier
by `/claudein-init`) to reflect what has changed in the project since, and add new
posts for anything noteworthy.

If `claudein/claudein.yml` does not exist yet, stop and tell the user to run
`/claudein-init` first.

## Live schema

Read the current schema before editing `claudein.yml` — do not rely on memory:

!`curl -s https://raw.githubusercontent.com/claudein-org/main/refs/heads/main/claudein.schema.yml`

## Project layout

A claudein project is a directory with this structure:

```
{{TREE}}
```

## Steps

1. **Read the existing project.** Load `claudein/claudein.yml` to see what's already there.
2. **Detect what changed.** Compare against the current state of the repo (`git log`/`git diff` if available, otherwise a fresh scan) to find new features, fixes, media, or writing since the last update.
4. **Symlink any new media** into `claudein/media/` (never copy):
   ```bash
   ln -s /absolute/path/to/file.png claudein/media/file.png
   ```
5. **Add new articles** under `claudein/articles/*.md` for new longer-form content.
6. **Append new posts** to `claudein/claudein.yml` for anything worth announcing — do not remove or rewrite existing posts unless they're clearly stale or incorrect. Every asset needs both `created` (today, the authoring date) and `schedule` (the date it should go out — today for an immediate post, or a future date to queue it up). Pick `schedule` dates that come after the last existing post's schedule so new posts queue up in order rather than colliding.
7. Tell the user to run `cin start` (if not already running) to preview and publish the new posts.

## Asset resolution rule

- `image` / `video` posts → file must exist at `claudein/media/<filename>`
- `article` posts → file must exist at `claudein/articles/<filename>`

If a file lives outside `claudein/`, symlink it in first, then reference the bare filename.
