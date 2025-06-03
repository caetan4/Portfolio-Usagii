// Manejo del carrusel de dibujos guardados con botones e indicador de páginas
document.addEventListener('DOMContentLoaded', () => {
    initDrawingCarousel();
});

function initDrawingCarousel() {
    const carousel = document.getElementById('drawing-carousel');
    if (!carousel) return;

    // Crear contenedor para controles
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'flex justify-center items-center space-x-4 mt-2';

    // Botón retroceder
    const prevButton = document.createElement('button');
    prevButton.textContent = '◀';
    prevButton.className = 'px-3 py-1 bg-indigo-700 text-white rounded hover:bg-indigo-600 disabled:opacity-50';
    prevButton.disabled = true;

    // Botón avanzar
    const nextButton = document.createElement('button');
    nextButton.textContent = '▶';
    nextButton.className = 'px-3 py-1 bg-indigo-700 text-white rounded hover:bg-indigo-600 disabled:opacity-50';

    // Indicador de página
    const pageIndicator = document.createElement('span');
    pageIndicator.className = 'text-gray-700 font-semibold';

    controlsContainer.appendChild(prevButton);
    controlsContainer.appendChild(pageIndicator);
    controlsContainer.appendChild(nextButton);

    carousel.parentElement.appendChild(controlsContainer);

    // Cargar dibujos guardados desde localStorage
    let drawings = JSON.parse(localStorage.getItem('usagii-drawings-list') || '[]');

    // Si no hay dibujos, mostrar mensaje
    const noDrawingsMessage = document.getElementById('no-drawings');

    function renderCarouselPage(page) {
        carousel.innerHTML = '';
        if (drawings.length === 0) {
            if (noDrawingsMessage) noDrawingsMessage.style.display = 'flex';
            pageIndicator.textContent = '0 / 0';
            prevButton.disabled = true;
            nextButton.disabled = true;
            return;
        } else {
            if (noDrawingsMessage) noDrawingsMessage.style.display = 'none';
        }

        const itemsPerPage = 3;
        const totalPages = Math.ceil(drawings.length / itemsPerPage);
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, drawings.length);

        for (let i = startIndex; i < endIndex; i++) {
            const img = document.createElement('img');
            img.src = drawings[i];
            img.alt = `Dibujo guardado ${i + 1}`;
            img.className = 'w-48 h-32 object-contain rounded shadow cursor-pointer border border-gray-300 hover:border-indigo-600 transition';
            carousel.appendChild(img);
        }

        pageIndicator.textContent = `${page} / ${totalPages}`;
        prevButton.disabled = page === 1;
        nextButton.disabled = page === totalPages;

        currentPage = page;
    }

    // Estado actual de página
    let currentPage = 1;
    renderCarouselPage(currentPage);

    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            renderCarouselPage(currentPage - 1);
        }
    });

    nextButton.addEventListener('click', () => {
        const totalPages = Math.ceil(drawings.length / 3);
        if (currentPage < totalPages) {
            renderCarouselPage(currentPage + 1);
        }
    });

    // Escuchar cambios en localStorage para actualizar la lista de dibujos
    window.addEventListener('storage', (e) => {
        if (e.key === 'usagii-drawings-list') {
            drawings = JSON.parse(e.newValue || '[]');
            renderCarouselPage(currentPage);
        }
    });
}
