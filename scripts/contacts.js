const BASE_URL = "https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/";

let users = [];

/**
 * Initializes the contacts module by loading user data.
 */
function init() {
  loadUsers();
}

/**
 * Asynchronously loads user data from a JSON file and renders the contacts list.
 * Fetches user data from the specified BASE_URL, parses it, and updates the DOM.
 */
async function loadUsers() {
  try {
    let response = await fetch(`${BASE_URL}users.json`);
    let data = await response.json();

    if (data) {
      users = Object.values(data);
      let html = renderContacts(users);
      document.getElementById("contacts-list").innerHTML = html;
    } else {
      console.log("No users found in database");
      users = [];
    }
  } catch (error) {
    console.error("Error loading users:", error);
    users = [];
  }
}

/**
 * Renders a list of contacts grouped alphabetically by the first letter of their names.
 * Contacts are sorted by name before grouping.
 *
 * @param {Array<Object>} contacts - Array of contact objects, each with a 'name' property.
 */
function renderContacts(contacts) {
  let sorted = contacts.sort((a, b) => a.name.localeCompare(b.name));

  let grouped = sorted.reduce((acc, contact) => {
    let letter = contact.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(contact);
    return acc;
  }, {});
  let html = "";
  for (let letter in grouped) {
    html += getLetterSectionTemplate(letter);
    html += renderContactList(grouped[letter]);
  }
  return html;
}

/**
 * Generates an HTML string representing a list of contacts.
 *
 * @param {Array<Object>} users - Array of user objects to render as contacts.
 */
function renderContactList(users) {
  return users.map(user => getContactTemplate(user)).join("");
}

/**
 * Creates and returns a floating contact element within the right panel on desktop.
 */
function createDesktopFloatingContact() {
  let rightPanel = document.getElementById('right-panel');
  
  let floatingContact = document.getElementById('floating-contact');
  if (!floatingContact) {
    rightPanel.innerHTML += '<div class="floating-contact" id="floating-contact"></div>';
    floatingContact = document.getElementById('floating-contact');
  }
  return floatingContact;
}

/**
 * Creates and displays a mobile floating contact overlay with contact information.
 * 
 * @param {string} name - The contact's full name
 * @param {string} email - The contact's email address
 * @param {string} phone - The contact's phone number
 * @param {string} color - The color for the contact's avatar/badge
 * @param {string} initials - The contact's initials for display
 */
function createMobileFloatingContact(name, email, phone, color, initials) {
  const mobileOverlay = getOrCreateMobileOverlay(name, email, phone, color, initials);
  const floatingContact = ensureFloatingContactElement(mobileOverlay);

  mobileOverlay.classList.add('show');
  document.body.classList.add('no-scroll');
  
  return floatingContact;
}

/**
 * Gets an existing mobile overlay or creates a new one with the provided contact data.
 * 
 * @param {string} name - The contact's full name
 * @param {string} email - The contact's email address
 * @param {string} phone - The contact's phone number
 * @param {string} color - The color for the contact's avatar/badge
 * @param {string} initials - The contact's initials for display
 */
function getOrCreateMobileOverlay(name, email, phone, color, initials) {
  let mobileOverlay = document.getElementById('mobile-floating-contact');

  if (!mobileOverlay) {
    document.body.innerHTML += getMobileOverlayTemplate(name, email, phone, color, initials);
    mobileOverlay = document.getElementById('mobile-floating-contact');
  } else {
    updateMobileMenuButton(mobileOverlay, name, email, phone, color, initials);
  }
  return mobileOverlay;
}

/**
 * Ensures that a floating contact element exists within the given mobile overlay.
 *
 * @param {HTMLElement} mobileOverlay - The container element to search for or append the floating contact.
 */
function ensureFloatingContactElement(mobileOverlay) {
  let floatingContact = mobileOverlay.querySelector('.floating-contact');
  
  if (!floatingContact) {
    mobileOverlay.innerHTML += '<div class="floating-contact"></div>';
    floatingContact = mobileOverlay.querySelector('.floating-contact');
  }
  
  return floatingContact;
}

/**
 * Updates the mobile menu button's onclick attribute to open the contact menu with the provided contact details.
 *
 * @param {HTMLElement} mobileOverlay - The overlay element containing the mobile menu button.
 * @param {string} name - The contact's name.
 * @param {string} email - The contact's email address.
 * @param {string} phone - The contact's phone number (optional).
 * @param {string} color - The color associated with the contact.
 * @param {string} initials - The contact's initials.
 */
function updateMobileMenuButton(mobileOverlay, name, email, phone, color, initials) {
  const menuBtn = mobileOverlay.querySelector('.mobile-overlay-menu-btn');
  if (menuBtn) {
    menuBtn.setAttribute('onclick', `openMobileContactMenu('${name}', '${email}', '${phone || ''}', '${color}', '${initials}')`);
  }
}

/**
 * Animates a floating contact element by sliding it in from the right and fading it in.
 *
 * @param {HTMLElement} floatingContactElement - The DOM element representing the floating contact to animate.
 */
function slideInFloatingContact(floatingContactElement) {
  floatingContactElement.style.transition = 'none';
  floatingContactElement.style.transform = 'translateX(100%)';
  floatingContactElement.style.opacity = '0';
  floatingContactElement.classList.add('show');
  
  setTimeout(() => {
    floatingContactElement.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    floatingContactElement.style.transform = 'translateX(0)';
    floatingContactElement.style.opacity = '1';
  }, 10);
}

/**
 * Displays a floating contact card for the selected contact.
 *
 * @param {string} name - The name of the contact.
 * @param {string} email - The email address of the contact.
 * @param {string} phone - The phone number of the contact.
 * @param {string} color - The color associated with the contact.
 * @param {string} initials - The initials of the contact.
 * @param {number|string} contactId - The unique identifier of the contact.
 */
function showFloatingContact(name, email, phone, color, initials, contactId) {
  let allContacts = document.querySelectorAll('.contact');
  allContacts.forEach(contact => contact.classList.remove('active'));
  let currentContact = document.getElementById(`contact-${contactId}`);
  if (currentContact) {
    currentContact.classList.add('active');
  }
  let floatingContactHtml = getFloatingContactTemplate(name, email, phone, color, initials);
  let floatingContact = window.innerWidth <= 768 ? createMobileFloatingContact(name, email, phone, color, initials) : createDesktopFloatingContact();
  floatingContact.innerHTML = floatingContactHtml;
  
  slideInFloatingContact(floatingContact);
}

/**
 * Closes the floating contact element on desktop view by removing the 'show' class
 * from the element with ID 'floating-contact', and removes the 'active' class from all contact elements.
 */
function closeDesktopFloatingContact() {
  let floatingContact = document.getElementById('floating-contact');
  if (floatingContact) {
    floatingContact.classList.remove('show');
  }
  
  let allContacts = document.querySelectorAll('.contact');
  allContacts.forEach(contact => contact.classList.remove('active'));
}

/**
 * Closes the mobile floating contact overlay by removing relevant CSS classes.
 */
function closeMobileFloatingContact() {
  let mobileOverlay = document.getElementById('mobile-floating-contact');
  if (mobileOverlay) {
    mobileOverlay.classList.remove('show');
    document.body.classList.remove('no-scroll');
    
    let mobileFloatingContact = mobileOverlay.querySelector('.floating-contact');
    if (mobileFloatingContact) {
      mobileFloatingContact.classList.remove('show');
    }
  }
  let allContacts = document.querySelectorAll('.contact');
  allContacts.forEach(contact => contact.classList.remove('active'));
}

/**
 * Closes the floating contact panel based on the current window width.
 */
function closeFloatingContact() {
  if (window.innerWidth <= 768) {
    closeMobileFloatingContact();
  } else {
    closeDesktopFloatingContact();
  }
}

/**
 * Opens the mobile contact options menu for a specific contact.
 * 
 * @param {string} name - The name of the contact.
 * @param {string} email - The email address of the contact.
 * @param {string} phone - The phone number of the contact.
 * @param {string} color - The color associated with the contact (e.g., for avatar background).
 * @param {string} initials - The initials of the contact to display in the avatar.
 */
function openMobileContactMenu(name, email, phone, color, initials) {
  const mobileOverlay = document.getElementById('mobile-floating-contact');
  let contactMenu = mobileOverlay.querySelector('.mobile-contact-options');

  if (!contactMenu) {
    createMobileContactMenu(mobileOverlay, name, email, phone, color, initials);
  } else {
    updateMobileContactMenu(contactMenu, name, email, phone, color, initials);
    closeMobileContactMenu();
  }
}

/**
 * Creates and displays a mobile contact menu overlay with the provided contact details.
 *
 * @param {HTMLElement} mobileOverlay - The overlay element where the contact menu will be rendered.
 * @param {string} name - The name of the contact.
 * @param {string} email - The email address of the contact.
 * @param {string} phone - The phone number of the contact.
 * @param {string} color - The color associated with the contact (e.g., for avatar background).
 * @param {string} initials - The initials of the contact to display in the avatar.
 */
function createMobileContactMenu(mobileOverlay, name, email, phone, color, initials) {
  mobileOverlay.innerHTML += getMobileContactMenuTemplate(name, email, phone, color, initials);
  const contactMenu = mobileOverlay.querySelector('.mobile-contact-options');

  setTimeout(() => contactMenu.classList.add('show'), 10);
  setTimeout(() => document.addEventListener('click', closeMobileMenuOnOutsideClick), 100);
}

/**
 * Updates the mobile contact menu with edit and delete actions for a contact.
 *
 * @param {HTMLElement} contactMenu - The DOM element representing the contact menu.
 * @param {string} name - The contact's name.
 * @param {string} email - The contact's email address.
 * @param {string} phone - The contact's phone number.
 * @param {string} color - The color associated with the contact.
 * @param {string} initials - The contact's initials.
 */
function updateMobileContactMenu(contactMenu, name, email, phone, color, initials) {
  const editLink = contactMenu.querySelector('.mobile-edit-link');
  if (editLink) {
    editLink.setAttribute('onclick', `showEditContactOverlay({name:'${name}', email:'${email}', phone:'${phone || ''}', color:'${color}', initials:'${initials}'})`);
  }
  const deleteLink = contactMenu.querySelector('.mobile-delete-link');
  if (deleteLink) {
    deleteLink.setAttribute('onclick', `deleteContact('${email}')`);
  }
}

// Mobile Contact Menu schließen
function closeMobileContactMenu() {
  let contactMenu = document.querySelector('.mobile-contact-options');
  if (contactMenu) {
    contactMenu.classList.remove('show');
    
    // Element nach Animation entfernen
    setTimeout(() => {
      if (contactMenu && contactMenu.parentNode) {
        contactMenu.remove();
      }
      document.removeEventListener('click', closeMobileMenuOnOutsideClick);
    }, 300);
  }
}

function closeMobileMenuOnOutsideClick(event) {
  let contactMenu = document.querySelector('.mobile-contact-options');
  let menuBtn = document.querySelector('.mobile-overlay-menu-btn');
  
  // Prüft ob Klick weder auf Menu noch auf Button war
  if (contactMenu && 
      !contactMenu.contains(event.target) && 
      !menuBtn.contains(event.target)) {
    closeMobileContactMenu();
  }
}

function editContact() {
  closeMobileContactMenu();
}

function deleteContact() {
  closeMobileContactMenu();
}

// Window resize listener
window.addEventListener('resize', function() {
  let mobileOverlay = document.getElementById('mobile-floating-contact');
  let desktopFloatingContact = document.getElementById('floating-contact'); // im right-panel
  
  if (window.innerWidth > 768) {
    // Zu Desktop gewechselt
    if (mobileOverlay) {
      let mobileFloatingContact = mobileOverlay.querySelector('.floating-contact');
      if (mobileFloatingContact && mobileFloatingContact.classList.contains('show')) {
        closeMobileFloatingContact();
      }
    }
  } else {
    // Zu Mobile gewechselt  
    if (desktopFloatingContact && desktopFloatingContact.classList.contains('show')) {
      closeDesktopFloatingContact();
    }
  }
});

// User löschen und aus allen Tasks entfernen
async function deleteContact(email) {
  try {
    // Alle User laden um den richtigen Schlüssel zu finden
    let response = await fetch(`${BASE_URL}users.json`);
    let data = await response.json();
    
    let userKey = null;
    if (data) {
      // Finde den Firebase-Key des Users mit der entsprechenden Email
      for (let [key, user] of Object.entries(data)) {
        if (user.email === email) {
          userKey = key;
          break;
        }
      }
    }
    
    if (userKey) {
      // User mit dem gefundenen Key löschen
      let deleteResponse = await fetch(`${BASE_URL}users/${userKey}.json`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        console.log("User deleted successfully");
        
        // User auch aus allen Tasks entfernen
        await removeUserFromAllTasks(userKey);
        
        // Panel schließen und Liste neu laden
        closeFloatingContact();
        closeContactOverlay();
        loadUsers();
      } else {
        console.error("Failed to delete user:", deleteResponse.status);
      }
    } else {
      console.error("User not found");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
  }
}

// Hilfsfunktion: User aus allen Tasks entfernen
async function removeUserFromAllTasks(userKey) {
  try {
    // Alle Tasks laden
    let tasks = await loadTasks();
    
    // Durch alle Tasks gehen und prüfen, ob der User zugewiesen ist
    for (let task of tasks) {
      if (task.assignedUsersFull && task.assignedUsersFull.length > 0) {
        // Prüfen, ob der zu löschende User in dieser Task ist
        let originalLength = task.assignedUsersFull.length;
        
        // User aus assignedUsersFull Array entfernen
        task.assignedUsersFull = task.assignedUsersFull.filter(user => user.id !== userKey);
        
        // Nur updaten wenn sich etwas geändert hat
        if (task.assignedUsersFull.length !== originalLength) {
          await updateTask(task.id, {
            assignedUsersFull: task.assignedUsersFull
          });
          console.log(`User removed from task: ${task.title || task.id}`);
        }
      }
    }
    
    console.log("User removed from all tasks successfully");
  } catch (error) {
    console.error("Error removing user from tasks:", error);
  }
}

// Add Contact Overlay HTML rendern
function renderAddContactOverlay() {
  return `
      <div class="overlay-add-contact" id="overlay-add-contact">
        <div class="overlay-add-contact-top">
          <button class="overlay-close-button" onclick="closeContactOverlay()" aria-label="Close window">
            <svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.0001 17.8642L9.46673 24.389C9.22229 24.6331 8.91118 24.7552 8.5334 24.7552C8.15562 24.7552 7.84451 24.6331 7.60007 24.389C7.35562 24.1449 7.2334 23.8342 7.2334 23.4569C7.2334 23.0796 7.35562 22.7689 7.60007 22.5248L14.1334 16L7.60007 9.47527C7.35562 9.23115 7.2334 8.92045 7.2334 8.54316C7.2334 8.16588 7.35562 7.85518 7.60007 7.61106C7.84451 7.36693 8.15562 7.24487 8.5334 7.24487C8.91118 7.24487 9.22229 7.36693 9.46673 7.61106L16.0001 14.1358L22.5334 7.61106C22.7778 7.36693 23.089 7.24487 23.4667 7.24487C23.8445 7.24487 24.1556 7.36693 24.4001 7.61106C24.6445 7.85518 24.7667 8.16588 24.7667 8.54316C24.7667 8.92045 24.6445 9.23115 24.4001 9.47527L17.8667 16L24.4001 22.5248C24.6445 22.7689 24.7667 23.0796 24.7667 23.4569C24.7667 23.8342 24.6445 24.1449 24.4001 24.389C24.1556 24.6331 23.8445 24.7552 23.4667 24.7552C23.089 24.7552 22.7778 24.6331 22.5334 24.389L16.0001 17.8642Z" fill="white"/>
            </svg>
          </button>

          <div class="overlay-contact-top-box">
            <img src="./assets/icons-header/logo-all-white.svg" alt="" class="icon-logo">
            <div class="overlay-contact-top-box-title">Add contact</div>
            <div class="overlay-add-contact-top-box-subtitle">Tasks are better with a team!</div>
          </div>
        </div>

        <div class="overlay-contact-bottom">
          <div class="overlay-contact-userbox">
            <div class="avatar-big-placeholder">
              <img src="./assets/icons-contacts/person-white.svg" alt="" class="icon-avatar-placeholder">
            </div>

            <div class="overlay-contact-form" aria-label="Add contact form">
              <div class="form-group">
                <label for="overlay-add-name" class="visually-hidden">Name</label>
                <input id="overlay-add-name" name="name" type="text" placeholder="Name">
                <img src="./assets/icons-signup/person.svg" alt="" class="input-icon">
              </div>

              <div class="form-group">
                <label for="overlay-add-email" class="visually-hidden">Email</label>
                <input id="overlay-add-email" name="email" type="text" placeholder="Email">
                <img src="./assets/icons-signup/mail.svg" alt="" class="input-icon">
              </div>

              <div class="form-group">
                <label for="overlay-add-phone" class="visually-hidden">Phone</label>
                <input id="overlay-add-phone" name="phone" type="text" placeholder="Phone">
                <img src="./assets/icons-contacts/call.svg" alt="" class="input-icon">
              </div>

              <div class="error-message"></div>
            </div>

            <div class="buttons-container">
              <button class="cancel-btn" onclick="closeContactOverlay()">
                Cancel<img src="./assets/icons-contacts/cancel.png" alt="">
              </button>
              <button class="create-btn" onclick="createContact()">
                Create contact
                <img src="./assets/icons-contacts/check.png" alt="">
              </button>
            </div>
          </div>
        </div>
      </div>
  `;
}

// Edit Contact Overlay HTML rendern
function renderEditContactOverlay(user) {
  return `
    <div class="overlay-edit-contact" id="overlay-edit-contact">
        <div class="overlay-edit-contact-top">
            <button class="overlay-close-button" onclick="closeContactOverlay()" aria-label="Close window">
                <svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.0001 17.8642L9.46673 24.389C9.22229 24.6331 8.91118 24.7552 8.5334 24.7552C8.15562 24.7552 7.84451 24.6331 7.60007 24.389C7.35562 24.1449 7.2334 23.8342 7.2334 23.4569C7.2334 23.0796 7.35562 22.7689 7.60007 22.5248L14.1334 16L7.60007 9.47527C7.35562 9.23115 7.2334 8.92045 7.2334 8.54316C7.2334 8.16588 7.35562 7.85518 7.60007 7.61106C7.84451 7.36693 8.15562 7.24487 8.5334 7.24487C8.91118 7.24487 9.22229 7.36693 9.46673 7.61106L16.0001 14.1358L22.5334 7.61106C22.7778 7.36693 23.089 7.24487 23.4667 7.24487C23.8445 7.24487 24.1556 7.36693 24.4001 7.61106C24.6445 7.85518 24.7667 8.16588 24.7667 8.54316C24.7667 8.92045 24.6445 9.23115 24.4001 9.47527L17.8667 16L24.4001 22.5248C24.6445 22.7689 24.7667 23.0796 24.7667 23.4569C24.7667 23.8342 24.6445 24.1449 24.4001 24.389C24.1556 24.6331 23.8445 24.7552 23.4667 24.7552C23.089 24.7552 22.7778 24.6331 22.5334 24.389L16.0001 17.8642Z" fill="white"/>
                </svg>
            </button>

            <div class="overlay-contact-top-box">
                <img src="./assets/icons-header/logo-all-white.svg" alt="" class="icon-logo">
                <div class="overlay-contact-top-box-title">Edit contact</div>
                <div class="overlay-add-contact-top-box-subtitle">Tasks are better with a team!</div>
            </div>
        </div>

        <div class="overlay-contact-bottom">
            <div class="overlay-contact-userbox">
                <div class="avatar-big" style="background-color: ${user.color};">${user.initials}</div>

                <div class="overlay-contact-form" aria-label="Edit contact form">
                    <div class="form-group">
                        <label for="overlay-edit-name" class="visually-hidden">Name</label>
                        <input id="overlay-edit-name" name="name" type="text" placeholder="Name" value="${user.name}">
                        <img src="./assets/icons-signup/person.svg" alt="" class="input-icon">
                    </div>

                    <div class="form-group">
                        <label for="overlay-edit-email" class="visually-hidden">Email</label>
                        <input id="overlay-edit-email" name="email" type="text" placeholder="Email" value="${user.email}">                        
                        <img src="./assets/icons-signup/mail.svg" alt="" class="input-icon">
                    </div>

                    <div class="form-group">
                        <label for="overlay-edit-phone" class="visually-hidden">Phone</label>
                        <input id="overlay-edit-phone" name="phone" type="text" placeholder="Phone" value="${user.phone || ''}">                        
                        <img src="./assets/icons-contacts/call.svg" alt="" class="input-icon">
                    </div>

                    <div class="error-message"></div>
                </div>

                <div class="buttons-container">
                    <button class="delete-btn" onclick="deleteContact('${user.email}')">Delete</button>
                    <button class="save-btn" onclick="updateContact('${user.email}', '${user.color}')"><span class="save-btn-text">Save</span>
                    <img src="./assets/icons-contacts/check.png" alt=""></button>
                </div>
            </div>
        </div>
    </div>
  `;
}

function showAddContactOverlay() {
  // Overlay-HTML rendern
  document.getElementById('overlay-add-contact-container').innerHTML = renderAddContactOverlay();
  
  // Backdrop anzeigen
  document.getElementById('overlay-contacts').classList.add('show');
  
  // Body-Scroll deaktivieren
  document.body.classList.add('no-scroll');
  
  // Overlay einsliden (kleiner Delay für smooth Animation)
  setTimeout(() => {
      document.getElementById('overlay-add-contact').classList.add('show');
  }, 10);
}

function showEditContactOverlay(userData) {
  // Overlay-HTML rendern
  document.getElementById('overlay-edit-contact-container').innerHTML = renderEditContactOverlay(userData);
  
  // Backdrop anzeigen
  document.getElementById('overlay-contacts').classList.add('show');
  
  // Body-Scroll deaktivieren
  document.body.classList.add('no-scroll');
  
  // Overlay einsliden (kleiner Delay für smooth Animation)
  setTimeout(() => {
      document.getElementById('overlay-edit-contact').classList.add('show');
  }, 10);
}

function closeContactOverlay() {
  // Prüfen welches Overlay aktiv ist und entsprechend schließen
  let addOverlay = document.getElementById('overlay-add-contact');
  let editOverlay = document.getElementById('overlay-edit-contact');
  
  if (addOverlay && addOverlay.classList.contains('show')) {
    addOverlay.classList.remove('show');
    setTimeout(() => {
      document.getElementById('overlay-contacts').classList.remove('show');
      document.getElementById('overlay-add-contact-container').innerHTML = '';
      // Body-Scroll wieder aktivieren
      document.body.classList.remove('no-scroll');
    }, 300);
  }
  
  if (editOverlay && editOverlay.classList.contains('show')) {
    editOverlay.classList.remove('show');
    setTimeout(() => {
      document.getElementById('overlay-contacts').classList.remove('show');
      document.getElementById('overlay-edit-contact-container').innerHTML = '';
      // Body-Scroll wieder aktivieren
      document.body.classList.remove('no-scroll');
    }, 300);
  }
}

async function handleContactValidation(isEdit = false, originalEmail = null) {
  // Form data sammeln basierend auf Edit/Add Modus
  let nameId = isEdit ? 'overlay-edit-name' : 'overlay-add-name';
  let emailId = isEdit ? 'overlay-edit-email' : 'overlay-add-email';
  let phoneId = isEdit ? 'overlay-edit-phone' : 'overlay-add-phone';
  
  let formData = {
    name: document.getElementById(nameId).value.trim(),
    email: document.getElementById(emailId).value.trim(),
    phone: document.getElementById(phoneId).value.trim()
  };

  // Form groups für error styling
  let nameGroup = document.getElementById(nameId).closest('.form-group');
  let emailGroup = document.getElementById(emailId).closest('.form-group');
  let phoneGroup = document.getElementById(phoneId).closest('.form-group');
  let errorMessage = document.querySelector('.error-message');

  // Reset previous errors
  [nameGroup, emailGroup, phoneGroup].forEach(group => {
    group.classList.remove("input-error");
  });
  errorMessage.classList.remove("show");
  errorMessage.textContent = "";

  // Basic form validation
  let validation = validateContactForm(formData);
  if (!validation.success) {
    errorMessage.textContent = validation.errors[0]; // Erste Fehlermeldung anzeigen
    errorMessage.classList.add("show");
    
    // Error styling basierend auf Fehlertyp
    if (validation.errors[0].includes("Name")) {
      nameGroup.classList.add("input-error");
    } else if (validation.errors[0].includes("Email is required")) {
      emailGroup.classList.add("input-error");
    } else if (validation.errors[0].includes("valid email")) {
      emailGroup.classList.add("input-error");
    } else if (validation.errors[0].includes("phone")) {
      phoneGroup.classList.add("input-error");
    }
    return null; // Validation failed
  }

  // Check if email already exists (außer bei Edit mit unveränderter Email)
  if (!isEdit || (isEdit && formData.email !== originalEmail)) {
    let emailExists = await checkUserExists(formData.email);
    if (emailExists) {
      errorMessage.textContent = "A user with this email address already exists.";
      errorMessage.classList.add("show");
      emailGroup.classList.add("input-error");
      return null; // Email exists
    }
  }

  return formData; // Validation successful, return form data
}

async function createContact() {
  // Validation durchführen
  let validatedData = await handleContactValidation(false);
  if (!validatedData) {
    return; // Validation failed, stop here
  }

  try {
    // Generate additional contact info automatically
    let userInitials = getInitials(validatedData.name);
    let userColor = getColorFromName(validatedData.name);
    
    // Create contact data object
    let userData = {
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      password: "", // Placeholder, not used for contacts
      initials: userInitials,
      color: userColor
    };
    
    // Create contact in Firebase
    let result = await createUser(userData);
    
    if (result.success) {
      // Kontakte neu laden und Overlay schließen
      await loadUsers();
      closeContactOverlay();

      // Erfolgsmeldung anzeigen
      showCreateSuccessMessage();
    } else {
      // Server-Fehler anzeigen
      let errorMessage = document.querySelector('.error-message');
      errorMessage.textContent = "Failed to create contact. Please try again.";
      errorMessage.classList.add("show");
    }
  } catch (error) {
    console.error('Create contact error:', error);
    let errorMessage = document.querySelector('.error-message');
    errorMessage.textContent = "An unexpected error occurred. Please try again.";
    errorMessage.classList.add("show");
  }
}

async function createUser(userData) {
  try {
    console.log("Creating new user:", userData);
    
    let response = await fetch(`${BASE_URL}users.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    if (response.ok) {
      let result = await response.json();
      console.log("User created successfully:", result);
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
 * Generates initials from a user's name
 * @param {string} name - The user's full name
 * @returns {string} - The user's initials (max 2 characters)
 */
function getInitials(name) {
    if (!name) return "";
    let parts = name.trim().split(" ");
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
    let hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
}

function isValidPhone(phone) {
  if (!phone) return true; // Phone ist optional
  
  // Erlaubt: Zahlen, Leerzeichen, Bindestriche, Plus
  // Mindestens 6, höchstens 15 Ziffern
  let phoneRegex = /^[\+\-\s\d]+$/;
  let digitsOnly = phone.replace(/[\+\-\s]/g, '');
  
  return phoneRegex.test(phone) && digitsOnly.length >= 6 && digitsOnly.length <= 15;
}

function isValidEmailBrowser(email) {
  let input = document.createElement('input');
  input.type = 'email';
  input.value = email;
  return input.validity.valid;
}

function validateContactForm(formData) {
  let errors = [];
  
  // Name validation
  if (!formData.name.trim()) {
    errors.push("Name is required.");
  }
  
  // Email validation
  if (!formData.email.trim()) {
    errors.push("Email is required.");
  } else if (!isValidEmailBrowser(formData.email)) {
    errors.push("Please enter a valid email address.");
  }
  
  // Phone validation (optional, but if provided must be valid)
  if (formData.phone.trim() && !isValidPhone(formData.phone)) {
    errors.push("Please enter a valid phone number.");
  }
  
  return {
    success: errors.length === 0,
    errors: errors
  };
}

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

async function updateContact(originalEmail, originalColor) {
  // Validation durchführen
  let validatedData = await handleContactValidation(true, originalEmail);
  if (!validatedData) {
    return; // Validation failed, stop here
  }

  try {
    // Alle User laden um den richtigen Firebase-Key zu finden
    let response = await fetch(`${BASE_URL}users.json`);
    let data = await response.json();
    
    let userKey = null;
    if (data) {
      // Finde den Firebase-Key des Users mit der ursprünglichen Email
      for (let [key, user] of Object.entries(data)) {
        if (user.email === originalEmail) {
          userKey = key;
          break;
        }
      }
    }
    
    if (userKey) {
      // Neue Initialen generieren falls Name geändert wurde
      let userInitials = getInitials(validatedData.name);
      
      // Update-Daten zusammenstellen
      let updateData = {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        initials: userInitials,
        color: originalColor // die Farbe bleibt gleich
      };
      
      // User mit PUT aktualisieren
      let updateResponse = await fetch(`${BASE_URL}users/${userKey}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      if (updateResponse.ok) {
        console.log("Contact updated successfully");
        // Kontakte neu laden und Overlays schließen
        await loadUsers();
        closeFloatingContact();
        closeContactOverlay();
      } else {
        // Server-Fehler anzeigen
        let errorMessage = document.querySelector('.error-message');
        errorMessage.textContent = "Failed to update contact. Please try again.";
        errorMessage.classList.add("show");
      }
    } else {
      let errorMessage = document.querySelector('.error-message');
      errorMessage.textContent = "Contact not found. Please try again.";
      errorMessage.classList.add("show");
    }
  } catch (error) {
    console.error('Update contact error:', error);
    let errorMessage = document.querySelector('.error-message');
    errorMessage.textContent = "An unexpected error occurred. Please try again.";
    errorMessage.classList.add("show");
  }
}

// Erfolgsmeldung-Funktion
function showCreateSuccessMessage() {
  let messageHtml = `
    <div style="
      color: #FFFFFF; 
      font-size: 23px; 
      font-weight: 400; 
      text-align: center; 
      padding: 23px 17px; 
      background-color: #4589FF; 
      border-radius: 20px; 
      box-shadow: 0px 0px 4px 0px #0000001A;
    ">
      Contact successfully created
    </div>
  `;
  
  // Container in Body einfügen
  document.body.innerHTML += `
    <div id="success-message-container" style="
      position: fixed;
      top: 110%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      transition: top 400ms ease-out;
    ">
      ${messageHtml}
    </div>
  `;
  
  let container = document.getElementById('success-message-container');
  
  // Nach 200ms delay: Von unten in die Mitte sliden
  setTimeout(() => {
    container.style.top = "50%";
  }, 200);
  
  // Wieder nach unten sliden und entfernen
  setTimeout(() => {
    container.style.top = "110%";
    
    // Entfernen nach Slide-Animation (400ms + etwas Buffer)
    setTimeout(() => {
      if (document.getElementById('success-message-container')) {
        document.getElementById('success-message-container').remove();
      }
    }, 500);
  }, 1500); // 1500ms Anzeigedauer
}