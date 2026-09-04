-- PedroAgapito.pe · Fase 6 (aditiva)
-- Avatar de usuario (sección 3-4) e imagen de resultado en Proyectos
-- (sección 20, igual que ya se hizo para Publicaciones en la Fase 5).
-- Ejecuta esto UNA vez, después de las Fases 3, 4 y 5.

-- 1) Avatar en el perfil.
alter table public.profiles
  add column if not exists avatar_url text;

drop policy if exists "avatars own upload" on storage.objects;
create policy "avatars own upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'portfolio-media'
    and (storage.foldername(name))[1] = 'avatars'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- 2) Imagen de resultado en Proyectos (ya tenían preview_url como link;
--    esto agrega una imagen real embebida, sin quitar el link).
alter table public.community_projects
  add column if not exists preview_image_url text;

create or replace function public.attach_project_preview(p_project_id uuid, p_preview_url text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare pr record; clean_url text;
begin
  select id,user_id into pr from public.community_projects where id=p_project_id for update;
  if not found then raise exception 'PROJECT_NOT_FOUND'; end if;
  if pr.user_id is distinct from auth.uid() then raise exception 'NOT_OWNER'; end if;
  clean_url := nullif(trim(coalesce(p_preview_url,'')),'');
  update public.community_projects set preview_image_url = clean_url where id=p_project_id;
  return jsonb_build_object('ok',true,'preview_image_url',clean_url);
end; $$;
revoke all on function public.attach_project_preview(uuid,text) from public;
grant execute on function public.attach_project_preview(uuid,text) to authenticated;

drop policy if exists "project previews own upload" on storage.objects;
create policy "project previews own upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'portfolio-media'
    and (storage.foldername(name))[1] = 'projects'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
