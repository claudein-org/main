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

const ShortLivedToken = z.object({
  access_token: z.string(),
})

const LongLivedToken = z.object({
  access_token: z.string(),
})

const PagesResponse = z.object({
  data: z.array(z.object({
    id: z.string(),
    name: z.string(),
    access_token: z.string(),
  })),
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

  const { access_token: short_lived_token } = ShortLivedToken.parse(await tokenRes.json())

  // Exchange for long-lived user token (60 days) so page tokens are also long-lived
  const longLivedRes = await ky.get('https://graph.facebook.com/v21.0/oauth/access_token', {
    searchParams: {
      grant_type: 'fb_exchange_token',
      client_id: META_APP_ID,
      client_secret: env.META_CLIENT_SECRET,
      fb_exchange_token: short_lived_token,
    },
  })

  const { access_token: user_token } = LongLivedToken.parse(await longLivedRes.json())

  // Fetch all pages the user manages along with their page-specific access tokens
  const pagesRes = await ky.get('https://graph.facebook.com/v21.0/me/accounts', {
    searchParams: { fields: 'id,name,access_token', access_token: user_token },
  })

  const { data: pages } = PagesResponse.parse(await pagesRes.json())

  await Promise.all(pages.map(page =>
    db
      .insertInto('facebook')
      .values({ user_id, page_id: page.id, page_name: page.name, access_token: page.access_token })
      .onConflict((oc) =>
        oc.columns(['user_id', 'page_id']).doUpdateSet({ page_name: page.name, access_token: page.access_token }),
      )
      .execute()
  ))

  redirect(app.close)
}
