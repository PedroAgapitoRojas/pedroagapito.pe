-- PedroAgapito.pe · Fase 7 (aditiva)
-- Video/clip como resultado en publicaciones (sección 19 del prompt),
-- cuando la práctica no se puede ejecutar directamente.
-- Ejecuta esto UNA vez, después de las Fases 3, 4, 5 y 6.

alter table public.community_posts
  add column if not exists preview_video_url text;

create or replace function public.attach_post_video(p_post_id uuid, p_video_url text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare pr record; clean_url text;
begin
  select id,user_id,status into pr from public.community_posts where id=p_post_id for update;
  if not found then raise exception 'POST_NOT_FOUND'; end if;
  if pr.user_id is distinct from auth.uid() then raise exception 'NOT_OWNER'; end if;
  if pr.status <> 'pending' then raise exception 'POST_NOT_EDITABLE'; end if;
  clean_url := nullif(trim(coalesce(p_video_url,'')),'');
  update public.community_posts set preview_video_url = clean_url where id=p_post_id;
  return jsonb_build_object('ok',true,'preview_video_url',clean_url);
end; $$;
revoke all on function public.attach_post_video(uuid,text) from public;
grant execute on function public.attach_post_video(uuid,text) to authenticated;
