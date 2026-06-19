import { env } from '@/lib/env'
import ky from 'ky'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import z from 'zod'

const PROD = process.env.NODE_ENV === "production"

const Token = z.object({
})

const UserInfo = z.object({
})

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    redirect('/?error=auth_failed')
  }

  const host = PROD ? 'claudein.org' : 'localhost:3000'
  const redirectUri = `https://${host}/auth/linkedin/`

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

  // const userInfo = await ky.get('https://api.linkedin.com/v2/userinfo', {
  //   headers: { Authorization: `Bearer ${access_token}` },
  // }).json() as { sub: string }

  return Response.json({ message: 'ok' }, { status: 200 })
}
