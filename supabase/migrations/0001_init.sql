create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  primary_goal text,
  onboarding_completed boolean not null default false,
  challenge_start_date date,
  challenge_completed_at timestamptz,
  notifications_enabled boolean not null default true,
  certificate_requested boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trigger text not null check (trigger in ('honor','courage','commitment')),
  action_text text not null check (char_length(action_text) between 1 and 140),
  action_category text,
  status text not null check (status in ('active','completed','ended')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  ended_at timestamptz,
  reflection text check (reflection is null or char_length(reflection) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index missions_user_started_idx on public.missions (user_id, started_at desc);

-- updated_at trigger
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger missions_updated_at before update on public.missions for each row execute function public.set_updated_at();

-- auto-create profile on signup
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.missions enable row level security;

create policy "profiles select own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles insert own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "missions select own" on public.missions for select to authenticated using (user_id = auth.uid());
create policy "missions insert own" on public.missions for insert to authenticated with check (user_id = auth.uid());
create policy "missions update own" on public.missions for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "missions delete own" on public.missions for delete to authenticated using (user_id = auth.uid());
