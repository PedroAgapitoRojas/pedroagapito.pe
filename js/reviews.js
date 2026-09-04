(() => {
  'use strict';
  const cfg = window.PEDRO_SUPABASE;
  const list = document.getElementById('reviewsList');
  const form = document.getElementById('reviewForm');
  const formMsg = document.getElementById('reviewFormMessage');
  if (!list || !form) return;
  if (!cfg?.url || !cfg?.publishableKey || !window.supabase?.createClient) {
    list.innerHTML = '<div class="reviews-empty">No se pudieron cargar las reseñas.</div>';
    return;
  }
  const db = window.portfolioSupabaseClient || window.supabase.createClient(cfg.url, cfg.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  window.portfolioSupabaseClient = db;
  const esc = v => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');

  async function loadReviews() {
    const { data, error } = await db.from('portfolio_reviews')
      .select('id,name,body,rating,created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) { list.innerHTML = '<div class="reviews-empty">No se pudieron cargar las reseñas.</div>'; return; }
    const rows = data || [];
    if (!rows.length) { list.innerHTML = '<div class="reviews-empty">Todavía no hay reseñas publicadas. ¡Sé el primero en dejar una!</div>'; return; }
    list.innerHTML = rows.map(r => `<article class="review-card"><div class="review-card-top"><strong>${esc(r.name)}</strong>${r.rating ? `<span class="review-stars">${'⭐'.repeat(r.rating)}</span>` : ''}</div><p>${esc(r.body)}</p><time>${esc(new Date(r.created_at).toLocaleDateString('es-PE'))}</time></article>`).join('');
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(form);
    const name = String(f.get('name') || '').trim();
    const body = String(f.get('body') || '').trim();
    const ratingRaw = f.get('rating');
    const rating = ratingRaw ? Number(ratingRaw) : null;
    formMsg.textContent = 'Enviando…'; formMsg.className = 'reviews-form-message';
    try {
      const { data, error } = await db.rpc('submit_portfolio_review', { p_name: name, p_body: body, p_rating: rating });
      if (error) throw error;
      const friendly = {
        NAME_INVALID: 'Tu nombre debe tener entre 2 y 60 caracteres.',
        BODY_INVALID: 'Tu reseña debe tener entre 10 y 800 caracteres.',
        RATING_INVALID: 'La calificación no es válida.',
        RATE_LIMIT: 'Ya enviaste una reseña hace poco. Intenta de nuevo más tarde.'
      };
      if (data?.status === 'rejected') {
        formMsg.textContent = 'Tu reseña no cumple con las normas de contenido.';
        formMsg.className = 'reviews-form-message error';
      } else {
        formMsg.textContent = '¡Gracias! Tu reseña quedó pendiente de revisión.';
        formMsg.className = 'reviews-form-message success';
        form.reset();
      }
    } catch (error) {
      const friendly = {
        NAME_INVALID: 'Tu nombre debe tener entre 2 y 60 caracteres.',
        BODY_INVALID: 'Tu reseña debe tener entre 10 y 800 caracteres.',
        RATING_INVALID: 'La calificación no es válida.',
        RATE_LIMIT: 'Ya enviaste una reseña hace poco. Intenta de nuevo más tarde.'
      };
      formMsg.textContent = friendly[error.code] || error.message || 'No se pudo enviar tu reseña.';
      formMsg.className = 'reviews-form-message error';
    }
  });

  loadReviews();
})();
