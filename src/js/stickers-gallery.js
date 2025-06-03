/**
 * Script para cargar y mostrar todos los stickers disponibles
 * utilizando el algoritmo de ordenamiento de grid
 */

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si estamos en la página de stickers
    const stickersGrid = document.getElementById('stickers-grid');
    if (!stickersGrid) return;

    // Inicializar la galería de stickers
    initStickersGallery();
});

/**
 * Inicializa la galería de stickers
 */
async function initStickersGallery() {
    try {
        // Obtener el contenedor de la galería
        const stickersGrid = document.getElementById('stickers-grid');
        const loadingMessage = document.getElementById('loading-stickers');

        if (!stickersGrid) return;

        // Obtener todos los stickers disponibles
        const stickersList = await getAllAvailableStickers();

        // Limpiar el contenedor
        stickersGrid.innerHTML = '';

        // Crear elementos para cada sticker
        const stickersPromises = stickersList.map(sticker => {
            return new Promise((resolve, reject) => {
                // Crear elemento contenedor
                const gridItem = document.createElement('div');
                gridItem.className = 'grid-item sticker-item';

                // Crear imagen
                const img = document.createElement('img');
                img.src = sticker.path;
                img.alt = sticker.name;
                img.className = 'w-full h-auto transition-all opacity-0 transition-opacity duration-500';

                // Manejar carga de imagen
                img.onload = () => {
                    img.classList.remove('opacity-0');
                    img.classList.add('opacity-100');
                    resolve(gridItem);
                };

                // Manejar error de carga
                img.onerror = () => {
                    console.warn(`No se pudo cargar la imagen: ${sticker.path}`);
                    gridItem.remove(); // Eliminar el elemento si la imagen no se puede cargar
                    resolve(null);
                };

                // Añadir imagen al contenedor
                gridItem.appendChild(img);

                // Añadir elemento al grid
                stickersGrid.appendChild(gridItem);
            });
        });

        // Esperar a que todas las imágenes se carguen
        const loadedItems = await Promise.all(stickersPromises);
        const validItems = loadedItems.filter(item => item !== null);

        // Ocultar mensaje de carga si existe
        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }

        // Mostrar mensaje si no hay stickers
        if (validItems.length === 0) {
            const noStickersMessage = document.createElement('div');
            noStickersMessage.className = 'text-center py-8 text-gray-500';
            noStickersMessage.textContent = 'No se encontraron stickers disponibles.';
            stickersGrid.appendChild(noStickersMessage);
            return;
        }

        // Inicializar el organizador de grid
        const gridOrganizer = new GridOrganizer('stickers-grid', {
            gap: 30, // Mayor espacio entre stickers para el efecto de stickers pegados
            minItemWidth: 180, // Stickers un poco más grandes
            targetRowHeight: 220, // Altura objetivo un poco mayor
            itemSelector: '.grid-item' // Selector para los elementos de la grilla
        });

        console.log(`Galería de stickers inicializada con éxito. ${validItems.length} stickers cargados.`);
    } catch (error) {
        console.error('Error al inicializar la galería de stickers:', error);

        // Mostrar mensaje de error
        const stickersGrid = document.getElementById('stickers-grid');
        const loadingMessage = document.getElementById('loading-stickers');

        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }

        if (stickersGrid) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'text-center py-8 text-red-500';
            errorMessage.textContent = 'Error al cargar los stickers. Por favor, intenta de nuevo más tarde.';
            stickersGrid.innerHTML = '';
            stickersGrid.appendChild(errorMessage);
        }
    }
}

/**
 * Obtiene todos los stickers disponibles en la carpeta de stickers
 * @returns {Promise<Array>} Lista de stickers disponibles
 */
async function getAllAvailableStickers() {
    // Usamos la lista exacta de stickers que sabemos que están disponibles
    // en la carpeta assets/stickers

    const basePath = '../assets/stickers/';

    // Lista de stickers disponibles (confirmados mediante dir assets/stickers)
    const availableStickers = [
        { path: `${basePath}IMG_0371.png`, name: 'Sticker 1' },
        { path: `${basePath}IMG_0372.png`, name: 'Sticker 2' },
        { path: `${basePath}IMG_0373.png`, name: 'Sticker 3' },
        { path: `${basePath}IMG_0377.png`, name: 'Sticker 4' },
        { path: `${basePath}IMG_0381.png`, name: 'Sticker 5' },
        { path: `${basePath}IMG_0385.png`, name: 'Sticker 6' }
    ];

    console.log(`Cargando ${availableStickers.length} stickers disponibles.`);
    return availableStickers;
}
