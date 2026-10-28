# Curriculum revision 2: implementation report for review

For Antonio Centeno and Nestor. Implements `curriculum-v2-spec.docx`
(28 Oct 2026) in the production app. Branch `main-cig2ix`, app version
3.0.0. **Not live:** `main` and app.missionfragrances.com are unchanged
until Antonio signs off and migration 0009 is applied.

## 1. What changed

**The 30 Missions.** The spec's exact wording for all 30 Missions:

- stage, value, kind, time, hook, Select line, task
- three approaches, prompt, two examples
- Done when, and the note

`npm run check:copy` compares every field with the spec text and fails on
any difference. Mission numbers are unchanged.

**One shared S.T.A.R. flow.**

- **Select:** the value's reason for this Mission, plus the three bottles.
  The suggested bottle is pre-selected and can be changed.
- **Trigger:** spray, the same line on every Mission.
- **Act:** the task, its time and kind, and "Choose one way to do it"
  (closed by default). Below that: his saved context, any note, and Done when.
- **Record:** the prompt, a blank field in his own words, and "Need an
  example?" (closed by default; it never fills the field). Then the
  Mission's own fields, the action confirmation, and the save button.
- The shared Record wording and the closer now use the spec's text
  everywhere: onboarding, the reminder sheet and Settings.

**Honest record types.**

| Type | Missions | Button | Success line |
|---|---|---|---|
| Action | 1–5, 7, 14–20, 22–26, 28–29 | RECORD · COMPLETE MISSION N, after ticking "I have taken this action." | You acted with [value]. |
| Reflection | 6 | SAVE REFLECTION | Your reflection is saved. |
| Code | 8–13 | SAVE TO MY CODE | Your Personal Code is taking shape. |
| Plan | 21 | SAVE FOCUS & AIM | Your focus and aim are saved. |
| Plan | 27, 30 | SAVE PRACTICE PLAN | Your practice plan is saved. |
| Draft | any unfinished | SAVE DRAFT FOR LATER | (no credit) |

How the counts work:

- All 30 Missions count toward x/30.
- Only actions count as actions. This includes One-Off Actions, which never
  move x/30.
- The Progress ring and the Honor/Courage/Commitment tiles now count actions
  only.
- The Proof Log labels each record with its type.

**Connections between Missions.**

- **Mission 12's promise** is shown on 15–21.
- **Mission 21** (a focus area plus a seven-day aim) is required for 22–25,
  and shown on 26–30.
- **Mission 27's practice** is shown on 28–30, even if 21 doesn't exist.
- **The Personal Code** (8–12) is required for 14 and 29.
- **Mission 28** needs a prior action.
- **Recent actions** are shown on 21, 28 and 30.
- **Blocked Missions** explain what's missing and link straight to it.
  Browsing and drafts are never blocked.

**Saving honestly.**

- **Drafts** survive a reload and never earn credit.
- **Changed aim:** if his aim changes while a draft is open, the draft asks
  which aim to use.
- **Frozen on completion:** a completed record keeps its context, wording
  version and completion date, even if later edits change the code or aim.
- **Edits** bump an "updated" date. A save that lost a race with another tab
  is refused with a clear message, and his text is kept.
- **Delete is now Remove:** the record stops counting but keeps its words
  and date, and Restore brings back the same record.
- **Mission 13:** opens on his identity statement and must be saved on
  purpose. Settings and Mission 13 always edit the same sentence.

**Existing users.**

- **History stays as it was.** Every old record keeps its credit, its date
  and the task it was made under. The Mission shows "Saved under earlier
  wording" with the old title and task, plus "See the revised task".
- **Mission 4 example:** an old Mission 4 still reads "Honor Someone Who
  Matters", a thank-you. It is never relabeled "Own Your Part".
- **Legacy Mission 21:** an old 21 (a focus choice without an aim) keeps its
  record. He is asked to add a current aim before 22–25. The old text is
  kept in the record's history, and nothing is invented from the old focus.

**Unchanged:** the four tabs, the 430px phone layout, fonts and the
black-and-gold look, the fragrance shelf, full-width buttons, the completion
screen, the Proof Log, the Personal Code, and the S.T.A.R. explanation and
video section in onboarding and How It Works.

## 2. Walkthrough

These are the screenshots from `scripts/walkthrough.mjs` in
`docs/screenshots/v2-rebuild/` (new user, demo mode):

| Step | Screenshots |
|---|---|
| Onboarding, with the S.T.A.R. section and its video | 04–06 |
| Mission 1: the steps, approaches and examples closed, then open | 08–09 |
| The confirmation rule, then the success screen | 10–11 |
| Mission 2: switch the scent, save a draft, reload, complete | 12–14 |
| Mission list: next by number, then all 30 in four stages | 15–16 |
| Mission 7 with a photo, Mission 8 saved to the code, the Personal Code | 18–20 |
| Mission 13 opened on his identity | 21 |
| Mission 22 explaining that it needs Mission 21 | 22 |
| Proof Log with record types, then remove and restore | 25–27 |
| Progress counting actions only | 28 |
| Mission 30: the practice plan, then its success screen | 34–35 |

`scripts/acceptance.mjs` covers the returning-user paths:

| Path | Scenarios |
|---|---|
| 12 → 21 → 22 | D02, D03 |
| 21 changed while a draft exists | D04 |
| 27 → 30 | D05, D07 |
| Earlier-wording records | D10, D11 |

## 3. Test results

Full table: `docs/specs/acceptance-results.md`.

- **26/26 app scenarios pass (C01–C12, D01–D14).** They run against a
  production build at 375px phone width, with real clicks and keyboard
  input.
- **36/36 database checks pass.** These run every migration on a real
  Postgres (PGlite), seeded with first-curriculum data, then 0009 twice.
  They cover:
  - server-side validation, prerequisites and review dates
  - frozen snapshots, one record per Mission, and remove/restore
  - legacy Mission 4 and 21
  - row-level security between users
  - the rollback
- **Build, type check, lint and copy check are clean.** The full walkthrough
  passes.

**Not tested yet:** real phones and screen readers, beyond the automated
keyboard and ARIA checks, and a live Supabase project. Section 5 explains
how to set that up.

## 4. Migration approach

`supabase/migrations/0009_curriculum_v2.sql` is idempotent, needs no
secrets, and drops or deletes nothing. In order, it:

1. **Backs up** every mission row to `archive_missions_pre_0009`.
2. **Marks every existing row with curriculum version 1**, so it keeps its
   original wording. New rows get version 2. The version 1 wording is
   archived read-only in `src/content/missions-v1.ts`.
3. **Adds the record type, derived by Mission number** on the server, never
   chosen by the app. It also adds:
   - the action confirmation and the context snapshot
   - focus area, frequency and review date
   - soft removal and history
   - a separate drafts table
4. **Enforces the rules in the database** through the `missions_validate`
   trigger: types, text limits, the action confirmation, prerequisites,
   plan fields and review dates. It also freezes the completion date,
   context and wording version. The old 140/500-character limits become
   the spec's 1,000.
5. **Updates the app's initial load** to return the new fields and the
   drafts.

**Report after applying.** The migration file ends with read-only queries.
They give record counts by version, type and state, the backup row count,
and how many legacy Mission 21s will need a current aim. Run them on
staging and production, and send the numbers back. Nothing is "unresolved"
by design: every old row maps to version 1 under its own number.

**Rollback.**

1. Run `0009_down.sql`. It removes only the new rules, which the earlier
   app's two-step saves would trip. All columns, drafts, snapshots and
   revision 2 records stay readable and correctly labelled.
2. Redeploy the previous app version (commit `19f810e`).
3. To go forward again, re-run 0009. The database tests cover this
   (D14).

**Release order.**

1. Make sure 0007 and 0008 are applied to production.
2. Apply 0009 to staging and test.
3. After Antonio's sign-off, apply 0009 to production.
4. Merge this branch to `main` and deploy.

The new app must not go live before 0009: it reads columns that only 0009
adds.

## 5. Staging

Netlify deploys `main` to app.missionfragrances.com. Staging is a
**branch deploy** of `main-cig2ix`, so it gets its own address and never
touches the live site:

1. **Turn on branch deploys.** In Netlify, go to Site configuration → Build
   & deploy → Branches and deploy contexts → Branch deploys, and add
   `main-cig2ix`. Netlify builds it at
   `https://main-cig2ix--<site-name>.netlify.app`.
2. **Keep staging off the live database. This step matters.** Netlify branch
   deploys use the same environment variables as production by default.
   Under Site configuration → Environment variables, give
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   *branch deploy* values:
   - **Quickest:** leave them empty. Staging runs in demo mode, with all
     data on the device and no sign-in. That's enough to review wording and
     flow.
   - **Full test:** create a second Supabase project, run migrations 0001
     to 0009 there, and put its URL and anon key here.
3. **Optional custom address.** For something like
   `staging.missionfragrances.com`, go to Domain management → Branch
   subdomains. This needs DNS on Netlify, or a CNAME at the domain host
   pointing to the branch deploy.

## 6. Decisions for Antonio

1. **Videos:** the spec doesn't mention per-Mission videos. I kept them
   where the topic still matches: 7, 8, 9, 10, 15, 16, 17, 18, 20, 24, 25
   and 27. I removed them from 22, 23 and 26, whose topics changed. Keep,
   swap or drop?
2. **Existing users' action counts:** old records get the revised type by
   number. An old Mission 8–13 is now "code", an old 21/27/30 is "plan",
   and an old 6 is "reflection", so they no longer count as actions. The
   x/30 count is unaffected. Is that right, or should old records keep
   counting as actions?
3. **Moving old records to the revised task:** only Mission 21 offers this,
   because 22–25 need an aim. Every other old record shows the revised task
   read-only, and nobody has to redo anything. Should others offer "switch
   to the revised task" too?
4. **S.T.A.R. closer:** the spec replaces your earlier line ("Do this a
   dozen times… Do it 30 times and it becomes hardwired.") with "Repeat the
   practice. Let your scent remind you of the values you choose to live."
   everywhere. Confirm.
5. **Missions list intro:** "30 Missions, one a day. Each builds on the last.
   Miss a day and nothing resets. Pick up at the next one." Your wording?
6. **Review dates:** the app checks his own calendar day. The database
   accepts any date after "today" in the earliest timezone on Earth, so it
   never refuses a valid date. The alternative is storing each user's
   timezone. Is the current approach OK?
7. **The 30/30 admin email** (migration 0007) still counts a removed record.
   Fixing it means editing a trigger that carries the notify secret, so it
   has to be re-applied with the real secret. Want it fixed?

## 7. Changed files

- **Content:** `src/content/missions.ts` (rewritten, revision 2),
  `src/content/missions-v1.ts` (archive), `src/content/triggers.ts` (Record
  wording and closer).
- **Rules and data:**
  - `src/lib/curriculum.ts` (new)
  - `src/lib/data/types.ts`, `local.ts`, `supabase.ts`, `store.ts`
  - `src/lib/stats.ts`, `src/lib/personalCode.ts`, `src/lib/utils.ts`
- **Screens:**
  - `src/app/(app)/missions/[number]/page.tsx`
  - `src/components/mission/MissionForm.tsx` and `ContextPanels.tsx` (new)
  - `src/components/ui/Disclosure.tsx` (new), `src/components/ui/Field.tsx`
  - Missions list, Proof Log and log detail, Progress, Personal Code,
    Settings, `MissionRow.tsx`, `StarSystem.tsx`
- **Database:** `supabase/migrations/0009_curriculum_v2.sql` and
  `0009_down.sql`, `supabase/tests/curriculum_v2.test.mjs`,
  `supabase/README.md`.
- **Checks:** `scripts/check-copy.mjs` (now diffs against the spec),
  `scripts/acceptance.mjs` (new), `scripts/walkthrough.mjs`.
- **Docs:** `docs/specs/*`, `docs/HANDOFF.md`, `CLAUDE.md`.
