-- Hardening (audit, 30 Oct 2026). docs/audit-2026-10-30.md has the why.
--
--   1. The notify secret moves out of trigger source code into a private
--      table no API role can read. Read from the live triggers, never from
--      this file: nothing secret is committed.
--   2. Admin emails fire once per user, never again: signup (onboarding
--      finished) and the 30/30 moment. The 30 count ignores removed
--      records, and restoring the 30th record counts.
--   3. Profiles: a signed-in user can no longer un-finish onboarding, change
--      the email column, or reset the "already emailed" markers.
--   4. Missions: completed numbered Missions can't be deleted (removal is
--      soft, via removed_at). New rows get server timestamps and no forged
--      history. One-Off Actions carry no photos. Size caps on jsonb.
--   5. Reminders: never in the past, only on the user's own Missions, a cap
--      per user. Push endpoints must be a real push service.
--   6. Analytics: small payloads and a per-user hourly cap.
--
-- Idempotent. No secrets in this file. Nothing is deleted. Applies after 0009.
-- Rules for "a signed-in user" use current_user = 'authenticated' (the role
-- PostgREST switches to); the service role and SQL editor are unaffected.

-- 1) The secret, out of function source.
create schema if not exists private;
revoke all on schema private from public;
do $$ begin
  revoke all on schema private from anon, authenticated;
exception when undefined_object then null;
end $$;

create table if not exists private.app_secrets (
  name text primary key,
  value text not null
);
revoke all on private.app_secrets from public;

do $$
declare
  src text;
  found text;
begin
  if exists (select 1 from private.app_secrets where name = 'notify_secret') then
    return;
  end if;
  select string_agg(pg_get_functiondef(p.oid), E'\n') into src
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('notify_admin_signup', 'notify_admin_mission_complete');
  found := substring(src from 'Bearer ([^''<>[:space:]]+)''');
  if found is not null then
    insert into private.app_secrets (name, value) values ('notify_secret', found);
  end if;
end $$;

-- Sends one admin email through the notify-admin Edge Function. Quietly does
-- nothing when the secret isn't configured (local and test databases).
create or replace function private.notify_admin(kind text, who_name text, who_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  secret text;
begin
  select value into secret from private.app_secrets where name = 'notify_secret';
  if secret is null then
    return;
  end if;
  perform net.http_post(
    url := 'https://vrhjzqaxksdthkeiwxrk.supabase.co/functions/v1/notify-admin',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || secret
    ),
    body := jsonb_build_object(
      'type', kind,
      'name', coalesce(who_name, ''),
      'email', coalesce(who_email, '')
    ),
    timeout_milliseconds := 10000
  );
end;
$$;
revoke all on function private.notify_admin(text, text, text) from public;

-- 2) Once-only markers, set by the server. Existing users who already
-- triggered an email are marked so nobody is emailed twice.
alter table public.profiles
  add column if not exists signup_notified_at timestamptz,
  add column if not exists completion_notified_at timestamptz;

update public.profiles set signup_notified_at = coalesce(signup_notified_at, now())
  where onboarding_completed and signup_notified_at is null;
update public.profiles p set completion_notified_at = coalesce(completion_notified_at, now())
  where completion_notified_at is null
    and (select count(distinct mission_number) from public.missions m
         where m.user_id = p.id and m.mission_number is not null
           and m.status = 'completed') >= 30;

-- 3) Profile guard. Runs before the signup notifier (alphabetical order).
create or replace function public.profiles_a_guard()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if current_user = 'authenticated' then
    if old.onboarding_completed and not new.onboarding_completed then
      raise exception 'Onboarding is already complete.' using errcode = 'P0001';
    end if;
    if new.email is distinct from old.email then
      raise exception 'Email can''t be changed here.' using errcode = 'P0001';
    end if;
    new.signup_notified_at := old.signup_notified_at;
    new.completion_notified_at := old.completion_notified_at;
  end if;
  if char_length(coalesce(new.display_name, '')) > 60
     or char_length(coalesce(new.primary_goal, '')) > 200 then
    raise exception 'That''s too long.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_a_guard on public.profiles;
create trigger profiles_a_guard
  before update on public.profiles
  for each row execute function public.profiles_a_guard();

-- Signup email: once, when onboarding first completes.
create or replace function public.notify_admin_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.onboarding_completed and not coalesce(old.onboarding_completed, false)
     and new.signup_notified_at is null then
    new.signup_notified_at := now();
    perform private.notify_admin('signup', new.display_name, new.email);
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_notify_signup on public.profiles;
create trigger profiles_notify_signup
  before update on public.profiles
  for each row execute function public.notify_admin_signup();

-- 30/30 email: once, when the 30th live Mission record exists.
create or replace function public.notify_admin_mission_complete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  done integer;
  who record;
begin
  if new.mission_number is null or new.status <> 'completed'
     or new.removed_at is not null then
    return new;
  end if;
  select display_name, email, completion_notified_at into who
    from public.profiles where id = new.user_id;
  if who.completion_notified_at is not null then
    return new;
  end if;
  select count(distinct mission_number) into done
    from public.missions
    where user_id = new.user_id
      and mission_number is not null
      and status = 'completed'
      and removed_at is null;
  if done >= 30 then
    update public.profiles set completion_notified_at = now()
      where id = new.user_id and completion_notified_at is null;
    if found then
      perform private.notify_admin('course_complete', who.display_name, who.email);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists missions_notify_complete on public.missions;
create trigger missions_notify_complete
  after insert or update on public.missions
  for each row execute function public.notify_admin_mission_complete();

-- The old functions and their copies of the secret are gone with these
-- replacements; nothing else in the database still embeds it.

-- 4) Missions.
create or replace function public.missions_guard()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if current_user <> 'authenticated' then
    return coalesce(new, old);
  end if;

  if tg_op = 'DELETE' then
    if old.mission_number is not null and old.status = 'completed' then
      raise exception 'Completed Missions are removed, not deleted.' using errcode = 'P0001';
    end if;
    return old;
  end if;

  if tg_op = 'INSERT' then
    new.started_at := now();
    new.history := null;
    new.removed_at := null;
    if new.status = 'completed' then
      new.completed_at := now();
    end if;
  elsif new.status = 'completed' and old.status <> 'completed' then
    new.completed_at := now();
  end if;

  if new.mission_number is null and new.photo_url is not null
     and (tg_op = 'INSERT' or new.photo_url is distinct from old.photo_url) then
    raise exception 'Photos are for Missions 7 and 19.' using errcode = 'P0001';
  end if;

  if pg_column_size(new.context) > 16384 or pg_column_size(new.history) > 65536 then
    raise exception 'That record is too large.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists missions_guard on public.missions;
create trigger missions_guard
  before insert or update or delete on public.missions
  for each row execute function public.missions_guard();

alter table public.mission_drafts
  drop constraint if exists mission_drafts_context_size_check;
alter table public.mission_drafts
  add constraint mission_drafts_context_size_check
  check (pg_column_size(context) <= 16384) not valid;

-- 5) Reminders and push subscriptions.
create or replace function public.reminders_guard()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if current_user <> 'authenticated' then
    return new;
  end if;
  if new.send_at < now() - interval '5 minutes' then
    raise exception 'A reminder can''t be in the past.' using errcode = 'P0001';
  end if;
  if not exists (
    select 1 from public.missions where id = new.mission_id and user_id = new.user_id
  ) then
    raise exception 'That Mission isn''t yours.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.reminders
      where user_id = new.user_id and sent_at is null) >= 20 then
    raise exception 'Too many reminders pending.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists reminders_guard on public.reminders;
create trigger reminders_guard
  before insert on public.reminders
  for each row execute function public.reminders_guard();

-- Real push services only: no pointing the reminder sender at other URLs.
alter table public.push_subscriptions
  drop constraint if exists push_subscriptions_endpoint_check;
alter table public.push_subscriptions
  add constraint push_subscriptions_endpoint_check
  check (endpoint ~ '^https://([a-z0-9-]+\.)*(fcm\.googleapis\.com|push\.services\.mozilla\.com|push\.apple\.com|notify\.windows\.com)/')
  not valid;

create or replace function public.push_subscriptions_guard()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if current_user = 'authenticated'
     and (select count(*) from public.push_subscriptions where user_id = new.user_id) >= 10 then
    raise exception 'Too many devices subscribed.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists push_subscriptions_guard on public.push_subscriptions;
create trigger push_subscriptions_guard
  before insert on public.push_subscriptions
  for each row execute function public.push_subscriptions_guard();

-- 6) Analytics: small events, at most 300 an hour per user.
alter table public.analytics_events
  drop constraint if exists analytics_events_props_size_check;
alter table public.analytics_events
  add constraint analytics_events_props_size_check
  check (pg_column_size(props) <= 2048) not valid;

create index if not exists analytics_events_user_created_idx
  on public.analytics_events (user_id, created_at desc);

-- Definer, because users can't read analytics rows (insert-only by RLS), so
-- an invoker count would always be 0. auth.uid() still names the caller.
create or replace function public.analytics_events_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and (
    select count(*) from public.analytics_events
    where user_id = new.user_id and created_at > now() - interval '1 hour'
  ) >= 300 then
    return null; -- drop silently: analytics never fails a user action
  end if;
  return new;
end;
$$;

drop trigger if exists analytics_events_guard on public.analytics_events;
create trigger analytics_events_guard
  before insert on public.analytics_events
  for each row execute function public.analytics_events_guard();
