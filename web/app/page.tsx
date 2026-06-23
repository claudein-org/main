import { align, col, gap, row, w, wrap } from "@/css/layout.css"
import {
  altSection, btn, card, color, font,
  heroLeft, heroRight, heroSection, muted, navInner,
  stepNum, terminal, terminalBody, terminalDot,
  terminalDotGreen, terminalDotRed, terminalDotYellow,
  terminalHeader, terminalSuccess, tracking,
} from "@/css/style.css"
import { cx } from "@/styled-system/css"
import Image from "next/image"

const GITHUB_URL = "https://github.com/claudein-org/main"

const steps = [
  {
    label: "install",
    body: <>Run <code>npm install -g @claudein.org/cli</code> to get the CLI tool.</>,
  },
  {
    label: "connect",
    body: <>Run <code>cin start</code> — it opens your browser to sign in with Google and connect your LinkedIn account.</>,
  },
  {
    label: "post",
    body: <>Tell Claude Code: <code>post this to LinkedIn</code>. It calls claudein. Done.</>,
  },
]

export default function page() {
  return (
    <main>
      <nav>
        <div className={navInner}>
          <a href="/" className={cx(row, align.center, gap.xs)}>
            <Image src="/logo.svg" alt="claudein" width={28} height={28} priority />
            <span className={cx(font.weight.bold)}>
              <span className={cx(color.claude)}>claude</span><span className={cx(color.linkedin)}>in</span>
            </span>
          </a>
          <div className={cx(row, align.center, gap.sm)}>
            <a href="/guide" className={cx(muted)}>how it works</a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={cx(muted)}>github</a>
            <a href="/guide" className={cx(btn({ color: "linkedin" }))}>get started</a>
          </div>
        </div>
      </nav>

      <div className={heroSection}>
        <div className={heroLeft}>
          <h1 className={cx(font.size.hero, font.weight.bold, tracking.tight)}>
            Post to LinkedIn,<br />from your terminal.
          </h1>
          <p className={cx(muted, font.size.lg)}>
            claudein connects Claude Code to LinkedIn. One command to share what you&apos;re building with the world.
          </p>
          <div className={cx(row, align.center, gap.sm, wrap)}>
            <a href="/guide" className={cx(btn({ color: "linkedin" }))}>get started →</a>
            <code>npm install -g @claudein.org/cli</code>
          </div>
        </div>

        <div className={heroRight}>
          <div className={terminal}>
            <div className={terminalHeader}>
              <div className={cx(terminalDot, terminalDotRed)} />
              <div className={cx(terminalDot, terminalDotYellow)} />
              <div className={cx(terminalDot, terminalDotGreen)} />
            </div>
            <div className={terminalBody}>
              <p><span className={muted}>$</span> cin post &quot;Just launched dark mode 🌙&quot;</p>
              <p className={terminalSuccess}>✓ Posted to LinkedIn</p>
            </div>
          </div>
        </div>
      </div>

      <div className={altSection}>
        <h2 className={cx(font.size.xl, font.weight.bold, tracking.tight)}>
          how it works
        </h2>
        <div className={cx(col, gap.md, w.content)}>
          {steps.map(({ label, body }, i) => (
            <div key={label} className={cx(row, gap.md, align.center, card)}>
              <div className={stepNum}>{i + 1}</div>
              <div className={cx(col, gap.xs)}>
                <span className={cx(font.weight.bold)}>{label}</span>
                <p className={muted}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
