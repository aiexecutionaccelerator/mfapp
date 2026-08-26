# HANDOFF — Mission Fragrances app (state as of 2026-08-25, V2)

Context summary for any new session (cloud or local) picking up this project.

## What this is

Mobile-first web app (PWA) for Mission Fragrances — turns the Honor / Courage /
Commitment fragrances into a behavior system. V2 ("Your 30-Day Mission", spec
in `docs/V2_PLAN.md`) replaced the day-locked course: **thirty always-unlocked
Missions**, opened in any order, where reading completes nothing — a Mission is
complete only when a real-world action is logged as a **Proof** (S.T.A.R.:
Select · Trigger · Act · Record). Free-form actions from the Start tab log
Proofs too but never inflate the 30/30 count. No streaks, no locks, no failure
states. The Vivid Vision is archived; its replacement is the compiled, printable
**Personal Code** (`/personal-code`).

- Owner: Antonio Centeno (product decisions). Team contact: Yuri.
- Repo: https://github.com/aiexecutionaccelerator/mfapp (branch `main`)
- Version: 1.0.0 (out of beta)

## Architecture facts that matter

- **The `missions` table is the unified Proof log.** A structured Mission's
  state IS its row: `mission_number` 1–30 set, `status` active = in progress,
  completed = proof logged; no row = not started. A DB partial unique index
  (`user_id, mission_number`) makes double-declare/complete impossible. All
  stats are computed from rows (`src/lib/stats.ts`) — no stored counters.
- **Mission content** lives in `src/content/missions.ts` (all 30, verbatim from
  the V2 spec; old videos mapped where they fit). Old course content is
  archived at `src/content/archive/` and in `archive_*` DB tables.
- **Question answers** reuse the `lesson_responses` table with ids
  `lesson_id='m<number>'`, `prompt_id='q'`. The Personal Code compiles live
  from m8/m9/m10/m11/m12/m30 + the profile's `identity_statement` — never
  stored as its own record (`src/lib/personalCode.ts`).
- **Proof photos** are on-device-downscaled data URLs stored on the mission row
  (RLS-private, demo-identical, no Storage bucket). Cap 500k chars.
- **Profile** gained `identity_statement`, `owns_set` (default true),
  `set_status` ('ordered'|'arrived'). Day fields (`challenge_start_date` etc.)
  are deprecated in place.
- **Analytics**: `src/lib/analytics.ts` → insert-only `analytics_events`
  table; all spec §12 events wired; no-op in demo.
- Migration `0007_v2_missions.sql` does all of the above + archives + rewrites
  the admin 30/30 notify trigger. It has a `<NOTIFY_SECRET>` placeholder —
  substitute at apply time. **NOT yet applied to the live DB** (apply 0007 when
  deploying V2).

## Stack & infrastructure (unchanged from V1 where not noted)

- Next.js 16 (App Router) + TypeScript strict + Tailwind v4.
  `npm run dev` / `npm run lint` / `npm run build`.
- **Supabase** project `vrhjzqaxksdthkeiwxrk` (us-east-2): email-OTP auth,
  Postgres with RLS, Edge Functions `send-reminders` and `notify-admin`
  (unchanged; 0007 re-points the 30/30 trigger at missions).
- **Demo mode**: empty Supabase env ⇒ fully client-side localStorage.
- Deploy: Netlify (+ Cloudflare/OpenNext config). Custom domain
  app.missionfragrances.com pending DNS.
- Commerce: Shop page → live Shopify product at $595, linked ONLY from
  Settings when `owns_set = false` (purchase banners removed everywhere).

## App structure (tabs: Start · Log · Mission · Progress · Settings)

- `/onboarding`: profile setup (name + "I am becoming a man who…") then four
  How It Works screens ending in "Is your set with you now?". Replay at
  `/how-it-works` (Settings).
- `/missions` list (all 30, statuses, Continue card, set-on-the-way banner) and
  `/missions/[number]` — ONE reusable detail template: idea → optional
  collapsed video → trigger pills → one autosaved question →
  Quick/Standard/Bold/write-my-own → DECLARE → S.T.A.R. sheet → in-progress →
  RECORD THE EVIDENCE (+ optional photo) → confirmation. `?done=1` jumps to
  the proof form (used by Start's I DID IT).
- `/home` Start: dynamic status card (A set-on-the-way / B next Mission /
  C action in progress / D 30/30), three fragrance cards → free-form flow
  (`/mission/declare|trigger|active|checkin|complete`, Stoic quote kept),
  Proof counts strip.
- `/log`: merged Proof log (MISSION N · TITLE vs PERSONAL MISSION), filters,
  edit, delete (structured delete reverts the Mission to in progress).
- `/progress`: N/30 ring, six stat cards, Mission-12 promise card, 30/30
  completion state; `/personal-code` printable + editable in place.
- `/course*` redirects to `/missions`. `/challenge-complete` is gone.

## Verification

Every pass: lint + tsc + `next build` clean, then
`scripts/walkthrough.mjs` (Playwright, demo mode, 390×844 + desktop) —
31 screenshots in `docs/screenshots/v2-rebuild/`. Keep that bar.
Dev tools (`NEXT_PUBLIC_DEV_TOOLS=true`): reset-to-new-user and
seed-Missions-1–29 helpers in Settings.

## Open items

- **Apply migration 0007 to the live Supabase DB** before deploying V2 —
  exact steps in `docs/MIGRATION_0007_RUNBOOK.md`. All accounts are internal
  beta; 0007 archives old data in-place, nothing is dropped.
- Reminder **time selector** (spec allows deferral) — the toggle is renamed
  "Daily Mission Reminder"; a chosen-time daily reminder needs a small
  `send-reminders` extension.
- Old per-Mission "Remind me later" push flow still exists on the free-form
  active screen only.
- Certificate on 30/30: manual fulfillment (admin email fires at the 30th
  structured Proof).
- Verify Netlify env (`NEXT_PUBLIC_VAPID_PUBLIC_KEY` set, `CRON_SECRET`
  removed); custom domain pending DNS.
- Secrets live outside the repo (.env.local, Supabase function secrets).

## Working conventions

- All user-facing copy lives in `src/content/*` — edit there, not in screens.
- Never add a per-Mission component — `missions.ts` drives the one template.
- Commit style: short imperative subject; Co-Authored-By Claude trailer.
