# Going Public — Provider Approval Checklist

`authentication.md` documents how each OAuth app was *registered* (client IDs, redirect URIs, scopes). This document covers the separate step of getting each app *approved for public use* — every provider below currently defaults new apps to a "testing/development" mode where only accounts you've explicitly added (as testers/roles) can complete the OAuth flow. Until each app is approved, `claudein.org` only works for you and whoever you've added as a tester.

All of these are manual actions taken in the provider's dashboard/console — nothing in the codebase changes. Prerequisites shared by more than one provider:

- **Privacy Policy** — live at `https://claudein.org/privacy.txt`. Google, Meta, and LinkedIn all require a reachable privacy policy URL before review.
- **Terms of Service** — does **not** exist yet. Meta's App Review form and Google's verification form both have an optional-but-recommended Terms URL field, and some Facebook permissions require it. Add a `/terms.txt` (mirroring `/privacy.txt`) before submitting those reviews.
- **Demo video** — Meta (Facebook + Instagram) and Google's sensitive-scope review both require a short screen recording showing the exact OAuth flow and how the requested data/permission is used. Budget time to record one per provider.

---

## 1. Google (Login + YouTube)

**Why it's gated:** the OAuth consent screen is in **Testing** mode by default, capped at 100 test users, and any *sensitive* or *restricted* scope (like `youtube.upload`) triggers Google's verification review before it can be used by arbitrary users.

Steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → your project → **APIs & Services → OAuth consent screen**.
2. Under **Audience**, confirm **Publishing status**. Click **Publish App** to move from Testing → In Production.
   - `openid`, `email`, `profile` are non-sensitive scopes — publishing alone is enough for the Google Login flow to open to the public, no review needed.
3. For **YouTube**, the `https://www.googleapis.com/auth/youtube.upload` scope is **restricted**, which requires a full verification submission even after publishing:
   - Under **Audience → Verification**, click **Prepare for verification**.
   - Fill in: app homepage (`https://claudein.org`), privacy policy URL, and an **authorized domain** (`claudein.org` — verify ownership via [Google Search Console](https://search.google.com/search-console) if not already done).
   - Provide the scope justification: explain that `youtube.upload` is used only to publish videos to the *authenticated user's own* channel, initiated directly by that user from the CLI/dashboard — no automated or background uploads.
   - Record and attach the **demo video**: show signing in, connecting YouTube, and a video being uploaded via claudein.
   - Submit for review. Google's turnaround for restricted-scope verification is typically **2–6 weeks**, and they frequently come back with follow-up questions — check the email tied to the developer support contact regularly.
   - Optional but recommended if you plan real usage volume: request a **quota increase** for the YouTube Data API v3 under **APIs & Services → YouTube Data API v3 → Quotas**, since the default daily quota is low and uploads are quota-expensive.

---

## 2. LinkedIn

**Why it's gated:** newly created LinkedIn apps only get **Sign In with LinkedIn using OpenID Connect** by default. `w_member_social` (posting) requires the **Share on LinkedIn** product, which needs manual approval from LinkedIn — it isn't self-serve.

Steps:

1. Go to your app at [LinkedIn Developers](https://www.linkedin.com/developers/apps) → **Products** tab.
2. Request **Share on LinkedIn** if not already granted. Approval requires the app to have a **verified associated LinkedIn Company Page** — under **Settings**, click **Verify** on the associated page and complete the page-admin verification flow.
3. LinkedIn gates broader API access behind a request form rather than instant approval. There's already a saved form link for this in `todo.yml`:
   - `https://forms.office.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR7Dqh0PdJfxGkDEwKUJVJ9xUOENGMFYwTU01WDZPUjVKQTlQWFZYWkk1ViQlQCN0PWcu`
   - Fill it out describing claudein's use case (CLI tool posting on behalf of the authenticated member to their own profile).
4. Once **Share on LinkedIn** is approved, confirm the app's **Legal Agreement** is accepted (LinkedIn requires re-accepting the API Terms of Use per product added).
5. There is no separate "publish" toggle like Google's — once the product is approved, any LinkedIn member can complete the OAuth flow without being added as a tester.
6. Turnaround is typically **a few business days to ~2 weeks**; LinkedIn may email asking for more detail on the use case.

---

## 3. Facebook (Meta)

**Why it's gated:** new Meta apps run in **Development mode**, where only people with a Role on the app (Admin/Developer/Tester) can authorize it. `pages_manage_posts`, `pages_show_list`, and `pages_read_engagement` are all **Advanced Access** permissions that require **App Review** before the app can switch to Live.

Steps:

1. Go to [Meta for Developers](https://developers.facebook.com/apps/) → your app → **App Review → Permissions and Features**.
2. For each of `pages_manage_posts`, `pages_show_list`, `pages_read_engagement`, click **Request Advanced Access** and provide:
   - A written explanation of how claudein uses the permission (posting to a Page the authenticated user manages, on their explicit action).
   - The **screencast** showing the full flow: login → connect Facebook → select a Page → publish a post via claudein.
3. Complete **Business Verification** under **App settings → Basic** if prompted — Meta increasingly requires a verified Business Manager/Business Portfolio behind apps requesting Page permissions, which involves submitting a legal business name, address, and a document (business registration or similar).
4. Confirm **Privacy Policy URL** and **App Icon** are filled in under **App settings → Basic** — App Review will reject submissions missing either.
5. Once all requested permissions are approved, go to **Settings → Basic** (top of page) and flip the app from **Development** to **Live**.
6. Meta's review turnaround is typically **1–2 weeks**, and first submissions are often rejected once with specific feedback to address and resubmit — expect at least one iteration.

---

## 4. Instagram

**Why it's gated:** this is a **separate Meta app** from Facebook (per `authentication.md`), so it needs its own App Review pass. `instagram_business_content_publish` is Advanced Access; `instagram_business_basic` is often grantable via **Standard Access** without review, but publishing is not.

Steps:

1. Go to the **Instagram app** in [Meta for Developers](https://developers.facebook.com/apps/) → **App Review → Permissions and Features**.
2. Request Advanced Access for `instagram_business_content_publish` (and `instagram_business_basic` if it isn't already Standard Access) with:
   - Use-case explanation: publishing content to the user's own Instagram professional (Business/Creator) account, initiated by the user.
   - A screencast of the connect-and-publish flow, same as Facebook's.
3. This Instagram app likely shares the same **Business Verification** as the Facebook app if both sit under one Business Portfolio — confirm under **App settings → Basic** that verification carries over, or complete it again if this is a distinct Business.
4. Note the account-type constraint: only Instagram **Business or Creator** accounts (not personal accounts) can authorize the app at all — this is a platform limitation, not something App Review changes, so it's worth stating clearly on claudein.org's connect page.
5. Once approved, switch this app to **Live** the same way as the Facebook app (**Settings → Basic** toggle).
6. Expect a similar **1–2 week** review cycle, run in parallel with the Facebook submission if possible since they're independent apps.

---

## 5. Dev.to

**No action needed.** Dev.to has no OAuth app, no review process, and no public/private mode — every user authenticates with their own personal API key pasted into `/auth/devto`. This already works for any user with no approval step.

---

## 6. Infrastructure (for context, not blocking)

These aren't OAuth providers but are part of "making the app available to the public" — both are already effectively public, listed here only to confirm nothing further is needed:

- **npm** (`@claudein.org/cli`) — already published with `publishConfig.access: "public"`; anyone can `npm install -g @claudein.org/cli` today.
- **DigitalOcean App Platform** — `claudein.org` is already the live production domain per `web/app.yml`; no separate "make public" step exists for the hosting side.

---

## Suggested order

Given review lead times, kick these off in parallel rather than sequentially:

1. **Google Login publish** (§1, step 2) — instant, do this first since it's a single click and unblocks the core login flow.
2. **LinkedIn Share on LinkedIn request** (§2) and **Google YouTube verification** (§1, step 3) — start immediately, these have the longest turnaround.
3. **Facebook App Review** and **Instagram App Review** (§3, §4) — can run in parallel with each other once the demo screencasts and Business Verification doc are ready.
