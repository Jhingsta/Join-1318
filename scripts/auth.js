// Direkt beim Laden prüfen, ob ein User existiert, sonst zur Login-Seite weiterleiten
// function enforceAuthentication() {
//   let user = getCurrentUser();

//   // Prüfen, ob URL-Parameter "from=visitor" gesetzt ist
//   let urlParams = new URLSearchParams(window.location.search);
//   let isVisitorMode = urlParams.get("from") === "visitor";

//   // Wenn kein User vorhanden ist UND kein Visitor-Modus aktiv → Redirect
//   if (!user && !isVisitorMode) {
//     window.location.href = "/index.html";
//   }
// }

/**
 * Retrieves the current user from local storage.
 */
function getCurrentUser() {
  let userJson = localStorage.getItem("currentUser");
  return userJson ? JSON.parse(userJson) : null;
}

/**
 * Checks if the current user is a guest.
 */
function isGuest() {
  let user = getCurrentUser();
  return user?.name === "Guest";
}

/**
 * Sets the active navigation and footer items based on the current page.
 */
function setActiveNavigation() {
  let currentPage = getCurrentPage();
  activateNavItems('.nav-item', 'active', currentPage);
  activateNavItems('.footer-item', 'footer-active', currentPage);
}

/**
 * Gets the current page filename from the URL.
 */
function getCurrentPage() {
  return window.location.pathname.split('/').pop().replace('./', '');
}

/**
 * Adds the active class and ARIA attribute to navigation or footer items that match the current page.
 *
 * @param {string} selector - CSS selector for the navigation/footer items.
 * @param {string} activeClass - The CSS class to add for the active item.
 * @param {string} currentPage - The current page filename.
 */
function activateNavItems(selector, activeClass, currentPage) {
  let items = document.querySelectorAll(selector);
  items.forEach(link => {
    link.classList.remove(activeClass);
    link.removeAttribute('aria-current');

    let href = link.getAttribute('href');
    if (!href) return;

    let hrefPage = href.split('?')[0].replace('./', '');
    if (hrefPage === currentPage) {
      link.classList.add(activeClass);
      link.setAttribute('aria-current', 'page');
    }
  });
}

// Execute immediately after page load
enforceAuthentication();