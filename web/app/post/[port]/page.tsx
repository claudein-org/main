import WS from "@/component/WS"
import { auth } from "@/lib/auth"
import { cook } from "@/lib/cookie"
import { db } from "@/lib/db"
import { env } from "@/lib/env"
import assert from "assert"
import type { CSSProperties } from "react"
import z from "zod"

const styles: Record<string, CSSProperties> = {
  main: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: "2.5rem",
    padding: "2rem",
  },
  hero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    textAlign: "center",
  },
  title: {
    fontSize: "clamp(3.5rem, 12vw, 7rem)",
    fontWeight: 600,
    letterSpacing: "-0.04em",
    lineHeight: 1,
  },
  titleClaude: { color: "#CF6B45" },
  titleIn: { color: "#0A66C2" },
  tagline: {
    fontSize: "1.0625rem",
    color: "var(--text-secondary)",
    fontWeight: 400,
    letterSpacing: "-0.01em",
  },
  panel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.5rem",
  },
  status: {
    fontSize: "0.9375rem",
    color: "var(--text-secondary)",
    letterSpacing: "-0.01em",
  },
  check: { color: "#0A66C2", fontWeight: 600 },
  btn: {
    display: "inline-block",
    padding: "0.75rem 2rem",
    color: "#FFFFFF",
    fontSize: "0.9375rem",
    fontWeight: 500,
    borderRadius: "10px",
    textDecoration: "none",
    letterSpacing: "-0.01em",
    transition: "opacity 0.15s",
  },
  btnLinkedin: { background: "#0A66C2" },
  btnDownload: { background: "#CF6B45" },
  footer: {
    position: "fixed",
    bottom: "1.75rem",
    fontSize: "0.8125rem",
    color: "var(--text-secondary)",
  },
}

const Params = z.object({
  port: z.coerce.number().int()
})

type Params = {
  params: Promise<z.infer<typeof Params>>
}

export default async function page({ params }: Params) {
  const { port } = Params.parse(await params)
  const { user_id } = await cook.get()

  assert(user_id, 'User not authenticated')

  const linkedin = await db
    .selectFrom('linkedin')
    .select('user_id')
    .where('user_id', '=', user_id)
    .executeTakeFirst()

  const connected = Boolean(linkedin)

  const linkedinParams = new URLSearchParams({
    response_type: "code",
    client_id: env.CLIENT_ID,
    redirect_uri: auth.getRedirectUri('linkedin'),
    scope: "w_member_social",
  })

  const linkedinUrl = `https://www.linkedin.com/oauth/v2/authorization?${linkedinParams}`

  return <main style={styles.main}>
    <div style={styles.hero}>
      <h1 style={styles.title}>
        <span style={styles.titleClaude}>claude</span>
        <span style={styles.titleIn}>in</span>
      </h1>
      <p style={styles.tagline}>your dashboard</p>
      <WS port={port} />
    </div>

    {connected ? (
      <div style={styles.panel}>
        <p style={styles.status}>
          <span style={styles.check}>✓</span> your linkedin account is connected.
        </p>
        <a className="btn" style={{ ...styles.btn, ...styles.btnDownload }} href="/api/token">
          download token
        </a>
      </div>
    ) : (
      <a className="btn" style={{ ...styles.btn, ...styles.btnLinkedin }} href={linkedinUrl}>
        connect linkedin
      </a>
    )}

    <footer style={styles.footer}>
      <a className="footer-link" href="/privacy.txt">privacy</a>
    </footer>
  </main>
}
