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
 * Clears any existing content before creating new element.
 */
function createDesktopFloatingContact() {
  let rightPanel = document.getElementById('right-panel');
  
  rightPanel.innerHTML = '';
  
  rightPanel.innerHTML = '<div class="floating-contact" id="floating-contact"></div>';
  return document.getElementById('floating-contact');
}


/**
 * Removes existing mobile overlay if present.
 */
function removeMobileOverlayIfExists() {
  let existingOverlay = document.getElementById('mobile-floating-contact');
  if (existingOverlay) {
    existingOverlay.remove();
  }
}

/**
 * Creates and returns a new mobile overlay with floating contact element.
 * 
 * @param {Object} user - The contact user data.
 */
function createFreshMobileOverlay(user) {
  let tempDiv = document.createElement('div');
  tempDiv.innerHTML = getMobileOverlayTemplate(user);
  document.body.appendChild(tempDiv.firstElementChild);
  
  let mobileOverlay = document.getElementById('mobile-floating-contact');
  let floatingContact = mobileOverlay.querySelector('.floating-contact');
  
  if (!floatingContact) {
    let newFloatingContact = document.createElement('div');
    newFloatingContact.className = 'floating-contact';
    mobileOverlay.appendChild(newFloatingContact);
    floatingContact = newFloatingContact;
  }
  
  return floatingContact;
}

/**
 * Creates and displays a mobile floating contact overlay with contact information.
 * Clears any existing mobile overlay before creating new one.
 * 
 * @param {Object} user - The contact object.
 * @param {string} user.name - The contact's full name.
 * @param {string} user.email - The contact's email address.
 * @param {string} [user.phone] - The contact's phone number.
 * @param {string} user.color - The color for the contact's avatar/badge.
 * @param {string} user.initials - The contact's initials.
 */
function createMobileFloatingContact(user) {
  removeMobileOverlayIfExists();
  let floatingContact = createFreshMobileOverlay(user);
  
  let mobileOverlay = document.getElementById('mobile-floating-contact');
  mobileOverlay.classList.add('show');
  document.body.classList.add('no-scroll');
  
  return floatingContact;
}

/**
 * Animates a floating contact element by sliding it in from the right + ARIA adjustments.
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
 * Clears innerHTML after animation completes.
 * 
 * @param {HTMLElement} container - The container to close.
 * @param {HTMLElement|null} triggerButton - The button that triggered the floating contact.
 */
function closeFloatingContactContainer(container, triggerButton = null) {
    if (!container) return;

    if (triggerButton && triggerButton.focus) {
        triggerButton.focus();
    } else {
        document.body.focus();
    }
    
    container.setAttribute('aria-hidden', 'true');
    container.classList.remove('show');

    setTimeout(() => {
        container.innerHTML = '';
    }, 300);

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
  let tempDiv = document.createElement('div');
  tempDiv.innerHTML = getMobileContactMenuTemplate(user);
  mobileOverlay.appendChild(tempDiv.firstElementChild);
  
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
    }, 100);
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
 * Main function to open the floating contact panel.
 * Handles rendering, focus management, and accessibility attributes.
 * 
 * @param {Object} user - The contact object containing name, email, etc.
 */
function openFloatingContact(user) {
    deactivateAllContacts();
    highlightCurrentContact(user.id);

    let floatingContact =
        window.innerWidth <= 768
            ? createMobileFloatingContact(user)
            : createDesktopFloatingContact();

    renderFloatingContact(floatingContact, user);
    showFloatingContactPanel(floatingContact);
    focusFloatingContact(floatingContact);
}

/**
 * Render floating contact HTML and set accessibility attributes.
 * 
 * @param {HTMLElement} container - The floating contact container element.
 * @param {Object} user - Contact data.
 */
function renderFloatingContact(container, user) {
    container.innerHTML = getFloatingContactTemplate(user);
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Contact Information');
    container.setAttribute('aria-hidden', 'false');
}

/**
 * Visually show and activate the floating contact panel.
 * Triggers the slide-in animation and sets ARIA attributes for screenreader.
 * 
 * @param {HTMLElement} container - The floating contact container element.
 */
function showFloatingContactPanel(container) {
    container.classList.add('show');
    slideInFloatingContact(container);
}

/**
 * Focus the first interactive element (e.g., close button) after rendering.
 * 
 * @param {HTMLElement} container - The floating contact container element.
 */
function focusFloatingContact(container) {
    setTimeout(() => {
        let firstFocusable = container.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) firstFocusable.focus();
    }, 100);
}

/**
 * Utility: Remove active state from all contacts.
 */
function deactivateAllContacts() {
    document.querySelectorAll('.contact').forEach(contact =>
        contact.classList.remove('active')
    );
}

/**
 * Utility: Highlight the selected contact.
 * 
 * @param {string} userId - The ID of the selected contact.
 */
function highlightCurrentContact(userId) {
    let currentContact = document.getElementById(`contact-${userId}`);
    if (currentContact) currentContact.classList.add('active');
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