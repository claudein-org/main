import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'
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

  const cookieStore = await cookies()
  cookieStore.set('linkedin_access_token', access_token, {
    httpOnly: true,
    secure: PROD,
    sameSite: 'lax',
    maxAge: expires_in,
  })

  redirect('/')
}
