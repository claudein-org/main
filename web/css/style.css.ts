import { css, cva } from "../styled-system/css"

/**
 * Style utility classes — color, typography, surfaces, buttons.
 * Layout/positioning concerns belong in layout.css.ts; base element styling
 * belongs in global.css.ts; design tokens live in panda.config.ts.
 */

/* Typography */
export const font = {
  size: {
    base: css({ fontSize: "0.9375rem" }),
    lg: css({ fontSize: "1.0625rem" }),
  },
  weight: {
    normal: css({ fontWeight: 400 }),
    medium: css({ fontWeight: 500 }),
    bold: css({ fontWeight: 600 }),
  },
}

/* Color */
export const color = {
  text: css({ color: "text" }),
  textSecondary: css({ color: "textSecondary" }),
  claude: css({ color: "claude" }),
  linkedin: css({ color: "linkedin" }),
}
export const muted = color.textSecondary
export const claude = color.claude
export const linkedin = color.linkedin
/* Media */
export const logo = css({ width: "min(300px, 20vw)", height: "auto" })

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
