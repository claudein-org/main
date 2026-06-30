# Analytics dashboard — operative implementation plan (v1)

> Synthesises the research in [`posts.md`](posts.md) (published-post tracking & schema) and
> [`analytics.md`](analytics.md) (per-provider analytics capabilities & dashboard design) into a
> single buildable plan. The goal: a clear analytics dashboard in the existing **Analytics** tab,
> fed by data **pulled from each provider's own API** (not locally guessed), snapshotted into our
> DB by a scheduled job, and rendered read-only by the dashboard.
>
> Guiding principles (from the brief):
> - **Pull from the provider API**, don't reconstruct metrics locally.
> - **Snapshot to our DB** so the UI is fast and we keep history even where the API gives only a
>   point-in-time count.
> - **Simple and robust**: each provider syncs independently; a provider we lack access to (or that
>   errors) simply yields no metrics and the UI shows an honest empty state — it never blocks the
>   others.

---

## 0. Where we are today

| Piece | State |
|---|---|
| `posts` table | one row per `(user_id, post_id, provider)`; stores `post_url` + `post_date` only — **no provider-native id, no account id** (`web/init.sql`) |
| Publish path | `web/server/post.ts` has the native id in hand at publish time and throws it away (IG `media_id`, DEV.to article id) or buries it in `post_url` (LinkedIn URN, FB id, YT video id) |
| Multi-account | FB/IG/YT are multi-account, but `posts` has no account column; YT/FB `onConflict(...).doUpdateSet` silently overwrites the first account's row |
| Dashboard | `AnalyticsView.tsx` renders `Analytics coming soon…` — no props, no fetch |
| `published` map | `app/dash/[port]/page.tsx` builds `Record<post_id, Record<providerInt, url>>` and threads it to the views |
| Scheduler | DO App Platform (`app.yml`) runs a single `web` service; the analytics sync will be added as a **DigitalOcean job** with its entrypoint at `web/jobs/sync.ts` (currently an empty stub) |
| Provider enum | `Platform` in `@claudein.org/common`: LinkedIn=1, Facebook=2, Instagram=3, YouTube=4, DEV.to=5 |

**Access we already hold** (→ ship analytics now): Facebook `pages_read_engagement` ✓, YouTube
`youtube.readonly` ✓, DEV.to author API key ✓.
**Blocked** (→ later phases): LinkedIn `r_member_postAnalytics` (product approval), Instagram
`instagram_business_manage_insights` + capturing `media_id`.

---

## 1. Architecture in one picture

```
publish (post.ts) ──┐
                     ├─► published_posts   (anchor: account_id + provider_post_id, one row per item)
provider sync ───────┘            │
                                  │  joined by published_post_id
   ┌──────────────────────────────▼─────────────────────────────┐
   │  DO JOB   web/jobs/sync.ts   (scheduled by DigitalOcean)    │
   │   for each connected+permissioned account:                  │
   │     pull metrics from provider API ─► normalise ─► UPSERT    │
   └──────────────────────────────┬─────────────────────────────┘
                                  ▼
                            post_metrics      (one row per published_post per day)
                                  │
                                  ▼  server/analytics.ts aggregates
                         AnalyticsView (overview + drill-down)
```

The dashboard **never** calls a provider API on page load. It reads `post_metrics`. The DO job
(`web/jobs/sync.ts`) is the only thing that touches provider analytics endpoints — it runs inside the
trusted cluster with direct DB + provider-token access, so there is no public endpoint and no shared
secret to guard.

---

## 2. Database schema

Two new tables. `init.sql` is the source of truth (per `CLAUDE.md`); apply via the **`sync-pg`**
flow (writes `migration.sql`), then mirror the Kysely interfaces with **`sync-sql-kysely`**.

### 2.1 `published_posts` — the join anchor (adopted from `posts.md` §3)

Replaces `posts`. One row per **published item** (a post on a specific account), carrying the
provider-native id that every analytics API is keyed on.

```sql
create table if not exists published_posts (
  id               bigserial primary key,
  user_id          int  not null references users(user_id) on delete cascade,

  provider         int  not null,            -- app Platform enum (1..5)
  account_id       varchar(100) not null,    -- author_urn / page_id / instagram_account_id / channel_id / devto_user_id

  provider_post_id varchar(200) not null,    -- URN / fb post id / ig media id / yt video id / devto article id
  local_post_id    varchar(16),              -- our content hash; NULL for sync-discovered posts
  origin           int  not null default 1,  -- 1 = published by app, 2 = discovered via provider sync

  post_url         varchar(1000) not null,
  post_date        timestamp not null default current_timestamp,
  synced_at        timestamp,

  unique (user_id, provider, account_id, provider_post_id)
);

create index if not exists published_posts_local_idx
  on published_posts (user_id, provider, account_id, local_post_id);
```

Why: `provider_post_id` is the analytics key and the de-dup key; `account_id` fixes multi-account
collisions (each page/channel its own row, joined back to the per-provider tables via
`(user_id, account_id)`); the unique constraint lets an app-publish and a later sync converge to one
row via upsert.

### 2.2 `post_metrics` — daily normalised snapshot (from `analytics.md` §7)

```sql
create table if not exists post_metrics (
  published_post_id bigint not null references published_posts(id) on delete cascade,
  captured_on       date   not null,                  -- one row per post per day

  impressions int,                                    -- normalised core set; nullable per provider
  reach       int,
  reactions   int,                                    -- reactions/likes
  comments    int,
  shares      int,                                    -- shares/reposts
  saves       int,
  clicks      int,

  extra       jsonb,                                  -- provider-specific extras (YT watch-time, LI follows, DEV.to page_views)

  updated_at  timestamp not null default current_timestamp,
  primary key (published_post_id, captured_on)
);
```

Keying on `published_post_id` (not `(user,post,provider)`) means identity already includes account +
native id. The dashboard queries **this table only**. `captured_on` gives trend history even for
APIs that return just a current count (YT Data, DEV.to `page_views_count`).

### 2.3 Kysely (`web/lib/db.ts`)

Add interfaces `PublishedPosts` and `PostMetrics`, drop `Posts`, register both in `DB`. (Mechanical
— run `sync-sql-kysely` after `init.sql` lands. Shapes are in `posts.md` §3 + table above; `extra`
is `Record<string, unknown> | null`, all metric columns `number | null`.)

### 2.4 Migration

Carry existing `posts` rows into `published_posts` (placeholder `account_id=''`,
`provider_post_id=post_url`), per the sketch in `posts.md` §"Migration sketch", then `drop table
posts`. Do this through `sync-pg` — **not** hand-run against production (there is no staging).

---

## 3. Capture native ids at publish (`web/server/post.ts`)

Every `postTo*` already has the native id and the account id in scope. Stop discarding them: write a
`published_posts` row instead of a `posts` row.

| Fn | `account_id` | `provider_post_id` to capture |
|---|---|---|
| `postToLinkedin` | `author_urn` | `urn` (already returned by `linkedin.post`) |
| `postToFacebook` | `page_id` (param) | `res.post_id ?? res.id` for feed/photo; `session.video_id` for video |
| `postToInstagram` | `instagram_account_id` (param) | **`media_id`** — currently dropped in `provider/instagram.ts`; return it alongside `url` |
| `postToYoutube` | `channel_id` (param) | `id` from `youtube.upload` |
| `postToDevto` | `devto_user_id` | parse `id` from the DEV.to article response (extend `DevtoArticle` zod schema) |

Insert pattern (replaces the current `posts` insert; the unique constraint makes it idempotent):

```ts
await db.insertInto('published_posts')
  .values({ user_id, provider, account_id, provider_post_id, local_post_id: hash, origin: 1, post_url })
  .onConflict(oc => oc.columns(['user_id','provider','account_id','provider_post_id'])
                      .doUpdateSet({ post_url, local_post_id: hash }))
  .execute()
```

Two small upstream edits:
- `provider/instagram.ts` `upload()` → return `{ url, media_id }`.
- `post.ts` `DevtoArticle` zod → add `id` (number/string) and keep it.

This is the **only behavioural change to the publish path** and is independently shippable (it just
starts persisting ids; nothing reads them yet).

---

## 4. Provider analytics adapters (`web/provider/analytics/`)

One module per provider, each exporting a single `fetchMetrics`. Uniform contract so the sync loop is
provider-agnostic and a missing/erroring provider is just a skipped entry. The fetcher works **per
account** (resolving its own credentials and batching that account's posts) and returns a map keyed
by `published_posts.id` — this lets DEV.to satisfy a whole account in one `/me` call and YouTube
batch 50 video ids per request. Posts with no data are simply omitted from the map.

```ts
// web/provider/analytics/types.ts  (as implemented)
export interface Metrics {
  impressions?: number | null; reach?: number | null; reactions?: number | null
  comments?: number | null; shares?: number | null; saves?: number | null; clicks?: number | null
  extra?: Record<string, unknown> | null
}
export interface PublishedPost { id: number; account_id: string; provider_post_id: string; post_url: string }
export type AccountFetcher = (
  user_id: number, account_id: string, posts: PublishedPost[],
) => Promise<Map<number, Metrics>>   // keyed by published_posts.id
```

Build now (have access):

- **`facebook.ts`** — `GET /v21.0/{provider_post_id}/insights` with the page token from `facebook`
  table; map `views`(was `impressions`)→impressions, `post_engaged_users`, reactions/comments/shares
  summaries → core; `post_clicks`→clicks. (See `analytics.md` §3.2; read `views`, treat
  "impressions" as legacy name — Meta's Nov-2025 rename.)
- **`youtube.ts`** — `GET videos.list?part=statistics&id={provider_post_id}` via
  `provider/youtube.ts`'s existing `refreshedToken(user_id, channel_id)`; `viewCount`→impressions,
  `likeCount`→reactions, `commentCount`→comments. Snapshot only (no history without
  `yt-analytics.readonly`).
- **`devto.ts`** — `GET /api/articles/me` with the stored `api_key`; match by `provider_post_id`
  (article id); `page_views_count`→impressions, `public_reactions_count`→reactions,
  `comments_count`→comments. (Fields populate only with the author key — which we hold.)

Stub now, wire when access lands (return `null` → no rows → honest empty state):

- **`instagram.ts`** — needs `instagram_business_manage_insights` **and** the `media_id` from §3.
- **`linkedin.ts`** — needs `r_member_postAnalytics` (longest lead time; request early).

Robustness rule: each fetcher is wrapped in `try/catch` by the caller; a throw or `null` skips that
post, never the batch.

---

## 5. The sync job — `web/jobs/sync.ts`

Runs as a **DigitalOcean job**, not behind an HTTP route. It executes inside the cluster with the
same DB connection and provider credentials as the web service, runs to completion, and exits. No
public endpoint, no `CRON_SECRET`, no GitHub Actions — DigitalOcean owns the scheduling.

### 5.1 Entrypoint + orchestration (`web/jobs/sync.ts`)

The whole sync lives here, exported as a function and self-invoked when run as the entrypoint —
mirroring the repo's existing `if (import.meta.main)` script convention (`lib/db.ts`, `tools/app.ts`,
run via `bun`).

All five providers are registered (Instagram/LinkedIn as stubs returning an empty map, so they're
uniformly "attempted" then yield nothing until their access lands). The flow:

```ts
// web/jobs/sync.ts  (shape as implemented)
const adapters: Record<number, AccountFetcher> = {
  [Platform.LinkedIn]: linkedin.fetchMetrics,   // stub → empty map
  [Platform.Facebook]: facebook.fetchMetrics,
  [Platform.Instagram]: instagram.fetchMetrics, // stub → empty map
  [Platform.YouTube]:  youtube.fetchMetrics,
  [Platform['DEV.to']]: devto.fetchMetrics,
}

export async function runAnalyticsSync() {
  // hot window: posts < 90d refreshed every run (analytics.md §5)
  const rows = await db.selectFrom('published_posts')
    .select(['id','user_id','provider','account_id','provider_post_id','post_url'])
    .where('post_date', '>', sql<Date>`now() - interval '90 days'`).execute()

  // group by (user_id, provider, account_id); each adapter resolves its own creds + batches
  for (const g of groupByAccount(rows)) {
    const fetch = adapters[g.provider]; if (!fetch) continue
    let metrics: Map<number, Metrics>
    try { metrics = await fetch(g.user_id, g.account_id, g.posts) } catch { /* record + continue */ continue }
    for (const [published_post_id, m] of metrics) {
      // UPSERT post_metrics (published_post_id, captured_on = current_date, ...m)
      //   ON CONFLICT (published_post_id, captured_on) DO UPDATE
    }
  }
  return { ranAt, accounts, posts, written, errors }
}

if (import.meta.main) { console.log(JSON.stringify(await runAnalyticsSync())); process.exit(0) }
```

Robustness: account-level and per-upsert `try/catch`; the job always finishes and returns a summary
even if a whole provider is down. Idempotent on `(published_post_id, captured_on)` — safe to re-run.

### 5.2 Wire it as a DO job (`web/app.yml` + `Dockerfile.job`)

The web image (`/Dockerfile`) is a **Next.js standalone build** — it only bundles files Next traces
from the server entry, so it does **not** contain `web/jobs/sync.ts`. The job therefore builds from a
dedicated **`/Dockerfile.job`** (bun + full repo source + workspace deps, `CMD ["bun",
"web/jobs/sync.ts"]`). Verified: `bun build web/jobs/sync.ts` resolves all 403 modules (the `@/` alias
via `web/tsconfig.json`, `@claudein.org/common` via the workspace) from the repo root.

```yaml
jobs:
  - name: analytics-sync
    kind: POST_DEPLOY              # in-spec trigger; recurring schedule set on the DO job (idempotent, safe to re-run)
    github: { branch: main, deploy_on_push: true, repo: claudein-org/main }
    source_dir: /
    dockerfile_path: /Dockerfile.job
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - { key: SPACE_SECRET_KEY, scope: RUN_TIME, type: SECRET }
```

The job imports `lib/env.ts`, which zod-validates **all** secrets at startup, so it needs the same env
as the web service. `DB_*` and the OAuth/cookie secrets are app-level secrets (DO dashboard) and are
inherited; `SPACE_SECRET_KEY` is per-component, so it's repeated. ⚠️ If any required var is not set
app-level, add it to the job's `envs` or the job will crash at `env.parse`.

The exact `kind`/schedule field is set on the DigitalOcean job; this plan deliberately leaves the
cadence to DO and keeps the codebase cron-free. The job reads the same `published_posts` it writes at
publish time and writes `post_metrics` — nothing else in the app depends on it running.

---

## 6. Read path & dashboard

### 6.1 Server aggregation — `web/server/analytics.ts`

```ts
export async function getAnalytics(user_id: number, range: { from: Date; to: Date }) {
  // join post_metrics ⋈ published_posts WHERE user_id, captured_on in range
  // returns:
  //  totals      : { impressions, reach, engagement(=reactions+comments+shares+saves), postCount }
  //  trend       : [{ day, impressions, engagement }]            // latest captured_on per post per day
  //  topPosts    : [{ published_post_id, post_url, provider, engagement }]   // leaderboard
  //  perProvider : { [providerInt]: { connected, hasAnalyticsAccess, totals } }
}
```

`hasAnalyticsAccess` comes from the access matrix (FB/YT/DEV.to = true; LI/IG = false until scopes
land) — drives the honest card states below.

### 6.2 Thread the data (mirror the existing `published` prop)

In `app/dash/[port]/page.tsx` add `getAnalytics(user_id, defaultRange)` to the `Promise.all`, pass
`analytics` into `Dashboard`, and `Dashboard` forwards it to `<AnalyticsView analytics=... />` (same
pattern `PostsView`/`BrandView` already use).

### 6.3 `AnalyticsView.tsx` (`analytics.md` §6)

Reuse Panda conventions only (`brandPage` 900px width, `cva` recipes, flex utils in
`css/layout.css.ts` / `css/style.css.ts`; **no inline styles** — three-file rule). Any new classes
(metric card, trend chart frame, leaderboard row) go in `css/style.css.ts`.

- **Overview:** headline totals over a date range; trend chart (impressions + engagement); top-posts
  leaderboard linking to `post_url`; per-provider summary cards with three honest states —
  *connected+permissioned* → live numbers; *connected but no analytics scope* (LinkedIn, Instagram
  today) → "Connect analytics access" CTA, **not** fake zeros; *not connected* → muted `brandEmpty`.
- **Drill-down:** per-provider panel (full metric set incl. extras); per-post detail comparing one
  piece of content across every platform it was posted to (via the existing per-post→provider map).

A lightweight charting approach (e.g. inline SVG sparkline/bars driven by the trend array) keeps the
bundle small and avoids a new dependency; revisit a chart lib only if the drill-down needs it.

---

## 7. Phasing (each phase independently shippable)

| Phase | Ships | Needs |
|---|---|---|
| **1. Foundation** | `published_posts` + `post_metrics` tables; capture native ids in `post.ts`/`instagram.ts` (§3) | `sync-pg`, `sync-sql-kysely` |
| **2. Sync job** | `web/jobs/sync.ts` (`runAnalyticsSync`) wired as a DO job in `app.yml`; **Facebook + YouTube + DEV.to** adapters | DO job config (no env/secret changes) |
| **3. Dashboard** | `getAnalytics` + real `AnalyticsView` (overview + drill-down) over the three live providers | Panda classes |
| **4. Instagram** | persist `media_id` (done in P1) + IG adapter | scope `instagram_business_manage_insights` |
| **5. LinkedIn** | LI adapter (`memberCreatorPostAnalytics`) | scope/product `r_member_postAnalytics` (request early — long pole) |
| **6. Enhance** | YT watch-time/retention, LI/DEV.to native daily backfill into history | scope `yt-analytics.readonly` |

Phases 1–3 deliver a working dashboard covering **3 of 5 providers with zero new approvals**. The
remaining two light up by adding a scope and flipping their adapter from stub to real — no schema or
UI change. That is exactly the "simple and robust even if some data is unavailable" property the
brief asks for.

---

## 8. New scopes to request (track separately; do **not** block phases 1–3)

Edit `web/lib/app.ts` param strings as each is approved:

- Instagram: add `instagram_business_manage_insights` to `instagramParams.scope`.
- LinkedIn: add `r_member_postAnalytics` to `linkedinParams.scope` (+ LinkedIn product approval).
- YouTube (phase 6): add `https://www.googleapis.com/auth/yt-analytics.readonly` to `youtubeParams.scope`.

Facebook and DEV.to need nothing new.

---

## 9. File-change checklist

| File | Change | Phase |
|---|---|---|
| `web/init.sql` | add `published_posts`, `post_metrics`; migrate + drop `posts` | 1 |
| `web/lib/db.ts` | add `PublishedPosts`,`PostMetrics`; drop `Posts` (via `sync-sql-kysely`) | 1 |
| `web/provider/instagram.ts` | `upload()` returns `media_id` | 1 |
| `web/server/post.ts` | write `published_posts` w/ `account_id`+`provider_post_id`; capture DEV.to `id` | 1 |
| `web/provider/youtube.ts` | export `refreshedToken` for the analytics adapter to reuse | 2 |
| `web/provider/analytics/{types,facebook,youtube,devto}.ts` | contract + fetchers (FB/YT/DEV.to live) | 2 |
| `web/provider/analytics/{instagram,linkedin}.ts` | stubs returning an empty map | 2 |
| `web/jobs/sync.ts` | `runAnalyticsSync` orchestration + `import.meta.main` entrypoint | 2 |
| `Dockerfile.job` | bun image with full source for the job (web image is a Next standalone build) | 2 |
| `web/app.yml` | add `analytics-sync` DO job component (`/Dockerfile.job`, `kind: POST_DEPLOY`) | 2 |
| `web/server/analytics.ts` | `getAnalytics` aggregation | 3 |
| `web/app/dash/[port]/page.tsx` | fetch + thread `analytics` | 3 |
| `web/component/Dashboard.tsx` | forward `analytics` prop | 3 |
| `web/component/AnalyticsView.tsx` | overview + drill-down UI | 3 |
| `web/css/style.css.ts` | metric-card / chart / leaderboard classes | 3 |
| `web/lib/app.ts` | add analytics scopes | 4–6 |

---

## 10. Risks & notes

- **No staging** — `main` auto-deploys to production. Land schema via `sync-pg`'s `migration.sql`,
  review it, and keep the `published_posts` migration backward-compatible (it's a superset of
  `posts`).
- **`pg`/`kysely`** must stay in `serverExternalPackages` (`next.config.ts`) — unchanged, just don't
  regress it.
- **Metric-name drift** (Meta's impressions→views, IG v21 changes) — normalise at the adapter
  boundary so the schema/UI stay stable; keep raw provider payloads in `extra` for forensics.
- **Rate limits / windows** — the 90-day-hot / older-cold cadence in §5.2 keeps us inside Facebook's
  90-day query window and avoids hammering APIs; daily snapshots accrue the history those APIs don't
  retain.
- **LinkedIn list/backfill is impossible** on our consumer tier (`posts.md` §2) — LinkedIn stays
  app-publish-only; that's fine, its row still gets metrics once `r_member_postAnalytics` lands.
