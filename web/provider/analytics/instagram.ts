import type { AccountFetcher } from './types'

// Instagram analytics are gated on the `instagram_business_manage_insights`
// scope (not yet granted) — the publish-time `media_id` capture landed in phase
// 1, so only the scope is missing. Until it lands this returns nothing, so the
// dashboard shows the "connect analytics access" state instead of fake zeros.
//
// To wire: resolve the account token from the `instagram` table, then
// GET /{media_id}/insights?metric=reach,views,likes,comments,saved,shares and
// map onto Metrics (analytics.md §3.3).
export const fetchMetrics: AccountFetcher = async () => new Map()
