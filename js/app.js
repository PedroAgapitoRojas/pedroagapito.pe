
/* =========================
   MENU MOBILE — V21 ROBUSTO
========================= */

const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');
const headerEl = document.querySelector('.header');

function syncHeaderHeight() {
    const h = headerEl ? Math.ceil(headerEl.getBoundingClientRect().height) : 76;
    document.documentElement.style.setProperty('--app-header-h', `${h}px`);
}

function setMobileMenu(open) {
    if (!menuToggle || !navMenu) return;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const shouldOpen = Boolean(open && isMobile);

    navMenu.classList.toggle('active', shouldOpen);
    document.body.classList.toggle('mobile-menu-open', shouldOpen);
    headerEl?.classList.toggle('menu-open', shouldOpen);
    menuToggle.setAttribute('aria-expanded', String(shouldOpen));
    menuToggle.setAttribute('aria-label', shouldOpen ? 'Cerrar menú' : 'Abrir menú');
    menuToggle.textContent = shouldOpen ? '✕' : '☰';

    // Fallback deliberado: fuerza visibilidad aunque alguna regla CSS heredada compita.
    if (isMobile) {
        navMenu.style.display = shouldOpen ? 'flex' : 'none';
        navMenu.style.visibility = shouldOpen ? 'visible' : 'hidden';
        navMenu.style.opacity = shouldOpen ? '1' : '0';
        navMenu.style.pointerEvents = shouldOpen ? 'auto' : 'none';
    } else {
        navMenu.style.removeProperty('display');
        navMenu.style.removeProperty('visibility');
        navMenu.style.removeProperty('opacity');
        navMenu.style.removeProperty('pointer-events');
    }
}

syncHeaderHeight();

menuToggle?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setMobileMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});

navItems.forEach(link => {
    link.addEventListener('click', () => setMobileMenu(false));
});

document.addEventListener('click', (event) => {
    if (!document.body.classList.contains('mobile-menu-open')) return;
    if (!event.target.closest('.nav-links') && !event.target.closest('.menu-toggle')) {
        setMobileMenu(false);
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMobileMenu(false);
});

window.addEventListener('resize', () => {
    syncHeaderHeight();
    if (window.innerWidth > 768) setMobileMenu(false);
}, { passive: true });

window.addEventListener('orientationchange', () => {
    setTimeout(syncHeaderHeight, 120);
});

/* =========================
   SCROLL SPY
========================= */

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            const id = entry.target.id;

            navLinks.forEach(link => link.classList.remove("active"));

            const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);

            if (activeLink) {
                activeLink.classList.add("active");
            }
        }
    });

}, {
    root: null,
    threshold: 0.6
});

sections.forEach(section => observer.observe(section));


/* =========================
   NAVBAR SCROLL EFFECT — V20
   La cabecera permanece siempre accesible.
========================= */

const header = document.querySelector(".header");
let scrollTicking = false;

function updateHeaderOnScroll() {
    const currentY = Math.max(window.scrollY, 0);
    header?.classList.toggle('scrolled', currentY > 50);
    header?.classList.remove('header-hidden');
    scrollTicking = false;
}

window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        requestAnimationFrame(updateHeaderOnScroll);
        scrollTicking = true;
    }
}, { passive: true });

updateHeaderOnScroll();


/* =========================
   REVEAL ANIMATIONS (FIXED)
========================= */

const revealElements = document.querySelectorAll(".reveal");
if (window.innerWidth > 768 && 'IntersectionObserver' in window) document.body.classList.add('js-reveal');

function ensureMobileRevealVisibility() {
    if (window.innerWidth <= 768) {
        revealElements.forEach(el => el.classList.add('active'));
    }
}

if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px 80px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
} else {
    revealElements.forEach(el => el.classList.add('active'));
}

ensureMobileRevealVisibility();
window.addEventListener('resize', ensureMobileRevealVisibility, { passive: true });



/* =========================
   CERTIFICATE MODAL
========================= */

const modal = document.getElementById("certificateModal");

const modalFrame = document.getElementById("certificateFrame");

const closeModal = document.getElementById("closeModal");

document.addEventListener("click", (event) => {
    const button = event.target.closest(".certificate-link");
    if (!button) return;
    const pdf = button.getAttribute("data-pdf");
    if (!pdf) return;
    modalFrame.src = pdf;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
});

closeModal.addEventListener("click", () => {

    modal.classList.remove("active");

    modalFrame.src = "";

    document.body.style.overflow = "auto";

});

modal.addEventListener("click", (e) => {

    if (e.target === modal) {

        modal.classList.remove("active");

        modalFrame.src = "";

        document.body.style.overflow = "auto";

    }

});

/* =========================
   CONTENIDO DINÁMICO (SUPABASE + FALLBACK LOCAL)
========================= */
let portfolioContent = window.portfolioContent || { projects: [], publications: [], certificates: [] };

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function safeUrl(value) {
    const url = String(value || '').trim();
    if (!url) return '';
    if (/^(https?:\/\/|mailto:|\/|\.\/|\.\.\/|img\/)/i.test(url)) return url;
    return '';
}

function renderPortfolioContent(content) {
    portfolioContent = content || portfolioContent;

    const projectsGrid = document.getElementById('projectsGrid');
    if (projectsGrid) {
        projectsGrid.innerHTML = (portfolioContent.projects || []).map(project => {
            const tech = (project.tech || []).map(item => `<span>${escapeHtml(item)}</span>`).join('');
            const url = safeUrl(project.url);
            const hasUrl = Boolean(url);
            const action = hasUrl
                ? `<a class="project-action" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir proyecto ${escapeHtml(project.title)}" title="Abrir proyecto">`
                : `<button class="project-action" type="button" aria-label="Proyecto ${escapeHtml(project.title)} en desarrollo" title="En desarrollo" disabled>`;
            const actionClose = hasUrl ? `</a>` : `</button>`;
            const labelClass = String(project.title || '').toLowerCase().includes('paso') ? ' project-image-label-paso' : '';
            const imageUrl = safeUrl(project.image);
            const imageStyle = imageUrl ? ` style="background-image:linear-gradient(rgba(6,13,9,.18),rgba(6,13,9,.42)),url('${escapeHtml(imageUrl)}');background-size:cover;background-position:center"` : '';
            return `
                <article class="project-card project-card-featured">
                    <div class="project-image ${escapeHtml(project.imageClass || '')}${imageUrl ? ' has-uploaded-image' : ''}"${imageStyle}>
                        <div class="project-image-label${labelClass}">${escapeHtml(project.imageLabel || project.title)}</div>
                    </div>
                    <div class="project-content">
                        <div class="project-heading-row">
                            <h3 class="project-title">${escapeHtml(project.title)}</h3>
                            ${action}
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>
                            ${actionClose}
                        </div>
                        <p class="project-description">${escapeHtml(project.description)}</p>
                        <div class="project-tech">${tech}</div>
                        <span class="project-status">${escapeHtml(project.status || 'En desarrollo')}</span>
                    </div>
                </article>`;
        }).join('');
    }

    const certificatesGrid = document.getElementById('certificatesGrid');
    if (certificatesGrid) {
        const certificates = [...(portfolioContent.certificates || [])]
            .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

        certificatesGrid.innerHTML = certificates.map(certificate => {
            const pdf = safeUrl(certificate.pdf);
            const image = safeUrl(certificate.image);
            const visual = image
                ? `<img class="certificate-cover-image" src="${escapeHtml(image)}" alt="${escapeHtml(certificate.title)}" loading="lazy">`
                : `<span>${escapeHtml(certificate.icon || '🎓')}</span>`;
            const action = pdf
                ? `<button class="certificate-link" type="button" data-pdf="${escapeHtml(pdf)}">Ver Certificado</button>`
                : `<button class="certificate-link" type="button" disabled>Certificado sin archivo</button>`;
            return `
                <article class="certificate-card reveal active">
                    <div class="certificate-icon">${visual}</div>
                    <div class="certificate-content">
                        <h3 class="certificate-title">${escapeHtml(certificate.title)}</h3>
                        <p class="certificate-platform">${escapeHtml(certificate.platform || '')}</p>
                        <p class="certificate-description">${escapeHtml(certificate.description || '')}</p>
                        ${action}
                    </div>
                </article>`;
        }).join('');
    }

    const publicationsGrid = document.getElementById('publicationsGrid');
    if (publicationsGrid) {
        const posts = portfolioContent.publications || [];
        publicationsGrid.innerHTML = posts.length ? posts.map(post => {
            const image = safeUrl(post.image);
            return `
                <article class="publication-card">
                    ${image
                        ? `<img class="publication-image" src="${escapeHtml(image)}" alt="${escapeHtml(post.imageAlt || post.title)}" loading="lazy">`
                        : `<div class="publication-image-placeholder">PA · NOVEDADES</div>`}
                    <div class="publication-body">
                        <div class="publication-meta"><span>${escapeHtml(post.category || 'Novedad')}</span><span>${escapeHtml(post.date || '')}</span></div>
                        <h3>${escapeHtml(post.title)}</h3>
                        <p>${escapeHtml(post.excerpt || '')}</p>
                        <button class="publication-read" type="button" data-publication-id="${escapeHtml(post.id)}">Leer publicación →</button>
                    </div>
                </article>`;
        }).join('') : `<div class="publications-empty">Próximamente compartiré nuevas publicaciones.</div>`;
    }
}

(async function initCmsContent() {
    const loader = window.loadPortfolioContent;
    const content = typeof loader === 'function' ? await loader() : portfolioContent;
    renderPortfolioContent(content);
})();

const publicationModal = document.getElementById('publicationModal');
const publicationModalClose = document.getElementById('publicationModalClose');
const publicationModalTitle = document.getElementById('publicationModalTitle');
const publicationModalCategory = document.getElementById('publicationModalCategory');
const publicationModalDate = document.getElementById('publicationModalDate');
const publicationModalContent = document.getElementById('publicationModalContent');
const publicationModalImage = document.getElementById('publicationModalImage');
const publicationModalImageWrap = document.getElementById('publicationModalImageWrap');

function closePublicationModal() {
    if (!publicationModal) return;
    publicationModal.classList.remove('active');
    publicationModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function openPublicationModal(id) {
    const post = (portfolioContent.publications || []).find(item => item.id === id);
    if (!post || !publicationModal) return;
    publicationModalTitle.textContent = post.title;
    publicationModalCategory.textContent = post.category || 'Novedad';
    publicationModalDate.textContent = post.date || '';
    publicationModalContent.textContent = post.content || post.excerpt || '';
    if (post.image) {
        publicationModalImage.src = post.image;
        publicationModalImage.alt = post.imageAlt || post.title;
        publicationModalImageWrap.classList.remove('hidden');
    } else {
        publicationModalImage.src = '';
        publicationModalImageWrap.classList.add('hidden');
    }
    publicationModal.classList.add('active');
    publicationModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-publication-id]');
    if (trigger) openPublicationModal(trigger.dataset.publicationId);
});

publicationModalClose?.addEventListener('click', closePublicationModal);
publicationModal?.addEventListener('click', event => {
    if (event.target === publicationModal) closePublicationModal();
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && publicationModal?.classList.contains('active')) closePublicationModal();
});

/* =========================
   AMBIENTE INTERACTIVO V11
========================= */
(() => {
    const root = document.documentElement;
    const hero = document.querySelector('.hero');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let raf = null;
    window.addEventListener('pointermove', (event) => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
            root.style.setProperty('--mouse-x', `${event.clientX}px`);
            root.style.setProperty('--mouse-y', `${event.clientY}px`);
            if (hero) {
                const rect = hero.getBoundingClientRect();
                if (event.clientY >= rect.top && event.clientY <= rect.bottom) {
                    const x = ((event.clientX / window.innerWidth) - .5) * 10;
                    const y = ((event.clientY / window.innerHeight) - .5) * 7;
                    root.style.setProperty('--parallax-x', `${x}px`);
                    root.style.setProperty('--parallax-y', `${y}px`);
                }
            }
        });
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
        root.style.setProperty('--parallax-x', '0px');
        root.style.setProperty('--parallax-y', '0px');
    });
})();

// Technology cards: flip on click/tap or keyboard.
function initSkillFlipCards() {
    document.querySelectorAll('.skill-card').forEach((card) => {
        if (card.dataset.flipReady === 'true') return;
        card.dataset.flipReady = 'true';

        let flipTimer = null;
        const toggleSkillCard = () => {
            // Bloquea dobles clics durante la animación y cambia la cara justo en el centro del giro.
            if (card.classList.contains('is-flipping')) return;
            card.classList.add('is-flipping');
            const willFlip = !card.classList.contains('is-flipped');

            window.setTimeout(() => {
                card.classList.toggle('is-flipped', willFlip);
                card.setAttribute('aria-pressed', String(willFlip));
            }, 305);

            flipTimer = window.setTimeout(() => {
                card.classList.remove('is-flipping');
            }, 630);
        };

        card.addEventListener('click', toggleSkillCard);
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleSkillCard();
            }
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSkillFlipCards, { once: true });
} else {
    initSkillFlipCards();
}

/* =========================
   V14 — CIRCUITO DE SCROLL
========================= */
(() => {
    const sections = [
        ['inicio','01 INICIO'], ['about','02 SOBRE MÍ'], ['skills','03 STACK'],
        ['projects','04 PROYECTOS'], ['publications','05 NOTAS'],
        ['certificates','06 CERT.'], ['contact','07 CONTACTO']
    ].filter(([id]) => document.getElementById(id));
    if (!sections.length) return;

    const rail = document.createElement('nav');
    rail.className = 'circuit-progress';
    rail.setAttribute('aria-label', 'Progreso por secciones');
    sections.forEach(([id,label]) => {
        const a = document.createElement('a');
        a.className = 'circuit-node';
        a.href = `#${id}`;
        a.setAttribute('aria-label', label.replace(/^\d+\s/, ''));
        a.innerHTML = `<span>${label}</span>`;
        rail.appendChild(a);
    });
    document.body.appendChild(rail);

    const nodes = [...rail.querySelectorAll('.circuit-node')];
    const update = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        const progress = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
        rail.style.setProperty('--scroll-progress', progress);
        let current = 0;
        sections.forEach(([id], i) => {
            const el = document.getElementById(id);
            if (el && el.getBoundingClientRect().top <= innerHeight * .42) current = i;
        });
        nodes.forEach((node,i) => node.classList.toggle('active', i === current));
    };
    update();
    addEventListener('scroll', update, { passive:true });
    addEventListener('resize', update, { passive:true });
})();

/* =========================
   V25 — SPOTLIGHT PRUDENTE DESPUÉS DEL HERO
   No aparece en la pantalla principal. Mouse/touch solo desde la siguiente sección.
========================= */
(() => {
  if (document.querySelector('.cursor-spotlight-v23')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const hero = document.querySelector('#inicio');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const spotlight = document.createElement('div');
  spotlight.className = 'cursor-spotlight-v23';
  spotlight.setAttribute('aria-hidden', 'true');
  document.body.appendChild(spotlight);

  const root = document.documentElement;
  let fadeTimer = null;

  const moveTo = (x, y) => {
    root.style.setProperty('--mouse-x', `${x}px`);
    root.style.setProperty('--mouse-y', `${y}px`);
  };

  const afterHero = () => document.body.classList.contains('spotlight-after-hero');

  const syncHeroBoundary = () => {
    if (!hero) {
      document.body.classList.add('spotlight-after-hero');
      return;
    }
    /* Se activa cuando ya salimos prácticamente por completo del hero. */
    const threshold = Math.max(120, hero.offsetHeight * 0.82);
    const active = window.scrollY >= threshold;
    document.body.classList.toggle('spotlight-after-hero', active);
    if (!active) {
      spotlight.classList.remove('mouse-active', 'touch-active');
    }
  };

  syncHeroBoundary();
  window.addEventListener('scroll', syncHeroBoundary, { passive: true });
  window.addEventListener('resize', syncHeroBoundary, { passive: true });

  window.addEventListener('pointermove', (event) => {
    if (!afterHero()) return;
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      clearTimeout(fadeTimer);
      moveTo(event.clientX, event.clientY);
      spotlight.classList.remove('mouse-active');
      spotlight.classList.add('touch-active');
      return;
    }
    if (!finePointer) return;
    moveTo(event.clientX, event.clientY);
    spotlight.classList.remove('touch-active');
    spotlight.classList.add('mouse-active');
  }, { passive: true });

  window.addEventListener('pointerdown', (event) => {
    if (!afterHero()) return;
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      clearTimeout(fadeTimer);
      moveTo(event.clientX, event.clientY);
      spotlight.classList.add('touch-active');
    }
  }, { passive: true });

  const hideTouch = () => spotlight.classList.remove('touch-active');

  window.addEventListener('pointerup', (event) => {
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      fadeTimer = setTimeout(hideTouch, 120);
    }
  }, { passive: true });

  window.addEventListener('pointercancel', hideTouch, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => {
    spotlight.classList.remove('mouse-active');
  });
})();
