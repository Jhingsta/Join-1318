const BASE_URL = "https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Creates a new user in Firebase
 * @param {Object} userData - User data object with name, email, and password
 * @returns {Object} - Returns the result with success status and user ID
 */
async function createUser(userData) {
  try {
    console.log("Creating new user:", userData);

    const response = await fetch(`${BASE_URL}users.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log("User created successfully:", result);
      return { success: true, userId: result.name };
    } else {
      const errorText = await response.text();
      console.error("Failed to create user:", response.status, errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Checks if a user with the given email already exists
 * @param {string} email - Email to check
 * @returns {boolean} - Returns true if user exists
 */
async function checkUserExists(email) {
  try {
    const response = await fetch(`${BASE_URL}users.json`);
    const users = await response.json();

    if (users) {
      for (const key in users) {
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

function validateSignupForm(formData) {
  const errors = [];

  // Email format validation
  if (!isValidEmailBrowser(formData.email)) {
    errors.push("Please enter a valid email address.");
  }

  // Password match validation  
  if (formData.password !== formData.confirmPassword) {
    errors.push("Your passwords don't match. Please try again.");
  }

  // Password length validation
  if (formData.password.length < 6) {
    errors.push("Passwords must be at least 6 characters long.");
  }

  return {
    success: errors.length === 0,
    errors: errors
  };
}

async function handleSignup(event) {
  event.preventDefault();

  // Get all form groups for error styling
  const nameGroup = document.querySelector('#name').closest('.form-group');
  const emailGroup = document.querySelector('#email').closest('.form-group'); 
  const passwordGroup = document.querySelector('#password').closest('.form-group');
  const confirmPasswordGroup = document.querySelector('#confirm-password').closest('.form-group');
  const errorMessage = document.querySelector('.error-message');

  // Get form data
  const formData = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value,
    confirmPassword: document.getElementById('confirm-password').value
  };

  // Reset previous errors
  [nameGroup, emailGroup, passwordGroup, confirmPasswordGroup].forEach(group => {
    group.classList.remove("input-error");
  });
  errorMessage.classList.remove("show");
  errorMessage.textContent = "";

  // Form validation (email format, password match, password length)
  const validation = validateSignupForm(formData);
  if (!validation.success) {
    errorMessage.textContent = validation.errors[0]; // Show first error
    errorMessage.classList.add("show");
    
    // Add error styling based on error type
    if (validation.errors[0].includes("email")) {
      emailGroup.classList.add("input-error");
    } else if (validation.errors[0].includes("match")) {
      confirmPasswordGroup.classList.add("input-error");
    } else if (validation.errors[0].includes("6 characters")) {
      passwordGroup.classList.add("input-error");
    }
    return;
  }

  // Check if user already exists
  const userExists = await checkUserExists(formData.email);
  if (userExists) {
    errorMessage.textContent = "A user with this email address already exists.";
    errorMessage.classList.add("show");
    emailGroup.classList.add("input-error");
    return;
  }

  // Create user (rest bleibt gleich wie original)
  try {
    const userInitials = getInitials(formData.name);
    const userColor = getColorFromName(formData.name);

    const userData = {
      name: formData.name,
      email: formData.email,
      phone: "",
      password: formData.password,
      initials: userInitials,
      color: userColor
    };

    const result = await createUser(userData);

    localStorage.setItem('newUser', JSON.stringify({
      name: formData.name,
      email: formData.email,
      initials: userInitials,
      color: userColor
    }));

    if (result.success) {
      showSignupSuccessMessage(); // ✅ Erfolgsmeldung anzeigen
      setTimeout(() => {
        window.location.href = './index.html';
      }, 2000); // ✅ Redirect nach 2 Sekunden (damit Animation zu sehen ist)
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

function isValidEmailBrowser(email) {
  const input = document.createElement('input');
  input.type = 'email';
  input.value = email;
  return input.validity.valid;
}

/**
 * Generates initials from a user's name
 * @param {string} name - The user's full name
 * @returns {string} - The user's initials (max 2 characters)
 */
function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  return parts.map(p => p[0].toUpperCase()).slice(0, 2).join("");
}

/**
 * Generates a color based on the user's name
 * @param {string} name - The user's name
 * @returns {string} - HSL color string
 */
function getColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

function showSignupSuccessMessage() {
  const container = document.createElement("div");
  container.className = "signup-success-container";

  // Bild erstellen
  const img = document.createElement("img");
  img.src = "./assets/icons-signup/successmessage.png";
  img.alt = "Signup success";
  img.className = "signup-success-image";

  container.appendChild(img);
  document.body.appendChild(container);

  // Phase 1: Von unten in die Mitte sliden
  setTimeout(() => {
    container.classList.add("slide-in");
  }, 50);

  // Phase 2: Kurz verharren, dann wegfaden
  setTimeout(() => {
    container.classList.add("fade-out");
    
    // Nach Fade-Out entfernen
    setTimeout(() => {
      container.remove();
    }, 300);
  }, 1500);
}

/**
 * Updates the signup button state based on form validation
 */
function updateSignupButtonState() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const privacyAccepted = document.getElementById('accept-privacy').checked;

  const submitButton = document.querySelector('button[type="submit"]');

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
 * Main initialization function
 */
document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.querySelector('#signupForm'); // ✅ Geändert: Form-ID Selector
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const passwordIcon = passwordInput.nextElementSibling;
  const confirmPasswordIcon = confirmPasswordInput.nextElementSibling;

  // ✅ GEÄNDERT - Form submission (kein doppelter Submit Handler mehr)
  signupForm.addEventListener('submit', handleSignup);

  const inputs = ['name', 'email', 'password', 'confirm-password'];
  inputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    input.addEventListener('input', updateSignupButtonState);
  });

  const privacyCheckbox = document.getElementById('accept-privacy');
  privacyCheckbox.addEventListener('change', updateSignupButtonState);

  let passwordVisible = false;
  let confirmPasswordVisible = false;

  function togglePassword(input, icon, isVisible) {
    if (!input || !icon) return;
    input.type = isVisible ? "text" : "password";
    icon.src = isVisible
      ? "./assets/icons-signup/visibility_off.svg"
      : "./assets/icons-signup/visibility.svg";
  }

  passwordIcon.addEventListener("click", () => {
    passwordVisible = !passwordVisible;
    togglePassword(passwordInput, passwordIcon, passwordVisible);
  });

  confirmPasswordIcon.addEventListener("click", () => {
    confirmPasswordVisible = !confirmPasswordVisible;
    togglePassword(confirmPasswordInput, confirmPasswordIcon, confirmPasswordVisible);
  });

  function updateIcon(input, icon, isVisible) {
    if (!input.value) {
      icon.src = "./assets/icons-signup/lock.svg";
    } else {
      icon.src = isVisible
        ? "./assets/icons-signup/visibility_off.svg"
        : "./assets/icons-signup/visibility.svg";
    }
  }

  passwordInput.addEventListener("input", () => updateIcon(passwordInput, passwordIcon, passwordVisible));
  confirmPasswordInput.addEventListener("input", () => updateIcon(confirmPasswordInput, confirmPasswordIcon, confirmPasswordVisible));

  // Initial states
  updateSignupButtonState();
});