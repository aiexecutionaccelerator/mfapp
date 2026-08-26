-- Set status becomes a three-step journey: none (default) → MARK ORDERED →
-- ordered ("your order is on the way") → MARK RECEIVED → arrived ("enjoy your
-- set"). Existing rows keep their current value. No secrets involved — apply
-- as-is in the SQL editor.

do $$
declare c text;
begin
  select conname into c
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and pg_get_constraintdef(oid) like '%set_status%';
  if c is not null then
    execute format('alter table public.profiles drop constraint %I', c);
  end if;
end $$;

alter table public.profiles
  add constraint profiles_set_status_check
  check (set_status in ('none','ordered','arrived'));

alter table public.profiles alter column set_status set default 'none';
