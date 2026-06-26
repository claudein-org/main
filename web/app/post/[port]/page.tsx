import LoginPage from "@/component/LoginPage"
import Poster from "@/component/Poster"
import { pageCentered } from "@/css/layout.css"
import { cook } from "@/lib/cookie"
import { db } from "@/lib/db"
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

  const [li, fb, ig, yt, published] = await Promise.all([
    linkedin.getStatus(user_id),
    facebook.getStatus(user_id),
    instagram.getStatus(user_id),
    youtube.getStatus(user_id),
    db.selectFrom('posts').select(['post_id', 'post_urn']).where('user_id', '=', user_id).execute()
      .then((res) => Object.fromEntries(res.map(({ post_id, post_urn }) => [post_id, post_urn]))),
  ])

  return <main>
    <div className={pageCentered}>
      <Poster
        port={port}
        expires_at={li.expires_at}
        facebookConnected={fb.connected}
        instagramConnected={ig.connected}
        youtubeConnected={yt.connected}
        published={published} />
    </div>
  </main>
}
