# PedroAgapito.pe · V2 Final

Portfolio profesional en HTML5, CSS3 y JavaScript Vanilla, con Supabase para CMS, autenticación y Comunidad.

## Ejecutar localmente

```bash
py -m http.server 8000
```

Luego abre `http://localhost:8000/`.

> No abras `index.html` directamente con `file://`; el proyecto necesita un servidor HTTP para cargar módulos, Supabase y rutas relativas correctamente.

## Rutas
- `/` — portfolio
- `/community/` — Comunidad
- `/admin/` — panel privado

## V2 incluye
- Sistema global de temas: verde, morado y claro.
- Verde como tema inicial.
- Preferencia persistente en el navegador.
- Portfolio con proyectos, certificados y tecnologías.
- Catálogo de tecnologías administrable desde Admin.
- Explorador de todas las tecnologías con buscador.
- Tarjetas interactivas con nivel, descripción y práctica.
- Laboratorio de ejercicios guiados.
- Flujo práctica → Comunidad → moderación → publicación.
- Autenticación Supabase.
- Reacciones y reportes.
- Filtro automático de contenido ofensivo.
- RLS y permisos de administrador.

## Catálogo inicial
Incluye HTML5, CSS3, JavaScript, Python, Git/GitHub, Docker, Pandas, NumPy, Matplotlib, ETL, SQL, SQL Server, Oracle SQL, MySQL, PostgreSQL, MongoDB, SQLite, AWS, Supabase, Flutter, Dart, FlutterFlow, Firebase, Figma, Cisco Packet Tracer, Kotlin, Responsive Design, XML, Unity, Arena y Arduino Uno.

## Mantenimiento
Para agregar una tecnología:
1. Entra a `/admin/`.
2. Abre **Tecnologías**.
3. Pulsa **+ Nueva tecnología**.
4. Completa nombre, descripción, categoría, nivel y orden.
5. Activa **Mostrar como destacada** solo si quieres que aparezca en la portada.
6. Activa **Tiene práctica guiada** si vas a definir ejercicios.
7. Guarda.

No es necesario modificar `index.html` para mantener el catálogo.

## Documentación
- `SUPABASE-TECHNOLOGIES-V2.sql` — contrato estructural del catálogo.
- `SUPABASE-COMMUNITY-V2.sql` — referencia de Comunidad.
- `V2-QA-CHECKLIST.md` — pruebas manuales.
- `V2-RELEASE.md` — alcance de la versión.
