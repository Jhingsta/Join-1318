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
  const email = document.querySelector('input[type="email"]').value.trim();
  const passwordInput = document.querySelector('.input-container-password input'); // immer dasselbe Feld
  const password = passwordInput.value.trim();
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
            phone: user.phone || "",
            initials: user.initials || "",
            color: user.color || ""
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

function isValidEmailBrowser(email) {
    const input = document.createElement('input');
    input.type = 'email';
    input.value = email;
    return input.validity.valid;
}

/**
 * Handles the login form submission
 * Attempts to log in the user and redirects to summary page on success
 * Shows error message if login fails
 * @param {Event} event - The form submission event
 */
async function handleLogin(event) {
  event.preventDefault();

  const emailContainer = document.querySelector('.input-container-mail');
  const passwordContainer = document.querySelector('.input-container-password');
  const errorMessage = document.querySelector('.error-message');

  const email = document.querySelector('input[name="email"]').value.trim();
  const password = document.querySelector('input[type="password"]').value.trim();

  // Reset vorheriger Fehler
  emailContainer.classList.remove("input-error");
  passwordContainer.classList.remove("input-error");
  errorMessage.style.display = "none";
  errorMessage.textContent = "";

  // Email format validation using browser-native validation
  const emailInput = document.querySelector('input[name="email"]');
  if (!emailInput.validity.valid) {
    errorMessage.textContent = "Please enter a valid email address.";
    errorMessage.style.display = "flex";
    emailContainer.classList.add("input-error");
    return;
  }

  const success = await loginUser(email, password);

  if (!success) {
    // Falscher Login
    errorMessage.textContent = "Check your email and password. Please try again.";
    errorMessage.style.display = "flex";
    emailContainer.classList.add("input-error");
    passwordContainer.classList.add("input-error");
    return;
  }

  // Erfolgreicher Login
  sessionStorage.setItem('showSummaryAnimation', 'true');
  window.location.href = "./summary.html";
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
  sessionStorage.setItem('showSummaryAnimation', 'true');
  window.location.href = "./summary.html";
}

/**
 * Main initialization function that runs when the DOM is loaded
 * Sets up all event listeners, loads user data, and initializes the login form
 */
document.addEventListener("DOMContentLoaded", async () => {
  const loginForm = document.querySelector('#login-form');
  const guestLoginButton = document.querySelector('.guest-btn');
  const emailInput = document.querySelector('input[name="email"]');
  const passwordInput = document.querySelector('input[type="password"]');
  const togglePasswordIcon = document.querySelector('.input-container-password .toggle-password');


  // Load users data
  await loadUsers();
  console.log("DEBUG users:", users);


  // Button aktivieren/deaktivieren
  emailInput.addEventListener("input", updateLoginButtonState);
  passwordInput.addEventListener("input", updateLoginButtonState);

  // Formular-Submit
  loginForm.addEventListener("submit", handleLogin);

  // Gast-Login
  guestLoginButton.addEventListener("click", handleGuestLogin);

  // Passwort-Icon toggle
  let passwordVisible = false;

  function updateIcon() {
    if (!passwordInput || !togglePasswordIcon) return; // <-- Abbruch, falls null

    if (!passwordInput.value) {
      togglePasswordIcon.src = "./assets/icons-signup/lock.svg";
    } else {
      togglePasswordIcon.src = passwordVisible
        ? "./assets/icons-signup/visibility_off.svg"
        : "./assets/icons-signup/visibility.svg";
    }
  }

  togglePasswordIcon?.addEventListener("click", () => {
    if (!passwordInput || !passwordInput.value) return;

    passwordVisible = !passwordVisible;
    passwordInput.type = passwordVisible ? "text" : "password";
    updateIcon();
  });

  passwordInput?.addEventListener("input", updateIcon);



  // Enter-Taste für Email + Passwort
  [emailInput, passwordInput].forEach(input => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleLogin(e);
      }
    });
  });

  // Initial
  updateIcon();
  updateLoginButtonState();
});




