/* ---TASK CREATION & UI LOGIC SCRIPT---*/
/* ---------- GLOBAL VARIABLES ---------- */
const categories = ["Technical Task", "User Story"];
const titleInput = document.querySelector(".title-input");
const titleError = document.querySelector(".error-message");
titleInput.addEventListener("input", handleTitleValidation);
titleInput.addEventListener("blur", handleTitleValidation);
users = [];

const dueDateInput = document.querySelector(".due-date-input");
const today = new Date().toISOString().split("T")[0];
dueDateInput.setAttribute("min", today);
const dueDateDisplay = document.querySelector(".due-date-display");
const dueDateIcon = document.querySelector(".due-date-icon-container");
const dueDateContainer = document.querySelector(".due-date-content");
const dueDateError = document.querySelector(".due-date-container .error-message");

const assignedContent = document.querySelector('.assigned-content');
const assignedTextContainer = assignedContent.querySelector('.assigned-text-container');
const assignedText = assignedTextContainer.querySelector('.assigned-text');
const assignedInput = assignedContent.querySelector('.assigned-input');
const arrowIcon = assignedContent.querySelector('img');
const assignedDropdown = document.getElementById('assigned-dropdown');
const selectedAvatarsContainer = document.querySelector(".selected-avatars-container");

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

/* ---TITLE VALIDATION---*/
/*** Shows an error and red border if empty, otherwise hides error.*/
function handleTitleValidation() {
    const isEmpty = !titleInput.value.trim();
    titleInput.style.borderBottom = isEmpty ? "1px solid #FF4D4D" : "1px solid #D1D1D1";
    titleError.style.display = isEmpty ? "block" : "none";
}

/* ---DUE DATE HANDLING---*/
/*** Converts ISO date (YYYY-MM-DD) to display format (DD/MM/YYYY)*/
function formatDateForDisplay(isoDate) {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
}

/*** Validates due date input and updates displayed date format.*/
function handleDueDateValidation() {
    const hasValue = dueDateInput.value.trim();
    dueDateDisplay.textContent = hasValue ? formatDateForDisplay(dueDateInput.value) : "dd/mm/yyyy";
    dueDateDisplay.classList.toggle("has-value", !!hasValue);
    dueDateContainer.style.borderBottom = hasValue ? "1px solid #D1D1D1" : "1px solid #FF4D4D";
    dueDateError.style.display = hasValue ? "none" : "block";
}

dueDateInput.addEventListener("input", handleDueDateValidation);
dueDateInput.addEventListener("blur", handleDueDateValidation);

/*** Opens the native date picker when clicking icon or container. */
function openDatepicker(e) {
    e.preventDefault();
    try {
        dueDateInput.showPicker?.();
    } catch {
        dueDateInput.focus();
        dueDateInput.click();
    }
}
dueDateIcon.addEventListener("click", openDatepicker);
dueDateContainer.addEventListener("click", openDatepicker);

/* ---PRIORITY BUTTON SELECTION---*/
/*** Handles active state toggle between priority buttons. */
buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

/* ---ASSIGN USERS DROPDOWN--- */
/*** Toggles visibility of user dropdown on arrow click. */
assignedContent.addEventListener('click', (event) => {
    event.stopPropagation();
    assignedDropdown.classList.toggle('show');
});

/*** Closes dropdown if click happens outside. */
document.addEventListener('click', (event) => {
    if (!assignedDropdown.contains(event.target) && event.target !== assignedContent) {
        assignedDropdown.style.display = 'none';
    }
});

/*** Fetches users from Firebase Realtime Database and populates dropdown. */
async function loadUsers() {
    try {
        const res = await fetch("https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/users.json");
        const data = await res.json();
        users = data
            ? Object.entries(data).map(([id, user]) => ({ id, ...user }))
            : [];
        populateDropdown();
    } catch (e) {
        console.error("Error loading users", e);
    }
}

/*** Updates the display of selected user avatars below the dropdown.
 * Shows up to 5 individual avatars, then a "+X" avatar if more are selected.*/
function updateSelectedAvatars() {
    selectedAvatarsContainer.innerHTML = "";
    const selected = users.filter((u, i) => {
        const img = assignedDropdown.children[i].querySelector('img');
        return img.src.includes("checked");
    });
    if (selected.length >= 6) {
        renderAvatarsWithLimit(selected);
    } else {
        renderAllAvatars(selected);
    }
    selectedAvatarsContainer.style.display = selected.length > 0 ? 'flex' : 'none';
}

/*** Renders all user avatars without any limit.* 
 * @param {Array} users - Array of user objects to render as avatars.*/
function renderAllAvatars(users) {
    users.forEach(user => {
        const avatar = createAvatarElement(user);
        selectedAvatarsContainer.appendChild(avatar);
    });
}

/*** Renders the first 5 user avatars and a "+X" avatar for remaining users.* 
 * @param {Array} users - Array of user objects (must contain at least 6 users).*/
function renderAvatarsWithLimit(users) {
    users.slice(0, 5).forEach(user => {
        const avatar = createAvatarElement(user);
        selectedAvatarsContainer.appendChild(avatar);
    });
    const remaining = users.length - 5;
    const plusAvatar = createPlusAvatarElement(remaining);
    selectedAvatarsContainer.appendChild(plusAvatar);
}

/*** Creates a single avatar element for a user.* 
 * @param {Object} user - User object containing initials and color properties.*/
function createAvatarElement(user) {
    const avatar = document.createElement('div');
    avatar.className = 'edit-selected-avatar';
    avatar.textContent = user.initials;
    avatar.style.backgroundColor = user.color;
    return avatar;
}

/*** Creates a "+X" avatar element showing the count of additional users.* 
 * @param {number} count - The number of additional users not displayed.*/
function createPlusAvatarElement(count) {
    const avatar = document.createElement('div');
    avatar.className = 'edit-selected-avatar dropdown-avatar-plus';
    avatar.textContent = `+${count}`;
    return avatar;
}

/*** Creates a single dropdown item for a user. */
function createUserDropdownItem(user) {
    const div = document.createElement('div');
    div.className = 'dropdown-item';
    div.dataset.userId = user.id;
    const assignedWrapper = createAssignedWrapper(user);
    const checkboxWrapper = createCheckboxWrapper(user);
    const checkbox = checkboxWrapper.querySelector('img');
    div.append(assignedWrapper, checkboxWrapper);
    div.addEventListener('click', (e) => {
        if (e.target === checkboxWrapper || e.target.classList.contains('hover-overlay')) return;
        e.stopPropagation();
        const isActive = div.classList.toggle('active');
        checkboxWrapper.classList.toggle('checked', isActive);
        checkbox.src = isActive
            ? "./assets/icons-addtask/Property 1=checked.svg"
            : "./assets/icons-addtask/Property 1=Default.png";
        updateSelectedAvatars();
    });
    return div;
}

/*** Creates avatar and name wrapper for dropdown.*/
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

/*** Creates clickable checkbox wrapper for each dropdown item.*/
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

/*** Toggles user selection and updates avatar display.*/
function toggleUserSelection(e, wrapper, checkbox) {
    e.stopPropagation();
    const isChecked = wrapper.classList.toggle('checked');
    checkbox.src = isChecked
        ? "./assets/icons-addtask/Property 1=checked.svg"
        : "./assets/icons-addtask/Property 1=Default.png";
    updateSelectedAvatars();
    return isChecked;
}

/*** Populates dropdown with all loaded users. */
function populateDropdown() {
    assignedDropdown.innerHTML = "";
    users.forEach(user => {
        assignedDropdown.appendChild(createUserDropdownItem(user));
    });
}

/*** Handles dropdown toggle behavior.*/
function toggleDropdown(e) {
    e.stopPropagation();
    const isOpen = assignedDropdown.classList.contains('open');
    isOpen ? closeAssignedDropdown() : openAssignedDropdown();
}

/*** Opens assigned users dropdown. */
function openAssignedDropdown() {
    assignedDropdown.classList.add('open');
    assignedDropdown.style.display = 'block';
    assignedInput.style.display = 'inline';
    assignedText.style.display = 'none';
    arrowIcon.src = '/assets/icons-addtask/arrow_drop_down_up.png';
    assignedInput.focus();
    showAllCheckboxes();
}

/*** Closes assigned users dropdown.*/
function closeAssignedDropdown() {
    assignedDropdown.classList.remove('open');
    assignedDropdown.style.display = 'none';
    assignedInput.style.display = 'none';
    assignedText.style.display = 'block';
    arrowIcon.src = '/assets/icons-addtask/arrow_drop_down.png';
    assignedInput.value = '';
    Array.from(assignedDropdown.children).forEach(div => {
        div.style.display = 'flex';
    });
}

/*** Ensures all checkboxes are visible.*/
function showAllCheckboxes() {
    Array.from(assignedDropdown.children).forEach(div => {
        div.querySelector('.checkbox-wrapper').style.display = 'flex';
    });
}

// Event bindings for open/close dropdown
assignedTextContainer.addEventListener('click', toggleDropdown);
assignedContent.addEventListener('click', toggleDropdown);
document.addEventListener('click', e => {
    if (!assignedTextContainer.contains(e.target) && !assignedContent.contains(e.target)) {
        closeAssignedDropdown();
        Array.from(assignedDropdown.children).forEach(div => {
            const checkboxWrapper = div.querySelector('.checkbox-wrapper');
            const checkbox = checkboxWrapper.querySelector('img');
            checkboxWrapper.style.display = checkbox.src.includes('checked') ? 'flex' : 'none';
        });
    }
});

/*** Filters users in dropdown as you type. */
assignedInput.addEventListener('input', () => {
    const filter = assignedInput.value.toLowerCase();
    Array.from(assignedDropdown.children).forEach(div => {
        const name = div.querySelector('span').textContent.toLowerCase();
        div.style.display = name.includes(filter) ? 'flex' : 'none';
    });
});
loadUsers();

/* ---CATEGORY DROPDOWN--- */
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

/*** Opens and closes the category dropdown. */
categoryContent.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = categoryDropdown.classList.contains('show');
    categoryDropdown.classList.toggle('show', !isOpen);
    categoryArrow.src = !isOpen
        ? '/assets/icons-addtask/arrow_drop_down_up.png'
        : '/assets/icons-addtask/arrow_drop_down.png';
});
document.addEventListener('click', (e) => {
    if (!categoryContent.contains(e.target)) {
        categoryDropdown.classList.remove('show');
        categoryArrow.src = '/assets/icons-addtask/arrow_drop_down.png';
    }
});

/*** Handles Create Task button click.
 * Validates form, then saves task via Firebase.*/
createBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    createBtn.classList.add("active");
    const taskData = getTaskData();
    const hasError = validateForm(taskData);
    if (hasError) return;
    await handleTaskCreation(taskData);
    createBtn.classList.remove("active");
});

/*** Handles asynchronous task saving and feedback UI.*/
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
        console.error("Error create task:", err);
    } finally {
        createBtn.disabled = false;
        createBtn.textContent = originalText;
    }
}

/*** Sends new task data to Firebase and stores locally.*/
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
        console.error("Error save task:", error);
        throw error;
    }
}

/*** Displays a short visual feedback message when task is saved.*/
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
        window.location.href = "board.html";
    }, 800);
}

// --- CLEAR BUTTON HANDLING ---
const clearBtn = document.querySelector(".clear-btn");
clearBtn.addEventListener("click", (e) => {
    e.preventDefault();
    resetForm();
});