-- Unfinished sentences (19 Nov 2026). docs/HANDOFF.md, revision 2.1.
--
-- The Record step's starters fill the start of a sentence ("Treating people
-- with respect even when"). In Antonio's test run, 8 of 14 Missions were
-- saved as just that, and the half-sentences reached the Proof Log and every
-- line of the Personal Code. The app now refuses them; this is the same rule
-- at the write boundary.
--
-- A completed numbered Mission can't be saved, or edited, with a line that
-- stops on a word a finished sentence doesn't end on. A line he ends with
-- . ! or ? counts as finished ("…checking in."). The word list matches
-- DANGLING_WORDS in src/lib/curriculum.ts: keep them in step.
--
-- Only new completions and text edits are checked: records already saved
-- stay as they are, and removing or restoring one is never blocked.
-- Idempotent. Applies after 0010. Rollback: 0011_down.sql.

create or replace function public.missions_unfinished()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  body text := coalesce(new.reflection, new.action_text, '');
  line text;
  last_word text;
begin
  if new.status <> 'completed' or new.mission_number is null then
    return new;
  end if;
  if tg_op = 'UPDATE'
    and coalesce(new.reflection, new.action_text, '') is not distinct from coalesce(old.reflection, old.action_text, '') then
    return new;
  end if;

  foreach line in array regexp_split_to_array(body, E'\n+') loop
    line := btrim(line);
    continue when line = '' or line ~ '[.!?]["”’'']?$';
    last_word := lower(regexp_replace(
      substring(regexp_replace(line, '[…."“”''’,;:\s]+$', '') from '([^\s]+)$'),
      '[^a-zA-Z’'']', '', 'g'));
    if last_word = any (array[
      'a', 'about', 'after', 'an', 'and', 'at', 'because', 'before', 'but', 'by',
      'for', 'from', 'i', 'in', 'into', 'is', 'my', 'of', 'on', 'or', 'that',
      'the', 'their', 'to', 'was', 'when', 'while', 'will', 'with', 'your'
    ]) then
      raise exception 'Finish your sentence before you save it.' using errcode = 'P0001';
    end if;
  end loop;
  return new;
end;
$$;

-- Named to fire before missions_validate (triggers run in name order).
drop trigger if exists missions_unfinished on public.missions;
create trigger missions_unfinished
  before insert or update on public.missions
  for each row execute function public.missions_unfinished();
