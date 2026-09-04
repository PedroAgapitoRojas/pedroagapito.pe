/* Public CMS bridge: Supabase -> existing portfolio UI.
   If Supabase is unavailable, the local content.js data remains as fallback. */
(function () {
  const fallback = () => window.portfolioContent || { projects: [], publications: [], certificates: [] };

  function formatDate(value) {
    if (!value) return '';
    try {
      return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
        .format(new Date(value))
        .replace('.', '');
    } catch (_) {
      return '';
    }
  }

  window.loadPortfolioContent = async function loadPortfolioContent() {
    const cfg = window.PEDRO_SUPABASE;
    const sdk = window.supabase;
    if (!cfg?.url || !cfg?.publishableKey || !sdk?.createClient) return fallback();

    try {
      const client = window.portfolioSupabaseClient || sdk.createClient(cfg.url, cfg.publishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      window.portfolioSupabaseClient = client;

      const [projectsRes, postsRes, certsRes] = await Promise.all([
        client.from('projects')
          .select('id,name,slug,description,image_url,image_label,project_url,github_url,technologies,status,display_order')
          .in('status', ['development', 'published'])
          .order('display_order', { ascending: true }),
        client.from('posts')
          .select('id,title,slug,excerpt,content,category,cover_image_url,image_alt,published_at,status')
          .eq('status', 'published')
          .order('published_at', { ascending: false, nullsFirst: false }),
        client.from('certificates')
          .select('id,title,platform,description,icon,image_url,credential_url,issue_date,status,display_order')
          .eq('status', 'published')
          .order('display_order', { ascending: true })
      ]);

      if (projectsRes.error || postsRes.error || certsRes.error) {
        console.warn('CMS fallback activo:', projectsRes.error || postsRes.error || certsRes.error);
        return fallback();
      }

      const local = fallback();
      const content = {
        projects: (projectsRes.data || []).map(project => ({
          id: project.id,
          title: project.name,
          slug: project.slug,
          image: project.image_url || '',
          imageClass: project.slug === 'paso-y-tradicion' ? 'project-image-paso' : 'project-image-academicos',
          imageLabel: project.image_label || project.name,
          description: project.description || '',
          tech: project.technologies || [],
          status: project.status === 'published' ? 'Publicado' : 'En desarrollo',
          url: project.project_url || project.github_url || ''
        })),
        publications: (postsRes.data || []).map(post => ({
          id: post.slug || post.id,
          dbId: post.id,
          title: post.title,
          category: post.category || 'Novedad',
          date: formatDate(post.published_at),
          image: post.cover_image_url || '',
          imageAlt: post.image_alt || post.title,
          excerpt: post.excerpt || '',
          content: post.content || ''
        })),
        certificates: (certsRes.data || []).map(certificate => ({
          id: certificate.id,
          title: certificate.title,
          platform: certificate.platform || '',
          description: certificate.description || '',
          icon: certificate.icon || '🎓',
          image: certificate.image_url || '',
          pdf: certificate.credential_url || '',
          issueDate: certificate.issue_date || '',
          order: certificate.display_order ?? 999
        }))
      };

      // Defensive fallback if a table is unexpectedly empty during first deployment.
      if (!content.projects.length) content.projects = local.projects || [];
      if (!content.publications.length) content.publications = local.publications || [];
      if (!content.certificates.length) content.certificates = local.certificates || [];

      window.portfolioContent = content;
      return content;
    } catch (error) {
      console.warn('No se pudo cargar Supabase; se usa contenido local.', error);
      return fallback();
    }
  };
})();
