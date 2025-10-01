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
 * @returns {Object|null} The current user object or `null` if no user exists.
 */
function getCurrentUser() {
  let userJson = localStorage.getItem("currentUser");
  return userJson ? JSON.parse(userJson) : null;
}

/**
 * Checks if the current user is a guest.
 * @returns {boolean} `true` if the user is a guest, otherwise `false`.
 */
function isGuest() {
  let user = getCurrentUser();
  return user?.name === "Guest";
}

/**
 * Sets the active navigation status based on the current page.
 * Works for both sidebar and footer navigation.
 */
function setActiveNavigation() {
  let currentPage = window.location.pathname.split('/').pop();
  let navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(link => {
    link.classList.remove('active');

    let href = link.getAttribute('href');
    if (href) {
      let hrefPage = href.split('?')[0].replace('./', '');
      let normalizedCurrentPage = currentPage.replace('./', '');

      if (hrefPage === normalizedCurrentPage) {
        link.classList.add('active');
      }
    }
  });

  let footerItems = document.querySelectorAll('.footer-item');
  footerItems.forEach(link => {
    link.classList.remove('footer-active');

    let href = link.getAttribute('href');
    if (href) {
      let hrefPage = href.split('?')[0].replace('./', '');
      let normalizedCurrentPage = currentPage.replace('./', '');

      if (hrefPage === normalizedCurrentPage) {
        link.classList.add('footer-active');
      }
    }
  });
}
