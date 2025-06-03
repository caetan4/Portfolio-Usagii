/**
 * Script para la página de bocetos
 */

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si estamos en la página de bocetos
    if (!document.querySelector('#bocetos-section')) return;

    // Cargar imágenes de bocetos
    loadImages();

    // Inicializar el comportamiento del botón de menú sticky global
    initStickyMenu();

    // Inicializar el comportamiento de scroll para mostrar/ocultar el botón sticky
    initScrollBehavior();
});

/**
 * Carga las imágenes de bocetos
 */
async function loadImages() {
    try {
        console.log('Iniciando carga de imágenes de bocetos...');

        // Lista de imágenes disponibles en la carpeta de bocetos
        const bocetosImages = [
            '6B185504-22B3-4A9B-9177-810E7E95D245.jpg',
            'IMG_4921.jpg',
            'IMG_5146.jpg',
            'IMG_5148.jpg',
            'IMG_5152.jpg',
            'IMG_5155.jpg',
            'IMG_5156.jpg',
            'IMG_5408.jpg',
            'IMG_5410.jpg',
            'IMG_5430.jpg'
        ];

        // Obtener el contenedor de la galería
        const galeriaContainer = document.getElementById('bocetos-grid');

        // Limpiar el contenedor actual
        if (galeriaContainer) {
            console.log('Contenedor de galería encontrado');

            // Eliminar el mensaje de carga
            const loadingMessage = document.getElementById('loading-message');
            if (loadingMessage) {
                loadingMessage.remove();
            }

            // Crear el contenedor de la grilla
            const gridContainer = document.createElement('div');
            gridContainer.className = 'grid-container';
            galeriaContainer.appendChild(gridContainer);

            // Crear promesas para cargar todas las imágenes
            const imagePromises = bocetosImages.map((imageName, index) => {
                return new Promise((resolve) => {
                    const item = document.createElement('div');
                    item.className = 'grid-item boceto-item';

                    const img = document.createElement('img');
                    img.src = `../assets/bocetos/${imageName}`;
                    img.alt = `Boceto artístico ${index + 1}`;
                    img.className = 'w-full h-auto opacity-0 transition-opacity duration-500';

                    // Manejar errores de carga de imágenes
                    img.onerror = () => {
                        console.warn(`Error al cargar la imagen: ${imageName}`);
                        img.src = '../assets/placeholder.jpg';
                        img.alt = 'Imagen no disponible';
                        resolve({ item, aspectRatio: 1 }); // Aspecto cuadrado para placeholders
                    };

                    // Cuando la imagen carga correctamente
                    img.onload = () => {
                        console.log(`Imagen cargada: ${imageName}`);
                        img.classList.remove('opacity-0');
                        img.classList.add('opacity-100');

                        // Calcular relación de aspecto
                        const aspectRatio = img.naturalWidth / img.naturalHeight;
                        resolve({ item, aspectRatio });
                    };

                    // Añadir evento de clic para expandir la imagen
                    img.addEventListener('click', () => {
                        openFullSizeImage(img.src);
                    });

                    item.appendChild(img);
                });
            });

            // Esperar a que todas las imágenes se carguen
            Promise.all(imagePromises).then(results => {
                console.log('Todas las imágenes cargadas, organizando la grilla...');

                // Clasificar las imágenes por su orientación
                const horizontalItems = [];
                const verticalItems = [];
                const squareItems = [];

                results.forEach(({ item, aspectRatio }) => {
                    if (aspectRatio > 1.2) {
                        // Imagen horizontal
                        item.classList.add('horizontal-item');
                        horizontalItems.push(item);
                    } else if (aspectRatio < 0.8) {
                        // Imagen vertical
                        item.classList.add('vertical-item');
                        verticalItems.push(item);
                    } else {
                        // Imagen cuadrada o casi cuadrada
                        item.classList.add('square-item');
                        squareItems.push(item);
                    }
                });

                // Crear filas para organizar las imágenes de manera simétrica
                const rows = [];

                // Primera fila: 3 imágenes cuadradas o verticales
                const row1 = document.createElement('div');
                row1.className = 'grid-row';

                // Combinar cuadradas y verticales para la primera fila
                const firstRowItems = [...squareItems.splice(0, 3), ...verticalItems.splice(0, 3)].slice(0, 3);
                firstRowItems.forEach(item => row1.appendChild(item));

                if (firstRowItems.length > 0) rows.push(row1);

                // Segunda fila: 1 horizontal que ocupa todo el ancho o 2 cuadradas
                const row2 = document.createElement('div');
                row2.className = 'grid-row';

                if (horizontalItems.length > 0) {
                    const horizontalItem = horizontalItems.shift();
                    horizontalItem.classList.add('full-width-item');
                    row2.appendChild(horizontalItem);
                } else {
                    const secondRowItems = [...squareItems.splice(0, 2), ...verticalItems.splice(0, 2)].slice(0, 2);
                    secondRowItems.forEach(item => row2.appendChild(item));
                }

                if (row2.childElementCount > 0) rows.push(row2);

                // Tercera fila: 3 imágenes cuadradas o verticales
                const row3 = document.createElement('div');
                row3.className = 'grid-row';

                const thirdRowItems = [...squareItems.splice(0, 3), ...verticalItems.splice(0, 3)].slice(0, 3);
                thirdRowItems.forEach(item => row3.appendChild(item));

                if (thirdRowItems.length > 0) rows.push(row3);

                // Cuarta fila: Otra horizontal o 2 cuadradas
                const row4 = document.createElement('div');
                row4.className = 'grid-row';

                if (horizontalItems.length > 0) {
                    const horizontalItem = horizontalItems.shift();
                    horizontalItem.classList.add('full-width-item');
                    row4.appendChild(horizontalItem);
                } else {
                    const fourthRowItems = [...squareItems.splice(0, 2), ...verticalItems.splice(0, 2)].slice(0, 2);
                    fourthRowItems.forEach(item => row4.appendChild(item));
                }

                if (row4.childElementCount > 0) rows.push(row4);

                // Añadir las filas restantes con las imágenes que queden
                const remainingItems = [...horizontalItems, ...verticalItems, ...squareItems];

                if (remainingItems.length > 0) {
                    const lastRow = document.createElement('div');
                    lastRow.className = 'grid-row';

                    remainingItems.forEach(item => {
                        lastRow.appendChild(item);
                    });

                    rows.push(lastRow);
                }

                // Añadir todas las filas al contenedor
                rows.forEach(row => {
                    gridContainer.appendChild(row);
                });

                console.log('Grilla organizada con éxito');
            });
        } else {
            console.error('No se encontró el contenedor de la galería de bocetos');
        }
    } catch (error) {
        console.error('Error al cargar las imágenes:', error);
    }
}

/**
 * Inicializa el organizador de grilla para los bocetos
 * Nota: Esta función ya no se utiliza con el nuevo algoritmo de ordenamiento
 * Se mantiene por compatibilidad con código existente
 */
function initializeGridOrganizer() {
    console.log('Usando algoritmo de ordenamiento personalizado en lugar de GridOrganizer');
    // La organización de la grilla ahora se realiza directamente en la función loadImages
}

/**
 * Inicializa el comportamiento del botón de menú sticky global
 */
function initStickyMenu() {
    const stickyMenuButton = document.getElementById('sticky-menu-button');
    const regularMenuButton = document.getElementById('menu-button');
    const sectionMenuButton = document.getElementById('section-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenuButton = document.getElementById('close-menu');

    console.log('Inicializando menú sticky. Elementos encontrados:', {
        stickyMenuButton: !!stickyMenuButton,
        regularMenuButton: !!regularMenuButton,
        sectionMenuButton: !!sectionMenuButton,
        mobileMenu: !!mobileMenu,
        closeMenuButton: !!closeMenuButton
    });

    if (!mobileMenu) {
        console.error('No se encontró el menú móvil');
        return;
    }

    // Función para abrir el menú móvil
    const openMobileMenu = (event) => {
        console.log('Abriendo menú móvil', event.currentTarget);
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');
        document.body.classList.add('overflow-hidden');
        // Prevenir propagación del evento
        event.stopPropagation();
    };

    // Función para cerrar el menú móvil
    const closeMobileMenu = () => {
        console.log('Cerrando menú móvil');
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
        document.body.classList.remove('overflow-hidden');
    };

    // Configurar el botón de menú sticky global
    if (stickyMenuButton) {
        const stickyButton = stickyMenuButton.querySelector('button');
        if (stickyButton) {
            stickyButton.addEventListener('click', openMobileMenu);
            console.log('Event listener añadido al botón sticky global');
        }
    }

    // Configurar el botón de menú en el título sticky
    if (sectionMenuButton) {
        console.log('Configurando botón de menú en título sticky');

        // Configurar directamente el botón
        const sectionButton = sectionMenuButton.querySelector('button');
        if (sectionButton) {
            // Añadir un ID único para facilitar la depuración
            sectionButton.id = 'section-menu-button-inner';

            // Añadir el event listener para abrir el menú
            sectionButton.addEventListener('click', function(event) {
                console.log('Clic en botón de título sticky');
                openMobileMenu(event);
            });

            // Añadir estilos para asegurar que sea clickeable
            sectionButton.style.cursor = 'pointer';
            sectionButton.style.zIndex = '100';

            console.log('Event listener añadido al botón del título sticky');
        } else {
            console.error('No se encontró el botón dentro de section-menu-button');
        }

        // También configurar el contenedor
        sectionMenuButton.style.cursor = 'pointer';
        sectionMenuButton.style.zIndex = '99';

        // Añadir un event listener directo con función inline para depuración
        sectionMenuButton.addEventListener('click', function(event) {
            console.log('Clic en contenedor del botón de título sticky');
            mobileMenu.classList.remove('translate-x-full');
            mobileMenu.classList.add('translate-x-0');
            document.body.classList.add('overflow-hidden');
            event.stopPropagation();
        });

        console.log('Event listener añadido al contenedor del botón del título sticky');
    }

    // Asegurarse de que el botón regular también funcione
    if (regularMenuButton) {
        regularMenuButton.addEventListener('click', openMobileMenu);
        console.log('Event listener añadido al botón regular');
    }

    // Configurar el botón de cierre del menú
    if (closeMenuButton) {
        closeMenuButton.addEventListener('click', closeMobileMenu);
        console.log('Event listener añadido al botón de cierre');
    }

    // Añadir un listener global para depuración de clics
    document.addEventListener('click', function(event) {
        const path = event.composedPath();
        if (path.includes(sectionMenuButton) || (sectionMenuButton && sectionMenuButton.contains(event.target))) {
            console.log('Clic detectado en o dentro del botón de título sticky');
        }
    });
}

/**
 * Inicializa el comportamiento de scroll para mostrar/ocultar el botón sticky
 */
function initScrollBehavior() {
    const stickyMenuButton = document.getElementById('sticky-menu-button');
    const sectionMenuButton = document.getElementById('section-menu-button');
    const headerHeight = document.querySelector('header').offsetHeight;
    const sectionHeader = document.getElementById('bocetos-header');

    if (!stickyMenuButton || !sectionHeader) return;

    // Función para actualizar la visibilidad de los botones
    function updateButtonsVisibility() {
        const scrollPosition = window.scrollY;

        // Verificar si el título sticky está visible y anclado en la parte superior
        const sectionHeaderRect = sectionHeader.getBoundingClientRect();
        const isSectionHeaderSticky = sectionHeaderRect.top === 0;

        // Gestionar el botón en el título sticky
        if (sectionMenuButton) {
            console.log('Estado sticky del título:', isSectionHeaderSticky, 'Posición top:', sectionHeaderRect.top);

            if (isSectionHeaderSticky) {
                // Mostrar el botón en el título sticky cuando está anclado
                sectionMenuButton.classList.remove('opacity-0');
                sectionMenuButton.classList.add('opacity-100');

                // Asegurarse de que sea clickeable
                sectionMenuButton.style.display = 'block';
                sectionMenuButton.style.pointerEvents = 'auto';
                sectionMenuButton.style.zIndex = '100';
                sectionMenuButton.style.cursor = 'pointer';

                // Verificar que el botón interno también sea clickeable
                const sectionButton = sectionMenuButton.querySelector('button');
                if (sectionButton) {
                    sectionButton.style.pointerEvents = 'auto';
                    sectionButton.style.cursor = 'pointer';
                    sectionButton.style.zIndex = '101';
                }

                console.log('Botón de título sticky visible y clickeable');
            } else {
                // Ocultar el botón en el título sticky cuando no está anclado
                sectionMenuButton.classList.remove('opacity-100');
                sectionMenuButton.classList.add('opacity-0');

                // Desactivar interacción cuando está oculto
                sectionMenuButton.style.pointerEvents = 'none';

                // Ocultar completamente después de la transición
                setTimeout(() => {
                    if (sectionHeader.getBoundingClientRect().top !== 0) {
                        sectionMenuButton.style.display = 'none';
                        sectionMenuButton.style.visibility = 'hidden';
                    }
                }, 300);

                console.log('Botón de título sticky oculto');
            }
        }

        // Gestionar el botón sticky global
        if (scrollPosition > headerHeight && !isSectionHeaderSticky) {
            // Mostrar el botón sticky global cuando no estamos en el header
            // y el título sticky no está visible
            stickyMenuButton.classList.remove('hidden');
            stickyMenuButton.classList.add('visible');
        } else {
            // Ocultar el botón sticky global
            stickyMenuButton.classList.remove('visible');
            // No ocultamos inmediatamente para permitir la transición
            setTimeout(() => {
                if (window.scrollY <= headerHeight || isSectionHeaderSticky) {
                    stickyMenuButton.classList.add('hidden');
                }
            }, 300);
        }
    }

    // Escuchar el evento de scroll
    window.addEventListener('scroll', updateButtonsVisibility);

    // También escuchar el evento resize para actualizar cuando cambie el tamaño de la ventana
    window.addEventListener('resize', updateButtonsVisibility);

    // Ejecutar una vez al cargar la página
    updateButtonsVisibility();
}

/**
 * Abre una imagen en tamaño completo
 * @param {string} imageSrc - La ruta de la imagen
 */
function openFullSizeImage(imageSrc) {
    // Crear un modal para mostrar la imagen
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50';
    modal.style.backdropFilter = 'blur(5px)';

    // Crear contenedor para la imagen y controles
    const container = document.createElement('div');
    container.className = 'relative max-w-[90vw] max-h-[90vh]';

    // Crear la imagen
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = 'Boceto en tamaño completo';
    img.className = 'max-h-[90vh] max-w-[90vw] object-contain';

    // Crear botón de cierre
    const closeButton = document.createElement('button');
    closeButton.className = 'absolute top-2 right-2 bg-white bg-opacity-50 hover:bg-opacity-100 rounded-full p-2 transition-all duration-300';
    closeButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    `;

    // Añadir evento para cerrar el modal
    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        document.body.removeChild(modal);
    });

    // Cerrar el modal al hacer clic fuera de la imagen
    modal.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // Evitar que el clic en la imagen cierre el modal
    img.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Añadir elementos al DOM
    container.appendChild(img);
    container.appendChild(closeButton);
    modal.appendChild(container);
    document.body.appendChild(modal);

    // Añadir tecla ESC para cerrar
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', handleKeyDown);
        }
    };

    document.addEventListener('keydown', handleKeyDown);
}
