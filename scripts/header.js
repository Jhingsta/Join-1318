let dropdownElements = null;
let isDropdownOpen = false;

/**
 * Retrieves dropdown elements and caches them for future use.
 */
function getDropdownElements() {
  if (!dropdownElements) {
    dropdownElements = {
      menu: document.getElementById('header-dropdown-menu'),
      overlay: document.getElementById('header-dropdown-menu-overlay'),
      trigger: document.querySelector('[aria-expanded]')
    };
  }
  return dropdownElements;
}

/**
 * Opens the dropdown menu and updates its accessibility attributes.
 */
function openDropdown() {
  let { menu, overlay, trigger } = getDropdownElements();
  menu.classList.add('show');
  overlay.classList.add('show');
  trigger.setAttribute('aria-expanded', 'true');
  menu.setAttribute('aria-hidden', 'false');
  isDropdownOpen = true;
}

/**
 * Closes the dropdown menu and updates its accessibility attributes.
 */
function closeDropdown() {
  let { menu, overlay, trigger } = getDropdownElements();
  menu.classList.remove('show');
  overlay.classList.remove('show');
  trigger.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');
  isDropdownOpen = false;
}

/**
 * Updates the user logo with initials or a default value.
 */
function updateUserLogo() {
  let user = getCurrentUser();
  let textEl = document.getElementById("user-initials");
  if (!textEl) return;

  let initials = isGuest() ? "G" : user?.initials || "G";
  let fontSize = initials.length === 1 ? "28" : "16";

  textEl.textContent = initials;
  textEl.setAttribute("font-size", fontSize);
}

/**
 * Logs out the current user and redirects to the homepage.
 */
function logout() {
  try {
    localStorage.removeItem("currentUser");
    closeDropdown();
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout error:", error);
  }
}

/**
 * Ensures dropdown is closed when page is restored from back/forward cache
 */
window.addEventListener('pageshow', function(event) {
  if (isDropdownOpen || document.getElementById('header-dropdown-menu')?.classList.contains('show')) {
    closeDropdown();
  }
});