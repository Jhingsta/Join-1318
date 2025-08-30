function getCurrentUser() {
  const userJson = localStorage.getItem("currentUser");
  return userJson ? JSON.parse(userJson) : null;
}

function isGuest() {
  const user = getCurrentUser();
  return user?.name === "Guest";
}

// Navigation Active Status - Für w3.includeHTML() angepasst
function setActiveNavigation() {
  // Aktuelle Seite ermitteln (mit ./ Präfix berücksichtigen)
  const currentPage = window.location.pathname.split('/').pop();
  const currentPageWithPrefix = './' + currentPage;
  
  // Nav-Items verarbeiten
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(link => {
      link.classList.remove('active');
      
      const href = link.getAttribute('href');
      // Prüfe sowohl mit als auch ohne ./ Präfix
      if (href === currentPage || href === currentPageWithPrefix) {
          link.classList.add('active');
      }
  });
  
  // Footer-Items verarbeiten
  const footerItems = document.querySelectorAll('.footer-item');
  footerItems.forEach(link => {
      link.classList.remove('footer-active');
      
      const href = link.getAttribute('href');
      // Prüfe sowohl mit als auch ohne ./ Präfix
      if (href === currentPage || href === currentPageWithPrefix) {
          link.classList.add('footer-active');
      }
  });
}

// Falls andere Teile der App diese Funktionen erwarten, 
// stelle leere Dummy-Funktionen zur Verfügung um Fehler zu vermeiden
window.authSystem = {
    updateVisibility: function() { 
        console.log("updateVisibility wurde entfernt - keine User/Guest-Logik mehr nötig"); 
    },
    logUserStatus: function() { 
        console.log("logUserStatus wurde entfernt - keine User/Guest-Logik mehr nötig"); 
    },
    isGuest: function() { 
        console.log("isGuest wurde entfernt - keine User/Guest-Logik mehr nötig"); 
        return false; 
    },
    getCurrentUser: function() { 
        console.log("getCurrentUser wurde entfernt - keine User/Guest-Logik mehr nötig"); 
        return null; 
    }
};