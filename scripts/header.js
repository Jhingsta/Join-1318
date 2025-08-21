function toggleDropdown() {
    const dropdownMenu = document.getElementById('header-dropdown-menu');
    const isOpen = dropdownMenu.classList.contains('show');
    
    if (isOpen) {
        dropdownMenu.classList.remove('show');
        // Update ARIA attributes
        document.querySelector('[aria-expanded]').setAttribute('aria-expanded', 'false');
    } else {
        dropdownMenu.classList.add('show');
        // Update ARIA attributes
        document.querySelector('[aria-expanded]').setAttribute('aria-expanded', 'true');
    }
}

function updateUserLogo() {
  const user = getCurrentUser();
  const textEl = document.getElementById("user-initials");
  if (!textEl) return;

  if (isGuest()) {
    textEl.textContent = "G";
    textEl.setAttribute("font-size", "28"); // größer wie bei deinem Gast-Logo
  } else if (user?.initials) {
    textEl.textContent = user.initials; // falls du Initialen speicherst
  } else {
    textEl.textContent = "SM"; // Standardfallback
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
