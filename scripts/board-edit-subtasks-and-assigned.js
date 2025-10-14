// ===================== SUBTASK RENDERING =====================

/**
 * Renders all subtasks for a given task.
 * 
 * @param {Object} task - Task object
 */
function renderEditSubtasks(task) {
    let list = document.getElementById("edit-subtask-list");
    if (!list) return;

    list.innerHTML = "";
    if (!task.subtasks?.items || !Array.isArray(task.subtasks.items)) {
        task.subtasks = { items: [], completed: 0, total: 0 };
    }

    task.subtasks.items.forEach((st, index) => {
        list.appendChild(createSubtaskItem(task, st, index));
    });
}

/**
 * Creates a single subtask list item element.
 * 
 * @param {Object} task - Task object
 * @param {Object} subtask - Subtask object
 * @param {number} index - Index of subtask in array
 */
function createSubtaskItem(task, subtask, index) {
    let li = document.createElement("li");
    li.className = "subtask-item";

    let span = document.createElement("span");
    span.textContent = subtask.title;
    span.className = "subtask-text";

    let iconsDiv = createSubtaskIcons(task, li, span, index);

    li.append(span, iconsDiv);
    return li;
}

/**
 * Creates the icons div for a subtask item with edit and delete functionality.
 * 
 * @param {Object} task - Task object
 * @param {HTMLElement} li - The <li> element of the subtask
 * @param {HTMLElement} span - The text span of the subtask
 * @param {number} index - Index of subtask in array
 */
function createSubtaskIcons(task, li, span, index) {
    let editIcon = document.createElement("img");
    editIcon.src = "./assets/icons-addtask/Property 1=edit.png";
    editIcon.alt = "Edit";
    editIcon.addEventListener("click", () => startEditSubtaskMode(task, li, span, index));

    let deleteIcon = document.createElement("img");
    deleteIcon.src = "./assets/icons-addtask/Property 1=delete.png";
    deleteIcon.alt = "Delete";
    deleteIcon.addEventListener("click", () => deleteSubtask(task, index));

    let div = document.createElement("div");
    div.className = "subtask-icons";
    div.append(editIcon, deleteIcon);

    return div;
}

/**
 * Deletes a subtask and updates the task.
 * 
 * @param {Object} task
 * @param {number} index
 */
async function deleteSubtask(task, index) {
    task.subtasks.items.splice(index, 1);
    task.subtasks.total = task.subtasks.items.length;
    task.subtasks.completed = task.subtasks.items.filter(st => st.done).length;
    await updateTask(task.id, { subtasks: task.subtasks });
    renderEditSubtasks(task);
}

/**
 * Starts editing mode for a subtask.
 * 
 * @param {Object} task
 * @param {HTMLElement} li
 * @param {HTMLElement} span
 * @param {number} index
 */
function startEditSubtaskMode(task, li, span, index) {
    let input = document.createElement("input");
    input.type = "text";
    input.value = span.textContent;
    input.className = "subtask-edit-input";

    let iconsDiv = createSubtaskEditIcons(task, input, li, index);

    li.innerHTML = "";
    li.append(input, iconsDiv);
    input.focus();
}

/**
 * Creates the icons div for editing a subtask (save and cancel).
 * 
 * @param {Object} task - Task object
 * @param {HTMLInputElement} input - Input element for editing
 * @param {HTMLElement} li - <li> element of the subtask
 * @param {number} index - Index of subtask
 */
function createSubtaskEditIcons(task, input, li, index) {
    let saveIcon = createSaveIcon(task, input, index);
    let cancelIcon = createCancelIcon(task);
    let div = document.createElement("div");
    div.className = "subtask-icons";
    div.append(saveIcon, cancelIcon);
    return div;
}

/**
 * Creates the save icon for a subtask edit.
 * 
 * @param {Object} task
 * @param {HTMLInputElement} input
 * @param {number} index
 */
function createSaveIcon(task, input, index) {
    let saveIcon = document.createElement("img");
    saveIcon.src = "./assets/icons-addtask/Subtask's icons (1).png";
    saveIcon.alt = "Save";
    saveIcon.addEventListener("click", async () => {
        let text = input.value.trim();
        if (!text) return;
        task.subtasks.items[index].title = text;
        task.subtasks.total = task.subtasks.items.length;
        task.subtasks.completed = task.subtasks.items.filter(st => st.done).length;
        await updateTask(task.id, { subtasks: task.subtasks });
        renderEditSubtasks(task);
    });
    return saveIcon;
}

/**
 * Creates the cancel icon for a subtask edit.
 * 
 * @param {Object} task
 */
function createCancelIcon(task) {
    let cancelIcon = document.createElement("img");
    cancelIcon.src = "./assets/icons-addtask/Subtask cancel.png";
    cancelIcon.alt = "Cancel";
    cancelIcon.addEventListener("click", () => renderEditSubtasks(task));
    return cancelIcon;
}

// ===================== ASSIGNED USERS DROPDOWN =====================

/**
 * Renders assigned users dropdown overlay for a task.
 * 
 * @param {Object} task
 */
async function renderAssignedDropdownOverlay(task) {
    let dropdown = document.getElementById("edit-assigned-dropdown");
    if (!dropdown) return;

    dropdown.innerHTML = "";
    task.assignedUsersFull = task.assignedUsersFull || [];

    users.forEach(user => {
        dropdown.appendChild(createAssignedDropdownItem(user, task));
    });

    renderAvatars(task);
}

/**
 * Creates a dropdown item for a user in the assigned users list.
 * 
 * @param {Object} user
 * @param {Object} task
 */
function createAssignedDropdownItem(user, task) {
    let selected = task.assignedUsersFull.some(u => u.id === user.id);

    let item = document.createElement("div");
    item.className = "dropdown-item";
    if (selected) item.classList.add("selected");

    let wrapper = createAssignedWrapper(user);
    let checkboxWrapper = createAssignedCheckbox(selected);

    item.append(wrapper, checkboxWrapper);
    item.addEventListener("click", e => toggleAssignedUser(task, user, item, checkboxWrapper.querySelector(".checkbox-default"), checkboxWrapper.querySelector(".checkbox-checked"), e));

    return item;
}

/**
 * Creates the avatar and label wrapper for a user.
 * 
 * @param {Object} user
 */
function createAssignedWrapper(user) {
    let wrapper = document.createElement("div");
    wrapper.className = "assigned-wrapper";

    let avatar = document.createElement("div");
    avatar.className = "dropdown-avatar";
    avatar.textContent = user.initials;
    avatar.style.backgroundColor = user.color;

    let label = document.createElement("span");
    label.textContent = user.name;

    wrapper.append(avatar, label);
    return wrapper;
}

/**
 * Creates the checkbox wrapper for a dropdown item.
 * 
 * @param {boolean} selected - Whether the item is initially selected
 */
function createAssignedCheckbox(selected) {
    let checkboxWrapper = document.createElement("div");
    checkboxWrapper.className = "checkbox-wrapper";

    let defaultIcon = document.createElement("img");
    defaultIcon.className = "checkbox-default";
    defaultIcon.src = "./assets/icons-addtask/Property 1=Default.png";
    defaultIcon.alt = "unchecked";

    let checkedIcon = document.createElement("img");
    checkedIcon.className = "checkbox-checked";
    checkedIcon.src = "./assets/icons-addtask/Property 1=checked.svg";
    checkedIcon.alt = "checked";

    defaultIcon.style.display = selected ? "none" : "block";
    checkedIcon.style.display = selected ? "block" : "none";

    checkboxWrapper.append(defaultIcon, checkedIcon);
    return checkboxWrapper;
}

/**
 * Toggles assignment of a user in the task.
 * 
 * @param {Object} task
 * @param {Object} user
 * @param {HTMLElement} item
 * @param {HTMLElement} defaultIcon
 * @param {HTMLElement} checkedIcon
 * @param {Event} e
 */
function toggleAssignedUser(task, user, item, defaultIcon, checkedIcon, e) {
    e.stopPropagation();
    let nowSelected = item.classList.toggle("selected");

    if (nowSelected) {
        if (!task.assignedUsersFull.some(u => u.id === user.id)) {
            task.assignedUsersFull.push({ ...user });
        }
        defaultIcon.style.display = "none";
        checkedIcon.style.display = "block";
    } else {
        task.assignedUsersFull = task.assignedUsersFull.filter(u => u.id !== user.id);
        defaultIcon.style.display = "block";
        checkedIcon.style.display = "none";
    }

    renderAvatars(task);
}

// ===================== ADD SUBTASK =====================

/**
 * Adds a new subtask to a task and updates backend.
 * 
 * @param {string} taskId
 * @param {string} title
 */
async function addSubtask(taskId, title) {
    if (!taskId || !title) return;

    let task = getTasks().find(t => t.id === taskId);
    if (!task) return console.error('Task not found:', taskId);

    task.subtasks = task.subtasks || { items: [], total: 0, completed: 0 };
    task.subtasks.items = Array.isArray(task.subtasks.items) ? task.subtasks.items : [];
    task.subtasks.items.push({ title, done: false });
    task.subtasks.total = task.subtasks.items.length;
    task.subtasks.completed = task.subtasks.items.filter(st => st.done).length;

    await updateTask(taskId, { subtasks: task.subtasks });
    renderBoard();
}

// ===================== AVATARS RENDERING =====================

/**
 * Renders avatars for assigned users.
 * 
 * @param {Object} task
 */
function renderAvatars(task) {
    let container = document.getElementById("edit-avatars-container");
    if (!container) return;

    container.innerHTML = "";
    (task.assignedUsersFull || []).forEach(user => {
        container.appendChild(createAvatarDiv(user));
    });
}

/**
 * Creates a single avatar div element.
 * 
 * @param {Object} user
 */
function createAvatarDiv(user) {
    let div = document.createElement("div");
    div.className = "selected-avatar";
    div.textContent = user.initials;
    div.style.backgroundColor = user.color;
    div.dataset.id = user.id;
    div.dataset.fullname = user.name;
    div.dataset.color = user.color;
    div.dataset.initials = user.initials;
    return div;
}