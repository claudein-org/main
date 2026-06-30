import { refreshedToken } from '@/provider/youtube'
import ky from 'ky'
import z from 'zod'
import type { AccountFetcher, Metrics, PublishedPost } from './types'

// YouTube Data API v3 — point-in-time statistics. Works with the
// `youtube.readonly` scope we already request (analytics.md §3.4). Watch-time /
// retention history needs `yt-analytics.readonly` (phase 6).
const Stats = z.object({
    viewCount: z.coerce.number().optional(),
    likeCount: z.coerce.number().optional(),
    commentCount: z.coerce.number().optional(),
    favoriteCount: z.coerce.number().optional(),
})
const VideosResponse = z.object({
    items: z.array(z.object({ id: z.string(), statistics: Stats.optional() })).default([]),
})

export const fetchMetrics: AccountFetcher = async (user_id, channel_id, posts) => {
    const out = new Map<number, Metrics>()

    const access_token = await refreshedToken(user_id, channel_id)
    if (!access_token) return out

    const byVideo = new Map<string, PublishedPost>()
    for (const p of posts) byVideo.set(p.provider_post_id, p)
    const ids = [...byVideo.keys()]

    // videos.list accepts up to 50 ids per call.
    for (let i = 0; i < ids.length; i += 50) {
        const chunk = ids.slice(i, i + 50)
        const res = VideosResponse.parse(
            await ky.get('https://www.googleapis.com/youtube/v3/videos', {
                headers: { Authorization: `Bearer ${access_token}` },
                searchParams: { part: 'statistics', id: chunk.join(','), maxResults: '50' },
            }).json()
        )
        for (const item of res.items) {
            const post = byVideo.get(item.id)
            if (!post) continue
            const s = item.statistics ?? {}
            out.set(post.id, {
                impressions: s.viewCount ?? null,
                reactions: s.likeCount ?? null,
                comments: s.commentCount ?? null,
                extra: s.favoriteCount != null ? { favoriteCount: s.favoriteCount } : null,
            })
        }
    }

    return out
}
