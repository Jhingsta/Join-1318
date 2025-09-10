const BASE_URL = "https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/";

let users = [];

function init() {
  loadUsers();
}

async function loadUsers() {
  try {
    const response = await fetch(`${BASE_URL}users.json`);
    const data = await response.json();

    if (data) {
      // Da Firebase-RTDB Objekte liefert, in ein Array umwandeln:
      users = Object.values(data);
      console.log("Users loaded successfully:", users);

      // Kontakte rendern
      const html = renderContacts(users);
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

function renderContacts(contacts) {
  // alphabetisch sortieren
  const sorted = contacts.sort((a, b) => a.name.localeCompare(b.name));

  // nach Buchstaben gruppieren
  const grouped = sorted.reduce((acc, contact) => {
    const letter = contact.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(contact);
    return acc;
  }, {});

  // HTML zusammenbauen mit for-Schleifen
  let html = "";

  for (const letter in grouped) {
    html += `
      <div class="letter-section">
        <div class="letter">${letter}</div>
        <div class="hl"></div>
      </div>
    `;

    const users = grouped[letter];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      // Eindeutige ID für jeden Kontakt basierend auf Email (da diese einzigartig sein sollte)
      const contactId = user.email.replace(/[^a-zA-Z0-9]/g, '');
      html += `
        <div class="contact" id="contact-${contactId}" onclick="showFloatingContact('${user.name}', '${user.email}', '${user.phone || ''}', '${user.color}', '${user.initials}', '${contactId}')">
          <div class="avatar" style="background-color:${user.color};">${user.initials}</div>
          <div class="contact-info">
            <div class="name">${user.name}</div>
            <div class="email">${user.email}</div>
          </div>
        </div>
      `;
    }
  }

  return html;
}

// Floating Contact

// HTML Template Generator
function generateContactTemplate(name, email, phone, color, initials) {
  return `
    <div class="floating-contact-first">
      <span>Contact Information</span>
      <button onclick="closeFloatingContact()" class="arrow-left"></button>
    </div>

    <div class="floating-contact-second">
        <div class="avatar-big" style="background-color: ${color};">${initials}</div>
        <div class="floating-contact-name">
            <div class="floating-contact-name-big">${name}</div>
            <div class="floating-contact-name-bottom">
                <div class="edit-link" onclick="showEditContactOverlay({name:'${name}', email:'${email}', phone:'${phone || ''}', color:'${color}', initials:'${initials}'})">
                    <img src="./assets/icons-contacts/edit.svg" class="icon-edit" alt="">
                    <span>Edit</span>
                </div>
                <div class="delete-link" onclick="deleteContact('${email}')">
                    <img src="./assets/icons-contacts/delete.svg" class="icon-delete" alt="">
                    <span>Delete</span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="floating-contact-third">
        <div class="floating-contact-bottom-email">
            <div class="floating-contact-bottom-title">Email</div>
            <span class="floating-contact-email">${email}</span>
        </div>
        <div class="floating-contact-bottom-phone">
            <div class="floating-contact-bottom-title">Phone</div>
            <span>${phone || 'No phone number'}</span>
        </div>
    </div>
  `;
}

// Desktop Container erstellen/finden
function createDesktopFloatingContact() {
  const rightPanel = document.getElementById('right-panel');
  
  let floatingContact = document.getElementById('floating-contact');
  if (!floatingContact) {
    rightPanel.innerHTML += '<div class="floating-contact" id="floating-contact"></div>';
    floatingContact = document.getElementById('floating-contact');
  }
  
  return floatingContact;
}

// Mobile Container erstellen/finden
function createMobileFloatingContact(name, email, phone, color, initials) {
  let mobileOverlay = document.getElementById('mobile-floating-contact-overlay');
  if (!mobileOverlay) {
    document.body.innerHTML += `
      <div id="mobile-floating-contact-overlay" class="mobile-floating-contact-overlay">
        <button class="mobile-overlay-menu-btn" onclick="openMobileContactMenu('${name}', '${email}', '${phone || ''}', '${color}', '${initials}')" aria-label="Open contact options menu"></button>
      </div>
    `;
    mobileOverlay = document.getElementById('mobile-floating-contact-overlay');
  }

  let floatingContact = mobileOverlay.querySelector('.floating-contact');
  if (!floatingContact) {
    mobileOverlay.innerHTML += '<div class="floating-contact"></div>';
    floatingContact = mobileOverlay.querySelector('.floating-contact');
  }
  
  // Mobile Overlay anzeigen
  mobileOverlay.classList.add('show');
  
  return floatingContact;
}

// Vereinheitlichte Animation
function slideInFloatingContact(floatingContactElement) {
  // Element erst komplett ausblenden und Transition temporär deaktivieren
  floatingContactElement.style.transition = 'none';
  floatingContactElement.style.transform = 'translateX(100%)';
  floatingContactElement.style.opacity = '0';
  
  // Sicherstellen dass das Element sichtbar ist
  floatingContactElement.classList.add('show');
  
  // Kurz warten, dann Animation starten
  setTimeout(() => {
    floatingContactElement.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    floatingContactElement.style.transform = 'translateX(0)';
    floatingContactElement.style.opacity = '1';
  }, 10);
}

// Hauptfunktion
function showFloatingContact(name, email, phone, color, initials, contactId) {
  // Alle anderen Kontakte deaktivieren
  const allContacts = document.querySelectorAll('.contact');
  allContacts.forEach(contact => contact.classList.remove('active'));
  
  // Aktuellen Kontakt aktivieren
  const currentContact = document.getElementById(`contact-${contactId}`);
  if (currentContact) {
    currentContact.classList.add('active');
  }

  // HTML Template generieren
  const floatingContactHtml = generateContactTemplate(name, email, phone, color, initials);

  // Container je nach Bildschirmgröße erstellen
  const floatingContact = window.innerWidth <= 768 ? createMobileFloatingContact(name, email, phone, color, initials) : createDesktopFloatingContact();

  // Inhalt setzen
  floatingContact.innerHTML = floatingContactHtml;
  
  // Animation starten
  slideInFloatingContact(floatingContact);
}

// Desktop Schließen-Funktion
function closeDesktopFloatingContact() {
  const floatingContact = document.getElementById('floating-contact');
  if (floatingContact) {
    floatingContact.classList.remove('show');
  }
  
  // Alle aktiven Kontakte deselektieren
  const allContacts = document.querySelectorAll('.contact');
  allContacts.forEach(contact => contact.classList.remove('active'));
}

// Mobile Schließen-Funktion
function closeMobileFloatingContact() {
  const mobileOverlay = document.getElementById('mobile-floating-contact-overlay');
  if (mobileOverlay) {
    mobileOverlay.classList.remove('show');
    
    // Das floating-contact Element im Mobile-Overlay auch verstecken:
    const mobileFloatingContact = mobileOverlay.querySelector('.floating-contact');
    if (mobileFloatingContact) {
      mobileFloatingContact.classList.remove('show');
    }
  }
  
  const allContacts = document.querySelectorAll('.contact');
  allContacts.forEach(contact => contact.classList.remove('active'));
}

// Universelle Schließen-Funktion
function closeFloatingContact() {
  // Je nach Bildschirmgröße entsprechende Funktion aufrufen
  if (window.innerWidth <= 768) {
    closeMobileFloatingContact();
  } else {
    closeDesktopFloatingContact();
  }
}

// Mobile Contact Menu öffnen/schließen
function openMobileContactMenu(name, email, phone, color, initials) {
  const mobileOverlay = document.getElementById('mobile-floating-contact-overlay');
  
  // Prüfen ob Menu bereits existiert
  let contactMenu = mobileOverlay.querySelector('.mobile-contact-options');
  
  if (!contactMenu) {
    // Menu erstellen falls nicht vorhanden
    mobileOverlay.innerHTML += `
    <div class="mobile-contact-options">
        <div class="mobile-edit-link" onclick="showEditContactOverlay({name:'${name}', email:'${email}', phone:'${phone || ''}', color:'${color}', initials:'${initials}'})">
            <img src="./assets/icons-contacts/edit.svg" class="icon-edit" alt="">
            <span>Edit</span>
        </div>
        <div class="mobile-delete-link" onclick="deleteContact('${email}')">
            <img src="./assets/icons-contacts/delete.svg" class="icon-delete" alt="">
            <span>Delete</span>
        </div>
    </div>
    `;
    contactMenu = mobileOverlay.querySelector('.mobile-contact-options');
    
    // Slide-in Animation starten
    setTimeout(() => {
      contactMenu.classList.add('show');
    }, 10);
    
    // Click außerhalb des Menus schließt es
    setTimeout(() => {
      document.addEventListener('click', closeMobileMenuOnOutsideClick);
    }, 100);
  } else {
    // Menu schließen falls bereits offen
    closeMobileContactMenu();
  }
}

// Mobile Contact Menu schließen
function closeMobileContactMenu() {
  const contactMenu = document.querySelector('.mobile-contact-options');
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
  const contactMenu = document.querySelector('.mobile-contact-options');
  const menuBtn = document.querySelector('.mobile-overlay-menu-btn');
  
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
  const mobileOverlay = document.getElementById('mobile-floating-contact-overlay');
  const desktopFloatingContact = document.getElementById('floating-contact'); // im right-panel
  
  if (window.innerWidth > 768) {
    // Zu Desktop gewechselt
    if (mobileOverlay) {
      const mobileFloatingContact = mobileOverlay.querySelector('.floating-contact');
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

// User löschen
async function deleteContact(email) {
  try {
    // Alle User laden um den richtigen Schlüssel zu finden
    const response = await fetch(`${BASE_URL}users.json`);
    const data = await response.json();
    
    let userKey = null;
    if (data) {
      // Finde den Firebase-Key des Users mit der entsprechenden Email
      for (const [key, user] of Object.entries(data)) {
        if (user.email === email) {
          userKey = key;
          break;
        }
      }
    }
    
    if (userKey) {
      // User mit dem gefundenen Key löschen
      const deleteResponse = await fetch(`${BASE_URL}users/${userKey}.json`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        console.log("User deleted successfully");
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
                <input id="overlay-add-email" name="email" type="email" placeholder="Email">
                <img src="./assets/icons-signup/mail.svg" alt="" class="input-icon">
              </div>
              <div class="form-group">
                <label for="overlay-add-phone" class="visually-hidden">Phone</label>
                <input id="overlay-add-phone" name="phone" type="tel" placeholder="Phone">
                <img src="./assets/icons-contacts/call.svg" alt="" class="input-icon">
              </div>
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
                        <input id="overlay-edit-email" name="email" type="email" placeholder="Email" value="${user.email}">                        
                        <img src="./assets/icons-signup/mail.svg" alt="" class="input-icon">
                    </div>

                    <div class="form-group">
                        <label for="overlay-edit-phone" class="visually-hidden">Phone</label>
                        <input id="overlay-edit-phone" name="phone" type="tel" placeholder="Phone" value="${user.phone || ''}">                        
                        <img src="./assets/icons-contacts/call.svg" alt="" class="input-icon">
                    </div>
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
  const addOverlay = document.getElementById('overlay-add-contact');
  const editOverlay = document.getElementById('overlay-edit-contact');
  
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

async function createContact() {
  // Get form data
  const formData = {
    name: document.getElementById('overlay-add-name').value.trim(),
    email: document.getElementById('overlay-add-email').value.trim(),
    phone: document.getElementById('overlay-add-phone').value.trim()
  };
  
  // Minimale Validierung  
  if (!formData.name.trim() || !formData.email.trim()) {
    return; // Einfach abbrechen bei fehlenden Pflichtfeldern
  }
  
  // Email-Format prüfen
  if (!isValidEmail(formData.email)) {
    return; // Einfach abbrechen bei ungültiger Email
  }
  
  // Check if contact already exists
  const contactExists = await checkUserExists(formData.email);
  if (contactExists) {
    return; // Einfach abbrechen wenn Kontakt bereits existiert
  }
  
  try {
    // Generate additional contact info automatically
    const userInitials = getInitials(formData.name);
    const userColor = getColorFromName(formData.name);
    
    // Create contact data object
    const userData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: "", // Placeholder, not used for contacts
      initials: userInitials,
      color: userColor
    };
    
    // Create contact in Firebase
    const result = await createUser(userData);
    
    if (result.success) {
      // Kontakte neu laden und Overlay schließen
      await loadUsers();
      closeContactOverlay();

      // Erfolgsmeldung anzeigen
      showCreateSuccessMessage();
    }
  } catch (error) {
    console.error('Create contact error:', error);
  }
}

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
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Returns true if email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateContactForm(formData) {
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
  
  return {
    success: errors.length === 0,
    errors: errors
  };
}

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

async function updateContact(originalEmail, originalColor) {
  // Get form data
  const formData = {
    name: document.getElementById('overlay-edit-name').value.trim(),
    email: document.getElementById('overlay-edit-email').value.trim(),
    phone: document.getElementById('overlay-edit-phone').value.trim()
  };
  
  // Minimale Validierung ohne showMessage
  if (!formData.name.trim() || !formData.email.trim()) {
    return; // Einfach abbrechen bei fehlenden Pflichtfeldern
  }
  
  // Email-Format prüfen
  if (!isValidEmail(formData.email)) {
    return; // Einfach abbrechen bei ungültiger Email
  }
  
  // Wenn Email geändert wurde, prüfen ob neue Email bereits existiert
  if (formData.email !== originalEmail) {
    const emailExists = await checkUserExists(formData.email);
    if (emailExists) {
      return; // Einfach abbrechen wenn neue Email bereits existiert
    }
  }
  
  try {
    // Alle User laden um den richtigen Firebase-Key zu finden
    const response = await fetch(`${BASE_URL}users.json`);
    const data = await response.json();
    
    let userKey = null;
    if (data) {
      // Finde den Firebase-Key des Users mit der ursprünglichen Email
      for (const [key, user] of Object.entries(data)) {
        if (user.email === originalEmail) {
          userKey = key;
          break;
        }
      }
    }
    
    if (userKey) {
      // Neue Initialen und Farbe generieren falls Name geändert wurde
      const userInitials = getInitials(formData.name);
      
      // Update-Daten zusammenstellen (nur geänderte Felder)
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        initials: userInitials,
        color: originalColor // die Farbe bleibt gleich
      };
      
      // User mit PUT aktualisieren
      const updateResponse = await fetch(`${BASE_URL}users/${userKey}.json`, {
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
        console.error("Failed to update contact:", updateResponse.status);
      }
    } else {
      console.error("Contact not found");
    }
  } catch (error) {
    console.error('Update contact error:', error);
  }
}

// Erfolgsmeldung-Funktion
function showCreateSuccessMessage() {
  const messageHtml = `
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
  
  const container = document.getElementById('success-message-container');
  
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