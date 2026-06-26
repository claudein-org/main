import { db } from '@/lib/db'

export async function getStatus(user_id: number) {
    const row = await db
        .selectFrom('linkedin')
        .select(['expires_at'])
        .where('user_id', '=', user_id)
        .executeTakeFirst()

    return { expires_at: row?.expires_at }
}
