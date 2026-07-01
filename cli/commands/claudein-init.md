---
description: Scan the current project and generate an initial claudein/ project (claudein.yml, media/, articles/)
allowed-tools: [Read, Write, Bash, Glob, Grep]
---

# claudein-init

Scan the current directory, understand what this project is about, and generate a
fresh `claudein/` project from it — a starting set of posts and media that
the user can refine and publish with `cin start`.

## Live schema

Read the current schema before writing `claudein.yml` — do not rely on memory:

!`curl -s https://raw.githubusercontent.com/claudein-org/main/refs/heads/main/claudein.schema.yml`

## Project layout

A claudein project is a directory with this structure:

```
{{TREE}}
```

## Steps

1. **Understand the project.** Read `README.md`, `package.json` / equivalent manifests, and skim the top-level source to figure out what this project does and who it's for.
2. **Find media.** Look for images, video, screenshots, logos, or diagrams already in the repo (e.g. `public/`, `assets/`, `docs/`, design exports) that could illustrate a post.
3. **Find textual content.** Look for existing writing — README sections, changelogs, blog drafts — that could seed an article or post.
5. **Symlink media.** For every relevant media file found in step 2, create a symlink into `claudein/media/` (never copy):
   ```bash
   ln -s /absolute/path/to/file.png claudein/media/file.png
   ```
6. **Write `claudein/articles/*.md`** for any longer-form content worth publishing as a `article` post (DEV.to).
7. **Write `claudein/claudein.yml`** referencing a handful of seed posts (`post`, `image`, `video`, `article`) built from what was found — reference media/articles by bare filename, matching the schema.
8. Tell the user to run `cin start` to preview and publish.

## Asset resolution rule

- `image` / `video` posts → file must exist at `claudein/media/<filename>`
- `article` posts → file must exist at `claudein/articles/<filename>`

If a file lives outside `claudein/`, symlink it in first, then reference the bare filename.
