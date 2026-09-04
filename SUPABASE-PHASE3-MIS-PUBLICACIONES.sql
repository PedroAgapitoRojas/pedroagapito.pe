-- PedroAgapito.pe · Fase 3 (aditiva)
-- Permite que cada usuario vea SUS PROPIAS publicaciones de Comunidad
-- sin importar el estado (pending/approved/rejected/hidden).
-- No modifica ni elimina ninguna política existente: las políticas
-- RLS permisivas se combinan con OR, así que esto solo AGREGA acceso,
-- nunca lo quita.
-- Ejecuta esto UNA vez en el SQL Editor de Supabase.

alter table public.community_posts enable row level security;

drop policy if exists "community posts own read" on public.community_posts;
create policy "community posts own read"
  on public.community_posts
  for select
  to authenticated
  using (user_id = auth.uid());
