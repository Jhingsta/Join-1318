let tasks = [];
let users = [];
let currentNewTask = null;
let currentTask = null;

document.body.insertAdjacentHTML("beforeend", addTaskModal());
document.body.insertAdjacentHTML('beforeend', taskDetailModal());

const modal = document.getElementById('add-task-modal');
const createBtn = document.getElementById('create-btn');
const addTaskButton = document.getElementById('add-task-btn');
const svgButtons = document.querySelectorAll('.svg-button');

const assignedContent = document.querySelector('.assigned-content');
const assignedTextContainer = assignedContent.querySelector('.assigned-text-container');
const assignedText = assignedTextContainer.querySelector('.assigned-text');
const assignedInput = assignedContent.querySelector('.assigned-input');

const arrowContainer = assignedContent.querySelector('.assigned-arrow-container');
const arrow = assignedContent.querySelector('.assigned-arrow-container');
const arrowIcon = arrowContainer.querySelector('img');

const assignedDropdown = document.getElementById('assigned-dropdown');
const selectedAvatarsContainer = document.querySelector(".selected-avatars-container");

const categoryContent = document.querySelector('.category-content');
const categoryText = categoryContent.querySelector('.assigned-text');
const categoryArrow = categoryContent.querySelector('.assigned-arrow-icon');
const categoryDropdown = document.createElement('div');

const taskInput = document.querySelector("#subtask-text");
const checkBtn = document.querySelector("#check-btn");
const cancelBtn = document.querySelector("#cancel-btn");
const subtaskList = document.querySelector("#subtask-list");

const modalClose = document.getElementById('modal-close');
const closeButton = document.querySelector('.close');

const categories = ["Technical Task", "User Story"];
const titleInput = document.querySelector(".title-input");
const titleError = document.querySelector(".error-message");

const dueDateInput = document.querySelector(".due-date-input");
const dueDateDisplay = document.querySelector(".due-date-display");
const dueDateIcon = document.querySelector(".due-date-icon");
const dueDateContainer = document.querySelector(".due-date-content");
const dueDateError = document.querySelector(".error-message");

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

async function loadUsers() {
    const res = await fetch("https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/users.json");
    const data = await res.json();
    users = data
        ? Object.keys(data).map(key => ({ id: key, ...data[key] }))
        : [];
    populateDropdown();
}

function getTasks() {
    return tasks || [];
}

function closeModal() {
    modal?.classList.add('hidden');
    createBtn?.classList.remove('active');
    addTaskButton?.classList.remove('active-style');
    svgButtons.forEach(btn => {
        const svg = btn.querySelector('svg');
        if (svg) svg.classList.remove('disabled');
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    closeButton?.addEventListener('click', closeModal);
    addTaskButton?.addEventListener('click', openModal);
    loadUsers();

    function openModal() {
        modal?.classList.remove('hidden');
        addTaskButton?.classList.add('active-style');
        currentNewTask = { assignedUsersFull: [] };
        // renderAssignedDropdownModal(currentNewTask);

        svgButtons.forEach(btn => {
            const svg = btn.querySelector('svg');
            if (svg) svg.classList.add('disabled');
        });
    }

    svgButtons.forEach(button => {
        button.addEventListener('click', () => {
            openModal(button);
        });
    });

    closeButton?.addEventListener('click', closeModal);
    modalClose?.addEventListener('click', closeModal);

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    await loadTasksForBoard();
    renderBoard();
});

function renderBoard() {
    const boardTasks = getTasks();

    const columns = {
        todo: document.getElementById('column-todo'),
        inProgress: document.getElementById('column-inProgress'),
        awaitFeedback: document.getElementById('column-awaitFeedback'),
        done: document.getElementById('column-done'),
    };

    Object.values(columns).forEach((el) => el && (el.innerHTML = ''));

    boardTasks.forEach((task) => {
        const card = createTaskCard(task);
        const column = columns[task.status] || columns.todo;
        if (column) {
            column.appendChild(card);
        }
    });

    Object.entries(columns).forEach(([status, columnEl]) => {
        if (!columnEl) return;
        if (columnEl.children.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'task-placeholder';
            placeholder.textContent = `No tasks in ${readableStatus(status)}`;
            columnEl.appendChild(placeholder);
        }
    });
    setTimeout(initializeDragAndDrop, 0);
}

function populateDropdown() {
    if (!assignedDropdown) {
        console.warn('populateDropdown: #assigned-dropdown nicht gefunden.');
        return;
    }
    if (!selectedAvatarsContainer) {
        console.warn('populateDropdown: .selected-avatars-container nicht gefunden.');
        return;
    }

    assignedDropdown.innerHTML = "";

    (users || []).forEach((user) => {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        div.dataset.userId = user.id;

        const wrapper = document.createElement('div');
        wrapper.className = 'assigned-wrapper';

        const avatar = document.createElement('div');
        avatar.className = 'dropdown-avatar';
        avatar.textContent = user.initials;
        avatar.style.backgroundColor = user.color;

        const span = document.createElement('span');
        span.textContent = user.name;

        wrapper.appendChild(avatar);
        wrapper.appendChild(span);

        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'checkbox-wrapper';

        const checkbox = document.createElement('img');
        checkbox.src = "./assets/icons-addTask/Property 1=Default.png";
        checkbox.alt = "Check user";

        const hoverOverlay = document.createElement('div');
        hoverOverlay.className = 'hover-overlay';

        checkboxWrapper.appendChild(checkbox);
        checkboxWrapper.appendChild(hoverOverlay);

        div.appendChild(wrapper);
        div.appendChild(checkboxWrapper);
        assignedDropdown.appendChild(div);

        div.addEventListener('click', (e) => {
            if (e.target === checkbox || e.target === hoverOverlay) return;
            const isActive = div.classList.toggle('active');
            checkboxWrapper.classList.toggle('checked', isActive);
            checkbox.src = isActive
                ? "./assets/icons-addTask/Property 1=checked.svg"
                : "./assets/icons-addTask/Property 1=Default.png";

            if (typeof updateSelectedAvatars === "function") {
                updateSelectedAvatars();
            }
        });

        checkboxWrapper.addEventListener("click", (e) => {
            e.stopPropagation();

            const isChecked = checkboxWrapper.classList.toggle("checked");
            checkbox.src = isChecked
                ? "./assets/icons-addTask/Property 1=checked.svg"
                : "./assets/icons-addTask/Property 1=Default.png";

            const parentItem = e.currentTarget.closest(".dropdown-item");
            if (parentItem) {
                parentItem.classList.toggle("active", isChecked);
            }

            if (typeof updateSelectedAvatars === "function") {
                updateSelectedAvatars();
            }
            console.log("Checked:", isChecked, "→ Active Items:", document.querySelectorAll(".dropdown-item.active").length);
        });
    });
}

// ---------- Update Selected Avatars ----------
function updateSelectedAvatars() {
    selectedAvatarsContainer.innerHTML = "";
    const selected = users.filter((u, i) => {
        const img = assignedDropdown.children[i].querySelector('img');
        return img.src.includes("checked");
    }).slice(0, 3);

    selected.forEach(user => {
        const a = document.createElement('div');
        a.className = 'selected-avatar assigned-text';
        a.dataset.fullname = user.name
        a.textContent = user.initials;
        a.style.backgroundColor = user.color;
        selectedAvatarsContainer.appendChild(a);
    });
    selectedAvatarsContainer.style.display = selected.length > 0 ? 'flex' : 'none';
}

function toggleDropdown(e) {
    e.stopPropagation();
    const isOpen = assignedDropdown.classList.contains('open');
    if (!isOpen) {
        assignedDropdown.classList.add('open');
        assignedDropdown.style.display = 'block';
        assignedInput.style.display = 'inline';
        assignedText.style.display = 'none';
        arrowIcon.src = '/assets/icons-addTask/arrow_drop_down_up.png';
        assignedInput.focus();

        Array.from(assignedDropdown.children).forEach(div => {
            div.querySelector('.checkbox-wrapper').style.display = 'flex';
        });
    } else {
        assignedDropdown.classList.remove('open');
        assignedDropdown.style.display = 'none';
        assignedInput.style.display = 'none';
        assignedText.style.display = 'block';
        arrowIcon.src = '/assets/icons-addTask/arrow_drop_down.png';
        assignedInput.value = '';
    }
}

assignedTextContainer.addEventListener('click', toggleDropdown);
arrowContainer.addEventListener('click', toggleDropdown);

document.addEventListener('click', e => {
    if (!assignedTextContainer.contains(e.target) && !arrowContainer.contains(e.target)) {
        assignedDropdown.classList.remove('open');
        assignedDropdown.style.display = 'none';
        assignedInput.style.display = 'none';
        assignedText.style.display = 'block';
        arrowIcon.src = '/assets/icons-addTask/arrow_drop_down.png';

        // Hier prüfen
        Array.from(assignedDropdown.children).forEach(div => {
            const checkboxWrapper = div.querySelector('.checkbox-wrapper');
            if (!checkboxWrapper) return; // <- überspringen, falls nicht vorhanden

            const checkbox = checkboxWrapper.querySelector('img');
            if (!checkbox) return; // <- optional, Sicherheit

            if (checkbox.src.includes('checked')) {
                checkboxWrapper.style.display = 'flex'; // bleibt sichtbar
            } else {
                checkboxWrapper.style.display = 'none'; // ungesetzte Checkbox ausblenden
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

titleInput.addEventListener("blur", () => {
    if (!titleInput.value.trim()) {
        titleInput.style.borderBottom = "1px solid #FF4D4D";
        titleError.style.display = "block";
    } else {
        titleInput.style.borderBottom = "1px solid #D1D1D1";
        titleError.style.display = "none";
    }
});

titleInput.addEventListener("input", () => {
    if (titleInput.value.trim()) {
        titleInput.style.borderBottom = "1px solid #005DFF";
        titleError.style.display = "none";
    }
})

// Formatierung: ISO (YYYY-MM-DD) zu dd/mm/yyyy
function formatDateForDisplay(isoDate) {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
}

// Display aktualisieren
function updateDisplay() {
    const isoDate = dueDateInput.value;
    
    if (isoDate) {
        dueDateDisplay.textContent = formatDateForDisplay(isoDate);
        dueDateDisplay.classList.add("has-value");
    } else {
        dueDateDisplay.textContent = "dd/mm/yyyy";
        dueDateDisplay.classList.remove("has-value");
    }
}

dueDateInput.addEventListener("blur", () => {
    if (!dueDateInput.value.trim()) {
        dueDateInput.style.borderBottom = "1px solid #FF4D4D";
        dueDateError.style.display = "block";
    } else {
        dueDateInput.style.borderBottom = "1px solid #D1D1D1";
        dueDateError.style.display = "none";
    }
});

function openDatepicker() {
    if (dueDateInput.showPicker) {
        dueDateInput.showPicker();
    } else {
        dueDateInput.click();
    }
}

// Datum wurde geändert -> Display aktualisieren
dueDateInput.addEventListener("change", updateDisplay);

dueDateIcon.addEventListener("click", openDatepicker);
dueDateContainer.addEventListener("click", openDatepicker);

const buttons = document.querySelectorAll(".priority-frame");

buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

arrowContainer.addEventListener('click', (event) => {
    event.stopPropagation();
    // assignedDropdown.classList.toggle('show');
});

document.addEventListener('click', (event) => {
    if (!assignedDropdown.contains(event.target) && event.target !==
        arrowContainer) {
        assignedDropdown.style.display = 'none';
    }
});

//Dropdown-Menü für die Task-Kategorie im Modal erstellen
function populateCategoryDropdown() {
    const container = document.querySelector('.category-container .category-content');
    if (!container) return;

    const menu = document.createElement('div');
    menu.className = 'dropdown-menu';
    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = cat;
        item.addEventListener('click', () => {
            container.querySelector('.assigned-text').textContent = cat;
            menu.style.display = 'none';
        });
        menu.appendChild(item);
    });
    container.appendChild(menu);
    arrow.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.style.display = menu.style.display === 'block' ? 'none' :
            'block';
    });
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            menu.style.display = 'none';
        }
    });
}

// ===================== CATEGORY ===================== 
categoryDropdown.className = 'dropdown-menu';
categories.forEach(cat => {
    const div = document.createElement('div');
    div.className = 'dropdown-item';
    div.textContent = cat;
    div.addEventListener('click', (e) => {
        e.stopPropagation();
        categoryText.textContent = cat;
        categoryDropdown.classList.remove('show');
        categoryArrow.style.transform = 'rotate(0deg)'; // Pfeil zurücksetzen
    });
    categoryDropdown.appendChild(div);
});
categoryContent.appendChild(categoryDropdown);

// Dropdown & Pfeil Toggle
categoryContent.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = categoryDropdown.classList.contains('show');
    categoryDropdown.classList.toggle('show', !isOpen);
    categoryArrow.src = !isOpen
        ? '/assets/icons-addTask/arrow_drop_down_up.png'
        : '/assets/icons-addTask/arrow_drop_down.png';
});

// Klick außerhalb schließt Dropdown
document.addEventListener('click', (e) => {
    if (!categoryContent.contains(e.target)) {
        categoryDropdown.classList.remove('show');
        categoryArrow.src = '/assets/icons-addTask/arrow_drop_down.png';
    }
});
taskInput.addEventListener("input", () => {
    if (taskInput.value.trim() !== "") {
        checkBtn.style.display = "inline";
        cancelBtn.style.display = "inline";
    } else { resetInput(); }
});
checkBtn.addEventListener("click", () => {
    const currentTask = taskInput.value.trim();
    if (!currentTask)
        return;
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = currentTask;
    li.appendChild(span);
    const icons = document.createElement("div");
    icons.classList.add("subtask-icons");
    const editIcon = document.createElement("img");
    editIcon.src = "./assets/icons-addTask/Property 1=edit.png";
    editIcon.alt = "Edit";
    editIcon.addEventListener("click", () => { startEditMode(li, span); });
    const deleteIcon = document.createElement("img");
    deleteIcon.src = "./assets/icons-addTask/Property 1=delete.png";
    deleteIcon.alt = "Delete";
    deleteIcon.addEventListener("click", () => { subtaskList.removeChild(li); });
    icons.appendChild(editIcon);
    icons.appendChild(deleteIcon);
    li.appendChild(icons);
    subtaskList.appendChild(li);
    resetInput();
});
cancelBtn.addEventListener("click", resetInput);
function resetInput() { taskInput.value = ""; checkBtn.style.display = "none"; cancelBtn.style.display = "none"; }
function startEditMode(li, span) {
    const input = document.createElement("input"); input.type = "text"; input.value = span.textContent; input.classList.add("subtask-edit-input"); const saveIcon = document.createElement("img"); saveIcon.src = "./assets/icons-addTask/Subtask's icons (1).png";
    saveIcon.alt = "Save"; saveIcon.addEventListener("click", () => { span.textContent = input.value.trim() || span.textContent; li.replaceChild(span, input); li.replaceChild(defaultIcons, actionIcons); }); const deleteIcon = document.createElement("img"); deleteIcon.src = "./assets/icons-addTask/Property 1=delete.png"; deleteIcon.alt = "Delete"; deleteIcon.addEventListener("click", () => { subtaskList.removeChild(li); }); const actionIcons = document.createElement("div"); actionIcons.classList.add("subtask-icons"); actionIcons.appendChild(saveIcon); actionIcons.appendChild(deleteIcon); const defaultIcons = li.querySelector(".subtask-icons"); li.replaceChild(input, span); li.replaceChild(actionIcons, defaultIcons); input.focus();
}

// --- Task-Daten sammeln ---
function getTaskData() {
    // 1. Titel
    const titleInput = document.querySelector(".title-input");
    const title = titleInput.value.trim();
    // 2. Beschreibung
    const descriptionInput = document.querySelector(".description-input");
    const description = descriptionInput.value.trim();
    // 3. Due Date
    const dueDateInput = document.querySelector(".due-date-input");
    const dueDate = dueDateInput.value;
    // 4. Priority
    const priorityBtn = document.querySelector(".priority-frame.active");
    const priority = priorityBtn ? priorityBtn.textContent.trim().toLowerCase() : "medium";
    // 5. Assigned Users Full
    let assignedUsersFull = [];
    if (assignedDropdown) {
        assignedDropdown.querySelectorAll(".dropdown-item.active").forEach(div => {
            const userId = div.dataset.userId;
            const user = users.find(u => u.id === userId);
            if (user) {
                assignedUsersFull.push({
                    id: user.id,
                    name: user.name,
                    initials: user.initials,
                    color: user.color
                });
            }
        });
    }
    // 6. Kategorie
    const categoryText = document.querySelector(".category-content .assigned-text");
    const category = categoryText ? categoryText.textContent.trim() : null;
    // 7. Subtasks (Objekte statt Strings)
    const subtaskInputs = document.querySelectorAll(".subtask-input");
    const subtasks = Array.from(subtaskInputs)
        .map(input => input.value.trim())
        .filter(title => title.length > 0)
        .map(title => ({ title, done: false }));
    return {
        title,
        description,
        dueDate,
        priority,
        assignedUsersFull,
        category,
        subtasks
    };
}

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
    document.querySelector(".selected-avatars-container").innerHTML = "";
    document.querySelector("#subtask-list").innerHTML = "";
    document.querySelectorAll(".priority-frame").forEach(btn => btn.classList.remove("active"));
    document.querySelector(".priority-frame:nth-child(2)").classList.add("active"); // Medium
    const categoryText = document.querySelector(".category-content .assigned-text");
    if (categoryText) categoryText.textContent = "Select task category";
}

createBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    createBtn.classList.add('active');
    const taskData = getTaskData();
    let hasError = false;

    // --- TITLE ---
    const titleInput = document.querySelector(".title-input");
    if (!taskData.title) {
        titleInput.style.borderBottom = "1px solid #FF4D4D";
        titleError.style.display = "block";
        hasError = true;
    } else {
        titleInput.style.borderBottom = "1px solid #D1D1D1";
        titleError.style.display = "none";
    }

    // --- DUE DATE ---
    const dueDateContainer = document.querySelector(".due-date-content");
    const dueDateError = document.querySelector(".due-date-container .error-message");
    const dueDateValue = taskData.dueDate;
    if (!dueDateValue) {
        dueDateContainer.style.borderBottom = "1px solid #FF4D4D";
        dueDateError.style.display = "block";
        hasError = true;
    } else {
        dueDateContainer.style.borderBottom = "1px solid #D1D1D1";
        dueDateError.style.display = "none";
    }

    // --- CATEGORY ---
    const categoryError = document.querySelector(".error-message");
    const categoryText = taskData.category;
    if (!categoryText || categoryText === "Select task category") {
        categoryContent.style.borderBottom = "1px solid #FF4D4D";
        categoryError.style.display = "block";
        hasError = true;
    } else {
        categoryContent.style.borderBottom = "1px solid #D1D1D1";
        categoryError.style.display = "none";
    }

    // Stoppen, wenn Fehler
    if (hasError) return;
    const originalText = createBtn.textContent;
    createBtn.textContent = "Saving...";
    createBtn.disabled = true;
    try {
        const newTask = await saveTask(taskData);
        if (newTask) {
            showTaskAddedMessage(() => {
                closeModal();
                renderBoard();
            });
            resetForm();
        }
    } catch (err) {
        console.error("Fehler beim Erstellen der Task:", err);
    } finally {
        createBtn.disabled = false;
        createBtn.textContent = originalText;
        createBtn.classList.remove('active');
    }
});

function showTaskAddedMessage(onFinished) {
    const img = document.createElement("img");
    img.src = "./assets/icons-addTask/Added to board 1.png";
    img.alt = "Task added to Board";
    Object.assign(img.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: "9999",
        boxShadow: "0px 0px 4px 0px #00000029",
        transition: "transform 150ms ease-out, opacity 150ms ease-out",
        opacity: "0",
        pointerEvents: "none",
    });
    document.body.appendChild(img);
    requestAnimationFrame(() => {
        img.style.opacity = "1";
        img.style.transform = "translate(-50%, -50%)";
    });
    setTimeout(() => {
        img.style.transform = "translate(-150%, -50%)";
        img.style.opacity = "0";
        img.addEventListener("transitionend", () => {
            img.remove();
            if (typeof onFinished === "function") {
                onFinished();
            }
        });
    }, 800);
}

async function updateTaskStatus(task, newStatus) {
    if (!task.id) return;

    try {
        await updateTask(task.id, { status: newStatus });
        const localTask = tasks.find(t => t.id === task.id);
        if (localTask) {
            localTask.status = newStatus;
        }
    } catch (error) {
        console.error("Fehler beim Aktualisieren in Firebase:", error);
        throw error;
    }
}

async function updateTaskData(taskId, updates) {
    try {
        await updateTask(taskId, updates);
        const localTask = tasks.find(t => t.id === taskId);
        if (localTask) {
            Object.assign(localTask, updates);
        }
        return localTask;
    } catch (error) {
        console.error("Fehler beim Aktualisieren:", error);
        throw error;
    }
}

function openTaskDetails(task) {
    currentTask = task;
    const overlay = document.getElementById("task-detail-overlay");
    const view = document.getElementById("task-view");
    const edit = document.getElementById("task-edit");
    overlay.dataset.taskId = task.id;
    view.classList.remove("hidden");
    edit.classList.add("hidden");
    overlay.classList.remove("hidden");

    let categoryImg = "";
    if (task.category === "User Story") {
        categoryImg = './assets/icons-board/user-story-tag-overlay.svg';
    } else if (task.category === "Technical Task") {
        categoryImg = './assets/icons-board/technical-task-tag-overlay.svg';
    }

    // nur ausgelagerter Return
    view.innerHTML = taskDetailTemplate(task, categoryImg);

    // Events
    const editBtn = document.getElementById("edit-header-btn");
    if (editBtn) {
        editBtn.addEventListener("click", () => openEditMode(task));
    }
    const deleteBtn = view.querySelector(".delete-btn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
            if (!task.id) return;
            try {
                await deleteTask(task.id);
                const taskIndex = tasks.findIndex(t => t.id === task.id);
                if (taskIndex > -1) tasks.splice(taskIndex, 1);
                overlay.classList.add("hidden");
                renderBoard();
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Failed to delete task');
            }
        });
    }
}

function closeTaskDetails() {
    const overlay = document.getElementById("task-detail-overlay");
    overlay?.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("task-detail-close");
    closeBtn?.addEventListener("click", closeTaskDetails);
});

function renderAssignedUsers(users) {
    return users.map(user => `
        <div class="assigned-item">
            <div class="assigned-avatar-detail-view" style="
                background-color: ${user.color};">
                ${user.initials}
            </div>
            <span class="assigned-name-full">${user.name}</span>
        </div>
    `).join("");
}

function renderSubtasks(task) {
    if (!task.subtasks || !task.subtasks.items || task.subtasks.items.length === 0) {
        return `<li>Keine Subtasks</li>`;
    }
    return task.subtasks.items.map((subtask, index) => {
        return subtaskHTML({
            title: subtask.title || `Subtask ${index + 1}`,
            isChecked: subtask.done === true,
            taskId: task.id,
            index: index
        });
    }).join("");
}

async function addSubtask(taskId, title) {
    if (!taskId || !title) return;

    try {
        const task = getTasks().find(t => t.id === taskId);
        if (!task) {
            console.error('Task nicht gefunden:', taskId);
            return;
        }

        if (!task.subtasks) {
            task.subtasks = { items: [], total: 0, completed: 0 };
        }
        if (!Array.isArray(task.subtasks.items)) {
            task.subtasks.items = [];
        }
        task.subtasks.items.push({ title, done: false });
        task.subtasks.total = task.subtasks.items.length;
        task.subtasks.completed = task.subtasks.items.filter(st => st.done).length;

        await updateTask(taskId, {
            subtasks: {
                items: task.subtasks.items,
                total: task.subtasks.total,
                completed: task.subtasks.completed
            }
        });
        renderBoard();
    } catch (error) {
        console.error("Fehler beim Hinzufügen der Subtask:", error);
        throw error;
    }
}

function toggleCheckbox(wrapper, taskId, subtaskIndex) {
    const defaultSVG = wrapper.querySelector('.checkbox-default');
    const checkedSVG = wrapper.querySelector('.checkbox-checked');
    const isChecked = checkedSVG.style.display === 'block';
    checkedSVG.style.display = isChecked ? 'none' : 'block';
    defaultSVG.style.display = isChecked ? 'block' : 'none';

    const task = getTasks().find(t => t.id === taskId);
    if (task && task.subtasks && task.subtasks.items) {
        task.subtasks.items[subtaskIndex].done = !task.subtasks.items[subtaskIndex].done;
        task.subtasks.completed = task.subtasks.items.filter(st => st.done).length;
    }
    updateTaskCard(taskId);
    updateSubtaskInFirebase(taskId, task).catch(err => console.error(err));
}

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

function updateTaskCard(taskId) {
    const task = getTasks().find(t => t.id === taskId);
    if (!task) return;

    const card = document.getElementById(`task-${taskId}`);
    if (!card) return;

    if (!task.subtasks || !task.subtasks.items) return;

    const counter = card.querySelector('.subtasks-text');
    if (counter) {
        counter.textContent = `${task.subtasks.completed}/${task.subtasks.total} Subtasks`;
    }
    const progressBar = card.querySelector('.progress-container div');
    if (progressBar) {
        const percentage = task.subtasks.total > 0
            ? (task.subtasks.completed / task.subtasks.total) * 100
            : 0;
        progressBar.style.width = `${percentage}%`;
    }
}