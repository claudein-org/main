# Analytics — provider capabilities & dashboard design

> Status: design / research report. No analytics code, DB tables, or provider API calls
> exist yet. This document records (1) what analytics data each provider exposes and what it
> would take to reach it, and (2) the analytics dashboard we should build on top of it.
> Last reviewed: 2026-06-30.

## 1. Overview

`claudein` publishes content to five providers — **LinkedIn, Facebook, Instagram, YouTube,
and DEV.to** — and records each successful publish in the `posts` table. Today the loop ends
at "published": we keep a link to each post but nothing about how it performed. The Dashboard
already has an **Analytics** tab in the sidebar (`web/component/Dashboard.tsx`), but it renders
only a placeholder — `web/component/AnalyticsView.tsx` returns `Analytics coming soon…` with no
props, no data fetch, and no metrics.

This report closes the gap between "we posted it" and "here's how it did." Every provider we
post to exposes some engagement data through its API; the catch is that each uses a different
endpoint, a different permission, a different metric vocabulary, and a different time
granularity — and in two cases we currently throw away the ID we'd need to ask.

## 2. What we store today, and the gaps

Every `postTo*` action in `web/server/post.ts` writes exactly one row per publish:

```sql
-- web/init.sql
create table posts (
  user_id   int,
  post_id   varchar(16),   -- content hash (proto.Payload.hash), NOT a provider id
  provider  int,           -- app enum: 1 LinkedIn, 2 Facebook, 3 Instagram, 4 YouTube, 5 DEV.to
  post_date timestamp,
  post_url  varchar(1000), -- the human-facing permalink
  primary key (user_id, post_id, provider)
);
```

The row holds the **public URL and the date** — no engagement metrics, and crucially **no
provider-native object ID**. Provider analytics APIs are keyed on that native ID (a LinkedIn
URN, a Facebook post id, an Instagram `media_id`, a YouTube video id, a DEV.to article id).
Where we stand on recovering each:

| Provider | Native ID produced at publish | Stored? | Recoverable from `post_url`? |
|---|---|---|---|
| LinkedIn | URN (`X-RestLi-Id` header) | only inside the URL | **Yes** — strip `…/feed/update/` |
| Facebook | `{pageid}_{nodeid}` or `video_id` | only inside the URL | **Yes** — parse `story_fbid`/`watch?v=` |
| YouTube | video `id` | only inside the URL | **Yes** — parse `watch?v=` |
| Instagram | `media_id` (from `media_publish`) | **No — discarded** | **No** (URL is an opaque `permalink`) |
| DEV.to | article `id` | **No — discarded** | **No** (URL is a slug) |

**Two hard gaps:** for Instagram and DEV.to the publish call returns only `{ url }` (see
`postToInstagram` and `postToDevto` in `web/server/post.ts`), so the native ID is lost and can't
be reconstructed. Capturing those IDs at publish time — or recovering them via a per-account
listing call (`/me/media`, `/api/articles/me`) — is a prerequisite for their analytics.

## 3. Per-provider analytics capabilities

### 3.1 LinkedIn

- **API:** `memberCreatorPostAnalytics` — the Member Post Analytics API LinkedIn launched in
  **July 2025** (the first time per-creator post metrics are available to third-party tools).
  `GET https://api.linkedin.com/rest/memberCreatorPostAnalytics`, versioned `Linkedin-Version`
  header.
- **Metrics:** `IMPRESSION`, `MEMBERS_REACHED`, `RESHARE`, `REACTION`, `COMMENT`. Newer API
  versions (from `li-lms-2026-04`) add `POST_SAVE`, `POST_SEND`, `LINK_CLICKS`,
  `PREMIUM_CTA_CLICKS`, `FOLLOWER_GAINED_FROM_CONTENT`, `PROFILE_VIEW_FROM_CONTENT`.
- **Granularity:** per-post via the `entity` finder (takes a `ugcPost`/`share` URN — exactly the
  URN we embed in `post_url`) or **aggregated across all the member's posts** via the `me`
  finder. `aggregation=TOTAL` (lifetime/range total) or `DAILY` (per-day time series; not
  supported for `MEMBERS_REACHED` and a few of the newer metrics). Optional `dateRange`.
- **Permission:** **`r_member_postAnalytics`** — a read scope we **do not have**. Our LinkedIn
  app requests only `openid profile w_member_social` (write-only), so this is the single biggest
  unlock and requires requesting the new product/scope from LinkedIn.
- **Native ID:** already recoverable from `post_url`, so no publish-time change needed.
- **Accessible now?** **No** — blocked on the `r_member_postAnalytics` scope/product approval.

### 3.2 Facebook (Pages)

- **API:** Page post insights — `GET /{post_id}/insights` on the Graph API (v21 in our code),
  plus cheaper per-post summaries on the post node itself
  (`?fields=reactions.summary(true),comments.summary(true),shares`).
- **Metrics:** `post_impressions` / `post_impressions_unique`, `post_engaged_users`,
  `post_clicks`, `post_reactions_by_type_total`, and reaction/comment/share counts.
  **Note (Nov 2025):** Meta deprecated several Page Insights metrics and **replaced
  `impressions` with a `views` metric** at the post level — the dashboard should read `views`
  and treat "impressions" as the legacy name.
- **Granularity:** lifetime/period totals per post; insights data retained ~2 years, with a
  90-day window per `since`/`until` query.
- **Permission:** **`pages_read_engagement`** — **already granted** (it's in our Facebook scope
  string alongside `pages_manage_posts`). Calls use the page-specific token we already store per
  page in the `facebook` table.
- **Native ID:** recoverable from `post_url` (`story_fbid`/`id`, or `watch?v=` for video).
- **Accessible now?** **Yes.**

### 3.3 Instagram (Business/Creator)

- **API:** media insights — `GET /{media_id}/insights` on the Instagram Graph API, plus direct
  counts on the media node (`like_count`, `comments_count`).
- **Metrics:** `reach`, `views` (replaced `impressions` for most media as of Graph v21,
  Jan 2025), `likes`, `comments`, `saved`, `shares`, `total_interactions`; newer fields add
  `reposts`. (Several profile-level fields like `profile_views`/`website_clicks` were
  deprecated in v21.)
- **Granularity:** per-media lifetime metrics. Reels vs. image/carousel expose slightly
  different metric sets.
- **Permission:** **`instagram_business_manage_insights`** — **not granted**. Our Instagram app
  requests only `instagram_business_basic, instagram_business_content_publish`.
- **Native ID:** **`media_id` is currently discarded** (`postToInstagram` keeps only the
  permalink). We'd need to persist it at publish time (it's returned by `media_publish`) or
  re-fetch it via `/{ig_id}/media`.
- **Accessible now?** **No** — blocked on both the insights scope **and** capturing `media_id`.

### 3.4 YouTube

- **API (snapshot):** Data API v3 — `GET videos.list?part=statistics&id={video_id}` →
  `viewCount`, `likeCount`, `commentCount`, `favoriteCount`. Point-in-time only (no history).
- **API (history):** YouTube Analytics API — time-series metrics such as `views`,
  `estimatedMinutesWatched`, `averageViewDuration`, `subscribersGained`, traffic sources, etc.
- **Permission:** the snapshot path works with **`youtube.readonly`**, which we **already
  request** (alongside `youtube.upload`). The Analytics API additionally needs
  **`yt-analytics.readonly`** (not granted) — a later enhancement.
- **Native ID:** recoverable from `post_url` (`watch?v=`).
- **Accessible now?** **Yes** for snapshot stats (views/likes/comments) via the Data API;
  deeper watch-time/retention history is a follow-up gated on `yt-analytics.readonly`.

### 3.5 DEV.to (Forem)

- **API (snapshot):** `GET /api/articles/me` — each article includes `page_views_count`,
  `public_reactions_count`, and `comments_count`. These fields are **only populated when the
  request is authenticated with the author's API key** (public requests return zeros) — and we
  hold that key in the `devto` table.
- **API (history):** `GET /api/analytics/historical?article_id={id}&start={date}` — a daily
  time series per article.
- **Permission:** the personal API key we already store; no OAuth scope concept.
- **Native ID:** the article `id` is **currently discarded** (`postToDevto` keeps only `url`).
  It's trivially recoverable by matching our stored `post_url` against the `url` field returned
  by `/api/articles/me`, so no publish-time change is strictly required.
- **Accessible now?** **Yes.**

## 4. Capability matrix

| Provider | Core metrics available | Read permission | Have it? | Native time series? | Native ID ready? | Buildable now? |
|---|---|---|---|---|---|---|
| **LinkedIn** | impressions, reach, reactions, comments, reshares (+ saves, clicks, follows from 2026-04) | `r_member_postAnalytics` | ❌ | ✅ (`DAILY`) | ✅ from URL | ❌ scope |
| **Facebook** | views (was impressions), engaged users, clicks, reactions, comments, shares | `pages_read_engagement` | ✅ | ⚠️ period totals | ✅ from URL | ✅ |
| **Instagram** | reach, views, likes, comments, saved, shares, total interactions | `instagram_business_manage_insights` | ❌ | ⚠️ lifetime | ❌ `media_id` dropped | ❌ scope + ID |
| **YouTube** | views, likes, comments (snapshot); watch time, retention (history) | `youtube.readonly` (snapshot) / `yt-analytics.readonly` (history) | ✅ / ❌ | ✅ via Analytics API | ✅ from URL | ✅ (snapshot) |
| **DEV.to** | page views, reactions, comments | author API key | ✅ | ✅ (`/analytics/historical`) | ⚠️ recover by URL match | ✅ |

## 5. Cross-cutting constraints

- **New permissions to request.** LinkedIn `r_member_postAnalytics` (a product approval, likely
  the longest lead time), Instagram `instagram_business_manage_insights`, and — for richer
  YouTube history — `yt-analytics.readonly`. Facebook and DEV.to need nothing new.
- **Capture native IDs at publish.** Add the provider's native object ID to what we persist (or
  recover it on demand). Instagram (`media_id`) and DEV.to (`article id`) are the cases that
  matter; LinkedIn/Facebook/YouTube IDs are already inside `post_url`.
- **Normalize a common metric set.** The platforms disagree on names and definitions. The
  dashboard should map everything onto a shared core — **impressions/reach, reactions/likes,
  comments, shares/reposts, saves, link clicks** — and surface provider-specific extras
  (LinkedIn follower-gained, YouTube watch-time, DEV.to page views) as secondary detail. Treat
  "impressions vs. views" as one normalized concept given Meta's 2025 rename.
- **Rate limits & retention argue for local storage.** Several APIs only return point-in-time
  counts (YouTube Data, DEV.to `page_views_count`) or limit historical windows (Facebook 90-day
  query window, ~2-year retention). To show trends reliably and avoid hammering provider APIs on
  every page load, we should snapshot metrics into our own DB (see §7).

## 6. The dashboard we should build

A unified **overview + drill-down**, rendered inside the existing `AnalyticsView`. Today that
component receives no props; it should be threaded `published` (the
`Record<post_id, Record<providerInt, url>>` map already built in `web/app/dash/[port]/page.tsx`)
and the per-provider connection flags, the same way `PostsView`/`BrandView` receive their data.
Styling reuses the Panda conventions in `web/css/style.css.ts` and `web/css/layout.css.ts` —
the `brandPage` 900px content width for consistency with other views, `cva` recipes for metric
cards/buttons, and the existing flex utilities — never inline styles.

### Overview (default view)
- **Headline totals** across all connected + permissioned providers: total impressions/reach,
  total engagement (reactions + comments + shares + saves), post count, over a selectable date
  range.
- **Trend chart** — impressions and engagement over time, assembled from the snapshot history
  (and native `DAILY`/historical series where available).
- **Top posts leaderboard** — best-performing posts by engagement, each linking to its
  `post_url` and to per-post drill-down.
- **Per-provider summary cards** — one card per connected provider with its headline numbers.
  Cards render honest states:
  - *connected + permissioned* → live numbers;
  - *connected but missing analytics permission* (LinkedIn, Instagram today) → a "Connect
    analytics access" call to action rather than fake zeros;
  - *not connected* → muted/empty, matching the existing `brandEmpty` empty-state pattern.

### Drill-down
- **Per-provider panel** — that platform's full metric set (including its provider-specific
  extras) with the date-range selector.
- **Per-post detail** — one post's metrics across *every* platform it was published to, using
  the existing per-post → provider map so a single piece of content can be compared side by side
  (e.g. the same update's LinkedIn impressions vs. Facebook views vs. Instagram reach).

## 7. Data collection model — scheduled snapshots

Rather than calling provider APIs live on every Analytics page load, a **scheduled background
job** periodically pulls metrics into our own database, and the dashboard reads from there. This
keeps the UI fast, gives us trend history even for APIs that only return a current count, and
keeps us within provider rate limits and historical-window limits.

**Shape (design-level — not a migration):** a new snapshot table keyed by
*(user, post, provider, captured-date)* storing the normalized metric counts plus a raw blob for
provider-specific extras:

| Field | Purpose |
|---|---|
| `user_id`, `post_id`, `provider` | join back to `posts` |
| `captured_on` | the snapshot date (one row per post per provider per day) |
| `impressions`, `reach`, `reactions`, `comments`, `shares`, `saves`, `clicks` | normalized core metrics (nullable per provider) |
| `extra` (json) | provider-specific metrics (e.g. YouTube watch-time, LinkedIn follows) |

**Job outline:** for each user, take recent `posts` rows → resolve the provider-native ID (from
the URL, or a stored/listing lookup for Instagram/DEV.to) → call that provider's analytics
endpoint → upsert one normalized snapshot row per post per day. A daily cadence is a sensible
default; recent posts can be refreshed more often than older ones. Where a provider offers its
own time series (LinkedIn `DAILY`, DEV.to `/analytics/historical`, YouTube Analytics), that can
**backfill** our history on first capture rather than us only accumulating going forward.

This snapshot table — not the live APIs — is what the dashboard queries, and what powers the
trend chart and leaderboard.

## 8. Phasing — what ships now vs. what's gated

1. **Ship now (no new approvals):** Facebook (`pages_read_engagement` ✓), YouTube snapshot stats
   (`youtube.readonly` ✓), DEV.to (API key ✓, recover article id by URL match). This alone
   covers three of five providers and proves out the snapshot table + overview/drill-down UI.
2. **Capture native IDs:** persist Instagram `media_id` (and optionally DEV.to article id) at
   publish so their analytics become addressable.
3. **Request scopes:** LinkedIn `r_member_postAnalytics` (start early — product approval is the
   long pole) and Instagram `instagram_business_manage_insights`; wire each in as its scope lands.
4. **Enhance:** add YouTube `yt-analytics.readonly` for watch-time/retention history.

## 9. Sources

- LinkedIn — [Member Post Statistics (`memberCreatorPostAnalytics`)](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/members/post-statistics), [LinkedIn launches Member Post Analytics API](https://ppc.land/linkedin-enables-third-party-analytics-access-with-new-member-post-api/)
- Facebook — [Graph API Page insights reference](https://developers.facebook.com/docs/graph-api/reference/insights/), [Page Insights API updates (2025)](https://developers.facebook.com/blog/post/2025/08/15/page-insights-api-updates/)
- Instagram — [Instagram Platform insights](https://developers.facebook.com/docs/instagram-platform/insights/), [Instagram media insights reference](https://developers.facebook.com/docs/instagram-platform/reference/instagram-media/insights/)
- YouTube — [YouTube Analytics API data model](https://developers.google.com/youtube/analytics/data_model), Data API v3 `videos.list` (`part=statistics`)
- DEV.to — [Forem API v1 docs](https://developers.forem.com/api/v1)
