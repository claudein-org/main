/**
 * Shared contract for the per-provider analytics adapters.
 *
 * Each provider module exports a single `fetchMetrics` that pulls metrics for a
 * batch of posts published to ONE account, resolving its own credentials. It
 * returns a map keyed by `published_posts.id`; posts with no available data are
 * simply absent. Resolving credentials and any provider API errors are the
 * adapter's concern — a throw is caught by the caller and skips just that
 * account, never the whole run. This keeps the sync job robust when a provider
 * lacks access or is temporarily down.
 */

// Normalised core metric set. Every field is optional + nullable so a provider
// reports only what it exposes (analytics.md §5 "normalize a common metric set").
export interface Metrics {
    impressions?: number | null   // a.k.a. "views" since Meta's Nov-2025 rename
    reach?: number | null
    reactions?: number | null     // reactions / likes
    comments?: number | null
    shares?: number | null        // shares / reposts
    saves?: number | null
    clicks?: number | null
    extra?: Record<string, unknown> | null  // provider-specific extras
}

// A `published_posts` row, narrowed to the fields adapters need.
export interface PublishedPost {
    id: number
    account_id: string
    provider_post_id: string
    post_url: string
}

export type AccountFetcher = (
    user_id: number,
    account_id: string,
    posts: PublishedPost[],
) => Promise<Map<number, Metrics>>
