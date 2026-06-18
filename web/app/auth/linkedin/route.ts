import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import { env } from '@/lib/env'
import { db } from '@/lib/db'
import type { NextRequest } from 'next/server'

const PROD = process.env.NODE_ENV === "production"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    redirect('/?error=auth_failed')
  }

  const host = PROD ? 'claudein.org' : 'localhost:3000'
  const redirectUri = `https://${host}/auth/linkedin/`

  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code!,
      redirect_uri: redirectUri,
      client_id: env.CLIENT_ID,
      client_secret: env.CLIENT_SECRET,
    }),
  })

  if (!tokenRes.ok) {
    redirect('/?error=token_exchange_failed')
  }

  const { access_token, expires_in } = await tokenRes.json()

  const userinfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!userinfoRes.ok) {
    redirect('/?error=userinfo_failed')
  }

  const { sub: linkedin_id } = await userinfoRes.json()

  const existing = await db
    .selectFrom('users')
    .select('api_key')
    .where('linkedin_id', '=', linkedin_id)
    .executeTakeFirst()

  const api_key = existing?.api_key ?? randomBytes(32).toString('hex')

  await db
    .insertInto('users')
    .values({ linkedin_id, linkedin_access_token: access_token, api_key })
    .onConflict((oc) =>
      oc.column('linkedin_id').doUpdateSet({
        linkedin_access_token: access_token,
        updated_at: new Date(),
      })
    )
    .execute()

  const cookieStore = await cookies()
  cookieStore.set('api_key', api_key, {
    httpOnly: true,
    secure: PROD,
    sameSite: 'lax',
    maxAge: expires_in,
  })

  redirect('/')
}
