# Tracking published posts — research & schema proposal

> Research requested in `todo.yml` (web): the current `posts` table tracks only the
> **local** post id and one URL per `(user, post, provider)`. It cannot tell *which
> account* a post was published to when a user has several accounts on the same
> provider, and it never records the **provider's own** id for the published item.
> This document surveys what each provider returns, identifies the gaps, and
> proposes a replacement schema.

## 1. Today's schema and why it falls short

```sql
create table posts (
  user_id   int references users(user_id) on delete cascade,
  post_id   varchar(16) not null,   -- our local content hash (from the CLI)
  provider  int not null,           -- app-level Platform enum (1..5)
  post_date timestamp default current_timestamp,
  post_url  varchar(1000) not null,
  primary key (user_id, post_id, provider)
);
```

Three concrete problems:

1. **No provider post id.** We only keep the local hash and a rendered URL. The
   provider's native id (LinkedIn URN, IG media id, YouTube video id, FB post id,
   DEV.to article id) is never stored — even though every posting path already has
   it in hand. Without it we cannot later fetch analytics, edit/delete a post,
   reconcile against the provider, or de-duplicate a synced post against one we
   published. This is the join key the new **Analytics** tab will need.

2. **Multiple accounts per provider collide.** The primary key is
   `(user_id, post_id, provider)` with no account column. But four of the five
   providers are inherently multi-account:

   | Provider  | Account dimension (table / column)            | Multi-account? |
   |-----------|-----------------------------------------------|----------------|
   | LinkedIn  | `linkedin.author_urn` (one row per user today) | 1:1 today, but model it anyway |
   | Facebook  | `facebook.page_id`                             | **Yes** — many pages |
   | Instagram | `instagram.instagram_account_id`               | **Yes** — many accounts |
   | YouTube   | `youtube.channel_id`                           | **Yes** — many channels |
   | DEV.to    | `devto.devto_user_id` (one row per user today) | 1:1 today |

   Publishing the same asset to two Facebook pages or two YouTube channels hits
   the unique constraint. The current code papers over this with
   `onConflict(...).doUpdateSet({ post_url })` in `postToFacebook` /
   `postToYoutube` (`web/server/post.ts`) — i.e. the second account **overwrites**
   the first, silently losing the record of the earlier post.

3. **`media_id` / article id are fetched and then thrown away.** See §2 — the data
   we need already flows through the code; we just don't persist it.

## 2. What each provider gives us

For each provider: the **account** key, the **post id** it returns, where that id
already appears in our code, and whether the provider lets us **list a user's
existing posts** (needed for the "track all posts, not just app-published" goal).

### LinkedIn  (`lib/linkedin.ts`, `postToLinkedin`)
- **Account:** `author_urn` (`urn:li:person:…`).
- **Post id:** the UGC post URN, returned in the **`X-RestLi-Id`** response header
  of `POST /v2/ugcPosts` (e.g. `urn:li:share:…` / `urn:li:ugcPost:…`). We capture
  it as `urn` and embed it in `post_url = .../feed/update/{urn}` — so it's
  recoverable, but it should be a first-class column.
- **List existing posts:** ❌ **Not available** on our tier. The consumer *Share on
  LinkedIn* product (`w_member_social`) is **create-only**; the docs describe only
  `POST` and return only the `X-RestLi-Id`. Reading/listing a member's posts
  requires the **Community Management / Marketing** partner APIs (separate review &
  approval). **Conclusion: we cannot backfill historical LinkedIn posts** — we can
  only record what we publish ourselves.

### Facebook  (`postToFacebook`)
- **Account:** `page_id`.
- **Post id:** depends on asset type —
  - text → `/{page_id}/feed` returns `{id: "{pageId}_{postId}"}`
  - image → `/{page_id}/photos` returns `{id, post_id?}` (we already prefer `post_id`)
  - video → resumable upload returns `video_id`
  We parse all of these to build `post_url`, then discard the id.
- **List existing posts:** ✅ `GET /{page_id}/published_posts` (needs
  `pages_read_engagement`). Page-level, so a sync is feasible.

### Instagram  (`provider/instagram.ts`, `postToInstagram`)
- **Account:** `instagram_account_id`.
- **Post id:** the **`media_id`** returned by `…/media_publish`
  (`PublishResponse.id`). We use it once to fetch the permalink and then **drop
  it** — easy win to persist. (`instagram_containers` tracks the transient
  `creation_id`, not the final media id.)
- **List existing posts:** ✅ `GET /{ig_id}/media`. Sync feasible.

### YouTube  (`provider/youtube.ts`, `postToYoutube`)
- **Account:** `channel_id`.
- **Post id:** the **video id** (`UploadResponse.id`); `post_url =
  watch?v={id}`.
- **List existing posts:** ✅ the channel's *uploads* playlist
  (`channels.list?part=contentDetails` → `playlistItems.list`). Sync feasible.

### DEV.to  (`postToDevto`)
- **Account:** `devto_user_id` (one per user).
- **Post id:** `POST /api/articles` returns `{id, slug, url, …}`; we parse **only
  `url`** and discard `id`/`slug`.
- **List existing posts:** ✅ `GET /api/articles/me` (paginated, 30/page;
  `…/me/all` also includes view counts). Sync feasible.

### Summary table

| Provider  | `account_id` source        | `provider_post_id` source                         | Captured today? | Backfill all posts? |
|-----------|----------------------------|---------------------------------------------------|-----------------|---------------------|
| LinkedIn  | `author_urn`               | `X-RestLi-Id` URN                                 | only inside URL | ❌ consumer tier is create-only |
| Facebook  | `page_id`                  | `{page}_{post}` / `post_id` / `video_id`          | parsed, dropped | ✅ `/published_posts` |
| Instagram | `instagram_account_id`     | `media_publish` → `media_id`                       | dropped         | ✅ `/{ig}/media` |
| YouTube   | `channel_id`               | video id                                          | only inside URL | ✅ uploads playlist |
| DEV.to    | `devto_user_id`            | article `id` (+ `slug`)                            | dropped         | ✅ `/api/articles/me` |

## 3. Proposed schema

Replace `posts` with an account-aware, provider-id-aware table. One row per
**published item** (a post on a specific account), not per local asset.

```sql
create table if not exists published_posts (
  id               bigserial primary key,

  user_id          int  not null references users(user_id) on delete cascade,

  -- which provider, and which account on that provider
  provider         int  not null,            -- app-level Platform enum
  account_id       varchar(100) not null,    -- author_urn / page_id / instagram_account_id / channel_id / devto_user_id

  -- the provider's own id for the published item
  provider_post_id varchar(200) not null,    -- URN / fb post id / ig media id / yt video id / devto article id

  -- our local content hash; NULL for posts discovered via sync (not published by us)
  local_post_id    varchar(16),

  origin           int  not null default 1,  -- 1 = published by this app, 2 = discovered via provider sync

  post_url         varchar(1000) not null,
  post_date        timestamp not null default current_timestamp,  -- provider publish time when known
  synced_at        timestamp,                                     -- last time we reconciled this row from the provider

  -- a published item is uniquely identified by provider + account + provider id;
  -- this is stable across re-syncs and lets app-publish + later sync converge.
  unique (user_id, provider, account_id, provider_post_id)
);

-- fast "did we already publish local asset X to this account?" lookups
create index if not exists published_posts_local_idx
  on published_posts (user_id, provider, account_id, local_post_id);
```

Why this shape:

- **`account_id`** fixes problem #2: the same asset can go to many pages/channels,
  each its own row. It joins back to the per-provider tables via
  `(user_id, account_id)`. (Use `author_urn` for LinkedIn and `devto_user_id` for
  DEV.to even though they're 1:1 today — it future-proofs multi-account and keeps
  the table uniform.)
- **`provider_post_id`** fixes problems #1 and #3: a stable handle for analytics,
  edit/delete, reconciliation, and de-duplication. The unique constraint is built
  on it, so a post we published and later re-discover via sync collapses to one row.
- **`local_post_id` nullable + `origin`** satisfies the "track *all* posts, not just
  app-published" requirement: synced posts simply have `local_post_id = NULL` and
  `origin = 2`. App publishes set both. An `upsert` keyed on the unique constraint
  lets a sync enrich an app-published row (and vice-versa) without duplicating.
- Drop `post_url` from the key — it's derived data, not identity. Keep it as a
  convenience column (LinkedIn/YouTube can even reconstruct it from the id).

### Kysely change (`web/lib/db.ts`)

```ts
interface PublishedPosts {
  id: Generated<number>
  user_id: number
  provider: number
  account_id: string
  provider_post_id: string
  local_post_id: string | null
  origin: number
  post_url: string
  post_date: Generated<Date>
  synced_at: Date | null
}
// …and rename `posts` → `published_posts` in interface DB
```

## 4. Recommendation & rollout

1. **Adopt the schema in §3.** It is a superset of today's data, so it cleanly
   supports both the immediate need (correct multi-account tracking + provider ids
   for the Analytics tab) and the optional sync.
2. **Capture the ids we already drop today** (IG `media_id`, DEV.to article `id`,
   FB `video_id`, the LinkedIn URN) and write them to `provider_post_id`. This is a
   small change in `web/server/post.ts` and `provider/instagram.ts`; pass
   `account_id` through on every write (it's already available at each call site).
3. **Sync ("all posts") is opt-in and per-provider.** It's feasible for Facebook,
   Instagram, YouTube and DEV.to via their list endpoints (above); **not** for
   LinkedIn on our current tier. Recommend deferring the sync to a follow-up and
   gating it per provider, so LinkedIn simply stays app-publish-only.

### Migration sketch (handled via the `sync-pg` flow, not run here)

```sql
-- new table per §3, then carry existing rows over:
insert into published_posts (user_id, provider, account_id, provider_post_id,
                             local_post_id, origin, post_url, post_date)
select user_id, provider,
       ''        as account_id,        -- unknown for historical rows
       post_url  as provider_post_id,  -- placeholder id; URL is the only stable handle we kept
       post_id   as local_post_id,
       1         as origin,
       post_url, post_date
from posts;
-- then drop table posts;
```

(Historical rows can't recover the true `account_id`/`provider_post_id`; the
URL-as-id placeholder keeps them unique and visible until they age out.)
