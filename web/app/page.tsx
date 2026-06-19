import { env } from "@/lib/env"
import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { unsign } from "cookie-signature"
import styles from "./page.module.css"

const PROD = process.env.NODE_ENV === "production"

async function getUser() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')
  if (!session) return null

  const userId = unsign(session.value, env.COOKIE_SECRET)
  if (!userId) return null

  return db.selectFrom('users')
    .select(['api_key'])
    .where('id', '=', userId)
    .executeTakeFirst()
}

export default async function Home() {
  const user = await getUser()

  const host = PROD ? 'claudein.org' : 'localhost:3000'

  const googleRedirectUri = PROD
    ? 'https://claudein.org/auth/google/'
    : 'http://localhost:3000/auth/google'

  const googleParams = new URLSearchParams({
    response_type: "code",
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: googleRedirectUri,
    scope: "openid email",
  })
  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?${googleParams}`

  const linkedinParams = new URLSearchParams({
    response_type: "code",
    client_id: env.CLIENT_ID,
    redirect_uri: `https://${host}/auth/linkedin/`,
    scope: ["w_member_social", "r_emailaddress"].join(' '),
  })
  const linkedinUrl = `https://www.linkedin.com/oauth/v2/authorization?${linkedinParams}`

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          <span className={styles.titleClaude}>claude</span>
          <span className={styles.titleIn}>in</span>
        </h1>
        <p className={styles.tagline}>post to linkedin from the command line.</p>
      </div>

      {!user ? (
        <a className={`${styles.btn} ${styles.btnGoogle}`} href={googleUrl}>
          login with google
        </a>
      ) : user.api_key ? (
        <a className={`${styles.btn} ${styles.btnDownload}`} href="/api/token">
          download token
        </a>
      ) : (
        <a className={`${styles.btn} ${styles.btnLinkedin}`} href={linkedinUrl} target="_blank">
          connect linkedin
        </a>
      )}

      <footer className={styles.footer}>
        <a href="/privacy.txt">privacy</a>
      </footer>
    </main>
  )
}
