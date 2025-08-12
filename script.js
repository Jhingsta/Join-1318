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
   * This function fetches contact information from the Firebase database
   */
  async function loadUsers() {
    try {
      const response = await fetch(`${BASE_URL}contacts.json`);
    const data = await response.json();
    users = data;
  } catch (error) {
    console.error("Error loading users:", error);
  }
}