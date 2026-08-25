# HANDOFF — Mission Fragrances app (state as of 2026-08-21)

Context summary for any new session (cloud or local) picking up this project.

## What this is

Mobile-first web app (PWA) for Mission Fragrances — turns the Honor / Courage /
Commitment fragrances into a behavior system. Core loop: pick a Scent Trigger →
declare one real-world action (a **Mission**) → apply the fragrance (S.T.A.R.
ritual: Select · Take Action · Anchor · Repeat) → do it → record it. Completed
action = 1 Rep per trigger. A 30-day in-app course (one lesson/day, sequential)
runs alongside; completing a lesson = 1 Course Rep. After Day 30 the app becomes
a permanent Mission Log. No streaks, no points, no failure states.

- Owner: Antonio Centeno (product decisions). Team contact: Yuri.
- Repo: https://github.com/aiexecutionaccelerator/mfapp (branch `main`)
- Version: Beta 0.5 (`0.5.0-beta`)

## Stack & infrastructure

- Next.js 16 (App Router, Turbopack) + TypeScript strict + Tailwind v4.
  `npm run dev` / `npm run lint` / `npm run build`. `src/middleware.ts` handles
  auth redirects (Next deprecation notice about `proxy` is known/harmless).
- **Supabase** project `vrhjzqaxksdthkeiwxrk` (us-east-2): email-OTP auth
  (6–10 digit code; custom SMTP via Brevo-configured Supabase settings),
  Postgres with RLS, Edge Functions. Migrations `supabase/migrations/0001–0006`
  are ALL applied to the live DB (profiles, missions, get_app_data RPC, push
  tables, course_progress, lesson_responses, admin-notification triggers).
- **Edge Functions deployed**: `send-reminders` (Web Push, fired by pg_cron
  every minute) and `notify-admin` (emails antonio@missionfragrances.com on
  onboarding completion and on 30/30 lessons, via Resend from
  noreply@realmenrealstyle.com). Secrets set: VAPID keys, CRON_SECRET,
  NOTIFY_SECRET, NOTIFY_FROM, RESEND_API_KEY.
- **Demo mode**: with empty `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` the app runs
  fully client-side in localStorage (used for all automated verification).
- Deploy: Netlify (env vars documented in README; `NEXT_PUBLIC_DEV_TOOLS=false`
  in prod; `netlify.toml` skips secrets-scan on the Next build cache). A
  Cloudflare/OpenNext config + Supabase keep-alive Worker also exist
  (`wrangler.jsonc`, `workers/keepalive/`).
- Commerce: Shop page links to the live Shopify product page
  https://www.missionfragrances.com/products/mission-fragrances-set at **$595**
  (no Storefront API in use; `api/shopify/checkout` kept but unused).

## App structure (5 tabs: Start · Log · Course · Progress · Settings)

- Onboarding: 2 screens (name + goal, then start). Full name collected (feeds
  admin-email subjects).
- Home: Day badge, active-Mission banner, NEXT UP lesson row, "What do you need
  today?" 3 trigger cards, compact 4-rep row.
- Mission flow: Declare (WRITE YOUR OWN first + 3 suggestions per trigger, plus
  up to 3 from that day's lesson) → Trigger screen (briefing + Anchor line) →
  Active (**"Phone down. Go do it." + a Stoic quote** — 150-quote library in
  `src/content/stoicQuotes.ts`, deterministic per Mission, cinematic fade-in) →
  Check-in ("Not yet" → TRY AGAIN only; no End Mission) → Completion (Rep #n).
- Course: 30 lessons in `src/content/course.ts` (full text in Antonio's voice,
  1–2 paragraphs each, unlisted-YouTube embeds, reflection prompts autosaved to
  `lesson_responses`). Sequential unlock; NEXT LESSON disabled until complete.
  Days 12–18 + 26 answers compile into the printable **Vivid Vision** page
  (`/course/vivid-vision`) with print/mailto/.ics/share.
- Buy rows at the bottom of Course/Log/Progress (hidden during active Mission).
- Web Push reminders (Android + installed-PWA iOS; in-app banner fallback).
- Legal pages `/privacy` `/terms`; account deletion via service-role API route.

## Key docs (in `docs/`)

BUILD_SPEC.md (design system + screens, updated), COURSE_V2_SPEC.md,
COURSE_QC.md (lesson-by-lesson audit + Skool source decisions), SIMPLIFY_SPEC.md,
PUSH_SPEC.md, COURSE_EXPORT.md (full course text for GPT review; also a Google
Doc shared with Antonio), course-source/*.json (raw Skool/Academy pulls),
screenshots/ (verification captures per pass).

## Open items

- Antonio's GPT-based course-content review may produce copy edits → apply to
  `src/content/course.ts` (single source of truth for lesson copy).
- Shopify product page shows "Sold out" — inventory is the store's issue.
- Vivid Vision AI image + user summary emails: discussed, not built (needs spec).
- Certificate on Day-30 completion: manual fulfillment (flag in profiles).
- Verify Netlify deploy has NEXT_PUBLIC_VAPID_PUBLIC_KEY set and CRON_SECRET
  removed; custom domain app.missionfragrances.com pending DNS.
- Secrets/credentials live outside the repo (.env.local, Supabase function
  secrets, password manager). DB password is NOT in the repo.

## Working conventions

- All user-facing copy lives in `src/content/*` — edit there, not in screens.
- Every pass so far: lint + tsc + `next build` clean, then a scripted
  demo-mode walkthrough in headless Chromium (Playwright) with screenshots
  committed under `docs/screenshots/`. Keep that bar.
- Commit style: short imperative subject; Co-Authored-By Claude trailer.
