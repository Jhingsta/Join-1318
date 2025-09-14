// Direkt beim Laden prüfen, ob ein User existiert, sonst zur Login-Seite weiterleiten
function enforceAuthentication() {
  const user = getCurrentUser();

  // Prüfen, ob URL-Parameter "from=visitor" gesetzt ist
  const urlParams = new URLSearchParams(window.location.search);
  const isVisitorMode = urlParams.get("from") === "visitor";

  // Wenn kein User vorhanden ist UND kein Visitor-Modus aktiv → Redirect
  if (!user && !isVisitorMode) {
    window.location.href = "/login.html";
  }
}

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

// Authentifizierung sofort prüfen, sobald das Script geladen wird
enforceAuthentication();