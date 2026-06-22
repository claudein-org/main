import { app } from '@/lib/app'
import { auth } from '@/lib/auth'
import { cook } from '@/lib/cookie'
import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { GOOGLE_CLIENT_ID } from '@/lib/settings'
import ky from 'ky'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import z from 'zod'


const Token = z.object({
  access_token: z.string(),
})

const UserInfo = z.object({
  id: z.string(),
  email: z.string(),
})

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    redirect('/?error=auth_failed')
  }

  const redirectUri = auth.getRedirectUri('google')

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

  const { access_token } = Token.parse(await tokenRes.json())

  const userInfoRes = await ky.get('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  const { email } = UserInfo.parse(await userInfoRes.json())

  await db
    .insertInto('users')
    .values({ email })
    .onConflict(oc => oc.doNothing())
    .execute()

  const { user_id } = await db
    .selectFrom('users')
    .where('email', '=', email)
    .select('user_id')
    .executeTakeFirstOrThrow()

  await cook.set({ user_id })

  redirect(app.close)
}
