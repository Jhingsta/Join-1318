const BASE_URL = "https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Creates a new user by sending user data to the server.
 * Handles request success and error cases, returning a standardized result object.
 *
 * @param {Object} userData - The data of the user to create.
 * @param {string} userData.name - The user's full name.
 * @param {string} userData.email - The user's email address.
 * @param {string} [userData.phone] - The user's phone number.
 */
async function createUser(userData) {
  try {
    let response = await sendUserToServer(userData);
    if (response.ok) {
      let result = await response.json();
      return { success: true, userId: result.name };
    } else {
      let errorText = await response.text();
      console.error("Failed to create user:", response.status, errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Sends user data to the server to create a new entry in the database.
 *
 * @param {Object} userData - The data of the user to be created.
 */
async function sendUserToServer(userData) {
  return fetch(`${BASE_URL}users.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  });
}

/**
 * Checks if a user with the given email already exists
 * @param {string} email - Email to check
 */
async function checkUserExists(email) {
  try {
    let response = await fetch(`${BASE_URL}users.json`);
    let users = await response.json();
    if (users) {
      for (let key in users) {
        if (users[key].email === email) {
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false;
  }
}

/**
 * Validates the signup form data for correct email format and password rules.
 * 
 * Performs the following checks:
 * - Ensures the email address has a valid format.
 * - Confirms that both password fields match.
 * - Ensures the password meets the minimum length requirement.
 *
 * @param {Object} formData - The form data to validate.
 * @param {string} formData.email - The user's entered email address.
 * @param {string} formData.password - The user's chosen password.
 * @param {string} formData.confirmPassword - The user's password confirmation.
 */
function validateSignupForm(formData) {
  let errors = [];
  if (!isValidEmailBrowser(formData.email)) {
    errors.push("Please enter a valid email address.");
  }
  if (formData.password !== formData.confirmPassword) {
    errors.push("Your passwords don't match. Please try again.");
  }
  if (formData.password.length < 6) {
    errors.push("Passwords must be at least 6 characters long.");
  }
  return {
    success: errors.length === 0,
    errors: errors
  };
}

/**
 * Handles the signup form submission workflow.
 * Orchestrates validation, user existence check, and user creation.
 *
 * @param {Event} event - The form submission event.
 */
async function handleSignup(event) {
  event.preventDefault();

  let formData = getSignupFormData();
  resetSignupFormErrors();

  let validation = validateSignupForm(formData);
  if (!validation.success) {
    displaySignupError(validation.errors[0]);
    return;
  }
  if (await checkUserExists(formData.email)) {
    displaySignupError("A user with this email address already exists.", 'email');
    return;
  }
  await createSignupUser(formData);
}

/**
 * Reads and returns the signup form input values.
 */
function getSignupFormData() {
  return {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value,
    confirmPassword: document.getElementById('confirm-password').value
  };
}

/**
 * Clears all previous validation errors and hides the error message container.
 */
function resetSignupFormErrors() {
  let groups = document.querySelectorAll('.form-group');
  groups.forEach(group => group.classList.remove("input-error"));

  let errorMessage = document.querySelector('.error-message');
  errorMessage.classList.remove("show");
  errorMessage.textContent = "";
}

/**
 * Displays a signup error message and highlights the corresponding input field.
 *
 * @param {string} message - The error message to display.
 * @param {string} [field] - Optional: 'name', 'email', 'password', 'confirmPassword' to highlight a specific field.
 */
function displaySignupError(message, field) {
  let errorMessage = document.querySelector('.error-message');
  errorMessage.textContent = message;
  errorMessage.classList.add("show");

  if (!field) return;

  let fieldMap = {
    name: '#name',
    email: '#email',
    password: '#password',
    confirmPassword: '#confirm-password'
  };
  let group = document.querySelector(fieldMap[field]).closest('.form-group');
  group.classList.add("input-error");
}

/**
 * Builds the user data object for signup, including initials and avatar color.
 *
 * @param {Object} formData - The validated signup form data.
 * @param {string} formData.name - The user's name.
 * @param {string} formData.email - The user's email.
 * @param {string} formData.password - The user's password.
 */
function buildSignupUserData(formData) {
  return {
    name: formData.name,
    email: formData.email,
    phone: "",
    password: formData.password,
    initials: getInitials(formData.name),
    color: getColorFromName(formData.name)
  };
}

/**
 * Stores basic user info in localStorage after signup.
 *
 * @param {Object} userData - The user data object.
 */
function storeNewUserLocally(userData) {
  localStorage.setItem('newUser', JSON.stringify({
    name: userData.name,
    email: userData.email,
    initials: userData.initials,
    color: userData.color
  }));
}

/**
 * Creates a new user account, stores local info, and handles success or error UI feedback.
 *
 * @param {Object} formData - The validated signup form data.
 */
async function createSignupUser(formData) {
  let userData = buildSignupUserData(formData);
  let errorMessage = document.querySelector('.error-message');
  try {
    let result = await createUser(userData);
    storeNewUserLocally(userData);

    if (result.success) {
      showSignupSuccessMessage();
      setTimeout(() => window.location.href = './index.html', 2000);
    } else {
      errorMessage.textContent = "Failed to create account. Please try again.";
      errorMessage.classList.add("show");
    }
  } catch (error) {
    errorMessage.textContent = "An unexpected error occurred. Please try again.";
    errorMessage.classList.add("show");
    console.error('Signup error:', error);
  }
}

/**
 * Validates an email address using the browser's built-in email input validation.
 *
 * @param {string} email - The email address to validate.
 */
function isValidEmailBrowser(email) {
  let input = document.createElement('input');
  input.type = 'email';
  input.value = email;
  return input.validity.valid;
}

/**
 * Generates initials from a user's name
 * 
 * @param {string} name - The user's full name
 */
function getInitials(name) {
  if (!name) return "";
  let parts = name.trim().split(" ");
  return parts.map(p => p[0].toUpperCase()).slice(0, 2).join("");
}

/**
 * Generates a color based on the user's name
 * 
 * @param {string} name - The user's name
 */
function getColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  let hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Displays a temporary signup success message with an image.
 * The message slides in, stays visible briefly, then fades out and is removed from the DOM.
 */
function showSignupSuccessMessage() {
  let container = document.createElement("div");
  container.className = "signup-success-container";
  let img = document.createElement("img");
  img.src = "./assets/icons-signup/successmessage.png";
  img.alt = "Signup success";
  img.className = "signup-success-image";
  container.appendChild(img);
  document.body.appendChild(container);

  setTimeout(() => {
    container.classList.add("slide-in");
  }, 50);
  setTimeout(() => {
    container.classList.add("fade-out");
    setTimeout(() => {
      container.remove();
    }, 300);
  }, 1500);
}

/**
 * Updates the signup button state based on form validation
 */
function updateSignupButtonState() {
  let name = document.getElementById('name').value.trim();
  let email = document.getElementById('email').value.trim();
  let password = document.getElementById('password').value;
  let confirmPassword = document.getElementById('confirm-password').value;
  let privacyAccepted = document.getElementById('accept-privacy').checked;
  let submitButton = document.querySelector('button[type="submit"]');

  if (name && email && password && confirmPassword && privacyAccepted) {
    submitButton.disabled = false;
    submitButton.style.opacity = '1';
    submitButton.style.cursor = 'pointer';
  } else {
    submitButton.disabled = true;
    submitButton.style.opacity = '0.5';
    submitButton.style.cursor = 'not-allowed';
  }
}

/**
 * Initializes the signup form by attaching submit and input event listeners.
 */
function initSignupForm() {
  let signupForm = document.querySelector('#signupForm');
  signupForm.addEventListener('submit', handleSignup);

  let inputs = ['name', 'email', 'password', 'confirm-password'];
  inputs.forEach(inputId => {
    let input = document.getElementById(inputId);
    input.addEventListener('input', updateSignupButtonState);
  });

  let privacyCheckbox = document.getElementById('accept-privacy');
  privacyCheckbox.addEventListener('change', updateSignupButtonState);

  updateSignupButtonState();
}

/**
 * Initializes password and confirm-password visibility toggle functionality.
 */
function initPasswordToggle() {
  let passwordInput = document.getElementById("password");
  let confirmPasswordInput = document.getElementById("confirm-password");
  let passwordIcon = passwordInput.nextElementSibling;
  let confirmPasswordIcon = confirmPasswordInput.nextElementSibling;

  let passwordVisible = false;
  let confirmPasswordVisible = false;

  setupPasswordVisibilityToggle(passwordInput, passwordIcon, () => passwordVisible = !passwordVisible, () => passwordVisible);
  setupPasswordVisibilityToggle(confirmPasswordInput, confirmPasswordIcon, () => confirmPasswordVisible = !confirmPasswordVisible, () => confirmPasswordVisible);

  setupPasswordInputIconUpdate(passwordInput, passwordIcon, () => passwordVisible);
  setupPasswordInputIconUpdate(confirmPasswordInput, confirmPasswordIcon, () => confirmPasswordVisible);
}

/**
 * Sets up click listener on a password field and its icon to toggle visibility.
 *
 * @param {HTMLInputElement} input - The password input field.
 * @param {HTMLImageElement} icon - The icon element for toggling visibility.
 * @param {Function} toggleState - Function to update the visibility state.
 * @param {Function} getState - Function to get the current visibility state.
 */
function setupPasswordVisibilityToggle(input, icon, toggleState, getState) {
  icon.addEventListener("click", () => {
    toggleState();
    input.type = getState() ? "text" : "password";
    icon.src = getState()
      ? "./assets/icons-signup/visibility_off.svg"
      : "./assets/icons-signup/visibility.svg";
  });
}

/**
 * Sets up input listener to update password icon based on the current value.
 *
 * @param {HTMLInputElement} input - The password input field.
 * @param {HTMLImageElement} icon - The icon element for visibility/lock.
 * @param {Function} getState - Function to get the current visibility state.
 */
function setupPasswordInputIconUpdate(input, icon, getState) {
  input.addEventListener("input", () => updateIcon(input, icon, getState()));
}

/**
 * Updates the visibility or lock icon for password fields based on input value and visibility state.
 *
 * @param {HTMLInputElement} input - The password input field.
 * @param {HTMLImageElement} icon - The icon element to update.
 * @param {boolean} isVisible - Whether the password is currently visible.
 */
function updateIcon(input, icon, isVisible) {
  if (!input.value) {
    icon.src = "./assets/icons-signup/lock.svg";
  } else {
    icon.src = isVisible
      ? "./assets/icons-signup/visibility_off.svg"
      : "./assets/icons-signup/visibility.svg";
  }
}

/**
 * Main initialization function for the signup page.
 */
document.addEventListener('DOMContentLoaded', () => {
  initSignupForm();
  initPasswordToggle();
});