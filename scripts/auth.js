/**
 * Ensures that only authenticated users can access protected pages.
 *
 * Checks whether a user is currently logged in by calling `getCurrentUser()`.
 * If no user is found and the visitor is not in "visitor mode" (i.e., the URL does not contain `?from=visitor`),
 * the function redirects the user to the login page (`/index.html`).
 */
function enforceAuthentication() {
  let user = getCurrentUser();

  let urlParams = new URLSearchParams(window.location.search);
  let isVisitorMode = urlParams.get("from") === "visitor";

  if (!user && !isVisitorMode) {
    window.location.href = "/index.html";
  }
}

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