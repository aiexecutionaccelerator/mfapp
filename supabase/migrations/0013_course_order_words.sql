-- Course order and real words (revision 2.3, 23 Nov 2026). docs/HANDOFF.md
-- has the why (Antonio's second Loom).
--
-- 1. Define Courage and Define Commitment now follow Define Honor:
--      3 Define Courage (was 4), 4 Define Commitment (was 6),
--      5 Give Credit (was 3), 6 Break the Avoidance Loop (was 5).
--    So the code lines are 2, 3, 4, 11, 12 (13, identity, stays code), and
--    Mission 10 stays the reflection. Both functions below are 0012's with
--    only those numbers changed. src/lib/curriculum.ts (CODE_LINES) and
--    src/content/missions.ts hold the same numbers: keep them in step.
-- 2. Keyboard mash is refused ("sdkjfghdfskjhg", "Fhj"), on Missions and on
--    Live It actions (no number), which also need at least two words. The
--    rule matches notRealWords() in src/lib/curriculum.ts: keep them in step.
--
-- Records saved under the old order keep their numbers: clear test records
-- for Missions 3 to 7 first (HANDOFF.md). Idempotent.
-- Rollback: 0013_down.sql restores 0012 and drops the new trigger.

create or replace function public.mission_kind(n integer)
returns text
language sql
immutable
as $$
  select case
    when n is null then 'action'
    when n = 10 then 'reflection'
    when n in (2, 3, 4, 11, 12, 13) then 'code'
    when n in (21, 27, 30) then 'plan'
    else 'action'
  end;
$$;

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

  if new.photo_url is not null and n not in (1, 19)
     and (tg_op = 'INSERT' or new.photo_url is distinct from old.photo_url) then
    raise exception 'Photos are for Missions 1 and 19.' using errcode = 'P0001';
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
        and mission_number in (2, 3, 4, 11, 12)
        and status = 'completed' and removed_at is null;
    if code_lines < 5 then
      raise exception 'Save all five Personal Code lines (Missions 2, 3, 4, 11 and 12) first.'
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


-- Real words (2). A word is junk when it has three or more letters, isn't
-- all capitals (TV, CRM), and has no vowel (y counts); or has six
-- consonants in a row; or one letter four times running. An answer is
-- refused when junk makes up 40% or more of its letters.
create or replace function public.not_real_words(body text)
returns boolean
language plpgsql
immutable
as $$
declare
  tok text;
  total integer := 0;
  junk integer := 0;
begin
  for tok in select (regexp_matches(coalesce(body, ''), '[A-Za-z’'']+', 'g'))[1] loop
    tok := regexp_replace(tok, '[’'']', '', 'g');
    continue when tok = '';
    total := total + char_length(tok);
    if (char_length(tok) >= 3 and tok <> upper(tok) and tok !~* '[aeiouy]'
          and lower(tok) <> all (array['hmm', 'mrs', 'shh', 'nth', 'pfft', 'tsk', 'brr', 'psst']))
       or tok ~* '[b-df-hj-np-tv-xz]{6,}'
       or tok ~* '([a-z])\1\1\1' then
      junk := junk + char_length(tok);
    end if;
  end loop;
  return total = 0 or junk * 10 >= total * 4;
end;
$$;

create or replace function public.missions_real_words()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  body text := coalesce(new.reflection, new.action_text, '');
begin
  if new.status <> 'completed' then
    return new;
  end if;
  if tg_op = 'UPDATE' and body is not distinct from coalesce(old.reflection, old.action_text, '') then
    return new;
  end if;
  if public.not_real_words(body) then
    raise exception 'That doesn''t read as words yet. Write it in a sentence.'
      using errcode = 'P0001';
  end if;
  if new.mission_number is null
     and (select count(*) from regexp_matches(body, '[A-Za-z’'']+', 'g')) < 2 then
    raise exception 'Say a little more about what you did.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- Named to fire before missions_validate (triggers run in name order).
drop trigger if exists missions_real_words on public.missions;
create trigger missions_real_words
  before insert or update on public.missions
  for each row execute function public.missions_real_words();
