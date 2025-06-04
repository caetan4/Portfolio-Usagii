/**
 * Script para cargar y mostrar todos los prints disponibles
 * utilizando el algoritmo de ordenamiento de grid
 */

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si estamos en la página de stickers/prints
    const printsContainer = document.getElementById('prints-container');
    if (!printsContainer) return;

    // Inicializar la galería de prints
    initPrintsGallery();
});

/**
 * Inicializa la galería de prints
 */
async function initPrintsGallery() {
    try {
        // Obtener el contenedor de la galería
        const printsContainer = document.getElementById('prints-container');
        const loadingMessage = document.getElementById('loading-prints');

        if (!printsContainer) return;

        // Obtener todos los prints disponibles
        const printsList = await getAllAvailablePrints();

        // Limpiar el contenedor
        printsContainer.innerHTML = '';

        // Crear elementos para cada print
        const printsPromises = printsList.map(print => {
            return new Promise((resolve, reject) => {
                // Crear elemento contenedor
                const gridItem = document.createElement('div');
                gridItem.className = 'w-full print-item';

                // Añadir margen superior aleatorio en desktop para efecto escalonado
                const randomMargin = Math.floor(Math.random() * 3); // 0, 1, o 2
                if (randomMargin === 1) {
                    gridItem.classList.add('md:mt-8');
                } else if (randomMargin === 2) {
                    gridItem.classList.add('md:mt-16');
                }

                // Crear imagen
                const img = document.createElement('img');
                img.src = print.path;
                img.alt = print.name;
                img.className = 'w-full h-auto rounded-lg shadow-md hover:shadow-xl transition-shadow opacity-0 transition-opacity duration-500';

                // Manejar carga de imagen
                img.onload = () => {
                    img.classList.remove('opacity-0');
                    img.classList.add('opacity-100');
                    resolve(gridItem);
                };

                // Manejar error de carga
                img.onerror = () => {
                    console.warn(`No se pudo cargar la imagen: ${print.path}`);
                    gridItem.remove(); // Eliminar el elemento si la imagen no se puede cargar
                    resolve(null);
                };

                // Añadir evento de clic para ver la imagen en tamaño completo
                img.addEventListener('click', () => {
                    openFullSizeImage(print.path);
                });

                // Añadir imagen al contenedor
                gridItem.appendChild(img);

                // Añadir elemento al grid
                printsContainer.appendChild(gridItem);
            });
        });

        // Esperar a que todas las imágenes se carguen
        const loadedItems = await Promise.all(printsPromises);
        const validItems = loadedItems.filter(item => item !== null);

        // Ocultar mensaje de carga si existe
        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }

        // Mostrar mensaje si no hay prints
        if (validItems.length === 0) {
            const noPrintsMessage = document.createElement('div');
            noPrintsMessage.className = 'text-center py-8 text-gray-500';
            noPrintsMessage.textContent = 'No se encontraron prints disponibles.';
            printsContainer.appendChild(noPrintsMessage);
            return;
        }

        console.log(`Galería de prints inicializada con éxito. ${validItems.length} prints cargados.`);
    } catch (error) {
        console.error('Error al inicializar la galería de prints:', error);

        // Mostrar mensaje de error
        const printsContainer = document.getElementById('prints-container');
        const loadingMessage = document.getElementById('loading-prints');

        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }

        if (printsContainer) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'text-center py-8 text-red-500';
            errorMessage.textContent = 'Error al cargar los prints. Por favor, intenta de nuevo más tarde.';
            printsContainer.innerHTML = '';
            printsContainer.appendChild(errorMessage);
        }
    }
}

/**
 * Obtiene todos los prints disponibles en la carpeta de prints
 * @returns {Promise<Array>} Lista de prints disponibles
 */
function getAllAvailablePrints() {
    // Usamos la lista exacta de prints que sabemos que están disponibles
    // en la carpeta assets/prints

    const basePath = '../assets/prints/';

    // Lista de prints disponibles (confirmados mediante dir assets/prints)
    const availablePrints = [
        { path: `${basePath}IMG_0135.png`, name: 'Print artístico 1' },
        { path: `${basePath}IMG_0395.png`, name: 'Print artístico 2' },
        { path: `${basePath}IMG_0404.png`, name: 'Print artístico 3' },
        { path: `${basePath}IMG_0405.png`, name: 'Print artístico 4' }
    ];

    console.log(`Cargando ${availablePrints.length} prints disponibles.`);
    return Promise.resolve(availablePrints);
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
    img.alt = 'Print en tamaño completo';
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
