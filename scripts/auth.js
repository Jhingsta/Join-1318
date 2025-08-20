function getCurrentUser() {
  const userJson = localStorage.getItem("currentUser");
  return userJson ? JSON.parse(userJson) : null;
}

function isGuest() {
  const user = getCurrentUser();
  return user && user.name === "Guest";
}

function updateVisibility() {

  document.querySelectorAll("[data-show-when]").forEach((element) => {
    const condition = element.getAttribute("data-show-when");

    if (condition === "logged-in" && !isGuest()) {
      element.style.display = "";
    }
    if (condition === "guest" && isGuest()) {
      element.style.display = "";
    }
  });
}

// Beispiel
// <!-- Nur für eingeloggte User -->
// <i class="fa fa-user" data-show-when="logged-in" style="display:none;"></i>

// <!-- Nur für Gäste -->
// <i class="fa fa-user-secret" data-show-when="guest" style="display:none;"></i>

// <script src="auth.js"></script>
// </body>
