let users = [];

function init() {
  loadUsers();
}

/**
 * Asynchronously loads user data from a JSON file and renders the contacts list.
 * Fetches user data from the specified BASE_URL, parses it, and updates the DOM.
 * 
 * Each user object will have a computed `id` property derived from the email
 * (special characters removed), which is used for DOM element IDs and actions.
 */
async function loadUsers() {
  try {
    let response = await fetch(`${BASE_URL}users.json`);
    let data = await response.json();
    
    if (data) {
      users = Object.values(data).map(u => ({
        ...u,
        id: u.email.replace(/[^a-zA-Z0-9]/g, '')
      }));
      document.getElementById("contacts-list").innerHTML = renderContacts(users);
    } else {
      users = [];
      document.getElementById("contacts-list").innerHTML = "";
    }
  } catch (error) {
    console.error("Error loading users:", error);
    users = [];
    document.getElementById("contacts-list").innerHTML = "";
  }
}

/**
 * Renders a list of contacts grouped alphabetically by the first letter of their names.
 * Contacts are sorted by name before grouping.
 *
 * @param {Array<Object>} contacts - Array of contact objects, each with at least a 'name' property.
 * @returns {string} HTML string of grouped contacts.
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
 * @param {Object} user - The contact object.
 * @param {string} user.name - The contact's full name.
 * @param {string} user.email - The contact's email address.
 * @param {string} [user.phone] - The contact's phone number.
 * @param {string} user.color - The color for the contact's avatar/badge.
 * @param {string} user.initials - The contact's initials.
 */
function createMobileFloatingContact(user) {
  let mobileOverlay = getOrCreateMobileOverlay(user);
  let floatingContact = ensureFloatingContactElement(mobileOverlay);

  mobileOverlay.classList.add('show');
  document.body.classList.add('no-scroll');
  
  return floatingContact;
}

/**
 * Gets an existing mobile overlay or creates a new one with the provided contact data.
 * 
 * @param {Object} user - The contact object.
 */
function getOrCreateMobileOverlay(user) {
  let mobileOverlay = document.getElementById('mobile-floating-contact');

  if (!mobileOverlay) {
    document.body.innerHTML += getMobileOverlayTemplate(user);
    mobileOverlay = document.getElementById('mobile-floating-contact');
  } else {
    updateMobileMenuButton(mobileOverlay, user);
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
 * @param {Object} user - The contact object.
 */
function updateMobileMenuButton(mobileOverlay, user) {
  let menuBtn = mobileOverlay.querySelector('.mobile-overlay-menu-btn');
  if (menuBtn) {
    menuBtn.setAttribute(
      'onclick',
      `openMobileContactMenu('${user.name}', '${user.email}', '${user.phone || ''}', '${user.color}', '${user.initials}')`
    );
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
 * @param {Object} user - The contact object.
 */
function showFloatingContact(user) {
  let allContacts = document.querySelectorAll('.contact');
  allContacts.forEach(contact => contact.classList.remove('active'));

  let currentContact = document.getElementById(`contact-${user.id}`);
  if (currentContact) {
    currentContact.classList.add('active');
  }
  let floatingContactHtml = getFloatingContactTemplate(user);
  let floatingContact =
    window.innerWidth <= 768
      ? createMobileFloatingContact(user)
      : createDesktopFloatingContact();

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
 * @param {Object} user - The contact object.
 */
function openMobileContactMenu(user) {
  let mobileOverlay = document.getElementById('mobile-floating-contact');
  let contactMenu = mobileOverlay.querySelector('.mobile-contact-options');

  if (!contactMenu) {
    createMobileContactMenu(mobileOverlay, user);
  } else {
    updateMobileContactMenu(contactMenu, user);
    closeMobileContactMenu();
  }
}

/**
 * Creates and displays a mobile contact menu overlay with the provided contact details.
 *
 * @param {HTMLElement} mobileOverlay - The overlay element where the contact menu will be rendered.
 * @param {Object} user - The contact object.
 */
function createMobileContactMenu(mobileOverlay, user) {
  mobileOverlay.innerHTML += getMobileContactMenuTemplate(user);
  let contactMenu = mobileOverlay.querySelector('.mobile-contact-options');

  setTimeout(() => contactMenu.classList.add('show'), 10);
  setTimeout(() => document.addEventListener('click', closeMobileMenuOnOutsideClick), 100);
}

/**
 * Updates the mobile contact menu with edit and delete actions for a contact.
 *
 * @param {HTMLElement} contactMenu - The DOM element representing the contact menu.
 * @param {Object} user - The contact object.
 */
function updateMobileContactMenu(contactMenu, user) {
  let editLink = contactMenu.querySelector('.mobile-edit-link');
  if (editLink) {
    editLink.setAttribute(
      'onclick',
      `showEditContactOverlay(${JSON.stringify(user)})`
    );
  }
  let deleteLink = contactMenu.querySelector('.mobile-delete-link');
  if (deleteLink) {
    deleteLink.setAttribute('onclick', `deleteContact('${user.id}')`);
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
 * Opens the "Add Contact" overlay by rendering its content, showing the background,
 * setting focus on the first input, and initializing keyboard support.
 */
function openAddContactOverlay() {
    const overlayContainer = document.getElementById('overlay-add-contact-container');
    const overlayBackground = document.getElementById('overlay-contacts');
    const triggerButton = document.querySelector('.add-contact-btn');

    renderAddContactOverlay(overlayContainer);
    showOverlayBackground(overlayBackground);
    showOverlayWithFocus(overlayContainer);
    setupOverlayKeyboard(overlayContainer, triggerButton, overlayBackground);
}

/**
 * Renders the "Add Contact" overlay HTML inside the given container
 * and sets ARIA attributes for accessibility.
 * 
 * @param {HTMLElement} container - The container element where the overlay HTML will be injected.
 */
function renderAddContactOverlay(container) {
    container.innerHTML = getAddContactOverlayTemplate();
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-modal', 'true');
    container.setAttribute('aria-labelledby', 'overlay-add-contact-title');
    container.setAttribute('aria-hidden', 'false');
}

/**
 * Shows the overlay background, marks it as visible to assistive technologies,
 * and prevents page scrolling while the overlay is open.
 * 
 * @param {HTMLElement} background - The background overlay element.
 */
function showOverlayBackground(background) {
    background.classList.add('show');
    background.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
}

/**
 * Displays the overlay with a short delay for animations and sets focus
 * to the first focusable element within the overlay.
 * 
 * @param {HTMLElement} container - The container element of the overlay.
 */
function showOverlayWithFocus(container) {
    setTimeout(() => {
        const overlay = container.querySelector('.overlay-add-contact');
        overlay.classList.add('show');

        const firstInput = overlay.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
        if (firstInput) firstInput.focus();
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