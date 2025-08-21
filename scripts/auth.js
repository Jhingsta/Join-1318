function getCurrentUser() {
  const userJson = localStorage.getItem("currentUser");
  return userJson ? JSON.parse(userJson) : null;
}

function isGuest() {
  const user = getCurrentUser();
  return user && user.name === "Guest";
}

// CSS-basierte Lösung: Klassen am Body setzen
function updateBodyClasses() {
  console.log("🎨 Aktualisiere Body-Klassen...");
  
  const body = document.body;
  
  // Entferne alte Klassen
  body.classList.remove('user-logged-in', 'guest-logged-in', 'special-page');
  
  // Setze Benutzer-Klassen
  if (isGuest()) {
    body.classList.add('guest-logged-in');
    console.log("👤 Body-Klasse gesetzt: guest-logged-in");
  } else {
    body.classList.add('user-logged-in');
    console.log("👤 Body-Klasse gesetzt: user-logged-in");
  }
  
  // Prüfe ob es eine spezielle Seite ist
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop();
  const specialPages = ["legalnotice.html", "privacy-policy.html"];
  
  if (specialPages.includes(currentPage)) {
    body.classList.add('special-page');
    console.log("🎯 Body-Klasse gesetzt: special-page");
  }
  
  console.log("📋 Aktuelle Body-Klassen:", body.className);
}

// Fallback: Direkte DOM-Manipulation (falls CSS nicht ausreicht)
function updateVisibilityDirect() {
  console.log("🔄 updateVisibilityDirect() wird ausgeführt...");
  
  // 1. Normale Header-Elemente mit data-show-when Attribut
  document.querySelectorAll("[data-show-when]").forEach((element) => {
    const condition = element.getAttribute("data-show-when");

    if (condition === "logged-in") {
      element.style.display = !isGuest() ? "" : "none";
    } else if (condition === "guest") {
      element.style.display = isGuest() ? "" : "none";
    }
  });

  // 2. Sidebar-Logik (Spezial) - Verbesserte Pfad-Erkennung
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop();
  
  console.log("📍 Aktuelle Seite:", currentPage);
  console.log("📍 Vollständiger Pfad:", currentPath);
  
  // Liste der Seiten, auf denen die Sidebar umgeschaltet werden soll
  const specialPages = ["legalnotice.html", "privacy-policy.html"];

  if (specialPages.includes(currentPage)) {
    console.log("🎯 Spezielle Seite erkannt, Sidebar wird angepasst...");
    
    // Debugging: Alle nav-items finden
    const allNavItems = document.querySelectorAll(".nav-item");
    console.log("🔍 Alle nav-items gefunden:", allNavItems.length);
    allNavItems.forEach((item, index) => {
      console.log(`  ${index + 1}. nav-item:`, item.className, item.textContent.trim());
    });
    
    // Suche alle Elemente mit den spezifischen Klassen
    const sidebarStandard = document.querySelectorAll(".nav-item.standard");
    const sidebarSpecial = document.querySelectorAll(".nav-item.special");
    
    console.log("📊 Standard-Elemente gefunden:", sidebarStandard.length);
    console.log("📊 Spezial-Elemente gefunden:", sidebarSpecial.length);
    
    // Debug: Zeige Details der gefundenen Elemente
    sidebarStandard.forEach((el, i) => {
      console.log(`  Standard ${i + 1}:`, el.textContent.trim(), el.className);
    });
    sidebarSpecial.forEach((el, i) => {
      console.log(`  Special ${i + 1}:`, el.textContent.trim(), el.className);
    });

    if (isGuest()) {
      console.log("👤 Gast-Modus: Verstecke Standard-Elemente, zeige Special-Elemente");
      sidebarStandard.forEach((element) => {
        element.style.display = "none";
        console.log("  ❌ Versteckt:", element.textContent.trim());
      });
      sidebarSpecial.forEach((element) => {
        element.style.display = "";
        console.log("  ✅ Sichtbar:", element.textContent.trim());
      });
    } else {
      console.log("👤 User-Modus: Zeige Standard-Elemente, verstecke Special-Elemente");
      sidebarStandard.forEach((element) => {
        element.style.display = "";
        console.log("  ✅ Sichtbar:", element.textContent.trim());
      });
      sidebarSpecial.forEach((element) => {
        element.style.display = "none";
        console.log("  ❌ Versteckt:", element.textContent.trim());
      });
    }
  } else {
    console.log("📄 Normale Seite - Standard-Sidebar-Behandlung");
    
    // Auf normalen Seiten: Immer alle Standard-Symbole sichtbar (egal ob Guest oder User)
    const allNavItems = document.querySelectorAll(".nav-item");
    console.log("🔍 Alle nav-items gefunden:", allNavItems.length);
    
    const sidebarStandard = document.querySelectorAll(".nav-item.standard");
    const sidebarSpecial = document.querySelectorAll(".nav-item.special");
    
    console.log("📊 Standard-Elemente gefunden:", sidebarStandard.length);
    console.log("📊 Spezial-Elemente gefunden:", sidebarSpecial.length);

    console.log("👤 Normale Seite: Zeige alle Standard-Elemente, verstecke Special-Elemente");
    
    // Alle Standard-Elemente sichtbar
    sidebarStandard.forEach((element) => {
      element.style.display = "";
      console.log("  ✅ Sichtbar:", element.textContent.trim());
    });
    
    // Special-Element verstecken
    sidebarSpecial.forEach((element) => {
      element.style.display = "none";
      console.log("  ❌ Versteckt:", element.textContent.trim());
    });
  }
}

// Kombinierte Update-Funktion
function updateVisibility() {
  updateBodyClasses(); // CSS-basierte Lösung
  updateVisibilityDirect(); // Fallback für komplexe Logik
}

// Verbesserte Funktion mit Retry-Mechanismus
function updateVisibilityWithRetry(maxRetries = 5, delay = 100) {
  let attempts = 0;
  
  function tryUpdate() {
    attempts++;
    console.log(`🔄 Versuch ${attempts}/${maxRetries} - updateVisibility`);
    
    // Prüfe ob die benötigten Elemente im DOM sind
    const sidebarElements = document.querySelectorAll(".nav-item");
    
    if (sidebarElements.length > 0) {
      console.log(`✅ ${sidebarElements.length} Sidebar-Elemente gefunden, führe Update aus`);
      updateVisibility();
      return;
    }
    
    if (attempts < maxRetries) {
      console.log(`⏳ Sidebar noch nicht geladen, versuche erneut in ${delay}ms...`);
      setTimeout(tryUpdate, delay);
    } else {
      console.warn("❌ Sidebar-Elemente konnten nach mehreren Versuchen nicht gefunden werden");
      // Fallback: Führe updateVisibility trotzdem aus
      updateVisibility();
    }
  }
  
  tryUpdate();
}

/**
 * Gibt den aktuellen Login-Status in der Konsole aus
 */
function logUserStatus() {
  const user = getCurrentUser();

  if (!user) {
    console.log("❌ Kein User im localStorage gefunden");
    return;
  }

  if (isGuest()) {
    console.log("👉 Eingeloggt als GAST:", user);
  } else {
    console.log("👉 Eingeloggt als USER:", user);
  }
}

// Event Listener für DOM-Änderungen
document.addEventListener('DOMContentLoaded', function() {
  console.log("🚀 DOM geladen, starte Benutzer-Status-Check");
  logUserStatus();
  updateBodyClasses(); // Setze Body-Klassen bereits beim DOM-Load
});

logUserStatus();