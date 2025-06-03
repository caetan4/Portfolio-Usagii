/**
 * Script para cargar y mostrar las ilustraciones
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando galería de ilustraciones...');

    // Verificar que el contenedor existe
    const grid = document.getElementById('ilustraciones-grid');
    if (!grid) {
        console.error('No se encontró el contenedor de ilustraciones con ID: ilustraciones-grid');
        return;
    }

    console.log('Contenedor de ilustraciones encontrado:', grid);

    // Inicializar la carga de ilustraciones
    initIlustracionesGallery();
});

/**
 * Inicializa la galería de ilustraciones
 */
function initIlustracionesGallery() {
    const grid = document.getElementById('ilustraciones-grid');
    const loadingMessage = document.getElementById('loading-message');

    if (!grid) return;

    // Simular carga de imágenes (en un proyecto real, esto cargaría desde una API o carpeta)
    setTimeout(() => {
        // Ocultar mensaje de carga
        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }

        // Cargar imágenes desde la carpeta de ilustraciones
        loadIlustracionesFromFolder(grid);
    }, 1000);
}

/**
 * Carga las ilustraciones desde la carpeta de ilustraciones
 * @param {HTMLElement} grid - El contenedor de la grilla
 */
function loadIlustracionesFromFolder(grid) {
    // En un proyecto real, esto podría ser una llamada a una API para obtener la lista de archivos
    // Por ahora, usamos las imágenes que tenemos en la carpeta de ilustraciones
    console.log('Cargando ilustraciones desde la carpeta...');

    // Volver a las rutas relativas pero asegurarnos de que sean correctas
    const ilustracionesPaths = [
        '../assets/ilustraciones/IMG_0388.png',
        '../assets/ilustraciones/IMG_0389.png',
        '../assets/ilustraciones/IMG_0390.png',
        '../assets/ilustraciones/IMG_0391.png',
        '../assets/ilustraciones/IMG_0392.png',
        '../assets/ilustraciones/IMG_0393.png',
        '../assets/ilustraciones/IMG_0396.png',
        '../assets/ilustraciones/IMG_0397.png',
        '../assets/ilustraciones/IMG_0400.png',
        '../assets/ilustraciones/IMG_0401.png',
        '../assets/ilustraciones/IMG_0403.png'
    ];

    // Verificar si las imágenes existen
    ilustracionesPaths.forEach(path => {
        fetch(path)
            .then(response => {
                if (!response.ok) {
                    console.error(`La imagen no existe o no se puede acceder: ${path}`);
                } else {
                    console.log(`La imagen existe y se puede acceder: ${path}`);
                }
            })
            .catch(error => {
                console.error(`Error al verificar la imagen: ${path}`, error);
            });
    });

    console.log('Rutas de ilustraciones:', ilustracionesPaths);

    // Limpiar el grid antes de cargar nuevas imágenes
    grid.innerHTML = '';

    // Crear un array de promesas para cargar todas las imágenes
    const loadPromises = ilustracionesPaths.map(path => createIlustracionItem(path));

    // Esperar a que todas las imágenes se carguen
    Promise.allSettled(loadPromises)
        .then(results => {
            // Filtrar solo los resultados exitosos
            const items = results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);

            // Si no hay imágenes cargadas, mostrar un mensaje
            if (items.length === 0) {
                const noImagesMsg = document.createElement('div');
                noImagesMsg.className = 'col-span-full text-center py-8 text-gray-500';
                noImagesMsg.textContent = 'No se encontraron ilustraciones disponibles.';
                grid.appendChild(noImagesMsg);
                return;
            }

            // Crear una grilla simétrica y centrada
            const gridContainer = document.createElement('div');
            gridContainer.className = 'grid-container';

            // Clasificar las imágenes por su orientación
            const horizontalItems = [];
            const verticalItems = [];
            const squareItems = [];

            // Clasificar los elementos según su relación de aspecto
            items.forEach(item => {
                const img = item.querySelector('img');
                const aspectRatio = img.naturalWidth / img.naturalHeight;

                // Limpiar clases previas que puedan afectar el layout
                item.classList.remove('md:col-span-2', 'row-span-2');

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

            // Reemplazar el contenido del grid con la nueva grilla
            grid.appendChild(gridContainer);

            console.log(`Cargadas ${items.length} ilustraciones de ${ilustracionesPaths.length} disponibles.`);
        })
        .catch(error => {
            console.error('Error al cargar las ilustraciones:', error);

            // Mostrar mensaje de error
            const errorMsg = document.createElement('div');
            errorMsg.className = 'col-span-full text-center py-8 text-red-500';
            errorMsg.textContent = 'Error al cargar las ilustraciones. Por favor, intenta de nuevo más tarde.';
            grid.appendChild(errorMsg);
        });
}

/**
 * Crea un elemento de ilustración para la grilla
 * @param {string} imagePath - La ruta de la imagen
 * @returns {Promise<HTMLElement>} - Promesa que resuelve al elemento creado
 */
function createIlustracionItem(imagePath) {
    return new Promise((resolve, reject) => {
        // Verificar primero si la imagen existe
        const testImg = new Image();
        testImg.onload = () => {
            console.log(`Imagen cargada correctamente: ${imagePath}`);

            // Crear los elementos una vez que sabemos que la imagen existe
            const item = document.createElement('div');
            item.className = 'grid-item';

            const ilustracion = document.createElement('div');
            ilustracion.className = 'ilustracion-item';

            const img = document.createElement('img');
            img.src = imagePath;
            img.alt = 'Ilustración';
            img.loading = 'lazy';
            img.className = 'opacity-0 transition-opacity duration-500';

            // Cuando la imagen se muestra en el DOM
            img.onload = () => {
                console.log(`Imagen renderizada en el DOM: ${imagePath}`);
                img.classList.remove('opacity-0');
                img.classList.add('opacity-100');

                // Determinar si la imagen es horizontal o vertical
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                console.log(`Relación de aspecto para ${imagePath}: ${aspectRatio}`);

                if (aspectRatio > 1.2) {
                    // Imagen horizontal
                    item.classList.add('horizontal-item');
                    console.log(`Clasificada como horizontal: ${imagePath}`);
                } else if (aspectRatio < 0.8) {
                    // Imagen vertical
                    item.classList.add('vertical-item');
                    console.log(`Clasificada como vertical: ${imagePath}`);
                } else {
                    // Imagen cuadrada
                    item.classList.add('square-item');
                    console.log(`Clasificada como cuadrada: ${imagePath}`);
                }
            };

            // Si hay un error al mostrar la imagen en el DOM
            img.onerror = () => {
                console.warn(`Error al renderizar la imagen en el DOM: ${imagePath}`);
                // No rechazamos la promesa aquí porque la imagen ya se verificó
            };

            // Añadir evento de clic para ver la imagen en tamaño completo
            img.addEventListener('click', () => {
                openFullSizeImage(imagePath);
            });

            ilustracion.appendChild(img);
            item.appendChild(ilustracion);

            // Resolvemos la promesa con el elemento creado
            resolve(item);
        };

        // Si hay un error al verificar la imagen
        testImg.onerror = () => {
            console.error(`No se pudo cargar la imagen: ${imagePath}`);
            reject(new Error(`No se pudo cargar la imagen: ${imagePath}`));
        };

        // Iniciar la carga de la imagen
        testImg.src = imagePath;
    });
}

/**
 * Abre una imagen en tamaño completo
 * @param {string} imagePath - La ruta de la imagen
 */
function openFullSizeImage(imagePath) {
    // Crear un modal para mostrar la imagen
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50';
    modal.style.backdropFilter = 'blur(5px)';

    // Crear contenedor para la imagen y controles
    const container = document.createElement('div');
    container.className = 'relative max-w-[90vw] max-h-[90vh]';

    // Crear la imagen
    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = 'Ilustración en tamaño completo';
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
