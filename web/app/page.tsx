import { align, gap, justify, row, textAlign, width, wrap } from "@/css/layout.css"
import {
  altSection, btn, cmdLine,
  color, ctaBlock, featureCard, featureDot, featuresGrid, font,
  heroInner, heroLeft, heroRight, heroSection, homeFooter, muted, navInner,
  sectionWrap, stepBody, stepNum, stepRow, stepsList,
  terminal, terminalBody, terminalComment, terminalDot,
  terminalDotGreen, terminalDotRed, terminalDotYellow,
  terminalHeader, terminalSuccess, tracking,
} from "@/css/style.css"
import { cx } from "@/styled-system/css"
import Image from "next/image"

const GITHUB_URL = "https://github.com/claudein-org/main"

const FEATURES: { color: "claude" | "linkedin" | "facebook" | "instagram" | "youtube" | "devto"; title: string; body: string }[] = [
  {
    color: "claude",
    title: "Built for Claude Code",
    body: "Ask Claude to draft, expand, and refresh your posts with /claudein-init, /claudein-write-article, and /claudein-update — or edit claudein.yml by hand.",
  },
  {
    color: "linkedin",
    title: "One file, five platforms",
    body: "Target LinkedIn, Facebook, Instagram, YouTube, and DEV.to per post from a single claudein.yml. Connect as many as you like.",
  },
  {
    color: "facebook",
    title: "Live local dashboard",
    body: "cin start opens a real-time preview at claudein.org that updates the moment you save claudein.yml — no refresh, no rebuild.",
  },
  {
    color: "instagram",
    title: "Rich media out of the box",
    body: "Images, video, and full articles — resolved straight from your project's media/ and articles/ folders.",
  },
  {
    color: "youtube",
    title: "Scheduling built in",
    body: "Give every asset a schedule date. The dashboard groups what's due Today, Next 7 Days, and Next 30 Days — or past due.",
  },
  {
    color: "devto",
    title: "Analytics that follow the post",
    body: "Engagement, top posts, and a per-platform breakdown, right in the same dashboard you publish from.",
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://img.shields.io/github/stars/claudein-org/main?style=social" alt="GitHub stars" height={20} />
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={btn({ color: "dark", size: "sm" })}>
              ★ Star on GitHub
            </a>
          </div>
        </div>
      </nav>

      <div className={heroSection}>
        <div className={heroInner}>
          <div className={heroLeft}>
            <h1 className={cx(font.size.hero, font.weight.bold, tracking.tight)}>
              Post everywhere, straight from&nbsp;
              <span className={cx(color.claude)}>Claude</span><span className={cx(color.linkedin)}>In</span>
            </h1>
            <p className={cx(muted, font.size.lg)}>
              One YAML file. One CLI. A live dashboard that publishes to LinkedIn, Facebook,
              Instagram, YouTube, and DEV.to.
            </p>
            <div className={cx(row, align.center, gap.sm, wrap)}>
              <a href="#getting-started" className={btn({ color: "claude" })}>Get started</a>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={btn({ color: "dark" })}>
                ★ Star on GitHub
              </a>
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
                <p className={terminalComment}># step 1 — install the CLI</p>
                <p><span className={muted}>$</span> npm install -g @claudein.org/cli</p>
                <p></p>
                <p className={terminalComment}># step 2 — scaffold a project</p>
                <p><span className={muted}>$</span> cin init</p>
                <p></p>
                <p className={terminalComment}># step 3 — start the live preview</p>
                <p><span className={muted}>$</span> cin start</p>
                <p className={terminalSuccess}>✓ Dashboard open at claudein.org</p>
                <p></p>
                <p className={terminalComment}># edit claudein.yml, or ask Claude Code to draft for you</p>
                <p className={terminalComment}># the dashboard updates live — publish when a post is ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={sectionWrap}>
        <div className={cx(width[900], textAlign.center)}>
          <h2 className={cx(font.size.xl, font.weight.bold, tracking.tight)}>Everything you need to publish, in one file</h2>
          <p className={cx(muted, font.size.lg)}>Write your content once. claudein handles the rest, per platform.</p>
        </div>
        <div className={featuresGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={featureCard}>
              <div className={cx(row, align.center, gap.xs)}>
                <span className={featureDot({ color: f.color })} />
                <h3 className={cx(font.size.lg, font.weight.bold)}>{f.title}</h3>
              </div>
              <p className={cx(muted, font.size.base)}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="getting-started" className={altSection}>
        <div className={cx(textAlign.center)}>
          <h2 className={cx(font.size.xl, font.weight.bold, tracking.tight)}>Getting started</h2>
          <p className={cx(muted, font.size.lg)}>From install to your first publish, in four steps.</p>
        </div>

        <div className={cx(width[900], row, justify.center)}>
          <div className={stepsList}>
            <div className={stepRow}>
              <div className={stepNum}>1</div>
              <div className={stepBody}>
                <h3 className={cx(font.size.lg, font.weight.bold)}>Install the CLI</h3>
                <p className={cx(muted, font.size.base)}>The claudein CLI, published to npm.</p>
                <div className={cmdLine}><span className={muted}>$</span> npm install -g @claudein.org/cli</div>
              </div>
            </div>

            <div className={stepRow}>
              <div className={stepNum}>2</div>
              <div className={stepBody}>
                <h3 className={cx(font.size.lg, font.weight.bold)}>Sign in &amp; connect platforms</h3>
                <p className={cx(muted, font.size.base)}>
                  Visit claudein.org, sign in with Google, and connect the platforms you want to post to —
                  LinkedIn, Facebook, Instagram, YouTube, and DEV.to. Connect as many as you like.
                </p>
              </div>
            </div>

            <div className={stepRow}>
              <div className={stepNum}>3</div>
              <div className={stepBody}>
                <h3 className={cx(font.size.lg, font.weight.bold)}>Scaffold a project</h3>
                <p className={cx(muted, font.size.base)}>
                  Creates a claudein/ project (claudein.yml, media/, articles/) and installs the
                  /claudein-init, /claudein-update, and /claudein-write-article commands into Claude Code.
                </p>
                <div className={cmdLine}><span className={muted}>$</span> cin init</div>
              </div>
            </div>

            <div className={stepRow}>
              <div className={stepNum}>4</div>
              <div className={stepBody}>
                <h3 className={cx(font.size.lg, font.weight.bold)}>Start the live preview</h3>
                <p className={cx(muted, font.size.base)}>
                  Opens the dashboard in your browser. Edit claudein/claudein.yml directly, or ask Claude Code to —
                  the dashboard updates automatically on every save. Publish when a post is ready.
                </p>
                <div className={cmdLine}><span className={muted}>$</span> cin start</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={sectionWrap}>
        <div className={cx(ctaBlock, textAlign.center)}>
          <h2 className={cx(font.size.xl, font.weight.bold, tracking.tight)}>Free, open source, and growing</h2>
          <p className={cx(muted, font.size.lg)}>
            claudein is MIT-licensed. Star it on GitHub to follow along, or install it now and publish your first post today.
          </p>
          <div className={cx(row, align.center, gap.sm, wrap, justify.center)}>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={btn({ color: "dark" })}>
              ★ Star on GitHub
            </a>
          </div>
          <div className={cmdLine}><span className={muted}>$</span> npm install -g @claudein.org/cli</div>
        </div>
      </div>

      <footer className={homeFooter}>
        <a href="/privacy.txt">privacy</a>
      </footer>
    </main>
  )
}
