# HANDOFF — Mission Fragrances app (state as of 2026-10-28, curriculum revision 2)

Context summary for any new session (cloud or local) picking up this project.

## What this is

Mobile-first web app (PWA) for Mission Fragrances — turns the Honor / Courage /
Commitment fragrances into a behavior system. V2 ("Your 30-Day Mission", spec
in `docs/V2_PLAN.md`) replaced the day-locked course: **thirty always-unlocked
Missions**, opened in any order, where reading completes nothing — a Mission is
complete only when a real-world action is logged as a **Proof** (S.T.A.R.:
Select · Trigger · Act · Record). Since v2.0.0 that takes **one input and one
click**: the Mission screen is why-it-matters, the recommended fragrance, one
field, one button, and submitting it writes the Proof and completes the
Mission. There is no declare step and no in-progress state. One-off Actions
use the same shape and log Proofs too, but never inflate the 30/30 count. No streaks, no locks, no failure
states. The Vivid Vision is archived; its replacement is the compiled, printable
**Personal Code** (`/personal-code`).

- Owner: Antonio Centeno (product decisions). Team contact: Yuri.
- Repo: https://github.com/aiexecutionaccelerator/mfapp (branch `main`)
- Version: 3.1.0 (curriculum revision 2 + motion pass). Migration 0009 was
  applied to production Supabase on 2026-10-28, then this went to `main`.
  Staging: branch `main-cig2ix` → https://main-cig2ix--missionfragrances.netlify.app

## Motion and effects (v3.1.0)

All in `src/app/globals.css` (one place) plus `src/components/motion/`:
film grain + drifting gold light behind everything (body::before/::after),
page entrance via `app/(app)/template.tsx`, staggered lists (`.stagger`),
S.T.A.R. steps that light their letter and fill the rail on scroll
(`useInView`), engraved headline reveal, animated disclosures, count-ups,
the completion medal, the 30-segment `MissionTrack`, card lift/press, the
tab bar's gold indicator. Everything honours prefers-reduced-motion. Never
leave a transform/filter on a wrapper at rest: it traps `position: fixed`.

## Curriculum revision 2 (v3.0.0) — read this first

Spec: `docs/specs/curriculum-v2-summary.md` (full text alongside). Review
report: `docs/specs/review-report.md`. Results: `docs/specs/acceptance-results.md`.
Where this section and older notes below disagree, this section wins.

- **Content**: `src/content/missions.ts` holds the spec's exact wording for all
  30 (stage, kind, time, hook, select, action, 3 choices, prompt, 2 examples,
  done-when, note). `npm run check:copy` diffs it against the spec text.
  The first curriculum is archived read-only in `src/content/missions-v1.ts`;
  records with `curriculum_version` 1 keep showing it.
- **Record kinds**: action (20) · reflection (6) · code (8–13) · plan (21, 27,
  30). Only actions (and One-Off Actions) count as actions; all 30 count
  toward x/30. The server derives the kind (`mission_kind()`).
- **Rules** live in `src/lib/curriculum.ts` (client and demo backend) and in
  `missions_validate()` in migration 0009 (server). Keep them in step.
  Prerequisites: 14/29 need code lines 8–12; 22–25 need a revised 21 with a
  focus area and aim; 28 needs a prior action. Plans 27/30 need a frequency
  and a future review date. Actions need "I have taken this action."
- **Drafts** (`mission_drafts`) are separate from records and never count.
  Completed records freeze their context snapshot, wording version and
  completion date; edits bump `updated_at` and are guarded against
  overwriting another tab (`ConflictError`).
- **Remove/restore** replaces delete: `removed_at` soft-removes; the record,
  its words and date stay.
- **Mission screen**: `src/components/mission/MissionForm.tsx` (the S.T.A.R.
  form) inside `src/app/(app)/missions/[number]/page.tsx` (states: unfinished,
  saved, legacy, removed, just saved).
- **Tests**: `npm run test:db` (migrations on PGlite, 36 checks) and
  `scripts/acceptance.mjs` (26 spec scenarios in demo mode) and
  `scripts/walkthrough.mjs` (screenshots).
- **Release order**: apply `0009_curriculum_v2.sql` to Supabase BEFORE the
  v3 app goes live; the v3 app expects its columns. Rollback:
  `0009_down.sql` (keeps all data) + redeploy the previous app.

## Architecture facts that matter

- **The `missions` table is the unified Proof log.** A structured Mission's
  state IS its row: `mission_number` 1–30 set, `status` completed = proof
  logged, no row = not started. `active` is legacy only — rows left open by
  the pre-2.0 declare-then-record flow; nothing creates them any more, and
  `store.logProof({ existingId })` closes one if a man still has it. A DB partial unique index
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

## App structure (tabs: Missions · Log · Progress · Settings)

There is no Start tab. Logging is one click inside the Mission, so the app
opens on the Missions themselves; `/home` redirects to `/missions`.

- `/onboarding`: profile setup (name + "I am becoming a man who…", pre-filled)
  then three How It Works screens — (1) More Than Cologne, video open,
  (2) How Olfactory Conditioning Works: the four S.T.A.R. cards and the
  demonstration video, (3) Meet Your Scent Triggers in the sales page's own
  words, ending in `START MISSION 1`. Settings → "How It Works: The S.T.A.R.
  System" replays them opening on screen 2. Onboarding no longer asks about the set (Settings owns
  set status). Replay at `/how-it-works` (Settings).
- `/missions` list: NEXT card first, two more under WHAT'S NEXT, one
  `SHOW ALL 30 MISSIONS` toggle, one `ONE-OFF ACTION` row at the bottom.
  Statuses are Complete and Not Started — nothing else.
- `/missions/[number]` — ONE reusable template: `MISSION N` + title, the why
  in Antonio's voice, optional collapsed video, the FragranceCue shelf (all
  three bottles, the recommended one picked up and lit, one tap to wear a
  different one — the gold dot always marks what the Mission suggests), one
  field, one button. Submitting calls
  `store.logProof` once; for the Personal Code Missions (m8–m13, m30) the same
  sentence is also written to `lesson_responses`, which is what keeps
  `/personal-code` compiling. Missions 7 and 19 also take an optional photo.
- `/action/declare`: a one-off Action — three value pills, one field, one
  button. `/action/active/[id]` only exists to close a legacy `active` row.
- `/log`: Proof Log. One entry is one sentence (`reflection ?? action_text`);
  legacy rows that carried two show the declared half separately. One button,
  "Edit or delete this entry"; deleting removes the row, so the Mission simply
  reads Not Started again.
- `/progress`: the ring counts every Proof, and the Honor / Courage /
  Commitment tiles count **all** completed rows (`stats.proofs`), Missions
  included — using `stats.freeform` there was the Oct-21 bug where a Courage
  Mission left Courage reading 0.
- `/course*` and `/home` redirect to `/missions`; `/mission/*` → `/action/*`.

### Writing a Mission

Curriculum revision 2 replaced the old rules here (60-second actions, "I
commit to" prefixes, tap-to-use examples, word limits). Mission copy is now
Antonio's spec, verbatim; change it in the spec first, then in
`src/content/missions.ts`, as a whole Mission at a time, and run
`npm run check:copy`. Examples are inspiration only and never fill the
field; only Mission 13 opens pre-filled (his identity statement).

### Sharing (Settings → Share)

- **Share the app** — the device share sheet with the main URL
  (`SHARE_URL`, from `NEXT_PUBLIC_APP_URL`, else app.missionfragrances.com);
  copies the link where there is no share sheet.
- **Share on social** → `/share`, link first: the URL with Copy, "Share the
  link" (device share sheet), prefilled links for Messages, WhatsApp,
  Facebook, X, LinkedIn and Email, then the square image with "Share the image". Instagram can't be
  prefilled from the web, so it copies the caption and shares or saves the image.
- **Save as an app on your phone** — the same `SaveAsApp` sheet as Check Your Email.
- The images are generated at build time by `src/lib/shareCard.tsx` (next/og):
  `/share-card.png` (1080×1080) and `opengraph-image` / `twitter-image`
  (1200×630, the preview when the link is pasted anywhere). Copy lives in
  `SHARE_TEXT` (`src/lib/share.ts`).

### Tap budget (the UX metric)

Every screen state is counted with a Playwright census of in-page tap targets
(`main button, main a[href], main [role=radio], main [role=switch]`). The V2
rebuild shipped at 178 across 28 screens; the simplification passes took it to
94, and one-input-one-click to **61 across 19 screens**. A Mission screen is
2: the back arrow and the button that completes it. Rules worth keeping: one
action per card (never a card-shaped link wrapping a button), a visible input
instead of a button that reveals one, no duplicate entry point for the same
action on two screens, and no screen whose only job is to confirm the screen
before it.

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

- **Unconfirmed, waiting on Antonio / Yuri:**
  - Shopify's compare-at price. The app shows ~~$597~~ $297 · YOU SAVE $300
    (confirmed). The Shopify product page needs the same $597 compare-at
    price set in Shopify admin to strike it through there too — that can't
    be done from this repo.

## Working conventions

- All user-facing copy lives in `src/content/*` — edit there, not in screens.
- Never add a per-Mission component — `missions.ts` drives the one template.
- Commit style: short imperative subject; Co-Authored-By Claude trailer.
