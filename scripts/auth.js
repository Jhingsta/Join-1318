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

/**
 * Updates ARIA attributes for the landscape overlay based on screen width.
 * 
 * When the device is in landscape mode (between 701px and 1024px),
 * this function hides the main page content from assistive technologies
 * and activates the overlay with an accessible live announcement.
 * 
 * When the device is outside of this range, the overlay is hidden again,
 * and the main content becomes accessible.
 * 
 * Automatically update ARIA states on window resize
 * window.addEventListener('resize', updateAriaForLandscapeOverlay);
 */
function updateAriaForLandscapeOverlay() {
  const overlay = document.getElementById('landscape-overlay');
  const pageRoot = document.getElementById('page-root');
  const status = document.getElementById('landscape-status');

  if (!overlay || !pageRoot || !status) return;

  const isLandscape = window.matchMedia('(min-width: 701px) and (max-width: 1024px)').matches;

  if (isLandscape) {
    overlay.setAttribute('aria-hidden', 'false');
    pageRoot.setAttribute('aria-hidden', 'true');
    status.textContent = 'Landscape mode activated. Please rotate your device.';
  } else {
    overlay.setAttribute('aria-hidden', 'true');
    pageRoot.setAttribute('aria-hidden', 'false');
    status.textContent = 'Back to normal view.';
  }
}

// Execute immediately after page load
enforceAuthentication();
updateAriaForLandscapeOverlay();

// Update when screen size changes
window.addEventListener('resize', updateAriaForLandscapeOverlay);