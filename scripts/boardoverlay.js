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
                    assignedUsersFull: task.assignedUsersFull || []
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


        // ✅ Hier die data-* Attribute setzen
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

            renderAvatars(task); // ✅ Avatar-Container neu rendern
        });


        dropdown.appendChild(item);
    });

    renderAvatars(task);
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
    `;

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

document.getElementById("save-task").onclick = async () => {
    if (!currentTask) return;

    console.log("💾 Save gestartet:", currentTask);

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
