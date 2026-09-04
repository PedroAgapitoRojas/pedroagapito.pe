# Fase 1 — Laboratorio Web

Se implementó sobre la arquitectura existente, sin reemplazar el portfolio, Comunidad, Supabase Auth ni el CMS de tecnologías.

## Reutilizado
- `index.html` y su sección actual de tecnologías.
- `js/skills.js` y la API `window.openTechnologyLab`.
- `js/supabase-config.js` y el cliente Supabase existente.
- Identidad visual y variables de `css/styles.css`.
- Flujo existente de publicación hacia `community/` mediante `sessionStorage`.

## Modificado
- Laboratorio: HTML, CSS y JavaScript ahora tienen editores separados.
- Preview: combina los tres archivos en un único documento y lo ejecuta en `iframe sandbox="allow-scripts"`.
- Preview responsive: Desktop / Tablet / Mobile.
- Manejo educativo de errores de JavaScript.
- Guardado: Supabase cuando existe sesión y están aplicadas las tablas de prácticas; copia local de seguridad si todavía no está aplicada la migración o no hay sesión.
- Publicación: conserva el flujo existente hacia Comunidad y transporta los tres archivos como una práctica web.

## Migración
Ejecutar `SUPABASE-PRACTICES-PHASE1.sql` en Supabase para habilitar el guardado persistente de prácticas.

## Fuera de esta fase
Python/Java/Kotlin/SQL/Docker con ejecución de servidor, perfiles, follows, comentarios y proyectos completos quedan para las fases posteriores. No se simuló ejecución insegura.
