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
        
        // Store complete user info in localStorage
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