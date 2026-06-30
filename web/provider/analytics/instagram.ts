import { db } from '@/lib/db'
import ky from 'ky'
import z from 'zod'
import type { AccountFetcher, Metrics } from './types'

const BASE = 'https://graph.facebook.com/v21.0'

const InsightsResponse = z.object({
    data: z.array(z.object({
        name: z.string(),
        values: z.array(z.object({ value: z.unknown() })).default([]),
    })).default([]),
})

const asNumber = (v: unknown): number | null => (typeof v === 'number' ? v : null)

export const fetchMetrics: AccountFetcher = async (user_id, account_id, posts) => {
    const out = new Map<number, Metrics>()

    const row = await db.selectFrom('instagram').select(['access_token'])
        .where('user_id', '=', user_id)
        .where('instagram_account_id', '=', account_id)
        .executeTakeFirst()
    if (!row) return out

    const { access_token } = row

    for (const p of posts) {
        try {
            const insights = InsightsResponse.parse(
                await ky.get(`${BASE}/${p.provider_post_id}/insights`, {
                    searchParams: { metric: 'reach,views,likes,comments,saved,shares', access_token },
                    timeout: 30000,
                }).json()
            )

            const byName: Record<string, number | null> = {}
            for (const d of insights.data) byName[d.name] = asNumber(d.values[0]?.value)

            const m: Metrics = {
                reach: byName['reach'] ?? null,
                impressions: byName['views'] ?? null,
                reactions: byName['likes'] ?? null,
                comments: byName['comments'] ?? null,
                saves: byName['saved'] ?? null,
                shares: byName['shares'] ?? null,
            }

            if (Object.values(m).some(v => v != null)) out.set(p.id, m)
        } catch {
            // API error or post deleted — skip
        }
    }

    return out
}
