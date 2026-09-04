-- PedroAgapito.pe · Technology CMS V2
-- La migración de producción ya fue aplicada al proyecto Supabase.
-- Este archivo conserva el contrato estructural para reproducibilidad.

create table if not exists public.technologies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  category text not null default 'Tecnología',
  icon text not null default '◇',
  level text not null default 'Intermedio' check (level in ('Principal','Intermedio','En aprendizaje')),
  display_order integer not null default 0,
  featured boolean not null default false,
  practice_enabled boolean not null default false,
  practice_intro text,
  exercises jsonb not null default '[]'::jsonb,
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.technologies enable row level security;

create policy if not exists "public can read published technologies"
on public.technologies for select to anon, authenticated
using (status='published');

create policy if not exists "admins can manage technologies"
on public.technologies for all to authenticated
using (exists(select 1 from public.admin_users a where a.user_id=auth.uid() and a.active))
with check (exists(select 1 from public.admin_users a where a.user_id=auth.uid() and a.active));

-- La función submit_community_post debe validar p_technology contra
-- public.technologies en lugar de mantener una lista fija en PL/pgSQL.
-- En producción esta sustitución ya está aplicada.
