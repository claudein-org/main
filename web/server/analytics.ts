/**
 * Analytics read path (plan.v1.md §6.1).
 *
 * The dashboard never calls a provider API on load — it reads the daily
 * `post_metrics` snapshots written by the sync job (`web/jobs/sync.ts`) and
 * aggregates them here. Each metric row is a point-in-time cumulative count for
 * one published item on one day, so "current" totals come from each post's
 * latest snapshot in range, while the trend sums every snapshot per day.
 */
import { db } from '@/lib/db'
import { Platform } from '@claudein.org/common'
import { sql } from 'kysely'

export interface Totals {
    impressions: number
    reach: number
    engagement: number   // reactions + comments + shares + saves
    postCount: number
}

export interface TrendPoint {
    day: string          // YYYY-MM-DD
    impressions: number
    engagement: number
}

export interface TopPost {
    published_post_id: number
    post_url: string
    provider: number
    engagement: number
}

export interface ProviderSummary {
    hasAnalyticsAccess: boolean
    totals: Totals
}

export interface Analytics {
    from: string
    to: string
    totals: Totals
    trend: TrendPoint[]
    topPosts: TopPost[]
    perProvider: Record<number, ProviderSummary>
}

export interface Range {
    from: Date
    to: Date
}

// Which providers currently expose post analytics to us (plan.v1.md §8).
// Facebook / YouTube / DEV.to are live; LinkedIn + Instagram are gated on scopes
// not yet granted, so their adapters return nothing and the dashboard shows a
// "connect analytics access" state instead of fake zeros.
export const ANALYTICS_ACCESS: Record<number, boolean> = {
    [Platform.LinkedIn]: true,
    [Platform.Facebook]: true,
    [Platform.Instagram]: false,
    [Platform.YouTube]: true,
    [Platform['DEV.to']]: true,
}

const ALL_PROVIDERS = Object.values(Platform)

const DEFAULT_RANGE_DAYS = 30

export function defaultRange(): Range {
    const to = new Date()
    const from = new Date(to.getTime() - DEFAULT_RANGE_DAYS * 24 * 60 * 60 * 1000)
    return { from, to }
}

const emptyTotals = (): Totals => ({ impressions: 0, reach: 0, engagement: 0, postCount: 0 })

export async function getAnalytics(user_id: number, range: Range = defaultRange()): Promise<Analytics> {
    // One round-trip: every metric snapshot in range, joined to its post for
    // provider + url. `day` is rendered server-side as text so grouping is
    // timezone-proof and sorts chronologically.
    const rows = await db
        .selectFrom('post_metrics as pm')
        .innerJoin('published_posts as pp', 'pp.id', 'pm.published_post_id')
        .where('pp.user_id', '=', user_id)
        .where('pm.captured_on', '>=', range.from)
        .where('pm.captured_on', '<=', range.to)
        .select([
            'pm.published_post_id',
            'pp.provider',
            'pp.post_url',
            'pm.impressions',
            'pm.reach',
            'pm.reactions',
            'pm.comments',
            'pm.shares',
            'pm.saves',
            sql<string>`to_char(pm.captured_on, 'YYYY-MM-DD')`.as('day'),
        ])
        .execute()

    const engagementOf = (r: typeof rows[number]) =>
        (r.reactions ?? 0) + (r.comments ?? 0) + (r.shares ?? 0) + (r.saves ?? 0)

    // Latest snapshot per post = its current cumulative counts.
    const latest = new Map<number, typeof rows[number]>()
    for (const r of rows) {
        const prev = latest.get(r.published_post_id)
        if (!prev || r.day > prev.day) latest.set(r.published_post_id, r)
    }

    const totals = emptyTotals()
    const perProvider: Record<number, ProviderSummary> = {}
    for (const p of ALL_PROVIDERS) {
        perProvider[p] = { hasAnalyticsAccess: ANALYTICS_ACCESS[p] ?? false, totals: emptyTotals() }
    }

    for (const r of latest.values()) {
        const eng = engagementOf(r)
        const ps = perProvider[r.provider]
        for (const t of ps ? [totals, ps.totals] : [totals]) {
            t.impressions += r.impressions ?? 0
            t.reach += r.reach ?? 0
            t.engagement += eng
            t.postCount += 1
        }
    }

    const topPosts: TopPost[] = [...latest.values()]
        .map((r) => ({
            published_post_id: r.published_post_id,
            post_url: r.post_url,
            provider: r.provider,
            engagement: engagementOf(r),
        }))
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 8)

    // Trend sums every post's snapshot on each captured day.
    const byDay = new Map<string, TrendPoint>()
    for (const r of rows) {
        let t = byDay.get(r.day)
        if (!t) { t = { day: r.day, impressions: 0, engagement: 0 }; byDay.set(r.day, t) }
        t.impressions += r.impressions ?? 0
        t.engagement += engagementOf(r)
    }
    const trend = [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day))

    return {
        from: range.from.toISOString().slice(0, 10),
        to: range.to.toISOString().slice(0, 10),
        totals,
        trend,
        topPosts,
        perProvider,
    }
}
