function toggleDropdown() {
    const dropdownMenu = document.getElementById('header-dropdown-menu');
    const isOpen = dropdownMenu.classList.contains('show');
    
    if (isOpen) {
        dropdownMenu.classList.remove('show');
        // Update ARIA attributes
        document.querySelector('[aria-expanded]').setAttribute('aria-expanded', 'false');
    } else {
        dropdownMenu.classList.add('show');
        // Update ARIA attributes
        document.querySelector('[aria-expanded]').setAttribute('aria-expanded', 'true');
    }
}