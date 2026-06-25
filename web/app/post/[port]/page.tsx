import LoginPage from "@/component/LoginPage"
import Poster from "@/component/Poster"
import { pageCentered } from "@/css/layout.css"
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

  const [linkedin, facebook, instagram, youtube, published] = await Promise.all([
    db.selectFrom('linkedin').select(['expires_at']).where('user_id', '=', user_id).executeTakeFirst(),
    db.selectFrom('facebook').select(['user_id']).where('user_id', '=', user_id).executeTakeFirst(),
    db.selectFrom('instagram').select(['user_id']).where('user_id', '=', user_id).executeTakeFirst(),
    db.selectFrom('youtube').select(['user_id']).where('user_id', '=', user_id).executeTakeFirst(),
    db.selectFrom('posts').select(['post_id', 'post_urn']).where('user_id', '=', user_id).execute()
      .then((res) => Object.fromEntries(res.map(({ post_id, post_urn }) => [post_id, post_urn]))),
  ])

  return <main>
    <div className={pageCentered}>
      <Poster
        port={port}
        expires_at={linkedin?.expires_at}
        facebookConnected={!!facebook}
        instagramConnected={!!instagram}
        youtubeConnected={!!youtube}
        published={published} />
    </div>
  </main>
}
