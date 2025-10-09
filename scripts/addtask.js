const categories = ["Technical Task", "User Story"];
const titleInput = document.querySelector(".title-input");
const titleError = document.querySelector(".error-message");
titleInput.addEventListener("input", handleTitleValidation);
titleInput.addEventListener("blur", handleTitleValidation);
let users = [];

function handleTitleValidation() {
    const isEmpty = !titleInput.value.trim();
    titleInput.style.borderBottom = isEmpty ? "1px solid #FF4D4D" : "1px solid #D1D1D1";
    titleError.style.display = isEmpty ? "block" : "none";
}

const dueDateInput = document.querySelector(".due-date-input");
const dueDateDisplay = document.querySelector(".due-date-display");
const dueDateIcon = document.querySelector(".due-date-icon-container");
const dueDateContainer = document.querySelector(".due-date-content");
const dueDateError = document.querySelector(".due-date-container .error-message");

function formatDateForDisplay(isoDate) {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
}

function handleDueDateValidation() {
    const hasValue = dueDateInput.value.trim();
    dueDateDisplay.textContent = hasValue ? formatDateForDisplay(dueDateInput.value) : "dd/mm/yyyy";
    dueDateDisplay.classList.toggle("has-value", !!hasValue);
    dueDateContainer.style.borderBottom = hasValue ? "1px solid #D1D1D1" : "1px solid #FF4D4D";
    dueDateError.style.display = hasValue ? "none" : "block";
}

dueDateInput.addEventListener("input", handleDueDateValidation);
dueDateInput.addEventListener("blur", handleDueDateValidation);

function openDatepicker() {
    if (dueDateInput.showPicker) dueDateInput.showPicker();
    else dueDateInput.click();
}

dueDateIcon.addEventListener("click", openDatepicker);
dueDateContainer.addEventListener("click", openDatepicker);

const buttons = document.querySelectorAll(".priority-frame");
buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

const arrowContainer = document.querySelector('.assigned-content');
const assignedDropdown = document.getElementById('assigned-dropdown');
arrowContainer.addEventListener('click', (event) => {
    event.stopPropagation();
    assignedDropdown.classList.toggle('show');
});

document.addEventListener('click', (event) => {
    if (!assignedDropdown.contains(event.target) && event.target !==
        arrowContainer) {
        assignedDropdown.style.display = 'none';
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    const assignedContent = document.querySelector('.assigned-content');
    const assignedTextContainer = assignedContent.querySelector('.assigned-text-container');
    const assignedText = assignedTextContainer.querySelector('.assigned-text');
    const assignedInput = assignedContent.querySelector('.assigned-input');
    const arrowContainer = assignedContent.querySelector('.assigned-arrow-container');
    const arrowIcon = arrowContainer.querySelector('img');
    const assignedDropdown = document.getElementById('assigned-dropdown');
    const selectedAvatarsContainer = document.querySelector(".selected-avatars-container");


    async function loadUsers() {
        try {
            const res = await fetch("https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/users.json");
            const data = await res.json();
            users = data
                ? Object.entries(data).map(([id, user]) => ({
                    id,
                    ...user
                }))
                : [];
            populateDropdown();
        } catch (e) {
            console.error("Fehler beim Laden der Users", e);
        }
    }

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

    function createUserDropdownItem(user) {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        div.dataset.userId = user.id;
        div.appendChild(createAssignedWrapper(user));
        div.appendChild(createCheckboxWrapper(user));
        return div;
    }

    function createAssignedWrapper(user) {
        const wrapper = document.createElement('div');
        wrapper.className = 'assigned-wrapper';
        const avatar = document.createElement('div');
        avatar.className = 'dropdown-avatar';
        avatar.textContent = user.initials;
        avatar.style.backgroundColor = user.color;
        const name = document.createElement('span');
        name.textContent = user.name;
        wrapper.appendChild(avatar);
        wrapper.appendChild(name);
        return wrapper;
    }

    function createCheckboxWrapper(user) {
        const wrapper = document.createElement('div');
        wrapper.className = 'checkbox-wrapper';
        const overlay = document.createElement('div');
        overlay.className = 'hover-overlay';
        const checkbox = document.createElement('img');
        checkbox.src = "./assets/icons-addtask/Property 1=Default.png";
        wrapper.appendChild(overlay);
        wrapper.appendChild(checkbox);
        wrapper.addEventListener('click', (e) => toggleUserSelection(e, wrapper, checkbox));
        return wrapper;
    }

    function toggleUserSelection(e, wrapper, checkbox) {
        e.stopPropagation();
        const isChecked = wrapper.classList.toggle('checked');
        checkbox.src = isChecked
            ? "./assets/icons-addtask/Property 1=checked.svg"
            : "./assets/icons-addtask/Property 1=Default.png";
        updateSelectedAvatars();
    }

    function populateDropdown() {
        assignedDropdown.innerHTML = "";
        users.forEach(user => {
            const item = createUserDropdownItem(user);
            assignedDropdown.appendChild(item);
        });
    }

    function toggleDropdown(e) {
        e.stopPropagation();
        const isOpen = assignedDropdown.classList.contains('open');
        isOpen ? closeAssignedDropdown() : openAssignedDropdown();
    }

    function openAssignedDropdown() {
        assignedDropdown.classList.add('open');
        assignedDropdown.style.display = 'block';
        assignedInput.style.display = 'inline';
        assignedText.style.display = 'none';
        arrowIcon.src = '/assets/icons-addtask/arrow_drop_down_up.png';
        assignedInput.focus();
        showAllCheckboxes();
    }

    function closeAssignedDropdown() {
        assignedDropdown.classList.remove('open');
        assignedDropdown.style.display = 'none';
        assignedInput.style.display = 'none';
        assignedText.style.display = 'block';
        arrowIcon.src = '/assets/icons-addtask/arrow_drop_down.png';
        assignedInput.value = '';
    }

    function showAllCheckboxes() {
        Array.from(assignedDropdown.children).forEach(div => {
            div.querySelector('.checkbox-wrapper').style.display = 'flex';
        });
    }

    // Events bleiben gleich
    assignedTextContainer.addEventListener('click', toggleDropdown);
    arrowContainer.addEventListener('click', toggleDropdown);

    document.addEventListener('click', e => {
        if (!assignedTextContainer.contains(e.target) && !arrowContainer.contains(e.target)) {
            assignedDropdown.classList.remove('open');
            assignedDropdown.style.display = 'none';
            assignedInput.style.display = 'none';
            assignedText.style.display = 'block';
            arrowIcon.src = '/assets/icons-addtask/arrow_drop_down.png';
            Array.from(assignedDropdown.children).forEach(div => {
                const checkboxWrapper = div.querySelector('.checkbox-wrapper');
                const checkbox = checkboxWrapper.querySelector('img');
                if (checkbox.src.includes('checked')) {
                    checkboxWrapper.style.display = 'flex';
                } else {
                    checkboxWrapper.style.display = 'none';
                }
            });
        }
    });

    // ---------- Filter input ----------
    assignedInput.addEventListener('input', () => {
        const filter = assignedInput.value.toLowerCase();
        Array.from(assignedDropdown.children).forEach(div => {
            const name = div.querySelector('span').textContent.toLowerCase();
            div.style.display = name.includes(filter) ? 'flex' : 'none';
        });
    });
    await loadUsers();
});

// ===================== CATEGORY ===================== 
const categoryContent = document.querySelector('.category-content');
const categoryText = categoryContent.querySelector('.assigned-text');
const categoryArrow = categoryContent.querySelector('#assigned-arrow-icon');
const categoryDropdown = document.createElement('div');
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

// // ===================== SUBTASK DROPDOWN ===================== 
const taskInput = document.querySelector("#subtask-text");
const checkBtn = document.querySelector("#check-btn");
const cancelBtn = document.querySelector("#cancel-btn");
const subtaskList = document.querySelector("#subtask-list");

taskInput.addEventListener("input", () => {
    if (taskInput.value.trim() !== "") {
        checkBtn.style.display = "inline";
    } else { resetInput(); }
});
checkBtn.addEventListener("click", () => handleAddSubtask());

/* ---------- Subtask-Hinzufügen ---------- */

function handleAddSubtask() {
    const currentTask = taskInput.value.trim();
    if (!currentTask) return;

    const li = createSubtaskElement(currentTask);
    subtaskList.appendChild(li);
    resetInput();
}

/* ---------- Subtask-Element erstellen ---------- */

function createSubtaskElement(text) {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = text;
    li.appendChild(span);
    const icons = createSubtaskIcons(li, span);
    li.appendChild(icons);
    return li;
}

/* ---------- Icons + Events ---------- */

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
        () => subtaskList.removeChild(li)
    );
    icons.append(editIcon, deleteIcon);
    return icons;
}

function createIcon(src, alt, onClick) {
    const icon = document.createElement("img");
    icon.src = src;
    icon.alt = alt;
    icon.addEventListener("click", onClick);
    return icon;
}

cancelBtn.addEventListener("click", resetInput);
function resetInput() { taskInput.value = ""; checkBtn.style.display = "none"; cancelBtn.style.display = "none"; }
function startEditMode(li, span) {
    const input = document.createElement("input"); input.type = "text"; input.value = span.textContent; input.classList.add("subtask-edit-input"); const saveIcon = document.createElement("img"); saveIcon.src = "./assets/icons-addtask/Subtask's icons (1).png";
    saveIcon.alt = "Save"; saveIcon.addEventListener("click", () => { span.textContent = input.value.trim() || span.textContent; li.replaceChild(span, input); li.replaceChild(defaultIcons, actionIcons); }); const deleteIcon = document.createElement("img"); deleteIcon.src = "./assets/icons-addtask/Property 1=delete.png"; deleteIcon.alt = "Delete"; deleteIcon.addEventListener("click", () => { subtaskList.removeChild(li); }); const actionIcons = document.createElement("div"); actionIcons.classList.add("subtask-icons"); actionIcons.appendChild(saveIcon); actionIcons.appendChild(deleteIcon); const defaultIcons = li.querySelector(".subtask-icons"); li.replaceChild(input, span); li.replaceChild(actionIcons, defaultIcons); input.focus();
}

// ----------------------------
// Funktion: Task-Daten auslesen
// ----------------------------
function getTaskData() {
    return {
        title: getTitle(),
        description: getDescription(),
        dueDate: getDueDate(),
        priority: getPriority(),
        assignedUsersFull: getAssignedUsers(),
        category: getCategory(),
        subtasks: getSubtasks(),
    };
}

function getTitle() {
    const title = document.querySelector(".title-input").value.trim();
    return title;
}

function getDescription() {
    return document.querySelector(".description-input").value.trim();
}

function getDueDate() {
    return document.querySelector(".due-date-input").value;
}

function getPriority() {
    const priorityBtn = document.querySelector(".priority-frame.active");
    return priorityBtn ? priorityBtn.textContent.trim().toLowerCase() : "medium";
}

function getAssignedUsers() {
    if (!assignedDropdown) return [];
    const selected = [];
    assignedDropdown.querySelectorAll(".checkbox-wrapper.checked").forEach(wrapper => {
        const div = wrapper.closest(".dropdown-item");
        const userId = div.dataset.userId;
        const user = users.find(u => u.id === userId);
        if (user) selected.push(formatUser(user));
    });
    return selected;
}

function formatUser(user) {
    return {
        id: user.id,
        name: user.name,
        initials: user.initials,
        color: user.color,
    };
}

function getCategory() {
    const categoryEl = document.querySelector(".category-content .assigned-text");
    return categoryEl ? categoryEl.textContent.trim() : null;
}

function getSubtasks() {
    const subtaskInputs = document.querySelectorAll(".subtask-input");
    return Array.from(subtaskInputs)
        .map(input => input.value.trim())
        .filter(title => title.length > 0)
        .map(title => ({ title, done: false }));
}


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
const createBtn = document.getElementById('create-btn');
// ===================== CREATE BUTTON HANDLER (refactored) =====================

createBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    createBtn.classList.add("active");
    const taskData = getTaskData();
    const hasError = validateForm(taskData);
    if (hasError) return;
    await handleTaskCreation(taskData);
    createBtn.classList.remove("active");
});

/* ---------- VALIDIERUNG ---------- */
function validateForm(taskData) {
    let hasError = false;
    if (!validateTitle(taskData.title)) hasError = true;
    if (!validateDueDate(taskData.dueDate)) hasError = true;
    if (!validateCategory(taskData.category)) hasError = true;
    return hasError;
}

function validateTitle(title) {
    const titleInput = document.querySelector(".title-input");
    const titleError = document.querySelector(".error-message");
    const valid = !!title.trim();
    setValidationState(titleInput, titleError, valid);
    return valid;
}

function validateDueDate(dueDate) {
    const container = document.querySelector(".due-date-content");
    const error = document.querySelector(".due-date-container .error-message");
    const valid = !!dueDate;
    setValidationState(container, error, valid);
    return valid;
}

function validateCategory(category) {
    const content = document.querySelector(".category-content");
    const error = document.querySelector(".category-container .error-message");
    const valid = category && category !== "Select task category";
    setValidationState(content, error, valid);
    return valid;
}

function setValidationState(element, errorEl, isValid) {
    element.style.borderBottom = isValid
        ? "1px solid #D1D1D1"
        : "1px solid #FF4D4D";
    errorEl.style.display = isValid ? "none" : "block";
}

/* ---------- SPEICHER- UND UI-LOGIK ---------- */

async function handleTaskCreation(taskData) {
    const originalText = createBtn.textContent;
    createBtn.textContent = "Saving...";
    createBtn.disabled = true;
    try {
        const newTask = await saveTask(taskData);
        if (newTask) {
            showTaskAddedMessage(() => closeModal());
            resetForm();
        }
    } catch (err) {
        console.error("❌ Fehler beim Erstellen der Task:", err);
    } finally {
        createBtn.disabled = false;
        createBtn.textContent = originalText;
    }
}

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

function showTaskAddedMessage() {
    const img = document.createElement("img");
    img.src = "./assets/icons-addtask/Added to board 1.png";
    img.alt = "Task added to Board";
    img.classList.add("task-added-message");
    document.body.appendChild(img);
    requestAnimationFrame(() => {
        img.classList.add("show");
    });
    setTimeout(() => {
        img.classList.remove("show");
        img.classList.add("hide");
        img.addEventListener("transitionend", () => img.remove());
    }, 800);
}