/**
 * Script para el menú hamburguesa
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elementos del menú
    const menuButton = document.getElementById('menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenu = document.getElementById('close-menu');
    
    if (!menuButton || !mobileMenu || !closeMenu) return;
    
    // Abrir menú
    menuButton.addEventListener('click', () => {
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');
        document.body.classList.add('overflow-hidden'); // Prevenir scroll
    });
    
    // Cerrar menú
    closeMenu.addEventListener('click', () => {
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
        document.body.classList.remove('overflow-hidden');
    });
    
    // Cerrar menú al hacer clic en un enlace
    const navLinks = mobileMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('translate-x-0');
            mobileMenu.classList.add('translate-x-full');
            document.body.classList.remove('overflow-hidden');
        });
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (event) => {
        if (
            !mobileMenu.contains(event.target) && 
            !menuButton.contains(event.target) &&
            !mobileMenu.classList.contains('translate-x-full')
        ) {
            mobileMenu.classList.remove('translate-x-0');
            mobileMenu.classList.add('translate-x-full');
            document.body.classList.remove('overflow-hidden');
        }
    });
});
