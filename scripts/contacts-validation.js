/**
 * Finds and returns the user key associated with the given email address.
 *
 * @param {string} email - The email address to search for.
 */
async function findUserKeyByEmail(email) {
  try {
    let response = await fetch(`${BASE_URL}users.json`);
    let data = await response.json();
    
    if (!data) return null;

    for (let [key, user] of Object.entries(data)) {
      if (user.email === email) {
        return key;
      }
    }
    return null;
  } catch (error) {
    console.error("Error finding user by email:", error);
    return null;
  }
}

/**
 * Attempts to find a user key by the provided email address.
 * If no user key is found, displays an error message to the user.
 *
 * @param {string} email - The email address to search for the user key.
 */
async function findUserKeyOrShowError(email) {
  let userKey = await findUserKeyByEmail(email);
  if (!userKey) {
    showUpdateError("Contact not found. Please try again.");
  }
  return userKey;
}

/**
 * Retrieves contact form elements and their values based on the form mode (edit or add).
 *
 * @param {boolean} isEdit - Indicates whether the form is in edit mode (`true`) or add mode (`false`).
 */
function getContactFormElements(isEdit) {
  let nameId = isEdit ? 'overlay-edit-name' : 'overlay-add-name';
  let emailId = isEdit ? 'overlay-edit-email' : 'overlay-add-email';
  let phoneId = isEdit ? 'overlay-edit-phone' : 'overlay-add-phone';

  return {
    formData: {
      name: document.getElementById(nameId).value.trim(),
      email: document.getElementById(emailId).value.trim(),
      phone: document.getElementById(phoneId).value.trim()
    },
    nameGroup: document.getElementById(nameId).closest('.form-group'),
    emailGroup: document.getElementById(emailId).closest('.form-group'),
    phoneGroup: document.getElementById(phoneId).closest('.form-group'),
    errorMessage: document.querySelector('.error-message')
  };
}

/**
 * Validates the contact form data and checks for duplicate emails.
 *
 * @param {boolean} [isEdit=false] - Indicates if the form is in edit mode.
 * @param {string|null} [originalEmail=null] - The original email of the contact (used in edit mode).
 * @returns {Promise<Object|null>} The validated form data or null if validation fails.
 */
async function handleContactValidation(isEdit = false, originalEmail = null) {
  let { formData, nameGroup, emailGroup, phoneGroup, errorMessage } = getContactFormElements(isEdit);

  resetValidationState([nameGroup, emailGroup, phoneGroup], errorMessage);

  let validation = validateContactForm(formData);
  if (!validation.success) {
    showValidationError(validation.errors[0], { nameGroup, emailGroup, phoneGroup, errorMessage });
    return null;
  }
  if (await isDuplicateEmail(formData, isEdit, originalEmail)) {
    showDuplicateEmailError(emailGroup, errorMessage);
    return null;
  }
  return formData;
}

/**
 * Resets previous validation state (removes error classes and messages).
 *
 * @param {HTMLElement[]} groups - Array of input group elements to remove the "input-error" class from.
 * @param {HTMLElement} errorMessage - The element displaying the error message to be hidden and cleared.
 */
function resetValidationState(groups, errorMessage) {
  groups.forEach(group => group.classList.remove("input-error"));
  errorMessage.classList.remove("show");
  errorMessage.textContent = "";
}

/**
 * Displays a validation error and highlights the appropriate field.
 * 
 * @param {string} error - The error message to display.
 * @param {Object} groups - An object containing DOM elements for input groups and the error message.
 * @param {HTMLElement} groups.nameGroup - The DOM element for the name input group.
 * @param {HTMLElement} groups.emailGroup - The DOM element for the email input group.
 * @param {HTMLElement} groups.phoneGroup - The DOM element for the phone input group.
 * @param {HTMLElement} groups.errorMessage - The DOM element where the error message will be displayed.
 */
function showValidationError(error, { nameGroup, emailGroup, phoneGroup, errorMessage }) {
  errorMessage.textContent = error;
  errorMessage.classList.add("show");

  if (error.includes("Name")) {
    nameGroup.classList.add("input-error");
  } else if (error.includes("Email")) {
    emailGroup.classList.add("input-error");
  } else if (error.includes("phone")) {
    phoneGroup.classList.add("input-error");
  }
}

/**
 * Checks if the email already exists (for add or edit mode).
 *
 * @param {Object} formData - The form data containing user information.
 * @param {string} formData.email - The email address to check for duplication.
 * @param {boolean} isEdit - Indicates if the operation is an edit.
 * @param {string} originalEmail - The original email before editing.
 */
async function isDuplicateEmail(formData, isEdit, originalEmail) {
  if (!isEdit || formData.email !== originalEmail) {
    let userKey = await findUserKeyByEmail(formData.email);
    return userKey !== null;
  }
  return false;
}

/**
 * Displays an error for duplicate email addresses.
 *
 * @param {HTMLElement} emailGroup - The container element for the email input field.
 * @param {HTMLElement} errorMessage - The element where the error message will be displayed.
 */
function showDuplicateEmailError(emailGroup, errorMessage) {
  errorMessage.textContent = "A user with this email address already exists.";
  errorMessage.classList.add("show");
  emailGroup.classList.add("input-error");
}

/**
 * Validates a phone number string.
 * The phone number can contain digits, spaces, plus (+), and minus (-) signs.
 * The number of digits (excluding spaces, plus, and minus signs) must be between 6 and 15.
 * If the input is empty or undefined, it is considered valid.
 *
 * @param {string} phone - The phone number to validate.
 */
function isValidPhone(phone) {
  if (!phone) return true;
  
  let phoneRegex = /^[\+\-\s\d]+$/;
  let digitsOnly = phone.replace(/[\+\-\s]/g, '');
  
  return phoneRegex.test(phone) && digitsOnly.length >= 6 && digitsOnly.length <= 15;
}

/**
 * Validates an email address using the browser's built-in email input validation.
 *
 * @param {string} email - The email address to validate.
 */
function isValidEmailBrowser(email) {
  let input = document.createElement('input');
  input.type = 'email';
  input.value = email;
  return input.validity.valid;
}

/**
 * Validates the contact form data.
 *
 * @param {Object} formData - The form data to validate.
 * @param {string} formData.name - The name of the contact.
 * @param {string} formData.email - The email address of the contact.
 * @param {string} formData.phone - The phone number of the contact.
 */
function validateContactForm(formData) {
  let errors = [];
  
  if (!formData.name.trim()) {
    errors.push("Name is required.");
  }
  if (!formData.email.trim()) {
    errors.push("Email is required.");
  } else if (!isValidEmailBrowser(formData.email)) {
    errors.push("Please enter a valid email address.");
  }
  if (formData.phone.trim() && !isValidPhone(formData.phone)) {
    errors.push("Please enter a valid phone number.");
  }
  return {
    success: errors.length === 0,
    errors: errors
  };
}

/**
 * Displays an error message in the contact overlay.
 *
 * @param {string} message - The error message to display.
 */
function showUpdateError(message) {
  let errorMessage = document.querySelector('.error-message');
  errorMessage.textContent = message;
  errorMessage.classList.add("show");
}