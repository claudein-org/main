import { css, cva } from "../styled-system/css"

/**
 * Style utility classes — color, typography, surfaces, buttons.
 * Layout/positioning concerns belong in layout.css.ts; base element styling
 * belongs in global.css.ts; design tokens live in panda.config.ts.
 */

/* Typography */
export const font = {
  size: {
    sm: css({ fontSize: "0.8125rem" }),
    base: css({ fontSize: "0.9375rem" }),
    lg: css({ fontSize: "1.0625rem" }),
    hero: css({ fontSize: "3.5rem", lineHeight: 1.05 }),
  },
  weight: {
    normal: css({ fontWeight: 400 }),
    medium: css({ fontWeight: 500 }),
    bold: css({ fontWeight: 600 }),
  },
}

export const tracking = {
  sm: css({ letterSpacing: "-0.01em" }),
  tight: css({ letterSpacing: "-0.04em" }),
}

/* Color */
export const color = {
  text: css({ color: "text" }),
  muted: css({ color: "textSecondary" }),
  claude: css({ color: "claude" }),
  linkedin: css({ color: "linkedin" }),
}

export const muted = color.muted

/* Media */
export const logo = css({ width: "min(300px, 20vw)", height: "auto" })

export const postImg = css({ width: "100%", height: "auto", borderRadius: "8px", display: "block" })

/* Step number badge */
export const stepNum = css({
  width: "2.25rem",
  height: "2.25rem",
  borderRadius: "50%",
  background: "linkedin",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.875rem",
  fontWeight: 700,
  flexShrink: 0,
})

/* Card */
export const card = css({
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
  padding: "1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  maxWidth: "552px",
  width: "100%",
})

export const avatar = css({
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  background: "#c0c0c0",
  flexShrink: 0,
})

/* Button */
export const btn = cva({
  base: {
    display: "inline-block",
    padding: "0.75rem 2rem",
    color: "#ffffff",
    fontSize: "0.9375rem",
    fontWeight: 500,
    borderRadius: "10px",
    letterSpacing: "-0.01em",
    transition: "opacity 0.15s",
    _hover: { opacity: 0.85 },
  },
  variants: {
    color: {
      dark: { background: "text" },
      linkedin: { background: "linkedin" },
      claude: { background: "claude" },
    },
  },
})
