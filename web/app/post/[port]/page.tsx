import LoginPage from "@/component/LoginPage"
import Poster from "@/component/Poster"
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

  const expires_at = await db
    .selectFrom('linkedin')
    .select(['expires_at'])
    .where('user_id', '=', user_id)
    .executeTakeFirst()
    .then((res) => res?.expires_at)

  const published = await db
    .selectFrom('posts')
    .select(['post_id', 'post_urn'])
    .where('user_id', '=', user_id)
    .execute()
    .then((res) => Object.fromEntries(res.map(({ post_id, post_urn }) => [post_id, post_urn])))

  return <main>
    <Poster
      port={port}
      expires_at={expires_at}
      published={published} />
  </main>
}
