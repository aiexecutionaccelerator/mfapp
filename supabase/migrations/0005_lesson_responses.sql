-- Lesson responses.
--
-- What a man writes inside a lesson: the eulogy, the three examples of honor,
-- the seven Vivid Vision sections, the commitments he ticks. One row per
-- answered prompt. `lesson_id` and `prompt_id` index `src/content/course.ts`.
--
-- Private like Mission reflections: RLS keeps every row to its owner, nothing
-- is shared, nothing is public, and nothing here is ever logged.

create table public.lesson_responses (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  prompt_id text not null,
  answer text not null check (char_length(answer) <= 4000),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id, prompt_id)
);

alter table public.lesson_responses enable row level security;

create policy "lesson_responses select own" on public.lesson_responses
  for select to authenticated using (user_id = auth.uid());
create policy "lesson_responses insert own" on public.lesson_responses
  for insert to authenticated with check (user_id = auth.uid());
create policy "lesson_responses update own" on public.lesson_responses
  for update to authenticated using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy "lesson_responses delete own" on public.lesson_responses
  for delete to authenticated using (user_id = auth.uid());

-- Fold the responses into the single initial-load round-trip from 0002/0004.
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
