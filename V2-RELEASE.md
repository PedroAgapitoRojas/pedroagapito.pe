# PedroAgapito.pe · V2 Final

Esta versión consolida el portfolio, el catálogo administrable de tecnologías y la Comunidad con moderación real.

## Tecnologías y herramientas
- Se muestran 6 tarjetas destacadas inicialmente.
- El botón **Ver todas las tecnologías** abre un explorador con búsqueda.
- El catálogo completo vive en Supabase.
- Cada registro puede tener descripción, categoría, nivel, icono, orden, estado y práctica guiada.
- Las tarjetas reaccionan al cursor y se pueden voltear con clic/teclado.

## Práctica → Comunidad
Una tecnología con `practice_enabled=true` puede abrir un laboratorio guiado. El usuario puede editar la solución y usar **Publicar práctica** para preparar un borrador que pasa al flujo normal de Comunidad y moderación.

## Admin
El panel existente ahora incluye:
- Publicaciones
- Proyectos
- Certificados
- Tecnologías
- Comunidad
- Reportes
- Palabras prohibidas

En **Tecnologías** se puede crear, editar, eliminar, ordenar, publicar/archivar, marcar como destacada y configurar ejercicios en JSON.

## Temas
- 🟢 Verde: predeterminado en primera visita.
- 🟣 Morado.
- ⚪ Claro.
- La preferencia se conserva en el navegador.

## Seguridad
- RLS activo.
- Operaciones administrativas limitadas por `admin_users`.
- La publicación de Comunidad usa `auth.uid()` en servidor.
- La tecnología enviada se valida contra `public.technologies`.
- Las palabras prohibidas se mantienen en Supabase.

## V3
El Modo Marinera queda deliberadamente fuera de V2 para desarrollarlo como una experiencia propia con fotografías, campeonatos, trayectoria e identidad cultural.
