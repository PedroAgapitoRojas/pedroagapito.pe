-- PedroAgapito.pe · Fase 4 (aditiva)
-- Conecta public.practices (Laboratorio) con public.community_posts
-- (Comunidad), para que una práctica guardada y su publicación sean
-- la MISMA fuente de verdad, tal como pedía el prompt original:
-- draft -> pending -> approved/rejected, visible en "Mis publicaciones".
-- No borra ni reemplaza ninguna columna ni política existente.
-- Ejecuta esto UNA vez, después de SUPABASE-FINAL-MIGRATION.sql y
-- SUPABASE-PHASE3-MIS-PUBLICACIONES.sql.

-- 1) Enlace entre una práctica y el post que generó al enviarla.
alter table public.practices
  add column if not exists post_id uuid references public.community_posts(id) on delete set null;

-- 2) Amplía los estados posibles de una práctica para reflejar el
--    ciclo de moderación (se conservan 'draft','published','archived'
--    por compatibilidad con datos existentes).
alter table public.practices drop constraint if exists practices_status_check;
alter table public.practices add constraint practices_status_check
  check (status in ('draft','pending','approved','rejected','hidden','published','archived'));

-- 3) Sincronización automática: cuando un admin aprueba/rechaza/oculta
--    un community_post (vía admin.js, que ya tiene permisos por RLS
--    existente), la práctica enlazada refleja el mismo estado sin que
--    el frontend tenga que hacer una segunda escritura.
create or replace function public.sync_practice_status_from_post()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.status is distinct from old.status then
    update public.practices
      set status = new.status, updated_at = now()
      where post_id = new.id;
  end if;
  return new;
end; $$;

drop trigger if exists trg_sync_practice_status on public.community_posts;
create trigger trg_sync_practice_status
  after update of status on public.community_posts
  for each row execute function public.sync_practice_status_from_post();
