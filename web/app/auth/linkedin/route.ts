import { app } from '@/lib/app'
import { auth } from '@/lib/auth'
import { cook } from '@/lib/cookie'
import { env } from '@/lib/env'
import assert from 'assert'
import ky from 'ky'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import z from 'zod'

const Token = z.object({
  access_token: z.string(),
})

export async function GET(request: NextRequest) {

  const { user_id } = await cook.get()

  assert(user_id, 'User not authenticated')

  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')

  const redirectUri = auth.getRedirectUri('linkedin')

  const res = await ky.post('https://www.linkedin.com/oauth/v2/accessToken', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code!,
      redirect_uri: redirectUri,
      client_id: env.CLIENT_ID,
      client_secret: env.CLIENT_SECRET,
    }),
  })

  const data = await res.json()
  console.dir(data, { depth: null })
  const { access_token: token } = Token.parse(data)

  // await db
  //   .insertInto('linkedin')
  //   .values({ user_id, token })
  //   .onConflict((oc) => oc.column('user_id').doUpdateSet({ token }))
  //   .execute()

  redirect(app.close)
}
