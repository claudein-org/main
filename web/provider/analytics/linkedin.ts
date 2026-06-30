import type { AccountFetcher } from './types'

// LinkedIn analytics are gated on the `r_member_postAnalytics` scope / product
// approval (not yet granted — the longest lead time, analytics.md §5). Until it
// lands this returns nothing, so the dashboard shows the "connect analytics
// access" state instead of fake zeros.
//
// To wire: call the memberCreatorPostAnalytics `entity` finder keyed on the
// share/ugcPost URN we store as provider_post_id, and map IMPRESSION /
// MEMBERS_REACHED / REACTION / COMMENT / RESHARE onto Metrics (analytics.md §3.1).
export const fetchMetrics: AccountFetcher = async () => new Map()
