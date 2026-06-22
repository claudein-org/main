import { btn } from "@/css/style.css"
import { app } from "@/lib/app"
import { cx } from "@/styled-system/css"
import Image from "next/image"



export default async function page() {

  return <main>
    <div>
      <Image
        src="/logo.svg"
        alt="claudein.org"
        width={400}
        height={400}
        priority
      />
      <div>
        <h1>ClaudeIn</h1>
        <p>a claude code plugin that lets you post to linkedin.</p>
        <a className={cx(btn({ color: "claude" }))} href={app.guide}>Start Posting</a>
      </div>
    </div>


    <footer>
      <a href="/privacy.txt">privacy</a>
    </footer>
  </main>
}
