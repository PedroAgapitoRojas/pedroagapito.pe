-- PedroAgapito.pe · Community Phase 2
-- Additive only. Uses community_projects to avoid colliding with the existing CMS public.projects table.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create table if not exists public.community_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  practice_id uuid references public.practices(id) on delete set null,
  title text not null check (char_length(trim(title)) between 3 and 140),
  description text not null default '',
  technologies text[] not null default '{}',
  preview_url text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists follows_following_idx on public.follows(following_id);
create index if not exists community_comments_post_idx on public.community_comments(post_id, created_at);
create index if not exists community_comments_user_idx on public.community_comments(user_id);
create index if not exists community_projects_user_idx on public.community_projects(user_id, created_at desc);
create index if not exists community_projects_status_idx on public.community_projects(status, created_at desc);

alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_projects enable row level security;

drop policy if exists "profiles public read" on public.profiles;
create policy "profiles public read" on public.profiles for select using (true);
drop policy if exists "profiles own insert" on public.profiles;
create policy "profiles own insert" on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "follows public read" on public.follows;
create policy "follows public read" on public.follows for select using (true);
drop policy if exists "follows own insert" on public.follows;
create policy "follows own insert" on public.follows for insert to authenticated with check (follower_id = auth.uid() and follower_id <> following_id);
drop policy if exists "follows own delete" on public.follows;
create policy "follows own delete" on public.follows for delete to authenticated using (follower_id = auth.uid());

drop policy if exists "comments public read" on public.community_comments;
create policy "comments public read" on public.community_comments for select using (true);
drop policy if exists "comments own insert" on public.community_comments;
create policy "comments own insert" on public.community_comments for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "comments own delete" on public.community_comments;
create policy "comments own delete" on public.community_comments for delete to authenticated using (user_id = auth.uid());

drop policy if exists "community projects public read" on public.community_projects;
create policy "community projects public read" on public.community_projects for select using (status = 'published' or user_id = auth.uid());
drop policy if exists "community projects own insert" on public.community_projects;
create policy "community projects own insert" on public.community_projects for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "community projects own update" on public.community_projects;
create policy "community projects own update" on public.community_projects for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "community projects own delete" on public.community_projects;
create policy "community projects own delete" on public.community_projects for delete to authenticated using (user_id = auth.uid());

-- Community project engagement
create table if not exists public.community_project_reactions (
  project_id uuid not null references public.community_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null default 'heart' check (reaction = 'heart'),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id, reaction)
);

create table if not exists public.community_project_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.community_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists community_project_reactions_project_idx on public.community_project_reactions(project_id);
create index if not exists community_project_comments_project_idx on public.community_project_comments(project_id, created_at);

alter table public.community_project_reactions enable row level security;
alter table public.community_project_comments enable row level security;

drop policy if exists "project reactions public read" on public.community_project_reactions;
create policy "project reactions public read" on public.community_project_reactions for select using (true);
drop policy if exists "project reactions own insert" on public.community_project_reactions;
create policy "project reactions own insert" on public.community_project_reactions for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "project reactions own delete" on public.community_project_reactions;
create policy "project reactions own delete" on public.community_project_reactions for delete to authenticated using (user_id = auth.uid());

drop policy if exists "project comments public read" on public.community_project_comments;
create policy "project comments public read" on public.community_project_comments for select using (true);
drop policy if exists "project comments own insert" on public.community_project_comments;
create policy "project comments own insert" on public.community_project_comments for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "project comments own delete" on public.community_project_comments;
create policy "project comments own delete" on public.community_project_comments for delete to authenticated using (user_id = auth.uid());

-- =========================================================
-- Moderation: comments auto-publish, author delete window, admin removal
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
  insert into public.community_notifications(user_id,type,title,message,reason,entity_type,entity_id) values(c.user_id,'comment_removed','Tu comentario fue retirado','Un moderador retiró uno de tus comentarios de la Comunidad.',clean_reason,'community_comment',c.id);
  return jsonb_build_object('ok',true,'comment_id',c.id,'user_id',c.user_id,'reason',clean_reason);
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
  insert into public.community_notifications(user_id,type,title,message,reason,entity_type,entity_id) values(c.user_id,'comment_removed','Tu comentario de proyecto fue retirado','Un moderador retiró uno de tus comentarios de proyecto de la Comunidad.',clean_reason,'community_project_comment',c.id);
  return jsonb_build_object('ok',true,'comment_id',c.id,'user_id',c.user_id,'reason',clean_reason);
end; $$;
revoke all on function public.moderate_community_comment(uuid,text) from public;
grant execute on function public.moderate_community_comment(uuid,text) to authenticated;
revoke all on function public.moderate_community_project_comment(uuid,text) from public;
grant execute on function public.moderate_community_project_comment(uuid,text) to authenticated;

-- Link publications to profiles for clickable authors.
alter table public.community_posts add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists community_posts_user_idx on public.community_posts(user_id, created_at desc);
create or replace function public.set_community_post_user_id()
returns trigger language plpgsql security definer set search_path=public,auth as $$
begin if new.user_id is null then new.user_id := auth.uid(); end if; return new; end; $$;
drop trigger if exists trg_set_community_post_user_id on public.community_posts;
create trigger trg_set_community_post_user_id before insert on public.community_posts for each row execute function public.set_community_post_user_id();
