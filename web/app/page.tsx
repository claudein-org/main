import { env } from "@/lib/env"
import { cookies } from "next/headers"
import styles from "./page.module.css"

const PROD = process.env.NODE_ENV === "production"
export default async function Home() {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.has('api_key')

  const host = PROD
    ? 'claudein.org'
    : 'localhost:3000'

  const redirectUri = `https://${host}/auth/linkedin/`

  const scope = [
    "w_member_social",
    'r_emailaddress',
  ].join(' ')

  const params = new URLSearchParams({
    response_type: "code",
    client_id: env.CLIENT_ID,
    redirect_uri: redirectUri,
    scope,
  })

  const linkedinUrl = `https://www.linkedin.com/oauth/v2/authorization?${params}`

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>claudein</h1>
        <p className={styles.tagline}>post to linkedin from the command line.</p>
      </div>
      {isLoggedIn ? (
        <a className={styles.loginButton} href="/api/token">
          download token
        </a>
      ) : (
        <a className={styles.loginButton} href={linkedinUrl} target="_blank">
          connect linkedin
        </a>
      )}
      <footer className={styles.footer}>
        <a href="/privacy.txt">privacy</a>
      </footer>
    </main>
  )
}
