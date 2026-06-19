import { auth } from "@/lib/auth"
import { cook } from "@/lib/cookie"
import { env } from "@/lib/env"
import { redirect } from "next/navigation"
import styles from "./page.module.css"

export default async function Home() {
  const user_id = await cook.get('user_id')
  if (user_id) redirect('/dash')

  const googleParams = new URLSearchParams({
    response_type: "code",
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: auth.getRedirectUri('google'),
    scope: "openid email",
  })
  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?${googleParams}`

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          <span className={styles.titleClaude}>claude</span>
          <span className={styles.titleIn}>in</span>
        </h1>
        <p className={styles.tagline}>post to linkedin from the command line.</p>
      </div>

      <a className={`${styles.btn} ${styles.btnGoogle}`} href={googleUrl}>
        login with google
      </a>

      <footer className={styles.footer}>
        <a href="/privacy.txt">privacy</a>
      </footer>
    </main>
  )
}
