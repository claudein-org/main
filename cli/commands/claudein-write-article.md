---
description: Expand a synopsis into a full short article post, hosted with rich public media and links back to the project
argument-hint: <synopsis>
allowed-tools: [Read, Edit, Write, Bash, Glob, Grep, WebFetch]
---

# claudein-write-article

Expand the synopsis below into a full short article and add it to the existing
`claudein/` project (created earlier by `/claudein-init`).

Synopsis: $ARGUMENTS

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

1. **Find the project's public identity.** Look at `package.json` (`homepage`, `repository`), README badges, or git remotes (`git remote get-url origin`) to find the project's homepage and GitHub repository URLs. Only link to URLs that are actually public — if a link can't be confirmed, leave it out rather than guessing.
2. **Expand the synopsis** into a full short article (a few hundred words: intro, a couple of body sections, a closing call-to-action) written in the project's voice.
3. **Find public media for the article.** Unlike `image`/`video` assets, article media is embedded as Markdown image links and must resolve for readers on DEV.to — it can't point at local files. Only use media that is already publicly reachable, for example:
   - a file already committed to the repo, referenced via its raw GitHub URL: `https://raw.githubusercontent.com/<owner>/<repo>/<default-branch>/<path>`
   - an asset already deployed on the project's live site (e.g. `https://<homepage>/<path>`)
   Do **not** symlink or copy media into `claudein/media/` for this — that folder is only for `image`/`video` assets uploaded directly to a platform, not for article illustrations. If no public media can be found, write the article without images rather than inventing a URL.
4. **Write `claudein/articles/<slug>.md`** with the expanded article. Include the public media from step 3 as Markdown images, and close with links to the project's homepage and GitHub repository from step 1.
5. **Append a new `article` asset** to `claudein/claudein.yml` referencing the file from step 4 by bare filename, `target: ['DEV.to']` (the only platform that supports `article`). Set `created` to today and `schedule` to today (or a later date if the user's synopsis implies one), after any existing posts' `schedule` dates so it queues up in order.
6. Tell the user to run `cin start` (if not already running) to preview and publish the article.

## Asset resolution rule

- `article` posts → file must exist at `claudein/articles/<filename>`; the file itself may reference public (non-local) media, but the file itself must live under `claudein/articles/`.
