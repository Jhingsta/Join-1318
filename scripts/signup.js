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
  
  // Show loading state
  const submitButton = event.target.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Creating account...';
  submitButton.disabled = true;
  
  try {
    // Create user data object (without confirmPassword)
    const userData = {
      name: formData.name,
      email: formData.email,
      phone: "", // Empty phone field for future use
      password: formData.password
    };
    
    // Create user in Firebase
    const result = await createUser(userData);
    
    if (result.success) {
      showMessage('Account created successfully! Redirecting to login...', 'success');
      
      // Store user info in localStorage (optional)
      localStorage.setItem('newUser', JSON.stringify({
        name: formData.name,
        email: formData.email
      }));
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = './index.html';
      }, 2000);
    } else {
      showMessage(`Failed to create account: ${result.error}`, 'error');
    }
  } catch (error) {
    showMessage('An unexpected error occurred', 'error');
    console.error('Signup error:', error);
  } finally {
    // Restore button state
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
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
