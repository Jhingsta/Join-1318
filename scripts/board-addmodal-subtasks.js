// ===================== SUBTASK HANDLING =====================

// Global elements
let taskInput, checkBtn, cancelBtn, subtaskList;

/** 
 * Initializes subtask input and list elements. 
 */
function initSubtaskElements() {
    taskInput = document.getElementById('add-subtask-input');
    checkBtn = document.getElementById('add-subtask-check');
    cancelBtn = document.getElementById('add-subtask-cancel');
    subtaskList = document.getElementById('add-subtask-list');
}

/** 
 * Initializes subtask input listeners. 
 */
function initSubtaskListeners() {
    taskInput?.addEventListener("input", () => {
        if (taskInput.value.trim()) {
            checkBtn.style.display = "inline";
            cancelBtn.style.display = "inline";
        } else {
            resetInput();
        }
    });

    taskInput?.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddSubtask();
        }
    });

    checkBtn?.addEventListener("click", handleAddSubtask);
    cancelBtn?.addEventListener("click", resetInput);
}

/**
 * Adds a new subtask to the list.
 */
function handleAddSubtask() {
    const currentTask = taskInput.value.trim();
    if (!currentTask) return;

    const li = createSubtaskElement(currentTask);
    subtaskList.appendChild(li);
    resetInput();
}

/**
 * Creates a single subtask <li> element with text and icons.
 * 
 * @param {string} text - The subtask text.
 */
function createSubtaskElement(text) {
    const li = document.createElement("li");
    li.className = "subtask-item";

    const span = document.createElement("span");
    span.textContent = text;
    span.className = "subtask-text";
    li.appendChild(span);

    const icons = createSubtaskIcons(li, span);
    li.appendChild(icons);

    return li;
}

/**
 * Creates edit and delete icons for a subtask.
 * 
 * @param {HTMLElement} li - The subtask <li> element.
 * @param {HTMLElement} span - The span containing subtask text.
 */
function createSubtaskIcons(li, span) {
    const icons = document.createElement("div");
    icons.classList.add("subtask-icons");

    const editIcon = createIcon(
        "./assets/icons-addtask/Property 1=edit.png", 
        "Edit", 
        () => startEditMode(li, span)
    );

    const deleteIcon = createIcon(
        "./assets/icons-addtask/Property 1=delete.png", 
        "Delete", 
        () => li.remove()
    );

    icons.append(editIcon, deleteIcon);
    return icons;
}

/**
 * Helper function to create an <img> element as an icon.
 * 
 * @param {string} src - Image source path.
 * @param {string} alt - Alt text for the image.
 * @param {Function} onClick - Click handler function.
 */
function createIcon(src, alt, onClick) {
    const icon = document.createElement("img");
    icon.src = src;
    icon.alt = alt;
    icon.addEventListener("click", onClick);
    return icon;
}

/**
 * Switches a subtask list item into edit mode.
 * 
 * @param {HTMLLIElement} li - The <li> element representing the subtask.
 * @param {HTMLSpanElement} span - The <span> element containing the subtask text.
 */
function startEditMode(li, span) {
    const defaultIcons = li.querySelector(".subtask-icons");
    const input = createEditInput(span.textContent);
    const actionIcons = createEditActionIcons(li, input, span, defaultIcons);

    li.replaceChild(input, span);
    li.replaceChild(actionIcons, defaultIcons);

    input.focus();
}

/**
 * Creates a text input element for editing a subtask.
 * 
 * @param {string} text - The current text of the subtask.
 */
function createEditInput(text) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = text;
    input.classList.add("subtask-edit-input");
    return input;
}

/**
 * Creates the action icons (save and cancel) for editing a subtask.
 * 
 * @param {HTMLLIElement} li - The <li> element containing the subtask.
 * @param {HTMLInputElement} input - The input element for editing.
 * @param {HTMLSpanElement} span - The original span element with subtask text.
 * @param {HTMLElement} defaultIcons - The original icons container.
 * @returns {HTMLDivElement} The container div with save and cancel icons.
 */
function createEditActionIcons(li, input, span, defaultIcons) {
    const actionIcons = document.createElement("div");
    actionIcons.classList.add("subtask-icons");

    const saveIcon = createIcon(
        "./assets/icons-addtask/Subtask's icons (1).png",
        "Save",
        () => finishEditSubtask(li, input, span, defaultIcons, actionIcons)
    );

    const cancelIcon = createIcon(
        "./assets/icons-addtask/Subtask cancel.png",
        "Cancel",
        () => cancelEditSubtask(li, input, span, defaultIcons, actionIcons)
    );

    actionIcons.append(saveIcon, cancelIcon);
    return actionIcons;
}

/**
 * Completes the subtask edit by applying the new text and restoring original icons.
 * 
 * @param {HTMLLIElement} li
 * @param {HTMLInputElement} input
 * @param {HTMLSpanElement} span
 * @param {HTMLElement} defaultIcons
 * @param {HTMLDivElement} actionIcons
 */
function finishEditSubtask(li, input, span, defaultIcons, actionIcons) {
    const newText = input.value.trim();
    if (newText) span.textContent = newText;

    li.replaceChild(span, input);
    li.replaceChild(defaultIcons, actionIcons);
}

/**
 * Cancels editing a subtask and restores the original state.
 * 
 * @param {HTMLLIElement} li
 * @param {HTMLInputElement} input
 * @param {HTMLSpanElement} span
 * @param {HTMLElement} defaultIcons
 * @param {HTMLDivElement} actionIcons
 */
function cancelEditSubtask(li, input, span, defaultIcons, actionIcons) {
    li.replaceChild(span, input);
    li.replaceChild(defaultIcons, actionIcons);
}

/**
 * Resets the subtask input field and hides the action buttons.
 */
function resetInput() {
    taskInput.value = "";
    checkBtn.style.display = "none";
    cancelBtn.style.display = "none";
}