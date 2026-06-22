import { defineGlobalStyles } from "@pandacss/dev"

/**
 * Global, semantic styles — applied to elements, never to classes.
 * Base element styling that should hold across the whole app. Reusable,
 * composable styles belong in layout.css.ts / style.css.ts; design tokens
 * (colors, fonts) live in panda.config.ts.
 */
export const globalCss = defineGlobalStyles({
  "html, body": {
    margin: 0,
    padding: 0,
  },
  body: {
    fontFamily: "sans",
    color: "text",
    background: "#ffffff",
  },
  "h1, p": {
    margin: 0,
  },
  code: {
    fontFamily: "mono",
  },
  a: {
    color: "inherit",
    textDecoration: "none",
  },
  // The page shell: every route is a centered, full-height column.
  main: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: "2.5rem",
    padding: "2rem",
  },
  // The fixed footer (privacy link) is the same on every page.
  footer: {
    position: "fixed",
    bottom: "1.75rem",
    fontSize: "0.8125rem",
    color: "textSecondary",
  },
  "footer a": {
    color: "textSecondary",
  },
  "footer a:hover": {
    textDecoration: "underline",
  },
})
