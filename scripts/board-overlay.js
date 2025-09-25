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
        avatarDiv.className = "selected-avatar";
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

    // Sicherstellen, dass das Array existiert
    if (!task.assignedUsersFull) task.assignedUsersFull = [];

    const users = await loadContactsFromFirebase();

    users.forEach(user => {
        // Initialer Selektionszustand (true/false)
        const initiallySelected = task.assignedUsersFull.some(u => u.id === user.id);

        const item = document.createElement("div");
        item.className = "dropdown-item";
        if (initiallySelected) item.classList.add("selected");

        // Name (zuerst)
        const label = document.createElement("span");
        label.className = "dropdown-label";
        label.textContent = user.name;

        // Checkbox-Icons (danach)
        const checkboxWrapper = document.createElement("div");
        checkboxWrapper.className = "checkbox-wrapper";

        const defaultIcon = document.createElement("img");
        defaultIcon.className = "checkbox-default";
        defaultIcon.src = "./assets/icons-addTask/Property 1=Default.png"; // dein Default-Icon
        defaultIcon.alt = "unchecked";

        const checkedIcon = document.createElement("img");
        checkedIcon.className = "checkbox-checked";
        checkedIcon.src = "./assets/icons-addTask/Property 1=checked.svg"; // dein Checked-Icon
        checkedIcon.alt = "checked";

        // Sichtbar/unsichtbar initial setzen
        defaultIcon.style.display = initiallySelected ? "none" : "block";
        checkedIcon.style.display = initiallySelected ? "block" : "none";

        checkboxWrapper.appendChild(defaultIcon);
        checkboxWrapper.appendChild(checkedIcon);

        // Zusammensetzen: Name zuerst, Checkbox danach
        item.appendChild(label);
        item.appendChild(checkboxWrapper);

        // Klick-Handler: robust, ohne veraltete Closure-Variablen
        item.addEventListener("click", (e) => {
            e.stopPropagation();

            // Toggle Klasse → guter Single-Source-of-truth für UI
            const nowSelected = item.classList.toggle("selected");

            if (nowSelected) {
                // Hinzufügen (nur, wenn nicht schon vorhanden)
                if (!task.assignedUsersFull.some(u => u.id === user.id)) {
                    task.assignedUsersFull.push({
                        id: user.id,
                        name: user.name,
                        initials: getInitials(user.name),
                        color: user.color ?? "#888"
                    });
                }
                defaultIcon.style.display = "none";
                checkedIcon.style.display = "block";
            } else {
                // Entfernen
                task.assignedUsersFull = task.assignedUsersFull.filter(u => u.id !== user.id);
                defaultIcon.style.display = "block";
                checkedIcon.style.display = "none";
            }

            // Avatare in Overlay neu rendern
            renderAvatars(task);
        });

        dropdown.appendChild(item);
    });

    // Avatare initial rendern
    renderAvatars(task);
}


/**
 * Subtasks rendern
 */
function renderEditSubtasks(task) {
    const list = document.getElementById("edit-subtask-list");
    if (!list) return;

    list.innerHTML = "";

    task.subtasks.items.forEach((st, index) => {
        const li = document.createElement("li");
        li.className = "subtask-item";

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
    <input class="input-title" type="text" id="edit-title" value="${task.title || ""}">
    
<div class="description-container">
    <label class="desc-title" for="edit-desc">Description</label>
    <textarea class="description-input" id="edit-desc">${task.description || ""}</textarea>
</div>

<div class="due-date-container">
    <label class="due-date-header" for="edit-dueDate">Due Date</label>
    <input type="date" id="edit-dueDate" value="${isoDate}">
</div>


   
    <div id="edit-priority" class="priority-container">
    <label class="priority-header">Priority</label>
    <div class="priority-content">
        <button class="priority-frame" data-priority="Low">Low</button>
        <button class="priority-frame" data-priority="Medium">Medium</button>
        <button class="priority-frame" data-priority="Urgent">Urgent</button>
    </div>
</div>

<!-- Assigned To --> 
<div class="assigned-container-overlay"> 
<div class="assigned-header"> Assigned to <span class="optional">(optional)</span> </div> 
<div class="assigned-content"> 
<div class="assigned-text-container"> 
<div class="assigned-text" id="edit-assigned-dropdown-btn">Select contacts to assign</div> 
<img id="edit-assigned-arrow" 
           src="./assets/icons-addTask/arrow_drop_down.png" 
           class="assigned-arrow-icon">
<div id="edit-assigned-dropdown-overlay" class="dropdown-menu-overlay-edit hidden"></div> 
</div> 
</div> 
</div> 
<div id="edit-avatars-container-overlay" class="avatars-container-overlay"></div> 
</div>


    <label class="assigned-header">Subtasks</label>
    <div id="task-content-addtask">
    <input type="text" id="edit-subtask-input" placeholder="Add new subtask">
    <div id="assigned-arrow-container">
    <button id="edit-subtask-add">
    <img id="cancel-btn" src="/assets/icons-addTask/Subtask cancel.png" alt="Cancel subtask" class="assigned-arrow-icon" style="display: inline;">
    <img id="check-btn" src="/assets/icons-addTask/Subtask's icons (1).png" alt="Confirm subtask" class="assigned-arrow-icon" style="display:none;"></button>
    </div>
    </div>
    <div id="edit-subtask-list"></div>
    
`;


const priorityButtons = edit.querySelectorAll('.priority-frame');
priorityButtons.forEach(btn => {
    if (btn.dataset.priority.toLowerCase() === priority.toLowerCase()) {
        btn.classList.add('active');
    }
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
        avatarDiv.className = "selected-avatar";
        avatarDiv.textContent = user.initials || getInitials(user.name);
        avatarDiv.style.backgroundColor = user.color ?? "#888";
        container.appendChild(avatarDiv);
    });
}
