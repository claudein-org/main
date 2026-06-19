import { env } from '@/lib/env'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import ky from 'ky'
import { redirect } from 'next/navigation'
import { sign } from 'cookie-signature'
import type { NextRequest } from 'next/server'
import z from 'zod'

const PROD = process.env.NODE_ENV === "production"

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

  const host = PROD ? 'claudein.org' : 'localhost:3000'
  const redirectUri = `https://${host}/auth/google/`

  const tokenRes = await ky.post('https://oauth2.googleapis.com/token', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code!,
      redirect_uri: redirectUri,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
    }),
  })

  const { access_token } = Token.parse(await tokenRes.json())

  const userInfoRes = await ky.get('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  const { id: google_id, email } = UserInfo.parse(await userInfoRes.json())

  const user = await db.insertInto('users')
    .values({ google_id, email })
    .onConflict(oc => oc.column('google_id').doUpdateSet({ email }))
    .returning('id')
    .executeTakeFirstOrThrow()

  const cookieStore = await cookies()
  cookieStore.set('session', sign(user.id, env.COOKIE_SECRET), {
    httpOnly: true,
    secure: PROD,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  })

  redirect('/')
}
