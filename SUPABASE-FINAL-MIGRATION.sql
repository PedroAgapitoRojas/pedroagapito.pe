-- PedroAgapito.pe · FINAL additive migration
-- Run this ONCE in Supabase SQL Editor.
-- It preserves the existing CMS public.projects table.

create extension if not exists pgcrypto;

-- =========================================================
-- Practice Lab
-- =========================================================
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
  unique(practice_id,path)
);
create index if not exists practices_user_id_idx on public.practices(user_id);
create index if not exists practices_status_idx on public.practices(status);
create index if not exists practice_files_practice_id_idx on public.practice_files(practice_id);
alter table public.practices enable row level security;
alter table public.practice_files enable row level security;
drop policy if exists "users can read own practices" on public.practices;
create policy "users can read own practices" on public.practices for select to authenticated using (user_id=auth.uid());
drop policy if exists "users can create own practices" on public.practices;
create policy "users can create own practices" on public.practices for insert to authenticated with check (user_id=auth.uid());
drop policy if exists "users can update own practices" on public.practices;
create policy "users can update own practices" on public.practices for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists "users can delete own practices" on public.practices;
create policy "users can delete own practices" on public.practices for delete to authenticated using (user_id=auth.uid());
drop policy if exists "users can read own practice files" on public.practice_files;
create policy "users can read own practice files" on public.practice_files for select to authenticated using (exists(select 1 from public.practices p where p.id=practice_id and p.user_id=auth.uid()));
drop policy if exists "users can create own practice files" on public.practice_files;
create policy "users can create own practice files" on public.practice_files for insert to authenticated with check (exists(select 1 from public.practices p where p.id=practice_id and p.user_id=auth.uid()));
drop policy if exists "users can update own practice files" on public.practice_files;
create policy "users can update own practice files" on public.practice_files for update to authenticated using (exists(select 1 from public.practices p where p.id=practice_id and p.user_id=auth.uid())) with check (exists(select 1 from public.practices p where p.id=practice_id and p.user_id=auth.uid()));
drop policy if exists "users can delete own practice files" on public.practice_files;
create policy "users can delete own practice files" on public.practice_files for delete to authenticated using (exists(select 1 from public.practices p where p.id=practice_id and p.user_id=auth.uid()));

-- =========================================================
-- Community profiles/follows/comments/projects
-- =========================================================
create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, username text unique, full_name text, bio text, avatar_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.follows (follower_id uuid not null references auth.users(id) on delete cascade, following_id uuid not null references auth.users(id) on delete cascade, created_at timestamptz not null default now(), primary key(follower_id,following_id), check(follower_id<>following_id));
create table if not exists public.community_comments (id uuid primary key default gen_random_uuid(), post_id uuid not null references public.community_posts(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, body text not null check(char_length(trim(body)) between 1 and 1000), created_at timestamptz not null default now());
create table if not exists public.community_projects (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, practice_id uuid references public.practices(id) on delete set null, title text not null check(char_length(trim(title)) between 3 and 140), description text not null default '', technologies text[] not null default '{}', preview_url text, status text not null default 'draft' check(status in ('draft','published','archived')), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index if not exists follows_following_idx on public.follows(following_id);
create index if not exists community_comments_post_idx on public.community_comments(post_id,created_at);
create index if not exists community_projects_user_idx on public.community_projects(user_id,created_at desc);
create index if not exists community_projects_status_idx on public.community_projects(status,created_at desc);

alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_projects enable row level security;
drop policy if exists "profiles public read" on public.profiles;
create policy "profiles public read" on public.profiles for select using(true);
drop policy if exists "profiles own insert" on public.profiles;
create policy "profiles own insert" on public.profiles for insert to authenticated with check(id=auth.uid());
drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update" on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
drop policy if exists "follows public read" on public.follows;
create policy "follows public read" on public.follows for select using(true);
drop policy if exists "follows own insert" on public.follows;
create policy "follows own insert" on public.follows for insert to authenticated with check(follower_id=auth.uid() and follower_id<>following_id);
drop policy if exists "follows own delete" on public.follows;
create policy "follows own delete" on public.follows for delete to authenticated using(follower_id=auth.uid());
drop policy if exists "comments public read" on public.community_comments;
create policy "comments public read" on public.community_comments for select using(true);
drop policy if exists "comments own insert" on public.community_comments;
create policy "comments own insert" on public.community_comments for insert to authenticated with check(user_id=auth.uid());
drop policy if exists "comments own delete" on public.community_comments;
create policy "comments own delete" on public.community_comments for delete to authenticated using(user_id=auth.uid());
drop policy if exists "community projects public read" on public.community_projects;
create policy "community projects public read" on public.community_projects for select using(status='published' or user_id=auth.uid());
drop policy if exists "community projects own insert" on public.community_projects;
create policy "community projects own insert" on public.community_projects for insert to authenticated with check(user_id=auth.uid());
drop policy if exists "community projects own update" on public.community_projects;
create policy "community projects own update" on public.community_projects for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists "community projects own delete" on public.community_projects;
create policy "community projects own delete" on public.community_projects for delete to authenticated using(user_id=auth.uid());

create table if not exists public.community_project_reactions (project_id uuid not null references public.community_projects(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, reaction text not null default 'heart' check(reaction='heart'), created_at timestamptz not null default now(), primary key(project_id,user_id,reaction));
create table if not exists public.community_project_comments (id uuid primary key default gen_random_uuid(), project_id uuid not null references public.community_projects(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, body text not null check(char_length(trim(body)) between 1 and 1000), created_at timestamptz not null default now());
create index if not exists community_project_reactions_project_idx on public.community_project_reactions(project_id);
create index if not exists community_project_comments_project_idx on public.community_project_comments(project_id,created_at);
alter table public.community_project_reactions enable row level security;
alter table public.community_project_comments enable row level security;
drop policy if exists "community project reactions public read" on public.community_project_reactions;
create policy "community project reactions public read" on public.community_project_reactions for select using(true);
drop policy if exists "community project reactions own insert" on public.community_project_reactions;
create policy "community project reactions own insert" on public.community_project_reactions for insert to authenticated with check(user_id=auth.uid());
drop policy if exists "community project reactions own delete" on public.community_project_reactions;
create policy "community project reactions own delete" on public.community_project_reactions for delete to authenticated using(user_id=auth.uid());
drop policy if exists "community project comments public read" on public.community_project_comments;
create policy "community project comments public read" on public.community_project_comments for select using(true);
drop policy if exists "community project comments own insert" on public.community_project_comments;
create policy "community project comments own insert" on public.community_project_comments for insert to authenticated with check(user_id=auth.uid());
drop policy if exists "community project comments own delete" on public.community_project_comments;
create policy "community project comments own delete" on public.community_project_comments for delete to authenticated using(user_id=auth.uid());

-- Repair if the previous Phase 2 SQL was executed before this final version.
-- These policies belonged to the old community implementation and must NOT sit on the CMS table public.projects.
drop policy if exists "projects public read" on public.projects;
drop policy if exists "projects own insert" on public.projects;
drop policy if exists "projects own update" on public.projects;
drop policy if exists "projects own delete" on public.projects;

-- Restore the CMS policies defined by the original project schema.
-- NOTE: the live public.projects table uses a `status` text column
-- ('development' | 'published', see js/cms-public.js), not a boolean
-- `published` column — fixed to match reality.
drop policy if exists "public read published projects" on public.projects;
create policy "public read published projects" on public.projects for select using (status in ('development','published'));
drop policy if exists "authenticated manage projects" on public.projects;
create policy "authenticated manage projects" on public.projects for all to authenticated using (true) with check (true);

-- =========================================================
-- Backend laboratory technologies
-- =========================================================
insert into public.technologies (name,slug,description,category,icon,level,display_order,featured,practice_enabled,practice_intro,status)
values
('Python','python','Programación, automatización y scripts.','Python / Data','🐍','Principal',4,true,true,'Ejecuta tu script en un sandbox aislado.','published'),
('Java','java','Lenguaje orientado a objetos para aplicaciones empresariales.','Desarrollo','J','Intermedio',23,false,true,'Compila y ejecuta Main.java en un sandbox aislado.','published'),
('Kotlin','kotlin','Lenguaje moderno para desarrollo multiplataforma y Android.','Desarrollo móvil','K','Intermedio',22,false,true,'Compila y ejecuta Main.kt en un sandbox aislado.','published'),
('SQL','sql','Consultas y manipulación de datos relacionales.','Bases de datos','SQL','Intermedio',17,false,true,'Ejecuta consultas SQLite en una base temporal.','published'),
('Docker','docker','Contenedores y entornos reproducibles.','Cloud / DevOps','🐳','Principal',6,true,true,'Valida Dockerfiles sin acceso privilegiado al host.','published')
on conflict (slug) do update set practice_enabled=excluded.practice_enabled, practice_intro=excluded.practice_intro, status='published';

-- =========================================================
-- Community comment moderation + user notifications
-- =========================================================
create table if not exists public.community_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'moderation',
  title text not null,
  message text not null,
  reason text,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.community_comments add column if not exists deleted_at timestamptz;
alter table public.community_comments add column if not exists deleted_by uuid references auth.users(id) on delete set null;
alter table public.community_comments add column if not exists moderation_reason text;
alter table public.community_project_comments add column if not exists deleted_at timestamptz;
alter table public.community_project_comments add column if not exists deleted_by uuid references auth.users(id) on delete set null;
alter table public.community_project_comments add column if not exists moderation_reason text;

create index if not exists community_notifications_user_idx on public.community_notifications(user_id, created_at desc);
create index if not exists community_comments_visible_idx on public.community_comments(post_id, created_at) where deleted_at is null;
create index if not exists community_project_comments_visible_idx on public.community_project_comments(project_id, created_at) where deleted_at is null;

alter table public.community_notifications enable row level security;
drop policy if exists "notifications own read" on public.community_notifications;
create policy "notifications own read" on public.community_notifications for select to authenticated using(user_id=auth.uid());
drop policy if exists "notifications own update" on public.community_notifications;
create policy "notifications own update" on public.community_notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());

drop policy if exists "comments public read" on public.community_comments;
create policy "comments public read" on public.community_comments for select using(deleted_at is null);
drop policy if exists "comments admin read" on public.community_comments;
create policy "comments admin read" on public.community_comments for select to authenticated using(exists(select 1 from public.admin_users a where a.user_id=auth.uid() and a.active));
drop policy if exists "comments own delete" on public.community_comments;
drop policy if exists "comments own delete within 48h" on public.community_comments;
create policy "comments own delete within 48h" on public.community_comments for delete to authenticated using(user_id=auth.uid() and deleted_at is null and created_at >= now() - interval '48 hours');

drop policy if exists "project comments public read" on public.community_project_comments;
create policy "project comments public read" on public.community_project_comments for select using(deleted_at is null);
drop policy if exists "project comments admin read" on public.community_project_comments;
create policy "project comments admin read" on public.community_project_comments for select to authenticated using(exists(select 1 from public.admin_users a where a.user_id=auth.uid() and a.active));
drop policy if exists "project comments own delete" on public.community_project_comments;
drop policy if exists "project comments own delete within 48h" on public.community_project_comments;
create policy "project comments own delete within 48h" on public.community_project_comments for delete to authenticated using(user_id=auth.uid() and deleted_at is null and created_at >= now() - interval '48 hours');

create or replace function public.moderate_community_comment(p_comment_id uuid, p_reason text)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare c record; admin_ok boolean; clean_reason text; notification_id uuid;
begin
  select exists(select 1 from public.admin_users a where a.user_id=auth.uid() and a.active) into admin_ok;
  if not admin_ok then raise exception 'ADMIN_REQUIRED'; end if;
  clean_reason := nullif(trim(coalesce(p_reason,'')),'');
  if clean_reason is null or char_length(clean_reason)<3 then raise exception 'REASON_REQUIRED'; end if;
  select id,user_id into c from public.community_comments where id=p_comment_id and deleted_at is null for update;
  if not found then raise exception 'COMMENT_NOT_FOUND'; end if;
  update public.community_comments set deleted_at=now(),deleted_by=auth.uid(),moderation_reason=clean_reason where id=p_comment_id;
  insert into public.community_notifications(user_id,type,title,message,reason,entity_type,entity_id)
  values(c.user_id,'comment_removed','Tu comentario fue retirado','Un moderador retiró uno de tus comentarios de la Comunidad.',clean_reason,'community_comment',c.id) returning id into notification_id;
  return jsonb_build_object('ok',true,'comment_id',c.id,'user_id',c.user_id,'notification_id',notification_id,'reason',clean_reason);
end; $$;

create or replace function public.moderate_community_project_comment(p_comment_id uuid, p_reason text)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare c record; admin_ok boolean; clean_reason text; notification_id uuid;
begin
  select exists(select 1 from public.admin_users a where a.user_id=auth.uid() and a.active) into admin_ok;
  if not admin_ok then raise exception 'ADMIN_REQUIRED'; end if;
  clean_reason := nullif(trim(coalesce(p_reason,'')),'');
  if clean_reason is null or char_length(clean_reason)<3 then raise exception 'REASON_REQUIRED'; end if;
  select id,user_id,project_id into c from public.community_project_comments where id=p_comment_id and deleted_at is null for update;
  if not found then raise exception 'COMMENT_NOT_FOUND'; end if;
  update public.community_project_comments set deleted_at=now(),deleted_by=auth.uid(),moderation_reason=clean_reason where id=p_comment_id;
  insert into public.community_notifications(user_id,type,title,message,reason,entity_type,entity_id)
  values(c.user_id,'comment_removed','Tu comentario de proyecto fue retirado','Un moderador retiró uno de tus comentarios de proyecto de la Comunidad.',clean_reason,'community_project_comment',c.id) returning id into notification_id;
  return jsonb_build_object('ok',true,'comment_id',c.id,'user_id',c.user_id,'notification_id',notification_id,'reason',clean_reason);
end; $$;
revoke all on function public.moderate_community_comment(uuid,text) from public;
grant execute on function public.moderate_community_comment(uuid,text) to authenticated;
revoke all on function public.moderate_community_project_comment(uuid,text) from public;
grant execute on function public.moderate_community_project_comment(uuid,text) to authenticated;

-- Link community publications to the authenticated profile so authors are clickable.
alter table public.community_posts add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists community_posts_user_idx on public.community_posts(user_id, created_at desc);
create or replace function public.set_community_post_user_id()
returns trigger language plpgsql security definer set search_path=public,auth as $$
begin
  if new.user_id is null then new.user_id := auth.uid(); end if;
  return new;
end; $$;
drop trigger if exists trg_set_community_post_user_id on public.community_posts;
create trigger trg_set_community_post_user_id before insert on public.community_posts for each row execute function public.set_community_post_user_id();
