// Canvas de dibujo interactivo para la página Home
document.addEventListener('DOMContentLoaded', () => {
    initDrawingCanvas();
});

function initDrawingCanvas() {
    const canvas = document.getElementById('drawing-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Estado del dibujo
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentColor = '#000000';
    let lineWidth = 5;
    let currentTool = 'pencil'; // pencil, eraser

    // Ajustar tamaño del canvas al contenedor
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = Math.max(container.clientHeight, 250);

        // Limpiar el canvas al redimensionar
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cargar dibujo guardado si existe
        const savedDrawing = localStorage.getItem('usagii-drawing');
        if (savedDrawing) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = savedDrawing;
        }
    }

    // Inicializar el canvas
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Configurar el contexto inicial
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = currentColor;

    // Funciones para dibujar
    function startDrawing(e) {
        isDrawing = true;

        // Obtener coordenadas correctas según el tipo de evento
        const coords = getCoordinates(e);

        [lastX, lastY] = [coords.x, coords.y];
    }

    function draw(e) {
        if (!isDrawing) return;

        // Prevenir scroll en dispositivos táctiles
        e.preventDefault();

        // Obtener coordenadas correctas según el tipo de evento
        const coords = getCoordinates(e);

        if (currentTool === 'pencil') {
            drawPencil(coords);
        } else if (currentTool === 'eraser') {
            erase(coords);
        }

        lastX = coords.x;
        lastY = coords.y;
    }

    function stopDrawing() {
        isDrawing = false;
    }

    // Funciones específicas para cada herramienta
    function drawPencil(coords) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = currentColor;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
    }

    function erase(coords) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = lineWidth * 2.5;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
    }

    // Obtener coordenadas según el tipo de evento (mouse o touch)
    function getCoordinates(e) {
        let x, y;

        if (e.type.includes('touch')) {
            // Evento táctil
            const rect = canvas.getBoundingClientRect();
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            // Evento de mouse
            const rect = canvas.getBoundingClientRect();
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }

        return { x, y };
    }

    // Event listeners para mouse
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Event listeners para dispositivos táctiles
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    // Función para actualizar la UI de las herramientas
    function updateToolUI(selectedTool) {
        // Resetear todas las herramientas
        const tools = ['pencil-tool', 'eraser-tool'];
        tools.forEach(toolId => {
            const toolElement = document.getElementById(toolId);
            if (toolElement) {
                toolElement.classList.remove('bg-indigo-500', 'ring-2', 'ring-white');
                toolElement.classList.add('bg-indigo-700');
            }
        });

        // Resaltar la herramienta seleccionada
        const selectedElement = document.getElementById(`${selectedTool}-tool`);
        if (selectedElement) {
            selectedElement.classList.remove('bg-indigo-700');
            selectedElement.classList.add('bg-indigo-500', 'ring-2', 'ring-white');
        }
    }

    // Configurar botones de herramientas

    // Lápiz
    const pencilTool = document.getElementById('pencil-tool');
    if (pencilTool) {
        pencilTool.addEventListener('click', () => {
            currentTool = 'pencil';
            updateToolUI('pencil');
        });
    }

    // Borrador
    const eraserTool = document.getElementById('eraser-tool');
    if (eraserTool) {
        eraserTool.addEventListener('click', () => {
            currentTool = 'eraser';
            updateToolUI('eraser');
        });
    }

    // Botones de colores
    const colorButtons = document.querySelectorAll('[data-color]');
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Actualizar color actual
            currentColor = button.dataset.color;
            ctx.strokeStyle = currentColor;

            // Actualizar UI
            colorButtons.forEach(btn => {
                btn.classList.remove('border-indigo-600', 'ring-2', 'ring-indigo-600');
                btn.classList.add('border-gray-300');
            });

            button.classList.remove('border-gray-300');
            button.classList.add('border-indigo-600', 'ring-2', 'ring-indigo-600');
        });
    });

    // Control de grosor
    const thicknessControl = document.getElementById('thickness-control');
    const thicknessValue = document.getElementById('thickness-value');
    if (thicknessControl && thicknessValue) {
        thicknessControl.addEventListener('input', () => {
            lineWidth = parseInt(thicknessControl.value);
            thicknessValue.textContent = lineWidth;
            ctx.lineWidth = lineWidth;
        });
    }

    // Botón para limpiar el canvas
    const clearButton = document.getElementById('clear-canvas');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres borrar todo el dibujo?')) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Feedback visual
                clearButton.classList.remove('bg-indigo-700');
                clearButton.classList.add('bg-red-600', 'ring-2', 'ring-white');

                setTimeout(() => {
                    clearButton.classList.remove('bg-red-600', 'ring-2', 'ring-white');
                    clearButton.classList.add('bg-indigo-700');
                }, 1000);
            }
        });
    }

    // Botón para guardar el dibujo
    const saveButton = document.getElementById('save-canvas');
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            try {
                // Crear un enlace temporal para descargar la imagen
                const link = document.createElement('a');
                link.download = 'mi-dibujo-usagii.png';
                link.href = canvas.toDataURL('image/png');
                link.click();

                // Feedback visual
                saveButton.classList.remove('bg-indigo-700');
                saveButton.classList.add('bg-green-600', 'ring-2', 'ring-white');

                setTimeout(() => {
                    saveButton.classList.remove('bg-green-600', 'ring-2', 'ring-white');
                    saveButton.classList.add('bg-indigo-700');
                }, 1000);
            } catch (e) {
                console.error('Error al guardar el dibujo:', e);
                alert('No se pudo guardar el dibujo. Intenta de nuevo.');
            }
        });
    }

    // Activar el lápiz por defecto
    if (pencilTool) {
        pencilTool.click();
    }

    // Seleccionar el primer color por defecto
    if (colorButtons.length > 0) {
        colorButtons[0].click();
    }
}
