/**
 * Task in Firebase updaten
 */
async function updateTaskInFirebase(task) {
    if (!task.firebaseId) {
        console.error("Task hat keine firebaseId!");
        return;
    }

    // Alte Felder löschen, nur assignedUsersFull nutzen
    delete task.users;
    delete task.usersFull;

    try {
        await fetch(
            `https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/tasks/${task.firebaseId}.json`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: task.title,
                    description: task.description,
                    dueDate: task.dueDate,
                    priority: task.priority,
                    assignedUsersFull: task.assignedUsersFull || [],
                    category: task.category,
                }),
            }
        );
        console.log("✅ Task erfolgreich aktualisiert:", task.firebaseId);

        // Event feuern, damit Board-Ansicht sich sofort updated
        document.dispatchEvent(new CustomEvent("taskUpdated", { detail: task }));
    } catch (err) {
        console.error("❌ Fehler beim Firebase-Update:", err);
    }
}

/**
 * Hilfsfunktion: Initialen aus Namen bilden
 */
function getInitials(name) {
    if (!name) return '';
    return name.split(' ').map(n => n[0].toUpperCase()).join('');
}

/**
 * Kontakte aus Firebase laden (mit stabiler id)
 */
async function loadContactsFromFirebase() {
    try {
        const res = await fetch("https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/users.json");
        const data = await res.json();
        if (!data) return [];
        return Object.entries(data).map(([id, user]) => ({ id, ...user }));
    } catch (err) {
        console.error("Fehler beim Laden der Kontakte:", err);
        return [];
    }
}

/**
 * Task normalisieren – assignedUsersFull anhand von Kontakten reparieren
 */
function normalizeTask(task, contacts = []) {
    if (!task.assignedUsersFull) task.assignedUsersFull = [];

    const contactMap = new Map(contacts.map(c => [c.id, c]));

    task.assignedUsersFull = task.assignedUsersFull.map(user => {
        const contact = contactMap.get(user.id) || contactMap.get(user.name);
        return {
            id: contact ? contact.id : user.id || user.name,
            name: contact ? contact.name : user.name,
            color: contact ? contact.color : (user.color ?? "#888"),
            initials: user.initials || getInitials(user.name)
        };
    });

    delete task.usersFull;
    delete task.users;

    return task;
}

/**
 * Avatare rendern
 */
function renderAvatars(task) {
    const avatarsContainer = document.getElementById("edit-avatars-container-overlay");
    if (!avatarsContainer) return;
    avatarsContainer.innerHTML = "";

    (task.assignedUsersFull || []).forEach(user => {
        const avatarDiv = document.createElement("div");
        avatarDiv.className = "assigned-avatar";
        avatarDiv.textContent = user.initials || getInitials(user.name);
        avatarDiv.style.backgroundColor = user.color ?? "#888";

        avatarDiv.dataset.id = user.id;
        avatarDiv.dataset.fullname = user.name;
        avatarDiv.dataset.color = user.color ?? "#888";
        avatarDiv.dataset.initials = user.initials;
        avatarsContainer.appendChild(avatarDiv);
    });
}

/**
 * Dropdown für Assigned Users rendern
 */
async function renderAssignedDropdownOverlay(task) {
    const dropdown = document.getElementById("edit-assigned-dropdown-overlay");
    if (!dropdown) return;

    dropdown.innerHTML = "";
    const users = await loadContactsFromFirebase();

    users.forEach(user => {
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
                task.assignedUsersFull.splice(index, 1);
                item.classList.remove("selected");
            } else {
                task.assignedUsersFull.push({
                    id: user.id,
                    name: user.name,
                    initials: getInitials(user.name),
                    color: user.color ?? "#888"
                });
                item.classList.add("selected");
            }

            renderAvatars(task); // Avatar-Container neu rendern
        });

        dropdown.appendChild(item);
    });

    renderAvatars(task);
}

/**
 * Subtasks rendern
 */
function renderEditSubtasks(task) {
    const list = document.getElementById("edit-subtask-list");
    if (!list) return;

    list.innerHTML = "";

    if (!task.subtasks || !task.subtasks.items || task.subtasks.items.length === 0) {
        list.innerHTML = `<li>Keine Subtasks</li>`;
        return;
    }

    task.subtasks.items.forEach((st, index) => {
        const li = document.createElement("li");
        li.className = "subtask-item";

        const checkboxWrapper = document.createElement("div");
        checkboxWrapper.className = "checkbox-wrapper";

        const checkboxDefault = document.createElement("img");
        checkboxDefault.src = "./assets/icons-addTask/Property 1=Default.svg";
        checkboxDefault.className = "checkbox-default";
        checkboxDefault.style.display = st.done ? "none" : "block";

        const checkboxChecked = document.createElement("img");
        checkboxChecked.src = "./assets/icons-addTask/Property 1=checked.svg";
        checkboxChecked.className = "checkbox-checked";
        checkboxChecked.style.display = st.done ? "block" : "none";

        checkboxWrapper.appendChild(checkboxDefault);
        checkboxWrapper.appendChild(checkboxChecked);
        checkboxWrapper.addEventListener("click", () => toggleSubtaskInEdit(task, index));

        const span = document.createElement("span");
        span.textContent = st.title;
        span.className = "subtask-text";

        const editIcon = document.createElement("img");
        editIcon.src = "./assets/icons-addTask/Property 1=edit.png";
        editIcon.alt = "Edit";
        editIcon.addEventListener("click", () => startEditSubtaskMode(task, li, span, index));

        const deleteIcon = document.createElement("img");
        deleteIcon.src = "./assets/icons-addTask/Property 1=delete.png";
        deleteIcon.alt = "Delete";
        deleteIcon.addEventListener("click", async () => {
            task.subtasks.items.splice(index, 1);
            await updateSubtasksInFirebase(task);
            renderEditSubtasks(task);
        });

        const iconsDiv = document.createElement("div");
        iconsDiv.className = "subtask-icons";
        iconsDiv.appendChild(editIcon);
        iconsDiv.appendChild(deleteIcon);

        li.appendChild(checkboxWrapper);
        li.appendChild(span);
        li.appendChild(iconsDiv);

        list.appendChild(li);
    });
}

/**
 * Checkbox toggle
 */
async function toggleSubtaskInEdit(task, index) {
    task.subtasks.items[index].done = !task.subtasks.items[index].done;
    await updateSubtasksInFirebase(task);
    renderEditSubtasks(task);
}

/**
 * Subtask edit mode
 */
function startEditSubtaskMode(task, li, span, index) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = span.textContent;
    input.className = "subtask-edit-input";

    const saveIcon = document.createElement("img");
    saveIcon.src = "./assets/icons-addTask/Subtask's icons (1).png";
    saveIcon.alt = "Save";
    saveIcon.addEventListener("click", async () => {
        task.subtasks.items[index].title = input.value.trim() || task.subtasks.items[index].title;
        await updateSubtasksInFirebase(task);
        renderEditSubtasks(task);
    });

    const deleteIcon = document.createElement("img");
    deleteIcon.src = "./assets/icons-addTask/Property 1=delete.png";
    deleteIcon.alt = "Delete";
    deleteIcon.addEventListener("click", async () => {
        task.subtasks.items.splice(index, 1);
        await updateSubtasksInFirebase(task);
        renderEditSubtasks(task);
    });

    const iconsDiv = document.createElement("div");
    iconsDiv.className = "subtask-icons";
    iconsDiv.appendChild(saveIcon);
    iconsDiv.appendChild(deleteIcon);

    li.innerHTML = "";
    li.appendChild(input);
    li.appendChild(iconsDiv);

    input.focus();
}

/**
 * Subtasks in Firebase speichern
 */
async function updateSubtasksInFirebase(task) {
    if (!task.firebaseId) return;
    if (!task.subtasks) task.subtasks = { items: [], total: 0, completed: 0 };

    task.subtasks.total = task.subtasks.items.length;
    task.subtasks.completed = task.subtasks.items.filter(st => st.done).length;

    await fetch(`https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/tasks/${task.firebaseId}/subtasks.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task.subtasks)
    });
}

/**
 * Edit-Mode öffnen
 */
async function openEditMode(task) {
    const contacts = await loadContactsFromFirebase();
    const view = document.getElementById("task-view");
    const edit = document.getElementById("task-edit");
    const editForm = document.getElementById("edit-form-fields");

    view.classList.add("hidden");
    edit.classList.remove("hidden");

    let isoDate = "";
    if (task.dueDate && task.dueDate.includes(".")) {
        const [day, month, year] = task.dueDate.split(".");
        isoDate = `${year}-${month}-${day}`;
    }

    const priority = (task.priority || 'Low').trim();

    editForm.innerHTML = `
        <label for="edit-title">Title</label>
        <input type="text" id="edit-title" value="${task.title || ""}">

        <label for="edit-desc">Description</label>
        <textarea id="edit-desc">${task.description || ""}</textarea>

        <label for="edit-dueDate">Due Date</label>
        <input type="date" id="edit-dueDate" value="${isoDate}">

        <label>Priority</label>
        <div id="edit-priority" class="priority-options">
            <button class="priority-btn" data-priority="Low">Low</button>
            <button class="priority-btn" data-priority="Medium">Medium</button>
            <button class="priority-btn" data-priority="Urgent">Urgent</button>
        </div>

        <label>Category</label>
        <div class="category-container">
            <div class="category-content">
                <span class="assigned-text">${task.category || "Select task category"}</span>
                <div class="assigned-arrow-container">
                    <img class="assigned-arrow-icon" src="/assets/icons-addTask/arrow_drop_down.png" alt="Arrow">
                </div>
            </div>
        </div>

        <div id="edit-subtask-list"></div>
        <input type="text" id="edit-subtask-input" placeholder="New subtask">
        <button id="edit-subtask-add">+</button>
    `;

    // Kategorien-Array
    const categories = ["User Story", "Technical Task"];
    const categoryContainer = edit.querySelector('.category-container .category-content');
    const categoryText = categoryContainer.querySelector('.assigned-text');
    const categoryArrow = categoryContainer.querySelector('.assigned-arrow-icon');

    const categoryDropdown = document.createElement('div');
    categoryDropdown.className = 'dropdown-menu';

    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = cat;
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            categoryText.textContent = cat;
            categoryDropdown.classList.remove('show');
            categoryArrow.src = '/assets/icons-addTask/arrow_drop_down.png';
            task.category = cat;
        });
        categoryDropdown.appendChild(item);
    });

    categoryContainer.appendChild(categoryDropdown);
    categoryContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = categoryDropdown.classList.contains('show');
        categoryDropdown.classList.toggle('show', !isOpen);
        categoryArrow.src = !isOpen
            ? '/assets/icons-addTask/arrow_drop_down_up.png'
            : '/assets/icons-addTask/arrow_drop_down.png';
    });

    document.addEventListener('click', (e) => {
        if (!categoryContainer.contains(e.target)) {
            categoryDropdown.classList.remove('show');
            categoryArrow.src = '/assets/icons-addTask/arrow_drop_down.png';
        }
    });

    const priorityButtons = edit.querySelectorAll('.priority-btn');
    priorityButtons.forEach(btn => {
        if (btn.dataset.priority.toLowerCase() === priority.toLowerCase()) btn.classList.add('active');
        btn.addEventListener('click', () => {
            priorityButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            task.priority = btn.dataset.priority;
        });
    });

    task = normalizeTask(task, contacts);
    currentTask = task;

    await renderAssignedDropdownOverlay(task);
    const dropdownBtn = document.getElementById("edit-assigned-dropdown-btn");
    const dropdown = document.getElementById("edit-assigned-dropdown-overlay");
    if (dropdownBtn && dropdown) {
        dropdownBtn.onclick = () => dropdown.classList.toggle("hidden");
    }

    // Subtask hinzufügen
    const subtaskInput = document.getElementById("edit-subtask-input");
    const addBtn = document.getElementById("edit-subtask-add");
    addBtn.addEventListener("click", async () => {
        const val = subtaskInput.value.trim();
        if (!val) return;
        if (!task.subtasks) task.subtasks = { items: [], total: 0, completed: 0 };
        task.subtasks.items.push({ title: val, done: false });
        subtaskInput.value = "";
        await updateSubtasksInFirebase(task);
        renderEditSubtasks(task);
    });

    renderEditSubtasks(task);

    document.getElementById("save-task").onclick = async () => {
        if (!currentTask) return;

        currentTask.title = document.getElementById("edit-title").value;
        currentTask.description = document.getElementById("edit-desc").value;
        currentTask.priority = currentTask.priority || 'Low';

        const newDue = document.getElementById("edit-dueDate").value;
        if (newDue) {
            const [y, m, d] = newDue.split("-");
            currentTask.dueDate = `${d}.${m}.${y}`;
        }
        dropdown.classList.add("hidden");

        await updateTaskInFirebase(currentTask);
        openTaskDetails(currentTask);
        renderBoard();
    };
}

/**
 * Detail-Overlay rendern
 */
function renderDetailOverlay(task) {
    const container = document.getElementById("detail-avatars-container");
    if (!container) return;
    container.innerHTML = "";

    (task.assignedUsersFull || []).forEach(user => {
        const avatarDiv = document.createElement("div");
        avatarDiv.className = "assigned-avatar";
        avatarDiv.textContent = user.initials || getInitials(user.name);
        avatarDiv.style.backgroundColor = user.color ?? "#888";
        container.appendChild(avatarDiv);
    });
}
