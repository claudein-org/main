import { defineConfig } from "@pandacss/dev"
import { globalCss } from "./css/global.css"

export default defineConfig({
  // Emit Panda's CSS reset.
  preflight: true,

  // Where to look for css() / cva() declarations.
  include: [
    "./app/**/*.{ts,tsx}",
    "./component/**/*.{ts,tsx}",
    "./css/**/*.{ts,tsx}",
  ],

  exclude: [],

  // Semantic, element-level styles live here (authored in css/global.css.ts).
  globalCss,

  // Design tokens — the single source of truth for brand colors and fonts.
  theme: {
    extend: {
      keyframes: {
        slideInFromRight: {
          from: { opacity: '0', transform: 'translateX(36px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        slideInFromLeft: {
          from: { opacity: '0', transform: 'translateX(-36px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
      tokens: {
        colors: {
          text: { value: "#1a1a1a" },
          textSecondary: { value: "#6b6b6b" },
          claude: { value: "#d97757" },
          linkedin: { value: "#0a66c2" },
          facebook: { value: "#1877F2" },
          instagram: { value: "#E1306C" },
          youtube: { value: "#FF0000" },
        },
        fonts: {
          sans: { value: "var(--font-geist-sans), system-ui, sans-serif" },
          mono: { value: "var(--font-geist-mono), monospace" },
        },
      },
    },
  },

  outdir: "styled-system",
})
