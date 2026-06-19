import { env } from '@/lib/env'
import ky from 'ky'
import { redirect } from 'next/navigation'
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

  const tokenRes = await ky.post('https://www.linkedin.com/oauth/v2/accessToken', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code!,
      redirect_uri: redirectUri,
      client_id: env.CLIENT_ID,
      client_secret: env.CLIENT_SECRET,
    }),
  })

  const data = await tokenRes.json()
  console.log('RES:', JSON.stringify(data, null, 2))

}
