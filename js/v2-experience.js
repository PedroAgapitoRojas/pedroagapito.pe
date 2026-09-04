(() => {
  const body = document.body;
  const hero = document.querySelector('.hero');
  const stage = document.querySelector('.v2-tilt-stage');
  const toggle = document.getElementById('experienceSwitch');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;

  toggle?.addEventListener('click', () => {
    const next = body.dataset.experience === 'systems' ? 'culture' : 'systems';
    body.dataset.experience = next;
    [...toggle.children].forEach((el, i) => el.classList.toggle('is-active', (next === 'systems' && i === 0) || (next === 'culture' && i === 1)));
  });

  if (!reduceMotion && finePointer && hero && stage) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      stage.style.transform = `rotateX(${(-y*2.4).toFixed(2)}deg) rotateY(${(x*3.2).toFixed(2)}deg) translate3d(${(x*5).toFixed(1)}px,${(y*4).toFixed(1)}px,0)`;
    });
    hero.addEventListener('pointerleave', () => stage.style.transform = '');

    document.querySelectorAll('.v2-skills-grid .skill-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        if (card.classList.contains('is-flipped')) return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`rotateX(${(-y*7).toFixed(1)}deg) rotateY(${(x*9).toFixed(1)}deg) translateY(-3px)`;
      });
      card.addEventListener('pointerleave',()=>card.style.transform='');
    });
  }

  if (!reduceMotion) {
    const orbs = document.querySelectorAll('.v2-ambient i');
    addEventListener('scroll', () => {
      const y = scrollY;
      orbs.forEach((o,i)=>o.style.transform=`translate3d(0,${(y*(.018+i*.008)).toFixed(1)}px,0)`);
    }, {passive:true});
  }
})();

/* =========================================================
   TECHNOLOGY LAB — Phase 1
   Separate HTML / CSS / JavaScript editors + real preview.
   Browser execution is isolated in a sandboxed iframe.
========================================================= */
(() => {
  'use strict';

  const lab = document.getElementById('codeLab');
  if (!lab) return;

  const title = document.getElementById('codeLabTitle');
  const lessonTitle = document.getElementById('codeLabLessonTitle');
  const lesson = document.getElementById('codeLabLesson');
  const challenge = document.getElementById('codeLabChallenge');
  const status = document.getElementById('codeLabStatus');
  const errorBox = document.getElementById('codeLabError');
  const fileName = document.getElementById('codeLabFileName');
  const editorStatus = document.getElementById('codeLabEditorStatus');
  const frame = document.getElementById('codeLabFrame');
  const saveButton = document.getElementById('savePractice');
  const runButton = document.getElementById('runCodeLab');
  const publishButton = document.getElementById('publishPractice');

  const editors = {
    html: document.getElementById('codeLabInputHtml'),
    css: document.getElementById('codeLabInputCss'),
    javascript: document.getElementById('codeLabInputJs')
  };

  const fileNames = {
    html: 'index.html',
    css: 'styles.css',
    javascript: 'script.js'
  };

  const defaultWebExercises = {
    HTML5: {
      title: 'Estructura semántica',
      statement: 'Construye la estructura HTML y observa cómo el preview se actualiza al ejecutar.',
      challenge: 'Reto: añade una sección de proyectos y un enlace interno.',
      html: `<header>
  <nav><a href="#proyectos">Proyectos</a></nav>
</header>
<main>
  <h1>Mi proyecto</h1>
  <p>Estoy practicando desarrollo web.</p>
  <section id="proyectos">
    <h2>Proyectos</h2>
    <p>Mi primer proyecto web.</p>
  </section>
</main>
<footer>Pedro Agapito</footer>`,
      css: `body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 32px;
  line-height: 1.6;
}
a { color: #2563eb; }
section { margin-top: 24px; }`,
      javascript: `console.log("Práctica HTML ejecutada");`
    },
    CSS3: {
      title: 'Tarjeta responsive',
      statement: 'Crea una tarjeta con padding, borde, sombra y adaptación a pantallas pequeñas.',
      challenge: 'Reto: añade un hover que eleve suavemente la tarjeta.',
      html: `<main class="page">
  <article class="card">
    <span class="tag">CSS3</span>
    <h1>Mi tarjeta responsive</h1>
    <p>Estoy aprendiendo diseño adaptable.</p>
    <button id="demo">Probar interacción</button>
    <small id="message"></small>
  </article>
</main>`,
      css: `.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  box-sizing: border-box;
  background: #f4f7fb;
}
.card {
  width: 100%;
  max-width: 420px;
  padding: 24px;
  border: 1px solid #d7dde8;
  border-radius: 16px;
  background: white;
  box-shadow: 0 10px 30px rgba(15, 23, 42, .12);
  box-sizing: border-box;
  transition: transform .25s ease, box-shadow .25s ease;
}
.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 36px rgba(15, 23, 42, .18);
}
.tag {
  display: inline-block;
  padding: 4px 9px;
  border-radius: 999px;
  background: #e8f5ee;
  color: #176b42;
  font-size: 12px;
  font-weight: 700;
}
button {
  padding: 10px 14px;
  border: 0;
  border-radius: 10px;
  background: #176b42;
  color: white;
  cursor: pointer;
}
#message { display: block; margin-top: 12px; }
@media (max-width: 600px) {
  .page { padding: 16px; }
  .card { padding: 16px; }
}`,
      javascript: `const button = document.querySelector("#demo");
const message = document.querySelector("#message");

button?.addEventListener("click", () => {
  message.textContent = "¡Hover y JavaScript funcionando!";
});`
    },
    JavaScript: {
      title: 'Interacción con el DOM',
      statement: 'Modifica el DOM desde JavaScript y observa el resultado real en el preview.',
      challenge: 'Reto: haz que el botón alterne entre dos mensajes.',
      html: `<main class="app">
  <h1>JavaScript</h1>
  <button id="btn">Haz clic</button>
  <p id="out">Esperando…</p>
</main>`,
      css: `body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 32px;
  background: #f8fafc;
}
.app {
  max-width: 520px;
  margin: 0 auto;
  padding: 24px;
  border: 1px solid #dbe3ee;
  border-radius: 16px;
  background: white;
}
button {
  padding: 10px 14px;
  border: 0;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  cursor: pointer;
}`,
      javascript: `const btn = document.querySelector("#btn");
const out = document.querySelector("#out");

btn.addEventListener("click", () => {
  out.textContent = "¡JavaScript está vivo!";
});`
    }
  };

  let currentTechnology = null;
  let currentExercise = null;
  let currentFile = 'html';
  let currentViewport = 'desktop';
  let dirty = false;
  let currentPracticeId = null;
  let lastRunToken = 0;

  const fallbackExercise = name => ({
    title: `Práctica ${name || 'web'}`,
    statement: `Prepara una solución pequeña con ${name || 'esta tecnología'}.`,
    challenge: 'Reto: comprueba tu solución y compártela cuando esté lista.',
    html: `<main>
  <h1>Práctica ${name || 'web'}</h1>
  <p>Escribe aquí la estructura de tu práctica.</p>
</main>`,
    css: `body {
  font-family: system-ui, sans-serif;
  padding: 24px;
}
main {
  max-width: 640px;
  margin: auto;
}`,
    javascript: `console.log("Práctica ${name || 'web'}");`
  });

  const getExercise = item => {
    const name = item?.name || '';
    if (defaultWebExercises[name]) return defaultWebExercises[name];

    const configured = item?.exercises?.[0];
    if (configured && typeof configured === 'object') {
      // El CMS actual guarda ejercicios como JSON. Si trae archivos separados,
      // los respetamos; si no, usamos el código como HTML para no perderlo.
      return {
        ...fallbackExercise(name),
        ...configured,
        html: configured.html || (configured.code && ['HTML5','CSS3','JavaScript'].includes(name) ? configured.code : fallbackExercise(name).html),
        css: configured.css || fallbackExercise(name).css,
        javascript: configured.javascript || fallbackExercise(name).javascript
      };
    }
    return fallbackExercise(name);
  };

  const setError = text => {
    errorBox.textContent = text || '';
    errorBox.classList.toggle('is-visible', Boolean(text));
  };

  const setDirty = value => {
    dirty = value;
    editorStatus.textContent = value ? 'Cambios sin guardar' : 'Guardado';
  };

  const escapeForStyle = value => String(value ?? '').replaceAll('</style', '<\\/style');
  const escapeForScript = value => String(value ?? '').replaceAll('</script', '<\\/script');

  function buildDocument() {
    const html = editors.html.value;
    const css = escapeForStyle(editors.css.value);
    const js = escapeForScript(editors.javascript.value);

    return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
html, body { min-height: 100%; }
body { box-sizing: border-box; }
*, *::before, *::after { box-sizing: inherit; }
${css}
</style>
</head>
<body>
${html}
<script>
window.addEventListener('error', function(event) {
  parent.postMessage({ type: 'pa-lab-error', message: event.message || 'Error de JavaScript' }, '*');
});
window.addEventListener('unhandledrejection', function(event) {
  parent.postMessage({ type: 'pa-lab-error', message: String(event.reason || 'Promesa rechazada') }, '*');
});
try {
${js}
} catch (error) {
  parent.postMessage({ type: 'pa-lab-error', message: error?.message || 'Error de JavaScript' }, '*');
}
<\/script>
</body>
</html>`;
  }

  function run() {
    setError('');
    const token = ++lastRunToken;
    status.textContent = 'Ejecutando…';
    frame.srcdoc = buildDocument();
    frame.dataset.runToken = String(token);
    setTimeout(() => {
      if (token === lastRunToken) status.textContent = 'Ejecutado ✓';
    }, 350);
  }

  function switchFile(file) {
    currentFile = file;
    document.querySelectorAll('[data-file-tab]').forEach(tab => {
      const active = tab.dataset.fileTab === file;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    Object.entries(editors).forEach(([key, input]) => input.classList.toggle('is-active', key === file));
    fileName.textContent = fileNames[file];
    editors[file]?.focus();
  }

  function setViewport(viewport) {
    currentViewport = viewport;
    const device = document.getElementById('codePreviewDevice');
    device.className = `code-preview-device ${viewport}`;
    document.querySelectorAll('[data-viewport]').forEach(button => button.classList.toggle('is-active', button.dataset.viewport === viewport));
    frame.setAttribute('aria-label', `Resultado en ${viewport}`);
  }

  function projectPayload() {
    return {
      title: currentExercise?.title ? `${currentExercise.title} · ${currentTechnology?.name || 'Web'}` : `Práctica ${currentTechnology?.name || 'Web'}`,
      technology: currentTechnology?.name || 'HTML5',
      files: {
        'index.html': editors.html.value,
        'styles.css': editors.css.value,
        'script.js': editors.javascript.value
      },
      preview: buildDocument(),
      saved_at: new Date().toISOString()
    };
  }

  function localSave() {
    const payload = projectPayload();
    localStorage.setItem('pa-lab-practice', JSON.stringify(payload));
    setDirty(false);
    status.textContent = 'Guardado localmente ✓';
  }

  async function supabaseSave() {
    const client = window.portfolioSupabaseClient || (
      window.PEDRO_SUPABASE && window.supabase?.createClient
        ? (window.portfolioSupabaseClient = window.supabase.createClient(
            window.PEDRO_SUPABASE.url,
            window.PEDRO_SUPABASE.publishableKey,
            { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
          ))
        : null
    );
    if (!client) return { ok: false, reason: 'no-client' };

    const { data: sessionData } = await client.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return { ok: false, reason: 'no-session' };

    const payload = projectPayload();
    let practiceId = currentPracticeId;

    if (practiceId) {
      const { error } = await client.from('practices')
        .update({ title: payload.title, technology: payload.technology, updated_at: new Date().toISOString() })
        .eq('id', practiceId)
        .eq('user_id', user.id);
      if (error) return { ok: false, reason: error.code || error.message };
    } else {
      const { data, error } = await client.from('practices').insert({
        user_id: user.id,
        title: payload.title,
        technology: payload.technology,
        status: 'draft'
      }).select('id').single();
      if (error) return { ok: false, reason: error.code || error.message };
      practiceId = data.id;
      currentPracticeId = practiceId;
    }

    const files = Object.entries(payload.files).map(([path, content]) => ({
      practice_id: practiceId,
      path,
      content,
      updated_at: new Date().toISOString()
    }));
    const { error: filesError } = await client.from('practice_files').upsert(files, { onConflict: 'practice_id,path' });
    if (filesError) return { ok: false, reason: filesError.code || filesError.message };

    setDirty(false);
    status.textContent = 'Guardado en Supabase ✓';
    return { ok: true, id: practiceId };
  }

  async function save() {
    setError('');
    status.textContent = 'Guardando…';
    try {
      const result = await supabaseSave();
      if (result.ok) return;
      // Hasta que la migración de prácticas esté aplicada, no se pierde el trabajo.
      localSave();
      if (result.reason && result.reason !== 'no-session' && result.reason !== 'no-client') {
        setError('La estructura de prácticas todavía no está disponible en Supabase. Se guardó una copia local para no perder tu trabajo.');
      } else if (result.reason === 'no-session') {
        status.textContent = 'Guardado localmente · inicia sesión para sincronizar';
      }
    } catch (error) {
      localSave();
      setError('No se pudo sincronizar con Supabase. Se guardó una copia local para proteger tu trabajo.');
    }
  }

  function open(item) {
    currentTechnology = item || { name: 'HTML5' };
    currentExercise = getExercise(currentTechnology);
    currentPracticeId = null;
    title.textContent = `Practica ${currentTechnology.name || 'Web'}`;
    lessonTitle.textContent = currentExercise.title || 'Ejercicio guiado';
    lesson.textContent = currentExercise.statement || 'Edita cada archivo y ejecuta el proyecto.';
    challenge.textContent = currentExercise.challenge || 'Reto: mejora la solución y comprueba el resultado.';

    editors.html.value = currentExercise.html || '';
    editors.css.value = currentExercise.css || '';
    editors.javascript.value = currentExercise.javascript || '';
    setDirty(false);
    switchFile('html');
    setViewport('desktop');
    setError('');
    status.textContent = 'Listo para probar';
    run();
    lab.classList.add('is-open');
    lab.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  document.querySelectorAll('[data-file-tab]').forEach(tab => {
    tab.addEventListener('click', () => switchFile(tab.dataset.fileTab));
  });

  Object.values(editors).forEach(input => {
    input.addEventListener('input', () => {
      setDirty(true);
      status.textContent = 'Cambios sin ejecutar';
      setError('');
    });
    input.addEventListener('keydown', event => {
      if (event.key === 'Tab') {
        event.preventDefault();
        const start = input.selectionStart;
        const end = input.selectionEnd;
        input.value = input.value.slice(0, start) + '  ' + input.value.slice(end);
        input.selectionStart = input.selectionEnd = start + 2;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });

  document.querySelectorAll('[data-viewport]').forEach(button => {
    button.addEventListener('click', () => setViewport(button.dataset.viewport));
  });

  runButton?.addEventListener('click', run);
  saveButton?.addEventListener('click', save);

  publishButton?.addEventListener('click', () => {
    const payload = projectPayload();
    sessionStorage.setItem('pa-community-draft', JSON.stringify({
      technology: payload.technology,
      title: payload.title,
      code: `<!-- index.html -->\n${payload.files['index.html']}\n\n/* styles.css */\n${payload.files['styles.css']}\n\n// script.js\n${payload.files['script.js']}`,
      nickname: 'PedroLab'
    }));
    window.location.href = `community/?technology=${encodeURIComponent(payload.technology)}`;
  });

  lab.querySelectorAll('[data-lab-close]').forEach(button => {
    button.addEventListener('click', () => {
      lab.classList.remove('is-open');
      lab.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && lab.classList.contains('is-open')) {
      lab.classList.remove('is-open');
      lab.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });

  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow) return;
    if (event.data?.type === 'pa-lab-error') {
      setError(`Error en tu código: ${event.data.message}`);
      status.textContent = 'Revisa el código';
    }
  });

  // Se conserva la API existente para skills.js.
  window.openTechnologyLab = open;
})();
