/**
 * Script para manejar los títulos de sección sticky
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el comportamiento de los títulos de sección sticky
    initStickySectionHeaders();
});

/**
 * Inicializa el comportamiento de los títulos de sección sticky
 */
function initStickySectionHeaders() {
    // Obtener todos los headers de sección
    const sectionHeaders = document.querySelectorAll('.section-header');
    const stickyMenuButton = document.getElementById('sticky-menu-button');

    if (sectionHeaders.length === 0) return;

    // Crear un array para almacenar las secciones y sus posiciones
    const sections = Array.from(sectionHeaders).map(header => {
        const sectionId = header.id;
        const menuButton = header.querySelector('[id$="menu-button"]');
        const section = header.closest('section');

        return {
            header,
            menuButton,
            section,
            top: section.offsetTop,
            bottom: section.offsetTop + section.offsetHeight,
            id: sectionId
        };
    });

    // Función para actualizar la visibilidad de los botones de menú en los títulos sticky
    function updateStickyHeaders() {
        const scrollPosition = window.scrollY;
        let activeSection = null;

        // Determinar qué sección está activa
        for (const section of sections) {
            // Si el scroll está dentro de la sección
            if (scrollPosition >= section.top && scrollPosition < section.bottom) {
                activeSection = section;
                break;
            }
        }

        // Actualizar la visibilidad de los botones de menú
        sections.forEach(section => {
            const headerRect = section.header.getBoundingClientRect();
            const isSticky = headerRect.top === 0;

            // Actualizar la clase is-sticky en el header
            if (isSticky) {
                section.header.classList.add('is-sticky');
            } else {
                section.header.classList.remove('is-sticky');
            }

            if (section.menuButton) {
                if (isSticky) {
                    // El título está sticky, mostrar el botón de menú
                    section.menuButton.classList.remove('opacity-0');
                    section.menuButton.classList.add('opacity-100');

                    // Ocultar el botón sticky global si hay un título sticky
                    if (stickyMenuButton) {
                        stickyMenuButton.classList.remove('visible');
                        stickyMenuButton.classList.add('hidden');
                    }
                } else {
                    // El título no está sticky, ocultar el botón de menú
                    section.menuButton.classList.remove('opacity-100');
                    section.menuButton.classList.add('opacity-0');

                    // Mostrar el botón sticky global si no hay un título sticky
                    if (stickyMenuButton && !sections.some(s => s.header.getBoundingClientRect().top === 0)) {
                        stickyMenuButton.classList.remove('hidden');
                        stickyMenuButton.classList.add('visible');
                    }
                }
            }
        });
    }

    // Escuchar el evento de scroll
    window.addEventListener('scroll', updateStickyHeaders);

    // Ejecutar una vez al cargar la página
    updateStickyHeaders();

    // Configurar los botones de menú en los títulos sticky
    sections.forEach(section => {
        if (section.menuButton) {
            const button = section.menuButton.querySelector('button');
            if (button) {
                button.addEventListener('click', () => {
                    const mobileMenu = document.getElementById('mobile-menu');
                    if (mobileMenu) {
                        mobileMenu.classList.remove('translate-x-full');
                        mobileMenu.classList.add('translate-x-0');
                        document.body.classList.add('overflow-hidden');
                    }
                });
            }
        }
    });
}
