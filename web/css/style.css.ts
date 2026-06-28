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

export const postFooter = css({
  borderTop: "1px solid #e0e0e0",
  paddingTop: "0.75rem",
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
  alignItems: "center",
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

/* Carousel */
export const carouselArrow = css({
  width: "52px",
  height: "52px",
  borderRadius: "50%",
  border: "1px solid #e0e0e0",
  background: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  flexShrink: 0,
  fontSize: "1.5rem",
  transition: "background 0.15s, opacity 0.15s",
  _hover: { background: "#f5f5f5" },
  _disabled: { opacity: 0.25, cursor: "default" },
})

export const progressDot = css({
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: "#e0e0e0",
  border: "none",
  padding: 0,
  cursor: "pointer",
  flexShrink: 0,
  transition: "background 0.2s, transform 0.15s",
  _hover: { transform: "scale(1.4)" },
})

export const progressDotActive = css({ background: "#0a66c2", transform: "scale(1.2)" })

/* Carousel slide animations */
const slideBase = { animationDuration: '0.22s', animationTimingFunction: 'ease-out', animationFillMode: 'both' } as const

export const slideInFromRight = css({ ...slideBase, animationName: 'slideInFromRight' })
export const slideInFromLeft  = css({ ...slideBase, animationName: 'slideInFromLeft' })

/* Dashboard shell */
export const dashboardLayout = css({
  display: "flex",
  flexDirection: "row",
  flexGrow: 1,
  width: "100%",
  alignItems: "stretch",
})

export const sidebar = css({
  width: "240px",
  flexShrink: 0,
  alignSelf: "flex-start",
  position: "sticky",
  top: 0,
  height: "100vh",
  borderRight: "1px solid #E0DDD8",
  background: "#FAF9F7",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  padding: "1.5rem 1rem",
})

export const sidebarBrand = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0 0.5rem",
})

export const sidebarLogo = css({ width: "26px", height: "26px" })

export const sidebarNav = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
})

export const navItem = cva({
  base: {
    display: "flex",
    alignItems: "center",
    gap: "0.625rem",
    width: "100%",
    textAlign: "left",
    padding: "0.5rem 0.75rem",
    borderRadius: "8px",
    fontSize: "0.9375rem",
    fontWeight: 500,
    color: "textSecondary",
    background: "transparent",
    transition: "background 0.15s, color 0.15s",
    _hover: { background: "#F0EEEA" },
  },
  variants: {
    active: {
      true: { background: "#ffffff", color: "text", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
      false: {},
    },
  },
})

export const sidebarSpacer = css({ flexGrow: 1 })

export const sidebarSectionTitle = css({
  fontSize: "0.6875rem",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "textSecondary",
  padding: "0 0.75rem",
  marginBottom: "0.5rem",
})

export const dashboardMain = css({
  flexGrow: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "3rem 2rem 5rem",
})

/* Brand view */
export const brandPage = css({
  display: "flex",
  flexDirection: "column",
  gap: "3.5rem",
  width: "100%",
  maxWidth: "900px",
})

export const brandEmpty = css({ color: "textSecondary", padding: "4rem 0" })

export const brandHero = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: "1.5rem",
})

export const brandLogo = css({ width: "min(140px, 30vw)", height: "auto" })

export const brandDescription = css({ maxWidth: "640px" })

export const brandFeatures = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "1rem",
})

export const featureCard = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "0.875rem",
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
  padding: "1.25rem",
  background: "#ffffff",
})

export const brandGallery = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "1rem",
})

export const galleryImg = css({
  width: "100%",
  height: "200px",
  objectFit: "contain",
  padding: "1rem",
  borderRadius: "12px",
  border: "1px solid #e0e0e0",
  background: "#FAF9F7",
})

/* Shared */
export const preWrap = css({ whiteSpace: "pre-wrap" })

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
