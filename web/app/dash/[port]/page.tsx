import Dashboard from "@/component/Dashboard"
import LoginPage from "@/component/LoginPage"
import { cook } from "@/lib/cookie"
import { db } from "@/lib/db"
import * as devto from "@/provider/devto"
import * as facebook from "@/provider/facebook"
import * as instagram from "@/provider/instagram"
import * as linkedin from "@/provider/linkedin"
import * as youtube from "@/provider/youtube"
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

  const [li, fb, ig, yt, dt, published] = await Promise.all([
    linkedin.getStatus(user_id),
    facebook.getStatus(user_id),
    instagram.getStatus(user_id),
    youtube.getStatus(user_id),
    devto.getStatus(user_id),
    db.selectFrom('published_posts').select(['local_post_id', 'post_url', 'provider', 'account_id']).where('user_id', '=', user_id).execute()
      .then((res) => {
        // hash -> provider -> account_id -> post_url. The account_id dimension lets
        // multi-account providers (Facebook pages, Instagram accounts, YouTube
        // channels) restore the right link per account after a reload.
        const map: Record<string, Record<number, Record<string, string>>> = {}
        for (const { local_post_id, post_url, provider, account_id } of res) {
          if (!local_post_id) continue
          const byProvider = (map[local_post_id] ??= {})
          const byAccount = (byProvider[provider] ??= {})
          byAccount[account_id] = post_url
        }
        return map
      }),
  ])

  return <main>
    <Dashboard
      port={port}
      expires_at={li.expires_at}
      facebookPages={fb.pages}
      instagramAccounts={ig.accounts}
      youtubeConnected={yt.connected}
      youtubeChannels={yt.channels}
      devtoConnected={dt.connected}
      published={published} />
  </main>
}
