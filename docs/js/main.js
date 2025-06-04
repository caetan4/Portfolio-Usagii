import * as THREE from 'three';

// Variables globales para animaciones
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let isMobile = false;
let isTouchDevice = false;
let performanceLevel = 'high'; // 'low', 'medium', 'high'

// Función para detectar dispositivos móviles y capacidades
function detectDeviceCapabilities() {
    // Detectar si es móvil
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Detectar si es dispositivo táctil
    isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);

    // Determinar nivel de rendimiento basado en el dispositivo y tamaño de pantalla
    if (isMobile || window.innerWidth < 768) {
        if (window.innerWidth < 480) {
            performanceLevel = 'low';
        } else {
            performanceLevel = 'medium';
        }
    } else {
        performanceLevel = 'high';
    }

    console.log(`Device: ${isMobile ? 'Mobile' : 'Desktop'}, Touch: ${isTouchDevice}, Performance: ${performanceLevel}`);
}

// Configuración de escenas 3D
document.addEventListener('DOMContentLoaded', () => {
    // Detectar capacidades del dispositivo
    detectDeviceCapabilities();

    // Inicializar menú móvil
    initMobileMenu();

    // Inicializar escenas 3D
    initHeaderScene();
    initLogo3D(); // Inicializar logo 3D
    initCategoryPreviews();

    // Inicializar fondos 3D solo en dispositivos con rendimiento medio o alto
    if (performanceLevel !== 'low') {
        initBackgroundWaves();
    }

    // Capturar interactividad según el tipo de dispositivo
    if (isTouchDevice) {
        // Para dispositivos táctiles
        document.addEventListener('touchmove', onDocumentTouchMove, { passive: true });
        document.addEventListener('touchstart', onDocumentTouchStart, { passive: true });
    } else {
        // Para dispositivos con mouse
        document.addEventListener('mousemove', onDocumentMouseMove);
    }

    // Ajustar en caso de cambio de orientación
    window.addEventListener('orientationchange', onOrientationChange);
    window.addEventListener('resize', onWindowResize);

    // Cargar script del canvas de dibujo
    loadScript('js/drawing-canvas.js');
});

// Función para capturar movimiento del mouse
function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) / 100;
    mouseY = (event.clientY - windowHalfY) / 100;
}

// Función para capturar movimiento táctil
function onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
        // Reducir la intensidad del efecto en móviles para mejor rendimiento
        mouseX = (event.touches[0].pageX - windowHalfX) / 200;
        mouseY = (event.touches[0].pageY - windowHalfY) / 200;
    }
}

// Función para capturar inicio de toque
function onDocumentTouchStart(event) {
    if (event.touches.length === 1) {
        mouseX = (event.touches[0].pageX - windowHalfX) / 200;
        mouseY = (event.touches[0].pageY - windowHalfY) / 200;
    }
}

// Función para manejar cambios de orientación
function onOrientationChange() {
    // Pequeña pausa para permitir que el navegador actualice las dimensiones
    setTimeout(() => {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        // Actualizar nivel de rendimiento
        detectDeviceCapabilities();
    }, 100);
}

// Función para manejar cambios de tamaño de ventana
function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    // Actualizar nivel de rendimiento
    detectDeviceCapabilities();
}

// Función para cargar scripts dinámicamente
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.type = 'module';
        script.onload = () => resolve(script);
        script.onerror = () => reject(new Error(`Error al cargar el script: ${src}`));
        document.body.appendChild(script);
    });
}

// Función para inicializar el menú móvil
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

// Función para inicializar el logo 3D
function initLogo3D() {
    const logoContainer = document.getElementById('logo-3d');
    const logoFallback = document.getElementById('logo-fallback');

    if (!logoContainer) return;

    // Crear escena, cámara y renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, logoContainer.clientWidth / logoContainer.clientHeight, 0.1, 1000);

    // Configurar renderer según capacidades del dispositivo
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: performanceLevel !== 'low',
        powerPreference: isMobile ? "low-power" : "high-performance"
    });

    renderer.setSize(logoContainer.clientWidth, logoContainer.clientHeight);

    // Limitar pixel ratio para mejorar rendimiento
    const pixelRatio = Math.min(window.devicePixelRatio, performanceLevel === 'low' ? 1 : 2);
    renderer.setPixelRatio(pixelRatio);

    logoContainer.appendChild(renderer.domElement);

    // Crear geometría para el logo - un conejo estilizado
    const rabbitGeometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);

    // Material con efecto brillante
    const rabbitMaterial = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        metalness: 0.7,
        roughness: 0.2,
        emissive: 0x2a0096,
        emissiveIntensity: 0.2
    });

    // Crear malla
    const rabbitMesh = new THREE.Mesh(rabbitGeometry, rabbitMaterial);
    scene.add(rabbitMesh);

    // Añadir luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 2);
    scene.add(directionalLight);

    // Posicionar cámara
    camera.position.z = 2.5;

    // Variables para controlar la animación
    let animationFrameId;
    let lastTime = 0;
    const targetFPS = performanceLevel === 'low' ? 30 : 60;
    const frameInterval = 1000 / targetFPS;

    // Función de animación optimizada
    function animate(currentTime) {
        animationFrameId = requestAnimationFrame(animate);

        // Limitar FPS para mejorar rendimiento
        const deltaTime = currentTime - lastTime;
        if (deltaTime < frameInterval) return;

        // Ajustar para mantener velocidad consistente independiente del FPS
        const timeMultiplier = deltaTime / (1000 / 60);

        // Actualizar tiempo para siguiente frame
        lastTime = currentTime - (deltaTime % frameInterval);

        // Rotación suave
        rabbitMesh.rotation.x += 0.01 * timeMultiplier;
        rabbitMesh.rotation.y += 0.02 * timeMultiplier;

        // Interactividad con el mouse/touch
        rabbitMesh.rotation.x += mouseY * 0.01;
        rabbitMesh.rotation.y += mouseX * 0.01;

        renderer.render(scene, camera);
    }

    // Función para manejar visibilidad de la página
    function handleVisibilityChange() {
        if (document.hidden) {
            // Pausar animación cuando la página no es visible
            cancelAnimationFrame(animationFrameId);

            // Mostrar imagen de respaldo
            if (logoFallback) logoFallback.style.opacity = '1';
        } else {
            // Reiniciar animación cuando la página es visible
            lastTime = performance.now();
            animate(lastTime);

            // Ocultar imagen de respaldo
            if (logoFallback) logoFallback.style.opacity = '0';
        }
    }

    // Manejar redimensionamiento
    const handleResize = () => {
        if (logoContainer.clientWidth > 0 && logoContainer.clientHeight > 0) {
            camera.aspect = logoContainer.clientWidth / logoContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(logoContainer.clientWidth, logoContainer.clientHeight);
        }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Iniciar animación
    lastTime = performance.now();
    animate(lastTime);

    // Manejar errores de WebGL
    renderer.domElement.addEventListener('webglcontextlost', () => {
        console.warn('WebGL context lost. Showing fallback image.');
        if (logoFallback) logoFallback.style.opacity = '1';
    });

    // Retornar función de limpieza para evitar memory leaks
    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);

        // Liberar memoria
        rabbitGeometry.dispose();
        rabbitMaterial.dispose();
        renderer.dispose();
    };
}

// Función para inicializar la escena 3D del header
function initHeaderScene() {
    const headerCanvas = document.getElementById('header-canvas');

    if (!headerCanvas) return;

    // Crear escena, cámara y renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, headerCanvas.clientWidth / headerCanvas.clientHeight, 0.1, 1000);

    // Configurar renderer según capacidades del dispositivo
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: performanceLevel !== 'low', // Desactivar antialiasing en dispositivos de bajo rendimiento
        powerPreference: isMobile ? "low-power" : "high-performance"
    });

    renderer.setSize(headerCanvas.clientWidth, headerCanvas.clientHeight);

    // Limitar pixel ratio para mejorar rendimiento en móviles
    const pixelRatio = Math.min(window.devicePixelRatio, performanceLevel === 'low' ? 1 : 2);
    renderer.setPixelRatio(pixelRatio);

    headerCanvas.appendChild(renderer.domElement);

    // Ajustar número de partículas según rendimiento
    let particlesCount;
    switch(performanceLevel) {
        case 'low':
            particlesCount = 50; // Menos partículas para dispositivos de bajo rendimiento
            break;
        case 'medium':
            particlesCount = 100;
            break;
        case 'high':
            particlesCount = 200;
            break;
        default:
            particlesCount = 100;
    }

    // Crear geometrías para partículas
    const particlesGeometry = new THREE.BufferGeometry();

    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);
    const sizesArray = new Float32Array(particlesCount);

    const color1 = new THREE.Color(0x6366f1); // Indigo
    const color2 = new THREE.Color(0xf472b6); // Rosa

    for (let i = 0; i < particlesCount; i++) {
        // Posiciones - más concentradas en el centro para móviles
        const i3 = i * 3;
        const spreadFactor = isMobile ? 5 : 8; // Menor dispersión en móviles
        posArray[i3] = (Math.random() - 0.5) * spreadFactor;
        posArray[i3 + 1] = (Math.random() - 0.5) * spreadFactor;
        posArray[i3 + 2] = (Math.random() - 0.5) * spreadFactor;

        // Colores
        const mixedColor = color1.clone().lerp(color2, Math.random());
        colorsArray[i3] = mixedColor.r;
        colorsArray[i3 + 1] = mixedColor.g;
        colorsArray[i3 + 2] = mixedColor.b;

        // Tamaños - partículas más grandes en móviles para mejor visibilidad
        const sizeBase = isMobile ? 0.05 : 0.03;
        const sizeVariation = isMobile ? 0.15 : 0.1;
        sizesArray[i] = Math.random() * sizeVariation + sizeBase;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizesArray, 1));

    // Material para partículas
    const particlesMaterial = new THREE.PointsMaterial({
        size: isMobile ? 0.15 : 0.1, // Partículas más grandes en móviles
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    // Crear sistema de partículas
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Posicionar cámara - más cerca en móviles para mejor visibilidad
    camera.position.z = isMobile ? 3 : 4;

    // Variables para controlar la animación
    let animationFrameId;
    let lastTime = 0;
    const targetFPS = performanceLevel === 'low' ? 30 : 60; // Limitar FPS en dispositivos de bajo rendimiento
    const frameInterval = 1000 / targetFPS;

    // Función de animación optimizada
    function animate(currentTime) {
        animationFrameId = requestAnimationFrame(animate);

        // Limitar FPS para mejorar rendimiento
        const deltaTime = currentTime - lastTime;
        if (deltaTime < frameInterval) return;

        // Ajustar para mantener velocidad consistente independiente del FPS
        const timeMultiplier = deltaTime / (1000 / 60);

        // Actualizar tiempo para siguiente frame
        lastTime = currentTime - (deltaTime % frameInterval);

        // Rotación suave basada en la posición del mouse
        const baseRotationSpeed = 0.0005 * timeMultiplier;
        particlesMesh.rotation.x += baseRotationSpeed;
        particlesMesh.rotation.y += baseRotationSpeed;

        // Interactividad con el mouse/touch - reducida en móviles
        const interactionFactor = isMobile ? 0.0002 : 0.0005;
        particlesMesh.rotation.x += (mouseY * interactionFactor * timeMultiplier);
        particlesMesh.rotation.y += (mouseX * interactionFactor * timeMultiplier);

        // Efecto de "respiración" para las partículas - más sutil en móviles
        const time = Date.now() * 0.0005;
        const breathingIntensity = isMobile ? 0.03 : 0.05;
        particlesMesh.scale.x = 1 + Math.sin(time) * breathingIntensity;
        particlesMesh.scale.y = 1 + Math.sin(time) * breathingIntensity;
        particlesMesh.scale.z = 1 + Math.sin(time) * breathingIntensity;

        renderer.render(scene, camera);
    }

    // Función para manejar visibilidad de la página
    function handleVisibilityChange() {
        if (document.hidden) {
            // Pausar animación cuando la página no es visible
            cancelAnimationFrame(animationFrameId);
        } else {
            // Reiniciar animación cuando la página es visible
            lastTime = performance.now();
            animate(lastTime);
        }
    }

    // Manejar redimensionamiento
    const handleResize = () => {
        if (headerCanvas.clientWidth > 0 && headerCanvas.clientHeight > 0) {
            camera.aspect = headerCanvas.clientWidth / headerCanvas.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(headerCanvas.clientWidth, headerCanvas.clientHeight);

            // Actualizar pixel ratio según rendimiento
            const pixelRatio = Math.min(window.devicePixelRatio, performanceLevel === 'low' ? 1 : 2);
            renderer.setPixelRatio(pixelRatio);
        }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Iniciar animación
    lastTime = performance.now();
    animate(lastTime);

    // Retornar función de limpieza para evitar memory leaks
    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);

        // Liberar memoria
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        renderer.dispose();
    };
}

// Función para inicializar la escena 3D principal
function initMainScene() {
    const mainScene = document.getElementById('main-scene');

    if (!mainScene) return;

    // Crear escena, cámara y renderer
    const scene = new THREE.Scene();

    // Ajustar niebla según rendimiento - menos densa en móviles para mejor rendimiento
    const fogDensity = performanceLevel === 'low' ? 0.08 : (isMobile ? 0.06 : 0.05);
    scene.fog = new THREE.FogExp2(0x000000, fogDensity);

    const camera = new THREE.PerspectiveCamera(isMobile ? 70 : 60, mainScene.clientWidth / mainScene.clientHeight, 0.1, 1000);

    // Configurar renderer según capacidades del dispositivo
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: performanceLevel !== 'low',
        powerPreference: isMobile ? "low-power" : "high-performance"
    });

    renderer.setSize(mainScene.clientWidth, mainScene.clientHeight);

    // Limitar pixel ratio para mejorar rendimiento
    const pixelRatio = Math.min(window.devicePixelRatio, performanceLevel === 'low' ? 1 : 2);
    renderer.setPixelRatio(pixelRatio);

    mainScene.appendChild(renderer.domElement);

    // Crear un grupo para todos los elementos
    const group = new THREE.Group();
    scene.add(group);

    // Ajustar complejidad de la geometría según rendimiento
    let planeSegments;
    switch(performanceLevel) {
        case 'low':
            planeSegments = 20; // Menos segmentos para dispositivos de bajo rendimiento
            break;
        case 'medium':
            planeSegments = 30;
            break;
        case 'high':
            planeSegments = 50;
            break;
        default:
            planeSegments = 30;
    }

    // Crear geometría para el fondo - una malla de ondas 3D
    const planeGeometry = new THREE.PlaneGeometry(40, 40, planeSegments, planeSegments);

    // Deformar la geometría para crear ondas
    const positionAttribute = planeGeometry.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);

        const x = vertex.x / 5;
        const y = vertex.y / 5;

        // Crear patrón de ondas - más simple en móviles
        const waveIntensity = isMobile ? 0.3 : 0.5;
        const wave1 = waveIntensity * Math.sin(x * 2 + y * 3);
        const wave2 = (waveIntensity * 0.4) * Math.cos(x * 3 + y * 2);

        positionAttribute.setZ(i, wave1 + wave2);
    }

    // Calcular normales para iluminación correcta
    planeGeometry.computeVertexNormals();

    // Crear material con efecto de gradiente - wireframe en dispositivos de bajo rendimiento
    const planeMaterial = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        wireframe: performanceLevel === 'low',
        side: THREE.DoubleSide,
        metalness: isMobile ? 0.2 : 0.3, // Menos metalness en móviles para mejor rendimiento
        roughness: isMobile ? 0.7 : 0.6,
        emissive: 0x2a0096,
        emissiveIntensity: isMobile ? 0.1 : 0.2 // Menos intensidad en móviles
    });

    // Crear malla
    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.rotation.x = -Math.PI / 2; // Rotar para que sea horizontal
    planeMesh.position.y = -5; // Posicionar debajo
    group.add(planeMesh);

    // Ajustar número de esferas según rendimiento
    let sphereCount;
    let sphereDetail;

    switch(performanceLevel) {
        case 'low':
            sphereCount = 3; // Menos esferas para dispositivos de bajo rendimiento
            sphereDetail = 16; // Menos detalle en las esferas
            break;
        case 'medium':
            sphereCount = 6;
            sphereDetail = 24;
            break;
        case 'high':
            sphereCount = 10;
            sphereDetail = 32;
            break;
        default:
            sphereCount = 6;
            sphereDetail = 24;
    }

    // Añadir esferas flotantes
    const sphereGeometry = new THREE.SphereGeometry(1, sphereDetail, sphereDetail);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0xf472b6,
        metalness: isMobile ? 0.5 : 0.7,
        roughness: isMobile ? 0.3 : 0.2,
        emissive: 0x500050,
        emissiveIntensity: isMobile ? 0.1 : 0.2
    });

    // Crear varias esferas en posiciones aleatorias
    const spheres = [];
    for (let i = 0; i < sphereCount; i++) {
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

        // Posicionar esferas más cerca del centro en móviles
        const positionRange = isMobile ? 15 : 20;
        sphere.position.x = (Math.random() - 0.5) * positionRange;
        sphere.position.y = (Math.random() - 0.5) * (isMobile ? 8 : 10) + 2;
        sphere.position.z = (Math.random() - 0.5) * positionRange;

        // Esferas más grandes en móviles para mejor visibilidad
        const minScale = isMobile ? 0.15 : 0.1;
        const maxScale = isMobile ? 0.6 : 0.5;
        sphere.scale.setScalar(Math.random() * (maxScale - minScale) + minScale);

        // Guardar velocidad de rotación para animación - más lenta en móviles
        const speedFactor = isMobile ? 0.5 : 1;
        sphere.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.01 * speedFactor,
                y: (Math.random() - 0.5) * 0.01 * speedFactor,
                z: (Math.random() - 0.5) * 0.01 * speedFactor
            },
            floatSpeed: (Math.random() * 0.005 + 0.002) * speedFactor,
            floatOffset: Math.random() * Math.PI * 2
        };

        group.add(sphere);
        spheres.push(sphere);
    }

    // Añadir luces - menos luces en móviles
    const ambientLight = new THREE.AmbientLight(0xffffff, isMobile ? 0.6 : 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 2, 3);
    scene.add(directionalLight);

    // Añadir luces puntuales solo en dispositivos de rendimiento medio y alto
    if (performanceLevel !== 'low') {
        const pointLight1 = new THREE.PointLight(0x6366f1, isMobile ? 1.5 : 2, 20);
        pointLight1.position.set(5, 5, 5);
        scene.add(pointLight1);

        if (performanceLevel === 'high') {
            const pointLight2 = new THREE.PointLight(0xf472b6, 2, 20);
            pointLight2.position.set(-5, 3, -5);
            scene.add(pointLight2);
        }
    }

    // Posicionar cámara - más cerca en móviles para mejor visibilidad
    camera.position.set(0, isMobile ? 1 : 2, isMobile ? 8 : 10);
    camera.lookAt(0, 0, 0);

    // Variables para controlar la animación
    let animationFrameId;
    let lastTime = 0;
    const targetFPS = performanceLevel === 'low' ? 30 : 60;
    const frameInterval = 1000 / targetFPS;

    // Función de animación optimizada
    function animate(currentTime) {
        animationFrameId = requestAnimationFrame(animate);

        // Limitar FPS para mejorar rendimiento
        const deltaTime = currentTime - lastTime;
        if (deltaTime < frameInterval) return;

        // Ajustar para mantener velocidad consistente independiente del FPS
        const timeMultiplier = deltaTime / (1000 / 60);

        // Actualizar tiempo para siguiente frame
        lastTime = currentTime - (deltaTime % frameInterval);

        // Rotar todo el grupo lentamente - más lento en móviles
        const rotationSpeed = isMobile ? 0.001 : 0.002;
        group.rotation.y += rotationSpeed * timeMultiplier;

        // Animar ondas del plano solo si no es dispositivo de bajo rendimiento
        if (performanceLevel !== 'low') {
            const time = Date.now() * 0.001;

            // Animar solo una fracción de los vértices en cada frame para móviles
            const vertexUpdateStep = isMobile ? 3 : 1;

            for (let i = 0; i < positionAttribute.count; i += vertexUpdateStep) {
                vertex.fromBufferAttribute(positionAttribute, i);

                const x = vertex.x / 5;
                const y = vertex.y / 5;

                // Ondas animadas - más simples y lentas en móviles
                const waveSpeed = isMobile ? 0.7 : 1;
                const waveIntensity = isMobile ? 0.3 : 0.5;

                const wave1 = waveIntensity * Math.sin(x * 2 + y * 3 + time * waveSpeed);
                const wave2 = (waveIntensity * 0.4) * Math.cos(x * 3 + y * 2 + time * 0.5 * waveSpeed);

                positionAttribute.setZ(i, wave1 + wave2);
            }

            positionAttribute.needsUpdate = true;
        }

        // Animar esferas
        spheres.forEach(sphere => {
            // Rotación
            sphere.rotation.x += sphere.userData.rotationSpeed.x * timeMultiplier;
            sphere.rotation.y += sphere.userData.rotationSpeed.y * timeMultiplier;
            sphere.rotation.z += sphere.userData.rotationSpeed.z * timeMultiplier;

            // Flotación - solo si no es dispositivo de bajo rendimiento
            if (performanceLevel !== 'low') {
                const time = Date.now() * 0.001;
                sphere.position.y += Math.sin(time + sphere.userData.floatOffset) * sphere.userData.floatSpeed * timeMultiplier;
            }
        });

        // Interactividad con el mouse/touch - reducida en móviles
        const interactionFactorX = isMobile ? 0.0002 : 0.0005;
        const interactionFactorY = isMobile ? 0.0001 : 0.0003;

        group.rotation.y += mouseX * interactionFactorX * timeMultiplier;
        group.rotation.x += mouseY * interactionFactorY * timeMultiplier;

        renderer.render(scene, camera);
    }

    // Función para manejar visibilidad de la página
    function handleVisibilityChange() {
        if (document.hidden) {
            // Pausar animación cuando la página no es visible
            cancelAnimationFrame(animationFrameId);
        } else {
            // Reiniciar animación cuando la página es visible
            lastTime = performance.now();
            animate(lastTime);
        }
    }

    // Manejar redimensionamiento
    const handleResize = () => {
        if (mainScene.clientWidth > 0 && mainScene.clientHeight > 0) {
            camera.aspect = mainScene.clientWidth / mainScene.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mainScene.clientWidth, mainScene.clientHeight);

            // Actualizar pixel ratio según rendimiento
            const pixelRatio = Math.min(window.devicePixelRatio, performanceLevel === 'low' ? 1 : 2);
            renderer.setPixelRatio(pixelRatio);
        }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Iniciar animación
    lastTime = performance.now();
    animate(lastTime);

    // Retornar función de limpieza para evitar memory leaks
    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);

        // Liberar memoria
        planeGeometry.dispose();
        planeMaterial.dispose();
        sphereGeometry.dispose();
        sphereMaterial.dispose();
        renderer.dispose();
    };
}

// Función para crear un fondo de ondas 3D para toda la página
function initBackgroundWaves() {
    // No inicializar en dispositivos de bajo rendimiento
    if (performanceLevel === 'low') return;

    // Crear un contenedor para el fondo
    const backgroundContainer = document.createElement('div');
    backgroundContainer.style.position = 'fixed';
    backgroundContainer.style.top = '0';
    backgroundContainer.style.left = '0';
    backgroundContainer.style.width = '100%';
    backgroundContainer.style.height = '100%';
    backgroundContainer.style.zIndex = '-100';

    // Menor opacidad en móviles para mejorar rendimiento y legibilidad
    backgroundContainer.style.opacity = isMobile ? '0.2' : '0.4';
    backgroundContainer.id = 'background-waves';
    document.body.appendChild(backgroundContainer);

    // Crear escena, cámara y renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Configurar renderer según capacidades del dispositivo
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMobile, // Desactivar antialiasing en móviles
        powerPreference: isMobile ? "low-power" : "high-performance"
    });

    renderer.setSize(window.innerWidth, window.innerHeight);

    // Limitar pixel ratio para mejorar rendimiento
    const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1 : 2);
    renderer.setPixelRatio(pixelRatio);

    backgroundContainer.appendChild(renderer.domElement);

    // Ajustar complejidad de la geometría según rendimiento
    const segments = isMobile ? 20 : 50;

    // Crear geometría para las ondas
    const geometry = new THREE.PlaneGeometry(60, 60, segments, segments);

    // Deformar la geometría para crear ondas
    const positionAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);

        const x = vertex.x / 10;
        const y = vertex.y / 10;

        // Crear patrón de ondas suaves - más simple en móviles
        const waveIntensity = isMobile ? 0.5 : 0.8;
        const wave = waveIntensity * Math.sin(x * 2) * Math.sin(y * 2);

        positionAttribute.setZ(i, wave);
    }

    // Calcular normales para iluminación correcta
    geometry.computeVertexNormals();

    // Crear material con gradiente - más simple en móviles
    const material = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: isMobile ? 0.2 : 0.3,
        side: THREE.DoubleSide
    });

    // Crear malla
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 4; // Rotar para mejor visibilidad
    mesh.position.z = -10; // Alejar de la cámara
    scene.add(mesh);

    // Añadir luces solo si no es móvil (para mejorar rendimiento)
    if (!isMobile) {
        // Añadir luz ambiental
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Añadir luz direccional
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 1, 1);
        scene.add(directionalLight);
    }

    // Posicionar cámara
    camera.position.z = 15;

    // Variables para controlar la animación
    let animationFrameId;
    let lastTime = 0;
    const targetFPS = isMobile ? 30 : 60; // Limitar FPS en móviles
    const frameInterval = 1000 / targetFPS;

    // Función de animación optimizada
    function animate(currentTime) {
        animationFrameId = requestAnimationFrame(animate);

        // Limitar FPS para mejorar rendimiento
        const deltaTime = currentTime - lastTime;
        if (deltaTime < frameInterval) return;

        // Ajustar para mantener velocidad consistente independiente del FPS
        const timeMultiplier = deltaTime / (1000 / 60);

        // Actualizar tiempo para siguiente frame
        lastTime = currentTime - (deltaTime % frameInterval);

        // Animar ondas - menos frecuente en móviles
        const time = Date.now() * 0.0005;

        // En móviles, actualizar solo cada ciertos frames para mejorar rendimiento
        const updateWaves = !isMobile || Math.floor(time * 10) % 3 === 0;

        if (updateWaves) {
            // Animar solo una fracción de los vértices en cada frame para móviles
            const vertexUpdateStep = isMobile ? 4 : 1;

            for (let i = 0; i < positionAttribute.count; i += vertexUpdateStep) {
                vertex.fromBufferAttribute(positionAttribute, i);

                const x = vertex.x / 10;
                const y = vertex.y / 10;

                // Ondas animadas - más lentas en móviles
                const waveSpeed = isMobile ? 0.5 : 1;
                const waveIntensity = isMobile ? 0.5 : 0.8;
                const wave = waveIntensity * Math.sin(x * 2 + time * waveSpeed) * Math.sin(y * 2 + time * waveSpeed);

                positionAttribute.setZ(i, wave);
            }

            positionAttribute.needsUpdate = true;
        }

        // Rotación suave - más lenta en móviles
        const rotationSpeed = isMobile ? 0.1 : 0.2;
        mesh.rotation.z = Math.sin(time) * rotationSpeed;

        // Interactividad con el mouse/touch - reducida en móviles
        const interactionFactor = isMobile ? 0.0005 : 0.001;
        mesh.rotation.x = Math.PI / 4 + mouseY * interactionFactor;
        mesh.rotation.y = mouseX * interactionFactor;

        renderer.render(scene, camera);
    }

    // Función para manejar visibilidad de la página
    function handleVisibilityChange() {
        if (document.hidden) {
            // Pausar animación cuando la página no es visible
            cancelAnimationFrame(animationFrameId);
        } else {
            // Reiniciar animación cuando la página es visible
            lastTime = performance.now();
            animate(lastTime);
        }
    }

    // Manejar redimensionamiento
    const handleResize = () => {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Actualizar pixel ratio según rendimiento
        const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1 : 2);
        renderer.setPixelRatio(pixelRatio);
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Iniciar animación
    lastTime = performance.now();
    animate(lastTime);

    // Retornar función de limpieza para evitar memory leaks
    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);

        // Liberar memoria
        geometry.dispose();
        material.dispose();
        renderer.dispose();
    };
}

// Función para inicializar las previsualizaciones de categorías
function initCategoryPreviews() {
    const categoryPreviews = document.querySelectorAll('.category-preview');

    categoryPreviews.forEach(preview => {
        const category = preview.getAttribute('data-category');

        // Crear escena, cámara y renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, preview.clientWidth / preview.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });

        renderer.setSize(preview.clientWidth, preview.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        preview.appendChild(renderer.domElement);

        // Grupo para contener todos los elementos
        const group = new THREE.Group();
        scene.add(group);

        // Configuración específica según la categoría
        let mainObject;

        switch(category) {
            case 'ilustraciones':
                // Crear un sistema de partículas para ilustraciones
                const particlesGeometry = new THREE.BufferGeometry();
                const particlesCount = 100;

                const posArray = new Float32Array(particlesCount * 3);
                const colorsArray = new Float32Array(particlesCount * 3);

                const color1 = new THREE.Color(0x6366f1); // Indigo
                const color2 = new THREE.Color(0x818cf8); // Indigo más claro

                for (let i = 0; i < particlesCount; i++) {
                    // Crear forma de pincel/lápiz
                    const angle = (i / particlesCount) * Math.PI * 2;
                    const radius = 0.8 + Math.random() * 0.3;

                    const i3 = i * 3;
                    posArray[i3] = Math.cos(angle) * radius;
                    posArray[i3 + 1] = Math.sin(angle) * radius;
                    posArray[i3 + 2] = (Math.random() - 0.5) * 0.5;

                    // Colores
                    const mixedColor = color1.clone().lerp(color2, Math.random());
                    colorsArray[i3] = mixedColor.r;
                    colorsArray[i3 + 1] = mixedColor.g;
                    colorsArray[i3 + 2] = mixedColor.b;
                }

                particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
                particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

                const particlesMaterial = new THREE.PointsMaterial({
                    size: 0.1,
                    vertexColors: true,
                    transparent: true,
                    opacity: 0.8,
                    sizeAttenuation: true
                });

                mainObject = new THREE.Points(particlesGeometry, particlesMaterial);

                // Añadir un "lienzo" detrás
                const canvasGeometry = new THREE.PlaneGeometry(2, 2);
                const canvasMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.7,
                    metalness: 0.1
                });
                const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
                canvas.position.z = -0.5;
                group.add(canvas);

                break;

            case 'animaciones':
                // Crear una animación de "rebote" con esferas
                const spheres = [];
                const sphereColors = [0xf472b6, 0xec4899, 0xdb2777, 0xbe185d];

                for (let i = 0; i < 5; i++) {
                    const size = 0.2 + Math.random() * 0.3;
                    const sphereGeometry = new THREE.SphereGeometry(size, 32, 32);
                    const sphereMaterial = new THREE.MeshStandardMaterial({
                        color: sphereColors[i % sphereColors.length],
                        roughness: 0.2,
                        metalness: 0.8,
                        emissive: 0x500050,
                        emissiveIntensity: 0.2
                    });

                    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                    sphere.position.x = (Math.random() - 0.5) * 1.5;
                    sphere.position.y = (Math.random() - 0.5) * 1.5;
                    sphere.position.z = (Math.random() - 0.5) * 1.5;

                    // Datos para animación
                    sphere.userData = {
                        velocity: {
                            x: (Math.random() - 0.5) * 0.03,
                            y: (Math.random() - 0.5) * 0.03,
                            z: (Math.random() - 0.5) * 0.03
                        },
                        rotationSpeed: {
                            x: (Math.random() - 0.5) * 0.04,
                            y: (Math.random() - 0.5) * 0.04,
                            z: (Math.random() - 0.5) * 0.04
                        }
                    };

                    group.add(sphere);
                    spheres.push(sphere);
                }

                // Guardar referencia para animación
                mainObject = { type: 'spheres', objects: spheres };

                break;

            case 'stickers':
                // Crear un sticker 3D con capas
                const baseGeometry = new THREE.CircleGeometry(1, 32);
                const baseMaterial = new THREE.MeshStandardMaterial({
                    color: 0x10b981,
                    roughness: 0.3,
                    metalness: 0.2,
                    side: THREE.DoubleSide
                });

                const baseSticker = new THREE.Mesh(baseGeometry, baseMaterial);
                group.add(baseSticker);

                // Añadir borde
                const borderGeometry = new THREE.RingGeometry(0.95, 1.05, 32);
                const borderMaterial = new THREE.MeshStandardMaterial({
                    color: 0x059669,
                    roughness: 0.5,
                    metalness: 0.3,
                    side: THREE.DoubleSide
                });

                const border = new THREE.Mesh(borderGeometry, borderMaterial);
                border.position.z = 0.01;
                group.add(border);

                // Añadir detalles
                const detailGeometry = new THREE.TorusGeometry(0.6, 0.1, 16, 32);
                const detailMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.2,
                    metalness: 0.5,
                    transparent: true,
                    opacity: 0.8
                });

                const detail = new THREE.Mesh(detailGeometry, detailMaterial);
                detail.position.z = 0.05;
                detail.rotation.x = Math.PI / 2;
                group.add(detail);

                mainObject = group;

                break;

            case 'bocetos':
                // Crear un efecto de "dibujo a lápiz"
                const linesGeometry = new THREE.BufferGeometry();
                const linesCount = 30;
                const linesPositions = [];

                // Crear líneas aleatorias que parecen trazos de lápiz
                for (let i = 0; i < linesCount; i++) {
                    const startX = (Math.random() - 0.5) * 2;
                    const startY = (Math.random() - 0.5) * 2;
                    const startZ = (Math.random() - 0.5) * 0.1;

                    const length = Math.random() * 1 + 0.5;
                    const angle = Math.random() * Math.PI * 2;

                    const endX = startX + Math.cos(angle) * length * 0.5;
                    const endY = startY + Math.sin(angle) * length * 0.5;
                    const endZ = startZ;

                    // Añadir puntos para crear la línea
                    linesPositions.push(startX, startY, startZ);
                    linesPositions.push(endX, endY, endZ);
                }

                linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linesPositions, 3));

                const linesMaterial = new THREE.LineBasicMaterial({
                    color: 0xfbbf24,
                    opacity: 0.7,
                    transparent: true,
                    linewidth: 1
                });

                const lines = new THREE.LineSegments(linesGeometry, linesMaterial);
                group.add(lines);

                // Añadir un "papel" detrás
                const paperGeometry = new THREE.PlaneGeometry(2.2, 2.2);
                const paperMaterial = new THREE.MeshStandardMaterial({
                    color: 0xf5f5f4,
                    roughness: 0.9,
                    metalness: 0.1
                });
                const paper = new THREE.Mesh(paperGeometry, paperMaterial);
                paper.position.z = -0.1;
                group.add(paper);

                mainObject = lines;

                break;

            default:
                // Objeto por defecto
                const geometry = new THREE.SphereGeometry(1, 32, 32);
                const material = new THREE.MeshStandardMaterial({
                    color: 0x6366f1,
                    roughness: 0.4,
                    metalness: 0.6
                });

                mainObject = new THREE.Mesh(geometry, material);
                group.add(mainObject);
        }

        // Añadir luces
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 2);
        scene.add(directionalLight);

        // Posicionar cámara
        camera.position.z = 2.5;

        // Función de animación
        function animate() {
            requestAnimationFrame(animate);

            const time = Date.now() * 0.001;

            // Animaciones específicas según la categoría
            if (category === 'ilustraciones') {
                mainObject.rotation.z += 0.005;

                // Efecto de "respiración"
                mainObject.scale.x = 1 + Math.sin(time) * 0.1;
                mainObject.scale.y = 1 + Math.sin(time) * 0.1;
            }
            else if (category === 'animaciones') {
                // Animar esferas con física simple
                mainObject.objects.forEach(sphere => {
                    // Mover según velocidad
                    sphere.position.x += sphere.userData.velocity.x;
                    sphere.position.y += sphere.userData.velocity.y;
                    sphere.position.z += sphere.userData.velocity.z;

                    // Rotar
                    sphere.rotation.x += sphere.userData.rotationSpeed.x;
                    sphere.rotation.y += sphere.userData.rotationSpeed.y;
                    sphere.rotation.z += sphere.userData.rotationSpeed.z;

                    // Rebotar en los bordes
                    if (Math.abs(sphere.position.x) > 1.2) {
                        sphere.userData.velocity.x *= -1;
                    }
                    if (Math.abs(sphere.position.y) > 1.2) {
                        sphere.userData.velocity.y *= -1;
                    }
                    if (Math.abs(sphere.position.z) > 1.2) {
                        sphere.userData.velocity.z *= -1;
                    }
                });
            }
            else if (category === 'stickers') {
                // Rotación suave
                group.rotation.y += 0.01;

                // Efecto de "flotación"
                group.position.y = Math.sin(time) * 0.1;

                // Efecto de "brillo"
                const scale = 1 + Math.sin(time * 2) * 0.05;
                group.scale.set(scale, scale, scale);
            }
            else if (category === 'bocetos') {
                // Rotación suave
                group.rotation.z = Math.sin(time * 0.5) * 0.1;

                // Efecto de "dibujo en progreso"
                const linesMaterial = mainObject.material;
                linesMaterial.opacity = 0.5 + Math.sin(time * 2) * 0.3;
            }
            else {
                // Animación por defecto
                group.rotation.x += 0.01;
                group.rotation.y += 0.01;
            }

            renderer.render(scene, camera);
        }

        // Manejar redimensionamiento
        const handleResize = () => {
            if (preview.clientWidth > 0 && preview.clientHeight > 0) {
                camera.aspect = preview.clientWidth / preview.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(preview.clientWidth, preview.clientHeight);
            }
        };

        window.addEventListener('resize', handleResize);

        // Iniciar animación
        animate();

        // Añadir interactividad al hover
        preview.addEventListener('mouseenter', () => {
            if (category === 'ilustraciones') {
                // Acelerar rotación
                mainObject.rotation.z += 0.5;
            }
            else if (category === 'stickers') {
                // Acercar
                group.position.z += 0.3;
            }
            else if (category === 'bocetos') {
                // Mostrar más líneas
                mainObject.material.opacity = 1;
            }
        });

        preview.addEventListener('mouseleave', () => {
            if (category === 'stickers') {
                // Volver a posición original
                group.position.z -= 0.3;
            }
        });
    });
}
