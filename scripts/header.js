let dropdownElements = null;
let isDropdownOpen = false;

function getDropdownElements() {
  if (!dropdownElements) {
    dropdownElements = {
      menu: document.getElementById('header-dropdown-menu'),
      overlay: document.getElementById('overlay'),
      trigger: document.querySelector('[aria-expanded]')
    };
  }
  return dropdownElements;
}

function openDropdown() {
  const { menu, overlay, trigger } = getDropdownElements();
  
  menu.classList.add('show');
  overlay.classList.add('show');
  trigger.setAttribute('aria-expanded', 'true');
  menu.setAttribute('aria-hidden', 'false');
  
  isDropdownOpen = true;

  // Verhindert Scrollbar-Probleme
  // if (window.innerWidth <= 768) {
  //   document.body.style.overflow = 'hidden';
  // }
}

function closeDropdown() {
  const { menu, overlay, trigger } = getDropdownElements();
  
  menu.classList.remove('show');
  overlay.classList.remove('show');
  trigger.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');
  
  isDropdownOpen = false;

  // Scrolling wieder aktivieren
  // document.body.style.overflow = '';
}

function updateUserLogo() {
  const user = getCurrentUser();
  const textEl = document.getElementById("user-initials");
  if (!textEl) return;

  if (isGuest()) {
    textEl.textContent = "G";
    textEl.setAttribute("font-size", "28");
  } else if (user?.initials) {
    textEl.textContent = user.initials;

    if (user.initials.length === 1) {
      textEl.setAttribute("font-size", "28");
    }

  } else {
    textEl.textContent = "G"; // Standardfallback
    textEl.setAttribute("font-size", "28");
  }
}

function logout() {
  try {
    // Nutzer aus dem localStorage löschen
    localStorage.removeItem("currentUser");
    
    // Sicherheitshalber Dropdown schließen, falls noch offen
    const dropdownMenu = document.getElementById("header-dropdown-menu");
    if (dropdownMenu) {
      dropdownMenu.classList.remove("show");
    }

    // Weiterleitung zur Startseite
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout error:", error);
  }
}
