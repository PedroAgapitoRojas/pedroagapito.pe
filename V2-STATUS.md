# PedroAgapito.pe · V2 Final

## Estado
**Release candidate funcional — listo para QA manual.**

## Implementado
- 🟢 Verde predeterminado, 🟣 morado y ⚪ claro.
- Persistencia global del tema en portada, Comunidad y Admin.
- Comunidad conectada a Supabase Auth + Database.
- Publicaciones con moderación automática y estados pending/approved/rejected/hidden.
- Lista configurable de palabras prohibidas, normalización y rate limiting.
- Reacciones persistentes, reportes y logs de moderación.
- RLS y autorización real para administración.
- Panel Admin integrado con publicaciones, proyectos, certificados, Comunidad, reportes y palabras prohibidas.
- 🛠️ **Nuevo: CRUD independiente de Tecnologías y herramientas.**
- Catálogo de 32 tecnologías/herramientas iniciales en Supabase.
- Se muestran 10 tecnologías inicialmente en dos filas de cinco en escritorio; el catálogo completo se abre desde “Ver más tecnologías”.
- Explorador “Ver todas las tecnologías” con buscador.
- Tarjetas con flip, iluminación del nombre siguiendo el cursor y nivel de experiencia.
- Prácticas guiadas con ejercicios explicados, pistas, solución y reto.
- Botón para preparar y enviar la práctica a Comunidad.
- Comunidad obtiene filtros dinámicos desde el catálogo de tecnologías.
- El RPC de publicación valida tecnologías contra el catálogo, no contra una lista fija.
- Herramientas y tecnologías se conserva como sección central del portfolio.
- Unity, Arena y Arduino Uno quedan disponibles como herramientas descriptivas; pueden activarse para práctica desde Admin cuando corresponda.

## Fase 2 — Comunidad
- 🟢 Perfiles propios con username, nombre y biografía.
- 🟢 Seguir / dejar de seguir con RLS.
- 🟢 Comentarios en publicaciones y eliminación de comentarios propios.
- 🟢 Proyectos publicados con tecnologías y enlace.
- 🟢 Reacciones y comentarios de proyectos.
- 🟢 Feed independiente de proyectos.

## V3
Modo Marinera con fotografías de fondo, campeonatos, trayectoria e identidad cultural completa.
