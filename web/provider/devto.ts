import { db } from '@/lib/db'

// dev.to API keys don't expire, so "connected" simply means we have a key on file.
export async function getStatus(user_id: number) {
    const row = await db
        .selectFrom('devto')
        .select(['user_id'])
        .where('user_id', '=', user_id)
        .executeTakeFirst()

    return { connected: !!row }
}
