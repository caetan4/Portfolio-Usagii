// Algoritmo de organización de grillas para imágenes
// Detecta la orientación de las imágenes y las organiza de forma inteligente

class GridOrganizer {
    constructor(gridContainerId, options = {}) {
        // Opciones por defecto
        this.options = {
            gap: 16,                // Espacio entre imágenes en píxeles
            minItemWidth: 250,      // Ancho mínimo de cada elemento en píxeles
            maxItemWidth: 400,      // Ancho máximo de cada elemento en píxeles
            targetRowHeight: 300,   // Altura objetivo para cada fila en píxeles
            itemSelector: '.grid-item', // Selector para los elementos de la grilla
            ...options
        };
        
        this.gridContainer = document.getElementById(gridContainerId);
        if (!this.gridContainer) {
            console.error(`No se encontró el contenedor con ID: ${gridContainerId}`);
            return;
        }
        
        this.items = [];
        this.containerWidth = 0;
        
        // Inicializar
        this.init();
    }
    
    // Inicializar el organizador de grilla
    init() {
        // Obtener elementos de la grilla
        const itemElements = this.gridContainer.querySelectorAll(this.options.itemSelector);
        
        // Convertir NodeList a Array y almacenar información de cada elemento
        this.items = Array.from(itemElements).map(el => {
            // Obtener dimensiones de la imagen si existe
            const img = el.querySelector('img');
            let width = 1;
            let height = 1;
            let aspectRatio = 1;
            let orientation = 'square';
            
            if (img) {
                // Si la imagen ya está cargada
                if (img.complete && img.naturalWidth > 0) {
                    width = img.naturalWidth;
                    height = img.naturalHeight;
                } else {
                    // Si la imagen no está cargada, usar valores por defecto
                    // y actualizar cuando se cargue
                    img.addEventListener('load', () => {
                        this.updateItemDimensions(el, img);
                        this.organizeGrid();
                    });
                }
            }
            
            // Calcular relación de aspecto y orientación
            aspectRatio = width / height;
            
            if (aspectRatio > 1.2) {
                orientation = 'landscape';
            } else if (aspectRatio < 0.8) {
                orientation = 'portrait';
            } else {
                orientation = 'square';
            }
            
            return {
                element: el,
                width,
                height,
                aspectRatio,
                orientation,
                computedWidth: 0,
                computedHeight: 0
            };
        });
        
        // Actualizar ancho del contenedor
        this.updateContainerWidth();
        
        // Organizar la grilla inicialmente
        this.organizeGrid();
        
        // Escuchar cambios de tamaño de ventana
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Observar cambios en el DOM para reorganizar si es necesario
        this.setupMutationObserver();
    }
    
    // Actualizar dimensiones de un elemento cuando se carga su imagen
    updateItemDimensions(element, img) {
        const item = this.items.find(item => item.element === element);
        if (item) {
            item.width = img.naturalWidth;
            item.height = img.naturalHeight;
            item.aspectRatio = item.width / item.height;
            
            if (item.aspectRatio > 1.2) {
                item.orientation = 'landscape';
            } else if (item.aspectRatio < 0.8) {
                item.orientation = 'portrait';
            } else {
                item.orientation = 'square';
            }
        }
    }
    
    // Actualizar ancho del contenedor
    updateContainerWidth() {
        this.containerWidth = this.gridContainer.clientWidth;
    }
    
    // Manejar cambio de tamaño de ventana
    handleResize() {
        this.updateContainerWidth();
        this.organizeGrid();
    }
    
    // Configurar observador de mutaciones para detectar cambios en el DOM
    setupMutationObserver() {
        const observer = new MutationObserver(mutations => {
            let shouldReorganize = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && 
                    (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
                    shouldReorganize = true;
                }
            });
            
            if (shouldReorganize) {
                // Actualizar lista de elementos
                const itemElements = this.gridContainer.querySelectorAll(this.options.itemSelector);
                this.items = Array.from(itemElements).map(el => {
                    // Buscar si el elemento ya existe en la lista
                    const existingItem = this.items.find(item => item.element === el);
                    if (existingItem) {
                        return existingItem;
                    }
                    
                    // Si es un nuevo elemento, crear su información
                    const img = el.querySelector('img');
                    let width = 1;
                    let height = 1;
                    let aspectRatio = 1;
                    let orientation = 'square';
                    
                    if (img && img.complete && img.naturalWidth > 0) {
                        width = img.naturalWidth;
                        height = img.naturalHeight;
                        aspectRatio = width / height;
                        
                        if (aspectRatio > 1.2) {
                            orientation = 'landscape';
                        } else if (aspectRatio < 0.8) {
                            orientation = 'portrait';
                        } else {
                            orientation = 'square';
                        }
                    }
                    
                    return {
                        element: el,
                        width,
                        height,
                        aspectRatio,
                        orientation,
                        computedWidth: 0,
                        computedHeight: 0
                    };
                });
                
                this.organizeGrid();
            }
        });
        
        observer.observe(this.gridContainer, { childList: true, subtree: true });
    }
    
    // Organizar la grilla
    organizeGrid() {
        if (this.items.length === 0) return;
        
        // Limpiar estilos previos
        this.items.forEach(item => {
            item.element.style.width = '';
            item.element.style.height = '';
            item.element.style.marginBottom = `${this.options.gap}px`;
        });
        
        // Organizar en filas
        const rows = this.calculateRows();
        
        // Aplicar dimensiones calculadas
        rows.forEach(row => {
            row.items.forEach(item => {
                item.element.style.width = `${item.computedWidth}px`;
                item.element.style.height = `${item.computedHeight}px`;
            });
        });
    }
    
    // Calcular filas para la grilla
    calculateRows() {
        const rows = [];
        let currentRow = { items: [], width: 0, height: this.options.targetRowHeight };
        
        // Ordenar elementos por orientación para mejorar la distribución
        // Primero los horizontales, luego los cuadrados, finalmente los verticales
        const sortedItems = [...this.items].sort((a, b) => {
            const orientationOrder = { landscape: 0, square: 1, portrait: 2 };
            return orientationOrder[a.orientation] - orientationOrder[b.orientation];
        });
        
        sortedItems.forEach(item => {
            // Calcular ancho proporcional basado en la altura objetivo
            const scaleFactor = this.options.targetRowHeight / item.height;
            const itemWidth = Math.max(
                Math.min(item.width * scaleFactor, this.options.maxItemWidth),
                this.options.minItemWidth
            );
            
            // Si añadir este elemento excede el ancho del contenedor, crear nueva fila
            if (currentRow.width + itemWidth > this.containerWidth && currentRow.items.length > 0) {
                // Ajustar ancho de elementos en la fila actual para llenar el contenedor
                this.adjustRowItems(currentRow);
                rows.push(currentRow);
                currentRow = { items: [], width: 0, height: this.options.targetRowHeight };
            }
            
            // Añadir elemento a la fila actual
            item.computedWidth = itemWidth;
            item.computedHeight = this.options.targetRowHeight;
            currentRow.items.push(item);
            currentRow.width += itemWidth + this.options.gap;
        });
        
        // Procesar última fila
        if (currentRow.items.length > 0) {
            // No ajustar la última fila para mantener la altura consistente
            currentRow.items.forEach(item => {
                item.computedHeight = this.options.targetRowHeight;
            });
            rows.push(currentRow);
        }
        
        return rows;
    }
    
    // Ajustar elementos de una fila para llenar el contenedor
    adjustRowItems(row) {
        const rowWidthWithoutGap = row.width - (this.options.gap * (row.items.length - 1));
        const scale = (this.containerWidth - (this.options.gap * (row.items.length - 1))) / rowWidthWithoutGap;
        
        row.items.forEach(item => {
            item.computedWidth = item.computedWidth * scale;
            item.computedHeight = row.height;
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Buscar todas las grillas en la página
    const galleryGrid = document.getElementById('gallery-grid');
    if (galleryGrid) {
        // Añadir clase grid-item a todos los elementos hijos directos
        Array.from(galleryGrid.children).forEach(child => {
            child.classList.add('grid-item');
        });
        
        // Inicializar organizador de grilla
        const gridOrganizer = new GridOrganizer('gallery-grid', {
            gap: 16,
            minItemWidth: 200,
            targetRowHeight: 250
        });
    }
});
