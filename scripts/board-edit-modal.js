// ===================== MAIN FUNCTION - OPEN EDIT MODE =====================

/**
 * Opens the edit mode for a given task.
 * Delegates initialization and feature setup.
 * 
 * @param {Object} task - Task to edit
 */
async function openEditMode(task) {
    let elements = await initializeEditMode(task);
    if (!elements) return;

    setupEditModeFeatures(task, elements);
}

/**
 * Initializes the edit mode: loads users, prepares DOM, renders template.
 * 
 * @param {Object} task - Task to edit
 */
async function initializeEditMode(task) {
    if (users.length === 0) await loadUsers();

    let elements = getEditModeElements();
    if (!elements.view || !elements.edit || !elements.editForm) {
        console.error('Edit modal elements not found');
        return null;
    }

    elements.view.classList.add("hidden");
    elements.edit.classList.remove("hidden");
    elements.editForm.innerHTML = taskEditTemplate(task, task.dueDate || "");

    return elements;
}

/**
 * Sets up all interactive features of the edit mode.
 * 
 * @param {Object} task - Task to edit
 * @param {Object} elements - Collected DOM elements
 */
function setupEditModeFeatures(task, elements) {
    setupDueDateHandling();
    setupAssignedUsersDropdown(task);
    setupSubtaskHandling(task);
    setupPriorityButtons(task, (task.priority || "medium").toLowerCase());

    currentTask = task;

    renderAssignedDropdownOverlay(task).then(() => renderEditSubtasks(task));
    setupSaveButton(task);
}

/**
 * Collects main edit mode elements.
 * 
 * @returns {Object} - DOM elements
 */
function getEditModeElements() {
    return {
        view: document.getElementById("task-view"),
        edit: document.getElementById("task-edit"),
        editForm: document.getElementById("edit-form-fields"),
    };
}

// ===================== ELEMENT COLLECTION =====================

/**
 * Collects main edit mode elements.
 */
function getEditModeElements() {
    return {
        view: document.getElementById("task-view"),
        edit: document.getElementById("task-edit"),
        editForm: document.getElementById("edit-form-fields"),
    };
}

// ===================== DUE DATE HANDLING =====================

/**
 * Sets up the due date input focus behavior.
 */
function setupDueDateHandling() {
    let input = document.getElementById("edit-due-date-input");
    let container = document.getElementById("edit-due-date-container");
    if (!input || !container) return;

    container.addEventListener("click", (e) => {
        if (e.target === input) return;
        input.focus();
        input.click();
    });
}

// ===================== ASSIGNED USERS DROPDOWN =====================

/**
 * Initializes the assigned users dropdown.
 * 
 * @param {Object} task - Current task
 */
function setupAssignedUsersDropdown(task) {
    let elems = getAssignedDropdownElements();
    if (!elems.dropdown) return;
    attachDropdownEvents(elems);
}

/**
 * Collects dropdown DOM elements.
 */
function getAssignedDropdownElements() {
    return {
        placeholder: document.getElementById("edit-assigned-placeholder"),
        input: document.getElementById("edit-assigned-input"),
        arrow: document.getElementById("edit-assigned-arrow"),
        dropdown: document.getElementById("edit-assigned-dropdown"),
    };
}

/**
 * Attaches events to the dropdown elements.
 * 
 * @param {Object} elems - Dropdown elements
 */
function attachDropdownEvents({ placeholder, input, arrow, dropdown }) {
    let open = () => { dropdown.classList.remove("hidden"); input.style.display = "inline"; placeholder.style.display = "none"; arrow.src = "./assets/icons-addtask/arrow_drop_down_up.png"; input.focus(); };
    let close = () => { dropdown.classList.add("hidden"); input.style.display = "none"; placeholder.style.display = "block"; arrow.src = "./assets/icons-addtask/arrow_drop_down.png"; input.value = ""; };

    placeholder?.addEventListener("click", e => { e.stopPropagation(); open(); });
    arrow?.addEventListener("click", e => { e.stopPropagation(); dropdown.classList.contains("hidden") ? open() : close(); });
    input?.addEventListener("input", () => filterDropdown(input, dropdown));
    input?.addEventListener("click", e => { e.stopPropagation(); dropdown.classList.contains("hidden") ? open() : close(); });
    document.addEventListener("click", e => { if (!dropdown.contains(e.target) && e.target !== input && e.target !== placeholder && e.target !== arrow) close(); });
}

/**
 * Filters dropdown items based on input.
 * 
 * @param {HTMLElement} input
 * @param {HTMLElement} dropdown
 */
function filterDropdown(input, dropdown) {
    let filter = input.value.toLowerCase();
    Array.from(dropdown.children).forEach(div => {
        let nameEl = div.querySelector("span");
        div.style.display = (nameEl && nameEl.textContent.toLowerCase().includes(filter)) ? "flex" : "none";
    });
}

// ===================== SUBTASK HANDLING =====================

/**
 * Sets up the subtask input and buttons.
 * 
 * @param {Object} task - Current task
 */
function setupSubtaskHandling(task) {
    let elems = getSubtaskElements();
    if (!elems.subtaskInput || !elems.editCancelBtn || !elems.editCheckBtn) return;

    attachSubtaskInputEvents(elems);
    attachSubtaskButtonEvents(elems, task);
}

/**
 * Collects subtask DOM elements.
 */
function getSubtaskElements() {
    return {
        subtaskInput: document.getElementById("edit-subtask-input"),
        editCancelBtn: document.getElementById("edit-subtask-cancel"),
        editCheckBtn: document.getElementById("edit-subtask-check"),
    };
}

/**
 * Attaches input event to subtask input.
 * 
 * @param {Object} elems - Subtask elements
 */
function attachSubtaskInputEvents({ subtaskInput, editCancelBtn, editCheckBtn }) {
    subtaskInput.addEventListener("input", () => {
        let hasText = subtaskInput.value.trim().length > 0;
        editCancelBtn.style.display = hasText ? "inline-block" : "none";
        editCheckBtn.style.display = hasText ? "inline-block" : "none";
    });
}

/**
 * Attaches click events to subtask buttons.
 * 
 * @param {Object} elems - Subtask elements
 * @param {Object} task - Current task
 */
function attachSubtaskButtonEvents({ subtaskInput, editCancelBtn, editCheckBtn }, task) {
    editCancelBtn.addEventListener("click", () => { subtaskInput.value = ""; editCancelBtn.style.display = "none"; editCheckBtn.style.display = "none"; });
    editCheckBtn.addEventListener("click", async () => {
        let text = subtaskInput.value.trim(); if (!text) return;
        await addSubtask(task.id, text);
        renderEditSubtasks(task);
        subtaskInput.value = ""; editCancelBtn.style.display = "none"; editCheckBtn.style.display = "none";
    });
}

// ===================== PRIORITY BUTTONS =====================

/**
 * Sets up priority buttons and their click behavior.
 * 
 * @param {Object} task - Current task
 * @param {string} priority - Current priority
 */
function setupPriorityButtons(task, priority) {
    let buttons = document.querySelectorAll("#edit-priority-buttons .priority-frame");
    buttons.forEach(btn => {
        if (btn.dataset.priority.toLowerCase() === priority) btn.classList.add("active");
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            task.priority = btn.dataset.priority;
        });
    });
}
// ===================== SAVE BUTTON =====================

/**
 * Sets up the save button for updating the task.
 * 
 * @param {Object} task - Current task
 */
function setupSaveButton(task) {
    let elems = getSaveButtonElements();
    if (!elems.saveBtn) return;
    attachSaveButtonClick(elems, task);
}

/**
 * Collects save button DOM elements.
 */
function getSaveButtonElements() {
    return {
        saveBtn: document.getElementById("save-task"),
        dropdown: document.getElementById("edit-assigned-dropdown"),
    };
}

/**
 * Attaches click event to the save button.
 * Delegates to gather inputs and persist changes.
 * 
 * @param {Object} elems - Save button and dropdown
 * @param {Object} task - Current task
 */
function attachSaveButtonClick({ saveBtn, dropdown }, task) {
    saveBtn.onclick = async () => {
        if (!currentTask) return;
        gatherTaskInputValues();
        dropdown?.classList.add("hidden");
        try {
            await persistTaskChanges(currentTask);
        } catch (err) {
            console.error('Error updating task:', err);
        }
    };
}

/**
 * Reads input fields and updates the currentTask object.
 */
function gatherTaskInputValues() {
    let titleInput = document.getElementById("edit-title-input");
    let descInput = document.getElementById("edit-description-input");
    let dueDateInput = document.getElementById("edit-due-date-input");

    if (titleInput) currentTask.title = titleInput.value;
    if (descInput) currentTask.description = descInput.value;
    currentTask.priority = currentTask.priority || "medium";
    if (dueDateInput && dueDateInput.value) currentTask.dueDate = dueDateInput.value;
}

/**
 * Persists the current task changes to the backend and updates the UI.
 * 
 * @param {Object} task - Task to update
 */
async function persistTaskChanges(task) {
    await updateTask(task.id, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        assignedUsersFull: task.assignedUsersFull
    });

    let idx = tasks.findIndex(t => t.id === task.id);
    if (idx > -1) Object.assign(tasks[idx], task);

    openTaskDetails(task);
    renderBoard();
}