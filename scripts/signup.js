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

/**
 * Validates the signup form data
 * @param {Object} formData - Form data object
 * @returns {Object} - Returns validation result with success status and errors
 */
function validateSignupForm(formData) {
  const errors = [];

  // Check if all fields are filled
  if (!formData.name.trim()) {
    errors.push("Name is required");
  }

  if (!formData.email.trim()) {
    errors.push("Email is required");
  } else if (!isValidEmail(formData.email)) {
    errors.push("Please enter a valid email address");
  }

  if (!formData.password) {
    errors.push("Password is required");
  } else if (formData.password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (formData.password !== formData.confirmPassword) {
    errors.push("Passwords do not match");
  }

  return {
    success: errors.length === 0,
    errors: errors
  };
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Returns true if email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Shows a message to the user
 * @param {string} message - Message to display
 * @param {string} type - Type of message (success, error, warning)
 */
function showMessage(message, type = 'info') {
  // Remove existing message
  const existingMessage = document.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create new message element
  const messageDiv = document.createElement('div');
  messageDiv.className = `message message-${type}`;
  messageDiv.textContent = message;

  // Style the message
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    max-width: 300px;
    word-wrap: break-word;
  `;

  // Set background color based on type
  switch (type) {
    case 'success':
      messageDiv.style.backgroundColor = '#28a745';
      break;
    case 'error':
      messageDiv.style.backgroundColor = '#dc3545';
      break;
    case 'warning':
      messageDiv.style.backgroundColor = '#ffc107';
      messageDiv.style.color = '#212529';
      break;
    default:
      messageDiv.style.backgroundColor = '#17a2b8';
  }

  // Add to page
  document.body.appendChild(messageDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 5000);
}

/**
 * Handles the signup form submission
 * @param {Event} event - Form submission event
 */
async function handleSignup(event) {
  event.preventDefault();

  // Get form data
  const formData = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value,
    confirmPassword: document.getElementById('confirm-password').value
  };

  // Validate form data
  const validation = validateSignupForm(formData);
  if (!validation.success) {
    showMessage(validation.errors.join('\n'), 'error');
    return;
  }

  // Check if user already exists
  const userExists = await checkUserExists(formData.email);
  if (userExists) {
    showMessage('A user with this email already exists', 'error');
    return;
  }

  try {
    // Generate additional user info automatically
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
      showSignupSuccessMessage(); // ✅ Erfolgsmeldung mittig
      setTimeout(() => {
        window.location.href = './index.html';
      }, 2000);
    } else {
      showSignupSuccessMessage("Failed to create account"); // ❌ Fehler mittig
    }
  } catch (error) {
    showSignupSuccessMessage("An unexpected error occurred"); // ❌ Fehler mittig
    console.error('Signup error:', error);
  }

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
  const signupForm = document.querySelector('form');

  // Add form submission handler
  signupForm.addEventListener('submit', handleSignup);

  // Add input event listeners for real-time validation
  const inputs = ['name', 'email', 'password', 'confirm-password'];
  inputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    input.addEventListener('input', updateSignupButtonState);
  });

  // Add checkbox event listener
  const privacyCheckbox = document.getElementById('accept-privacy');
  privacyCheckbox.addEventListener('change', updateSignupButtonState);

  // Initial button state
  updateSignupButtonState();

  console.log('Signup form initialized successfully');
});


//Test password visible
document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");

  const passwordIcon = passwordInput.nextElementSibling; // img neben input
  const confirmPasswordIcon = confirmPasswordInput.nextElementSibling;

  const form = document.querySelector("form");

  // Fehlermeldung direkt unter dem Confirm Password Feld
  const errorMessage = document.createElement("div");
  errorMessage.className = "error-message";
  errorMessage.style.display = "none";
  errorMessage.style.color = "#FF4D4D"; // Rot wie auf der Login-Seite
  errorMessage.style.marginTop = "5px";

  confirmPasswordInput.parentNode.appendChild(errorMessage);

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

  // -----------------------------
  // Form Submission Check
  // -----------------------------
  form.addEventListener("submit", (e) => {
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (password !== confirmPassword) {
      e.preventDefault();
      errorMessage.textContent = "Your passwords don't match. Please try again.";
      errorMessage.style.display = "flex";

      // Nur das Confirm Password Feld rot markieren
      confirmPasswordInput.style.borderBottom = "1px solid #FF4D4D";

      return false;
    }

    // Reset Fehler, falls alles passt
    errorMessage.style.display = "none";
    confirmPasswordInput.style.borderBottom = "";
  });
});

/**
 * Zeigt eine zentrierte Erfolgsnachricht an, wenn der Signup erfolgreich war
 */
/**
 * Zeigt eine zentrierte Erfolgsnachricht mit Bild an
 */
function showSignupSuccessMessage() {
  const container = document.createElement("div");

  // Bild erstellen
  const img = document.createElement("img");
  img.src = "./assets/icons-signup/confirmation of reset password process.png";
  img.alt = "Signup success";
  img.style.maxWidth = "326px"; // Größe anpassen
  img.style.height = "74px";

  container.appendChild(img);

  Object.assign(container.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: "9999",
    opacity: "0",
    transition: "opacity 200ms ease-out, transform 200ms ease-out"
  });

  document.body.appendChild(container);

  // Einblenden
  setTimeout(() => {
    container.style.opacity = "1";
  }, 50);

  // Ausblenden & entfernen
  setTimeout(() => {
    container.style.opacity = "0";
    container.style.transform = "translate(-50%, -60%)";
    container.addEventListener("transitionend", () => container.remove());
  }, 1500);
}


