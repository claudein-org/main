---
name: release-cli
description: Build and publish the `claudein` CLI package to npm. Use when the user wants to cut a release of the cli/ package.
disable-model-invocation: true
---

Release the `claudein` CLI package to npm.

Steps:
1. From `cli/`, confirm the working tree is clean and on `main` (or ask the user).
2. Bump the version in `cli/package.json` per the user's intent (patch/minor/major). Ask if unspecified.
3. Build: `cd cli && bun run build` (runs `tsc` → `dist/`). Confirm `dist/index.js` exists.
4. Publish: `cd cli && npm publish`. The package is public; the `bin` is `claudein`.
5. Tag the release: `git tag claudein-v<version> && git push --tags`.

Notes:
- `cli/` has no tests; verify the build output manually if in doubt (e.g. `node dist/index.js`).
- Do NOT publish without explicit user confirmation of the version number.
