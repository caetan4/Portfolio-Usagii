/**
 * Script para manejar el botón de hamburguesa sticky global
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el comportamiento del botón de menú sticky global
    initStickyMenu();

    // Inicializar el comportamiento de scroll para mostrar/ocultar el botón sticky
    initScrollBehavior();
});

/**
 * Inicializa el comportamiento del botón de menú sticky global
 */
function initStickyMenu() {
    const stickyMenuButton = document.getElementById('sticky-menu-button');
    const regularMenuButton = document.getElementById('menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenuButton = document.getElementById('close-menu');

    if (!mobileMenu) return;

    // Función para abrir el menú móvil
    const openMobileMenu = () => {
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');
        document.body.classList.add('overflow-hidden');
    };

    // Función para cerrar el menú móvil
    const closeMobileMenu = () => {
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
        document.body.classList.remove('overflow-hidden');
    };

    // Configurar el botón de menú sticky global
    if (stickyMenuButton) {
        stickyMenuButton.querySelector('button').addEventListener('click', openMobileMenu);
    }

    // Asegurarse de que el botón regular también funcione
    if (regularMenuButton) {
        regularMenuButton.addEventListener('click', openMobileMenu);
    }

    // Configurar el botón de cierre del menú
    if (closeMenuButton) {
        closeMenuButton.addEventListener('click', closeMobileMenu);
    }
}

/**
 * Inicializa el comportamiento de scroll para mostrar/ocultar el botón sticky
 */
function initScrollBehavior() {
    const stickyMenuButton = document.getElementById('sticky-menu-button');
    const headerHeight = document.querySelector('header').offsetHeight;

    if (!stickyMenuButton) return;

    // Función para actualizar la visibilidad del botón sticky
    function updateStickyButton() {
        const scrollPosition = window.scrollY;

        // Mostrar el botón sticky cuando se hace scroll más allá del header
        if (scrollPosition > headerHeight) {
            stickyMenuButton.classList.remove('hidden');
            stickyMenuButton.classList.add('visible');
        } else {
            stickyMenuButton.classList.remove('visible');
            // No ocultamos inmediatamente para permitir la transición
            setTimeout(() => {
                if (window.scrollY <= headerHeight) {
                    stickyMenuButton.classList.add('hidden');
                }
            }, 300);
        }
    }

    // Escuchar el evento de scroll
    window.addEventListener('scroll', updateStickyButton);

    // Ejecutar una vez al cargar la página
    updateStickyButton();
}
