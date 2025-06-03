/**
 * Script para la página de stickers y prints
 */

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si estamos en la página de stickers
    if (!document.querySelector('.content-section')) return;

    // Cargar imágenes de stickers y prints
    loadImages();

    // Inicializar el comportamiento del botón de menú sticky global
    initStickyMenu();

    // Inicializar el comportamiento de scroll para mostrar/ocultar el botón sticky
    initScrollBehavior();
});

/**
 * Carga las imágenes de stickers y prints
 */
async function loadImages() {
    try {
        // En un entorno real, estas imágenes se cargarían desde una API o base de datos
        // Por ahora, usamos las imágenes estáticas que ya están en el HTML

        // Verificar si las imágenes existen y manejar errores
        const images = document.querySelectorAll('.sticker-item img, .w-full img, .halloween-sticker');

        images.forEach(img => {
            // Manejar errores de carga de imágenes
            img.onerror = () => {
                img.src = '../assets/placeholder.jpg';
                img.alt = 'Imagen no disponible';
            };

            // Añadir efecto de carga
            img.classList.add('opacity-0', 'transition-opacity', 'duration-500');

            // Cuando la imagen carga correctamente
            img.onload = () => {
                img.classList.remove('opacity-0');
                img.classList.add('opacity-100');
            };
        });
    } catch (error) {
        console.error('Error al cargar las imágenes:', error);
    }
}

/**
 * Inicializa el comportamiento del botón de menú sticky global
 */
function initStickyMenu() {
    const stickyMenuButton = document.getElementById('sticky-menu-button');
    const regularMenuButton = document.getElementById('menu-button');
    const sectionMenuButton = document.getElementById('section-menu-button');
    const printsMenuButton = document.getElementById('prints-menu-button');
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

    // Configurar el botón de menú en el título sticky de stickers
    if (sectionMenuButton) {
        sectionMenuButton.querySelector('button').addEventListener('click', openMobileMenu);
    }

    // Configurar el botón de menú en el título sticky de prints
    if (printsMenuButton) {
        printsMenuButton.querySelector('button').addEventListener('click', openMobileMenu);
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
    const sectionMenuButton = document.getElementById('section-menu-button');
    const printsMenuButton = document.getElementById('prints-menu-button');
    const headerHeight = document.querySelector('header').offsetHeight;
    const stickersHeader = document.getElementById('stickers-header');
    const printsHeader = document.getElementById('prints-header');

    if (!stickyMenuButton) return;

    // Función para actualizar la visibilidad de los botones
    function updateButtonsVisibility() {
        const scrollPosition = window.scrollY;

        // Verificar si los títulos sticky están visibles y anclados en la parte superior
        const stickersHeaderRect = stickersHeader ? stickersHeader.getBoundingClientRect() : null;
        const printsHeaderRect = printsHeader ? printsHeader.getBoundingClientRect() : null;

        const isStickersHeaderSticky = stickersHeaderRect &&
            stickersHeaderRect.top <= 0 &&
            stickersHeaderRect.bottom > 0;

        const isPrintsHeaderSticky = printsHeaderRect &&
            printsHeaderRect.top <= 0 &&
            printsHeaderRect.bottom > 0;

        const anyStickyHeaderVisible = isStickersHeaderSticky || isPrintsHeaderSticky;

        // Gestionar el botón en el título sticky de stickers
        if (sectionMenuButton && stickersHeader) {
            if (isStickersHeaderSticky) {
                // Mostrar el botón en el título sticky cuando está anclado
                sectionMenuButton.classList.remove('opacity-0');
                sectionMenuButton.classList.add('opacity-100');
            } else {
                // Ocultar el botón en el título sticky cuando no está anclado
                sectionMenuButton.classList.remove('opacity-100');
                sectionMenuButton.classList.add('opacity-0');
            }
        }

        // Gestionar el botón en el título sticky de prints
        if (printsMenuButton && printsHeader) {
            if (isPrintsHeaderSticky) {
                // Mostrar el botón en el título sticky cuando está anclado
                printsMenuButton.classList.remove('opacity-0');
                printsMenuButton.classList.add('opacity-100');
            } else {
                // Ocultar el botón en el título sticky cuando no está anclado
                printsMenuButton.classList.remove('opacity-100');
                printsMenuButton.classList.add('opacity-0');
            }
        }

        // Gestionar el botón sticky global
        if (scrollPosition > headerHeight && !anyStickyHeaderVisible) {
            // Mostrar el botón sticky global cuando no estamos en el header
            // y ningún título sticky está visible
            stickyMenuButton.classList.remove('hidden');
            stickyMenuButton.classList.add('visible');
        } else {
            // Ocultar el botón sticky global
            stickyMenuButton.classList.remove('visible');
            // No ocultamos inmediatamente para permitir la transición
            setTimeout(() => {
                if (window.scrollY <= headerHeight || anyStickyHeaderVisible) {
                    stickyMenuButton.classList.add('hidden');
                }
            }, 300);
        }
    }

    // Escuchar el evento de scroll
    window.addEventListener('scroll', updateButtonsVisibility);

    // Ejecutar una vez al cargar la página
    updateButtonsVisibility();
}

/**
 * Verifica si existe la carpeta de assets y crea placeholders si es necesario
 */
function checkAssetsFolder() {
    // Esta función se ejecutaría en un entorno de desarrollo
    // En producción, asegúrate de que todas las imágenes existan
    console.log('Verificando carpeta de assets...');
}
