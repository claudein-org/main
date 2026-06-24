import { align, gap, row } from "@/css/layout.css"
import {
  color, font,
  heroInner, heroLeft, heroRight, heroSection, muted, navInner,
  terminal, terminalBody, terminalComment, terminalDot,
  terminalDotGreen, terminalDotRed, terminalDotYellow,
  terminalHeader, terminalSuccess, tracking,
} from "@/css/style.css"
import { cx } from "@/styled-system/css"
import Image from "next/image"

const GITHUB_URL = "https://github.com/claudein-org/main"

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <img src="https://img.shields.io/github/stars/claudein-org/main?style=social" alt="GitHub stars" height={20} />
            </a>
          </div>
        </div>
      </nav>

      <div className={heroSection}>
        <div className={heroInner}>
          <div className={heroLeft}>
            <h1 className={cx(font.size.hero, font.weight.bold, tracking.tight)}>
              Claude Code + LinkedIn =&nbsp;
              <span className={cx(color.claude)}>Claude</span><span className={cx(color.linkedin)}>In</span>
            </h1>
            <p className={cx(muted, font.size.lg)}>
              A tiny tool to publish posts to LinkedIn using Claude Code.
            </p>
          </div>

          <div className={heroRight}>
            <div className={terminal}>
              <div className={terminalHeader}>
                <div className={cx(terminalDot, terminalDotRed)} />
                <div className={cx(terminalDot, terminalDotYellow)} />
                <div className={cx(terminalDot, terminalDotGreen)} />
              </div>
              <div className={terminalBody}>
                <p className={terminalComment}># step 1 — install the CLI</p>
                <p><span className={muted}>$</span> npm install -g @claudein.org/cli</p>
                <p></p>
                <p className={terminalComment}># step 2 — start the live preview server</p>
                <p><span className={muted}>$</span> cin start posts.yml</p>
                <p className={terminalSuccess}>✓ Preview open at claudein.org/post/54321</p>
                <p></p>
                <p className={terminalComment}># step 3 — write &amp; publish</p>
                <p className={terminalComment}># edit posts.yml directly, or ask Claude Code to draft for you</p>
                <p className={terminalComment}># the preview updates live — click &quot;Post to LinkedIn&quot; when ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer>
        <a href="/privacy.txt">privacy</a>
      </footer>
    </main>
  )
}
