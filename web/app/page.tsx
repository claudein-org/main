import { col, row, align, gap } from "@/css/layout.css"
import { font, tracking, muted } from "@/css/style.css"
import { cx } from "@/styled-system/css"
import Image from "next/image"

const GITHUB_URL = "https://github.com/claudein-org/main"

export default async function page() {
  return <main>
    <div className={cx(row, align.center, gap.xl)}>
      <Image
        src="/logo.svg"
        alt="claudein.org"
        width={220}
        height={220}
        priority
      />
      <div className={cx(col, gap.sm)}>
        <h1 className={cx(font.size.hero, font.weight.bold, tracking.tight)}>ClaudeIn</h1>
        <p className={cx(muted)}>Coming Soon</p>
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          <Image
            src="https://img.shields.io/github/stars/claudein-org/main?style=social"
            alt="GitHub Stars"
            width={90}
            height={20}
            unoptimized
          />
        </a>
      </div>
    </div>
  </main>
}
