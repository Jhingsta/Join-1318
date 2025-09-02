function getCurrentUser() {
  const userJson = localStorage.getItem("currentUser");
  return userJson ? JSON.parse(userJson) : null;
}

function isGuest() {
  const user = getCurrentUser();
  return user?.name === "Guest";
}

// Navigation Active Status - Verbessert für beide Sidebar-Versionen
function setActiveNavigation() {
    // Aktuelle Seite ermitteln (nur der Dateiname ohne Parameter)
    const currentPage = window.location.pathname.split('/').pop();
    
    // Nav-Items verarbeiten
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(link => {
        link.classList.remove('active');
        
        const href = link.getAttribute('href');
        if (href) {
            // Parameter aus href entfernen und normalisieren
            const hrefPage = href.split('?')[0].replace('./', '');
            const normalizedCurrentPage = currentPage.replace('./', '');
            
            // Vergleichen
            if (hrefPage === normalizedCurrentPage) {
                link.classList.add('active');
            }
        }
    });
    
    // Footer-Items verarbeiten
    const footerItems = document.querySelectorAll('.footer-item');
    footerItems.forEach(link => {
        link.classList.remove('footer-active');
        
        const href = link.getAttribute('href');
        if (href) {
            // Parameter aus href entfernen und normalisieren
            const hrefPage = href.split('?')[0].replace('./', '');
            const normalizedCurrentPage = currentPage.replace('./', '');
            
            // Vergleichen
            if (hrefPage === normalizedCurrentPage) {
                link.classList.add('footer-active');
            }
        }
    });
}