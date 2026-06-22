import LoginPage from "@/component/LoginPage"
import WS from "@/component/WS"
import { btn } from "@/css/style.css"
import { app } from "@/lib/app"
import { cook } from "@/lib/cookie"
import { db } from "@/lib/db"
import { cx } from "@/styled-system/css"
import z from "zod"


const Params = z.object({
  port: z.coerce.number().int()
})

type Params = {
  params: Promise<z.infer<typeof Params>>
}

export default async function page({ params }: Params) {
  const { port } = Params.parse(await params)
  const { user_id } = await cook.get()

  if (!user_id) return <LoginPage />

  const connected = await db
    .selectFrom('linkedin')
    .select('user_id')
    .where('user_id', '=', user_id)
    .executeTakeFirst()
    .then(res => Boolean(res))

  return <main>
    {connected && <WS port={port} />}

    {connected
      ? <div>
        <p>
          <span>✓</span> your linkedin account is connected.
        </p>
      </div>

      : <a
        className={cx(btn({ color: 'dark' }))}
        target="_blank"
        href={app.linkedin}>
        connect linkedin
      </a>
    }

    <footer>
      <a className="footer-link" href="/privacy.txt">privacy</a>
    </footer>
  </main>
}
