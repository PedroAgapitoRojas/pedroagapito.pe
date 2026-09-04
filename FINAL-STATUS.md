# V2 — ESTADO FINAL

## Implementado
- Auth existente conservada.
- Comunidad existente conservada.
- Laboratorio HTML/CSS/JS con archivos separados, preview real e iframe sandbox.
- Desktop / Tablet / Mobile.
- Guardado de prácticas en Supabase.
- Publicación de prácticas mediante el RPC de moderación existente.
- Perfiles, follows, comentarios y proyectos de comunidad.
- Reacciones ❤️ en proyectos.
- Perfil público de autores.
- Laboratorio backend para Python, Java, Kotlin y SQL.
- Runner Node + Piston con límites de tamaño, tiempo, memoria, procesos y rate limit.
- Validador de Dockerfile sin acceso al Docker Engine.
- Plantilla de correo de confirmación profesional.
- Migración final aditiva que evita la colisión con el CMS `public.projects`.

## No se hizo de forma insegura
- No se ejecuta código arbitrario directamente sobre el servidor principal.
- No se expone `service_role`.
- No se conecta `/var/run/docker.sock` al frontend.
- No se concede Docker privilegiado a usuarios.

## Pendiente exclusivamente de configuración externa
1. Ejecutar `SUPABASE-FINAL-MIGRATION.sql`.
2. Pegar `SUPABASE-AUTH-CONFIRMATION-EMAIL.html` en la plantilla Confirm signup.
3. Levantar/configurar `runner/` y sus runtimes.
4. Si el runner se publica en Internet, cambiar `js/execution-config.js` a su URL HTTPS.
