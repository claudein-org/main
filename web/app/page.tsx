import { auth } from "@/lib/auth"
import { env } from "@/lib/env"
import Image from "next/image"
import type { CSSProperties } from "react"

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
    flexDirection: "row",
    alignItems: "center",
    gap: "1.25rem",
  },
  logo: {
    width: "min(300px, 20vw)",
    height: "auto",
  },
  heroText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.35rem",
  },
  title: {
    fontSize: "clamp(2.25rem, 8vw, 3.25rem)",
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 1,
  },
  claudeWord: { color: "#D97757" },
  inWord: { color: "#0A66C2" },
  tagline: {
    fontSize: "1.0625rem",
    color: "var(--text-secondary)",
    fontWeight: 400,
    letterSpacing: "-0.01em",
  },
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
  btnGoogle: { background: "#1A1A1A" },
  footer: {
    position: "fixed",
    bottom: "1.75rem",
    fontSize: "0.8125rem",
    color: "var(--text-secondary)",
  },
}

export default async function Home() {
  const googleParams = new URLSearchParams({
    response_type: "code",
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: auth.getRedirectUri('google'),
    scope: "openid email",
  })
  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?${googleParams}`

  return (
    <main style={styles.main}>
      <div style={styles.hero}>
        <Image
          style={styles.logo}
          src="/logo.svg"
          alt="claudein.org"
          width={400}
          height={400}
          priority
        />
        <div style={styles.heroText}>
          <h1 style={styles.title}>
            <span style={styles.claudeWord}>Claude</span><span style={styles.inWord}>In</span>
          </h1>
          <p style={styles.tagline}>a claude code plugin that lets you publish posts to linkedin.</p>
          <a className="btn" style={{ ...styles.btn, ...styles.btnGoogle }} href={googleUrl}>
            login with google
          </a>
        </div>
      </div>


      <footer style={styles.footer}>
        <a className="footer-link" href="/privacy.txt">privacy</a>
      </footer>
    </main>
  )
}
