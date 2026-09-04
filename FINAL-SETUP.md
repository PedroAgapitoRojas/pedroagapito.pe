# CONFIGURACIÓN FINAL — PedroAgapito.pe

## 1. Supabase — una sola vez

En **Supabase → SQL Editor**, ejecuta:

`SUPABASE-FINAL-MIGRATION.sql`

Este archivo conserva el CMS `public.projects` y usa `community_projects` para proyectos de usuarios.

## 2. Correo de confirmación

En **Supabase → Authentication → Email Templates → Confirm signup**, reemplaza el HTML por:

`SUPABASE-AUTH-CONFIRMATION-EMAIL.html`

La plantilla usa `{{ .ConfirmationURL }}`.

## 3. Runner de Python / Java / Kotlin / SQL

En la carpeta `runner/`:

```bash
docker compose up -d --build
```

Después instala runtimes en la instancia local de Piston. Consulta `runner/README.md`.

El frontend ya apunta a `http://localhost:3000/api/execute`.

Cuando publiques el runner en un servidor HTTPS, edita **solo**:

`js/execution-config.js`

Ejemplo:

```js
window.PEDRO_EXECUTION = Object.freeze({
  endpoint: 'https://TU-RUNNER-DOMINIO.com/api/execute'
});
```

## 4. Qué NO editar

No edites:

- `js/supabase-config.js` si las credenciales actuales son las de tu proyecto.
- `community/community.js` salvo que quieras cambiar la moderación existente.
- `supabase-schema.sql` para intentar reemplazar el CMS.

Nunca coloques `service_role` en JavaScript del navegador.

## 5. Docker

El laboratorio permite escribir y validar Dockerfiles, pero **no** entrega acceso al Docker Engine del servidor. Ejecutar Docker arbitrario desde una web requiere un worker aislado independiente; no se debe conectar `/var/run/docker.sock` al frontend ni dar contenedores privilegiados al usuario.

## 6. Flujo final

Registro → confirmación → login → HTML/CSS/JS → preview → guardar → publicar → Comunidad → reacciones → comentarios → perfil → seguir → proyectos → Python/Java/Kotlin/SQL mediante sandbox.

## Comunidad: comentarios y moderación

Ejecuta `SUPABASE-FINAL-MIGRATION.sql`. Los comentarios se publican automáticamente; el autor puede borrarlos durante 48 horas. Los administradores pueden retirarlos en `admin/ > Comentarios` con un motivo. El usuario verá ese motivo en su perfil.

Para correo automático de moderación, despliega `supabase/functions/notify-moderation` y configura `RESEND_API_KEY` y `MODERATION_FROM_EMAIL` como secrets.
