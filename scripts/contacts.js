const BASE_URL = "https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/";

let users = [];

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
  let mobileOverlay = getOrCreateMobileOverlay(name, email, phone, color, initials);
  let floatingContact = ensureFloatingContactElement(mobileOverlay);

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
  let menuBtn = mobileOverlay.querySelector('.mobile-overlay-menu-btn');
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
  let mobileOverlay = document.getElementById('mobile-floating-contact');
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
  let contactMenu = mobileOverlay.querySelector('.mobile-contact-options');

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
  let editLink = contactMenu.querySelector('.mobile-edit-link');
  if (editLink) {
    editLink.setAttribute('onclick', `showEditContactOverlay({name:'${name}', email:'${email}', phone:'${phone || ''}', color:'${color}', initials:'${initials}'})`);
  }
  let deleteLink = contactMenu.querySelector('.mobile-delete-link');
  if (deleteLink) {
    deleteLink.setAttribute('onclick', `deleteContact('${email}')`);
  }
}

/**
 * Closes the mobile contact menu by removing the 'show' class and then removing the menu element from the DOM after a delay.
 * Also removes the event listener for outside clicks.
 */
function closeMobileContactMenu() {
  let contactMenu = document.querySelector('.mobile-contact-options');
  if (contactMenu) {
    contactMenu.classList.remove('show');
    
    setTimeout(() => {
      if (contactMenu && contactMenu.parentNode) {
        contactMenu.remove();
      }
      document.removeEventListener('click', closeMobileMenuOnOutsideClick);
    }, 300);
  }
}

/**
 * Closes the mobile contact menu when a click occurs outside of the menu or its button.
 *
 * @param {MouseEvent} event - The mouse event triggered by the user's click.
 */
function closeMobileMenuOnOutsideClick(event) {
  let contactMenu = document.querySelector('.mobile-contact-options');
  let menuBtn = document.querySelector('.mobile-overlay-menu-btn');
  
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

/**
 * Handles window resize events to close floating contact overlays based on the current viewport width.
 * - Closes the mobile floating contact if switching to desktop view.
 * - Closes the desktop floating contact if switching to mobile view.
 */
function handleWindowResize() {
  let mobileOverlay = document.getElementById('mobile-floating-contact');
  let desktopFloatingContact = document.getElementById('floating-contact');
  
  if (window.innerWidth > 768) {
    if (mobileOverlay) {
      let mobileFloatingContact = mobileOverlay.querySelector('.floating-contact');
      if (mobileFloatingContact && mobileFloatingContact.classList.contains('show')) {
        closeMobileFloatingContact();
      }
    }
  } else {
    if (desktopFloatingContact && desktopFloatingContact.classList.contains('show')) {
      closeDesktopFloatingContact();
    }
  }
}

/**
 * Displays the overlay for adding a new contact.
 * Renders the add contact overlay template, shows the overlay,
 * disables body scrolling, and animates the overlay appearance.
 */
function showAddContactOverlay() {
  document.getElementById('overlay-add-contact-container').innerHTML = getAddContactOverlayTemplate();
  document.getElementById('overlay-contacts').classList.add('show');
  document.body.classList.add('no-scroll');
  
  setTimeout(() => {
      document.getElementById('overlay-add-contact').classList.add('show');
  }, 10);
}

/**
 * Displays the edit contact overlay with the provided user data.
 * Renders the overlay template, shows the overlay, and disables body scrolling.
 * 
 * @param {Object} userData - The data of the user to be edited.
 */
function showEditContactOverlay(userData) {
  document.getElementById('overlay-edit-contact-container').innerHTML = getEditContactOverlayTemplate(userData);
  document.getElementById('overlay-contacts').classList.add('show');
  document.body.classList.add('no-scroll');
  
  setTimeout(() => {
      document.getElementById('overlay-edit-contact').classList.add('show');
  }, 10);
}

/**
 * Displays a temporary success message on the screen indicating that a contact was successfully created.
 */
function showCreateSuccessMessage() {
  let container = createSuccessMessageContainer();
  document.body.appendChild(container);

  setTimeout(() => container.classList.add('show'), 200);

  setTimeout(() => {
    container.classList.remove('show');
    setTimeout(() => container.remove(), 500);
  }, 1500);
}

/**
 * Creates the DOM container element for the success message.
 */
function createSuccessMessageContainer() {
  let container = document.createElement('div');
  container.id = 'success-message-container';
  container.className = 'success-message-container';
  container.innerHTML = getSuccessMessageTemplate();
  return container;
}

window.addEventListener('resize', handleWindowResize);