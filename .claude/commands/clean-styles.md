---
description: Replace inline styles with vanilla-extract utility classes
allowed-tools: [Read, Edit, Write, Bash]
---

# Clean Inline Styles: $ARGUMENTS

Remove inline `style={{...}}` props from the target file and replace them with vanilla-extract utility classes.

## Inputs to read first

1. **Target file**: `$ARGUMENTS` — the component to clean
2. **Layout utilities**: `css/layout.css.ts` — flex, grid, sizing helpers
3. **Style utilities**: `css/style.css.ts` — theme vars, color, card, button, etc.
4. **Global styles**: `css/global.css.ts` — what is already handled globally
5. If a component-specific `*.css.ts` already exists alongside the target file, read it too.

## Decision hierarchy (apply in order)

For each inline style prop found:

1. **Existing utility class** — if `layout.css.ts` or `style.css.ts` already covers it exactly, use that class. Combine multiple utility classes with `clsx(...)` or array spread as needed.
2. **Extend an existing utility** — if a tiny tweak to an existing utility (e.g. adding one more scale value to a `styleVariants`) covers the need without breaking other usages, make the change.
3. **New utility class** — if the style is generic and reusable across the codebase (e.g. `overflow: hidden`, `cursor: pointer`, `text-align: center`), add it to the appropriate utility file (`layout.css.ts` for layout/sizing, `style.css.ts` for visual/color/typography).
4. **Component-scoped CSS** — if the style is specific to this component (complex selectors, unique composition, one-off values), move it to a `ComponentName.css.ts` file beside the target. Create the file if it doesn't exist.
5. **Keep inline** — only if the value is truly dynamic (computed at runtime from props/state) and cannot be expressed statically.

## Rules

- Never break existing usages of utility classes when extending them.
- Never add a utility class that duplicates what global styles already handle.
- Prefer `clsx` for conditional or combined class names; import it if not already imported.
- Keep `css/global.css.ts` untouched — it is semantic and consensus-driven.
- After editing, update imports: add any new CSS module imports at the top of the target file.
- Do **not** remove inline styles that carry runtime-dynamic values (e.g. `style={{ width: someVar + 'px' }}`).

## Steps

1. Read all input files listed above.
2. Identify every `style={{...}}` occurrence in `$ARGUMENTS`.
3. For each one, decide which tier of the decision hierarchy applies and note your plan.
4. Apply changes: edit utility CSS files first, then edit the target component.
5. Run `bunx tsc --noEmit` to confirm no type errors.
6. Report a short summary: how many inline styles were removed, where each went (utility / component css / kept), and any new classes added.
