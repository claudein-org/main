import { db } from '@/lib/db'

export async function getStatus(user_id: number) {
    const now = Math.floor(Date.now() / 1000)
    const row = await db
        .selectFrom('facebook')
        .select(['expires_at'])
        .where('user_id', '=', user_id)
        .executeTakeFirst()

    return { connected: !!row && row.expires_at > now }
}
