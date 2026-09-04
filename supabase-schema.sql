-- PedroAgapito.pe — esquema inicial
create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  technologies text[] default '{}',
  status text default 'En desarrollo',
  project_url text,
  sort_order integer default 0,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.publications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  category text default 'Novedad',
  excerpt text,
  content text,
  image_url text,
  published_at timestamptz,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  platform text,
  description text,
  icon text default '🎓',
  pdf_url text not null,
  image_url text,
  issued_at date,
  sort_order integer default 0,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects enable row level security;
alter table public.publications enable row level security;
alter table public.certificates enable row level security;

-- Lectura pública únicamente de contenido publicado
create policy "public read published projects" on public.projects for select using (published = true);
create policy "public read published publications" on public.publications for select using (published = true);
create policy "public read published certificates" on public.certificates for select using (published = true);

-- Usuarios autenticados: CRUD. Cuando creemos tu usuario, podemos endurecer
-- estas políticas a un único UID administrador.
create policy "authenticated manage projects" on public.projects for all to authenticated using (true) with check (true);
create policy "authenticated manage publications" on public.publications for all to authenticated using (true) with check (true);
create policy "authenticated manage certificates" on public.certificates for all to authenticated using (true) with check (true);
