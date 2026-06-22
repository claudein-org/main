import LoginPage from "@/component/LoginPage"
import WS from "@/component/WS"
import { app } from "@/lib/app"
import { cook } from "@/lib/cookie"
import { db } from "@/lib/db"
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

  const linkedin = await db
    .selectFrom('linkedin')
    .select('user_id')
    .where('user_id', '=', user_id)
    .executeTakeFirst()

  const connected = Boolean(linkedin)

  return <main>
    <div>
      <h1>
        <span>claude</span>
        <span>in</span>
      </h1>
      <p>your dashboard</p>
      <WS port={port} />
    </div>

    {connected
      ? <div>
        <p>
          <span>✓</span> your linkedin account is connected.
        </p>
        <a className="btn" href="/api/token">
          download token
        </a>
      </div>

      : <a className="btn" target="_blank" href={app.linkedin}>
        connect linkedin
      </a>
    }

    <footer>
      <a className="footer-link" href="/privacy.txt">privacy</a>
    </footer>
  </main>
}
