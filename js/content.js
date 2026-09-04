/* =========================================================
   CONTENIDO EDITABLE DEL PORTAFOLIO
   ---------------------------------------------------------
   Para agregar un proyecto o publicación, duplica un objeto
   dentro del arreglo correspondiente y cambia sus datos.
   Si una publicación lleva imagen, guarda el archivo dentro de
   img/publicaciones/ y coloca la ruta en "image".
========================================================= */
window.portfolioContent = {
    projects: [
        {
            title: "Academic OS",
            imageClass: "project-image-academicos",
            imageLabel: "ACADEMIC OS",
            description: "Sistema de decisión académica para registrar notas, simular escenarios y tomar mejores decisiones sobre el rendimiento universitario.",
            tech: ["Next.js", "PostgreSQL", "Docker", "API"],
            status: "En desarrollo",
            url: ""
        },
        {
            title: "Paso & Tradición",
            imageClass: "project-image-paso",
            imageLabel: "PASO & TRADICIÓN",
            description: "Página web para una propuesta cultural peruana enfocada en caballos de paso, marinera y tradición, creada para presentar la marca y sus experiencias.",
            tech: ["HTML", "CSS", "JavaScript", "Responsive"],
            status: "En desarrollo",
            url: ""
        }
    ],

    certificates: [
        {
            title: "Python Data Science",
            platform: "Platzi",
            description: "Desarrollo de análisis y ciencia de datos utilizando Python y herramientas modernas.",
            icon: "🐍",
            pdf: "img/certificados/diploma-python-data-science.pdf",
            order: 1
        },
        {
            title: "Visualización de Datos BI",
            platform: "Platzi",
            description: "Creación de dashboards y visualización orientada a Business Intelligence.",
            icon: "📊",
            pdf: "img/certificados/diploma-visualizacion-datos-bi.pdf",
            order: 2
        },
        {
            title: "Anaconda & Jupyter",
            platform: "Platzi",
            description: "Uso de notebooks y entornos modernos para análisis de datos y desarrollo.",
            icon: "💻",
            pdf: "img/certificados/diploma-anaconda-jupyter.pdf",
            order: 3
        },
        {
            title: "Datos Faltantes",
            platform: "Platzi",
            description: "Tratamiento, análisis y preparación de datos faltantes para mejorar la calidad de los conjuntos de datos.",
            icon: "🧩",
            pdf: "img/certificados/diploma-datos-faltantes.pdf",
            order: 4
        },
        {
            title: "Funciones Matemáticas",
            platform: "Platzi",
            description: "Aplicación de funciones matemáticas orientadas al análisis y la programación.",
            icon: "📐",
            pdf: "img/certificados/diploma-funciones-matematicas.pdf",
            order: 5
        },
        {
            title: "Funciones en Python",
            platform: "Platzi",
            description: "Uso de funciones, parámetros y buenas prácticas para estructurar programas en Python.",
            icon: "⚙️",
            pdf: "img/certificados/diploma-python-funciones.pdf",
            order: 6
        },
        {
            title: "Inglés A1 Principiantes",
            platform: "Platzi",
            description: "Bases fundamentales del idioma inglés para comunicación inicial.",
            icon: "🇬🇧",
            pdf: "img/certificados/diploma-ingles-a1-principiantes.pdf",
            order: 7
        },
        {
            title: "Inglés Coloquial",
            platform: "Platzi",
            description: "Expresiones y comunicación coloquial aplicadas al inglés cotidiano.",
            icon: "💬",
            pdf: "img/certificados/diploma-ingles-lenguaje-coloquial.pdf",
            order: 8
        },
        {
            title: "Git y GitHub para Principiantes",
            platform: "freeCodeCamp.org · IBM SkillsBuild",
            description: "Curso intensivo de control de versiones con Git y colaboración en GitHub.",
            icon: "🔧",
            pdf: "img/certificados/diploma-git-github.pdf",
            order: 9
        }
    ],

    publications: [
        {
            id: "pedroagapito-espacio-personal",
            title: "PedroAgapito.pe: mi espacio personal",
            category: "Novedad",
            date: "14 Ago 2026",
            image: "img/brand/pa-logo-round.png",
            imageAlt: "Identidad visual PA de Pedro Agapito",
            excerpt: "Este portafolio reúne mis proyectos de tecnología, mi desarrollo profesional y una parte importante de mi vínculo con la cultura peruana.",
            content: "PedroAgapito.pe nace como un espacio para reunir mi trabajo en Ingeniería de Sistemas, los proyectos que voy construyendo y las novedades que quiera compartir.\n\nTambién será un punto de encuentro con mi faceta vinculada a la marinera norteña y a la difusión de la cultura peruana.\n\nCon el tiempo, aquí iré publicando avances, aprendizajes, nuevas versiones de mis proyectos y contenido que represente esta combinación entre tecnología e identidad cultural."
        }
    ]
};
