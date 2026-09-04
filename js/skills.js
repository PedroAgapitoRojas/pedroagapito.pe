(() => {
  'use strict';

  const grid = document.getElementById('skillsGrid');
  const modal = document.getElementById('skillsExplorer');
  const allGrid = document.getElementById('allSkillsGrid');
  const search = document.getElementById('skillsSearch');
  const closeButtons = modal?.querySelectorAll('[data-skills-close]') || [];
  if (!grid || !modal || !allGrid) return;

  const fallback = [
    ['HTML5','html5','Estructura semántica para construir interfaces web accesibles y bien organizadas.','Desarrollo web','<>','Principal',1,true,true],
    ['CSS3','css3','Diseño visual, responsive design, animaciones y sistemas de componentes consistentes.','Desarrollo web','{}','Principal',2,true,true],
    ['JavaScript','javascript','Lógica e interacción del frontend: eventos, DOM, validaciones y APIs.','Desarrollo web','JS','Principal',3,true,true],
    ['Python','python','Programación, automatización, análisis de datos y desarrollo de scripts útiles.','Python / Data','🐍','Principal',4,true,true],
    ['Git & GitHub','git-github','Control de versiones, ramas, commits y colaboración mediante repositorios.','Herramientas','⌘','Principal',5,true,true],
    ['Docker','docker','Contenerización y entornos reproducibles para ejecutar aplicaciones de forma consistente.','Cloud / DevOps','🐳','Principal',6,true,true],
    ['Pandas','pandas','Manipulación y análisis de datos tabulares con DataFrames.','Python / Data','🐼','Intermedio',7,false,true],
    ['NumPy','numpy','Cálculo numérico eficiente y trabajo con arreglos multidimensionales en Python.','Python / Data','∑','Intermedio',8,false,true],
    ['Matplotlib','matplotlib','Visualización de datos en Python mediante gráficos configurables y reproducibles.','Python / Data','📊','Intermedio',9,false,true],
    ['ETL','etl','Extracción, transformación y carga de datos para construir flujos reproducibles.','Python / Data','⇄','Intermedio',10,false,true],
    ['SQL Server','sql-server','Modelado y consulta de datos relacionales con SQL Server.','Bases de datos','SQL','Intermedio',11,false,true],
    ['Oracle SQL','oracle-sql','Consultas y gestión de datos en entornos Oracle.','Bases de datos','OR','Intermedio',12,false,false],
    ['MySQL','mysql','Sistema de gestión de bases de datos relacionales ampliamente utilizado en aplicaciones web.','Bases de datos','MY','Intermedio',13,false,true],
    ['PostgreSQL','postgresql','Base de datos relacional robusta utilizada también como motor de este proyecto.','Bases de datos','PG','Intermedio',14,false,true],
    ['MongoDB','mongodb','Base de datos documental orientada a esquemas flexibles y aplicaciones modernas.','Bases de datos','M','En aprendizaje',15,false,false],
    ['SQLite','sqlite','Base de datos ligera embebida, útil para aplicaciones y prototipos locales.','Bases de datos','SQ','Intermedio',16,false,false],
    ['SQL','sql','Lenguaje estándar para consultar y manipular datos relacionales.','Bases de datos','SQL','Intermedio',17,false,true],
    ['XML','xml','Lenguaje de marcado utilizado para estructurar y transportar datos y configurar interfaces.','Desarrollo','XML','Intermedio',18,false,false],
    ['FlutterFlow','flutterflow','Herramienta visual para construir prototipos y aplicaciones Flutter con un flujo low-code.','Desarrollo móvil','FF','En aprendizaje',19,false,false],
    ['AWS','aws','Servicios cloud para desplegar, proteger y escalar aplicaciones y datos.','Cloud / DevOps','☁','En aprendizaje',15,false,true],
    ['Supabase','supabase','Backend gestionado con PostgreSQL, autenticación, almacenamiento y RLS.','Cloud / Backend','⚡','Intermedio',16,false,true],
    ['Flutter','flutter','Framework multiplataforma para construir interfaces con Dart.','Desarrollo móvil','▣','En aprendizaje',17,false,true],
    ['Dart','dart','Lenguaje utilizado para construir aplicaciones Flutter.','Desarrollo móvil','D','En aprendizaje',18,false,false],
    ['Firebase','firebase','Servicios backend para autenticación, datos y almacenamiento.','Cloud / Backend','🔥','En aprendizaje',19,false,false],
    ['Figma','figma','Diseño de interfaces, prototipado y colaboración visual.','Diseño','F','Intermedio',20,false,true],
    ['Cisco Packet Tracer','cisco-packet-tracer','Simulación de redes para practicar topologías, direccionamiento y conectividad.','Redes','⌁','Intermedio',21,false,false],
    ['Kotlin','kotlin','Lenguaje moderno y conciso para desarrollo, especialmente Android.','Desarrollo móvil','K','Intermedio',22,false,true],
    ['Java','java','Lenguaje orientado a objetos para aplicaciones empresariales y multiplataforma.','Desarrollo','J','Intermedio',23,false,true],
    ['Responsive Design','responsive-design','Diseño adaptable para móviles, tablets y escritorio.','Desarrollo web','↔','Principal',23,false,true],
    ['Unity','unity','Motor de desarrollo para experiencias interactivas y prototipos 2D/3D.','Desarrollo interactivo','U','En aprendizaje',24,false,false],
    ['Arena','arena','Herramienta de simulación de eventos discretos para modelar sistemas.','Simulación','A','En aprendizaje',25,false,false],
    ['Arduino Uno','arduino-uno','Plataforma de prototipado electrónico para sensores, actuadores y control.','Hardware / IoT','⚙','En aprendizaje',26,false,false],
    ['Git','git','Sistema de control de versiones distribuido.','Herramientas','⌘','Intermedio',27,false,false]
  ].map(([name,slug,description,category,icon,level,display_order,featured,practice_enabled]) => ({name,slug,description,category,icon,level,display_order,featured,practice_enabled,practice_intro:'Practica con un ejercicio guiado y luego comparte tu solución en Comunidad.',exercises:[]}));

  let technologies = [...fallback];

  const esc = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');

  function normalize(data) {
    return (data || []).map(item => ({
      ...item,
      exercises: Array.isArray(item.exercises) ? item.exercises : [],
      practice_enabled: Boolean(item.practice_enabled),
      featured: Boolean(item.featured)
    })).sort((a,b) => (a.display_order ?? 999) - (b.display_order ?? 999));
  }

  function card(item) {
    const exercise = item.exercises?.[0];
    return `<article class="skill-card skill-card-dynamic stagger-item" tabindex="0" role="button" aria-pressed="false" aria-label="${esc(item.name)}: toca para ver descripción" data-tech-slug="${esc(item.slug)}">
      <div class="skill-card-inner">
        <div class="skill-card-face skill-card-front">
          <span class="skill-icon" aria-hidden="true">${esc(item.icon || '◇')}</span>
          <span class="skill-name">${esc(item.name)}</span>
          <small class="skill-level">${esc(item.level || 'Intermedio')}</small>
        </div>
        <div class="skill-card-face skill-card-back">
          <strong>${esc(item.name)}</strong>
          <span>${esc(item.description)}</span>
          ${exercise ? `<small class="exercise-hint">${esc(exercise.difficulty || 'Ejercicio guiado')} · ${esc(exercise.title || 'Práctica')}</small>` : ''}
          <small>Toca para volver ↻</small>
        </div>
      </div>
    </article>`;
  }

  function bindCards(root) {
    root.querySelectorAll('.skill-card').forEach(cardEl => {
      const flip = event => {
        cardEl.classList.toggle('is-flipped');
        cardEl.setAttribute('aria-pressed', String(cardEl.classList.contains('is-flipped')));
      };
      cardEl.addEventListener('click', flip);
      cardEl.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); flip(event); }
      });
      cardEl.addEventListener('pointermove', event => {
        const rect = cardEl.getBoundingClientRect();
        cardEl.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
        cardEl.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`);
      });
      cardEl.addEventListener('pointerleave', () => { cardEl.style.removeProperty('--mx'); cardEl.style.removeProperty('--my'); });
    });
  }

  function renderFeatured() {
    const featured = technologies.filter(t => t.featured);
    const nonFeatured = technologies.filter(t => !t.featured);
    // Muestra 10 destacadas: primero las marcadas como featured y luego completa
    // automáticamente con las siguientes tecnologías por orden.
    const items = [...featured, ...nonFeatured].slice(0,10);
    grid.innerHTML = items.map(card).join('');
    bindCards(grid);
  }

  function renderAll(query='') {
    const q = query.trim().toLowerCase();
    const rows = technologies.filter(t => !q || `${t.name} ${t.description} ${t.category}`.toLowerCase().includes(q));
    allGrid.innerHTML = rows.length ? rows.map(card).join('') : `<p class="skills-empty">No encontramos una tecnología con “${esc(query)}”.</p>`;
    bindCards(allGrid);
  }

  function openModal() {
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
    if (search) { search.value=''; renderAll(); setTimeout(() => search.focus(), 30); }
  }
  function closeModal() { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }

  document.getElementById('showAllSkills')?.addEventListener('click', openModal);
  closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });
  search?.addEventListener('input', () => renderAll(search.value));

  window.getPortfolioTechnologies = () => [...technologies];

  async function load() {
    try {
      const cfg = window.PEDRO_SUPABASE, sdk = window.supabase;
      if (cfg?.url && cfg?.publishableKey && sdk?.createClient) {
        const db = window.portfolioSupabaseClient || sdk.createClient(cfg.url, cfg.publishableKey, { auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true } });
        window.portfolioSupabaseClient = db;
        const { data, error } = await db.from('technologies').select('*').eq('status','published').order('display_order',{ascending:true});
        if (!error && data?.length) {
          const normalized = normalize(data);
          const backendFallback = fallback.filter(x => ['python','java','kotlin','sql','docker'].includes(x.slug));
          const present = new Set(normalized.map(x => x.slug));
          technologies = normalize([...normalized, ...backendFallback.filter(x => !present.has(x.slug))]);
        }
      }
    } catch (error) { console.warn('Tecnologías: se usa fallback local.', error); }
    renderFeatured();
  }

  load();
})();
