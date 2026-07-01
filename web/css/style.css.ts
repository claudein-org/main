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
export const avatar = css({
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  background: "#c0c0c0",
  flexShrink: 0,
})

/* Small round channel avatar — shown inside post buttons and the connections list */
export const ytAvatar = css({
  width: "18px",
  height: "18px",
  borderRadius: "50%",
  objectFit: "cover",
  flexShrink: 0,
})

/* A connected-channel row in the sidebar Connections list */
export const channelRow = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.25rem 0.625rem 0.25rem 1.25rem",
  color: "textSecondary",
  fontSize: "0.8125rem",
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

/* Dashboard shell */
export const dashboardLayout = css({
  display: "flex",
  flexDirection: "row",
  flexGrow: 1,
  width: "100%",
  alignItems: "stretch",
})

export const sidebar = css({
  width: "280px",
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
  padding: "1.5rem 1rem 2.5rem",
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

export const sidebarDivider = css({
  height: "1px",
  margin: "0.375rem 0.75rem",
  background: "#E0DDD8",
})

export const sidebarSpacer = css({ flexGrow: 1 })

export const sidebarVersion = css({
  fontSize: "0.6875rem",
  color: "textSecondary",
  padding: "0 0.75rem",
  opacity: 0.6,
})

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

export const brandEmpty = css({ color: "textSecondary", padding: "4rem 0" })

/* Posts view — masonry via CSS columns: cards pack to their natural height
   instead of stretching to match the tallest card in a grid row. */
export const postsGrid = css({
  width: "100%",
  maxWidth: "1100px",
  columnGap: "1.25rem",
  columnCount: 1,
  "@media (min-width: 640px)": { columnCount: 2 },
  "@media (min-width: 1024px)": { columnCount: 3 },
})

export const postCard = css({
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
  padding: "1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  background: "#ffffff",
  breakInside: "avoid",
  marginBottom: "1.25rem",
})

/* Articles view — responsive grid: 1 column on mobile, 2 on desktop. */
export const articlesGrid = css({
  display: "grid",
  width: "100%",
  maxWidth: "1100px",
  gap: "1.25rem",
  gridTemplateColumns: "1fr",
  "@media (min-width: 1024px)": { gridTemplateColumns: "repeat(2, 1fr)" },
})

export const articleCard = css({
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
  padding: "1.5rem 1.75rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  background: "#ffffff",
  breakInside: "avoid",
  marginBottom: "1.25rem",
})

/* Rendered markdown — the full article body. */
export const articleBody = css({
  lineHeight: 1.6,
  "& > * + *": { marginTop: "0.85rem" },
  "& h1": { fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.02em" },
  "& h2": { fontSize: "1.25rem", fontWeight: 600, letterSpacing: "-0.01em" },
  "& h3": { fontSize: "1.0625rem", fontWeight: 600 },
  "& ul, & ol": { paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.35rem" },
  "& a": { color: "linkedin", textDecoration: "underline" },
  "& img": { maxWidth: "100%", height: "auto", borderRadius: "8px" },
  "& pre": {
    background: "#1B1F24",
    color: "#CDD9E5",
    padding: "1rem",
    borderRadius: "8px",
    overflowX: "auto",
    fontFamily: "mono",
    fontSize: "0.8125rem",
  },
  "& pre code": { background: "transparent", padding: 0 },
  "& blockquote": {
    borderLeft: "3px solid #e0e0e0",
    paddingLeft: "1rem",
    color: "textSecondary",
  },
})

export const postCardActions = css({
  marginTop: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "0.625rem",
  paddingTop: "0.25rem",
})

/* One provider's block within a card's actions — groups its accounts under a
   single posted/pending status so multi-account providers (Facebook pages,
   Instagram accounts, YouTube channels) read as one unit. */
export const providerActionGroup = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  border: "1px solid #e0e0e0",
  borderRadius: "10px",
  padding: "0.625rem 0.75rem",
})

export const providerActionHeader = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
})

export const providerActionName = css({ fontSize: "0.8125rem", fontWeight: 600, flexGrow: 1 })

export const providerActionAccounts = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
})

/* Posted/pending/failed status pill — used on provider groups within a card
   and on the dashboard's card-section headers. */
export const statusPill = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "0.6875rem",
    fontWeight: 700,
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    padding: "0.15rem 0.5rem",
    borderRadius: "999px",
    flexShrink: 0,
  },
  variants: {
    tone: {
      posted: { background: "#DCFCE7", color: "#166534" },
      pending: { background: "#FEF3C7", color: "#92400E" },
      failed: { background: "#FEE2E2", color: "#991B1B" },
    },
  },
})

/* Dashboard-level grouping of cards into "needs posting" vs "posted". */
export const cardSection = css({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  width: "100%",
  maxWidth: "1100px",
})

export const cardSectionHeader = css({
  display: "flex",
  alignItems: "center",
  gap: "0.625rem",
})

export const cardSectionTitle = css({
  fontSize: "0.8125rem",
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "textSecondary",
})

/* Small count badge next to a connected provider in the sidebar, showing how
   many cards still need to be posted to it. */
export const sidebarPendingBadge = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "1.125rem",
  height: "1.125rem",
  padding: "0 0.3rem",
  borderRadius: "999px",
  fontSize: "0.6875rem",
  fontWeight: 700,
  background: "#FEF3C7",
  color: "#92400E",
})

/* Analytics view */
export const analyticsPage = css({
  display: "flex",
  flexDirection: "column",
  gap: "2.5rem",
  width: "100%",
  maxWidth: "1000px",
})

export const analyticsHeader = css({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "0.5rem",
})

export const sectionTitle = css({
  fontSize: "0.6875rem",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "textSecondary",
  marginBottom: "0.875rem",
})

export const metricGrid = css({
  display: "grid",
  gap: "1rem",
  gridTemplateColumns: "repeat(2, 1fr)",
  "@media (min-width: 720px)": { gridTemplateColumns: "repeat(4, 1fr)" },
})

export const metricCard = css({
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
  padding: "1.25rem 1.375rem",
  background: "#ffffff",
  display: "flex",
  flexDirection: "column",
  gap: "0.375rem",
})

export const metricValue = css({
  fontSize: "1.75rem",
  fontWeight: 600,
  letterSpacing: "-0.02em",
  lineHeight: 1.1,
})

export const metricLabel = css({
  fontSize: "0.75rem",
  fontWeight: 500,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "textSecondary",
})

/* Trend chart frame — holds the inline SVG sparkline. */
export const chartFrame = css({
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
  padding: "1.5rem",
  background: "#ffffff",
})

export const chartSvg = css({ width: "100%", height: "auto", display: "block", overflow: "visible" })

export const chartLegend = css({
  display: "flex",
  gap: "1.25rem",
  marginTop: "1rem",
  fontSize: "0.8125rem",
  color: "textSecondary",
})

export const legendItem = css({ display: "flex", alignItems: "center", gap: "0.4rem" })

/* Top-posts leaderboard */
export const leaderboard = css({
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
  background: "#ffffff",
  overflow: "hidden",
})

export const leaderRow = css({
  display: "flex",
  alignItems: "center",
  gap: "0.875rem",
  padding: "0.875rem 1.25rem",
  textDecoration: "none",
  color: "text",
  transition: "background 0.15s",
  "& + &": { borderTop: "1px solid #f0efec" },
  _hover: { background: "#FAF9F7" },
})

export const leaderRank = css({
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "textSecondary",
  width: "1.25rem",
  flexShrink: 0,
})

export const leaderUrl = css({
  flexGrow: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "0.875rem",
})

export const leaderEngagement = css({ fontWeight: 600, fontSize: "0.9375rem", flexShrink: 0 })

/* Per-provider summary cards */
export const providerGrid = css({
  display: "grid",
  gap: "1rem",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
})

export const providerCard = css({
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
  padding: "1.25rem",
  background: "#ffffff",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  minHeight: "150px",
})

export const providerHead = css({ display: "flex", alignItems: "center", gap: "0.5rem" })

export const providerName = css({ fontWeight: 600, fontSize: "0.9375rem" })

export const providerStat = css({ display: "flex", flexDirection: "column", gap: "0.125rem" })

export const providerStatRow = css({
  display: "flex",
  justifyContent: "space-between",
  fontSize: "0.875rem",
  color: "textSecondary",
})

export const providerNote = css({
  marginTop: "auto",
  fontSize: "0.8125rem",
  color: "textSecondary",
  lineHeight: 1.4,
})

/* Colored brand dot keyed by provider — the only per-provider color carrier
   (no inline styles; three-file rule). */
export const providerSwatch = cva({
  base: { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0 },
  variants: {
    color: {
      linkedin: { background: "linkedin" },
      facebook: { background: "facebook" },
      instagram: { background: "instagram" },
      youtube: { background: "youtube" },
      devto: { background: "devto" },
    },
  },
})

/* Top posts table */
export const topPostsWrap = css({
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    overflowX: "auto",
    background: "#ffffff",
})

export const topPostsTable = css({
    width: "100%",
    borderCollapse: "collapse",
})

export const topPostsTh = css({
    padding: "0.5rem 1rem",
    textAlign: "left",
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: "textSecondary",
    borderBottom: "1px solid #e0e0e0",
    background: "#FAF9F7",
    whiteSpace: "nowrap",
})

export const topPostsTr = css({
    transition: "background 0.15s",
    _hover: { background: "#FAF9F7" },
    "& + &": { borderTop: "1px solid #f0efec" },
})

export const topPostsTd = css({
    padding: "0.75rem 1rem",
    verticalAlign: "middle",
    fontSize: "0.875rem",
})

export const topPostsNumTd = css({
    padding: "0.75rem 1rem",
    verticalAlign: "middle",
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
    fontSize: "0.875rem",
})

/* Shared */
export const preWrap = css({ whiteSpace: "pre-wrap" })

export const errorText = css({ color: "#dc2626", fontSize: "0.875rem" })

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
      devto: { background: "devto" },
    },
    size: {
      sm: { padding: "0.3rem 0.75rem", fontSize: "0.8125rem", borderRadius: "7px" },
    },
  },
})
