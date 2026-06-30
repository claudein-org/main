import { db } from '@/lib/db'
import ky from 'ky'
import z from 'zod'
import type { AccountFetcher, Metrics } from './types'

// Facebook Pages — uses the per-page token we store in the `facebook` table and
// the `pages_read_engagement` scope we already hold (analytics.md §3.2).
const api = ky.extend({ timeout: 30000 })
const BASE = 'https://graph.facebook.com/v21.0'

const Count = z.object({ summary: z.object({ total_count: z.number() }) })
const NodeResponse = z.object({
    reactions: Count.optional(),
    comments: Count.optional(),
    shares: z.object({ count: z.number() }).optional(),
})

const InsightsResponse = z.object({
    data: z.array(z.object({
        name: z.string(),
        values: z.array(z.object({ value: z.unknown() })).default([]),
    })).default([]),
})

const asNumber = (v: unknown): number | null => (typeof v === 'number' ? v : null)

export const fetchMetrics: AccountFetcher = async (user_id, page_id, posts) => {
    const out = new Map<number, Metrics>()

    const row = await db.selectFrom('facebook').select(['access_token'])
        .where('user_id', '=', user_id).where('page_id', '=', page_id).executeTakeFirst()
    if (!row) return out
    const access_token = row.access_token

    for (const p of posts) {
        const m: Metrics = {}

        // Reliable engagement counts straight off the post node.
        try {
            const node = NodeResponse.parse(
                await api.get(`${BASE}/${p.provider_post_id}`, {
                    searchParams: {
                        fields: 'reactions.summary(true).limit(0),comments.summary(true).limit(0),shares',
                        access_token,
                    },
                }).json()
            )
            m.reactions = node.reactions?.summary.total_count ?? null
            m.comments = node.comments?.summary.total_count ?? null
            m.shares = node.shares?.count ?? null
        } catch {
            // node fetch failed (deleted post / permissions) — leave counts null
        }

        // Reach + clicks via insights. Metric names drift across Graph versions
        // (Meta renamed impressions→views in Nov 2025), so this is best-effort
        // and never blocks the counts above.
        try {
            const insights = InsightsResponse.parse(
                await api.get(`${BASE}/${p.provider_post_id}/insights`, {
                    searchParams: { metric: 'post_impressions_unique,post_clicks', access_token },
                }).json()
            )
            const byName: Record<string, number | null> = {}
            for (const d of insights.data) byName[d.name] = asNumber(d.values[0]?.value)
            m.reach = byName['post_impressions_unique'] ?? null
            m.clicks = byName['post_clicks'] ?? null
        } catch {
            // insights unavailable for this post/version — skip reach/clicks
        }

        // Only record a row if at least one metric came back.
        if (m.reactions != null || m.comments != null || m.shares != null || m.reach != null || m.clicks != null) {
            out.set(p.id, m)
        }
    }

    return out
}
