/**
 * Validates the entire task form.
 * Returns true if any validation fails.
 * @param {Object} taskData - The task data object.
 * @returns {boolean} - True if form has errors, false otherwise.
 */
function validateForm(taskData) {
    let hasError = false;
    if (!validateTitle(taskData.title)) hasError = true;
    if (!validateDueDate(taskData.dueDate)) hasError = true;
    if (!validateCategory(taskData.category)) hasError = true;
    return hasError;
}

/**
 * Validates the task title field.
 * Shows error if title is empty.
 * @param {string} title - The task title.
 * @returns {boolean} - True if valid, false otherwise.
 */
function validateTitle(title) {
    const titleInput = document.querySelector(".title-input");
    const titleError = document.querySelector(".error-message");
    const valid = !!title.trim();
    setValidationState(titleInput, titleError, valid);
    return valid;
}

/**
 * Validates the due date field.
 * Shows error if no date is selected.
 * @param {string} dueDate - The task due date.
 * @returns {boolean} - True if valid, false otherwise.
 */
function validateDueDate(dueDate) {
    const container = document.querySelector(".due-date-content");
    const error = document.querySelector(".due-date-container .error-message");
    const valid = !!dueDate;
    setValidationState(container, error, valid);
    return valid;
}

/**
 * Validates the category field.
 * Shows error if category is empty or default placeholder.
 * @param {string} category - The task category.
 * @returns {boolean} - True if valid, false otherwise.
 */
function validateCategory(category) {
    const content = document.querySelector(".category-content");
    const error = document.querySelector(".category-container .error-message");
    const valid = category && category !== "Select task category";
    setValidationState(content, error, valid);
    return valid;
}

/**
 * Sets the visual validation state for a form element.
 * Updates border color and shows/hides the error message.
 * @param {HTMLElement} element - The input container.
 * @param {HTMLElement} errorEl - The error message element.
 * @param {boolean} isValid - True if valid, false if invalid.
 */
function setValidationState(element, errorEl, isValid) {
    element.style.borderBottom = isValid
        ? "1px solid #D1D1D1"
        : "1px solid #FF4D4D";
    errorEl.style.display = isValid ? "none" : "block";
}

/* ---------- INTERACTIVE LISTENERS ---------- */

/**
 * Adds a listener to the due date input field.
 * Removes error styling when the user enters a date.
 */
function initDueDateListener() {
    const dueDateContent = document.querySelector(".due-date-content");
    const dueDateError = document.querySelector(".due-date-container .error-message");

    if (dueDateContent) {
        dueDateContent.addEventListener("input", () => {
            if (dueDateContent.textContent.trim()) {
                dueDateContent.style.borderBottom = "1px solid #D1D1D1";
                dueDateError.style.display = "none";
            }
        });
    }
}

/**
 * Adds a click listener on the category content area.
 * Clears error styling if a valid category is selected.
 * @param {HTMLElement} categoryContent - The container of the category field
 * @param {HTMLElement} categoryText - The element showing selected category text
 * @param {HTMLElement} categoryError - The error message element
 */
function handleCategoryContentClick(categoryContent, categoryText, categoryError) {
    categoryContent.addEventListener("click", () => {
        if (categoryText.textContent.trim() && categoryText.textContent !== "Select task category") {
            categoryContent.style.borderBottom = "1px solid #D1D1D1";
            categoryError.style.display = "none";
        }
    });
}

/**
 * Adds click listeners to each dropdown item in the category dropdown.
 * Updates selected category, closes dropdown, and removes error styling.
 * @param {HTMLElement} categoryContent - The container of the category field
 * @param {HTMLElement} categoryText - The element showing selected category text
 * @param {HTMLElement} categoryError - The error message element
 * @param {HTMLElement} categoryDropdown - The dropdown menu container
 */
function handleCategoryItemClick(categoryContent, categoryText, categoryError, categoryDropdown) {
    categoryDropdown.querySelectorAll(".dropdown-item").forEach(item => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            categoryText.textContent = item.textContent.trim();
            categoryDropdown.classList.remove("show");
            const arrowIcon = categoryContent.querySelector("#assigned-arrow-icon");
            arrowIcon.src = "/assets/icons-addtask/arrow_drop_down.png";

            if (categoryText.textContent !== "Select task category") {
                categoryContent.style.borderBottom = "1px solid #D1D1D1";
                categoryError.style.display = "none";
            }
        });
    });
}

/**
 * Initializes category field listeners.
 * Sets up both content click and dropdown item click handlers.
 */
function initCategoryListener() {
    const categoryContent = document.querySelector(".category-content");
    const categoryText = categoryContent?.querySelector(".assigned-text");
    const categoryError = document.querySelector(".category-container .error-message");
    const categoryDropdown = categoryContent?.querySelector(".dropdown-menu");

    if (categoryContent && categoryText && categoryDropdown) {
        handleCategoryContentClick(categoryContent, categoryText, categoryError);
        handleCategoryItemClick(categoryContent, categoryText, categoryError, categoryDropdown);
    }
}

// Initialize listeners
initDueDateListener();
initCategoryListener();

// Expose validateForm globally
window.validateForm = validateForm;

/**
 * Resets the entire Add Task form to its default state.
 * Clears all fields, resets subtasks, priority, category, and assigned users.
 */
/**
 * Resets all text inputs and due date display
 */
function resetTextFields() {
    document.querySelector(".title-input").value = "";
    document.querySelector(".description-input").value = "";
    document.querySelector(".due-date-input").value = "";
    const dueDateDisplay = document.querySelector(".due-date-display");
    dueDateDisplay.textContent = "dd/mm/yyyy";
    dueDateDisplay.classList.remove("has-value");
}

/**
 * Resets priority buttons to default
 */
function resetPriority() {
    document.querySelectorAll(".priority-frame").forEach(btn => btn.classList.remove("active"));
    document.querySelector(".priority-frame:nth-child(2)").classList.add("active");
}

/**
 * Resets category field
 */
function resetCategory() {
    const categoryText = document.querySelector(".category-content .assigned-text");
    if (categoryText) categoryText.textContent = "Select task category";
}

/**
 * Resets subtasks list and input
 */
function resetSubtasks() {
    document.querySelector("#subtask-list").innerHTML = "";
    const checkBtn = document.querySelector(".subtask-check-btn");
    const cancelBtn = document.querySelector(".subtask-cancel-btn");
    if (checkBtn && cancelBtn) {
        checkBtn.style.display = "none";
        cancelBtn.style.display = "none";
    }
}

/**
 * Resets the assigned users text, input, arrow icon, and selected avatars
 */
function resetAssignedInput() {
    const assignedText = document.querySelector(".assigned-text");
    const assignedInput = document.querySelector(".assigned-input");
    const arrowIcon = document.querySelector("#assigned-arrow-icon");
    const selectedAvatarsContainer = document.querySelector(".selected-avatars-container");

    if (assignedText) assignedText.textContent = "Select contacts to assign";
    if (assignedInput) assignedInput.value = "";
    if (arrowIcon) arrowIcon.src = "/assets/icons-addtask/arrow_drop_down.png";
    if (selectedAvatarsContainer) selectedAvatarsContainer.innerHTML = "";
}

/**
 * Resets the assigned users dropdown checkboxes
 */
function resetAssignedDropdown() {
    Array.from(assignedDropdown.querySelectorAll('.dropdown-item')).forEach(item => {
        const wrapper = item.querySelector('.checkbox-wrapper');
        if (!wrapper) return;
        wrapper.classList.remove('checked');
        const img = wrapper.querySelector('img');
        if (img) img.src = './assets/icons-addtask/Property 1=Default.png';
        wrapper.style.display = 'flex'; 
    });
}

/** 
 * Resets the entire task form
 */
function resetForm() {
    resetTextFields();
    resetPriority();
    resetCategory();
    resetSubtasks();
    resetAssignedInput();
    resetAssignedDropdown();
}