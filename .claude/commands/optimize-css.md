---
description: Minimize component/page-specific .css.ts files by consolidating repeated styles into global utility classes
allowed-tools: [Read, Edit, Write, Bash]
---

# Optimize CSS

Scan the entire codebase for component/page-specific `.css.ts` files and reduce them by moving repeated styles into shared utility classes and converting one-off styles to inline styles.

## Inputs to read first

1. **Layout utilities**: `css/layout.css.ts` — flex, grid, sizing helpers
2. **Style utilities**: `css/style.css.ts` — theme vars, color, card, button, etc.
3. **Global styles**: `css/global.css.ts` — what is already handled globally (read-only reference)
4. **All component/page-specific `.css.ts` files** — discovered by scanning the repo

## Discovery step

Run the following to find all component/page-specific `.css.ts` files (i.e. every `.css.ts` that is NOT inside `css/`):

```bash
find . -name "*.css.ts" -not -path "./css/*" -not -path "./node_modules/*"
```

Read every file in that list. For each class defined, note:
- The style properties and values
- Which component/page file imports and uses it
- How many distinct files use each class

## Decision hierarchy (apply per class)

For each style class found in a component/page-specific `.css.ts`:

1. **Already covered by a global utility** — if `layout.css.ts` or `style.css.ts` already expresses this style exactly, delete the local class and replace its usages with the existing utility class.
2. **Repeated across multiple files** — if the same style appears in two or more component/page `.css.ts` files, create a new utility class in `layout.css.ts` (for layout/sizing) or `style.css.ts` (for visual/color/typography), then replace all local usages with the new utility class and delete the local class definitions.
3. **Unique, no selectors, static value** — if the style is used in only one place, has no pseudo-selectors or complex selectors, and its value is static, convert the usage to an inline `style={{...}}` prop and delete the local class.
4. **Keep in component `.css.ts`** — only if the style requires pseudo-selectors (`:hover`, `:focus`, etc.), complex selectors, or is a dynamic `styleVariants`/`recipe` that cannot be expressed inline.

## Rules

- Never touch `css/global.css.ts` — it is semantic and consensus-driven.
- Never break existing usages when extending or renaming utility classes.
- Prefer `clsx` for conditional or combined class names; import it if not already imported.
- After editing, update all import statements in consumer files.
- If a component `.css.ts` becomes empty after cleanup, delete it and remove its import.
- Do **not** convert styles to inline if the value is runtime-dynamic (computed from props/state).

## Steps

1. Read `css/layout.css.ts`, `css/style.css.ts`, and `css/global.css.ts`.
2. Run the discovery command and read every component/page-specific `.css.ts` found.
3. Build a frequency map: for each unique style declaration, count how many files define it.
4. Process each class by the decision hierarchy above (most impactful first: repeated styles → exact duplicates → one-off inlineable).
5. Edit utility CSS files first (add new shared classes), then edit each consumer component, then delete emptied `.css.ts` files.
6. Run `bunx tsc --noEmit` to confirm no type errors.
7. Report a short summary:
   - How many `.css.ts` files were reduced or deleted
   - How many new utility classes were added (and where)
   - How many classes were converted to inline styles
   - Any classes left in component files and why
