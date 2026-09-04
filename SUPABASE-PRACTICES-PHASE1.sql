-- PedroAgapito.pe · Practice Lab Phase 1
-- Safe additive migration: does not alter or delete existing tables.

create table if not exists public.practices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  technology text not null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.practice_files (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices(id) on delete cascade,
  path text not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(practice_id, path)
);

create index if not exists practices_user_id_idx on public.practices(user_id);
create index if not exists practices_status_idx on public.practices(status);
create index if not exists practice_files_practice_id_idx on public.practice_files(practice_id);

alter table public.practices enable row level security;
alter table public.practice_files enable row level security;

drop policy if exists "users can read own practices" on public.practices;
create policy "users can read own practices"
on public.practices for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "users can create own practices" on public.practices;
create policy "users can create own practices"
on public.practices for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "users can update own practices" on public.practices;
create policy "users can update own practices"
on public.practices for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "users can delete own practices" on public.practices;
create policy "users can delete own practices"
on public.practices for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "users can read own practice files" on public.practice_files;
create policy "users can read own practice files"
on public.practice_files for select
to authenticated
using (
  exists (
    select 1 from public.practices p
    where p.id = practice_id and p.user_id = auth.uid()
  )
);

drop policy if exists "users can create own practice files" on public.practice_files;
create policy "users can create own practice files"
on public.practice_files for insert
to authenticated
with check (
  exists (
    select 1 from public.practices p
    where p.id = practice_id and p.user_id = auth.uid()
  )
);

drop policy if exists "users can update own practice files" on public.practice_files;
create policy "users can update own practice files"
on public.practice_files for update
to authenticated
using (
  exists (
    select 1 from public.practices p
    where p.id = practice_id and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.practices p
    where p.id = practice_id and p.user_id = auth.uid()
  )
);

drop policy if exists "users can delete own practice files" on public.practice_files;
create policy "users can delete own practice files"
on public.practice_files for delete
to authenticated
using (
  exists (
    select 1 from public.practices p
    where p.id = practice_id and p.user_id = auth.uid()
  )
);
