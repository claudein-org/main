import { defineGlobalStyles } from "@pandacss/dev"

/**
 * Global, semantic styles — applied to elements, never to classes.
 * Base element styling that should hold across the whole app. Reusable,
 * composable styles belong in layout.css.ts / style.css.ts; design tokens
 * (colors, fonts) live in panda.config.ts.
 */
export const globalCss = defineGlobalStyles({
  '*': {
    boxSizing: "border-box",
  },
  "html, body": {
    margin: 0,
    padding: 0,
    width: "100%",
  },
  div: {
    position: "relative",
  },
  body: {
    fontFamily: "sans",
    color: "text",
    background: "#ffffff",
  },
  "h1, h2, h3, p": {
    margin: 0,
  },
  code: {
    fontFamily: "mono",
    fontSize: "0.875em",
    background: "#f3f2ee",
    borderRadius: "4px",
    padding: "2px 6px",
  },
  a: {
    color: "inherit",
    textDecoration: "none",
  },
  main: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  nav: {
    position: "sticky",
    top: 0,
    background: "#ffffff",
    borderBottom: "1px solid #E0DDD8",
    zIndex: 10,
  },
  "nav a:hover": {
    color: "text",
  },
  // The fixed footer (privacy link) is the same on every page.
  footer: {
    position: "fixed",
    bottom: "1.75rem",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "0.8125rem",
    color: "textSecondary",
  },
  "footer a": {
    color: "textSecondary",
  },
  "footer a:hover": {
    textDecoration: "underline",
  },
  // Form elements — reset and minimal base styling.
  "input, textarea, select": {
    fontFamily: "sans",
    fontSize: "0.9375rem",
    color: "text",
    background: "transparent",
    border: "1px solid #d4d4d4",
    borderRadius: "8px",
    padding: "0.5rem 0.75rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  "input:focus, textarea:focus, select:focus": {
    borderColor: "text",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "text",
  },
  button: {
    cursor: "pointer",
    fontFamily: "sans",
  },
})
