-- Rollback for 0009_curriculum_v2.sql — NOT a forward migration; run it by
-- hand only if the revision 2 app is rolled back to the earlier one.
--
-- It removes the revision 2 rules (which the earlier app's two-step writes
-- would trip) and nothing else. Every column, draft, snapshot and revision 2
-- record stays, readable and correctly labelled: curriculum_version still
-- says which wording each record was made under, so re-applying 0009 later
-- picks up exactly where it left off.

drop trigger if exists missions_validate on public.missions;
drop trigger if exists missions_clear_draft on public.missions;

-- Rows the earlier app writes after rollback are made under the earlier
-- wording: new rows go back to version 1, and still get their kind.
alter table public.missions alter column curriculum_version set default 1;

create or replace function public.missions_set_kind()
returns trigger language plpgsql as $$
begin
  new.kind := public.mission_kind(new.mission_number);
  return new;
end $$;

drop trigger if exists missions_set_kind on public.missions;
create trigger missions_set_kind
  before insert or update of mission_number on public.missions
  for each row execute function public.missions_set_kind();

-- To go forward again: drop trigger missions_set_kind, then re-run 0009.
