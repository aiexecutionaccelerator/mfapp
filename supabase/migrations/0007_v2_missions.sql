-- V2 — "Your 30-Day Mission" rebuild.
--
-- The missions table becomes the unified Proof log: a structured Mission's
-- user state IS its mission row. `mission_number` 1–30 marks a structured
-- Mission (null = free-form action from Start). status 'active' = in progress,
-- 'completed' = proof logged; no row = not started. One row per structured
-- Mission per user, enforced below, so the 30/30 count can never double.
--
-- The old course tables are archived, not dropped: course_progress is retired
-- in place, and lesson_responses lives on as the store for Mission question
-- answers under the new id scheme (lesson_id = 'm<number>', prompt_id = 'q').

-- 1) Archive current data before anything changes shape.
create table if not exists public.archive_course_progress as
  select * from public.course_progress;
create table if not exists public.archive_lesson_responses as
  select * from public.lesson_responses;
alter table public.archive_course_progress enable row level security;
alter table public.archive_lesson_responses enable row level security;
-- No policies: the archives are service-role-only.

-- 2) Profile: identity statement + set ownership/arrival.
alter table public.profiles
  add column if not exists identity_statement text
    check (identity_statement is null or char_length(identity_statement) <= 280),
  add column if not exists owns_set boolean not null default true,
  add column if not exists set_status text not null default 'arrived'
    check (set_status in ('ordered','arrived'));

-- 3) Missions: structured-Mission columns. photo_url holds a size-capped
-- data URL (no Storage bucket — keeps proofs private via RLS and identical
-- in demo mode).
alter table public.missions
  add column if not exists mission_number integer
    check (mission_number is null or mission_number between 1 and 30),
  add column if not exists question_answer text
    check (question_answer is null or char_length(question_answer) <= 4000),
  add column if not exists photo_url text
    check (photo_url is null or char_length(photo_url) <= 500000);

-- One state row per structured Mission per user — the backstop for both
-- double-declare and double-complete races.
create unique index if not exists missions_user_mission_number_key
  on public.missions (user_id, mission_number)
  where mission_number is not null;

-- 4) Analytics: insert-only event stream. Users can write their own events;
-- nobody reads them through the API (service role only).
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 64),
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.analytics_events enable row level security;
create policy "analytics insert own" on public.analytics_events
  for insert to authenticated with check (user_id = auth.uid());

-- 4b) account_created (spec §12) is a server-side moment — record it from the
-- signup trigger alongside the profile row.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  insert into public.analytics_events (user_id, name) values (new.id, 'account_created');
  return new;
end $$;

-- 5) Initial-load RPC: new profile + mission columns; course_progress is out.
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
                 mission_number, question_answer, photo_url
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
    )
  );
$$;

revoke all on function public.get_app_data() from public;
grant execute on function public.get_app_data() to authenticated;

-- 6) Admin notification: the 30/30 moment is now the 30th distinct structured
-- Mission completed, not the 30th course lesson. Same payload type, so the
-- deployed notify-admin Edge Function needs no change. <NOTIFY_SECRET> is
-- substituted at deploy time, as in 0006.
drop trigger if exists course_progress_notify_complete on public.course_progress;
drop function if exists public.notify_admin_course_complete();

create or replace function public.notify_admin_mission_complete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  done integer;
  user_name text;
  user_email text;
begin
  if new.mission_number is null or new.status <> 'completed' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status = 'completed' then
    return new;  -- proof edit, not a new completion
  end if;
  select count(distinct mission_number) into done
    from public.missions
    where user_id = new.user_id
      and mission_number is not null
      and status = 'completed';
  if done = 30 then
    select display_name, email into user_name, user_email
      from public.profiles where id = new.user_id;
    perform net.http_post(
      url := 'https://vrhjzqaxksdthkeiwxrk.supabase.co/functions/v1/notify-admin',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer <NOTIFY_SECRET>'
      ),
      body := jsonb_build_object(
        'type', 'course_complete',
        'name', coalesce(user_name, ''),
        'email', coalesce(user_email, '')
      ),
      timeout_milliseconds := 10000
    );
  end if;
  return new;
end;
$$;

drop trigger if exists missions_notify_complete on public.missions;
create trigger missions_notify_complete
  after insert or update on public.missions
  for each row execute function public.notify_admin_mission_complete();
