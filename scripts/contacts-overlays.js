
/**
 * Deletes a user from the database by their unique key.
 *
 * @param {string} userKey - The unique identifier of the user to delete.
 */
async function deleteUserByKey(userKey) {
  let response = await fetch(`${BASE_URL}users/${userKey}.json`, {
    method: 'DELETE'
  });
  return response.ok;
}

/**
 * Deletes a contact by their email address.
 *
 * @param {string} email - The email address of the contact to delete.
 */
async function deleteContact(email) {
  try {
    let userKey = await findUserKeyByEmail(email);

    if (!userKey) {
      console.error("User not found");
      return;
    }
    let deleted = await deleteUserByKey(userKey);
    if (deleted) {
      await handleUserDeleted(userKey);
    } else {
      console.error("Failed to delete user");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
  }
}

/**
 * Handles cleanup and UI updates after a user has been deleted.
 * - Removes the user from all tasks.
 * - Closes any open contact overlays.
 * - Reloads the user list.
 *
 * @param {string} userKey - The unique key of the deleted user in the database.
 */
async function handleUserDeleted(userKey) {
  await removeUserFromAllTasks(userKey);
  closeFloatingContact();
  closeContactOverlay();
  loadUsers();
}

/**
 * Close a specific modal with ARIA adjustments and optional focus return.
 * @param {HTMLElement} modalContainer - The container of the modal to close.
 * @param {HTMLElement|null} triggerButton - The element that triggered the modal (for focus return).
 */
function closeModal(modalContainer, triggerButton = null) {
    const overlayBackground = document.getElementById('overlay-contacts');

    if (modalContainer && modalContainer.classList.contains('show')) {

        if (triggerButton) {
            triggerButton.focus();
        } else {
            document.body.focus();
        }
        modalContainer.classList.remove('show');
        modalContainer.setAttribute('aria-hidden', 'true');
        modalContainer.inert = true;

        setTimeout(() => {
            overlayBackground.classList.remove('show');
            overlayBackground.setAttribute('aria-hidden', 'true');
            overlayBackground.inert = true;

            modalContainer.innerHTML = '';
            document.body.classList.remove('no-scroll');
        }, 300);
    }
}

/**
 * Closes the contact overlay by removing the 'show' class from either the add or edit contact overlays.
 * Also clears the respective overlay container's inner HTML and removes the 'no-scroll' class from the body.
 */
function closeContactOverlay() {
    const addOverlay = document.getElementById('modal-add-contact');
    const editOverlay = document.getElementById('modal-edit-contact');

    const addTrigger = document.querySelector('.add-contact-btn');
    const editTrigger = document.querySelector('.edit-link[onclick*="edit"]');

    closeModal(addOverlay, addTrigger);
    closeModal(editOverlay, editTrigger);
}

/**
 * Asynchronously creates a new contact after validating input data.
 * Handles success and error scenarios, displaying appropriate messages.
 */
async function createContact() {
  let validatedData = await handleContactValidation(false);
  if (!validatedData) return;

  try {
    let userData = buildUserData(validatedData);
    let result = await createUser(userData);

    if (result.success) {
      await handleSuccessfulCreation();
    } else {
      showUpdateError("Failed to create contact. Please try again.");
    }
  } catch (error) {
    console.error('Create contact error:', error);
    showUpdateError("An unexpected error occurred. Please try again.");
  }
}

/**
 * Builds a user data object from validated input data.
 *
 * @param {Object} validatedData - The validated user data.
 * @param {string} validatedData.name - The user's name.
 * @param {string} validatedData.email - The user's email address.
 * @param {string} validatedData.phone - The user's phone number.
 */
function buildUserData(validatedData) {
  return {
    name: validatedData.name,
    email: validatedData.email,
    phone: validatedData.phone,
    password: "",
    initials: getInitials(validatedData.name),
    color: getColorFromName(validatedData.name)
  };
}

/**
 * Handles the successful creation of a contact by loading users,
 * closing the contact overlay, and displaying a success message.
 */
async function handleSuccessfulCreation() {
  await loadUsers();
  closeContactOverlay();
  showCreateSuccessMessage();
}

/**
 * Sends a new user object to the server (Firebase) via a POST request.
 *
 * @param {Object} userData - The user data to send.
 * @param {string} userData.name - The user's full name.
 * @param {string} userData.email - The user's email address.
 * @param {string} userData.phone - The user's phone number.
 * @param {string} [userData.password] - Optional password (can be empty).
 * @param {string} userData.initials - The user's initials.
 * @param {string} userData.color - The user's assigned color (e.g., for avatar).
 */
async function sendUserToServer(userData) {
  return fetch(`${BASE_URL}users.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
}

/**
 * Creates a new user by sending user data to the server.
 *
 * @param {Object} userData - The data of the user to create.
 */
async function createUser(userData) {
  try {
    let response = await sendUserToServer(userData);

    if (response.ok) {
      let result = await response.json();
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
 * 
 * @param {string} name - The user's full name
 */
function getInitials(name) {
    if (!name) return "";
    let parts = name.trim().split(" ");
    return parts.map(p => p[0].toUpperCase()).slice(0, 2).join("");
}

/**
 * Generates a color based on the user's name
 * 
 * @param {string} name - The user's name
 */
function getColorFromName(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    let hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Updates an existing contact with validated data.
 *
 * @param {string} originalEmail - The email address of the contact to update.
 * @param {string} originalColor - The original color associated with the contact.
 */
async function updateContact(originalEmail, originalColor) {
  let validatedData = await handleContactValidation(true, originalEmail);
  if (!validatedData) return;

  try {
    let userKey = await findUserKeyOrShowError(originalEmail);
    if (!userKey) return;

    await processContactUpdate(userKey, validatedData, originalColor);
  } catch (error) {
    console.error('Update contact error:', error);
    showUpdateError("An unexpected error occurred. Please try again.");
  }
}

/**
 * Processes the update of a contact by building the update data, sending the update request and handling the result.
 *
 * @param {string} userKey - The unique identifier for the user whose contact is being updated.
 * @param {Object} validatedData - The validated contact data to be updated.
 * @param {string} originalColor - The original color associated with the contact.
 */
async function processContactUpdate(userKey, validatedData, originalColor) {
  let updateData = buildUpdateData(validatedData, originalColor);
  let success = await sendUpdateRequest(userKey, updateData);

  if (success) {
    await handleSuccessfulUpdate();
  } else {
    showUpdateError("Failed to update contact. Please try again.");
  }
}

/**
 * Builds the updated user data object for sending to the server.
 *
 * @param {Object} validatedData - The validated contact data from the form.
 * @param {string} validatedData.name - The contact's name.
 * @param {string} validatedData.email - The contact's email.
 * @param {string} validatedData.phone - The contact's phone number.
 * @param {string} originalColor - The original color assigned to the user.
 */
function buildUpdateData(validatedData, originalColor) {
  return {
    name: validatedData.name,
    email: validatedData.email,
    phone: validatedData.phone,
    initials: getInitials(validatedData.name),
    color: originalColor
  };
}

/**
 * Sends a PUT request to update a user's data on the server.
 *
 * @param {string} userKey - The unique key identifying the user in the database.
 * @param {Object} updateData - The data to update for the user.
 */
async function sendUpdateRequest(userKey, updateData) {
  let response = await fetch(`${BASE_URL}users/${userKey}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });
  return response.ok;
}

/**
 * Handles UI updates after a successful user update.
 * - Reloads the user list.
 * - Closes any floating contact overlays.
 * - Closes the main contact overlay.
 */
async function handleSuccessfulUpdate() {
  await loadUsers();
  closeFloatingContact();
  closeContactOverlay();
}

/**
 * Removes a user from the assigned users of all tasks.
 *
 * Iterates through all tasks, and for each task that contains the user in its `assignedUsersFull` array,
 * removes the user and updates the task accordingly.
 *
 * @param {string|number} userKey - The unique identifier of the user to remove from all tasks.
 */
async function removeUserFromAllTasks(userKey) {
  try {
    let tasks = await loadTasks();
    
    for (let task of tasks) {
      if (task.assignedUsersFull && task.assignedUsersFull.length > 0) {
        let originalLength = task.assignedUsersFull.length;
        task.assignedUsersFull = task.assignedUsersFull.filter(user => user.id !== userKey);
        
        if (task.assignedUsersFull.length !== originalLength) {
          await updateTask(task.id, {
            assignedUsersFull: task.assignedUsersFull
          });
        }
      }
    }
  } catch (error) {
    console.error("Error removing user from tasks:", error);
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

    const floatingContact =
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
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-modal', 'false');
    container.setAttribute('aria-labelledby', 'floating-contact-title');
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

    const content = container.querySelectorAll('.floating-contact-second, .floating-contact-third');
    content.forEach(el => el.setAttribute('aria-live', 'polite'));
    container.setAttribute('aria-hidden', 'false');
}

/**
 * Focus the first interactive element (e.g., close button) after rendering.
 * 
 * @param {HTMLElement} container - The floating contact container element.
 */
function focusFloatingContact(container) {
    setTimeout(() => {
        const firstFocusable = container.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) firstFocusable.focus();
    }, 10);
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
    const currentContact = document.getElementById(`contact-${userId}`);
    if (currentContact) currentContact.classList.add('active');
}