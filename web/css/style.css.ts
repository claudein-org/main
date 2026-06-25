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
    xl: css({ fontSize: "2rem", lineHeight: "1.1" }),
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
  background: "#ffffff",
})

export const avatar = css({
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  background: "#c0c0c0",
  flexShrink: 0,
})

/* Navigation */
export const navInner = css({
  maxWidth: "1128px",
  width: "100%",
  margin: "0 auto",
  padding: "0 2rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "52px",
})

/* Home hero */
export const heroSection = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  flexGrow: 1,
  padding: "4rem 2rem",
})

export const heroInner = css({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "3rem",
  maxWidth: "1128px",
  width: "100%",
})

export const heroLeft = css({
  flex: "1 1 360px",
  display: "flex",
  flexDirection: "column",
  gap: "1.75rem",
})

export const heroRight = css({
  flex: "1 1 340px",
})

/* Alternate-background section (LinkedIn #F3F2EF) */
export const altSection = css({
  background: "#F3F2EF",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2.5rem",
  padding: "4rem 2rem 6rem",
})

/* Terminal widget */
export const terminal = css({
  background: "#1B1F24",
  borderRadius: "12px",
  overflow: "hidden",
  width: "100%",
  fontFamily: "mono",
  fontSize: "0.875rem",
  boxShadow: "0 4px 32px rgba(0,0,0,0.15)",
})

export const terminalHeader = css({
  background: "#2D333B",
  padding: "0.75rem 1rem",
  display: "flex",
  gap: "6px",
  alignItems: "center",
})

export const terminalBody = css({
  padding: "1.25rem 1.5rem",
  color: "#CDD9E5",
  display: "flex",
  flexDirection: "column",
  gap: "0.625rem",
  lineHeight: "1.7",
})

export const terminalSuccess = css({ color: "#57AB5A" })
export const terminalComment = css({ color: "#768390" })

export const terminalDot = css({
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  flexShrink: 0,
})

export const terminalPrompt = css({ color: "#d97757" })
export const terminalTool = css({ color: "#6CB6FF" })
export const terminalIndent = css({ paddingLeft: "1.5rem" })
export const terminalSep = css({ borderTop: "1px solid #373e47" })
export const terminalStatusBar = css({
  display: "flex",
  justifyContent: "space-between",
  fontSize: "0.75rem",
  color: "#768390",
  borderTop: "1px solid #373e47",
  paddingTop: "0.75rem",
  marginTop: "0.25rem",
})

export const terminalDotRed = css({ background: "#F47067" })
export const terminalDotYellow = css({ background: "#DAAA3F" })
export const terminalDotGreen = css({ background: "#57AB5A" })

/* Connection menu panel */
export const connectMenu = css({
  background: "#ffffff",
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
  padding: "0.5rem",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  minWidth: "210px",
})

export const connectMenuRow = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
  padding: "0.375rem 0.625rem",
  borderRadius: "8px",
})

export const connectedBadge = css({
  color: "#22c55e",
  fontSize: "0.8125rem",
  fontWeight: 500,
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
      facebook: { background: "facebook" },
      instagram: { background: "instagram" },
      youtube: { background: "youtube" },
    },
    size: {
      sm: { padding: "0.3rem 0.75rem", fontSize: "0.8125rem", borderRadius: "7px" },
    },
  },
})
