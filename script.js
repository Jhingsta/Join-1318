window.addEventListener('load', () => {
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 1500);

  setTimeout(() => {
    const splash = document.getElementById('splash');
    splash.style.display = 'none';
  }, 2500);
});

const BASE_URL = "https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/";

let users = []; // Store users data
const categories = ["Technical Task", "User Story"];

async function initAssignedDropdown() {
    await loadUsers(); // Lade Nutzer aus Firebase
    renderAssignedDropdown(); // Dropdown befüllen
}

document.addEventListener("DOMContentLoaded", () => {
    initAssignedDropdown(); // Initialisierung starten, sobald die Seite fertig geladen ist
    populateCategoryDropdown();
});


/**
 * Loads users from the Firebase database and stores them in the users array.
 * This function fetches user information from the Firebase database
 */
async function loadUsers() {
  try {
    const response = await fetch(`${BASE_URL}users.json`);
    const data = await response.json();

    if (data) {
      users = data;
      console.log("Users loaded successfully:", users);
    } else {
      console.log("No users found in database");
      users = {};
    }
  } catch (error) {
    console.error("Error loading users:", error);
    users = {};
  }
}

function renderAssignedDropdown() {
  const dropdown = document.getElementById('assigned-dropdown');
  dropdown.innerHTML = ''; // vorher leeren

  for (const key in users) {
    const user = users[key];
    const div = document.createElement('div');
    div.classList.add('dropdown-item');
    div.textContent = user.name;
    dropdown.appendChild(div);

    div.addEventListener('click', () => {
      document.querySelector('.assigned-text').textContent = user.name;
      dropdown.style.display = 'none';
    });
  }
}

/**
 * Validates user credentials by checking email and password against stored user data
 * @param {string} email - The email address to validate
 * @param {string} password - The password to validate
 * @returns {boolean} - Returns true if credentials match, false otherwise
 */
function validateCredentials(email, password) {
  for (const key in users) {
    const user = users[key];
    if (user.email === email && user.password === password) {
      return true;
    }
  }
  return false;
}

/**
 * Updates the login button state based on input validation
 * Enables/disables the login button and changes its visual appearance
 * based on whether input fields have content
 */
function updateLoginButtonState() {
  const email = document.querySelector('input[type="email"]').value;
  const password = document.querySelector('input[type="password"]').value;
  const loginButton = document.querySelector('.login-btn');

  if (email && password) {
    loginButton.disabled = false;
    loginButton.style.opacity = "1";
    loginButton.style.cursor = "pointer";
  } else {
    loginButton.disabled = true;
    loginButton.style.opacity = "0.5";
    loginButton.style.cursor = "not-allowed";
  }
}

/**
 * Authenticates a user with provided email and password
 * If successful, stores user information in localStorage and returns true
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @returns {boolean} - Returns true if login successful, false otherwise
 */
async function loginUser(email, password) {
  try {
    console.log("Attempting login with:", { email, password });
    console.log("Available users:", users);

    // Find user with matching email and password
    for (const key in users) {
      const user = users[key];
      console.log("Checking user:", user);

      if (user.email === email && user.password === password) {
        console.log("Login successful for user:", user);
        // Store user info in localStorage
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            name: user.name,
            email: user.email,
          })
        );
        return true;
      }
    }

    console.log("No matching user found");
    return false;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
}

/**
 * Handles the login form submission
 * Attempts to log in the user and redirects to summary page on success
 * Shows error message if login fails
 * @param {Event} event - The form submission event
 */
async function handleLogin(event) {
  event.preventDefault();

  const email = document.querySelector('input[type="email"]').value;
  const password = document.querySelector('input[type="password"]').value;

  const success = await loginUser(email, password);

  if (success) {
    window.location.href = "./summary.html";
  } else {
    alert("Invalid email or password");
  }
}

/**
 * Handles guest login functionality
 * Creates a guest user session and redirects to summary page
 * Stores guest user information in localStorage
 */
async function handleGuestLogin() {
  // Store guest user info
  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      name: "Guest",
      email: "guest@join.com",
    })
  );
  window.location.href = "./summary.html";
}

/**
 * Main initialization function that runs when the DOM is loaded
 * Sets up all event listeners, loads user data, and initializes the login form
 */
document.addEventListener("DOMContentLoaded", async () => {
  const loginForm = document.querySelector('form');
  const guestLoginButton = document.querySelector('.guest-btn');
  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.querySelector('input[type="password"]');

  // Load users data from Firebase
  await loadUsers();

  // Add input event listeners for real-time validation
  emailInput.addEventListener("input", updateLoginButtonState);
  passwordInput.addEventListener("input", updateLoginButtonState);

  // Add form submission handler
  loginForm.addEventListener("submit", handleLogin);

  // Add guest login handler
  guestLoginButton.addEventListener("click", handleGuestLogin);

  // Initial button state
  updateLoginButtonState();
});

// Add event listeners for title input validation
const titleInput = document.querySelector(".title-input");
const titleError = document.querySelector(".error-message");

titleInput.addEventListener("blur", () => {
  if (!titleInput.value.trim()) {
    titleInput.style.borderBottom = "1px solid #FF4D4D";
    titleError.style.display = "block";
  } else {
    titleInput.style.borderBottom = "1px solid #D1D1D1";
    titleError.style.display = "none";
  }
});
titleInput.addEventListener("input", () => {
  if (titleInput.value.trim()) {
    titleInput.style.borderBottom = "1px solid #005DFF";
    titleError.style.display = "none";
  }
});

// Add event listeners for due date input validation
// Elemente referenzieren
const dueDateInput = document.querySelector(".due-date-input");
const dueDateContent = document.querySelector(".due-date-content");
const dueDateError = document.querySelector(".due-date-container .error-message");

// Blur-Event (wenn Fokus verloren geht)
dueDateInput.addEventListener("blur", () => {
  if (!dueDateInput.value.trim()) {
    dueDateContent.style.borderBottom = "1px solid #FF4D4D";
    dueDateError.style.display = "block";
  } else {
    dueDateContent.style.borderBottom = "1px solid #D1D1D1";
    dueDateError.style.display = "none";
  }
});

// Input-Event (wenn User tippt)
dueDateInput.addEventListener("input", () => {
  if (dueDateInput.value.trim()) {
    dueDateContent.style.borderBottom = "1px solid #005DFF"; // optional: Fokus-Farbe
    dueDateError.style.display = "none";
  }
});


// Add event listeners for priority buttons
const buttons = document.querySelectorAll(".priority-frame");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Entferne active von allen Buttons
    buttons.forEach(b => b.classList.remove("active"));
    // Füge active nur zum geklickten Button hinzu
    btn.classList.add("active");
  });
});

// Add event listener for assigned dropdown toggle
const arrowContainer = document.querySelector('.assigned-arrow-container');
const assignedDropdown = document.getElementById('assigned-dropdown');

arrowContainer.addEventListener('click', (event) => {
  event.stopPropagation();
  assignedDropdown.style.display = assignedDropdown.style.display === 'block' ? 'none' : 'block';
});

// Klick außerhalb schließt
document.addEventListener('click', (event) => {
  if (!assignedDropdown.contains(event.target) && event.target !== arrowContainer) {
    assignedDropdown.style.display = 'none';
  }
});


function populateCategoryDropdown() {
    const container = document.querySelector('.category-container .category-content');
    if (!container) return;

    const menu = document.createElement('div');
    menu.className = 'dropdown-menu';

    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = cat;

        item.addEventListener('click', () => {
            container.querySelector('.assigned-text').textContent = cat;
            menu.style.display = 'none';
        });

        menu.appendChild(item);
    });

    container.appendChild(menu);

    // Klick auf Pfeil zum Öffnen
    const arrow = container.querySelector('.assigned-arrow-container');
    arrow.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });

    // Klick außerhalb schließt das Menü
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            menu.style.display = 'none';
        }
    });
}

