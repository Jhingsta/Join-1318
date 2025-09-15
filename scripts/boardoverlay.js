/**
 * Task in Firebase updaten
 */
async function updateTaskInFirebase(task) {
    if (!task.firebaseId) {
        return;
    }

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
                    assignedUsersFull: task.assignedUsersFull || []
                }),
            }
        );
        document.dispatchEvent(new CustomEvent("taskUpdated", { detail: task }));
    } catch (err) {
        console.error("Fehler beim Firebase-Update:", err);
    }
}

/**
 * Hilfsfunktion für Initialen
 */
function getInitials(name) {
    if (!name) return '';
    return name.split(' ').map(n => n[0].toUpperCase()).join('');
}

/**
 * Kontakte aus Firebase laden
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
 * Task normalisieren – alte Strukturen in assignedUsersFull migrieren
 */
function normalizeTask(task) {
    if (!task.assignedUsersFull) task.assignedUsersFull = [];

    // Alte Felder migrieren
    if (task.usersFull?.length > 0) {
        task.usersFull.forEach(user => {
            if (!task.assignedUsersFull.find(u => u.name === user.name)) {
                task.assignedUsersFull.push({
                    id: user.id || user.name,
                    name: user.name,
                    color: user.color || "#888",
                    initials: getInitials(user.name)
                });
            }
        });
    }

    if (task.users?.length > 0) {
        task.users.forEach(initials => {
            if (!task.assignedUsersFull.find(u => u.initials === initials)) {
                task.assignedUsersFull.push({
                    id: initials,
                    name: initials,
                    color: "#888",
                    initials
                });
            }
        });
    }

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
        avatarDiv.style.backgroundColor = user.color || "#888";
        avatarsContainer.appendChild(avatarDiv);
    });
}

async function renderAssignedDropdownOverlay(task) {
    const dropdown = document.getElementById("edit-assigned-dropdown-overlay");
    if (!dropdown) return;

    // Dropdown nur einmal rendern
    if (!dropdown.hasChildNodes()) {
        const users = await loadContactsFromFirebase();
        users.forEach(user => {
            const item = document.createElement("div");
            item.className = "dropdown-item";
            item.textContent = user.name;

            // Vorausgewählt markieren
            if (task.assignedUsersFull?.some(u => u.id === user.id)) {
                item.classList.add("selected");
            }

            item.addEventListener("click", () => {
                const index = task.assignedUsersFull.findIndex(u => u.id === user.id);
                if (index !== -1) {
                    task.assignedUsersFull.splice(index, 1);
                    item.classList.remove("selected");
                } else {
                    task.assignedUsersFull.push({
                        id: user.id,
                        name: user.name,
                        initials: getInitials(user.name),
                        color: user.color || "#888"
                    });
                    item.classList.add("selected");
                }
                renderAvatars(task); // nur Avatare neu rendern
            });

            dropdown.appendChild(item);
        });
    }
}


/**
 * Edit-Mode öffnen
 */
async function openEditMode(task) {
    task = normalizeTask(task);

    const view = document.getElementById("task-view");
    const edit = document.getElementById("task-edit");
    const editForm = document.getElementById("edit-form-fields");

    view.classList.add("hidden");
    edit.classList.remove("hidden");

    let isoDate = "";
    if (task.dueDate?.includes(".")) {
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
    `;

    // Priority Buttons
    const priorityButtons = edit.querySelectorAll('.priority-btn');
    priorityButtons.forEach(btn => {
        if (btn.dataset.priority.toLowerCase() === priority.toLowerCase()) btn.classList.add('active');
        btn.addEventListener('click', () => {
            priorityButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            task.priority = btn.dataset.priority;
        });
    });

    // Assigned-To Dropdown + Avatare
    await renderAssignedDropdownOverlay(task);

    const dropdownBtn = document.getElementById("edit-assigned-dropdown-btn");
    const dropdown = document.getElementById("edit-assigned-dropdown-overlay");
    if (dropdownBtn && dropdown) {
        dropdownBtn.addEventListener("click", () => {
            dropdown.classList.toggle("hidden");
        });
    }

    // Save-Button
    document.getElementById("save-task").onclick = async () => {
        task.title = document.getElementById("edit-title").value;
        task.description = document.getElementById("edit-desc").value;
        task.priority = task.priority || 'Low';

        const newDue = document.getElementById("edit-dueDate").value;
        if (newDue) {
            const [y, m, d] = newDue.split("-");
            task.dueDate = `${d}.${m}.${y}`;
        }

        await updateTaskInFirebase(task);

        const tasks = window.taskManager.getTasks();
        const idx = tasks.findIndex(t => t.firebaseId === task.firebaseId);
        if (idx !== -1) {
            tasks[idx] = task;
            window.taskManager.saveTasks(tasks);
        }

        updateTaskCard(task.firebaseId);

        edit.classList.add("hidden");
        view.classList.remove("hidden");
        renderBoard();
    };
}
