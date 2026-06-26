import { db } from '@/lib/db'
import ky from 'ky'
import z from 'zod'

const RefreshedToken = z.object({
    access_token: z.string(),
    expires_in: z.number().int(),
})

const SEVEN_DAYS = 7 * 24 * 60 * 60

export async function getStatus(user_id: number) {
    const now = Math.floor(Date.now() / 1000)
    const row = await db
        .selectFrom('instagram')
        .select(['access_token', 'expires_at'])
        .where('user_id', '=', user_id)
        .executeTakeFirst()

    if (!row) return { connected: false }
    if (row.expires_at <= now) return { connected: false }

    // Proactively refresh if expiring within 7 days (long-lived tokens last 60 days)
    if (row.expires_at - now < SEVEN_DAYS) {
        try {
            const res = await ky.get('https://graph.instagram.com/refresh_access_token', {
                searchParams: {
                    grant_type: 'ig_refresh_token',
                    access_token: row.access_token,
                },
            }).json()

            const { access_token, expires_in } = RefreshedToken.parse(res)
            const expires_at = now + expires_in

            await db
                .updateTable('instagram')
                .set({ access_token, expires_at })
                .where('user_id', '=', user_id)
                .execute()
        } catch {
            // refresh failed — still valid until actual expiry
        }
    }

    return { connected: true }
}
