# Comunidad — comentarios y moderación

## Qué quedó implementado

- Los comentarios de publicaciones y proyectos se publican inmediatamente y aparecen sin pasar por una cola previa.
- El autor puede eliminar su propio comentario durante las primeras 48 horas.
- Un administrador puede retirar cualquier comentario desde `admin/` y debe escribir un motivo.
- Al retirar un comentario se guarda una notificación privada en el perfil del usuario.
- El motivo de retiro queda visible para el usuario en `Mi perfil > Avisos de moderación`.
- La comunidad deja de mostrar comentarios retirados.
- Los autores de publicaciones, proyectos y comentarios se pueden abrir como perfil dentro de la Comunidad.
- En el perfil público se muestran publicaciones y proyectos.
- El panel admin tiene una pestaña `💬 Comentarios`.

## Paso obligatorio

Ejecutar `SUPABASE-FINAL-MIGRATION.sql` una vez en Supabase SQL Editor.

## Correo de moderación (opcional pero recomendado)

La notificación dentro del perfil funciona solo con la migración. Para correo automático, desplegar la Edge Function:

```bash
supabase functions deploy notify-moderation
supabase secrets set RESEND_API_KEY=re_xxx MODERATION_FROM_EMAIL="PedroAgapito Comunidad <moderacion@tu-dominio.com>"
```

No colocar `RESEND_API_KEY` ni `SUPABASE_SERVICE_ROLE_KEY` en el frontend.

La función usa la sesión del administrador para comprobar permisos y consulta el correo del destinatario usando la service role únicamente dentro del entorno server-side.
