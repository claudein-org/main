import { css } from "../styled-system/css"

/**
 * Layout utility classes — flex direction, alignment, spacing, positioning.
 * Compose these on elements; keep visual/typographic concerns in style.css.ts.
 */

export const row = css({ display: "flex", flexDirection: "row" })
export const col = css({ display: "flex", flexDirection: "column" })

export const align = {
    start: css({ alignItems: "flex-start" }),
    center: css({ alignItems: "center" }),
}

export const textAlign = {
    center: css({ textAlign: "center" }),
}

export const gap = {
    xs: css({ gap: "0.35rem" }),
    sm: css({ gap: "1rem" }),
    md: css({ gap: "1.25rem" }),
    lg: css({ gap: "1.5rem" }),
}

