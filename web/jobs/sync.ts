/**
 * Analytics sync — runs as a DigitalOcean job (not behind an HTTP route).
 *
 * Pulls per-post metrics from each provider's API and upserts one normalised
 * `post_metrics` row per published item per day. Reads `published_posts` (which
 * the publish path writes) and writes `post_metrics` (which the dashboard
 * reads); nothing else depends on it running.
 *
 * Robustness: each account is fetched independently and wrapped in try/catch, so
 * one provider being down — or one we lack access to (Instagram, LinkedIn today)
 * returning nothing — never blocks the rest. Idempotent on
 * (published_post_id, captured_on), so it is safe to re-run.
 */
import { db } from '@/lib/db'
import * as devto from '@/provider/analytics/devto'
import * as facebook from '@/provider/analytics/facebook'
import * as instagram from '@/provider/analytics/instagram'
import * as linkedin from '@/provider/analytics/linkedin'
import type { AccountFetcher, Metrics, PublishedPost } from '@/provider/analytics/types'
import * as youtube from '@/provider/analytics/youtube'
import { Platform } from '@claudein.org/common'
import { sql } from 'kysely'

const adapters: Record<number, AccountFetcher> = {
    [Platform.LinkedIn]: linkedin.fetchMetrics,
    [Platform.Facebook]: facebook.fetchMetrics,
    [Platform.Instagram]: instagram.fetchMetrics,
    [Platform.YouTube]: youtube.fetchMetrics,
    [Platform['DEV.to']]: devto.fetchMetrics,
}

interface Group {
    user_id: number
    provider: number
    account_id: string
    posts: PublishedPost[]
}

interface Summary {
    ranAt: string
    accounts: number
    posts: number
    written: number
    errors: { user_id: number; provider: number; account_id: string; error: string }[]
}

async function upsertMetrics(published_post_id: number, m: Metrics) {
    const cols = {
        impressions: m.impressions ?? null,
        reach: m.reach ?? null,
        reactions: m.reactions ?? null,
        comments: m.comments ?? null,
        shares: m.shares ?? null,
        saves: m.saves ?? null,
        clicks: m.clicks ?? null,
        extra: m.extra ?? null,
    }
    await db
        .insertInto('post_metrics')
        .values({ published_post_id, captured_on: sql<Date>`current_date`, ...cols })
        .onConflict((oc) => oc
            .columns(['published_post_id', 'captured_on'])
            .doUpdateSet({ ...cols, updated_at: sql<Date>`now()` }))
        .execute()
}

export async function runAnalyticsSync(): Promise<Summary> {
    // Hot window: refresh posts published in the last 90 days every run. (Older
    // rows are left to a slower cadence — analytics.md §5 — once that's added.)
    const rows = await db
        .selectFrom('published_posts')
        .select(['id', 'user_id', 'provider', 'account_id', 'provider_post_id', 'post_url'])
        .where('post_date', '>', sql<Date>`now() - interval '90 days'`)
        .execute()

    // Group by (user_id, provider, account_id) so each adapter resolves its
    // credentials once and can batch the account's posts.
    const groups = new Map<string, Group>()
    for (const r of rows) {
        const key = `${r.user_id}:${r.provider}:${r.account_id}`
        let g = groups.get(key)
        if (!g) {
            g = { user_id: r.user_id, provider: r.provider, account_id: r.account_id, posts: [] }
            groups.set(key, g)
        }
        g.posts.push({ id: r.id, account_id: r.account_id, provider_post_id: r.provider_post_id, post_url: r.post_url })
    }

    const summary: Summary = { ranAt: new Date().toISOString(), accounts: groups.size, posts: rows.length, written: 0, errors: [] }

    for (const g of groups.values()) {
        const fetch = adapters[g.provider]
        if (!fetch) continue

        let metrics: Map<number, Metrics>
        try {
            metrics = await fetch(g.user_id, g.account_id, g.posts)
        } catch (err) {
            summary.errors.push({ user_id: g.user_id, provider: g.provider, account_id: g.account_id, error: err instanceof Error ? err.message : String(err) })
            continue
        }

        for (const [published_post_id, m] of metrics) {
            try {
                await upsertMetrics(published_post_id, m)
                summary.written++
            } catch (err) {
                summary.errors.push({ user_id: g.user_id, provider: g.provider, account_id: g.account_id, error: err instanceof Error ? err.message : String(err) })
            }
        }
    }

    return summary
}

if (import.meta.main) {
    const summary = await runAnalyticsSync()
    console.log(JSON.stringify(summary, null, 2))
    process.exit(0)
}
