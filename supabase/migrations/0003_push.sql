-- Web Push reminders.
--
-- One notification type only: "Your Mission is active. Did you do it?" sent at
-- the time the user picked on the Mission Active screen. No marketing, no
-- streaks, no campaigns.
--
-- The client writes both tables directly under RLS; the send-reminders Edge
-- Function reads them with the service role. See the OPS block at the bottom of
-- this file for the pg_cron / pg_net schedule (it carries placeholders, so it is
-- deliberately not part of the migration body).

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);
create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  send_at timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
-- The Edge Function's only query: unsent reminders that are due.
create index reminders_due_idx on public.reminders (sent_at, send_at);
create index reminders_mission_idx on public.reminders (mission_id);

alter table public.push_subscriptions enable row level security;
alter table public.reminders enable row level security;

create policy "push_subscriptions select own" on public.push_subscriptions
  for select to authenticated using (user_id = auth.uid());
create policy "push_subscriptions insert own" on public.push_subscriptions
  for insert to authenticated with check (user_id = auth.uid());
create policy "push_subscriptions update own" on public.push_subscriptions
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "push_subscriptions delete own" on public.push_subscriptions
  for delete to authenticated using (user_id = auth.uid());

create policy "reminders select own" on public.reminders
  for select to authenticated using (user_id = auth.uid());
create policy "reminders insert own" on public.reminders
  for insert to authenticated with check (user_id = auth.uid());
create policy "reminders delete own" on public.reminders
  for delete to authenticated using (user_id = auth.uid());

-- =====================================================================
-- OPS — run once, by hand, after deploying the send-reminders function.
-- Replace <PROJECT_REF> and <CRON_SECRET> with real values first; keep the
-- secret out of git. <CRON_SECRET> must equal the function secret of the same
-- name (see supabase/README.md).
-- =====================================================================
--
-- 1. Extensions (or enable them in Dashboard → Database → Extensions):
--
--    create extension if not exists pg_cron;
--    create extension if not exists pg_net with schema extensions;
--
-- 2. Schedule the function every minute:
--
--    select cron.schedule(
--      'send-reminders',
--      '* * * * *',
--      $$
--      select net.http_post(
--        url := 'https://<PROJECT_REF>.supabase.co/functions/v1/send-reminders',
--        headers := jsonb_build_object(
--          'Content-Type', 'application/json',
--          'Authorization', 'Bearer <CRON_SECRET>'
--        ),
--        body := '{}'::jsonb,
--        timeout_milliseconds := 30000
--      );
--      $$
--    );
--
-- 3. Check it:  select * from cron.job;
--               select * from cron.job_run_details order by start_time desc limit 10;
--
-- 4. Remove it: select cron.unschedule('send-reminders');
