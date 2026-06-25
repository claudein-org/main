import { app } from '@/lib/app'
import { auth } from '@/lib/auth'
import { cook } from '@/lib/cookie'
import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { META_APP_ID } from '@/lib/settings'
import assert from 'assert'
import ky from 'ky'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import z from 'zod'

const Token = z.object({
  access_token: z.string(),
  expires_in: z.number().int(),
})

const UserInfo = z.object({
  id: z.string(),
})

export async function GET(request: NextRequest) {
  const { user_id } = await cook.get()

  assert(user_id, 'User not authenticated')

  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    redirect('/?error=auth_failed')
  }

  const redirectUri = auth.getRedirectUri('facebook')

  const tokenRes = await ky.get('https://graph.facebook.com/v21.0/oauth/access_token', {
    searchParams: {
      client_id: META_APP_ID,
      client_secret: env.META_CLIENT_SECRET,
      redirect_uri: redirectUri,
      code: code!,
    },
  })

  const { access_token, expires_in } = Token.parse(await tokenRes.json())
  const expires_at = Math.floor(Date.now() / 1000) + expires_in

  const { id: facebook_user_id } = UserInfo.parse(
    await ky
      .get('https://graph.facebook.com/me', {
        searchParams: { fields: 'id', access_token },
      })
      .json(),
  )

  await db
    .insertInto('facebook')
    .values({ user_id, access_token, expires_at, facebook_user_id })
    .onConflict((oc) =>
      oc.column('user_id').doUpdateSet({ access_token, expires_at, facebook_user_id }),
    )
    .execute()

  redirect(app.close)
}
