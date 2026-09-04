# CMS privado con Supabase — PedroAgapito.pe

Esta versión deja preparado el portafolio para administrar **Publicaciones, Proyectos y Certificados** desde un panel privado conectado a Supabase.

## Resultado final esperado
- Público: `pedroagapito.pe` solo muestra el contenido publicado.
- Privado: tú inicias sesión en un panel de administración separado.
- Desde el panel podrás crear, editar, ordenar y eliminar publicaciones, proyectos y certificados.
- Las imágenes y PDF se guardarán en Supabase Storage.
- Si Supabase no responde, `js/content.js` mantiene contenido local de respaldo.

## Módulos
1. **Publicaciones**: título, slug, resumen, contenido, imagen, categoría, fecha, borrador/publicado.
2. **Proyectos**: nombre, descripción, tecnologías, imagen, URL, estado y orden.
3. **Certificados**: título, institución, descripción, icono/miniatura, PDF, fecha y orden.

## Seguridad
- Lectura pública únicamente de registros publicados.
- Escritura, edición y eliminación únicamente para tu usuario autenticado.
- RLS habilitado en las tres tablas.
- Nunca usar `service_role` en el frontend público.

## Pendiente para activar Supabase
1. Crear/conectar el proyecto Supabase.
2. Crear tablas `publications`, `projects`, `certificates`.
3. Crear buckets `portfolio-media` y `certificates`.
4. Crear usuario administrador con email/contraseña.
5. Aplicar RLS.
6. Completar `js/cms-config.js` con Project URL y publishable/anon key.
7. Crear el panel `/admin/` y conectarlo a Auth + CRUD.

La V10 ya renderiza certificados desde `js/content.js`, cuatro por fila en escritorio, por lo que luego la fuente puede cambiar a Supabase sin rediseñar la sección.
