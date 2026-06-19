import { cook } from '@/lib/cookie'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const user_id = await cook.get('user_id')

  if (!user_id) {
    return NextResponse.json({ error: 'not authenticated' }, { status: 401 })
  }

  const user = await db
    .selectFrom('users')
    .select('api_key')
    .where('user_id', '=', user_id)
    .executeTakeFirst()

  if (!user) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const body = JSON.stringify({ api_key: user.api_key }, null, 2)

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="claudein_token.json"',
    },
  })
}
