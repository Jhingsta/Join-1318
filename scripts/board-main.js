// ===================== GLOBALE VARIABLEN =====================
let tasks = [];
let users = [];
let currentNewTask = null;
let currentTask = null;
const addButtons = document.querySelectorAll('.svg-button');

// ===================== TEMPLATE INJECTION =====================
document.body.insertAdjacentHTML("beforeend", addtaskModal());
document.body.insertAdjacentHTML('beforeend', taskDetailModal());

// ===================== DOM ELEMENTE (Shared) =====================
const categories = ["Technical Task", "User Story"];

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

function populateDropdown() {
    const assignedDropdown = document.getElementById('add-assigned-dropdown');
    const selectedAvatarsContainer = document.getElementById('add-selected-avatars-container');

    if (!assignedDropdown) {
        console.warn('populateDropdown: #add-assigned-dropdown nicht gefunden.');
        return;
    }
    if (!selectedAvatarsContainer) {
        console.warn('populateDropdown: #add-selected-avatars-container nicht gefunden.');
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
        });
    });
}

function updateSelectedAvatars() {
    const assignedDropdown = document.getElementById('add-assigned-dropdown');
    const selectedAvatarsContainer = document.getElementById('add-selected-avatars-container');

    if (!assignedDropdown || !selectedAvatarsContainer) return;

    selectedAvatarsContainer.innerHTML = "";

    const selected = users.filter((u, i) => {
        const dropdownItem = assignedDropdown.children[i];
        if (!dropdownItem) return false;
        const img = dropdownItem.querySelector('img');
        return img && img.src.includes("checked");
    }).slice(0, 3);

    selected.forEach(user => {
        const a = document.createElement('div');
        a.className = 'selected-avatar assigned-text';
        a.dataset.fullname = user.name;
        a.textContent = user.initials;
        a.style.backgroundColor = user.color;
        selectedAvatarsContainer.appendChild(a);
    });

    selectedAvatarsContainer.style.display = selected.length > 0 ? 'flex' : 'none';
}

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

// ===================== DATE UTILITY FUNCTIONS =====================

function formatDateForDisplay(isoDate) {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
}

function updateDisplay() {
    const dueDateInput = document.getElementById('add-due-date-input');
    const dueDateDisplay = document.getElementById('add-due-date-display');

    if (!dueDateInput || !dueDateDisplay) return;

    const isoDate = dueDateInput.value;

    if (isoDate) {
        dueDateDisplay.textContent = formatDateForDisplay(isoDate);
        dueDateDisplay.classList.add("has-value");
    } else {
        dueDateDisplay.textContent = "dd/mm/yyyy";
        dueDateDisplay.classList.remove("has-value");
    }
}

function openDatepicker() {
    const dueDateInput = document.getElementById('add-due-date-input');
    if (!dueDateInput) return;

    if (dueDateInput.showPicker) {
        dueDateInput.showPicker();
    } else {
        dueDateInput.click();
    }
}

// ===================== INITIALISIERUNG =====================

document.addEventListener('DOMContentLoaded', async () => {
    await loadUsers();
    await loadTasksForBoard();
    renderBoard();
});


// ======= STEP 1: Init Add-Buttons so new task opens in the right column =======

function initAddTaskButtons() {
    addButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const column = btn.closest('.task-column');
            const statusFromColumn = column?.dataset?.status;
            const statusFromButton = btn.dataset?.status;
            const status = statusFromColumn || statusFromButton || 'todo';

            currentNewTask = currentNewTask || {};
            currentNewTask.status = status;

            const globalAddBtn = document.getElementById('add-task-btn');
            if (globalAddBtn) {
                globalAddBtn.click();
            } else {
                const evt = new CustomEvent('openAddTaskModal', { detail: { status } });
                document.dispatchEvent(evt);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadUsers();
    await loadTasksForBoard();
    renderBoard();
    initAddTaskButtons();
});
