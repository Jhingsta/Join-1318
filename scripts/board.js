let currentNewTask = null;

if (!window.taskManager.saveTasks) {
    window.taskManager.saveTasks = function (tasks) {
    };
}

function saveTask(task) {
    const taskData = getTaskData(); // Task-Daten inkl. assignedUsersFull
    fetch(`${FIREBASE_URL}/tasks/${task.firebaseId || ''}.json`, {
        method: task.firebaseId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    })
        .then(res => res.json())
        .then(data => {
            console.log('Task gespeichert:', data);
        })
        .catch(err => console.error('Fehler beim Speichern:', err));
}

// Ganz oben in board.js einfügen:
const FIREBASE_URL = "https://join-1318-default-rtdb.europe-west1.firebasedatabase.app";
let users = [];
async function loadUsers() {
    const res = await fetch("https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/users.json");
    const data = await res.json();
    users = data
        ? Object.keys(data).map(key => ({ id: key, ...data[key] }))
        : [];
    populateDropdown();
}

const modal = document.getElementById('add-task-modal');
const createBtn = document.querySelector('.create-btn'); 
const addTaskButton = document.getElementById('add-task-btn');
const form = document.getElementById('add-task-form');
const svgButtons = document.querySelectorAll('.svg-button'); 

const assignedContent = document.querySelector('.assigned-content');
const assignedTextContainer = assignedContent.querySelector('.assigned-text-container');
const assignedText = assignedTextContainer.querySelector('.assigned-text');
const assignedInput = assignedContent.querySelector('.assigned-input');
const arrowContainer = assignedContent.querySelector('.assigned-arrow-container');
const arrowIcon = arrowContainer.querySelector('img');
const assignedDropdown = document.getElementById('assigned-dropdown');
const selectedAvatarsContainer = document.querySelector(".selected-avatars-container");

function closeModal() {
    modal?.classList.add('hidden');
    form?.reset();

    const priority = document.getElementById('task-priority');
    const status = document.getElementById('task-status');
    const done = document.getElementById('subtasks-done');
    const total = document.getElementById('subtasks-total');

    if (priority) priority.value = 'medium';
    if (status) status.value = 'todo';
    if (done) done.value = '0';
    if (total) total.value = '0';

    createBtn?.classList.remove('active');
    addTaskButton?.classList.remove('active-style');
    // Plus-Buttons wieder freischalten
    svgButtons.forEach(btn => {
        const svg = btn.querySelector('svg');
        if (svg) svg.classList.remove('disabled');
    });
}

/////////////////////DOM 1////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', async () => {
    const modalClose = document.getElementById('modal-close');
    const cancelButton = document.getElementById('cancel-btn');
    const closeButton = document.querySelector('.close');
    closeButton?.addEventListener('click', closeModal);
    addTaskButton?.addEventListener('click', openModal);

    function openModal() {
        modal?.classList.remove('hidden');
        addTaskButton?.classList.add('active-style'); // Button aktiv stylen
        // Neues Task-Objekt für die Auswahl
        currentNewTask = { assignedUsersFull: [] };
        renderAssignedDropdownModal(currentNewTask);

        // Plus-Buttons ausgrauen
        svgButtons.forEach(btn => {
            const svg = btn.querySelector('svg');
            if (svg) svg.classList.add('disabled');
        });
    }

    // jedem Button einen eigenen Klick-Handler geben
    svgButtons.forEach(button => {
        button.addEventListener('click', () => {
            openModal(button);
        });
    });

    // Eventlistener
    closeButton?.addEventListener('click', closeModal);
    modalClose?.addEventListener('click', closeModal);
    cancelButton?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    /**
 * Dropdown für Assigned Users in der Modalbox rendern
 */    await window.taskManager.loadTasks();
    renderBoard();

    async function renderAssignedDropdownModal(task) {
        const dropdown = document.getElementById("add-assigned-dropdown");
        if (!dropdown) return;

        dropdown.innerHTML = "";
        const contacts = await loadContactsFromFirebase(); // <-- gleiche Funktion wie im Edit

        contacts.forEach(user => {
            const item = document.createElement("div");
            item.className = "dropdown-item";
            item.textContent = user.name;
            if (task.assignedUsersFull?.some(u => u.id === user.id)) {
                item.classList.add("selected");
            }
            item.addEventListener("click", () => {
                if (!task.assignedUsersFull) task.assignedUsersFull = [];
                const index = task.assignedUsersFull.findIndex(u => u.id === user.id);
                if (index !== -1) {
                    // Entfernen
                    task.assignedUsersFull.splice(index, 1);
                    item.classList.remove("selected");
                } else {
                    // Hinzufügen
                    task.assignedUsersFull.push({
                        id: user.id,
                        name: user.name,
                        initials: getInitials(user.name),
                        color: user.color ?? "#888"
                    });
                    item.classList.add("selected");
                }
                renderAvatarsModal(task); // Avatare live aktualisieren
            });
            dropdown.appendChild(item);
        });
        renderAvatarsModal(task);
    }
    /**
     * Avatare in der Modalbox rendern
     */
    function renderAvatarsModal(task) {
        const avatarsContainer = document.getElementById("add-avatars-container");
        if (!avatarsContainer) return;
        avatarsContainer.innerHTML = "";

        (task.assignedUsersFull || []).forEach(user => {
            const avatarDiv = document.createElement("div");
            avatarDiv.className = "assigned-avatar";
            avatarDiv.textContent = user.initials || getInitials(user.name);
            avatarDiv.style.backgroundColor = user.color ?? "#888";
            avatarsContainer.appendChild(avatarDiv);
        });
    }
    // Save Button beim Klick aktiv machen
    createBtn?.addEventListener('click', () => {
        createBtn.classList.add('active');
    });

    if (!window.taskManager) {
        console.error('Task manager not loaded');
        return;
    }

    await window.taskManager.loadTasks();
    renderBoard();

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const dueDate = document.getElementById('task-dueDate').value;
        const priority = document.getElementById('task-priority').value;
        const status = document.getElementById('task-status').value;
        const subtasksDone = parseInt(document.getElementById('subtasks-done').value || '0', 10);
        const subtasksTotal = parseInt(document.getElementById('subtasks-total').value || '0', 10);
        // Dynamische Subtasks vom User
        const subtasksInputs = document.querySelectorAll('.subtask-input');
        const subtasksItems = Array.from(subtasksInputs)
            .map(input => input.value.trim())
            .filter(title => title.length > 0)
            .map(title => ({ title, done: false })); // ✅ wichtig

        const payload = {
            title,
            description,
            dueDate,
            priority,
            status,
            subtasks: {
                items: subtasksItems,                 // Array von Objekten
                total: subtasksItems.length,
                completed: subtasksItems.filter(st => st.done).length
            },
            assignedUsersFull: currentNewTask.assignedUsersFull,
            createdAt: new Date().toISOString()
        };
        // 4️⃣ Button während Save deaktivieren
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Saving...';
        submitButton.disabled = true;

        // 5️⃣ Task speichern und Board aktualisieren
        try {
            await window.taskManager.createTask(payload); // Stelle sicher, dass hier push() verwendet wird
            await window.taskManager.loadTasks();
            renderBoard();
            closeModal();
        } catch (err) {
            console.error(err);
            alert('Failed to save task');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });

});

function renderBoard() {
    const tasks = window.taskManager.getTasks();
    const columns = {
        todo: document.getElementById('column-todo'),
        inProgress: document.getElementById('column-inProgress'),
        awaitFeedback: document.getElementById('column-awaitFeedback'),
        done: document.getElementById('column-done'),
    };

    Object.values(columns).forEach((el) => el && (el.innerHTML = ''));

    tasks.forEach((task) => {
        const card = createTaskCard(task);
        const column = columns[task.status] || columns.todo;
        if (column) {
            column.appendChild(card);
        }
    });

    // If a column is empty, show placeholder
    Object.entries(columns).forEach(([status, columnEl]) => {
        if (!columnEl) return;
        if (columnEl.children.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'task-placeholder';
            placeholder.textContent = `No tasks in ${readableStatus(status)}`;
            columnEl.appendChild(placeholder);
        }
    });

    // 🔹 Listener für Task-Updates setzen (nur die geänderte Task-Karte aktualisieren)
    document.removeEventListener("taskUpdated", handleTaskUpdated); // alten Listener entfernen
    document.addEventListener("taskUpdated", handleTaskUpdated);
}

// Funktion zum Aktualisieren einer einzelnen Task-Karte (TEST: drag and drop)
function handleTaskUpdated(e) {
    const updatedTask = e.detail;
    const card = document.getElementById(`task-${updatedTask.firebaseId}`);
    if (!card) return;

    const cardTitle = card.querySelector(".task-title");
    const cardDesc = card.querySelector(".task-desc");

    if (cardTitle) cardTitle.innerText = updatedTask.title;
    if (cardDesc) cardDesc.innerText = updatedTask.description || "";

    // Optional: Fortschritt oder andere Felder aktualisieren
    const progressBar = card.querySelector(".progress-container div");
    const progressText = card.querySelector(".subtasks-text");
    if (progressBar && updatedTask.subtasks) {
        const percent = updatedTask.subtasks.total
            ? (updatedTask.subtasks.completed / updatedTask.subtasks.total) * 100
            : 0;
        progressBar.style.width = `${percent}%`;
    }
    if (progressText && updatedTask.subtasks) {
        progressText.textContent = `${updatedTask.subtasks.completed}/${updatedTask.subtasks.total} Subtasks`;
    }
}

// ---------- Helpers ----------
function getInitials(name) {
    if (!name) return "";
    return name.trim().split(" ").map(n => n[0].toUpperCase()).slice(0, 2).join("");
}

function getColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${Math.abs(hash) % 360},70%,50%)`;
}

// ---------- Populate Dropdown ----------
function populateDropdown() {
    const assignedDropdown = document.getElementById('assigned-dropdown');
    const selectedAvatarsContainer = document.querySelector('.selected-avatars-container');

    if (!assignedDropdown) {
        console.warn('populateDropdown: #assigned-dropdown nicht gefunden.');
        return;
    }
    if (!selectedAvatarsContainer) {
        console.warn('populateDropdown: .selected-avatars-container nicht gefunden.');
        return;
    }

    assignedDropdown.innerHTML = "";

    (users || []).forEach((user, i) => {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        div.dataset.clicked = "false";

        const wrapper = document.createElement('div');
        wrapper.className = 'assigned-wrapper';

        const avatar = document.createElement('div');
        avatar.className = 'dropdown-avatar';
        avatar.textContent = getInitials(user.name);
        avatar.style.backgroundColor = getColor(user.name);

        const span = document.createElement('span');
        span.textContent = user.name;

        wrapper.appendChild(avatar);
        wrapper.appendChild(span);

        // Checkbox
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'checkbox-wrapper';
        const checkbox = document.createElement('img');
        checkbox.src = "./assets/icons-addTask/Property 1=Default.png";

        // Hover-Kreis
        const hoverOverlay = document.createElement('div');
        hoverOverlay.className = 'hover-overlay';
        checkboxWrapper.appendChild(hoverOverlay);
        checkboxWrapper.appendChild(checkbox);

        div.appendChild(wrapper);
        div.appendChild(checkboxWrapper);
        assignedDropdown.appendChild(div);

        // ---------- Klick auf Zeile → nur Highlight ----------
        div.addEventListener('click', (e) => {
            if (e.target === checkbox || e.target === hoverOverlay) return;
            div.classList.toggle('active'); // nur Highlight beim Zeilen-Klick
        });

        // ---------- Klick auf Checkbox ----------
        checkboxWrapper.addEventListener('click', (e) => {
            e.stopPropagation();

            const isChecked = checkboxWrapper.classList.contains('checked');
            checkboxWrapper.classList.toggle('checked', !isChecked);

            checkbox.src = isChecked
                ? "./assets/icons-addTask/Property 1=Default.png"
                : "./assets/icons-addTask/Property 1=checked.svg";

            // nur aufrufen, wenn Funktion existiert
            if (typeof updateSelectedAvatars === 'function') {
                updateSelectedAvatars();
            }
        });
    });
    // initial update (falls updateSelectedAvatars schon existiert)
    if (typeof updateSelectedAvatars === 'function') {
        updateSelectedAvatars();
    }
}

// ---------- Update Selected Avatars ----------
function updateSelectedAvatars() {
    selectedAvatarsContainer.innerHTML = "";
    const selected = users.filter((u, i) => {
        const img = assignedDropdown.children[i].querySelector('img');
        return img.src.includes("checked");
    }).slice(0, 3);

    selected.forEach(u => {
        const a = document.createElement('div');
        a.className = 'selected-avatar assigned-text';
        a.dataset.fullname = u.name;         // NEU: vollständiger Name für Overlay
        a.textContent = getInitials(u.name);
        a.style.backgroundColor = getColor(u.name);
        selectedAvatarsContainer.appendChild(a);
    });
    selectedAvatarsContainer.style.display = selected.length > 0 ? 'flex' : 'none';
}

// ---------- Dropdown toggle ----------
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

        // ✅ FIX: Checkboxen beim Öffnen zurücksetzen
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

// ---------- Klick außerhalb schließt Dropdown ----------
document.addEventListener('click', e => {
    if (!assignedTextContainer.contains(e.target) && !arrowContainer.contains(e.target)) {
        assignedDropdown.classList.remove('open');
        assignedDropdown.style.display = 'none';
        assignedInput.style.display = 'none';
        assignedText.style.display = 'block';
        arrowIcon.src = '/assets/icons-addTask/arrow_drop_down.png';

        // Checkboxen beibehalten, wenn gesetzt
        Array.from(assignedDropdown.children).forEach(div => {
            const checkboxWrapper = div.querySelector('.checkbox-wrapper');
            const checkbox = checkboxWrapper.querySelector('img');

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

loadUsers();

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.id = `task-${task.firebaseId}`;
    const type = document.createElement('div');
    type.className = 'task-type';

    const typeImg = document.createElement('img');
    if (task.category === "User Story") {
        typeImg.src = './assets/icons-board/user-story-tag.svg';
        typeImg.alt = 'User Story';
    } else if (task.category === "Technical Task") {
        typeImg.src = './assets/icons-board/technical-task-tag.svg';
        typeImg.alt = 'Technical Task';
    }
    type.appendChild(typeImg);

    const content = document.createElement('div');
    content.className = 'task-content';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = task.title || 'Untitled';
    const info = document.createElement('div');
    info.className = 'task-info';
    info.textContent = task.description || '';
    content.appendChild(title);
    content.appendChild(info);

    const subtasks = document.createElement('div');
    subtasks.className = 'subtasks';
    subtasks.style.display = 'flex';
    subtasks.style.alignItems = 'center';
    subtasks.style.gap = '8px';

    if (task.subtasks && (task.subtasks.total || task.subtasks.completed)) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.style.width = '128px';
        progressContainer.style.height = '8px';
        progressContainer.style.backgroundColor = '#E0E0E0';
        progressContainer.style.borderRadius = '16px';
        progressContainer.style.overflow = 'hidden';

        const completed = task.subtasks?.completed || 0;
        const total = task.subtasks?.total || 0;
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        const percentage = total > 0 ? (completed / total) * 100 : 0;
        progressFill.style.width = `${percentage}%`;
        progressFill.style.height = '100%';
        progressFill.style.backgroundColor = '#4589FF';
        progressFill.style.transition = 'width 0.3s ease';
        progressFill.style.borderRadius = '16px';

        progressContainer.appendChild(progressFill);

        const progressText = document.createElement('span');
        progressText.className = 'subtasks-text';
        progressText.textContent = `${completed}/${total} Subtasks`;
        progressText.style.fontSize = '13px';
        progressText.style.color = '#000000';

        subtasks.appendChild(progressContainer);
        subtasks.appendChild(progressText);
    }

    const assignedTo = document.createElement('div');
    assignedTo.className = 'assigned-to';
    assignedTo.style.display = 'flex';
    assignedTo.style.alignItems = 'center';
    assignedTo.style.gap = '8px';

    const avatarsContainer = document.createElement('div');
    avatarsContainer.style.display = 'flex';
    avatarsContainer.style.gap = '4px';

    if (task.assignedUsersFull && task.assignedUsersFull.length > 0) {
        task.assignedUsersFull.slice(0, 3).forEach(user => {
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'assigned-avatar';
            avatarDiv.textContent = user.initials || getInitials(user.name);
            avatarDiv.style.backgroundColor = user.color || '#888';
            avatarDiv.style.width = '28px';
            avatarDiv.style.height = '28px';
            avatarDiv.style.borderRadius = '50%';
            avatarDiv.style.display = 'flex';
            avatarDiv.style.alignItems = 'center';
            avatarDiv.style.justifyContent = 'center';
            avatarDiv.style.fontFamily = 'Inter';
            avatarDiv.style.fontWeight = '400';
            avatarDiv.style.fontSize = '12px';
            avatarDiv.style.color = '#FFFFFF';

            avatarsContainer.appendChild(avatarDiv);
        });
    }

    const prioImg = document.createElement('img');
    prioImg.alt = 'Priority';
    prioImg.src = priorityIcon(task.priority);
    prioImg.style.marginLeft = 'auto';

    assignedTo.appendChild(avatarsContainer);
    assignedTo.appendChild(prioImg);

    card.appendChild(type);
    card.appendChild(content);
    card.appendChild(subtasks);
    card.appendChild(assignedTo);

    // 🆕 Klick auf Karte → Overlay öffnen
    card.addEventListener("click", () => {
        openTaskDetails(task);
    });

    return card;
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

const categories = ["Technical Task", "User Story"];
const titleInput = document.querySelector(".title-input");
const titleError = document.querySelector(".error-message");

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
});

const dueDateInput = document.querySelector(".due-date-input");
const dueDateIcon = document.querySelector(".due-date-icon");
const dueDateContainer = document.querySelector(".due-date-content");
const dueDateError = document.querySelector(".due-date-container .error-message");

// Blur-Event (Validierung)
dueDateInput.addEventListener("blur", () => {
    if (!dueDateInput.value.trim()) {
        dueDateInput.style.borderBottom = "1px solid #FF4D4D";
        dueDateError.style.display = "block";
    } else {
        dueDateInput.style.borderBottom = "1px solid #D1D1D1";
        dueDateError.style.display = "none";
    }
});

// Funktion um Datepicker zu öffnen
function openDatepicker() {
    if (dueDateInput.showPicker) {
        dueDateInput.showPicker(); // moderner Weg
    } else {
        dueDateInput.click(); // Fallback für ältere Browser
    }
}

// Klick auf Icon öffnet Datepicker
dueDateIcon.addEventListener("click", openDatepicker);

// Klick auf die gesamte Zeile öffnet Datepicker
dueDateContainer.addEventListener("click", openDatepicker);
const buttons = document.querySelectorAll(".priority-frame");

buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

//Öffnen und schliessen des assigned to dropdowns

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

    const arrow = container.querySelector('.assigned-arrow-container');
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
const categoryContent = document.querySelector('.category-content');
const categoryText = categoryContent.querySelector('.assigned-text');
const categoryArrow = categoryContent.querySelector('.assigned-arrow-icon');
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
        categoryArrow.style.transform = 'rotate(0deg)'; // Pfeil zurücksetzen
    });
    categoryDropdown.appendChild(div);
});

categoryContent.appendChild(categoryDropdown);

// Dropdown & Pfeil Toggle
// Dropdown & Pfeil Toggle
categoryContent.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = categoryDropdown.classList.contains('show');
    categoryDropdown.classList.toggle('show', !isOpen); // ✅ Toggle über Klasse
    categoryArrow.src = !isOpen
        ? '/assets/icons-addTask/arrow_drop_down_up.png'
        : '/assets/icons-addTask/arrow_drop_down.png';
});

// Klick außerhalb schließt Dropdown
document.addEventListener('click', (e) => {
    if (!categoryContent.contains(e.target)) {
        categoryDropdown.classList.remove('show'); // ✅ nur über Klasse
        categoryArrow.src = '/assets/icons-addTask/arrow_drop_down.png';
    }
});

// ===================== SUBTASK DROPDOWN ===================== 
// // ===================== SUBTASK DROPDOWN ===================== 
const taskInput = document.querySelector("#subtask-text");
const checkBtn = document.querySelector("#check-btn");
const cancelBtn = document.querySelector("#cancel-btn");
const subtaskList = document.querySelector("#subtask-list");

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
function resetInput() { taskInput.value = ""; checkBtn.style.display = "none"; cancelBtn.style.display = "none";}
function startEditMode(li, span) {
    const input = document.createElement("input"); input.type = "text"; input.value = span.textContent; input.classList.add("subtask-edit-input"); const saveIcon = document.createElement("img"); saveIcon.src = "./assets/icons-addTask/Subtask's icons (1).png";
    saveIcon.alt = "Save"; saveIcon.addEventListener("click", () => { span.textContent = input.value.trim() || span.textContent; li.replaceChild(span, input); li.replaceChild(defaultIcons, actionIcons); }); const deleteIcon = document.createElement("img"); deleteIcon.src = "./assets/icons-addTask/Property 1=delete.png"; deleteIcon.alt = "Delete"; deleteIcon.addEventListener("click", () => { subtaskList.removeChild(li); }); const actionIcons = document.createElement("div"); actionIcons.classList.add("subtask-icons"); actionIcons.appendChild(saveIcon); actionIcons.appendChild(deleteIcon); const defaultIcons = li.querySelector(".subtask-icons"); li.replaceChild(input, span); li.replaceChild(actionIcons, defaultIcons); input.focus();
}
// ----------------------------
// Funktion: Task-Daten auslesen
// ----------------------------
function getTaskData() {
    // 1. Überschrift
    const titleInput = document.querySelector(".title-input");
    const title = titleInput.value.trim();

    // 2. Description
    const descriptionInput = document.querySelector(".description-input");
    const description = descriptionInput.value.trim();

    // 3. Due Date
    const dueDateInput = document.querySelector(".due-date-input");
    let dueDate = dueDateInput.value; // yyyy-mm-dd
    if (dueDate) {
        const [year, month, day] = dueDate.split("-");
        dueDate = `${day}.${month}.${year}`;
    }

    // 4. Priority
    const priorityBtn = document.querySelector(".priority-frame.active");
    const priority = priorityBtn ? priorityBtn.textContent.trim() : null;

    // 5. Assigned to (Kürzel)
    const assignedAvatars = document.querySelectorAll(".selected-avatars-container .assigned-text");
    const assignedTo = Array.from(assignedAvatars).map(el => el.textContent.trim());

    // 5. Assigned Users Full (Vollständige Daten)
    let assignedUsersFull = [];
    const assignedDropdown = document.getElementById('assigned-dropdown');
    if (assignedDropdown) {
        assignedDropdown.querySelectorAll('.dropdown-item').forEach(div => {
            const checkboxWrapper = div.querySelector('.checkbox-wrapper');
            if (checkboxWrapper.classList.contains('checked')) {
                const name = div.querySelector('span').textContent.trim();
                const user = users.find(u => u.name === name);
                if (user) {
                    assignedUsersFull.push({
                        id: user.id,
                        name: user.name,
                        initials: user.initials,
                        color: user.color
                    });
                }
            }
        });
    }



    // 6. Category
    const categoryText = document.querySelector(".category-content .assigned-text");
    const category = categoryText ? categoryText.textContent.trim() : null;

    // 7. Subtasks
    const subtaskItems = document.querySelectorAll("#subtask-list li");
    const subtasks = Array.from(subtaskItems).map(el => el.textContent.trim());

    return {
        title,
        description,
        dueDate,
        priority,
        assignedTo,        // Kürzel
        assignedUsersFull, // volle User-Daten
        category,
        subtasks
    };
}

/**
/**
 * Speichert einen neuen Task in Firebase
/**
 * @param {Object} taskData - Daten des neuen Tasks
 */
async function saveTaskToFirebase(taskData) {
    try {
        // 1. Task in Firebase speichern (Firebase generiert eine ID)
        const response = await fetch(
            `${FIREBASE_URL}/tasks.json`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: taskData.title,
                    description: taskData.description,
                    dueDate: taskData.dueDate,
                    priority: taskData.priority,
                    status: "inProgress",
                    createdAt: new Date().toISOString(),
                    subtasks: {
                        total: taskData.subtasks.length,
                        completed: 0,
                        items: taskData.subtasks.map((st, i) => {
                            if (typeof st === "string" && st.trim() !== "") {
                                return { title: st, done: false };
                            } else if (st && st.title && st.title.trim() !== "") {
                                return { title: st.title, done: st.done || false };
                            } else {
                                return { title: `Subtask ${i + 1}`, done: false };
                            }
                        })
                    },
                    assignedUsersFull: taskData.assignedUsersFull,
                    category: taskData.category
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Fehler beim Speichern des Tasks in Firebase: ${response.status}`);
        }

        // 2. Antwort enthält die neue Firebase-ID
        const result = await response.json();
        const firebaseId = result.name;

        // 3. Task lokal mit der ID erweitern
        taskData.firebaseId = firebaseId;

        // 4. ID auch ins Task-Objekt bei Firebase zurückpatchen (optional, aber praktisch)
        await fetch(`${FIREBASE_URL}/tasks/${firebaseId}.json`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firebaseId })
        });
        return { ...taskData }; // Task mit firebaseId zurückgeben

    } catch (error) {
        console.error("❌ Error saving task:", error);
        throw error;
    }
}

//Create Task Button mit Firebase verbinden
createBtn.addEventListener("click", async (event) => {
    event.preventDefault(); // verhindert das Standard-Submit

    // 1. Task-Daten auslesen
    const taskData = getTaskData();

    // 2. Pflichtfelder prüfen
    if (!taskData.title || !taskData.dueDate) {
        alert("Bitte fülle alle Pflichtfelder aus!");
        return;
    }
    // 3. Task an Firebase senden
    const result = await saveTaskToFirebase(taskData);

    if (result) {
        // Erfolgsmeldung anzeigen
        showTaskAddedMessage(() => {
            // Callback: erst schließen, wenn Meldung weg ist
            closeModal();
        });

        // Formular zurücksetzen (bleibt aber noch offen sichtbar!)
        document.querySelector(".title-input").value = "";
        document.querySelector(".description-input").value = "";
        document.querySelector(".due-date-input").value = "";
        document.querySelector(".selected-avatars-container").innerHTML = "";
        document.querySelector("#subtask-list").innerHTML = "";

        // Priority zurücksetzen auf Medium
        document.querySelectorAll(".priority-frame").forEach(btn => btn.classList.remove("active"));
        document.querySelector(".priority-frame:nth-child(2)").classList.add("active");

        // Kategorie zurücksetzen
        if (categoryText) categoryText.textContent = "Select task category";
    }
});

//Meldung anzeigen, wenn Task erfolgreich erstellt wurde
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

    // Einblenden
    requestAnimationFrame(() => {
        img.style.opacity = "1";
        img.style.transform = "translate(-50%, -50%)";
    });

    // Nach 800ms Slide-out links in 150ms
    setTimeout(() => {
        img.style.transform = "translate(-150%, -50%)";
        img.style.opacity = "0";
        img.addEventListener("transitionend", () => {
            img.remove();
            if (typeof onFinished === "function") {
                onFinished(); // Modal schließen
            }
        });
    }, 800);
}

// Beispiel: Tasks aus Firebase laden und IDs zuweisen
// 🔹 Tasks aus Firebase laden (bleibt wie gehabt)
window.taskManager.loadTasks = async function () {
    const res = await fetch(`${FIREBASE_URL}/tasks.json`);
    const data = await res.json();
    const tasks = [];
    for (const [key, value] of Object.entries(data || {})) {
        value.firebaseId = key;

        // ✅ Nur assignedUsersFull nutzen, alte Felder ignorieren
        value.assignedUsersFull = value.assignedUsersFull || [];

        tasks.push(value);
    }
    window.taskManager._tasks = tasks;
};

// 🔹 Tasks lokal abrufen (bleibt wie gehabt)
window.taskManager.getTasks = function () {
    return window.taskManager._tasks || [];
};

// 🔹 NEU: Task in Firebase aktualisieren (diesen Block zusätzlich unten einfügen)
window.taskManager.updateTaskInFirebase = async function (task) {
    if (!task.firebaseId) return;
    try {
        await fetch(`https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/tasks/${task.firebaseId}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: task.status })
        });
    } catch (err) {
        console.error("Fehler beim Aktualisieren in Firebase:", err);
    }

};

let currentTask = null; // aktuell geöffnete Task im Overlay

function openTaskDetails(task) {
    currentTask = task;
    const overlay = document.getElementById("task-detail-overlay");
    const view = document.getElementById("task-view");
    const edit = document.getElementById("task-edit");

    // Task-ID am Overlay speichern
    overlay.dataset.firebaseId = task.firebaseId;

    // Reset: Ansicht zeigen, Edit verstecken
    view.classList.remove("hidden");
    edit.classList.add("hidden");

    // Overlay sichtbar machen
    overlay.classList.remove("hidden");

    // Kategorie-Icon
    let categoryImg = "";
    if (task.category === "User Story") {
        categoryImg = './assets/icons-board/user-story-tag-overlay.svg';
    } else if (task.category === "Technical Task") {
        categoryImg = './assets/icons-board/technical-task-tag-overlay.svg';
    }

    // Inhalt rendern
    view.innerHTML = `
        <div class="top-bar">
            <img src="${categoryImg}" alt="${task.category || "Category"}" class="category-image">
            <button class="close-button-overlay" onclick="document.getElementById('task-detail-overlay').classList.add('hidden')"><img src="./assets/icons-board/close.svg" alt="Schließen" class="close-icon"></button>
        </div>

        <h2 class="modal-title">${task.title}</h2>
        <p class="modal-desc">${task.description || ""}</p>
        <p class="task-overlay-bullet"><strong>Due date:</strong> <span>${task.dueDate || "-"}</span></p>
        <p class="task-overlay-bullet">
        <strong>Priority:</strong> 
        <span class="priority_value">
            ${task.priority || ""}
            <img src="${priorityIcon(task.priority)}" alt="${task.priority || "Priority"}" class="priority-icon-overlay">
        </span>
    </p>

        <p class="task-overlay-bullet"><strong>Assigned To:</strong></p>
        <div class="assigned-list">${renderAssignedUsers(task.assignedUsersFull)}</div>

        <p class="task-overlay-bullet subtask-header-distance"><strong>Subtasks:</strong></p>
        <ul class="subtasks-list">${renderSubtasks(task)}</ul>

        <div class="task-detail-actions">
            <button class="delete-btn"><img src="./assets/icons-board/Property 1=delete.png" alt="Delete Icon" class="action-icon">Delete</button>
            <button id="edit-header-btn"><img src="./assets/icons-board/Property 1=edit.png" alt="Edit Icon" class="action-icon"> Edit</button>
        </div>
    `;

    // // Edit-Button
    const editBtn = document.getElementById("edit-header-btn");
    if (editBtn) {
        editBtn.addEventListener("click", () => openEditMode(task));
    }
}

//task detail overlay close
function closeTaskDetails() {
    const overlay = document.getElementById("task-detail-overlay");
    overlay?.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("task-detail-close");
    closeBtn?.addEventListener("click", closeTaskDetails);
});

function renderAssignedUsers(users) {
    if (!users || users.length === 0) return "";

    return users.map(user => {
        const name = typeof user === "string" ? user : (user.name || user.username || "");

        return `
        <div class="assigned-item">
            <div class="assigned-avatar" style="
                background-color: ${getColor(name)};
                width:42px;
                height:42px;
                border-radius:50%;
                display:flex;
                align-items:center;
                justify-content:center;
                font-family:Open Sans;
                font-weight:400;
                font-size:12px;
                color:#fff;
            ">
                ${getInitials(name)}
            </div>
            <span class="assigned-name-full">${name}</span>
        </div>
        `;
    }).join("");
}

// Subtasks rendern mit Checkbox, Text + Edit & Delete Buttons darunter
function renderSubtasks(task) {
    if (!task.subtasks || !task.subtasks.items || task.subtasks.items.length === 0) {
        return `<li>Keine Subtasks</li>`;
    }

    return task.subtasks.items.map((subtask, index) => {
        const title = subtask.title || `Subtask ${index + 1}`;
        const isChecked = subtask.done === true;

        return `
        <li class="subtask-item">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <div class="subtask-row">
                    <div class="checkbox-wrapper" onclick="toggleCheckbox(this, '${task.firebaseId}', ${index})">
                        <input type="checkbox" class="real-checkbox" style="display:none;" ${isChecked ? 'checked' : ''}>
                        <img src="./assets/icons-addTask/Property 1=Default.svg" class="checkbox-default" style="display:${isChecked ? 'none' : 'block'}">
                        <img src="./assets/icons-addTask/Property 1=checked.svg" class="checkbox-checked" style="display:${isChecked ? 'block' : 'none'}">
                    </div>
                    <span class="subtask-text" style="font-size:16px; font-family:'Open Sans', sans-serif;">${title}</span>
                </div>
            </div>
        </li>
        `;
    }).join("");
}

// 🔹 Neue Subtask hinzufügen über REST
const addSubtask = async (taskId, title) => {
    if (!taskId || !title) return;

    try {
        // 1️⃣ Aktuelle Subtasks holen
        const res = await fetch(`https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}/subtasks.json`);
        if (!res.ok) throw new Error("Fehler beim Laden der Subtasks");
        const subtasks = await res.json();

        // 2️⃣ Sicherstellen, dass items Array existiert
        const items = Array.isArray(subtasks?.items) ? subtasks.items : [];

        // 3️⃣ Neue Subtask hinzufügen
        items.push({ title, done: false });

        // 4️⃣ Zähler aktualisieren
        const total = items.length;
        const completedCount = items.filter(st => st.done).length;

        // 5️⃣ In Firebase speichern
        await fetch(`https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}/subtasks.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: items,
                total: total,
                completed: completedCount
            })
        });

        // Optional: DOM aktualisieren
        renderBoard();

    } catch (err) {
        console.error("Fehler beim Hinzufügen der Subtask:", err);
    }
};

// 🔹 Checkbox UI toggle + Counter aktualisieren
// Toggle Subtask in Firebase & lokal
async function toggleSubtask(taskId, subtaskIndex) {
    const res = await fetch(`${FIREBASE_URL}/tasks/${taskId}/subtasks.json`);
    const subtasks = await res.json();

    if (!subtasks?.items || !subtasks.items[subtaskIndex]) return;

    // Toggle done
    subtasks.items[subtaskIndex].done = !subtasks.items[subtaskIndex].done;

    // Completed zählen
    const completed = subtasks.items.filter(st => st.done).length;

    // PATCH zurück zu Firebase
    await fetch(`${FIREBASE_URL}/tasks/${taskId}/subtasks.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: subtasks.items, completed })
    });
    return { items: subtasks.items, completed };
}

// Checkbox-UI + Übersicht direkt aktualisieren
function toggleCheckbox(wrapper, taskId, subtaskIndex) {
    const defaultSVG = wrapper.querySelector('.checkbox-default');
    const checkedSVG = wrapper.querySelector('.checkbox-checked');
    const isChecked = checkedSVG.style.display === 'block';

    // 1️⃣ UI sofort umschalten
    checkedSVG.style.display = isChecked ? 'none' : 'block';
    defaultSVG.style.display = isChecked ? 'block' : 'none';

    // 2️⃣ Lokale Daten aktualisieren
    const task = window.taskManager.getTasks().find(t => t.firebaseId === taskId);
    if (task) {
        task.subtasks.items[subtaskIndex].done = !task.subtasks.items[subtaskIndex].done;
        task.subtasks.completed = task.subtasks.items.filter(st => st.done).length;
    }

    // 3️⃣ Counter & Fortschritt sofort updaten
    updateTaskCard(taskId);

    // 4️⃣ Firebase aktualisieren (async, ohne UI zu blockieren)
    toggleSubtask(taskId, subtaskIndex).catch(err => console.error(err));
}

function updateTaskCard(taskId) {
    const task = window.taskManager.getTasks().find(t => t.firebaseId === taskId);
    if (!task) return;

    const card = document.getElementById(`task-${taskId}`);
    if (!card) return;

    // Counter updaten
    const counter = card.querySelector('.subtasks-text');
    if (counter) counter.textContent = `${task.subtasks.completed}/${task.subtasks.total} Subtasks`;

    // Fortschritt updaten
    const progressBar = card.querySelector('.progress-container div');
    if (progressBar) progressBar.style.width = `${(task.subtasks.completed / task.subtasks.total) * 100}%`;
}