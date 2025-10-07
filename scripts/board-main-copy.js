let tasks = [];
let users = [];
let currentNewTask = null;
let currentTask = null;

document.body.insertAdjacentHTML("beforeend", addtaskModal());
document.body.insertAdjacentHTML('beforeend', taskDetailModal());

// const arrowContainer = assignedContent.querySelector('.assigned-arrow-container');
const arrow = assignedContent.querySelector('.assigned-arrow-container');
const arrowIcon = arrowContainer.querySelector('img');
const assignedContent = document.querySelector('.assigned-content');

const selectedAvatarsContainer = document.querySelector(".selected-avatars-container");
const categories = ["Technical Task", "User Story"];

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

// ---------------------------
// Date Functions
// ---------------------------

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

dueDateContainer.addEventListener("click", openDatepicker);

document.addEventListener('DOMContentLoaded', async () => {
    await loadUsers();
    await loadTasksForBoard();
    renderBoard();
    
    // Modal-Init aufrufen
    initAddModal(); // Diese Funktion rufst du aus board-add-modal.js auf
});



// ----------------------------------------------------




// arrowContainer.addEventListener('click', (event) => {
//     event.stopPropagation();
//     assignedDropdown.classList.toggle('show');
// });

// document.addEventListener('click', (event) => {
//     if (!assignedDropdown.contains(event.target) && event.target !==
//         arrowContainer) {
//         assignedDropdown.style.display = 'none';
//     }
// });

//Dropdown-Menü für die Task-Kategorie im Modal erstellen
// function populateCategoryDropdown() {
//     const container = document.querySelector('.category-container .category-content');
//     if (!container) return;

//     const menu = document.createElement('div');
//     menu.className = 'dropdown-menu';
//     categories.forEach(cat => {
//         const item = document.createElement('div');
//         item.className = 'dropdown-item';
//         item.textContent = cat;
//         item.addEventListener('click', () => {
//             container.querySelector('.assigned-text').textContent = cat;
//             menu.style.display = 'none';
//         });
//         menu.appendChild(item);
//     });
//     container.appendChild(menu);
//     arrow.addEventListener('click', (e) => {
//         e.stopPropagation();
//         menu.style.display = menu.style.display === 'block' ? 'none' :
//             'block';
//     });
//     document.addEventListener('click', (e) => {
//         if (!container.contains(e.target)) {
//             menu.style.display = 'none';
//         }
//     });
// }

// async function updateTaskStatus(task, newStatus) {
//     if (!task.id) return;

//     try {
//         await updateTask(task.id, { status: newStatus });
//         const localTask = tasks.find(t => t.id === task.id);
//         if (localTask) {
//             localTask.status = newStatus;
//         }
//     } catch (error) {
//         console.error("Fehler beim Aktualisieren in Firebase:", error);
//         throw error;
//     }
// }

// async function updateTaskData(taskId, updates) {
//     try {
//         await updateTask(taskId, updates);
//         const localTask = tasks.find(t => t.id === taskId);
//         if (localTask) {
//             Object.assign(localTask, updates);
//         }
//         return localTask;
//     } catch (error) {
//         console.error("Fehler beim Aktualisieren:", error);
//         throw error;
//     }
// }

//Detail-Overlay rendering
// function renderDetailOverlay(task) {
//     const container = document.getElementById("detail-avatars-container");
//     if (!container) return;
//     container.innerHTML = "";

//     (task.assignedUsersFull || []).forEach(user => {
//         const avatarDiv = document.createElement("div");
//         avatarDiv.className = "selected-avatar";
//         avatarDiv.textContent = user.initials;
//         avatarDiv.style.backgroundColor = user.color;
//         container.appendChild(avatarDiv);
//     });
// }

//Checkbox toggle
// async function toggleSubtaskInEdit(task, index) {
//     task.subtasks.items[index].done = !task.subtasks.items[index].done;
//     await updateTask(task.id, { subtasks: task.subtasks });
//     renderEditSubtasks(task);
// }

