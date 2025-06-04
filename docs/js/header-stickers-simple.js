/**
 * Script para manejar stickers interactivos en el header sin Three.js
 * Permite arrastrar y lanzar stickers con física simple
 */

document.addEventListener('DOMContentLoaded', initStickers);

// Variables globales
let stickers = [];
let selectedSticker = null;
let isMouseDown = false;
let mouseX = 0;
let mouseY = 0;
let prevMouseX = 0;
let prevMouseY = 0;
let mouseVelocityX = 0;
let mouseVelocityY = 0;
let headerRect = null;
let isMouseOverHeader = false;

// Función principal para inicializar los stickers
function initStickers() {
    console.log('Inicializando stickers simples...');

    // Buscar el header
    const header = document.querySelector('header');
    if (!header) return;

    // Establecer el fondo azul del header con el color exacto #1017e8
    header.style.backgroundColor = '#1017e8';
    header.style.overflow = 'hidden';
    header.style.position = 'relative';

    // Añadir un estilo global para asegurar que no haya bordes blancos
    const style = document.createElement('style');
    style.textContent = `
        .sticker-item {
            background-color: transparent !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            object-fit: contain !important;
        }

        header {
            background-color: #1017e8 !important;
        }
    `;
    document.head.appendChild(style);

    // Obtener las dimensiones del header
    headerRect = header.getBoundingClientRect();

    // Añadir event listeners para la interacción con el cursor
    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('mousedown', onDocumentMouseDown);
    document.addEventListener('mouseup', onDocumentMouseUp);

    // Añadir event listeners para la interacción táctil (móvil)
    document.addEventListener('touchstart', onDocumentTouchStart, { passive: false });
    document.addEventListener('touchmove', onDocumentTouchMove, { passive: false });
    document.addEventListener('touchend', onDocumentTouchEnd, { passive: false });

    // Event listener para redimensionamiento de ventana
    window.addEventListener('resize', onWindowResize);

    // Crear contenedor para los stickers
    const stickersContainer = document.createElement('div');
    stickersContainer.className = 'stickers-container';
    stickersContainer.style.position = 'relative';
    stickersContainer.style.width = '100%';
    stickersContainer.style.height = '120px';
    stickersContainer.style.overflow = 'hidden';
    stickersContainer.style.zIndex = '10'; // Asegurar que esté detrás de los botones de navegación

    // Reemplazar el contenedor existente o añadir el nuevo
    const placeholder = document.getElementById('header-stickers-container');
    if (placeholder) {
        placeholder.appendChild(stickersContainer);
    } else {
        header.prepend(stickersContainer);
    }

    // Lista de stickers a usar
    const stickerPaths = [
        '/assets/stickers/IMG_0371.png',
        '/assets/stickers/IMG_0372.png',
        '/assets/stickers/IMG_0373.png',
        '/assets/stickers/IMG_0377.png',
        '/assets/stickers/IMG_0385.png'
    ];

    // Configuración para 2 filas y 3 columnas
    const rows = 2;
    const cols = 3;
    const stickerSize = 120; // Tamaño de los stickers

    // Limpiar el array de stickers
    stickers = [];

    // Crear stickers
    for (let i = 0; i < stickerPaths.length; i++) {
        // Calcular posición en la cuadrícula (2 filas x 3 columnas)
        const row = Math.floor(i / cols);
        const col = i % cols;

        // Distribuir los stickers en la cuadrícula con superposición
        // Añadir un poco de aleatoriedad para que no estén perfectamente alineados
        const randomOffsetX = (Math.random() * 20) - 10; // Entre -10 y 10 px
        const randomOffsetY = (Math.random() * 20) - 10; // Entre -10 y 10 px

        // Calcular posición base
        const xPos = (col / (cols - 1)) * 70 + 15; // 15% a 85% del ancho
        const yPos = row === 0 ? 25 : 75; // 25% desde arriba para primera fila, 75% para segunda

        // Crear elemento sticker directamente como imagen
        const stickerElement = document.createElement('img');
        stickerElement.className = 'sticker-item';
        stickerElement.src = stickerPaths[i];
        stickerElement.alt = `Sticker ${i + 1}`;
        stickerElement.style.position = 'absolute';
        stickerElement.style.width = `${stickerSize}px`;
        stickerElement.style.height = `${stickerSize}px`;
        stickerElement.style.left = `${xPos + randomOffsetX}%`;
        stickerElement.style.top = `${yPos + randomOffsetY}%`;
        stickerElement.style.transform = 'translate(-50%, -50%)';
        stickerElement.style.cursor = 'grab';
        stickerElement.style.userSelect = 'none';
        stickerElement.style.zIndex = Math.floor(Math.random() * 6) + 1;
        stickerElement.style.backgroundColor = 'transparent';
        stickerElement.style.border = 'none';
        stickerElement.style.padding = '0';
        stickerElement.style.margin = '0';
        stickerElement.style.objectFit = 'contain';
        stickerElement.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))';

        // Añadir rotación aleatoria
        const rotation = Math.random() * 20 - 10; // Entre -10 y 10 grados
        stickerElement.style.transform += ` rotate(${rotation}deg)`;

        // Añadir sticker al contenedor
        stickersContainer.appendChild(stickerElement);

        // Crear objeto sticker con propiedades físicas
        const sticker = {
            element: stickerElement,
            x: parseFloat(stickerElement.style.left) / 100 * header.offsetWidth,
            y: parseFloat(stickerElement.style.top) / 100 * header.offsetHeight,
            velocityX: 0,
            velocityY: 0,
            rotation: rotation,
            rotationVelocity: 0,
            mass: 1 + Math.random() * 0.5, // Masa aleatoria
            friction: 0.98, // Fricción
            restitution: 0.8 + Math.random() * 0.2, // Elasticidad
            width: stickerSize,
            height: stickerSize,
            // Añadir propiedades para manejar la visualización
            path: stickerPaths[i],
            index: i
        };

        // Añadir al array de stickers
        stickers.push(sticker);
    }

    // Iniciar animación
    requestAnimationFrame(updateStickers);

    console.log(`Creados ${stickers.length} stickers en el header`);
}

// Función para actualizar la posición y física de los stickers
function updateStickers() {
    // Obtener el header para los límites
    const header = document.querySelector('header');
    if (!header) return;

    const headerWidth = header.offsetWidth;
    const headerHeight = header.offsetHeight;

    // Actualizar cada sticker
    stickers.forEach(sticker => {
        // Si no es el sticker seleccionado, aplicar física
        if (sticker !== selectedSticker) {
            // Aplicar velocidad
            sticker.x += sticker.velocityX;
            sticker.y += sticker.velocityY;
            sticker.rotation += sticker.rotationVelocity;

            // Aplicar fricción
            sticker.velocityX *= sticker.friction;
            sticker.velocityY *= sticker.friction;
            sticker.rotationVelocity *= sticker.friction;

            // Rebote en los bordes
            const halfWidth = sticker.width / 2;
            const halfHeight = sticker.height / 2;

            if (sticker.x + halfWidth > headerWidth) {
                sticker.x = headerWidth - halfWidth;
                sticker.velocityX = -sticker.velocityX * sticker.restitution;
                sticker.rotationVelocity += (Math.random() - 0.5) * 2;
            } else if (sticker.x - halfWidth < 0) {
                sticker.x = halfWidth;
                sticker.velocityX = -sticker.velocityX * sticker.restitution;
                sticker.rotationVelocity += (Math.random() - 0.5) * 2;
            }

            if (sticker.y + halfHeight > headerHeight) {
                sticker.y = headerHeight - halfHeight;
                sticker.velocityY = -sticker.velocityY * sticker.restitution;
                sticker.rotationVelocity += (Math.random() - 0.5) * 2;
            } else if (sticker.y - halfHeight < 0) {
                sticker.y = halfHeight;
                sticker.velocityY = -sticker.velocityY * sticker.restitution;
                sticker.rotationVelocity += (Math.random() - 0.5) * 2;
            }

            // Actualizar posición del elemento
            sticker.element.style.left = `${(sticker.x / headerWidth) * 100}%`;
            sticker.element.style.top = `${(sticker.y / headerHeight) * 100}%`;

            // Actualizar rotación
            sticker.element.style.transform = `translate(-50%, -50%) rotate(${sticker.rotation}deg)`;
        }
    });

    // Continuar la animación
    requestAnimationFrame(updateStickers);
}

// Función para manejar el evento mousedown
function onDocumentMouseDown(event) {
    // Verificar si el evento ocurrió dentro del header
    const header = document.querySelector('header');
    if (!header) return;

    headerRect = header.getBoundingClientRect();
    isMouseOverHeader = (
        event.clientX >= headerRect.left &&
        event.clientX <= headerRect.right &&
        event.clientY >= headerRect.top &&
        event.clientY <= headerRect.bottom
    );

    if (isMouseOverHeader) {
        // Buscar el sticker más cercano al clic
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        let closestSticker = null;
        let closestDistance = Infinity;

        stickers.forEach(sticker => {
            const stickerRect = sticker.element.getBoundingClientRect();
            const stickerCenterX = stickerRect.left + stickerRect.width / 2;
            const stickerCenterY = stickerRect.top + stickerRect.height / 2;

            const dx = mouseX - stickerCenterX;
            const dy = mouseY - stickerCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < stickerRect.width / 2 && distance < closestDistance) {
                closestDistance = distance;
                closestSticker = sticker;
            }
        });

        if (closestSticker) {
            isMouseDown = true;
            selectedSticker = closestSticker;

            // Detener cualquier movimiento
            selectedSticker.velocityX = 0;
            selectedSticker.velocityY = 0;
            selectedSticker.rotationVelocity = 0;

            // Cambiar cursor y estilo
            document.body.style.cursor = 'grabbing';
            selectedSticker.element.style.zIndex = 100;
            selectedSticker.element.style.transform = `translate(-50%, -50%) rotate(${selectedSticker.rotation}deg) scale(1.1)`;

            // Guardar posición del ratón
            prevMouseX = mouseX;
            prevMouseY = mouseY;

            // Prevenir comportamiento por defecto
            event.preventDefault();
        }
    }
}

// Función para manejar el evento mousemove
function onDocumentMouseMove(event) {
    // Guardar posición anterior
    prevMouseX = mouseX;
    prevMouseY = mouseY;

    // Actualizar posición actual
    mouseX = event.clientX;
    mouseY = event.clientY;

    // Calcular velocidad
    mouseVelocityX = mouseX - prevMouseX;
    mouseVelocityY = mouseY - prevMouseY;

    // Actualizar si el cursor está sobre el header
    if (headerRect) {
        isMouseOverHeader = (
            mouseX >= headerRect.left &&
            mouseX <= headerRect.right &&
            mouseY >= headerRect.top &&
            mouseY <= headerRect.bottom
        );
    }

    // Cambiar cursor si está sobre el header
    if (isMouseOverHeader && !isMouseDown) {
        document.body.style.cursor = 'grab';
    } else if (!isMouseDown) {
        document.body.style.cursor = 'default';
    }

    // Si hay un sticker seleccionado, moverlo con el cursor
    if (isMouseDown && selectedSticker) {
        const header = document.querySelector('header');
        if (!header) return;

        // Actualizar posición del sticker
        selectedSticker.x = (mouseX - headerRect.left);
        selectedSticker.y = (mouseY - headerRect.top);

        // Actualizar posición del elemento
        selectedSticker.element.style.left = `${(selectedSticker.x / header.offsetWidth) * 100}%`;
        selectedSticker.element.style.top = `${(selectedSticker.y / header.offsetHeight) * 100}%`;

        // Actualizar velocidad
        selectedSticker.velocityX = mouseVelocityX * 0.5;
        selectedSticker.velocityY = mouseVelocityY * 0.5;

        // Prevenir comportamiento por defecto
        event.preventDefault();
    }
}

// Función para manejar el evento mouseup
function onDocumentMouseUp(event) {
    if (isMouseDown && selectedSticker) {
        // Lanzar el sticker con la velocidad actual
        const impulse = 1.2;
        selectedSticker.velocityX *= impulse;
        selectedSticker.velocityY *= impulse;

        // Añadir rotación basada en la velocidad
        selectedSticker.rotationVelocity = (Math.random() - 0.5) * Math.sqrt(
            selectedSticker.velocityX * selectedSticker.velocityX +
            selectedSticker.velocityY * selectedSticker.velocityY
        );

        // Restaurar estilo
        selectedSticker.element.style.zIndex = Math.floor(Math.random() * 6) + 1;
        selectedSticker.element.style.transform = `translate(-50%, -50%) rotate(${selectedSticker.rotation}deg)`;

        // Deseleccionar
        selectedSticker = null;
    }

    isMouseDown = false;
    document.body.style.cursor = isMouseOverHeader ? 'grab' : 'default';

    // Prevenir comportamiento por defecto
    event.preventDefault();
}

// Funciones para eventos táctiles
function onDocumentTouchStart(event) {
    if (event.touches.length === 1) {
        const touch = event.touches[0];

        // Verificar si el toque está dentro del header
        const header = document.querySelector('header');
        if (!header) return;

        headerRect = header.getBoundingClientRect();
        const isTouchInHeader = (
            touch.clientX >= headerRect.left &&
            touch.clientX <= headerRect.right &&
            touch.clientY >= headerRect.top &&
            touch.clientY <= headerRect.bottom
        );

        // Solo prevenir el comportamiento predeterminado si el toque está en el header
        // y no está en un botón de navegación o hamburguesa
        if (isTouchInHeader) {
            // Verificar si el toque está en un botón de navegación o hamburguesa
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            const isButton = target && (
                target.closest('a') ||
                target.closest('button') ||
                target.closest('.z-50') ||
                target.closest('.z-40')
            );

            if (!isButton) {
                event.preventDefault();
                onDocumentMouseDown({
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    preventDefault: () => {}
                });
            }
        }
    }
}

function onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
        const touch = event.touches[0];

        // Solo prevenir el comportamiento predeterminado si hay un sticker seleccionado
        if (selectedSticker) {
            event.preventDefault();
        }

        onDocumentMouseMove({
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => {}
        });
    }
}

function onDocumentTouchEnd(event) {
    // Solo prevenir el comportamiento predeterminado si hay un sticker seleccionado
    if (selectedSticker) {
        event.preventDefault();
    }

    onDocumentMouseUp({
        preventDefault: () => {}
    });
}

// Función para manejar el redimensionamiento de la ventana
function onWindowResize() {
    const header = document.querySelector('header');
    if (header) {
        headerRect = header.getBoundingClientRect();
    }
}
