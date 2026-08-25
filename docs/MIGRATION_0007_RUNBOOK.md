# Applying migration 0007 to the live Supabase DB

`supabase/migrations/0007_v2_missions.sql` is written and committed but **not
yet applied** to project `vrhjzqaxksdthkeiwxrk`. The V2 frontend reads the new
profile/mission columns on every load, so the order is fixed:

> **Apply 0007 first, then deploy the V2 frontend.**
> The old (V1) frontend keeps working after 0007 — everything is additive and
> its course tables are archived in place, not dropped. The V2 frontend does
> NOT work before 0007 (its profile select names the new columns).

## What 0007 does (all additive, nothing dropped)

1. Copies `course_progress` and `lesson_responses` into `archive_*` tables
   (service-role-only) before anything changes shape.
2. `profiles`: adds `identity_statement`, `owns_set` (default true),
   `set_status` (default 'arrived').
3. `missions`: adds `mission_number`, `question_answer`, `photo_url`, plus the
   partial unique index that makes double-counting a structured Mission
   impossible.
4. Creates the insert-only `analytics_events` table and records
   `account_created` from the signup trigger.
5. Replaces `get_app_data` (new columns; course_progress no longer returned —
   the V1 client falls back to querying the still-existing table, so it stays
   compatible).
6. Swaps the admin 30/30 notification: fires on the 30th completed structured
   Mission instead of the 30th lesson row. Payload type stays
   `course_complete`, so the deployed `notify-admin` Edge Function needs **no
   redeploy**.

## Prerequisites

- Dashboard access to project `vrhjzqaxksdthkeiwxrk` (SQL Editor is enough).
- The **NOTIFY_SECRET** value — the same bearer secret used when applying
  0006 (it is set as the `notify-admin` function secret). The migration file
  contains one `<NOTIFY_SECRET>` placeholder to substitute.

  **Don't have the value?** It is recoverable from the live DB itself,
  because 0006 was applied with it baked into the signup trigger. In the SQL
  Editor run:

  ```sql
  select prosrc from pg_proc where proname = 'notify_admin_signup';
  ```

  The returned function source contains `'Authorization', 'Bearer <value>'` —
  that value is the secret. Save it in the password manager. If that ever
  comes back empty, rotate instead: generate a new random string, set it as
  the `notify-admin` function's `NOTIFY_SECRET` secret in the dashboard, and
  use it both in 0007 and in a re-run of 0006's `notify_admin_signup`
  function so signup emails keep working.

## Steps

1. **Backup.** Dashboard → Database → Backups: confirm a backup from today
   exists (or trigger one). 0007 also creates its own in-DB archives as its
   first statement, so old course data is preserved either way.
2. **Prepare the SQL.** Copy the contents of
   `supabase/migrations/0007_v2_missions.sql` and replace the single
   `<NOTIFY_SECRET>` occurrence with the real value. Do this in the SQL
   editor, never in the repo — the committed file keeps the placeholder.
3. **Run it** in the SQL Editor as one script.
   - Partial-failure note: most statements are `create … if not exists` /
     `create or replace` and re-run cleanly. The exception is
     `create policy "analytics insert own"` — if a re-run reports it already
     exists, delete that one statement and re-run the rest.
4. **Verify:**

   ```sql
   select column_name from information_schema.columns
     where table_name = 'profiles'
       and column_name in ('identity_statement','owns_set','set_status');   -- 3 rows
   select column_name from information_schema.columns
     where table_name = 'missions'
       and column_name in ('mission_number','question_answer','photo_url'); -- 3 rows
   select indexname from pg_indexes
     where indexname = 'missions_user_mission_number_key';                  -- 1 row
   select relname from pg_class
     where relname in ('archive_course_progress','archive_lesson_responses',
                       'analytics_events');                                 -- 3 rows
   select tgname from pg_trigger where tgname = 'missions_notify_complete'; -- 1 row
   select tgname from pg_trigger
     where tgname = 'course_progress_notify_complete';                      -- 0 rows
   ```

5. **Deploy the V2 frontend** (merge to `main` → Netlify builds). No new env
   vars are needed: proof photos are data URLs on the mission row, so there is
   no Storage bucket to create, and analytics uses the existing anon key.
6. **Smoke test on live:** sign in with a beta account → profile loads →
   open a Mission → declare → refresh (state persists) → log a proof → check
   it appears in the Log and the counts move. The signup admin email still
   fires on onboarding completion; the 30/30 email now fires on the 30th
   structured proof.

## Not needed

- No Edge Function redeploys (`send-reminders`, `notify-admin` unchanged).
- No Storage bucket, no new secrets, no Netlify env changes.
- No data reset: beta users' old course progress is archived; their existing
  logged Missions simply appear as free-form Proofs.
