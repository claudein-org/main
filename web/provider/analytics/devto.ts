import { db } from '@/lib/db'
import ky from 'ky'
import z from 'zod'
import type { AccountFetcher, Metrics } from './types'

// DEV.to (Forem) — `GET /api/articles/me` returns every article the author
// published, with view/reaction/comment counts. Those counts populate only when
// the request is authenticated with the author's API key (analytics.md §3.5),
// which we hold. One call covers the whole account.
const MeArticle = z.object({
    id: z.number(),
    page_views_count: z.number().optional(),
    public_reactions_count: z.number().optional(),
    comments_count: z.number().optional(),
})
const MeResponse = z.array(MeArticle)

export const fetchMetrics: AccountFetcher = async (user_id, _account_id, posts) => {
    const out = new Map<number, Metrics>()

    const row = await db.selectFrom('devto').select(['api_key']).where('user_id', '=', user_id).executeTakeFirst()
    if (!row) return out

    const articles = MeResponse.parse(
        await ky.get('https://dev.to/api/articles/me', {
            headers: { 'api-key': row.api_key, accept: 'application/vnd.forem.api-v1+json' },
            searchParams: { per_page: '1000' },
        }).json()
    )
    const byId = new Map(articles.map(a => [String(a.id), a]))

    for (const p of posts) {
        const a = byId.get(p.provider_post_id)
        if (!a) continue
        out.set(p.id, {
            impressions: a.page_views_count ?? null,
            reactions: a.public_reactions_count ?? null,
            comments: a.comments_count ?? null,
        })
    }

    return out
}
