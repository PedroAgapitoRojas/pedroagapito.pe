-- PedroAgapito.pe · Fase 9 (aditiva)
-- Sección de reseñas/testimonios sobre el portafolio (NO es Comunidad):
-- cualquier visitante puede dejar una reseña sin crear cuenta, pasa por
-- tu aprobación en /admin, y solo las aprobadas se muestran en el sitio.
-- Ejecuta esto UNA vez, después de las Fases 1-8.

create table if not exists public.portfolio_reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 60),
  body text not null check (char_length(trim(body)) between 10 and 800),
  rating smallint check (rating between 1 and 5),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  moderation_reason text,
  created_at timestamptz not null default now()
);

alter table public.portfolio_reviews enable row level security;

drop policy if exists "public read approved reviews" on public.portfolio_reviews;
create policy "public read approved reviews"
  on public.portfolio_reviews for select
  using (status = 'approved');

drop policy if exists "admins manage reviews" on public.portfolio_reviews;
create policy "admins manage reviews"
  on public.portfolio_reviews for all
  to authenticated
  using (exists(select 1 from public.admin_users a where a.user_id=auth.uid() and a.active))
  with check (exists(select 1 from public.admin_users a where a.user_id=auth.uid() and a.active));

-- Envío público: cualquiera (incluso sin cuenta) puede proponer una
-- reseña, pero SOLO a través de esta función — nunca con INSERT directo
-- — para poder validar longitud, filtrar palabras prohibidas (reutiliza
-- banned_words, igual que la moderación de Comunidad) y aplicar un
-- límite básico anti-spam.
create or replace function public.submit_portfolio_review(p_name text, p_body text, p_rating int default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  clean_name text := trim(coalesce(p_name,''));
  clean_body text := trim(coalesce(p_body,''));
  blocked boolean := false;
  recent_count int;
  new_id uuid;
  final_status text := 'pending';
begin
  if char_length(clean_name) < 2 or char_length(clean_name) > 60 then
    raise exception 'NAME_INVALID';
  end if;
  if char_length(clean_body) < 10 or char_length(clean_body) > 800 then
    raise exception 'BODY_INVALID';
  end if;
  if p_rating is not null and (p_rating < 1 or p_rating > 5) then
    raise exception 'RATING_INVALID';
  end if;

  select count(*) into recent_count from public.portfolio_reviews
    where lower(name) = lower(clean_name) and created_at > now() - interval '10 minutes';
  if recent_count > 0 then raise exception 'RATE_LIMIT'; end if;

  select exists(
    select 1 from public.banned_words b
    where b.active and position(lower(b.term) in lower(clean_body)) > 0
  ) into blocked;
  if blocked then final_status := 'rejected'; end if;

  insert into public.portfolio_reviews (name, body, rating, status)
  values (clean_name, clean_body, p_rating, final_status)
  returning id into new_id;

  return jsonb_build_object('id', new_id, 'status', final_status);
end; $$;
revoke all on function public.submit_portfolio_review(text,text,int) from public;
grant execute on function public.submit_portfolio_review(text,text,int) to anon, authenticated;
