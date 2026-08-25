# V2 Implementation Plan — "Your 30-Day Mission" rebuild

Source spec: `Mission_Fragrances_Web_App_V2.md` (Antonio/Kai, 2026-08). This plan
maps every spec requirement onto the existing codebase. It is an incremental
rebuild — auth, visual system, free-form Mission flow, log, and data layer are
preserved.

## 0. Architectural decisions (read first)

These choices drive everything below.

**D1 — The `missions` table becomes the unified Proof log.**
Every proof (structured or free-form) is one row in the existing `missions`
table. We add a nullable `mission_number` (1–30). A structured Mission's user
state IS its mission row:

| Spec state    | Representation                                      |
| ------------- | --------------------------------------------------- |
| `not_started` | no row with that `mission_number`                   |
| `in_progress` | row with `mission_number`, `status = 'active'`      |
| `completed`   | row with `mission_number`, `status = 'completed'`   |

This gives us for free: one proof entry per completion, the merged Mission Log,
correct trigger Proof counts (existing logic), and the spec's delete-revert rule
(deleting the proof row deletes the state; if we keep the row and null the
completion fields it reverts to in-progress). `missionsCompleted = count of
distinct mission_number where completed`, enforced by a partial unique index so
a structured Mission can never count twice. Repeat actions on the same theme are
logged free-form (`mission_number = null`) exactly as the spec requires.
The legacy `ended` status is retired (no End Mission exists in the UI already).

**D2 — Mission content is one typed TS file, `src/content/missions.ts`.**
Replaces `course.ts` as the driver. All 30 definitions from spec §10:
`{ number, slug, title, idea, recommendedTrigger | null ("user chooses"),
question, actions | actionsByTrigger {quick,standard,bold}, exampleAnswers?,
proofPrompt, photoEncouraged?, youtubeId | null, videoLabel? }`.
Old videos are mapped per spec §11's table; anything marked Archive gets
`youtubeId: null`. `course.ts`, `challengeLessons.ts`, `challenge.ts`,
`missionBriefings.ts` (day-based parts) are archived, not deleted — moved to
`src/content/archive/` (kept out of the bundle) so old data stays readable.

**D3 — Question answers reuse the `lesson_responses` table.**
New prompt-id scheme `m<number>:q`. Autosave behavior, RLS, and the backend
methods already exist. Old `lesson-id`-keyed rows remain untouched (archived
in place). The Personal Code compiles live from these answers + profile — it is
generated, not stored (per spec §9).

**D4 — Routes.** The structured experience lives at `/missions` (list) and
`/missions/[number]` (detail — one reusable template, never 30 pages). The
existing `/mission/*` screens remain the free-form flow launched from Start.
The old `(app)/course` routes are removed; `/course` and `/course/[id]`
redirect to `/missions`. `course/vivid-vision` is removed (content archived).
New pages: `/personal-code`, `/how-it-works` (replays onboarding),
`/using-your-set` (technical fragrance content, sourced from `product.ts` +
the old Set Overview lesson). `/shop` survives but is only linked from
Settings when `owns_set = false`.

**D5 — Mission Detail is one stateful template.** The full spec §7 flow
(idea → optional collapsed video → recommended trigger with change control →
one question → Quick/Standard/Bold/Write-my-own → DECLARE MY ACTION → S.T.A.R.
sheet → I'M GOING TO DO IT → in-progress "YOUR ACTION" + I DID IT →
RECORD THE EVIDENCE form → confirmation) happens inside `/missions/[number]`.
It does not bounce through the free-form flow screens. Shared pieces (S.T.A.R.
sheet, completion form, confirmation) are extracted into components also used
by the free-form flow, so both paths produce identical proof rows.

**D6 — Photos.** New Supabase Storage bucket `proofs` (private, per-user path
RLS) + `photo_url` on missions. Demo mode stores a downscaled data-URL in
localStorage (capped ~200KB) so the walkthrough can exercise it. Optional
everywhere; never required.

**D7 — Analytics.** New `analytics_events` table (user_id, name, props jsonb,
created_at; insert-only RLS) + `src/lib/analytics.ts` with a `track(name,
props)` fire-and-forget helper (console no-op in demo). All §12 events wired.
No third-party SDK.

**D8 — Data safety.** All current accounts are internal beta (per HANDOFF).
Before migrating: snapshot-export `profiles`, `missions`, `course_progress`,
`lesson_responses` into `archive_*` tables inside the same DB (plus a local
CSV dump committed nowhere, kept as session artifact). Old course completions
are NOT converted into Proofs (spec §13). Existing mission rows (real logged
actions) are preserved untouched — they simply appear as free-form proofs.

## 1. Database migration `0007_v2_missions.sql`

- `profiles`: add `identity_statement text`, `owns_set boolean default true`,
  `set_status text check in ('ordered','arrived') default 'arrived'`,
  `reminder_time time null`. Keep-but-deprecate `primary_goal`,
  `challenge_start_date` (no reads after this change).
- `missions`: add `mission_number int null check (1..30)`,
  `question_answer text null`, `photo_url text null`. Rename nothing
  (`action_text` = declared action, `reflection` = completed action /
  "what did you do"; document the mapping in `types.ts`).
- Partial unique index: `unique (user_id, mission_number) where
  mission_number is not null` — one state row per structured Mission
  (covers both in-progress and completed; prevents double-complete AND
  double-declare races).
- Archive tables: `create table archive_course_progress as select …` (same for
  the old-scheme lesson_responses view of the data — copy, don't move).
- Replace the 0006 admin-notify trigger condition: fires on the 30th distinct
  completed `mission_number` instead of 30 `course_progress` rows.
- `analytics_events` table (D7).
- Storage bucket `proofs` + RLS policies (separate `supabase/migrations`
  storage statement or dashboard step — note in README).
- Update `get_app_data` RPC to return the new profile fields and mission
  columns.

`types.ts` changes: `Profile` gains `identity_statement`, `owns_set`,
`set_status`, `reminder_time`; `Mission` gains `mission_number`,
`question_answer`, `photo_url`; `MissionStatus` documents `ended` as legacy.
`DataBackend` gains: `declareStructuredMission(number, {...})`,
`updateMission(id, patch)` (edit action/answer/proof/photo),
`deleteMission(id)` (proof delete w/ revert semantics), `uploadProofPhoto`,
and drops course methods from the active interface (kept on an `ArchiveData`
sub-interface only where old data must be read). Both `local.ts` and
`supabase.ts` implement; `store.ts` cache follows.

## 2. Phase-by-phase build order

Each phase = one commit, lint + tsc + build clean, pushed in order. Phases 1–3
are the foundation; UI phases 4–10 follow spec §14.

### Phase 1 — Safety & audit (no user-visible change)
- Backup script + `archive_*` tables (D8). Verify against live DB.
- Add `docs/V2_PLAN.md` (this file). Screenshot the 8 current screens into
  `docs/screenshots/v2-before/` as the current-state reference.

### Phase 2 — Data model
- Migration 0007 (+ storage bucket), types, both backends, store, stats.
- `stats.ts` rewrite: `honorProofs / courageProofs / commitmentProofs /
  totalProofs / missionsCompleted (distinct structured) / actionsInProgress`.
  Delete RepKey "course". Keep `repNumberFor` renamed `proofNumberFor`.
- `analytics.ts` + table.

### Phase 3 — Mission content
- Write `src/content/missions.ts`: all 30 Missions verbatim from spec §10
  (titles, ideas, questions, Quick/Standard/Bold actions — per-trigger maps for
  Missions 1 and 6, example lists for 6/8/9/10/11, photo-encouraged flags for
  7/19, Mission 30 completion copy). Video mapping per §11.
- Archive old content files to `src/content/archive/`.
- Update `actionSuggestions.ts` / `triggers.ts` copy: behavior descriptors
  ("Integrity · Responsibility · Respect", etc.), S.T.A.R. = Select / Trigger /
  Act / Record.

### Phase 4 — Onboarding & profile setup
- `/welcome` → profile setup per spec Screen 2: name + "OVER THE NEXT 30 DAYS,
  I AM BECOMING A MAN WHO…" multiline field with 5 tap-to-fill examples →
  saves `identity_statement`. Goal categories removed from UI.
- `/onboarding` → four screens (More Than Fragrance / Meet Your Scent
  Triggers / S.T.A.R. / Begin) with dot progress, optional video links (never
  blocking), final "IS YOUR SET WITH YOU NOW?" setting `set_status` and
  routing (Yes → Mission 1; Not yet → `/missions`). Replay mode via
  `?replay=1` (read-only: no status writes, exit back to Settings).
- Auth routing: returning users never re-enter onboarding (existing
  `onboarding_completed` logic kept).

### Phase 5 — Mission list `/missions`
- Heading "YOUR 30-DAY MISSION", intro copy, progress line
  "X of 30 Missions completed · Y proofs logged".
- Continue card (in-progress → lowest incomplete → complete state).
- Flat 1–30 card list: number, title, recommended trigger, status
  (Not Started / gold IN PROGRESS / gold ✓ COMPLETE), video indicator, arrow.
  No modules, no locks, no day labels, no durations.
- `/course*` redirects.

### Phase 6 — Mission Detail `/missions/[number]` (the big one)
- One template component implementing spec §7 "Mission Detail" items 1–11,
  driven by `missions.ts` + the user's mission row.
- Declaration creates the structured mission row (in_progress); persists
  across refresh (it's a DB/localStorage row).
- Edit action / abandon-with-confirmation in the in-progress state
  (abandon deletes the row → not_started, decrements nothing since nothing
  was counted).
- Completion form (required "WHAT DID YOU DO?", optional photo) →
  LOG THE PROOF → dynamic confirmation ("Proof logged. You acted with
  Courage.") → CONTINUE TO THE NEXT MISSION / VIEW MY MISSION LOG.
- Double-submit protection (button disabled while in flight + DB unique
  index as backstop).
- Extract shared `StarSheet`, `ProofForm`, `ProofConfirmation` components;
  refit the free-form `/mission/*` flow onto them (S.T.A.R. wording update,
  "LOG THE PROOF" language). Keep the Stoic quote block in the free-form
  active screen (not in spec, not forbidden; existing beloved feature —
  flag to Antonio for a yes/no).

### Phase 7 — Start screen (`/home`)
- Dynamic top status card, states A–D exactly per spec (set-on-the-way /
  next Mission / action in progress with I DID IT / 30-complete).
- "MY SET HAS ARRIVED" button on state A (sets `set_status`, analytics).
- Fragrance cards get behavior-descriptor lines; free-form flow unchanged.
- `RepCounts` → `ProofCounts`: Honor / Courage / Commitment / Total. No
  Course entry. Remove BuyRow.

### Phase 8 — Mission Log (`/log`)
- Subtitle "Every action you log is evidence of the man you are becoming." +
  "N proofs logged". Empty state "NO PROOF YET." / "START A MISSION".
- Filters unchanged (All/Honor/Courage/Commitment), horizontally scrollable
  on narrow screens.
- Card: trigger, "MISSION N · TITLE" or "PERSONAL MISSION", declared,
  completed, date, photo thumbnail.
- `/log/[id]`: edit (declared action, proof text, photo) and delete with
  confirmation. Delete of a structured proof reverts state per spec §8
  (keep row minus completion fields → in_progress if declared action
  remains, else delete row → not_started) and all counts recompute from
  rows (no counters to desync).

### Phase 9 — Progress (`/progress`)
- Ring: `N/30 MISSIONS COMPLETE` (no day number anywhere).
- Cards: Honor/Courage/Commitment Proofs, Total Proofs, Missions Completed
  (N/30), Actions In Progress.
- Promise card: after `m12:q` answered → "THE PROMISE I AM KEEPING" + answer +
  VIEW MY PERSONAL CODE; before → "Define the promise that matters most in
  Mission 12."
- Mission-30 completion state with the two CTAs.
- `/personal-code`: one printable page compiled from `identity_statement` +
  answers m8 (Honor means) / m9 (Courage) / m10 (Commitment) / m11
  (non-negotiable) / m12 (promise) / m30 (next 30-day commitment), inline
  editable (edits write back to the same responses), browser print CSS.
  Linked from Progress, Mission 14, Mission 29, and the completion states.

### Phase 10 — Settings & help
- Profile: name, email, editable "THE MAN I AM BECOMING" (identity statement).
- Notifications: rename to "Daily Mission Reminder" + supporting copy +
  non-guilt reminder text; add time selector wired to `reminder_time` only if
  the existing `send-reminders` function can honor it with a small change —
  otherwise ship the toggle rename now and leave time-selection as a noted
  follow-up (spec explicitly allows this).
- Mission Fragrances section: How It Works (onboarding replay), Using Your
  Set (new page), My Set Status (Ordered/Arrived control), Get Mission
  Fragrances (only when `owns_set = false` → /shop).
- Keep legal, support, sign out, delete account, version.

### Phase 11 — Terminology sweep & acceptance pass
- Repo-wide grep for user-facing `Course|Lesson|Module|Rep\b|Day \d|Vivid
  Vision|lock` — fix all user-visible strings incl. metadata titles, push
  copy, `completionLines.ts`, admin-notification email copy, README.
- Walk spec §15 acceptance criteria as a checklist; walk §17 "do not do".

### Phase 12 — QA & verification
- Playwright demo-mode walkthrough covering all 20 §16 scenarios that exist
  in demo (set-status states, out-of-order Mission 10, declare→refresh→
  complete, trigger change, custom action, photo, free-form, edit, delete/
  revert, 30/30 completion, post-30 logging, mobile+desktop widths).
  Screenshots to `docs/screenshots/v2/`.
- Double-submit and failed-submission (offline) behavior checks.
- lint + tsc + `next build` clean. Update HANDOFF.md and README.

## 3. Deliberate deviations / judgment calls (flag to Antonio)

1. **Stoic quotes** on the free-form active screen: kept (recently built and
   loved). Say the word and they go.
2. **`ended` missions**: legacy rows keep their status but are hidden from
   proof counts (already excluded — only `completed` counts).
3. **Reminder time selector**: shipped only if the existing push function
   honors it cheaply; otherwise follow-up (spec-sanctioned).
4. **ownsSet default true**: the app is currently purchaser-only (login via
   OTP from the purchase). If a non-purchaser path appears later, flip the
   default and the Settings purchase row activates automatically.
5. **Old lesson answers** are not migrated into Personal Code fields — the
   new Missions ask better-scoped questions; old answers stay archived.

## 4. Risk register

- **Supabase migration on live DB**: mitigated by Phase 1 archives + additive-
  only DDL (no drops, no renames).
- **Unique-index collisions from legacy data**: pre-check query before index
  creation (should be none — mission_number is new).
- **Photo upload in demo mode**: size-capped data URLs; if flaky, demo hides
  the photo control (real backend unaffected).
- **Old deep links** (`/course/...`): permanent redirects.
- **Admin-notify trigger rewrite**: test with a seeded 29→30 completion in a
  scratch schema before applying.
