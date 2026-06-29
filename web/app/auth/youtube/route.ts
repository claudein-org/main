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
  items: z
    .array(
      z.object({
        id: z.string(),
        snippet: z.object({
          title: z.string(),
          thumbnails: z.object({
            default: z.object({ url: z.string() }),
          }),
        }),
      }),
    )
    .min(1),
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
        searchParams: { part: 'id,snippet', mine: 'true' },
        headers: { Authorization: `Bearer ${access_token}` },
      })
      .json(),
  )

  const channel = items[0]!
  const channel_id = channel.id
  const channel_title = channel.snippet.title
  const channel_thumbnail = channel.snippet.thumbnails.default.url

  await db
    .insertInto('youtube')
    .values({ user_id, channel_id, channel_title, channel_thumbnail, access_token, refresh_token, expires_at })
    .onConflict((oc) =>
      oc
        .columns(['user_id', 'channel_id'])
        .doUpdateSet({ channel_title, channel_thumbnail, access_token, refresh_token, expires_at }),
    )
    .execute()

  redirect(app.close)
}
