let tasks = [];
let users = [];
let currentNewTask = null;
let currentTask = null; // aktuell geöffnete Task im Overlay

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
const arrow = assignedContent.querySelector('.assigned-arrow-container');
const arrowIcon = arrowContainer.querySelector('img');

const assignedDropdown = document.getElementById('assigned-dropdown');
const dropdown = document.getElementById("add-assigned-dropdown");
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
const cancelButton = document.getElementById('cancel-btn');
const closeButton = document.querySelector('.close');

const categories = ["Technical Task", "User Story"];
const titleInput = document.querySelector(".title-input");
const titleError = document.querySelector(".error-message");

const dueDateInput = document.querySelector(".due-date-input");
const dueDateIcon = document.querySelector(".due-date-icon");
const dueDateContainer = document.querySelector(".due-date-content");
const dueDateError = document.querySelector(".due-date-container .error-message");

async function loadTasksForBoard() {
    try {
        tasks = await loadTasks(); // Nutzt die Funktion aus tasks-crud.js
        
        // Stelle sicher, dass assignedUsersFull existiert
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

// Helper-Funktion um Tasks zu holen (ersetzt window.taskManager.getTasks())
function getTasks() {
    return tasks;
}

function getTasks() {
    return tasks || [];
}

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

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    // Nur Eingabe in Subtask-Leiste leeren
    cancelButton?.addEventListener('click', () => {
        const subtaskInput = document.querySelector('#subtask-input'); // ID oder Klasse deiner Eingabe
        if (subtaskInput) subtaskInput.value = '';
    });
    await loadTasksForBoard();
    renderBoard();

    async function renderAssignedDropdownModal(task) {
        if (!dropdown) return;
        dropdown.innerHTML = "";
        
        // ✅ KORRIGIERT: Verwende loadUsers() statt loadContactsFromFirebase()
        // Warte auf das Laden der Users (falls noch nicht geladen)
        if (users.length === 0) {
            await loadUsers();
        }
        
        users.forEach(user => {
            const item = document.createElement("div");
            item.className = "dropdown-item";
            item.textContent = user.name;
            
            // Prüfen ob User bereits zugewiesen ist
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
                        initials: user.initials,
                        color: user.color
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
            avatarDiv.textContent = user.initials; 
            avatarDiv.style.backgroundColor = user.color; 
            avatarsContainer.appendChild(avatarDiv);
        });
    }
    // Save Button beim Klick aktiv machen
    createBtn?.addEventListener('click', () => {
        createBtn.classList.add('active');
    });

    try {
        await loadTasksForBoard();
        renderBoard();
    } catch (error) {
        console.error('Error loading tasks:', error);
        return;
    }

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
            subtasks: subtasksItems, // ✅ Direkt das Array - createTask() macht den Rest
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
            const newTask = await createTask(payload); // Statt window.taskManager.createTask()
            tasks.push(newTask); // Task zur lokalen Liste hinzufügen
            renderBoard(); // Board neu rendern
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
    // ✅ GEÄNDERT: getTasks() statt window.taskManager.getTasks()
    const boardTasks = getTasks(); // Nutzt unsere neue getTasks() Funktion
    
    const columns = {
        todo: document.getElementById('column-todo'),
        inProgress: document.getElementById('column-inProgress'),
        awaitFeedback: document.getElementById('column-awaitFeedback'),
        done: document.getElementById('column-done'),
    };
    
    // Spalten leeren
    Object.values(columns).forEach((el) => el && (el.innerHTML = ''));
    
    // Tasks rendern
    boardTasks.forEach((task) => {
        const card = createTaskCard(task);
        const column = columns[task.status] || columns.todo;
        if (column) {
            column.appendChild(card);
        }
    });
    
    // Placeholder für leere Spalten
    Object.entries(columns).forEach(([status, columnEl]) => {
        if (!columnEl) return;
        if (columnEl.children.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'task-placeholder';
            placeholder.textContent = `No tasks in ${readableStatus(status)}`;
            columnEl.appendChild(placeholder);
        }
    });
}

// ---------- Populate Dropdown ----------
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

    (users || []).forEach((user, i) => {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        div.dataset.clicked = "false";

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

    selected.forEach(user => {
        const a = document.createElement('div');
        a.className = 'selected-avatar assigned-text';
        a.dataset.fullname = u.name;         // NEU: vollständiger Name für Overlay
        a.textContent = user.initials;
        a.style.backgroundColor = user.color;
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

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    // ✅ Verwende task.id (von loadTasks()) statt task.firebaseId
    card.id = `task-${task.id}`;
    
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
            avatarDiv.textContent = user.initials;
            avatarDiv.style.backgroundColor = user.color;
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
    const dueDate = dueDateInput.value; // Behalte yyyy-mm-dd (ISO-Format)

    // 4. Priority
    const priorityBtn = document.querySelector(".priority-frame.active");
    const priority = priorityBtn ? priorityBtn.textContent.trim().toLowerCase() : "medium";

    // 5. Assigned Users Full (Vollständige Daten)
    let assignedUsersFull = [];
    if (dropdown) {
        dropdown.querySelectorAll('.dropdown-item.selected').forEach(div => {
            const name = div.textContent.trim();
            const user = users.find(u => u.name === name);
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

    // 6. Category
    const categoryText = document.querySelector(".category-content .assigned-text");
    const category = categoryText ? categoryText.textContent.trim() : null;

    // 7. Subtasks
    const subtaskItems = document.querySelectorAll("#subtask-list li");
    const subtasks = Array.from(subtaskItems)
        .map(el => el.textContent.trim())
        .filter(text => text.length > 0);

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
        // Verwende die createTask() Funktion aus tasks-crud.js
        const newTask = await createTask({
            title: taskData.title,
            description: taskData.description,
            dueDate: taskData.dueDate,
            priority: taskData.priority,
            assignedUsersFull: taskData.assignedUsersFull,
            category: taskData.category,
            subtasks: taskData.subtasks // createTask() verarbeitet das bereits richtig
        });
        
        // Task zur lokalen Liste hinzufügen
        tasks.push(newTask);
        
        return newTask; // Zurückgeben mit id statt firebaseId
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
    const result = await saveTask(taskData);

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

// Ersetze window.taskManager.updateTaskInFirebase mit:
async function updateTaskStatus(task, newStatus) {
    if (!task.id) return;
    
    try {
        // Verwende updateTask() aus tasks-crud.js
        await updateTask(task.id, { status: newStatus });
        
        // Task auch lokal aktualisieren
        const localTask = tasks.find(t => t.id === task.id);
        if (localTask) {
            localTask.status = newStatus;
        }
        
        console.log('Task status aktualisiert:', task.id, newStatus);
    } catch (error) {
        console.error("Fehler beim Aktualisieren in Firebase:", error);
        throw error;
    }
}

// Allgemeinere Funktion für alle Task-Updates:
async function updateTaskData(taskId, updates) {
    try {
        await updateTask(taskId, updates);
        
        // Task auch lokal aktualisieren
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
    
    // ✅ GEÄNDERT: task.id statt task.firebaseId
    overlay.dataset.taskId = task.id;
    
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
    // Delete-Button Handler
    const deleteBtn = view.querySelector(".delete-btn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
            if (!task.id) return;
            
            try {
                // ✅ GEÄNDERT: Verwende deleteTask() aus tasks-crud.js
                await deleteTask(task.id);
                
                // ✅ GEÄNDERT: Task aus lokaler Liste entfernen
                const taskIndex = tasks.findIndex(t => t.id === task.id);
                if (taskIndex > -1) {
                    tasks.splice(taskIndex, 1);
                }
                
                // Overlay schließen
                document.getElementById("task-detail-overlay").classList.add("hidden");
                
                // ✅ GEÄNDERT: Nur Board neu rendern, kein erneutes Laden nötig
                renderBoard();
                
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Failed to delete task');
            }
        });
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
    return users.map(user =>  `
        <div class="assigned-item">
            <div class="assigned-avatar" style="
                background-color: ${user.color};
                width:42px;
                height:42px;
                border-radius:50%;
                display:flex;
                align-items:center;
                justify-content:center;
                font-weight:400;
                font-size:12px;
                color:#fff;
            ">
                ${user.initials}
            </div>
            <span class="assigned-name-full">${user.name}</span>
        </div>
    `).join("");
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
                    <div class="checkbox-wrapper" onclick="toggleCheckbox(this, '${task.id}', ${index})">
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

// 🔹 Neue Subtask hinzufügen
async function addSubtask(taskId, title) {
    if (!taskId || !title) return;

    try {
        // Task aus lokaler Liste holen
        const task = getTasks().find(t => t.id === taskId);
        if (!task) {
            console.error('Task nicht gefunden:', taskId);
            return;
        }

        // Sicherstellen dass Subtasks-Struktur existiert
        if (!task.subtasks) {
            task.subtasks = { items: [], total: 0, completed: 0 };
        }
        if (!Array.isArray(task.subtasks.items)) {
            task.subtasks.items = [];
        }

        // Neue Subtask hinzufügen
        task.subtasks.items.push({ title, done: false });
        
        // Zähler aktualisieren
        task.subtasks.total = task.subtasks.items.length;
        task.subtasks.completed = task.subtasks.items.filter(st => st.done).length;

        // Verwende updateTask() aus tasks-crud.js
        await updateTask(taskId, {
            subtasks: {
                items: task.subtasks.items,
                total: task.subtasks.total,
                completed: task.subtasks.completed
            }
        });

        // DOM aktualisieren
        renderBoard();

        console.log('Subtask hinzugefügt:', title);

    } catch (error) {
        console.error("Fehler beim Hinzufügen der Subtask:", error);
        throw error; // Für Error-Handling im aufrufenden Code
    }
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
    // ✅ GEÄNDERT: getTasks() statt window.taskManager.getTasks()
    // ✅ GEÄNDERT: t.id statt t.firebaseId
    const task = getTasks().find(t => t.id === taskId);
    if (task && task.subtasks && task.subtasks.items) {
        task.subtasks.items[subtaskIndex].done = !task.subtasks.items[subtaskIndex].done;
        task.subtasks.completed = task.subtasks.items.filter(st => st.done).length;
    }

    // 3️⃣ Counter & Fortschritt sofort updaten
    updateTaskCard(taskId);

    // 4️⃣ Firebase aktualisieren (async, ohne UI zu blockieren)
    // ✅ GEÄNDERT: Verwende unsere updateTask() Funktion
    updateSubtaskInFirebase(taskId, task).catch(err => console.error(err));
}

// ✅ NEUE HILFSFUNKTION für Firebase-Update:
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
        // Optional: UI-Rollback bei Fehler
    }
}

function updateTaskCard(taskId) {
    // ✅ GEÄNDERT: getTasks() statt window.taskManager.getTasks()
    // ✅ GEÄNDERT: t.id statt t.firebaseId
    const task = getTasks().find(t => t.id === taskId);
    if (!task) return;

    const card = document.getElementById(`task-${taskId}`);
    if (!card) return;

    // Sicherheitscheck für subtasks
    if (!task.subtasks || !task.subtasks.items) return;

    // Counter updaten
    const counter = card.querySelector('.subtasks-text');
    if (counter) {
        counter.textContent = `${task.subtasks.completed}/${task.subtasks.total} Subtasks`;
    }

    // Fortschritt updaten
    const progressBar = card.querySelector('.progress-container div');
    if (progressBar) {
        const percentage = task.subtasks.total > 0 
            ? (task.subtasks.completed / task.subtasks.total) * 100 
            : 0;
        progressBar.style.width = `${percentage}%`;
    }
}