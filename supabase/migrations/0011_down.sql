-- Rollback for 0011_unfinished_text.sql. Nothing is deleted.
drop trigger if exists missions_unfinished on public.missions;
drop function if exists public.missions_unfinished();
