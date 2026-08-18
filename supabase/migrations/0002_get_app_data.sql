-- One round-trip for the app's initial load: the caller's own profile row plus
-- their missions, newest first. Security INVOKER on purpose — the RLS policies
-- from 0001 still decide what this can read; the function only saves a request.

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
               notifications_enabled, certificate_requested
        from public.profiles
        where id = auth.uid()
      ) p
    ),
    'missions', coalesce(
      (
        select json_agg(m order by m.started_at desc)
        from (
          select id, user_id, trigger, action_text, action_category, status,
                 started_at, completed_at, ended_at, reflection
          from public.missions
          where user_id = auth.uid()
        ) m
      ),
      '[]'::json
    )
  );
$$;

revoke all on function public.get_app_data() from public;
grant execute on function public.get_app_data() to authenticated;
