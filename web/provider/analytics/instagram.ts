import { db } from '@/lib/db'
import ky from 'ky'
import z from 'zod'
import type { AccountFetcher, Metrics } from './types'

const BASE = 'https://graph.instagram.com/v21.0'

const InsightsResponse = z.object({
    data: z.array(z.object({
        name: z.string(),
        values: z.array(z.object({ value: z.unknown() })).default([]),
    })).default([]),
})

const asNumber = (v: unknown): number | null => (typeof v === 'number' ? v : null)

async function fetchInsights(media_id: string, metric: string, access_token: string) {
    const res = InsightsResponse.parse(
        await ky.get(`${BASE}/${media_id}/insights`, {
            searchParams: { metric, period: 'lifetime', access_token },
            timeout: 30000,
        }).json()
    )
    const byName: Record<string, number | null> = {}
    for (const d of res.data) byName[d.name] = asNumber(d.values[0]?.value)
    return byName
}

export const fetchMetrics: AccountFetcher = async (user_id, account_id, posts) => {
    const out = new Map<number, Metrics>()

    const row = await db.selectFrom('instagram').select(['access_token'])
        .where('user_id', '=', user_id)
        .where('instagram_account_id', '=', account_id)
        .executeTakeFirst()
    if (!row) return out

    const { access_token } = row

    for (const p of posts) {
        const m: Metrics = {}

        // Engagement metrics work for both regular posts and Reels.
        try {
            const byName = await fetchInsights(p.provider_post_id, 'reach,likes,comments,saved,shares', access_token)
            m.reach = byName['reach'] ?? null
            m.reactions = byName['likes'] ?? null
            m.comments = byName['comments'] ?? null
            m.saves = byName['saved'] ?? null
            m.shares = byName['shares'] ?? null
        } catch {
            // post deleted or permission denied — skip entirely
            continue
        }

        // `views` (formerly impressions) is not valid for Reels — best-effort only.
        try {
            const byName = await fetchInsights(p.provider_post_id, 'views', access_token)
            m.impressions = byName['views'] ?? null
        } catch {
            // Reel or unsupported post type — leave impressions null
        }

        if (Object.values(m).some(v => v != null)) out.set(p.id, m)
    }

    return out
}
