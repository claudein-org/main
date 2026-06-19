import { auth } from "@/lib/auth"
import { cook } from "@/lib/cookie"
import { db } from "@/lib/db"
import { env } from "@/lib/env"
import { redirect } from "next/navigation"
import styles from "./page.module.css"

export default async function Dashboard() {
  const user_id = await cook.get('user_id')
  if (!user_id) redirect('/')

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

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          <span className={styles.titleClaude}>claude</span>
          <span className={styles.titleIn}>in</span>
        </h1>
        <p className={styles.tagline}>your dashboard</p>
      </div>

      {connected ? (
        <div className={styles.panel}>
          <p className={styles.status}>
            <span className={styles.check}>✓</span> your linkedin account is connected.
          </p>
          <a className={`${styles.btn} ${styles.btnDownload}`} href="/api/token">
            download token
          </a>
        </div>
      ) : (
        <a className={`${styles.btn} ${styles.btnLinkedin}`} href={linkedinUrl}>
          connect linkedin
        </a>
      )}

      <footer className={styles.footer}>
        <a href="/privacy.txt">privacy</a>
      </footer>
    </main>
  )
}
