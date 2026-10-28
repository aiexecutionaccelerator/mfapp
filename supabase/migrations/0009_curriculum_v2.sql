-- Curriculum revision 2 (Antonio, 28 Oct 2026). Spec: docs/specs/.
--
-- What this adds:
--   1. A backup of every mission row as it was (archive_missions_pre_0009).
--   2. Record kinds (action / reflection / code / plan), derived here from the
--      Mission number. The client never chooses a kind.
--   3. curriculum_version: existing rows = 1 (keep their original wording),
--      new rows = 2. A first-curriculum record is never relabeled.
--   4. The revision 2 fields: confirmation, frozen context snapshot, Mission
--      21's focus area, 27/30's frequency and review date, soft removal,
--      and the history a legacy record keeps if it is moved to the revised
--      task on purpose.
--   5. Drafts, in their own table, so unfinished work never earns progress.
--   6. The rules, enforced at the write boundary (missions_validate): kind,
--      text limits, the action confirmation, prerequisites, the plan fields,
--      and frozen completion date / context / wording version.
--   7. get_app_data() returns the new columns and the drafts.
--
-- Idempotent: safe to run twice. Nothing is dropped and no row is deleted.
-- No secrets: apply as-is. Roll back the rules with 0009_down.sql (keeps data).
-- Mirror of the client rules in src/lib/curriculum.ts: keep them in step.

-- 1) Back up first.
create table if not exists public.archive_missions_pre_0009 as
  select * from public.missions;
alter table public.archive_missions_pre_0009 enable row level security;
-- No policies: service role only.

-- 2) The kind of each Mission (revision 2). Null number = One-Off Action.
create or replace function public.mission_kind(n integer)
returns text
language sql
immutable
as $$
  select case
    when n is null then 'action'
    when n = 6 then 'reflection'
    when n between 8 and 13 then 'code'
    when n in (21, 27, 30) then 'plan'
    else 'action'
  end;
$$;

-- 3) + 4) Columns. curriculum_version defaults to 1 while it is added, so
-- every existing row is marked as made under the first curriculum; then
-- the default moves to 2 for everything written from now on.
alter table public.missions
  add column if not exists kind text,
  add column if not exists curriculum_version integer not null default 1,
  add column if not exists confirmed boolean not null default false,
  add column if not exists context jsonb,
  add column if not exists focus_area text,
  add column if not exists frequency text,
  add column if not exists review_date date,
  add column if not exists removed_at timestamptz,
  add column if not exists history jsonb;
alter table public.missions alter column curriculum_version set default 2;

update public.missions set kind = public.mission_kind(mission_number)
  where kind is null;
alter table public.missions alter column kind set not null;

-- Constraints, replaced by name so a rerun is harmless. The old text limits
-- (140 / 500) become the spec's 1,000.
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.missions'::regclass
      and contype = 'c'
      and (pg_get_constraintdef(oid) like '%action_text%'
        or pg_get_constraintdef(oid) like '%reflection%')
  loop
    execute format('alter table public.missions drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.missions
  drop constraint if exists missions_kind_check,
  drop constraint if exists missions_curriculum_version_check,
  drop constraint if exists missions_focus_area_check,
  drop constraint if exists missions_frequency_check,
  drop constraint if exists missions_text_length_check;
alter table public.missions
  add constraint missions_kind_check
    check (kind in ('action', 'reflection', 'code', 'plan')),
  add constraint missions_curriculum_version_check
    check (curriculum_version in (1, 2)),
  add constraint missions_focus_area_check
    check (focus_area is null or focus_area in
      ('Relationships', 'Health', 'Work', 'Money', 'Home', 'Service')),
  add constraint missions_frequency_check
    check (frequency is null or frequency in
      ('Daily', 'Three times a week', 'Weekly')),
  add constraint missions_text_length_check
    check (char_length(action_text) between 1 and 1000
       and (reflection is null or char_length(reflection) <= 1000));

-- 5) Drafts: one per Mission per user, separate from records.
create table if not exists public.mission_drafts (
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_number integer not null check (mission_number between 1 and 30),
  curriculum_version integer not null default 2,
  text text not null default '' check (char_length(text) <= 1000),
  trigger text check (trigger is null or trigger in ('honor','courage','commitment')),
  focus_area text,
  frequency text,
  review_date date,
  context jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, mission_number)
);
alter table public.mission_drafts enable row level security;

drop policy if exists "mission_drafts select own" on public.mission_drafts;
drop policy if exists "mission_drafts insert own" on public.mission_drafts;
drop policy if exists "mission_drafts update own" on public.mission_drafts;
drop policy if exists "mission_drafts delete own" on public.mission_drafts;
create policy "mission_drafts select own" on public.mission_drafts
  for select to authenticated using (user_id = auth.uid());
create policy "mission_drafts insert own" on public.mission_drafts
  for insert to authenticated with check (user_id = auth.uid());
create policy "mission_drafts update own" on public.mission_drafts
  for update to authenticated using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy "mission_drafts delete own" on public.mission_drafts
  for delete to authenticated using (user_id = auth.uid());

-- 6) The rules.
--
-- Errors are raised with SQLSTATE P0001 and a plain sentence; the app shows
-- it beside the form.
--
-- Review dates: the device knows his timezone; the database doesn't. Here a
-- new review date must be after "today" in the earliest timezone on Earth
-- (UTC-12), which is never later than his own today, so a valid date is
-- never refused. The app checks against his own calendar day.
create or replace function public.missions_validate()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  completing boolean := false;
  revising boolean := false;
  editing boolean := false;
  body text;
  n integer := new.mission_number;
  code_lines integer;
begin
  -- The kind is the server's, never the client's.
  new.kind := public.mission_kind(n);

  if tg_op = 'INSERT' then
    new.curriculum_version := 2;
    completing := new.status = 'completed';
  else
    -- A completed record keeps its completion date, always.
    if old.status = 'completed' then
      new.completed_at := old.completed_at;
    end if;

    if old.status = 'completed' and new.status = 'completed' then
      if old.curriculum_version < 2 and new.curriculum_version = 2 then
        -- Moving a first-curriculum record to the revised task, on purpose.
        -- Its original wording goes into history; it is never overwritten.
        revising := true;
        new.history := coalesce(old.history, '[]'::jsonb) || jsonb_build_array(
          jsonb_build_object(
            'curriculum_version', old.curriculum_version,
            'text', coalesce(old.reflection, old.action_text),
            'trigger', old.trigger,
            'completed_at', old.completed_at));
      else
        -- An edit: what it was made under and worked toward stays frozen.
        new.curriculum_version := old.curriculum_version;
        new.context := old.context;
        new.history := old.history;
        new.confirmed := old.confirmed;
        editing := old.curriculum_version = 2
          and (new.action_text is distinct from old.action_text
            or new.reflection is distinct from old.reflection
            or new.focus_area is distinct from old.focus_area
            or new.frequency is distinct from old.frequency
            or new.review_date is distinct from old.review_date
            or new.trigger is distinct from old.trigger);
      end if;
    elsif old.status <> 'completed' and new.status = 'completed' then
      -- Finishing a row left open by the old two-step flow: it is completed
      -- under the current wording.
      completing := true;
      new.curriculum_version := 2;
    elsif old.status = 'completed' and new.status <> 'completed' then
      raise exception 'A completed record can be removed and restored, not reopened.'
        using errcode = 'P0001';
    end if;
  end if;

  if not (completing or revising or editing) or n is null then
    return new;
  end if;

  -- Text: trimmed, not empty, 1,000 characters (280 on Mission 13).
  body := btrim(coalesce(new.reflection, new.action_text, ''));
  if body = '' then
    raise exception 'Write your record first.' using errcode = 'P0001';
  end if;
  if char_length(body) > (case when n = 13 then 280 else 1000 end) then
    raise exception 'That record is too long.' using errcode = 'P0001';
  end if;

  if n = 21 and new.focus_area is null then
    raise exception 'Choose a focus area.' using errcode = 'P0001';
  end if;

  if n in (27, 30) then
    if new.frequency is null then
      raise exception 'Choose how often you''ll practice.' using errcode = 'P0001';
    end if;
    if new.review_date is null then
      raise exception 'Choose a review date.' using errcode = 'P0001';
    end if;
    -- An unchanged date on an edit may be in the past; a new one may not.
    if not (editing and new.review_date is not distinct from old.review_date)
       and new.review_date <= (now() at time zone 'Etc/GMT+12')::date then
      raise exception 'Choose a review date after today.' using errcode = 'P0001';
    end if;
  end if;

  if new.photo_url is not null and n not in (7, 19)
     and (tg_op = 'INSERT' or new.photo_url is distinct from old.photo_url) then
    raise exception 'Photos are for Missions 7 and 19.' using errcode = 'P0001';
  end if;

  if editing then
    return new;  -- prerequisites gate completing, not editing
  end if;

  if new.kind = 'action' and not new.confirmed then
    raise exception 'Check “I have taken this action.” once you''ve done it.'
      using errcode = 'P0001';
  end if;

  -- Prerequisites.
  if n in (14, 29) then
    select count(distinct mission_number) into code_lines
      from public.missions
      where user_id = new.user_id
        and mission_number between 8 and 12
        and status = 'completed' and removed_at is null;
    if code_lines < 5 then
      raise exception 'Save all five Personal Code lines (Missions 8 to 12) first.'
        using errcode = 'P0001';
    end if;
  end if;

  if n between 22 and 25 and not exists (
    select 1 from public.missions
    where user_id = new.user_id and mission_number = 21
      and status = 'completed' and removed_at is null
      and curriculum_version = 2 and focus_area is not null
  ) then
    raise exception 'Choose your focus and seven-day aim in Mission 21 first.'
      using errcode = 'P0001';
  end if;

  if n = 28 and not exists (
    select 1 from public.missions
    where user_id = new.user_id
      and kind = 'action'
      and mission_number is distinct from 28
      and status = 'completed' and removed_at is null
  ) then
    raise exception 'Complete an action first, then repeat it here.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists missions_validate on public.missions;
create trigger missions_validate
  before insert or update on public.missions
  for each row execute function public.missions_validate();

-- A completed Mission's draft is done with.
create or replace function public.missions_clear_draft()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.mission_number is not null and new.status = 'completed' then
    delete from public.mission_drafts
      where user_id = new.user_id and mission_number = new.mission_number;
  end if;
  return new;
end;
$$;

drop trigger if exists missions_clear_draft on public.missions;
create trigger missions_clear_draft
  after insert or update of status, curriculum_version on public.missions
  for each row execute function public.missions_clear_draft();

-- 7) Initial load: new columns + drafts.
create or replace function public.get_app_data()
returns json
language sql
stable
security invoker
set search_path = public
as $$
  select json_build_object(
    'profile', (
      select to_json(p)
      from (
        select id, email, display_name, primary_goal, onboarding_completed,
               challenge_start_date, challenge_completed_at,
               notifications_enabled, certificate_requested,
               identity_statement, owns_set, set_status
        from public.profiles
        where id = auth.uid()
      ) p
    ),
    'missions', coalesce(
      (
        select json_agg(m order by m.started_at desc)
        from (
          select id, user_id, trigger, action_text, action_category, status,
                 started_at, completed_at, ended_at, reflection,
                 mission_number, question_answer, photo_url,
                 kind, curriculum_version, confirmed, context, focus_area,
                 frequency, review_date, updated_at, removed_at, history
          from public.missions
          where user_id = auth.uid()
        ) m
      ),
      '[]'::json
    ),
    'lesson_responses', coalesce(
      (
        select json_agg(r order by r.updated_at asc)
        from (
          select lesson_id, prompt_id, answer, updated_at
          from public.lesson_responses
          where user_id = auth.uid()
        ) r
      ),
      '[]'::json
    ),
    'drafts', coalesce(
      (
        select json_agg(d)
        from (
          select mission_number, curriculum_version, text, trigger, focus_area,
                 frequency, review_date, context, updated_at
          from public.mission_drafts
          where user_id = auth.uid()
        ) d
      ),
      '[]'::json
    )
  );
$$;

revoke all on function public.get_app_data() from public;
grant execute on function public.get_app_data() to authenticated;

-- Migration report: run after applying (read-only).
--   select curriculum_version, kind, status, (removed_at is not null) as removed,
--          count(*)
--     from public.missions group by 1, 2, 3, 4 order by 1, 2, 3, 4;
--   select count(*) from public.archive_missions_pre_0009;
--   -- Legacy Mission 21s that need a current aim before 22–25:
--   select count(*) from public.missions
--     where mission_number = 21 and status = 'completed' and curriculum_version = 1;
