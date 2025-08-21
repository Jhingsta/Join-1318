// Vereinfachte Konfiguration
const AUTH_CONFIG = {
  specialPages: ["legalnotice.html", "privacy-policy.html"]
};

// Utility-Funktionen
function getCurrentUser() {
  const userJson = localStorage.getItem("currentUser");
  return userJson ? JSON.parse(userJson) : null;
}

function isGuest() {
  const user = getCurrentUser();
  return user?.name === "Guest";
}

function getCurrentPageInfo() {
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop();
  const isSpecialPage = AUTH_CONFIG.specialPages.includes(currentPage);
  
  return { currentPath, currentPage, isSpecialPage };
}

// Haupt-Update-Funktion - jetzt viel einfacher dank CSS
function updateVisibility() {
  console.log("🔄 Aktualisiere Sichtbarkeit...");
  
  const body = document.body;
  const { isSpecialPage } = getCurrentPageInfo();
  const guestMode = isGuest();
  
  // Entferne alle relevanten Klassen
  body.classList.remove('user-logged-in', 'guest-logged-in', 'special-page');
  
  // Setze Body-Klassen - CSS übernimmt den Rest automatisch
  body.classList.add(guestMode ? 'guest-logged-in' : 'user-logged-in');
  
  if (isSpecialPage) {
    body.classList.add('special-page');
  }
  
  console.log(`👤 Modus: ${guestMode ? 'Gast' : 'User'}, Spezielle Seite: ${isSpecialPage}`);
  console.log("📋 Body-Klassen:", body.className);
}

// Retry-Mechanismus für w3.includeHTML timing
function updateVisibilityWithRetry(maxRetries = 5, delay = 100) {
  let attempts = 0;
  
  function tryUpdate() {
    attempts++;
    console.log(`🔄 Versuch ${attempts}/${maxRetries} - updateVisibility`);
    
    // Prüfe ob Sidebar-Elemente vorhanden sind (optional, da CSS-basiert)
    const navItems = document.querySelectorAll(".nav-item");
    
    if (navItems.length > 0) {
      console.log(`✅ ${navItems.length} Navigation-Elemente gefunden`);
      updateVisibility();
      return true;
    }
    
    if (attempts < maxRetries) {
      console.log(`⏳ Navigation noch nicht geladen, Retry in ${delay}ms...`);
      setTimeout(tryUpdate, delay);
    } else {
      console.log("❌ Max Retries erreicht, setze Body-Klassen trotzdem");
      updateVisibility(); // Funktioniert auch ohne nav-items
    }
    
    return false;
  }
  
  return tryUpdate();
}

// User-Status-Logging
function logUserStatus() {
  const user = getCurrentUser();
  
  if (!user) {
    console.log("❌ Kein User gefunden");
    return;
  }
  
  console.log(`👉 Eingeloggt als ${isGuest() ? 'GAST' : 'USER'}:`, user);
}

// Initialisierung
function initialize() {
  console.log("🚀 Auth-System initialisiert");
  logUserStatus();
  updateVisibility();
}

// Event-Listener Setup
let initialized = false;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize, { once: true });
} else {
  initialize();
}

// Verhindere mehrfache Initialisierung
if (!window.authSystemLoaded) {
  window.authSystemLoaded = true;
  
  // Öffentliche API
  window.authSystem = {
    updateVisibility: updateVisibilityWithRetry,
    logUserStatus,
    isGuest,
    getCurrentUser
  };
}

// Auto-Status-Log beim Laden
logUserStatus();