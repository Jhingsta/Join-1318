// ===================== GLOBAL VARIABLES =====================

let tasks = [];
let users = [];
let currentNewTask = null;
let currentTask = null;
let addButtons = document.querySelectorAll('.svg-button');

// ===================== TEMPLATE INJECTION =====================

document.body.insertAdjacentHTML("beforeend", addtaskModal());
document.body.insertAdjacentHTML('beforeend', taskDetailModal());

// ===================== DOM ELEMENTS (Shared) =====================

let categories = ["Technical Task", "User Story"];

// ===================== DATA LOADING =====================

/**
 * Loads all tasks for the board and ensures assigned users are correctly formatted.
 */
async function loadTasksForBoard() {
    try {
        tasks = await loadTasks();
        tasks = tasks.map(task => ({
            ...task,
            assignedUsersFull: task.assignedUsersFull || []
        }));
        return tasks;
    } catch (error) {
        console.error("Error loading tasks for board:", error);
        tasks = [];
        return [];
    }
}

/**
 * Loads all users from the Firebase database and populates the dropdown.
 */
async function loadUsers() {
    const res = await fetch("https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/users.json");
    let data = await res.json();
    users = data
        ? Object.keys(data).map(key => ({ id: key, ...data[key] }))
        : [];
    populateDropdown();
}

function getTasks() {
    return tasks || [];
}

// ===================== BOARD RENDERING =====================

/**
 * Renders the entire board with tasks sorted into their columns.
 */
function renderBoard() {
    let boardTasks = getTasks();

    let columns = {
        todo: document.getElementById('column-todo'),
        inProgress: document.getElementById('column-inProgress'),
        awaitFeedback: document.getElementById('column-awaitFeedback'),
        done: document.getElementById('column-done'),
    };

    clearBoardColumns(columns);
    renderTaskCards(boardTasks, columns);
    addEmptyPlaceholders(columns);
    setTimeout(initializeDragAndDrop, 0);
}

/**
 * Clears all columns before rendering.
 * 
 * @param {Object} columns - Map of column elements.
 */
function clearBoardColumns(columns) {
    Object.values(columns).forEach((el) => el && (el.innerHTML = ''));
}

/**
 * Renders task cards into their respective columns.
 * 
 * @param {Array} boardTasks - List of tasks to render.
 * @param {Object} columns - Map of column elements.
 */
function renderTaskCards(boardTasks, columns) {
    boardTasks.forEach((task) => {
        let card = createTaskCard(task);
        let column = columns[task.status] || columns.todo;
        if (column) {
            column.appendChild(card);
        }
    });
}

/**
 * Adds placeholder elements to empty columns.
 * 
 * @param {Object} columns - Map of column elements.
 */
function addEmptyPlaceholders(columns) {
    Object.entries(columns).forEach(([status, columnEl]) => {
        if (!columnEl) return;
        if (columnEl.children.length === 0) {
            let placeholder = document.createElement('div');
            placeholder.className = 'task-placeholder';
            placeholder.textContent = `No tasks in ${readableStatus(status)}`;
            columnEl.appendChild(placeholder);
        }
    });
}

// ===================== FIREBASE UPDATES =====================

/**
 * Updates subtask data of a given task in Firebase.
 * 
 * @param {string} taskId - The ID of the task to update.
 * @param {Object} task - The task object containing updated subtask info.
 */
async function updateSubtaskInFirebase(taskId, task) {
    try {
        await updateTask(taskId, {
            subtasks: {
                total: task.subtasks.items.length,
                completed: task.subtasks.completed,
                items: task.subtasks.items
            }
        });
    } catch (error) {
        console.error('Error updating subtask in Firebase:', error);
    }
}

// ===================== STATUS & PRIORITY HELPERS =====================

/**
 * Returns a human-readable version of a task status.
 * 
 * @param {string} status - The status key.
 */
function readableStatus(status) {
    switch (status) {
        case 'todo':
            return 'to do';
        case 'inProgress':
            return 'progress';
        case 'awaitFeedback':
            return 'awaiting feedback';
        case 'done':
            return 'done';
        default:
            return status;
    }
}

/**
 * Returns the path to the icon that represents the given priority.
 * 
 * @param {string} priority - The task priority (urgent, medium, low).
 */
function priorityIcon(priority) {
    switch ((priority || 'medium').toLowerCase()) {
        case 'urgent':
            return './assets/icons-board/priority-urgent.svg';
        case 'medium':
            return './assets/icons-board/priority-medium.svg';
        case 'low':
            return './assets/icons-board/priority-low.svg';
        default:
            return './assets/icons-board/priority-medium.svg';
    }
}

// ===================== USER DROPDOWN =====================

/**
 * Main entry point for populating the user assignment dropdown.
 * Validates DOM elements and delegates to the rendering function.
*/
function populateDropdown() {
    let assignedDropdown = document.getElementById('add-assigned-dropdown');
    let selectedAvatarsContainer = document.getElementById('add-selected-avatars-container');

    if (!assignedDropdown) {
        console.warn('populateDropdown: #add-assigned-dropdown not found.');
        return;
    }
    if (!selectedAvatarsContainer) {
        console.warn('populateDropdown: #add-selected-avatars-container not found.');
        return;
    }

    renderUserDropdownItems(assignedDropdown);
}

/**
 * Renders all user dropdown items and attaches events.
 *
@param {HTMLElement} assignedDropdown - The dropdown container element.
*/
function renderUserDropdownItems(assignedDropdown) {
    assignedDropdown.innerHTML = "";

    (users || []).forEach((user) => {
        let item = createDropdownItem(user);
        assignedDropdown.appendChild(item);
        attachDropdownItemEvents(item);
    });
}

/**
 * Creates a dropdown item element representing a user.
 * 
 * @param {Object} user - The user object containing id, initials, name, and color.
 */
function createDropdownItem(user) {
    let item = createDropdownContainer(user.id);
    let userInfo = createUserInfoSection(user);
    let checkboxSection = createCheckboxSection();

    item.appendChild(userInfo);
    item.appendChild(checkboxSection);

    item.dataset.checkboxWrapper = checkboxSection;
    item.dataset.checkbox = checkboxSection.querySelector('img');

    return item;
}

/**
 * Creates the main container element for a dropdown item.
 * 
 * @param {string} userId - The ID of the user.
 */
function createDropdownContainer(userId) {
    let div = document.createElement('div');
    div.className = 'dropdown-item';
    div.dataset.userId = userId;
    return div;
}

/**
 * Builds the section showing the user avatar and name.
 * 
 * @param {Object} user - The user object with initials, name, and color.
 */
function createUserInfoSection(user) {
    let wrapper = document.createElement('div');
    wrapper.className = 'assigned-wrapper';

    let avatar = document.createElement('div');
    avatar.className = 'dropdown-avatar';
    avatar.textContent = user.initials;
    avatar.style.backgroundColor = user.color;

    let nameSpan = document.createElement('span');
    nameSpan.textContent = user.name;

    wrapper.appendChild(avatar);
    wrapper.appendChild(nameSpan);
    return wrapper;
}

/**
 * Builds the section containing the checkbox and hover overlay.
 */
function createCheckboxSection() {
    let wrapper = document.createElement('div');
    wrapper.className = 'checkbox-wrapper';

    let checkbox = document.createElement('img');
    checkbox.src = "./assets/icons-addTask/Property 1=Default.png";
    checkbox.alt = "Check user";

    let hoverOverlay = document.createElement('div');
    hoverOverlay.className = 'hover-overlay';

    wrapper.appendChild(checkbox);
    wrapper.appendChild(hoverOverlay);
    return wrapper;
}

/**
 * Attaches event listeners for user selection toggling.
 * 
 * @param {HTMLElement} div - The dropdown item element.
 */
function attachDropdownItemEvents(div) {
    let checkboxWrapper = div.querySelector('.checkbox-wrapper');
    let checkbox = checkboxWrapper.querySelector('img');

    div.addEventListener('click', (e) => {
        if (e.target === checkbox || e.target.classList.contains('hover-overlay')) return;
        toggleUserSelection(div, checkboxWrapper, checkbox);
    });

    checkboxWrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleUserSelection(div, checkboxWrapper, checkbox);
    });
}

/**
 * Toggles a user selection in the dropdown.
 * 
 * @param {HTMLElement} div - Dropdown item.
 * @param {HTMLElement} checkboxWrapper - Wrapper for the checkbox.
 * @param {HTMLImageElement} checkbox - The checkbox image.
 */
function toggleUserSelection(div, checkboxWrapper, checkbox) {
    let isChecked = checkboxWrapper.classList.toggle('checked');
    checkbox.src = isChecked
        ? "./assets/icons-addTask/Property 1=checked.svg"
        : "./assets/icons-addTask/Property 1=Default.png";
    div.classList.toggle('active', isChecked);

    if (typeof updateSelectedAvatars === "function") {
        updateSelectedAvatars();
    }
}

// ===================== SELECTED AVATARS =====================

/**
 * Updates the display of currently selected user avatars.
 */
function updateSelectedAvatars() {
    let assignedDropdown = document.getElementById('add-assigned-dropdown');
    let selectedAvatarsContainer = document.getElementById('add-selected-avatars-container');
    if (!assignedDropdown || !selectedAvatarsContainer) return;

    let selectedUsers = getSelectedUsersFromDropdown(assignedDropdown);
    renderSelectedAvatars(selectedUsers, selectedAvatarsContainer);
}

/**
 * Retrieves all users that are currently selected in the dropdown.
 * 
 * @param {HTMLElement} assignedDropdown - The dropdown element.
 */
function getSelectedUsersFromDropdown(assignedDropdown) {
    return users.filter((u, i) => {
        let dropdownItem = assignedDropdown.children[i];
        if (!dropdownItem) return false;
        let img = dropdownItem.querySelector('img');
        return img && img.src.includes("checked");
    }).slice(0, 3);
}

/**
 * Renders selected user avatars into the container.
 * 
 * @param {Array} selectedUsers - Array of selected users.
 * @param {HTMLElement} container - Container for the avatars.
 */
function renderSelectedAvatars(selectedUsers, container) {
    container.innerHTML = "";
    selectedUsers.forEach(user => {
        let avatar = document.createElement('div');
        avatar.className = 'selected-avatar assigned-text';
        avatar.dataset.fullname = user.name;
        avatar.textContent = user.initials;
        avatar.style.backgroundColor = user.color;
        container.appendChild(avatar);
    });
    container.style.display = selectedUsers.length > 0 ? 'flex' : 'none';
}

// ===================== DATE UTILITIES =====================

/**
 * Converts an ISO date string (YYYY-MM-DD) to a display format (DD/MM/YYYY).
 * 
 * @param {string} isoDate - The ISO date string.
 */
function formatDateForDisplay(isoDate) {
    if (!isoDate) return "";
    let [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
}

/**
 * Updates the due date display based on the date picker input.
 */
function updateDueDateDisplay() {
    let dueDateInput = document.getElementById('add-due-date-input');
    let dueDateDisplay = document.getElementById('add-due-date-display');
    if (!dueDateInput || !dueDateDisplay) return;

    let isoDate = dueDateInput.value;
    if (isoDate) {
        dueDateDisplay.textContent = formatDateForDisplay(isoDate);
        dueDateDisplay.classList.add("has-value");
    } else {
        dueDateDisplay.textContent = "dd/mm/yyyy";
        dueDateDisplay.classList.remove("has-value");
    }
}

/**
 * Opens the native datepicker for the due date input.
 */
function openDatepicker() {
    let dueDateInput = document.getElementById('add-due-date-input');
    if (!dueDateInput) return;
    if (dueDateInput.showPicker) {
        dueDateInput.showPicker();
    } else {
        dueDateInput.click();
    }
}

// ===================== ADD TASK BUTTONS =====================

/**
 * Initializes all "Add Task" buttons so that new tasks open in the correct column.
 */
function initAddTaskButtons() {
    addButtons.forEach((btn) => {
        btn.addEventListener('click', () => handleAddTaskButtonClick(btn));
    });
}

/**
 * Handles the click event for a specific "Add Task" button.
 * Determines the correct status and triggers the add task modal (desktop)
 * or redirects to add-task.html (mobile).
 * 
 * @param {HTMLElement} btn - The clicked button element.
 */
function handleAddTaskButtonClick(btn) {
    let column = btn.closest('.task-column');
    let statusFromColumn = column?.dataset?.status;
    let statusFromButton = btn.dataset?.status;
    let status = statusFromColumn || statusFromButton || 'todo';

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (isMobile) {
        window.location.href = `addtask.html?status=${status}`;
        return;
    }

    currentNewTask = currentNewTask || {};
    currentNewTask.status = status;

    let globalAddBtn = document.getElementById('add-task-btn');
    if (globalAddBtn) {
        globalAddBtn.click();
    } else {
        let evt = new CustomEvent('openAddTaskModal', { detail: { status } });
        document.dispatchEvent(evt);
    }
}


// ===================== INITIALIZATION =====================
document.addEventListener('DOMContentLoaded', async () => {
    await loadUsers();
    await loadTasksForBoard();
    renderBoard();
    initAddTaskButtons();
});