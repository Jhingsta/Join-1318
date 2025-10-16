/* --- ADDTASK SUBTASK HANDLING --- */

/* ---------- EVENT LISTENERS ---------- */
/** Shows the confirm button when user types a new subtask, hides it if input is empty. */
taskInput.addEventListener("input", () => {
    if (taskInput.value.trim() !== "") {
        checkBtn.style.display = "inline";
    } else {
        resetInput();
    }
});

/** Adds the current subtask when check button is clicked. */
checkBtn.addEventListener("click", () => handleAddSubtask());

/** Resets the subtask input when cancel button is clicked. */
cancelBtn.addEventListener("click", resetInput);

/* ---------- FUNCTIONS ---------- */
/**
 * Handles adding a new subtask to the list.
 * Creates a new list item element and appends it to the subtask list.
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
 * @param {string} text - The subtask text.
 * @returns {HTMLElement} The <li> element representing the subtask.
 */
function createSubtaskElement(text) {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = text;

    li.appendChild(span);
    li.appendChild(createSubtaskIcons(li, span));

    return li;
}

/**
 * Creates edit and delete icons for a subtask.
 * @param {HTMLElement} li - The subtask <li> element.
 * @param {HTMLElement} span - The span containing subtask text.
 * @returns {HTMLElement} A div containing the action icons.
 */
function createSubtaskIcons(li, span) {
    const icons = document.createElement("div");
    icons.classList.add("subtask-icons");

    const editIcon = createIcon("./assets/icons-addtask/Property 1=edit.png", "Edit", () => startEditMode(li, span));
    const deleteIcon = createIcon("./assets/icons-addtask/Property 1=delete.png", "Delete", () => subtaskList.removeChild(li));

    icons.append(editIcon, deleteIcon);
    return icons;
}

/**
 * Helper function to create an <img> element as an icon.
 * @param {string} src - Image source path.
 * @param {string} alt - Alt text for the image.
 * @param {Function} onClick - Click handler function.
 * @returns {HTMLElement} The created <img> element.
 */
function createIcon(src, alt, onClick) {
    const icon = document.createElement("img");
    icon.src = src;
    icon.alt = alt;
    icon.addEventListener("click", onClick);
    return icon;
}

/**
 * Resets the subtask input field and hides the action buttons.
 */
function resetInput() {
    taskInput.value = "";
    checkBtn.style.display = "none";
    cancelBtn.style.display = "none";
}

/* ---------- EDIT MODE ---------- */
/**
 * Enables editing mode for a subtask.
 * Replaces the text with an input field and shows save/delete icons.
 * @param {HTMLElement} li - The subtask <li> element.
 * @param {HTMLElement} span - The span containing subtask text.
 */
function startEditMode(li, span) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = span.textContent;
    input.classList.add("subtask-edit-input");

    const saveIcon = createIcon("./assets/icons-addtask/Subtask's icons (1).png", "Save", () => {
        span.textContent = input.value.trim() || span.textContent;
        li.replaceChild(span, input);
        li.replaceChild(defaultIcons, actionIcons);
    });

    const deleteIcon = createIcon("./assets/icons-addtask/Property 1=delete.png", "Delete", () => subtaskList.removeChild(li));

    const actionIcons = document.createElement("div");
    actionIcons.classList.add("subtask-icons");
    actionIcons.append(saveIcon, deleteIcon);

    const defaultIcons = li.querySelector(".subtask-icons");
    li.replaceChild(input, span);
    li.replaceChild(actionIcons, defaultIcons);

    input.focus();
}
