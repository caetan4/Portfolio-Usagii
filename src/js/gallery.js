import * as THREE from 'three';

// Importar algoritmo de organización de grillas
import '../js/grid-algorithm.js';

// Configuración de la galería
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el menú móvil
    initMobileMenu();

    // Inicializar la grilla
    initGalleryGrid();

    // Inicializar efectos 3D en la galería
    initGallery3DEffects();
});

// Inicializar el menú móvil
function initMobileMenu() {
    const menuButton = document.getElementById('menu-button');
    const closeButton = document.getElementById('close-menu');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuButton && closeButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.remove('translate-x-full');
        });

        closeButton.addEventListener('click', () => {
            mobileMenu.classList.add('translate-x-full');
        });
    }
}

// Función para inicializar la grilla de la galería
function initGalleryGrid() {
    const galleryGrid = document.getElementById('gallery-grid');

    if (!galleryGrid) return;

    // Añadir listeners para filtros
    const filterButtons = document.querySelectorAll('button[class*="px-4 py-2"]');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Resetear todos los botones
            filterButtons.forEach(btn => {
                btn.classList.remove('bg-indigo-600', 'text-white');
                btn.classList.add('bg-white', 'text-gray-700');
            });

            // Activar el botón seleccionado
            button.classList.remove('bg-white', 'text-gray-700');
            button.classList.add('bg-indigo-600', 'text-white');

            // Obtener categoría seleccionada
            const category = button.textContent.trim().toLowerCase();

            // Filtrar elementos según la categoría
            const items = galleryGrid.querySelectorAll('.grid-item');

            if (category === 'todos') {
                // Mostrar todos los elementos
                items.forEach(item => {
                    item.style.display = '';
                });
            } else {
                // Filtrar por categoría
                items.forEach(item => {
                    const itemCategory = item.dataset.category || '';
                    if (itemCategory === category || itemCategory === '') {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }

            // Reorganizar la grilla después de filtrar
            setTimeout(() => {
                // Disparar evento de redimensionamiento para reorganizar la grilla
                window.dispatchEvent(new Event('resize'));
            }, 100);
        });
    });

    // Función para detectar la orientación de las imágenes
    function detectImageOrientation(imageUrl) {
        return new Promise((resolve) => {
            const img = new Image();

            img.onload = function() {
                const width = this.width;
                const height = this.height;

                let orientation;

                if (width > height * 1.2) {
                    // Paisaje
                    orientation = 'landscape';
                } else if (width < height * 0.8) {
                    // Retrato
                    orientation = 'portrait';
                } else {
                    // Cuadrado
                    orientation = 'square';
                }

                resolve({
                    width,
                    height,
                    orientation,
                    aspectRatio: width / height
                });
            };

            img.onerror = function() {
                // En caso de error, asumir cuadrado
                resolve({
                    width: 1,
                    height: 1,
                    orientation: 'square',
                    aspectRatio: 1
                });
            };

            img.src = imageUrl;
        });
    }
}

// Función para inicializar efectos 3D en la galería
function initGallery3DEffects() {
    const galleryItems = document.querySelectorAll('#gallery-grid > div');

    galleryItems.forEach(item => {
        // Crear un contenedor para el efecto 3D
        const effectContainer = document.createElement('div');
        effectContainer.classList.add('absolute', 'inset-0', 'pointer-events-none', 'opacity-30');
        item.appendChild(effectContainer);

        // Crear escena, cámara y renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, item.clientWidth / item.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(item.clientWidth, item.clientHeight);
        effectContainer.appendChild(renderer.domElement);

        // Crear geometría para el efecto
        const geometry = new THREE.PlaneGeometry(2, 2, 20, 20);

        // Crear material con efecto de ondas
        const material = new THREE.MeshBasicMaterial({
            color: 0x6366f1,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });

        // Crear malla
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Posicionar cámara
        camera.position.z = 1.5;

        // Deformar la geometría para crear efecto de ondas
        const positionAttribute = geometry.attributes.position;
        const vertex = new THREE.Vector3();

        for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromBufferAttribute(positionAttribute, i);

            const waveX = 0.1 * Math.sin(vertex.x * 2 + vertex.y * 3);
            const waveY = 0.1 * Math.sin(vertex.y * 2 + vertex.x * 3);

            positionAttribute.setZ(i, waveX + waveY);
        }

        // Función de animación
        function animate() {
            requestAnimationFrame(animate);

            mesh.rotation.x += 0.003;
            mesh.rotation.y += 0.003;

            renderer.render(scene, camera);
        }

        // Iniciar animación
        animate();

        // Manejar eventos de hover
        item.addEventListener('mouseenter', () => {
            effectContainer.classList.remove('opacity-30');
            effectContainer.classList.add('opacity-70');
        });

        item.addEventListener('mouseleave', () => {
            effectContainer.classList.remove('opacity-70');
            effectContainer.classList.add('opacity-30');
        });
    });
}

// Función para detectar la orientación de las imágenes (simulada)
function detectImageOrientation(imageUrl) {
    return new Promise((resolve) => {
        const img = new Image();

        img.onload = function() {
            const width = this.width;
            const height = this.height;

            let orientation;

            if (width > height) {
                // Paisaje
                orientation = 'landscape';
            } else if (width < height) {
                // Retrato
                orientation = 'portrait';
            } else {
                // Cuadrado
                orientation = 'square';
            }

            resolve({
                width,
                height,
                orientation,
                aspectRatio: width / height
            });
        };

        img.src = imageUrl;
    });
}
