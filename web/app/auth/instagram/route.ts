import { app } from '@/lib/app'
import { auth } from '@/lib/auth'
import { cook } from '@/lib/cookie'
import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { INSTAGRAM_APP_ID } from '@/lib/settings'
import assert from 'assert'
import ky from 'ky'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import z from 'zod'

const Token = z.object({
  access_token: z.string(),
  // Instagram short-lived tokens don't include expires_in; exchange for long-lived below
})

const LongLivedToken = z.object({
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

  const redirectUri = auth.getRedirectUri('instagram')

  // Exchange code for short-lived token
  const tokenRes = await ky.post('https://api.instagram.com/oauth/access_token', {
    body: new URLSearchParams({
      client_id: INSTAGRAM_APP_ID,
      client_secret: env.INSTAGRAM_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code: code!,
    }),
  })

  const { access_token: short_lived_token } = Token.parse(await tokenRes.json())

  // Exchange short-lived token for long-lived token (60 days)
  const longLivedRes = await ky.get('https://graph.instagram.com/access_token', {
    searchParams: {
      grant_type: 'ig_exchange_token',
      client_secret: env.INSTAGRAM_CLIENT_SECRET,
      access_token: short_lived_token,
    },
  })

  const { access_token, expires_in } = LongLivedToken.parse(await longLivedRes.json())
  const expires_at = Math.floor(Date.now() / 1000) + expires_in

  const { id: instagram_account_id } = UserInfo.parse(
    await ky
      .get('https://graph.instagram.com/v21.0/me', {
        searchParams: { fields: 'id', access_token },
      })
      .json(),
  )

  await db
    .insertInto('instagram')
    .values({ user_id, access_token, expires_at, instagram_account_id })
    .onConflict((oc) =>
      oc.column('user_id').doUpdateSet({ access_token, expires_at, instagram_account_id }),
    )
    .execute()

  redirect(app.close)
}
