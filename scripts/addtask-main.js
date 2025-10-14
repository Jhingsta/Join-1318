/* ================================================
   TASK CREATION & UI LOGIC SCRIPT
   ================================================ */

/* ---------- GLOBAL VARIABLES ---------- */
const categories = ["Technical Task", "User Story"];
const titleInput = document.querySelector(".title-input");
const titleError = document.querySelector(".error-message");
titleInput.addEventListener("input", handleTitleValidation);
titleInput.addEventListener("blur", handleTitleValidation);
users = [];

const dueDateInput = document.querySelector(".due-date-input");
const dueDateDisplay = document.querySelector(".due-date-display");
const dueDateIcon = document.querySelector(".due-date-icon-container");
const dueDateContainer = document.querySelector(".due-date-content");
const dueDateError = document.querySelector(".due-date-container .error-message");

const assignedContent = document.querySelector('.assigned-content');
const assignedTextContainer = assignedContent.querySelector('.assigned-text-container');
const assignedText = assignedTextContainer.querySelector('.assigned-text');
const assignedInput = assignedContent.querySelector('.assigned-input');
const arrowContainer = document.querySelector('.assigned-content');
const assignedDropdown = document.getElementById('assigned-dropdown');
const selectedAvatarsContainer = document.querySelector(".selected-avatars-container");
const arrowIcon = arrowContainer.querySelector('img');

const categoryContent = document.querySelector('.category-content');
const categoryText = categoryContent.querySelector('.assigned-text');
const categoryArrow = categoryContent.querySelector('#assigned-arrow-icon');
const categoryDropdown = document.createElement('div');

const taskInput = document.querySelector("#subtask-text");
const checkBtn = document.querySelector("#check-btn");
const cancelBtn = document.querySelector("#cancel-btn");
const subtaskList = document.querySelector("#subtask-list");
const buttons = document.querySelectorAll(".priority-frame");
const createBtn = document.getElementById('create-btn');


/* ================================================
   TITLE VALIDATION
   ================================================ */
/**
 * Validates the title input field.
 * Shows an error and red border if empty, otherwise hides error.
 */
function handleTitleValidation() {
    const isEmpty = !titleInput.value.trim();
    titleInput.style.borderBottom = isEmpty ? "1px solid #FF4D4D" : "1px solid #D1D1D1";
    titleError.style.display = isEmpty ? "block" : "none";
}


/* ================================================
   DUE DATE HANDLING
   ================================================ */
/**
 * Converts ISO date (YYYY-MM-DD) to display format (DD/MM/YYYY)
 */
function formatDateForDisplay(isoDate) {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
}

/**
 * Validates due date input and updates displayed date format.
 */
function handleDueDateValidation() {
    const hasValue = dueDateInput.value.trim();
    dueDateDisplay.textContent = hasValue ? formatDateForDisplay(dueDateInput.value) : "dd/mm/yyyy";
    dueDateDisplay.classList.toggle("has-value", !!hasValue);
    dueDateContainer.style.borderBottom = hasValue ? "1px solid #D1D1D1" : "1px solid #FF4D4D";
    dueDateError.style.display = hasValue ? "none" : "block";
}

dueDateInput.addEventListener("input", handleDueDateValidation);
dueDateInput.addEventListener("blur", handleDueDateValidation);

/**
 * Opens the native date picker when clicking icon or container.
 */
function openDatepicker() {
    if (dueDateInput.showPicker) dueDateInput.showPicker();
    else dueDateInput.click();
}
dueDateIcon.addEventListener("click", openDatepicker);
dueDateContainer.addEventListener("click", openDatepicker);


/* ================================================
   PRIORITY BUTTON SELECTION
   ================================================ */
/**
 * Handles active state toggle between priority buttons.
 */
buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});


/* ================================================
   ASSIGN USERS DROPDOWN
   ================================================ */
/**
 * Toggles visibility of user dropdown on arrow click.
 */
arrowContainer.addEventListener('click', (event) => {
    event.stopPropagation();
    assignedDropdown.classList.toggle('show');
});

/**
 * Closes dropdown if click happens outside.
 */
document.addEventListener('click', (event) => {
    if (!assignedDropdown.contains(event.target) && event.target !== arrowContainer) {
        assignedDropdown.style.display = 'none';
    }
});

/**
 * Fetches users from Firebase Realtime Database and populates dropdown.
 */
async function loadUsers() {
    try {
        const res = await fetch("https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/users.json");
        const data = await res.json();
        users = data
            ? Object.entries(data).map(([id, user]) => ({ id, ...user }))
            : [];
        populateDropdown();
    } catch (e) {
        console.error("Fehler beim Laden der Users", e);
    }
}

/**
 * Updates displayed avatars of selected users (max. 3 shown).
 */
function updateSelectedAvatars() {
    selectedAvatarsContainer.innerHTML = "";
    const selected = users.filter((u, i) => {
        const img = assignedDropdown.children[i].querySelector('img');
        return img.src.includes("checked");
    }).slice(0, 3);

    selected.forEach(user => {
        const a = document.createElement('div');
        a.className = 'selected-avatar';
        a.textContent = user.initials;
        a.style.backgroundColor = user.color;
        selectedAvatarsContainer.appendChild(a);
    });
    selectedAvatarsContainer.style.display = selected.length > 0 ? 'flex' : 'none';
}

/**
 * Creates a single dropdown item for a user.
 */
function createUserDropdownItem(user) {
    const div = document.createElement('div');
    div.className = 'dropdown-item';
    div.dataset.userId = user.id;
    div.appendChild(createAssignedWrapper(user));
    div.appendChild(createCheckboxWrapper(user));
    return div;
}

/**
 * Creates avatar and name wrapper for dropdown.
 */
function createAssignedWrapper(user) {
    const wrapper = document.createElement('div');
    wrapper.className = 'assigned-wrapper';
    const avatar = document.createElement('div');
    avatar.className = 'dropdown-avatar';
    avatar.textContent = user.initials;
    avatar.style.backgroundColor = user.color;
    const name = document.createElement('span');
    name.textContent = user.name;
    wrapper.append(avatar, name);
    return wrapper;
}

/**
 * Creates clickable checkbox wrapper for each dropdown item.
 */
function createCheckboxWrapper(user) {
    const wrapper = document.createElement('div');
    wrapper.className = 'checkbox-wrapper';
    const overlay = document.createElement('div');
    overlay.className = 'hover-overlay';
    const checkbox = document.createElement('img');
    checkbox.src = "./assets/icons-addtask/Property 1=Default.png";
    wrapper.append(overlay, checkbox);
    wrapper.addEventListener('click', (e) => toggleUserSelection(e, wrapper, checkbox));
    return wrapper;
}

/**
 * Toggles user selection and updates avatar display.
 */
function toggleUserSelection(e, wrapper, checkbox) {
    e.stopPropagation();
    const isChecked = wrapper.classList.toggle('checked');
    checkbox.src = isChecked
        ? "./assets/icons-addtask/Property 1=checked.svg"
        : "./assets/icons-addtask/Property 1=Default.png";
    updateSelectedAvatars();
}

/**
 * Populates dropdown with all loaded users.
 */
function populateDropdown() {
    assignedDropdown.innerHTML = "";
    users.forEach(user => {
        assignedDropdown.appendChild(createUserDropdownItem(user));
    });
}

/**
 * Handles dropdown toggle behavior.
 */
function toggleDropdown(e) {
    e.stopPropagation();
    const isOpen = assignedDropdown.classList.contains('open');
    isOpen ? closeAssignedDropdown() : openAssignedDropdown();
}

/**
 * Opens assigned users dropdown.
 */
function openAssignedDropdown() {
    assignedDropdown.classList.add('open');
    assignedDropdown.style.display = 'block';
    assignedInput.style.display = 'inline';
    assignedText.style.display = 'none';
    arrowIcon.src = '/assets/icons-addtask/arrow_drop_down_up.png';
    assignedInput.focus();
    showAllCheckboxes();
}

/**
 * Closes assigned users dropdown.
 */
function closeAssignedDropdown() {
    assignedDropdown.classList.remove('open');
    assignedDropdown.style.display = 'none';
    assignedInput.style.display = 'none';
    assignedText.style.display = 'block';
    arrowIcon.src = '/assets/icons-addtask/arrow_drop_down.png';
    assignedInput.value = '';
}

/**
 * Ensures all checkboxes are visible.
 */
function showAllCheckboxes() {
    Array.from(assignedDropdown.children).forEach(div => {
        div.querySelector('.checkbox-wrapper').style.display = 'flex';
    });
}

// Event bindings for open/close dropdown
assignedTextContainer.addEventListener('click', toggleDropdown);
arrowContainer.addEventListener('click', toggleDropdown);

/**
 * Closes dropdown when clicking outside of it.
 */
document.addEventListener('click', e => {
    if (!assignedTextContainer.contains(e.target) && !arrowContainer.contains(e.target)) {
        closeAssignedDropdown();
        Array.from(assignedDropdown.children).forEach(div => {
            const checkboxWrapper = div.querySelector('.checkbox-wrapper');
            const checkbox = checkboxWrapper.querySelector('img');
            checkboxWrapper.style.display = checkbox.src.includes('checked') ? 'flex' : 'none';
        });
    }
});

/**
 * Filters users in dropdown as you type.
 */
assignedInput.addEventListener('input', () => {
    const filter = assignedInput.value.toLowerCase();
    Array.from(assignedDropdown.children).forEach(div => {
        const name = div.querySelector('span').textContent.toLowerCase();
        div.style.display = name.includes(filter) ? 'flex' : 'none';
    });
});

loadUsers();


/* ================================================
   CATEGORY DROPDOWN
   ================================================ */
categoryDropdown.className = 'dropdown-menu';
categories.forEach(cat => {
    const div = document.createElement('div');
    div.className = 'dropdown-item';
    div.textContent = cat;
    div.addEventListener('click', (e) => {
        e.stopPropagation();
        categoryText.textContent = cat;
        categoryDropdown.classList.remove('show');
    });
    categoryDropdown.appendChild(div);
});
categoryContent.appendChild(categoryDropdown);

/**
 * Opens and closes the category dropdown.
 */
categoryContent.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = categoryDropdown.classList.contains('show');
    categoryDropdown.classList.toggle('show', !isOpen);
    categoryArrow.src = !isOpen
        ? '/assets/icons-addtask/arrow_drop_down_up.png'
        : '/assets/icons-addtask/arrow_drop_down.png';
});

/**
 * Closes category dropdown on outside click.
 */
document.addEventListener('click', (e) => {
    if (!categoryContent.contains(e.target)) {
        categoryDropdown.classList.remove('show');
        categoryArrow.src = '/assets/icons-addtask/arrow_drop_down.png';
    }
});


/* ================================================
   SUBTASK HANDLING
   ================================================ */
/**
 * Shows confirm button when typing new subtask.
 */
taskInput.addEventListener("input", () => {
    if (taskInput.value.trim() !== "") {
        checkBtn.style.display = "inline";
    } else { resetInput(); }
});

checkBtn.addEventListener("click", () => handleAddSubtask());

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
 * Creates a subtask <li> element with text and icons.
 */
function createSubtaskElement(text) {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = text;
    li.appendChild(span);
    const icons = createSubtaskIcons(li, span);
    li.appendChild(icons);
    return li;
}

/**
 * Creates edit and delete icons for a subtask.
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
 * Helper for creating an <img> icon element.
 */
function createIcon(src, alt, onClick) {
    const icon = document.createElement("img");
    icon.src = src;
    icon.alt = alt;
    icon.addEventListener("click", onClick);
    return icon;
}

/**
 * Resets subtask input and hides buttons.
 */
cancelBtn.addEventListener("click", resetInput);
function resetInput() {
    taskInput.value = "";
    checkBtn.style.display = "none";
    cancelBtn.style.display = "none";
}

/**
 * Enables editing mode for a subtask.
 */
function startEditMode(li, span) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = span.textContent;
    input.classList.add("subtask-edit-input");

    const saveIcon = document.createElement("img");
    saveIcon.src = "./assets/icons-addtask/Subtask's icons (1).png";
    saveIcon.alt = "Save";
    saveIcon.addEventListener("click", () => {
        span.textContent = input.value.trim() || span.textContent;
        li.replaceChild(span, input);
        li.replaceChild(defaultIcons, actionIcons);
    });
    const deleteIcon = document.createElement("img");
    deleteIcon.src = "./assets/icons-addtask/Property 1=delete.png";
    deleteIcon.alt = "Delete";
    deleteIcon.addEventListener("click", () => { subtaskList.removeChild(li); });
    const actionIcons = document.createElement("div");
    actionIcons.classList.add("subtask-icons");
    actionIcons.append(saveIcon, deleteIcon);
    const defaultIcons = li.querySelector(".subtask-icons");
    li.replaceChild(input, span);
    li.replaceChild(actionIcons, defaultIcons);
    input.focus();
}

/* ================================================
   FORM VALIDATION & TASK CREATION
   ================================================ */
/**
 * Validates form fields before creating task.
 */
const dueDateContent = document.querySelector(".due-date-content");
dueDateContent.addEventListener("input", () => {
    if (dueDateContent.textContent.trim()) {
        dueDateContent.style.borderBottom = "1px solid #D1D1D1";
        dueDateError.style.display = "none";
    }
});

const categoryError = document.querySelector(".category-container .error-message");
categoryContent.addEventListener("click", () => {
    if (categoryContent.textContent.trim() && categoryContent.textContent !== "Select task category") {
        categoryContent.style.borderBottom = "1px solid #D1D1D1";
        categoryError.style.display = "none";
    }
});

/**
 * Handles Create Task button click.
 * Validates form, then saves task via Firebase.
 */
createBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    createBtn.classList.add("active");
    const taskData = getTaskData();
    const hasError = validateForm(taskData);
    if (hasError) return;
    await handleTaskCreation(taskData);
    createBtn.classList.remove("active");
});

/**
 * Handles asynchronous task saving and feedback UI.
 */
async function handleTaskCreation(taskData) {
    const originalText = createBtn.textContent;
    createBtn.textContent = "Saving...";
    createBtn.disabled = true;
    try {
        const newTask = await saveTask(taskData);
        if (newTask) {
            showTaskAddedMessage();
            resetForm();
        }
    } catch (err) {
        console.error("❌ Fehler beim Erstellen der Task:", err);
    } finally {
        createBtn.disabled = false;
        createBtn.textContent = originalText;
    }
}

/**
 * Sends new task data to Firebase and stores locally.
 */
let tasks = [];
async function saveTask(taskData) {
    try {
        const newTask = await createTask({
            title: taskData.title,
            description: taskData.description,
            dueDate: taskData.dueDate,
            priority: taskData.priority,
            assignedUsersFull: taskData.assignedUsersFull,
            category: taskData.category,
            subtasks: taskData.subtasks
        });
        tasks.push(newTask);
        return newTask;
    } catch (error) {
        console.error("❌ Fehler beim Speichern:", error);
        throw error;
    }
}

/**
 * Resets the entire Add Task form to default state.
 */
function resetForm() {
    document.querySelector(".title-input").value = "";
    document.querySelector(".description-input").value = "";
    document.querySelector(".due-date-input").value = "";
    dueDateDisplay.textContent = "dd/mm/yyyy";
    dueDateDisplay.classList.remove("has-value");
    document.querySelector(".selected-avatars-container").innerHTML = "";
    document.querySelector("#subtask-list").innerHTML = "";
    document.querySelectorAll(".priority-frame").forEach(btn => btn.classList.remove("active"));
    document.querySelector(".priority-frame:nth-child(2)").classList.add("active");
    const categoryText = document.querySelector(".category-content .assigned-text");
    if (categoryText) categoryText.textContent = "Select task category";
}

/**
 * Displays a short visual feedback message when task is saved.
 */
function showTaskAddedMessage() {
    const img = document.createElement("img");
    img.src = "./assets/icons-addtask/Added to board 1.png";
    img.alt = "Task added to Board";
    img.classList.add("task-added-message");
    document.body.appendChild(img);
    requestAnimationFrame(() => img.classList.add("show"));
    setTimeout(() => {
        img.classList.remove("show");
        img.classList.add("hide");
        img.addEventListener("transitionend", () => img.remove());
    }, 800);
}
