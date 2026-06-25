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

**Purpose:** Social connection. Grants the CLI permission to post to an Instagram Business or Creator account via the Instagram Graph API.

**Route:** `GET /auth/instagram/`

> **Important:** The Instagram Basic Display API was shut down in December 2024. Posting to Instagram now requires the **Instagram Graph API**, which is accessed via **Facebook Login** (not a separate Instagram login). The user must have an Instagram Business or Creator account connected to a Facebook Page.

**Flow:**

1. User (already logged in via Google) is redirected to `https://www.facebook.com/v21.0/dialog/oauth` with scopes `instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement`.
2. Facebook redirects to `/auth/instagram/?code=...`.
3. The route GETs `https://graph.facebook.com/v21.0/oauth/access_token` to exchange the code for a User Access Token.
4. It calls `https://graph.facebook.com/v21.0/me/accounts?fields=id,instagram_business_account` to list the user's Facebook Pages and find the connected Instagram Business Account ID.
5. The access token and Instagram account ID are upserted into the `instagram` table keyed by `user_id`.
6. The user is redirected to `/close`.

**Database:** `instagram(user_id, access_token, expires_at, instagram_account_id)`

> **Prerequisite for the end user:** Their Instagram account must be a **Business** or **Creator** account, and it must be connected to a Facebook Page. This is done in the Instagram app under **Settings → Account → Switch to Professional Account** and then linking a Facebook Page.

### How to register

Instagram uses the **same Meta App** as Facebook. No separate app registration is needed.

1. In your existing Meta App (see Facebook section above), add the **Instagram** product under **Products**.
2. Under **Instagram → Basic Display** (legacy) is not needed — use **Instagram Graph API** instead.
3. Under **App Review → Permissions and Features**, request:
   - `instagram_basic`
   - `instagram_content_publish`
   - (These require App Review for public use; for personal/testing use, add Instagram test users under **Roles → Instagram Testers**.)
4. Ensure the redirect URI `https://claudein.org/auth/instagram/` (and localhost) is added under **Facebook Login → Settings → Valid OAuth Redirect URIs** — the same entry used for Facebook is sufficient since both providers share the Meta App.
5. The `META_APP_ID` and `META_CLIENT_SECRET` env vars (set during Facebook registration) are reused — no additional credentials needed.

---

## Environment Variables

| Variable | Provider | Description |
|---|---|---|
| `GOOGLE_CLIENT_ID` | Google | OAuth client ID (in `settings.ts`) |
| `GOOGLE_CLIENT_SECRET` | Google | OAuth client secret |
| `LINKEDIN_CLIENT_ID` | LinkedIn | OAuth client ID (in `settings.ts`) |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn | OAuth client secret |
| `META_APP_ID` | Facebook + Instagram | Meta App ID (in `settings.ts`) |
| `META_CLIENT_SECRET` | Facebook + Instagram | Meta App secret |
| `COOKIE_SECRET` | All | HMAC secret for signing `user_id` cookies |

All secrets are validated at startup by `web/lib/env.ts` via Zod. Never use `process.env` directly — always import `env` from `@/lib/env`.
