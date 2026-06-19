import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('api_key')

  if (!token) {
    return NextResponse.json({ error: 'not authenticated' }, { status: 401 })
  }

  const body = JSON.stringify({ api_key: token.value }, null, 2)

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="claudein_token.json"',
    },
  })
}
