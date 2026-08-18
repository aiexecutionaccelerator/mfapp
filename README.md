# Mission — V1 web app

Mobile-first PWA for Mission Fragrances. It turns HONOR, COURAGE and COMMITMENT
into a behavior trigger system: **SELECT → TRIGGER → ACT → REINFORCE**. A Rep is
only counted when a Mission's status becomes `completed` — never for spraying,
starting or reading.

The full product spec is `docs/BUILD_SPEC.md`.

## Stack

- Next.js (App Router) + TypeScript (strict) + Tailwind CSS v4
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`) — email OTP auth, Postgres, RLS
- Shopify Storefront API (`cartCreate` → `checkoutUrl`), no SDK
- `date-fns`, `lucide-react`, `clsx`. No state library.

## Local setup

```bash
npm install
npm run dev          # http://localhost:3000
```

With no `.env.local` the app boots straight into **demo mode**.

## Environment variables

Copy `.env.example` to `.env.local` (which is gitignored) and fill in what you
have:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. Empty ⇒ demo mode. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key. Empty ⇒ demo mode. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only.** Used solely by `POST /api/account/delete`. Never expose it to the client. |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | e.g. `mission-fragrances.myshopify.com` |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` | Client-safe Storefront token |
| `NEXT_PUBLIC_SHOPIFY_MISSION_VARIANT_ID` | `gid://shopify/ProductVariant/…` |
| `NEXT_PUBLIC_APP_URL` | Public app URL |
| `NEXT_PUBLIC_DEV_TOOLS` | `true` shows the hidden Developer section in Settings |

## Demo mode

If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing or
empty, the app runs entirely on the device:

- a fake `demo-user` is used — no sign-in screen gating; Welcome shows **ENTER DEMO**
- profile and Missions persist in `localStorage` (`mission.profile`, `mission.missions`)
- a thin gold pill at the top of every screen reads `DEMO MODE — data stored on this device`
- Delete Account clears `localStorage`
- Demo mode never activates when the Supabase env vars are present

Both backends implement the same `DataBackend` interface (`src/lib/data/`), so
screens never know which one is active.

If the Shopify variables are missing, `/shop` still renders its static copy and
the CTA is disabled with the note "Checkout not configured".

## Supabase setup

See `supabase/README.md` for the full walkthrough:

1. Create a project → copy URL + anon key into `.env.local`.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor, or `supabase db push`.
3. Authentication → Email Templates → **Magic Link** → include `{{ .Token }}` so a
   6-digit code is emailed instead of a link.
4. Put the service-role key in the server-side environment only (Vercel project
   env, not `NEXT_PUBLIC_*`).

## Shopify setup

1. Shopify admin → Settings → Apps and sales channels → **Develop apps** → create
   an app.
2. Configure **Storefront API** scopes:
   `unauthenticated_read_product_listings`, `unauthenticated_write_checkouts`,
   `unauthenticated_read_checkouts`.
3. Install the app and copy the **Storefront API access token**.
4. Find the variant GID: Products → the Mission system product → the variant URL
   ends in a numeric id; the GID is `gid://shopify/ProductVariant/<that id>`.
   (Or query `productByHandle { variants(first:1) { nodes { id } } }`.)
5. Set `NEXT_PUBLIC_SHOPIFY_*` and restart the dev server.

The API version used is `2025-01`. `POST /api/shopify/checkout` runs `cartCreate`
and returns `{ checkoutUrl }`; the shop page does a full-page redirect to it.
`GET` on the same route returns best-effort live price/title/availability — the
page falls back to the static `$597` on any error and never blocks render on it.

## Vercel deploy

1. Import the repo into Vercel (framework preset: Next.js).
2. Add every variable from `.env.example` under Project → Settings →
   Environment Variables. `SUPABASE_SERVICE_ROLE_KEY` must **not** be prefixed
   with `NEXT_PUBLIC_`.
3. Add the custom domain (e.g. `app.missionfragrances.com`) and set
   `NEXT_PUBLIC_APP_URL` to it.
4. In Supabase → Authentication → URL Configuration, add the deployed origin to
   the allowed redirect URLs.

## Dev tools flag

With `NEXT_PUBLIC_DEV_TOOLS=true`, Settings shows a **Developer** section with a
challenge-state select: New user / Day 1 / 5 / 10 / 15 / 20 / 25 / 30 /
Post-challenge. Day values write `mission.devDayOverride` to `localStorage`;
"New user" resets onboarding and challenge fields; "Post-challenge" sets
`challenge_completed_at`. The section does not render at all when the flag is
anything other than `"true"`. Safe to set `true` on a Vercel **preview**
environment; keep it `false` in production.

## Two-user RLS test

1. Sign in as user A, complete onboarding, log a Mission.
2. Sign in as user B in a separate browser profile, log a Mission.
3. In the Supabase SQL editor, `select user_id, action_text from public.missions;`
   shows both rows (service role bypasses RLS).
4. In the app, each user's Mission Log shows only their own Mission, and
   `/log/<other user's mission id>` resolves to nothing.

## Acceptance test script

Run in demo mode (no env vars) at a 390×844 viewport.

- **A.** `/` → Welcome renders wordmark, ghost words, `ENTER DEMO`.
- **B.** Onboarding: goal → three triggers → THE LOOP → `START MY MISSION`.
- **C.** Home shows `DAY 1 OF 30`, phase 1 lesson, three trigger cards, commerce card.
- **D.** Courage → "Make the call" → trigger screen shows a Courage briefing →
  `START MISSION` → Mission active.
- **E.** Close × → Home shows the Active Mission banner and hides the commerce card.
- **F.** Check in → `NOT YET` → `TRY AGAIN` → check in → `YES — MISSION COMPLETE`
  + reflection → `COURAGE REP #1 COMPLETE`.
- **G.** Home shows 1 Courage rep; Log lists the entry; the detail shows the
  reflection; Progress shows 1 started / 1 completed.
- **H.** Settings → Developer → Day 30 → Progress shows
  `COMPLETE THE 30-DAY MISSION` → `CONTINUE THE MISSION` → Home shows
  `YOUR MISSION CONTINUES`, Progress shows `BUILD THE EVIDENCE`.
- **I.** Shop renders `$597` with a disabled CTA and "Checkout not configured";
  Settings → Delete Account → Welcome with "Your account has been deleted."

Screenshots of the walkthrough live in `docs/screenshots/`.

## Product art

Drop real art into `public/images/` and it is picked up automatically, no code
change:

- `bottle-honor.png`, `bottle-courage.png`, `bottle-commitment.png`
- `logo.svg`
- `system-black-edition.png`

Until those files exist the app renders its own placeholder silhouettes, crest
and hero panel.

## Known V1 limitations

- **No push reminders.** "Remind me later" stores a time in `localStorage` and
  only surfaces inside the app, on the Home active-Mission banner.
- **Checkout completion is not observed.** No order record is created anywhere and
  the app cannot tell whether a Shopify checkout completed.
- **The certificate is fulfilled manually.** `GET MY CERTIFICATE` sets
  `certificate_requested`; nothing is emailed automatically.
- **Demo mode is device-local.** Clearing site data erases everything, and demo
  data never syncs anywhere.
- No service worker, so there is no offline support.
