-- Course re-order (revision 2.2, 19 Nov 2026). docs/HANDOFF.md has the why.
--
-- Missions 1 to 10 move so each value is defined and then acted on the next
-- day. The rules that name Mission numbers move with them:
--   reflection   6        -> 10
--   code lines   8 to 12  -> 2, 4, 6, 11, 12   (13, identity, stays code)
--   photos       7, 19    -> 1, 19
-- Missions 11 to 30 keep their numbers, so every other rule is unchanged.
-- Both functions are redefined whole from 0009 with only those numbers
-- changed. src/lib/curriculum.ts (CODE_LINES) and src/content/missions.ts
-- hold the same numbers: keep them in step.
--
-- Run before the app version that ships this order. Records saved under the
-- old order keep their numbers; clear test accounts first (HANDOFF.md).
-- Idempotent. Rollback: 0012_down.sql restores the 0009 definitions.

create or replace function public.mission_kind(n integer)
returns text
language sql
immutable
as $$
  select case
    when n is null then 'action'
    when n = 10 then 'reflection'
    when n in (2, 4, 6, 11, 12, 13) then 'code'
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
        and mission_number in (2, 4, 6, 11, 12)
        and status = 'completed' and removed_at is null;
    if code_lines < 5 then
      raise exception 'Save all five Personal Code lines (Missions 2, 4, 6, 11 and 12) first.'
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
