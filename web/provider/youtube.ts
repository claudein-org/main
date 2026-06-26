import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { GOOGLE_CLIENT_ID } from '@/lib/settings'
import ky from 'ky'
import z from 'zod'

const RefreshedToken = z.object({
    access_token: z.string(),
    expires_in: z.number().int(),
})

const FIVE_MINUTES = 5 * 60

export async function getStatus(user_id: number) {
    const now = Math.floor(Date.now() / 1000)
    const row = await db
        .selectFrom('youtube')
        .select(['access_token', 'refresh_token', 'expires_at'])
        .where('user_id', '=', user_id)
        .executeTakeFirst()

    if (!row) return { connected: false }

    // Refresh if the access token is expired or expiring within 5 minutes
    if (row.expires_at - now < FIVE_MINUTES) {
        try {
            const res = await ky.post('https://oauth2.googleapis.com/token', {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: row.refresh_token,
                    client_id: GOOGLE_CLIENT_ID,
                    client_secret: env.GOOGLE_CLIENT_SECRET,
                }),
            }).json()

            const { access_token, expires_in } = RefreshedToken.parse(res)
            const expires_at = now + expires_in

            await db
                .updateTable('youtube')
                .set({ access_token, expires_at })
                .where('user_id', '=', user_id)
                .execute()
        } catch {
            return { connected: false }
        }
    }

    return { connected: true }
}
