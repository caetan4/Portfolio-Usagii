/**
 * Script para cargar y mostrar las animaciones
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la carga de animaciones
    initAnimacionesGallery();
});

/**
 * Inicializa la galería de animaciones
 */
function initAnimacionesGallery() {
    const grid = document.getElementById('animaciones-grid');
    const loadingMessage = document.getElementById('loading-message');

    if (!grid) return;

    // Simular carga de imágenes (en un proyecto real, esto cargaría desde una API o carpeta)
    setTimeout(() => {
        // Ocultar mensaje de carga
        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }

        // Cargar imágenes desde la carpeta de animaciones
        loadAnimacionesFromFolder(grid);
    }, 1000);
}

/**
 * Carga las animaciones desde la carpeta de gifs
 * @param {HTMLElement} grid - El contenedor de la grilla
 */
function loadAnimacionesFromFolder(grid) {
    console.log('Cargando animaciones desde la carpeta de gifs...');

    // Lista de GIFs disponibles en la carpeta de gifs
    // Usar rutas absolutas para evitar problemas de resolución de rutas
    const baseUrl = window.location.origin;
    console.log('URL base:', baseUrl);

    const animacionesPaths = [
        `${baseUrl}/assets/gifs/proyectofinal_Caetana.gif`,
        `${baseUrl}/assets/gifs/autorretrato_Caetana.gif`,
        `${baseUrl}/assets/gifs/pendulo_Caetana.gif`,
        `${baseUrl}/assets/gifs/mascaras_Caetana.gif`,
        `${baseUrl}/assets/gifs/camaras_Caetana.gif`,
     
       
       
        
    ];

    console.log('Rutas de animaciones:', animacionesPaths);

    // Limpiar el grid antes de cargar nuevas animaciones
    grid.innerHTML = '';

    // Crear el contenedor de la grilla
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';
    grid.appendChild(gridContainer);

    // Cargar las animaciones de forma asíncrona para obtener sus dimensiones reales
    console.log('Cargando animaciones de forma asíncrona...');

    // Crear promesas para cargar y medir cada GIF
    const loadPromises = animacionesPaths.map(path => {
        return new Promise((resolve) => {
            // Crear un objeto Image para cargar la animación y obtener sus dimensiones
            const preloadImg = new Image();

            // Cuando la imagen carga, resolver la promesa con la información necesaria
            preloadImg.onload = () => {
                console.log(`Animación cargada y medida: ${path}`);
                console.log(`Dimensiones: ${preloadImg.naturalWidth}x${preloadImg.naturalHeight}`);

                // Extraer el título del nombre del archivo
                const fileName = path.split('/').pop().replace('_Caetana.gif', '');
                const title = fileName.charAt(0).toUpperCase() + fileName.slice(1);

                // Resolver con toda la información necesaria
                resolve({
                    path,
                    title,
                    width: preloadImg.naturalWidth,
                    height: preloadImg.naturalHeight,
                    aspectRatio: preloadImg.naturalWidth / preloadImg.naturalHeight
                });
            };

            // Si hay un error al cargar, resolver con información predeterminada
            preloadImg.onerror = () => {
                console.error(`Error al cargar la animación: ${path}`);

                // Extraer el título del nombre del archivo
                const fileName = path.split('/').pop().replace('_Caetana.gif', '');
                const title = fileName.charAt(0).toUpperCase() + fileName.slice(1);

                // Resolver con información predeterminada
                resolve({
                    path,
                    title,
                    width: 300,
                    height: 300,
                    aspectRatio: 1,
                    error: true
                });
            };

            // Iniciar la carga de la imagen
            preloadImg.src = path;
        });
    });

    // Esperar a que todas las animaciones se carguen y se midan
    Promise.all(loadPromises).then(animationsData => {
        console.log('Todas las animaciones medidas:', animationsData);

        // Ordenar las animaciones por su relación de aspecto (de más ancha a más alta)
        animationsData.sort((a, b) => b.aspectRatio - a.aspectRatio);

        // Crear los elementos para cada GIF
        const items = animationsData.map(data => {
            console.log(`Creando elemento para: ${data.path}`);

            const item = document.createElement('div');
            item.className = 'grid-item';

            // Añadir clases según la relación de aspecto
            if (data.aspectRatio > 1.2) {
                item.classList.add('wide-item'); // Más ancha que alta
            } else if (data.aspectRatio < 0.8) {
                item.classList.add('tall-item'); // Más alta que ancha
            } else {
                item.classList.add('square-item'); // Aproximadamente cuadrada
            }

            // Crear título
            const titleElement = document.createElement('h3');
            titleElement.className = 'animacion-title';
            titleElement.textContent = data.title;

            // Crear contenedor para la animación
            const animacionContainer = document.createElement('div');
            animacionContainer.className = 'animacion-container';

            // Establecer estilo para mantener la relación de aspecto
            animacionContainer.style.aspectRatio = `${data.width} / ${data.height}`;

            const img = document.createElement('img');
            img.src = data.path;
            img.alt = `Animación: ${data.title}`;
            img.loading = 'lazy';

            // Si hubo un error al cargar la imagen previamente
            if (data.error) {
                img.src = '../assets/placeholder.jpg';
                img.alt = 'Animación no disponible';
            }

            // Añadir evento de clic para ver la animación en tamaño completo
            img.addEventListener('click', () => {
                openFullSizeAnimation(data.path, data.title);
            });

            // Añadir elementos al DOM
            animacionContainer.appendChild(img);
            item.appendChild(animacionContainer);
            item.appendChild(titleElement);

            return item;
        });

        // Organizar la grilla con los elementos creados
        organizeGrid(gridContainer, items);
    });

/**
 * Organiza los elementos en una grilla adaptativa basada en sus dimensiones
 * @param {HTMLElement} container - El contenedor donde se organizarán los elementos
 * @param {Array<HTMLElement>} items - Los elementos a organizar
 */
function organizeGrid(container, items) {
    console.log('Organizando la grilla adaptativa...');

    // Limpiar el contenedor
    container.innerHTML = '';

    // Si no hay elementos, mostrar un mensaje
    if (items.length === 0) {
        const noItemsMessage = document.createElement('div');
        noItemsMessage.className = 'no-items-message';
        noItemsMessage.textContent = 'No hay animaciones disponibles';
        container.appendChild(noItemsMessage);
        return;
    }

    // Crear el contenedor de la grilla masonry
    const masonryGrid = document.createElement('div');
    masonryGrid.className = 'masonry-grid';
    container.appendChild(masonryGrid);

    // Añadir cada elemento a la grilla
    items.forEach(item => {
        masonryGrid.appendChild(item);
    });

    console.log('Grilla de animaciones organizada con éxito');
}
}



/**
 * Abre una animación en tamaño completo
 * @param {string} imagePath - La ruta de la imagen
 * @param {string} title - El título de la animación
 */
function openFullSizeAnimation(imagePath, title = '') {
    // Crear un modal para mostrar la animación
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50';
    modal.style.backdropFilter = 'blur(5px)';

    // Crear contenedor para la animación y controles
    const container = document.createElement('div');
    container.className = 'relative max-w-[90vw] max-h-[90vh] flex flex-col items-center';

    // Añadir título si existe
    if (title) {
        const titleElement = document.createElement('h2');
        titleElement.className = 'text-white text-2xl font-bold mb-4';
        titleElement.textContent = title;
        container.appendChild(titleElement);
    }

    // Crear la imagen
    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = title ? `Animación: ${title}` : 'Animación en tamaño completo';
    img.className = 'max-h-[80vh] max-w-[90vw] object-contain';

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
