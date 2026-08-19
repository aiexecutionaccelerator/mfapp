-- Course progress.
--
-- One row per lesson a man has finished. The lesson catalogue itself lives in
-- the app (`src/content/course.ts`) and mirrors the Mission Fragrances Academy,
-- so this table stores nothing but the id and when it was completed. No points,
-- no scores — a completed lesson is one Course Rep, the same kind of evidence as
-- a completed Mission.

create table public.course_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.course_progress enable row level security;

create policy "course_progress select own" on public.course_progress
  for select to authenticated using (user_id = auth.uid());
create policy "course_progress insert own" on public.course_progress
  for insert to authenticated with check (user_id = auth.uid());
create policy "course_progress delete own" on public.course_progress
  for delete to authenticated using (user_id = auth.uid());

-- Fold course progress into the single initial-load round-trip from 0002.
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
    ),
    'course_progress', coalesce(
      (
        select json_agg(c order by c.completed_at asc)
        from (
          select lesson_id, completed_at
          from public.course_progress
          where user_id = auth.uid()
        ) c
      ),
      '[]'::json
    )
  );
$$;

revoke all on function public.get_app_data() from public;
grant execute on function public.get_app_data() to authenticated;
