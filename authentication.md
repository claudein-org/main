# Authentication

This document describes the OAuth authentication flow for every provider integrated in claudein.org, along with instructions for registering the app and enabling each provider.

---

## Overview

Authentication is split into two layers:

1. **Identity layer (Google)** — establishes who the user is. Google login creates or finds a `users` row and sets a signed `user_id` cookie.
2. **Social connection layer (LinkedIn, Facebook, Instagram)** — attaches an access token to the authenticated user so the CLI can post on their behalf. These routes all require a valid `user_id` cookie.

The full flow for a new user:

```
CLI opens browser → user logs in via Google → user connects LinkedIn/Facebook/Instagram
→ /close page signals CLI → CLI downloads token via /api/token
```

---

## Google

**Purpose:** Identity provider. Logs the user in and establishes their `user_id`.

**Route:** `GET /auth/google/`

**Flow:**

1. User is redirected to `https://accounts.google.com/o/oauth2/v2/auth` with scopes `openid email`.
2. Google redirects to `/auth/google/?code=...`.
3. The route POSTs the code to `https://oauth2.googleapis.com/token` to get an access token.
4. It calls `https://www.googleapis.com/oauth2/v2/userinfo` to get the user's email.
5. The email is upserted into the `users` table.
6. A signed `user_id` cookie is set and the user is redirected to `/close`.

**Database:** `users(user_id, email)`

### How to register

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project (or select an existing one).
3. Navigate to **APIs & Services → OAuth consent screen**.
   - Choose **External** user type.
   - Fill in app name, support email, and developer contact.
   - Add scope: `openid`, `email`, `profile`.
4. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**.
   - Add authorized redirect URIs:
     - `https://claudein.org/auth/google/` (production)
     - `https://localhost:3000/auth/google/` (local dev)
5. Copy the **Client ID** into `web/lib/settings.ts` as `GOOGLE_CLIENT_ID`.
6. Copy the **Client Secret** into your `.env` as `GOOGLE_CLIENT_SECRET`.

---

## LinkedIn

**Purpose:** Social connection. Grants the CLI permission to post on LinkedIn on the user's behalf.

**Route:** `GET /auth/linkedin/`

**Flow:**

1. User (already logged in via Google) is redirected to `https://www.linkedin.com/oauth/v2/authorization` with scopes `openid profile w_member_social`.
2. LinkedIn redirects to `/auth/linkedin/?code=...`.
3. The route POSTs the code to `https://www.linkedin.com/oauth/v2/accessToken`.
4. It calls `https://api.linkedin.com/v2/userinfo` to get the user's LinkedIn URN (`sub` field).
5. The access token and URN are upserted into the `linkedin` table keyed by `user_id`.
6. The user is redirected to `/close`.

**Database:** `linkedin(user_id, access_token, expires_at, author_urn)`

### How to register

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/).
2. Click **Create app**.
   - App name: `claudein`
   - LinkedIn page: your company or personal page
   - App logo: required
3. Under **Auth**, add OAuth 2.0 redirect URLs:
   - `https://claudein.org/auth/linkedin/`
   - `https://localhost:3000/auth/linkedin/`
4. Under **Products**, request access to:
   - **Sign In with LinkedIn using OpenID Connect** (for `openid`, `profile`)
   - **Share on LinkedIn** (for `w_member_social`)
5. Copy the **Client ID** into `web/lib/settings.ts` as `LINKEDIN_CLIENT_ID`.
6. Copy the **Client Secret** into your `.env` as `LINKEDIN_CLIENT_SECRET`.

---

## Facebook

**Purpose:** Social connection. Grants the CLI permission to manage and post to Facebook Pages.

**Route:** `GET /auth/facebook/`

**Flow:**

1. User (already logged in via Google) is redirected to `https://www.facebook.com/v21.0/dialog/oauth` with scopes `email,public_profile,pages_manage_posts,pages_show_list,pages_read_engagement`.
2. Facebook redirects to `/auth/facebook/?code=...`.
3. The route GETs `https://graph.facebook.com/v21.0/oauth/access_token` with the code to exchange for a User Access Token.
4. It calls `https://graph.facebook.com/me?fields=id` to get the Facebook User ID.
5. The access token and user ID are upserted into the `facebook` table keyed by `user_id`.
6. The user is redirected to `/close`.

**Database:** `facebook(user_id, access_token, expires_at, facebook_user_id)`

> **Note:** Facebook User Access Tokens expire (typically in 60 days). For long-lived use, exchange the short-lived token for a long-lived one via `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token`.

### How to register

1. Go to [Meta for Developers](https://developers.facebook.com/).
2. Click **My Apps → Create App**.
   - Use case: **Other → Business**.
   - App name: `claudein`
3. Under **App settings → Basic**:
   - Add a **Privacy Policy URL** (required for review).
   - Note your **App ID** and **App Secret**.
4. Under **Products**, add **Facebook Login**.
   - Under **Facebook Login → Settings**, add Valid OAuth Redirect URIs:
     - `https://claudein.org/auth/facebook/`
     - `https://localhost:3000/auth/facebook/`
5. Under **Permissions and Features**, request:
   - `pages_manage_posts`
   - `pages_show_list`
   - `pages_read_engagement`
   - (These require App Review for public use; for personal/testing use, add test users under **Roles**.)
6. Copy the **App ID** into `web/lib/settings.ts` as `META_APP_ID`.
7. Copy the **App Secret** into your `.env` as `META_CLIENT_SECRET`.

---

## Instagram

**Purpose:** Social connection. Grants the CLI permission to post to an Instagram Business or Creator account.

**Route:** `GET /auth/instagram/`

> **Important:** Instagram has its own dedicated **Instagram Business Login** API with a separate app ID and secret from the Facebook app. This is different from the deprecated Basic Display API (shut down Dec 2024) and from Facebook Login. The scopes use the `instagram_business_*` prefix.

**Flow:**

1. User (already logged in via Google) is redirected to `https://www.instagram.com/oauth/authorize` with scopes `instagram_business_basic,instagram_business_content_publish`.
2. Instagram redirects to `/auth/instagram/?code=...`.
3. The route POSTs the code to `https://api.instagram.com/oauth/access_token` to get a short-lived User Token (valid 1 hour).
4. It exchanges the short-lived token for a long-lived token (60 days) via `https://graph.instagram.com/access_token?grant_type=ig_exchange_token`.
5. It calls `https://graph.instagram.com/v21.0/me?fields=id` to get the Instagram account ID.
6. The long-lived token and account ID are upserted into the `instagram` table keyed by `user_id`.
7. The user is redirected to `/close`.

**Database:** `instagram(user_id, access_token, expires_at, instagram_account_id)`

> **Token refresh:** Long-lived tokens last 60 days and can be refreshed via `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=...` before they expire.

### How to register

Instagram Business Login requires its own app, separate from the Facebook app.

1. Go to [Meta for Developers](https://developers.facebook.com/) and create a **new app** (or use the same Meta app and add Instagram as a product).
   - When setting up use cases, select **"Manage messaging & content on Instagram"**.
2. Under the Instagram product settings, note the separate **Instagram App ID** and **Instagram App Secret**.
3. Add permissions:
   - `instagram_business_basic` (required)
   - `instagram_business_content_publish` (for posting)
4. Under **Instagram → Instagram Business Login → Set up**, add OAuth redirect URIs:
   - `https://claudein.org/auth/instagram/`
   - `https://localhost:3000/auth/instagram/`
5. For testing, add your Instagram account as an **Instagram Tester** under **Roles**.
6. Copy the **Instagram App ID** into `web/lib/settings.ts` as `INSTAGRAM_APP_ID`.
7. Copy the **Instagram App Secret** into your `.env` as `INSTAGRAM_CLIENT_SECRET`.

---

## YouTube

**Purpose:** Social connection. Grants the CLI permission to upload videos to the user's YouTube channel.

**Route:** `GET /auth/youtube/`

> **Note:** YouTube uses Google's OAuth system but is registered as a **separate OAuth client** in Google Cloud Console to isolate the `youtube.upload` scope from the identity login flow. It returns both an access token (short-lived, 1 hour) and a refresh token (long-lived) so uploads can happen at any time.

**Flow:**

1. User (already logged in via Google) is redirected to `https://accounts.google.com/o/oauth2/v2/auth` with scope `https://www.googleapis.com/auth/youtube.upload`, `access_type=offline`, and `prompt=consent`.
2. Google redirects to `/auth/youtube/?code=...`.
3. The route POSTs the code to `https://oauth2.googleapis.com/token` to exchange for an access token + refresh token.
4. It calls `https://www.googleapis.com/youtube/v3/channels?part=id&mine=true` to get the user's YouTube channel ID.
5. Both tokens, the expiry, and the channel ID are upserted into the `youtube` table keyed by `user_id`.
6. The user is redirected to `/close`.

**Database:** `youtube(user_id, access_token, refresh_token, expires_at, channel_id)`

> **Token refresh:** Access tokens expire after 1 hour. Use the stored `refresh_token` to get a new one via `POST https://oauth2.googleapis.com/token` with `grant_type=refresh_token`. The refresh token does not expire unless the user revokes access.
>
> **`prompt=consent`** in the auth URL is required to force Google to return a refresh token on every authorization. Without it, Google only returns a refresh token the first time.

### How to register

YouTube reuses the **same Google OAuth client** as Google Login — no separate client needed.

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and select your project.
2. Navigate to **APIs & Services → Library**, search for **YouTube Data API v3**, and enable it.
3. Navigate to the existing **OAuth client** used for Google Login (**Credentials → claudein** or similar) and add the redirect URI:
   - `https://claudein.org/auth/youtube/`
   - `https://localhost:3000/auth/youtube/`
4. Navigate to **Data Access (OAuth consent screen) → Add or remove scopes**, search for `youtube.upload`, and add `https://www.googleapis.com/auth/youtube.upload`.
   - In the **"How will the scopes be used?"** justification field, explain that the scope is used solely to upload videos to the developer's own YouTube channel from the CLI, and that no third-party user data is accessed.
   - This scope is sensitive and requires Google verification for public apps. For personal/testing use, add your Google account as a test user under **Audience → Test users**.
5. No new credentials are needed — `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are reused for the YouTube flow.

---

## Dev.to

**Purpose:** Social connection. Grants the CLI permission to publish articles to the user's dev.to account.

**Route:** `GET /auth/devto/` (renders a form) + a Server Action that handles the submission.

> **Important:** dev.to (Forem) has **no OAuth flow** for publishing. The API authenticates with a **static personal API key** that the user generates themselves and passes in the `api-key` header. There is no authorization URL, code exchange, client ID/secret, or token expiry — so instead of an OAuth redirect, `/auth/devto` shows a form where the user pastes their key.

**Flow:**

1. User (already logged in via Google) clicks **Connect** next to dev.to, which opens `/auth/devto`.
2. The page shows a form prompting for the user's dev.to API key (generated at dev.to → Settings → Extensions).
3. On submit, the Server Action calls `GET https://dev.to/api/users/me` with the `api-key` header to validate the key and read the dev.to user id.
4. If the key is invalid, the action redirects back to `/auth/devto?error=invalid_key` and the form shows an error.
5. If valid, the API key and dev.to user id are upserted into the `devto` table keyed by `user_id`.
6. The user is redirected to `/close`.

**Database:** `devto(user_id, api_key, devto_user_id)`

> **Token refresh:** None. dev.to API keys do not expire, so `getStatus` just checks whether a key is on file. A key only stops working if the user revokes it in their dev.to settings.

### How to register

There is no app to register — each user supplies their own personal API key.

1. Sign in to [dev.to](https://dev.to/).
2. Go to **[Settings → Extensions](https://dev.to/settings/extensions)** and scroll to **DEV Community API Keys**.
3. Enter a project name (e.g. `claudein`) and click **Generate API Key**.
4. Copy the generated key and paste it into the connect form at `/auth/devto`.

No environment variables or `settings.ts` entries are required for dev.to.

---

## Environment Variables

| Variable | Provider | Description |
|---|---|---|
| `GOOGLE_CLIENT_ID` | Google | OAuth client ID (in `settings.ts`) |
| `GOOGLE_CLIENT_SECRET` | Google | OAuth client secret |
| `LINKEDIN_CLIENT_ID` | LinkedIn | OAuth client ID (in `settings.ts`) |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn | OAuth client secret |
| `META_APP_ID` | Facebook | Meta/Facebook App ID (in `settings.ts`) |
| `META_CLIENT_SECRET` | Facebook | Meta/Facebook App secret |
| `INSTAGRAM_APP_ID` | Instagram | Instagram Business Login App ID (in `settings.ts`) |
| `INSTAGRAM_CLIENT_SECRET` | Instagram | Instagram Business Login App secret |
| *(reuses `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`)* | YouTube | No separate credentials — same Google OAuth client |
| *(none — per-user API key stored in the `devto` table)* | Dev.to | No app credentials; each user supplies their own personal API key |
| `COOKIE_SECRET` | All | HMAC secret for signing `user_id` cookies |

All secrets are validated at startup by `web/lib/env.ts` via Zod. Never use `process.env` directly — always import `env` from `@/lib/env`.
