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
 * Animates a floating contact element by sliding it in from the right + minimal ARIA adjustments.
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

  let content = floatingContactElement.querySelectorAll('.floating-contact-second, .floating-contact-third');
  content.forEach(el => el.setAttribute('aria-live', 'polite'));
  floatingContactElement.setAttribute('aria-hidden', 'false');
}

/**
 * Close the appropriate floating contact overlay (mobile or desktop) based on screen width.
 */
function closeFloatingContact() {
    if (window.innerWidth <= 768) {
        let mobileContainer = document.getElementById('mobile-floating-contact');
        let mobileTrigger = document.querySelector('.add-contact-btn-mobile');
        closeFloatingContactContainer(mobileContainer, mobileTrigger);
    } else {
        let desktopContainer = document.getElementById('floating-contact');
        let desktopTrigger = document.querySelector('.add-contact-btn');
        closeFloatingContactContainer(desktopContainer, desktopTrigger);
    }
}

/**
 * Close a single floating contact container with ARIA adjustments and optional focus return.
 * 
 * @param {HTMLElement} container - The container to close.
 * @param {HTMLElement|null} triggerButton - The button that triggered the floating contact.
 */
function closeFloatingContactContainer(container, triggerButton = null) {
    if (!container) return;

    let floating = container.querySelector('.floating-contact');

    if (triggerButton) triggerButton.focus();

    if (floating) {
        floating.classList.remove('show');
        floating.setAttribute('aria-hidden', 'true');
    }
    container.classList.remove('show');
    container.setAttribute('aria-hidden', 'true');
    container.inert = true;

    document.body.classList.remove('no-scroll');
    document.querySelectorAll('.contact').forEach(contact => contact.classList.remove('active'));
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
      `openEditContactModal(${JSON.stringify(user)})`
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
 */
function handleWindowResize() {
    let mobileOverlay = document.getElementById('mobile-floating-contact');
    let desktopFloatingContact = document.getElementById('floating-contact');

    if (
        (window.innerWidth > 768 && mobileOverlay?.querySelector('.floating-contact.show')) ||
        (window.innerWidth <= 768 && desktopFloatingContact?.classList.contains('show'))
    ) {
        closeFloatingContact();
    }
}

/**
 * Open a modal (Add or Edit) with ARIA and focus handling.
 * @param {HTMLElement} modalContainer - The container element for the modal.
 * @param {Object|null} userData - User data for Edit modal, null for Add modal.
 * @param {Function} getTemplateFunc - Function returning the modal HTML template.
 * @param {string} triggerSelector - Selector for the element that triggered the modal.
 */
function openModal(modalContainer, userData, getTemplateFunc, triggerSelector) {
    let triggerButton = document.querySelector(triggerSelector);
    let modalBackground = document.getElementById('overlay-contacts');

    modalContainer.inert = false;
    modalContainer.setAttribute('aria-hidden', 'false');
    modalContainer.classList.add('show');

    renderModal(modalContainer, userData, getTemplateFunc);
    showModalBackground(modalBackground);
    showModalWithFocus(modalContainer);
}

/**
 * Renders a modal dialog inside the given container using a provided template function.
 * Sets accessibility attributes for ARIA compliance.
 *
 * @param {HTMLElement} container - The DOM element that will contain the modal content.
 * @param {Object} userData - The data object used to populate the modal template.
 * @param {Function} getTemplateFunc - A function that returns an HTML template string for the modal.
 */
function renderModal(container, userData, getTemplateFunc) {
    container.innerHTML = getTemplateFunc(userData);
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-modal', 'true');
    let titleElement = container.querySelector('[id]');
    if (titleElement) container.setAttribute('aria-labelledby', titleElement.id);
    container.setAttribute('aria-hidden', 'false');
}

/**
 * Displays the modal background and prevents page scrolling while the modal is active.
 *
 * @param {HTMLElement} background - The background overlay element for the modal.
 */
function showModalBackground(background) {
    background.classList.add('show');
    background.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
}

/**
 * Displays the modal with a short delay and focuses the first interactive element for accessibility.
 *
 * @param {HTMLElement} container - The container element that holds the modal.
 */
function showModalWithFocus(container) {
    setTimeout(() => {
        let modal = container.querySelector('.modal-add-contact, .modal-edit-contact');
        modal.classList.add('show');

        let firstInput = modal.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
        if (firstInput) firstInput.focus();
    }, 10);
}

/**
 * Opens the "Add Contact" modal using the add contact template. Automatically focuses the first input field after opening.
 */

function openAddContactModal() {
    openModal(
        document.getElementById('modal-add-contact-container'),
        null,
        getAddContactOverlayTemplate,
        '.add-contact-btn'
    );
}

/**
 * Opens the "Edit Contact" modal for a given user. Passes the user's data into the edit contact template.
 *
 * @param {Object} userData - The data of the user to edit.
 */
function openEditContactModal(userData) {
    openModal(
        document.getElementById('modal-edit-contact-container'),
        userData,
        getEditContactOverlayTemplate,
        `.edit-link[onclick*="${userData.email}"]`
    );
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