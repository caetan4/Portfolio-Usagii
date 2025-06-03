/**
 * Script para animar los stickers del header con Three.js
 * Crea un efecto de pulso 3D para los stickers y permite interacción con el cursor
 */

// Importar Three.js desde CDN si no está disponible
if (typeof THREE === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = initStickerAnimation;
    document.head.appendChild(script);
} else {
    document.addEventListener('DOMContentLoaded', initStickerAnimation);
}

// Función para manejar el movimiento del cursor
function onDocumentMouseMove(event) {
    // Guardar posición anterior
    prevMouseX = mouseX;
    prevMouseY = mouseY;

    // Actualizar posición actual
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;

    // Calcular velocidad del cursor (para lanzamiento)
    mouseVelocityX = mouseX - prevMouseX;
    mouseVelocityY = mouseY - prevMouseY;

    // Actualizar si el cursor está sobre el header
    const headerElement = document.querySelector('header');
    if (headerElement) {
        headerRect = headerElement.getBoundingClientRect();
        isMouseOverHeader = (
            event.clientX >= headerRect.left &&
            event.clientX <= headerRect.right &&
            event.clientY >= headerRect.top &&
            event.clientY <= headerRect.bottom
        );
    }

    // Cambiar el cursor si está sobre el header pero no hay sticker seleccionado
    if (isMouseOverHeader && !isMouseDown) {
        document.body.style.cursor = 'grab';
    } else if (!isMouseDown) {
        document.body.style.cursor = 'default';
    }

    // Si hay un sticker seleccionado, moverlo con el cursor
    if (isMouseDown && selectedSticker) {
        // Prevenir el comportamiento por defecto para evitar selección de texto
        event.preventDefault();

        // Convertir coordenadas del cursor a coordenadas 3D
        const vector = new THREE.Vector3(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1,
            0.5
        );

        // Actualizar posición del sticker seleccionado
        selectedSticker.mesh.position.x = vector.x * 2;
        selectedSticker.mesh.position.y = vector.y * 2;

        // Actualizar velocidad del sticker basada en el movimiento del cursor
        // Aumentamos el factor para que el lanzamiento sea más notorio
        selectedSticker.velocityX = mouseVelocityX * 0.1;
        selectedSticker.velocityY = mouseVelocityY * 0.1;

        // Limitar la velocidad máxima para evitar lanzamientos extremos
        const maxVelocity = 0.3;
        if (Math.abs(selectedSticker.velocityX) > maxVelocity) {
            selectedSticker.velocityX = Math.sign(selectedSticker.velocityX) * maxVelocity;
        }
        if (Math.abs(selectedSticker.velocityY) > maxVelocity) {
            selectedSticker.velocityY = Math.sign(selectedSticker.velocityY) * maxVelocity;
        }

        console.log('Moving sticker to:',
            selectedSticker.mesh.position.x.toFixed(2),
            selectedSticker.mesh.position.y.toFixed(2)
        );
    }
}

// Función para manejar el redimensionamiento de la ventana
function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    // Actualizar las dimensiones del header
    const header = document.querySelector('header');
    if (header) {
        headerRect = header.getBoundingClientRect();
    }
}

// Función para manejar el evento mousedown
function onDocumentMouseDown(event) {
    console.log('Mouse down event detected');

    // Verificar si el evento ocurrió dentro del header
    const headerElement = document.querySelector('header');
    if (!headerElement) return;

    const headerRect = headerElement.getBoundingClientRect();
    isMouseOverHeader = (
        event.clientX >= headerRect.left &&
        event.clientX <= headerRect.right &&
        event.clientY >= headerRect.top &&
        event.clientY <= headerRect.bottom
    );

    console.log('Is mouse over header:', isMouseOverHeader);

    if (isMouseOverHeader) {
        isMouseDown = true;

        // Convertir coordenadas del cursor a coordenadas normalizadas (-1 a 1)
        const mouseVector = new THREE.Vector3(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1,
            0.5
        );

        console.log('Mouse vector:', mouseVector);
        console.log('Available stickers:', stickers.length);

        // Buscar el sticker más cercano al cursor
        let closestSticker = null;
        let closestDistance = Infinity;

        stickers.forEach((sticker, index) => {
            if (!sticker || !sticker.mesh) {
                console.warn(`Sticker at index ${index} is invalid:`, sticker);
                return;
            }

            // Calcular distancia entre el cursor y el sticker
            const dx = mouseVector.x * 2 - sticker.mesh.position.x;
            const dy = mouseVector.y * 2 - sticker.mesh.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            console.log(`Sticker ${index} distance:`, distance.toFixed(2));

            // Si está lo suficientemente cerca y es más cercano que el anterior
            // Aumentamos el radio de detección para facilitar la selección
            if (distance < 2.0 && distance < closestDistance) {
                closestDistance = distance;
                closestSticker = sticker;
            }
        });

        // Seleccionar el sticker más cercano
        selectedSticker = closestSticker;

        // Si se seleccionó un sticker, traerlo al frente y cambiar el cursor
        if (selectedSticker) {
            console.log('Sticker selected:', selectedSticker);
            selectedSticker.mesh.position.z = 0.5;
            document.body.style.cursor = 'grabbing';

            // Detener cualquier velocidad actual
            selectedSticker.velocityX = 0;
            selectedSticker.velocityY = 0;

            // Añadir un efecto visual para indicar que el sticker está seleccionado
            selectedSticker.mesh.scale.set(1.2, 1.2, 1);

            // Añadir una clase al body para indicar que se está arrastrando
            document.body.classList.add('dragging-sticker');

            // Prevenir el comportamiento por defecto para evitar selección de texto
            event.preventDefault();
        } else {
            console.log('No sticker selected');
        }
    }
}

// Función para manejar el evento mouseup
function onDocumentMouseUp(event) {
    console.log('Mouse up event detected');

    // Quitar la clase de arrastre
    document.body.classList.remove('dragging-sticker');

    isMouseDown = false;

    // Restaurar el cursor
    document.body.style.cursor = isMouseOverHeader ? 'grab' : 'default';

    // Si hay un sticker seleccionado, lanzarlo con la velocidad del cursor
    if (selectedSticker) {
        console.log('Releasing sticker');

        // Aplicar la velocidad actual del cursor al sticker
        // La velocidad ya se ha actualizado en el evento mousemove

        // Añadir un pequeño impulso adicional en la dirección del movimiento
        // para que el lanzamiento sea más satisfactorio
        const impulse = 1.5; // Factor de impulso
        selectedSticker.velocityX *= impulse;
        selectedSticker.velocityY *= impulse;

        // Devolver el sticker a su profundidad y escala normal
        selectedSticker.mesh.position.z = 0;
        selectedSticker.mesh.scale.set(1, 1, 1);

        console.log('Sticker lanzado con velocidad:',
            selectedSticker.velocityX.toFixed(3),
            selectedSticker.velocityY.toFixed(3)
        );

        // Deseleccionar el sticker
        selectedSticker = null;
    }

    // Prevenir el comportamiento por defecto
    event.preventDefault();
}

// Función para manejar el evento touchstart (equivalente a mousedown en móvil)
function onDocumentTouchStart(event) {
    // Prevenir el comportamiento por defecto (scroll, zoom, etc.)
    event.preventDefault();

    // Obtener el primer toque
    if (event.touches.length === 1) {
        const touch = event.touches[0];

        // Verificar si el toque está sobre el header
        if (headerRect) {
            isMouseOverHeader = (
                touch.clientX >= headerRect.left &&
                touch.clientX <= headerRect.right &&
                touch.clientY >= headerRect.top &&
                touch.clientY <= headerRect.bottom
            );
        }

        if (isMouseOverHeader) {
            isMouseDown = true;

            // Actualizar posición del cursor
            mouseX = touch.clientX - windowHalfX;
            mouseY = touch.clientY - windowHalfY;
            prevMouseX = mouseX;
            prevMouseY = mouseY;

            // Convertir coordenadas del toque a coordenadas normalizadas (-1 a 1)
            const touchVector = new THREE.Vector3(
                (touch.clientX / window.innerWidth) * 2 - 1,
                -(touch.clientY / window.innerHeight) * 2 + 1,
                0.5
            );

            // Buscar el sticker más cercano al toque
            let closestSticker = null;
            let closestDistance = Infinity;

            stickers.forEach(sticker => {
                // Calcular distancia entre el toque y el sticker
                const dx = touchVector.x * 2 - sticker.mesh.position.x;
                const dy = touchVector.y * 2 - sticker.mesh.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Si está lo suficientemente cerca y es más cercano que el anterior
                // Aumentamos el radio de detección para facilitar la selección en móvil
                if (distance < 1.5 && distance < closestDistance) {
                    closestDistance = distance;
                    closestSticker = sticker;
                }
            });

            // Seleccionar el sticker más cercano
            selectedSticker = closestSticker;

            // Si se seleccionó un sticker, traerlo al frente
            if (selectedSticker) {
                selectedSticker.mesh.position.z = 0.5;

                // Detener cualquier velocidad actual
                selectedSticker.velocityX = 0;
                selectedSticker.velocityY = 0;

                // Añadir un efecto visual para indicar que el sticker está seleccionado
                selectedSticker.mesh.scale.set(1.2, 1.2, 1);

                console.log('Sticker seleccionado en móvil:', selectedSticker);
            }
        }
    }
}

// Función para manejar el evento touchmove (equivalente a mousemove en móvil)
function onDocumentTouchMove(event) {
    // Prevenir el comportamiento por defecto (scroll, zoom, etc.)
    event.preventDefault();

    // Obtener el primer toque
    if (event.touches.length === 1) {
        const touch = event.touches[0];

        // Guardar posición anterior
        prevMouseX = mouseX;
        prevMouseY = mouseY;

        // Actualizar posición actual
        mouseX = touch.clientX - windowHalfX;
        mouseY = touch.clientY - windowHalfY;

        // Calcular velocidad del toque (para lanzamiento)
        mouseVelocityX = mouseX - prevMouseX;
        mouseVelocityY = mouseY - prevMouseY;

        // Actualizar si el toque está sobre el header
        if (headerRect) {
            isMouseOverHeader = (
                touch.clientX >= headerRect.left &&
                touch.clientX <= headerRect.right &&
                touch.clientY >= headerRect.top &&
                touch.clientY <= headerRect.bottom
            );
        }

        // Si hay un sticker seleccionado, moverlo con el toque
        if (isMouseDown && selectedSticker) {
            // Convertir coordenadas del toque a coordenadas 3D
            const vector = new THREE.Vector3(
                (touch.clientX / window.innerWidth) * 2 - 1,
                -(touch.clientY / window.innerHeight) * 2 + 1,
                0.5
            );

            // Actualizar posición del sticker seleccionado
            selectedSticker.mesh.position.x = vector.x * 2;
            selectedSticker.mesh.position.y = vector.y * 2;

            // Actualizar velocidad del sticker basada en el movimiento del toque
            // Aumentamos el factor para que el lanzamiento sea más notorio
            selectedSticker.velocityX = mouseVelocityX * 0.1;
            selectedSticker.velocityY = mouseVelocityY * 0.1;

            // Limitar la velocidad máxima para evitar lanzamientos extremos
            const maxVelocity = 0.3;
            if (Math.abs(selectedSticker.velocityX) > maxVelocity) {
                selectedSticker.velocityX = Math.sign(selectedSticker.velocityX) * maxVelocity;
            }
            if (Math.abs(selectedSticker.velocityY) > maxVelocity) {
                selectedSticker.velocityY = Math.sign(selectedSticker.velocityY) * maxVelocity;
            }
        }
    }
}

// Función para manejar el evento touchend (equivalente a mouseup en móvil)
function onDocumentTouchEnd(event) {
    // Prevenir el comportamiento por defecto
    event.preventDefault();

    isMouseDown = false;

    // Si hay un sticker seleccionado, lanzarlo con la velocidad del toque
    if (selectedSticker) {
        // Aplicar la velocidad actual del toque al sticker
        // La velocidad ya se ha actualizado en el evento touchmove

        // Añadir un pequeño impulso adicional en la dirección del movimiento
        // para que el lanzamiento sea más satisfactorio
        const impulse = 1.5; // Factor de impulso
        selectedSticker.velocityX *= impulse;
        selectedSticker.velocityY *= impulse;

        // Devolver el sticker a su profundidad y escala normal
        selectedSticker.mesh.position.z = 0;
        selectedSticker.mesh.scale.set(1, 1, 1);

        console.log('Sticker lanzado en móvil con velocidad:',
            selectedSticker.velocityX.toFixed(3),
            selectedSticker.velocityY.toFixed(3)
        );

        // Deseleccionar el sticker
        selectedSticker = null;
    }
}

// Variables globales para la interacción con el cursor
let mouseX = 0;
let mouseY = 0;
let prevMouseX = 0;
let prevMouseY = 0;
let mouseVelocityX = 0;
let mouseVelocityY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let headerRect = null;
let isMouseOverHeader = false;
let isMouseDown = false;
let selectedSticker = null;
let stickers = []; // Array para almacenar referencias a todos los stickers

// Lista de stickers específicos a usar (6 stickers PNG)
const STICKERS = [
    '../assets/stickers/IMG_0371.png',
    '../assets/stickers/IMG_0372.png',
    '../assets/stickers/IMG_0373.png',
    '../assets/stickers/IMG_0377.png',
    '../assets/stickers/IMG_0381.png',
    '../assets/stickers/IMG_0385.png'
];

// Ajustar rutas para la página principal
function adjustPaths() {
    // Detectar si estamos en la página principal
    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        return STICKERS.map(path => path.replace('../', ''));
    }
    return STICKERS;
}

// Función principal para inicializar la animación de stickers
function initStickerAnimation() {
    // Buscar el header
    const header = document.querySelector('header');
    if (!header) return;

    // Establecer el fondo azul del header
    header.style.backgroundColor = '#0000FF';

    // Añadir estilo de cursor para indicar interactividad
    header.style.cursor = 'pointer';

    // Obtener las dimensiones del header para la interacción con el cursor
    headerRect = header.getBoundingClientRect();

    // Añadir event listeners para la interacción con el cursor (escritorio)
    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('mousedown', onDocumentMouseDown);
    document.addEventListener('mouseup', onDocumentMouseUp);

    // Añadir event listeners para la interacción táctil (móvil)
    document.addEventListener('touchstart', onDocumentTouchStart, { passive: false });
    document.addEventListener('touchmove', onDocumentTouchMove, { passive: false });
    document.addEventListener('touchend', onDocumentTouchEnd, { passive: false });

    // Event listener para redimensionamiento de ventana
    window.addEventListener('resize', onWindowResize);

    // Verificar si el cursor está sobre el header
    document.addEventListener('mouseover', function(event) {
        const path = event.composedPath();
        isMouseOverHeader = path.includes(header);
    });

    // Limpiar el array de stickers
    stickers = [];

    // Inicializar variables de tamaño de ventana
    onWindowResize();

    // Crear contenedor para los stickers 3D
    const stickersContainer = document.createElement('div');
    stickersContainer.className = 'stickers-3d-container';
    stickersContainer.style.position = 'relative';
    stickersContainer.style.width = '100%';
    stickersContainer.style.height = '120px'; // Reducir la altura del header
    stickersContainer.style.overflow = 'hidden';

    // Reemplazar el contenedor de stickers existente o añadir el nuevo
    const existingContainer = header.querySelector('.flex.justify-between');
    if (existingContainer) {
        header.replaceChild(stickersContainer, existingContainer);
    } else {
        header.innerHTML = ''; // Limpiar el header
        header.appendChild(stickersContainer);
    }

    // Obtener los stickers con las rutas ajustadas
    const stickerPaths = adjustPaths();

    // Configuración para 2 filas y 3 columnas
    const rows = 2;
    const cols = 3;
    const stickerSize = 120; // Stickers adaptados al header más pequeño

    // Limpiar el array de stickers antes de crear nuevos
    stickers = [];
    console.log('Inicializando stickers...');

    // Crear una escena 3D para cada sticker
    for (let i = 0; i < stickerPaths.length; i++) {
        const stickerElement = document.createElement('div');
        stickerElement.className = 'sticker-3d';
        stickerElement.style.position = 'absolute';
        stickerElement.style.width = `${stickerSize}px`;
        stickerElement.style.height = `${stickerSize}px`;

        // Hacer que el elemento sea interactivo
        stickerElement.style.cursor = 'grab';
        stickerElement.style.userSelect = 'none';
        stickerElement.style.webkitUserSelect = 'none';
        stickerElement.style.msUserSelect = 'none';

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

        stickerElement.style.left = `${xPos + randomOffsetX}%`;
        stickerElement.style.top = `${yPos + randomOffsetY}%`;
        stickerElement.style.transform = 'translate(-50%, -50%)';

        // Añadir rotación aleatoria
        const rotation = Math.random() * 20 - 10; // Entre -10 y 10 grados
        stickerElement.style.transform += ` rotate(${rotation}deg)`;

        // Añadir z-index aleatorio para superposición
        stickerElement.style.zIndex = Math.floor(Math.random() * 6) + 1;

        // Ocultar en móvil si es necesario (mostrar solo 4 en móvil)
        if (i >= 4) {
            stickerElement.classList.add('hidden');
            stickerElement.classList.add('sm:block');
        }

        // Añadir eventos directamente al elemento para mayor compatibilidad
        stickerElement.addEventListener('mousedown', function(e) {
            console.log('Sticker element clicked:', i);
        });

        stickersContainer.appendChild(stickerElement);

        // Crear escena Three.js para este sticker
        createStickerScene(stickerElement, stickerPaths[i], i);
    }

    console.log(`Creados ${stickers.length} stickers en el header`);

    // Función para crear una escena Three.js para un sticker
    function createStickerScene(element, stickerPath, index) {
        // Crear escena, cámara y renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });

        // Usar el tamaño del elemento para el renderer
        const size = parseInt(element.style.width);
        renderer.setSize(size, size);
        element.appendChild(renderer.domElement);

        // Crear un plano para el sticker
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(stickerPath, (texture) => {
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true
            });

            // Crear el sticker
            const geometry = new THREE.PlaneGeometry(1, 1);
            const sticker = new THREE.Mesh(geometry, material);
            scene.add(sticker);

            // Posicionar la cámara
            camera.position.z = 1.5;

            // Crear objeto sticker con propiedades físicas
            const stickerObj = {
                mesh: sticker,
                element: element,
                velocityX: 0,
                velocityY: 0,
                mass: 1 + Math.random() * 0.5, // Masa aleatoria para comportamiento variado
                friction: 0.98, // Fricción para desacelerar gradualmente
                restitution: 0.8 + Math.random() * 0.2, // Elasticidad para rebotes (valor aleatorio)
                initialX: 0,
                initialY: 0,
                initialScale: 1,
                pulsePhase: index // Fase para el efecto de pulso
            };

            // Añadir al array global de stickers
            stickers.push(stickerObj);

            // Animación
            const animate = () => {
                requestAnimationFrame(animate);

                // Efecto de pulso suave
                const time = Date.now() * 0.001;
                const pulse = Math.sin(time + stickerObj.pulsePhase) * 0.08 + 1;
                sticker.scale.set(pulse, pulse, 1);

                // Pequeña rotación
                const rotationAmount = Math.sin(time * 0.5 + stickerObj.pulsePhase) * 0.05;
                sticker.rotation.z = rotationAmount;

                // Si este sticker no es el seleccionado actualmente, aplicar física
                if (selectedSticker !== stickerObj) {
                    // Aplicar velocidad
                    sticker.position.x += stickerObj.velocityX;
                    sticker.position.y += stickerObj.velocityY;

                    // Aplicar fricción
                    stickerObj.velocityX *= stickerObj.friction;
                    stickerObj.velocityY *= stickerObj.friction;

                    // Límites del área de juego (coordenadas normalizadas)
                    const boundsX = 2.2; // Un poco más grande que el área visible
                    const boundsY = 1.2; // Un poco más grande que el área visible

                    // Rebote en los bordes con efectos visuales
                    if (sticker.position.x > boundsX) {
                        // Rebote en el borde derecho
                        sticker.position.x = boundsX;
                        stickerObj.velocityX = -stickerObj.velocityX * stickerObj.restitution;

                        // Efecto visual de "aplastamiento" en el rebote
                        if (Math.abs(stickerObj.velocityX) > 0.05) {
                            sticker.scale.x = 0.8; // Aplastar horizontalmente
                            sticker.scale.y = 1.2; // Estirar verticalmente

                            // Restaurar la forma original gradualmente
                            setTimeout(() => {
                                if (sticker) sticker.scale.set(1, 1, 1);
                            }, 150);
                        }
                    } else if (sticker.position.x < -boundsX) {
                        // Rebote en el borde izquierdo
                        sticker.position.x = -boundsX;
                        stickerObj.velocityX = -stickerObj.velocityX * stickerObj.restitution;

                        // Efecto visual de "aplastamiento" en el rebote
                        if (Math.abs(stickerObj.velocityX) > 0.05) {
                            sticker.scale.x = 0.8; // Aplastar horizontalmente
                            sticker.scale.y = 1.2; // Estirar verticalmente

                            // Restaurar la forma original gradualmente
                            setTimeout(() => {
                                if (sticker) sticker.scale.set(1, 1, 1);
                            }, 150);
                        }
                    }

                    if (sticker.position.y > boundsY) {
                        // Rebote en el borde superior
                        sticker.position.y = boundsY;
                        stickerObj.velocityY = -stickerObj.velocityY * stickerObj.restitution;

                        // Efecto visual de "aplastamiento" en el rebote
                        if (Math.abs(stickerObj.velocityY) > 0.05) {
                            sticker.scale.y = 0.8; // Aplastar verticalmente
                            sticker.scale.x = 1.2; // Estirar horizontalmente

                            // Restaurar la forma original gradualmente
                            setTimeout(() => {
                                if (sticker) sticker.scale.set(1, 1, 1);
                            }, 150);
                        }
                    } else if (sticker.position.y < -boundsY) {
                        // Rebote en el borde inferior
                        sticker.position.y = -boundsY;
                        stickerObj.velocityY = -stickerObj.velocityY * stickerObj.restitution;

                        // Efecto visual de "aplastamiento" en el rebote
                        if (Math.abs(stickerObj.velocityY) > 0.05) {
                            sticker.scale.y = 0.8; // Aplastar verticalmente
                            sticker.scale.x = 1.2; // Estirar horizontalmente

                            // Restaurar la forma original gradualmente
                            setTimeout(() => {
                                if (sticker) sticker.scale.set(1, 1, 1);
                            }, 150);
                        }
                    }

                    // Añadir un pequeño giro al rebotar
                    if (Math.abs(stickerObj.velocityX) > 0.05 || Math.abs(stickerObj.velocityY) > 0.05) {
                        sticker.rotation.z += (Math.random() - 0.5) * 0.1;
                    }

                    // Interacción con el cursor si está sobre el header y no hay sticker seleccionado
                    if (isMouseOverHeader && !selectedSticker) {
                        // Convertir coordenadas del cursor a coordenadas normalizadas
                        const mouseVector = new THREE.Vector3(
                            (mouseX + windowHalfX) / window.innerWidth * 2 - 1,
                            -((mouseY + windowHalfY) / window.innerHeight * 2 - 1),
                            0.5
                        );

                        // Calcular distancia entre el cursor y el sticker
                        const dx = mouseVector.x * 2 - sticker.position.x;
                        const dy = mouseVector.y * 2 - sticker.position.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        // Radio de influencia
                        const influenceRadius = 1.5;

                        if (distance < influenceRadius) {
                            // Factor de repulsión
                            const repulsionFactor = 0.01;

                            // Calcular fuerza de repulsión
                            const repulsionStrength = (influenceRadius - distance) * repulsionFactor;

                            // Aplicar fuerza en dirección opuesta al cursor
                            stickerObj.velocityX -= dx * repulsionStrength / stickerObj.mass;
                            stickerObj.velocityY -= dy * repulsionStrength / stickerObj.mass;
                        }
                    }
                }

                renderer.render(scene, camera);
            };

            animate();
        });
    }
}
