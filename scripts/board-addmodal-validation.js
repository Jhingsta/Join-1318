// ===================== FORM RESET & VALIDATION =====================

/**
 * Clears the title, description, and due date inputs.
 */
function resetInputs() {
    titleInput.value = "";
    
    const descInput = document.getElementById('add-description-input');
    descInput && (descInput.value = "");
    
    dueDateInput.value = "";
    dueDateDisplay.textContent = "dd/mm/yyyy";
    dueDateDisplay.classList.remove("has-value");
}

/**
 * Clears the subtask list and selected avatars.
 */
function resetSubtasksAndAvatars() {
    subtaskList.replaceChildren();
    document.getElementById('add-selected-avatars-container')?.replaceChildren();
    taskInput.value = "";
    checkBtn.style.display = "none";
    cancelBtn.style.display = "none";
}

/**
 * Resets priority buttons to default state ("medium").
 */
function resetPriorityButtons() {
    priorityButtons.forEach(btn => btn.classList.remove("active"));
    document.querySelector("#add-priority-buttons .priority-frame[data-priority='medium']")?.classList.add("active");
}

/**
 * Resets the assigned users dropdown to default state.
 */
function resetAssignedDropdown() {
    if (!assignedDropdown) return;
    assignedDropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('active');
        let checkboxWrapper = item.querySelector('.checkbox-wrapper');
        if (!checkboxWrapper) return;
        checkboxWrapper.classList.remove('checked');
        checkboxWrapper.querySelector('img')?.setAttribute('src', "./assets/icons-addTask/Property 1=Default.png");
    });
}

/**
 * Resets the category selection to default state.
 */
function resetCategory() {
    let categoryTextEl = document.getElementById('add-category-text');
    if (categoryTextEl) categoryTextEl.textContent = "Select task category";
}

/**
 * Resets the entire add task form.
 */
function resetForm() {
    resetInputs();
    resetSubtasksAndAvatars();
    resetPriorityButtons();
    resetAssignedDropdown();
    resetCategory();
}

/**
 * Validates the title input field and shows/hides error styles.
 */
function validateTitle() {
    let valid = titleInput.value.trim() !== "";
    titleInput.style.borderBottom = valid ? "1px solid #D1D1D1" : "1px solid #FF4D4D";
    titleError.style.display = valid ? "none" : "block";
    return valid;
}

/**
 * Validates the due date input and updates UI error state.
 */
function validateDueDate() {
    let valid = dueDateInput.value.trim() !== "";
    let dueDateError = document.getElementById('add-due-date-error');
    dueDateContainer.style.borderBottom = valid ? "1px solid #D1D1D1" : "1px solid #FF4D4D";
    if (dueDateError) dueDateError.style.display = valid ? "none" : "block";
    return valid;
}

/**
 * Validates the category selection and updates UI error state.
 */
function validateCategory() {
    let categoryTextEl = document.getElementById('add-category-text');
    let categoryError = document.getElementById('add-category-error');
    let valid = categoryTextEl && categoryTextEl.textContent !== "Select task category";
    if (categoryTextEl) categoryContent.style.borderBottom = valid ? "1px solid #D1D1D1" : "1px solid #FF4D4D";
    if (categoryError) categoryError.style.display = valid ? "none" : "block";
    return valid;
}