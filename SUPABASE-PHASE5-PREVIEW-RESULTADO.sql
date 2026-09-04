-- PedroAgapito.pe · Fase 5 (aditiva)
-- Agrega una imagen de RESULTADO a cada publicación de Comunidad,
-- para mostrar cómo se ve la práctica y no solo su código
-- (secciones 15-21 del prompt original: "Resultado primero").
-- No toca la función submit_community_post existente (no la conozco
-- ni la modifico) — el enlace de la imagen se hace con una función
-- nueva y acotada, para no debilitar la moderación ya existente.
-- Ejecuta esto UNA vez, después de las Fases 3 y 4.

-- 1) Columna nueva, nula por defecto — no afecta publicaciones existentes.
alter table public.community_posts
  add column if not exists preview_image_url text;

-- 2) Función que enlaza la imagen a UNA publicación propia, y SOLO
--    mientras sigue 'pending' (antes de que un admin la revise).
--    No permite tocar título, código ni ningún otro campo.
create or replace function public.attach_post_preview(p_post_id uuid, p_preview_url text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare pr record; clean_url text;
begin
  select id,user_id,status into pr from public.community_posts where id=p_post_id for update;
  if not found then raise exception 'POST_NOT_FOUND'; end if;
  if pr.user_id is distinct from auth.uid() then raise exception 'NOT_OWNER'; end if;
  if pr.status <> 'pending' then raise exception 'POST_NOT_EDITABLE'; end if;
  clean_url := nullif(trim(coalesce(p_preview_url,'')),'');
  update public.community_posts set preview_image_url = clean_url where id=p_post_id;
  return jsonb_build_object('ok',true,'preview_image_url',clean_url);
end; $$;
revoke all on function public.attach_post_preview(uuid,text) from public;
grant execute on function public.attach_post_preview(uuid,text) to authenticated;

-- 3) Storage: cada usuario autenticado puede subir SOLO dentro de su
--    propia carpeta community/<su-uid>/..., y cualquiera puede leer
--    (necesario para que la imagen se vea públicamente en el feed).
drop policy if exists "community previews own upload" on storage.objects;
create policy "community previews own upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'portfolio-media'
    and (storage.foldername(name))[1] = 'community'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "portfolio media public read" on storage.objects;
create policy "portfolio media public read"
  on storage.objects for select
  using (bucket_id = 'portfolio-media');
