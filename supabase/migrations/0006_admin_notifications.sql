-- Admin notification triggers. Both call the `notify-admin` Edge Function via
-- pg_net. <NOTIFY_SECRET> is a placeholder: this file is applied with the real
-- value substituted at deploy time (never commit the secret). Requires the
-- pg_net extension (enabled for Web Push in 0003's ops block).

-- Fires when a user completes onboarding (the moment we have their name).
create or replace function public.notify_admin_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.onboarding_completed = false and new.onboarding_completed = true then
    perform net.http_post(
      url := 'https://vrhjzqaxksdthkeiwxrk.supabase.co/functions/v1/notify-admin',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer <NOTIFY_SECRET>'
      ),
      body := jsonb_build_object(
        'type', 'signup',
        'name', coalesce(new.display_name, ''),
        'email', coalesce(new.email, '')
      ),
      timeout_milliseconds := 10000
    );
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_notify_signup on public.profiles;
create trigger profiles_notify_signup
  after update on public.profiles
  for each row execute function public.notify_admin_signup();

-- Fires when the 30th lesson is completed. completeLesson uses
-- `on conflict do nothing`, so this AFTER INSERT trigger runs once per new row
-- only; the count reaching exactly 30 makes it fire once per user.
create or replace function public.notify_admin_course_complete()
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
  select count(*) into done from public.course_progress where user_id = new.user_id;
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

drop trigger if exists course_progress_notify_complete on public.course_progress;
create trigger course_progress_notify_complete
  after insert on public.course_progress
  for each row execute function public.notify_admin_course_complete();
