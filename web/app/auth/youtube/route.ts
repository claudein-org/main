import { app } from '@/lib/app'
import { auth } from '@/lib/auth'
import { cook } from '@/lib/cookie'
import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { GOOGLE_CLIENT_ID } from '@/lib/settings'
import assert from 'assert'
import ky from 'ky'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import z from 'zod'

const Token = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number().int(),
})

const ChannelList = z.object({
  items: z.array(z.object({ id: z.string() })).min(1),
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

  const redirectUri = auth.getRedirectUri('youtube')

  const tokenRes = await ky.post('https://oauth2.googleapis.com/token', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code!,
      redirect_uri: redirectUri,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
    }),
  })

  const { access_token, refresh_token, expires_in } = Token.parse(await tokenRes.json())
  const expires_at = Math.floor(Date.now() / 1000) + expires_in

  const { items } = ChannelList.parse(
    await ky
      .get('https://www.googleapis.com/youtube/v3/channels', {
        searchParams: { part: 'id', mine: 'true' },
        headers: { Authorization: `Bearer ${access_token}` },
      })
      .json(),
  )

  const channel_id = items[0]!.id

  await db
    .insertInto('youtube')
    .values({ user_id, access_token, refresh_token, expires_at, channel_id })
    .onConflict((oc) =>
      oc.column('user_id').doUpdateSet({ access_token, refresh_token, expires_at, channel_id }),
    )
    .execute()

  redirect(app.close)
}
