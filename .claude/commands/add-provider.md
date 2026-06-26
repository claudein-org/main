---
description: Add a new OAuth social provider (route, DB table, env var, settings, menu button, docs)
allowed-tools: [Read, Edit, Write, Bash]
---

# Add a new OAuth provider

Ask the user for:
- **Provider name** (e.g. `twitter`, `tiktok`) — used as the route slug and identifier
- **Brand color** (hex) — for the connect button
- **OAuth authorization URL**
- **Token exchange URL**
- **User-info API call** (to get the account/channel/user ID to store)
- **Scopes** needed
- **Whether a refresh token is needed** (e.g. YouTube needs one; most don't)
- **Client ID** (or placeholder if not yet registered)
- **Client secret env var name** (e.g. `TWITTER_CLIENT_SECRET`)

If any of the above are unknown, use a placeholder and note it.

---

## Steps

### 1. DB table — `web/init.sql`

Add a `CREATE TABLE IF NOT EXISTS <provider>` block before the `posts` table:

```sql
create table if not exists <provider> (
    user_id int primary key references users(user_id) on delete cascade,
    access_token varchar(1000) not null,
    -- add refresh_token varchar(1000) not null here if needed
    expires_at int not null,
    <provider>_account_id varchar(100) not null   -- rename to match what the API returns
);
```

### 2. Migration — `migration.sql`

Overwrite `migration.sql` with a dated migration that creates the new table (same SQL as above, dated today).

### 3. Kysely types — `web/lib/db.ts`

Add a new interface inside the `namespace db { … }` block and add it to `DB`:

```ts
interface <Provider> {
    user_id: number
    access_token: string
    // refresh_token: string   if needed
    expires_at: number
    <provider>_account_id: string
}

export interface DB {
    // …existing…
    <provider>: <Provider>
}
```

### 4. Client ID — `web/lib/settings.ts`

```ts
export const <PROVIDER>_CLIENT_ID = '<actual-id-or-YOUR_<PROVIDER>_CLIENT_ID>'
```

### 5. Client secret — `web/lib/env.ts`

Add to the `Env` zod schema and to the `DUMMY` object:

```ts
<PROVIDER>_CLIENT_SECRET: z.string(),
```

```ts
<PROVIDER>_CLIENT_SECRET: "",
```

### 6. Redirect URI support — `web/lib/auth.ts`

Extend the provider union:

```ts
export function getRedirectUri(provider: '…' | '<provider>') {
```

### 7. Auth URL — `web/lib/app.ts`

Import the new client ID from `settings`. Build a `URLSearchParams` object and add to `app`:

```ts
import { …, <PROVIDER>_CLIENT_ID } from "./settings"

const <provider>Params = new URLSearchParams({
    response_type: "code",
    client_id: <PROVIDER>_CLIENT_ID,
    redirect_uri: auth.getRedirectUri('<provider>'),
    scope: "<scopes>",
    // access_type: "offline", prompt: "consent"  if refresh token needed
})

export const app = {
    // …existing…
    <provider>: `<auth-url>?${<provider>Params}`,
}
```

### 8. Links — `common/links.ts`

Add to the `auth` object:

```ts
auth: {
    // …existing…
    <provider>: `/auth/<provider>`,
},
```

### 9. OAuth callback route — `web/app/auth/<provider>/route.ts`

Create the file. Follow the pattern of existing routes (`linkedin`, `facebook`, `instagram`):

```ts
import { app } from '@/lib/app'
import { auth } from '@/lib/auth'
import { cook } from '@/lib/cookie'
import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { <PROVIDER>_CLIENT_ID } from '@/lib/settings'
import assert from 'assert'
import ky from 'ky'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import z from 'zod'

const Token = z.object({
  access_token: z.string(),
  // refresh_token: z.string(),  if needed
  expires_in: z.number().int(),
})

export async function GET(request: NextRequest) {
  const { user_id } = await cook.get()
  assert(user_id, 'User not authenticated')

  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  if (error || !code) redirect('/?error=auth_failed')

  const redirectUri = auth.getRedirectUri('<provider>')

  // Exchange code for token
  // …ky call to token URL…

  // Fetch account ID
  // …ky call to user-info URL…

  await db
    .insertInto('<provider>')
    .values({ user_id, access_token, expires_at, <provider>_account_id })
    .onConflict((oc) =>
      oc.column('user_id').doUpdateSet({ access_token, expires_at, <provider>_account_id }),
    )
    .execute()

  redirect(app.close)
}
```

### 10. Brand color — `web/panda.config.ts`

Add to `theme.extend.tokens.colors`:

```ts
<provider>: { value: "<hex>" },
```

### 11. Button variant — `web/css/style.css.ts`

Add to `btn` cva variants:

```ts
<provider>: { background: "<provider>" },
```

### 12. Provider file — `web/provider/<provider>.ts`

Create the file. It must export a `getStatus(user_id: number)` function that:
1. Queries the DB for the user's token row
2. Checks if the token is valid (`expires_at > now`)
3. If the provider supports token refresh and the token is expired (or expiring soon), refreshes it and updates the DB
4. Returns `{ connected: boolean }` (or `{ expires_at: number | undefined }` for providers like LinkedIn where the Poster needs the raw expiry for client-side rendering)

```ts
import { db } from '@/lib/db'
// import ky, z, env, settings if refresh is needed

export async function getStatus(user_id: number) {
    const now = Math.floor(Date.now() / 1000)
    const row = await db
        .selectFrom('<provider>')
        .select(['access_token', 'expires_at' /*, 'refresh_token' if applicable */])
        .where('user_id', '=', user_id)
        .executeTakeFirst()

    if (!row) return { connected: false }
    if (row.expires_at <= now) {
        // If refreshable: try refresh, update DB, return { connected: true }
        // If not refreshable: return { connected: false }
        return { connected: false }
    }

    return { connected: true }
}
```

**Refresh patterns by provider type:**
- **No refresh** (LinkedIn, Facebook): return `{ connected: false }` when expired
- **Long-lived token refresh** (Instagram): refresh proactively if `expires_at - now < SEVEN_DAYS`
- **Short-lived + refresh_token** (YouTube/Google): refresh whenever `expires_at - now < FIVE_MINUTES`

### 13. Connection menu — `web/app/post/[port]/page.tsx`

Import the new provider and call `getStatus` inside `Promise.all`. Pass the result as `<provider>Connected` to `<Poster>`:

```ts
import * as <provider> from "@/provider/<provider>"

const [/* …existing… */, <provider>Status] = await Promise.all([
    // …existing…
    <provider>.getStatus(user_id),
    // …
])
// pass: <provider>Connected={<provider>Status.connected}
```

### 14. Poster component — `web/component/Poster.tsx`

- Add `<provider>Connected: boolean` to `Props` and destructure it
- Add `'<provider>'` to `ServiceRowProps.color` union
- Add a `<ServiceRow>` entry in the menu:

```tsx
<ServiceRow name="<ProviderName>" connected={<provider>Connected} href={app.<provider>} color="<provider>" />
```

### 15. Type-check

Run `bunx tsc --noEmit` and fix any errors before finishing.

### 16. Documentation — `authentication.md`

Add a new `## <ProviderName>` section following the same structure as existing providers:

- Purpose
- Route
- Flow (numbered steps)
- Database schema
- Token refresh notes if applicable
- How to register (step-by-step console instructions)

Add the new env vars to the environment variables table at the bottom.
