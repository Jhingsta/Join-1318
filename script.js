const BASE_URL = "https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/";

let users = [];

window.addEventListener('load', () => {
  setTimeout(() => document.body.classList.add('loaded'), 1500);
  setTimeout(hideSplashScreen, 2500);
});

/**
 * Initializes the login form and event listeners.
 */
document.addEventListener("DOMContentLoaded", async () => {
  await loadUsers();
  setupEventListeners();
});

/**
 * Hides the splash screen by setting its display to 'none'.
 */
function hideSplashScreen() {
  let splash = document.getElementById('splash');
  splash.style.display = 'none';
}

/**
 * Loads users from the Firebase database and stores them in the users array.
 * This function fetches user information from the Firebase database
 */
async function loadUsers() {
  try {
    let response = await fetch(`${BASE_URL}users.json`);
    let data = await response.json();
    if (data) {
      users = data;
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
 */
function validateCredentials(email, password) {
  for (let key in users) {
    let user = users[key];
    if (user.email === email && user.password === password) {
      return true;
    }
  }
  return false;
}

/**
 * Updates the login button state based on input validation.
 */
function updateLoginButtonState() {
  let email = getInputValue('email');
  let password = getInputValue('password');
  let loginButton = document.querySelector('.login-btn');
  toggleLoginButton(loginButton, email && password);
}

/**
 * Toggles the login button state based on validation.
 * @param {HTMLElement} button - The login button element.
 * @param {boolean} isEnabled - Whether the button should be enabled.
 */
function toggleLoginButton(button, isEnabled) {
  button.disabled = !isEnabled;
  button.style.opacity = isEnabled ? "1" : "0.5";
  button.style.cursor = isEnabled ? "pointer" : "not-allowed";
}

/**
 * Gets the trimmed value of an input field by name.
 * @param {string} name - The name of the input field.
 */
function getInputValue(name) {
  return document.querySelector(`input[name="${name}"]`).value.trim();
}

/**
 * Authenticates a user with provided email and password.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 */
async function loginUser(email, password) {
  try {
    let user = Object.values(users).find(u => u.email === email && u.password === password);
    if (user) {
      storeCurrentUser(user);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
}

/**
 * Stores the current user in localStorage.
 * @param {Object} user - The user object to store.
 */
function storeCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    initials: user.initials || "",
    color: user.color || ""
  }));
}

/**
 * Validates the email format using browser-native validation.
 * @param {string} email - The email address to validate.
 */
function isValidEmailBrowser(email) {
  let input = document.createElement('input');
  input.type = 'email';
  input.value = email;
  return input.validity.valid;
}

/**
 * Handles the login form submission.
 * @param {Event} event - The form submission event.
 */
async function handleLogin(event) {
  event.preventDefault();
  let email = getInputValue('email');
  let password = getInputValue('password');
  resetErrorState();
  if (!isValidEmailBrowser(email)) {
    showError("Please enter a valid email address.", 'email');
    return;
  }
  let success = await loginUser(email, password);
  if (!success) {
    showError("Check your email and password. Please try again.", 'email', 'password');
    return;
  }
  sessionStorage.setItem('showSummaryAnimation', 'true');
  window.location.href = "./summary.html";
}

/**
 * Resets the error state of the login form.
 */
function resetErrorState() {
  let errorMessage = document.querySelector('.error-message');
  errorMessage.style.display = "none";
  errorMessage.textContent = "";
  document.querySelectorAll('.input-container').forEach(container => container.classList.remove("input-error"));
}

/**
 * Shows an error message and highlights the input fields.
 * @param {string} message - The error message to display.
 * @param {...string} fields - The names of the input fields to highlight.
 */
function showError(message, ...fields) {
  let errorMessage = document.querySelector('.error-message');
  errorMessage.textContent = message;
  errorMessage.style.display = "flex";
  fields.forEach(field => document.querySelector(`.input-container-${field}`).classList.add("input-error"));
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
 * Sets up event listeners for the login form.
 */
function setupEventListeners() {
  let loginForm = document.querySelector('#login-form');
  let guestLoginButton = document.querySelector('.guest-btn');
  let emailInput = document.querySelector('input[name="email"]');
  let passwordInput = document.querySelector('input[type="password"]');
  let togglePasswordIcon = document.querySelector('.input-container-password .toggle-password');

  loginForm.addEventListener("submit", handleLogin);
  guestLoginButton.addEventListener("click", handleGuestLogin);
  emailInput.addEventListener("input", updateLoginButtonState);
  passwordInput.addEventListener("input", updateLoginButtonState);

  setupPasswordToggle(passwordInput, togglePasswordIcon);
}

/**
 * Sets up the password visibility toggle functionality.
 * @param {HTMLInputElement} passwordInput - The password input field.
 * @param {HTMLElement} togglePasswordIcon - The toggle icon element.
 */
function setupPasswordToggle(passwordInput, togglePasswordIcon) {
  let passwordVisible = false;

  togglePasswordIcon?.addEventListener("click", () => {
    if (!passwordInput.value) return;
    passwordVisible = !passwordVisible;
    passwordInput.type = passwordVisible ? "text" : "password";
    updatePasswordIcon(togglePasswordIcon, passwordVisible, passwordInput.value);
  });

  passwordInput?.addEventListener("input", () => updatePasswordIcon(togglePasswordIcon, passwordVisible, passwordInput.value));
}

/**
 * Updates the password toggle icon based on visibility and input value.
 * @param {HTMLElement} icon - The toggle icon element.
 * @param {boolean} isVisible - Whether the password is visible.
 * @param {string} value - The current value of the password input.
 */
function updatePasswordIcon(icon, isVisible, value) {
  if (!value) {
    icon.src = "./assets/icons-signup/lock.svg";
  } else {
    icon.src = isVisible ? "./assets/icons-signup/visibility_off.svg" : "./assets/icons-signup/visibility.svg";
  }
}