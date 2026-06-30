import { db } from '@/lib/db'
import ky from 'ky'
import z from 'zod'
import type { AccountFetcher, Metrics } from './types'

// TODO: uncomment the implementation below once:
//   1. LinkedIn grants r_member_postAnalytics product access
//   2. The scope is added back to lib/app.ts
//   3. ANALYTICS_ACCESS[Platform.LinkedIn] is flipped to true in server/analytics.ts
export const fetchMetrics: AccountFetcher = async () => new Map()

/* --- implementation ready, not yet active ---

const BASE = 'https://api.linkedin.com/rest'
// Use the version that added POST_SAVE, LINK_CLICKS, etc. (analytics.md §3.1)
const LINKEDIN_VERSION = '202504'

const MetricsResponse = z.object({
    elements: z.array(z.object({
        metricType: z.string(),
        value: z.number().nullable().optional(),
    })).default([]),
})

export const fetchMetrics: AccountFetcher = async (user_id, _account_id, posts) => {
    const out = new Map<number, Metrics>()

    const row = await db.selectFrom('linkedin').select(['access_token'])
        .where('user_id', '=', user_id).executeTakeFirst()
    if (!row) return out

    const { access_token } = row
    const headers = {
        Authorization: `Bearer ${access_token}`,
        'Linkedin-Version': LINKEDIN_VERSION,
        'X-Restli-Protocol-Version': '2.0.0',
    }

    for (const p of posts) {
        try {
            const data = MetricsResponse.parse(
                await ky.get(`${BASE}/memberCreatorPostAnalytics`, {
                    headers,
                    searchParams: new URLSearchParams([
                        ['q', 'entity'],
                        ['entity', p.provider_post_id],
                        ['metrics', 'List(IMPRESSION,MEMBERS_REACHED,REACTION,COMMENT,RESHARE,POST_SAVE,LINK_CLICKS)'],
                        ['aggregation', 'TOTAL'],
                    ]),
                    timeout: 30000,
                }).json()
            )

            const byType: Record<string, number | null> = {}
            for (const el of data.elements) byType[el.metricType] = el.value ?? null

            const m: Metrics = {
                impressions: byType['IMPRESSION'] ?? null,
                reach: byType['MEMBERS_REACHED'] ?? null,
                reactions: byType['REACTION'] ?? null,
                comments: byType['COMMENT'] ?? null,
                shares: byType['RESHARE'] ?? null,
                saves: byType['POST_SAVE'] ?? null,
                clicks: byType['LINK_CLICKS'] ?? null,
            }

            if (Object.values(m).some(v => v != null)) out.set(p.id, m)
        } catch {
            // API error or scope not yet granted — leave this post absent
        }
    }

    return out
}

--- end implementation --- */
