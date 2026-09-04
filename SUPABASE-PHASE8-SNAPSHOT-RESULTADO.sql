-- PedroAgapito.pe · Fase 8 (aditiva)
-- Reemplaza el enfoque de "ejecutar/renderizar en vivo dentro de
-- Comunidad" por uno más simple y confiable: capturar el resultado
-- tal como se vio en el Laboratorio al momento de publicar, y
-- mostrarlo fijo (sin volver a ejecutar nada para cada visitante).
-- Ejecuta esto UNA vez, después de las Fases 3-7.

alter table public.community_posts
  add column if not exists output_snapshot text;

create or replace function public.attach_post_output(p_post_id uuid, p_output text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare pr record; clean_text text;
begin
  select id,user_id,status into pr from public.community_posts where id=p_post_id for update;
  if not found then raise exception 'POST_NOT_FOUND'; end if;
  if pr.user_id is distinct from auth.uid() then raise exception 'NOT_OWNER'; end if;
  if pr.status <> 'pending' then raise exception 'POST_NOT_EDITABLE'; end if;
  clean_text := left(nullif(trim(coalesce(p_output,'')),''),4000);
  update public.community_posts set output_snapshot = clean_text where id=p_post_id;
  return jsonb_build_object('ok',true);
end; $$;
revoke all on function public.attach_post_output(uuid,text) from public;
grant execute on function public.attach_post_output(uuid,text) to authenticated;
