// ===================== SUBTASK HANDLING =====================

/**
 * Resets the subtask input field and hides action buttons.
 */
function resetSubtaskInput() {
    taskInput.value = "";
    checkBtn.style.display = "none";
    cancelBtn.style.display = "none";
}

/**
 * Creates a new subtask list item with edit and delete functionality.
 * 
 * @param {string} text - The subtask text.
 */
function addSubtask(text) {
    if (!text.trim()) return;

    let li = document.createElement("li");
    li.className = "subtask-item";

    let span = document.createElement("span");
    span.textContent = text.trim();
    span.className = "subtask-text";
    li.appendChild(span);

    let icons = createSubtaskIcons(li, span);
    li.appendChild(icons);
    subtaskList.appendChild(li);

    resetSubtaskInput();
}

/**
 * Creates the edit and delete icons for a subtask item.
 * 
 * @param {HTMLElement} li - The subtask list item.
 * @param {HTMLElement} span - The span containing the subtask text.
 */
function createSubtaskIcons(li, span) {
    let icons = document.createElement("div");
    icons.classList.add("subtask-icons");

    let editIcon = document.createElement("img");
    editIcon.src = "./assets/icons-addtask/Property 1=edit.png";
    editIcon.alt = "Edit";
    editIcon.addEventListener("click", () => startEditSubtask(li, span));

    let deleteIcon = document.createElement("img");
    deleteIcon.src = "./assets/icons-addtask/Property 1=delete.png";
    deleteIcon.alt = "Delete";
    deleteIcon.addEventListener("click", () => subtaskList.removeChild(li));

    icons.appendChild(editIcon);
    icons.appendChild(deleteIcon);
    return icons;
}

/**
 * Creates an input element for editing a subtask.
 * 
 * @param {string} text - Current subtask text.
 */
function createSubtaskEditInput(text) {
    let input = document.createElement("input");
    input.type = "text";
    input.value = text;
    input.classList.add("subtask-edit-input");
    return input;
}

/**
 * Creates save and cancel icons for editing a subtask and binds event listeners.
 * 
 * @param {HTMLElement} li - The subtask list item.
 * @param {HTMLElement} input - The input element.
 * @param {HTMLElement} span - The original span element.
 * @param {HTMLElement} defaultIcons - The original icons container.
 */
function createEditActionIcons(li, input, span, defaultIcons) {
    let saveIcon = document.createElement("img");
    saveIcon.src = "./assets/icons-addtask/Subtask's icons (1).png";
    saveIcon.alt = "Save";

    let cancelIcon = document.createElement("img");
    cancelIcon.src = "./assets/icons-addtask/Subtask cancel.png";
    cancelIcon.alt = "Cancel";

    let actionIcons = document.createElement("div");
    actionIcons.classList.add("subtask-icons");
    actionIcons.append(saveIcon, cancelIcon);

    saveIcon.addEventListener("click", () => finishEditSubtask(li, input, span, defaultIcons, actionIcons));
    cancelIcon.addEventListener("click", () => cancelEditSubtask(li, input, span, defaultIcons, actionIcons));

    return actionIcons;
}

/**
 * Replaces the subtask span with input and action icons, entering edit mode.
 * 
 * @param {HTMLElement} li - The subtask list item.
 * @param {HTMLElement} span - The subtask text span.
 */
function startEditSubtask(li, span) {
    let input = createSubtaskEditInput(span.textContent);
    let defaultIcons = li.querySelector(".subtask-icons");
    let actionIcons = createEditActionIcons(li, input, span, defaultIcons);

    li.replaceChild(input, span);
    li.replaceChild(actionIcons, defaultIcons);
    input.focus();
}

/**
 * Finishes editing a subtask and updates its text.
 */
function finishEditSubtask(li, input, span, defaultIcons, actionIcons) {
    let newText = input.value.trim();
    if (newText) span.textContent = newText;
    li.replaceChild(span, input);
    li.replaceChild(defaultIcons, actionIcons);
}

/**
 * Cancels editing a subtask and restores original text.
 */
function cancelEditSubtask(li, input, span, defaultIcons, actionIcons) {
    li.replaceChild(span, input);
    li.replaceChild(defaultIcons, actionIcons);
}