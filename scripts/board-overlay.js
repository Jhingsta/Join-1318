//Task in Firebase updaten
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

//Hilfsfunktion: Initialen aus Namen bilden
function getInitials(name) {
    if (!name) return '';
    return name.split(' ').map(n => n[0].toUpperCase()).join('');
}


//Kontakte aus Firebase laden (mit stabiler id)
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

//Task normalisieren – assignedUsersFull anhand von Kontakten reparieren
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

//Avatare rendern
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

//Dropdown für Assigned Users rendern
async function renderAssignedDropdownOverlay(task) {
    const dropdown = document.getElementById("edit-assigned-dropdown-overlay");
    if (!dropdown) return;

    dropdown.innerHTML = "";

    if (!task.assignedUsersFull) task.assignedUsersFull = [];

    const users = await loadContactsFromFirebase();

    users.forEach(user => {
        const initiallySelected = task.assignedUsersFull.some(u => u.id === user.id);

        const item = document.createElement("div");
        item.className = "dropdown-item";
        if (initiallySelected) item.classList.add("selected");

        // Avatar + Name
        const wrapper = document.createElement("div");
        wrapper.className = "assigned-wrapper";

        const avatar = document.createElement("div");
        avatar.className = "dropdown-avatar";
        avatar.textContent = getInitials(user.name);
        avatar.style.backgroundColor = user.color ?? "#888";

        const label = document.createElement("span");
        label.textContent = user.name;

        wrapper.appendChild(avatar);
        wrapper.appendChild(label);

        // Checkbox
        const checkboxWrapper = document.createElement("div");
        checkboxWrapper.className = "checkbox-wrapper";

        const defaultIcon = document.createElement("img");
        defaultIcon.className = "checkbox-default";
        defaultIcon.src = "./assets/icons-addTask/Property 1=Default.png";
        defaultIcon.alt = "unchecked";

        const checkedIcon = document.createElement("img");
        checkedIcon.className = "checkbox-checked";
        checkedIcon.src = "./assets/icons-addTask/Property 1=checked.svg";
        checkedIcon.alt = "checked";

        defaultIcon.style.display = initiallySelected ? "none" : "block";
        checkedIcon.style.display = initiallySelected ? "block" : "none";

        checkboxWrapper.appendChild(defaultIcon);
        checkboxWrapper.appendChild(checkedIcon);

        item.appendChild(wrapper);
        item.appendChild(checkboxWrapper);

        item.addEventListener("click", (e) => {
            e.stopPropagation();
            const nowSelected = item.classList.toggle("selected");

            if (nowSelected) {
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
                task.assignedUsersFull = task.assignedUsersFull.filter(u => u.id !== user.id);
                defaultIcon.style.display = "block";
                checkedIcon.style.display = "none";
            }

            renderAvatars(task);
        });

        dropdown.appendChild(item);
    });

    renderAvatars(task);
}

//Subtasks rendern
function renderEditSubtasks(task) {
    const list = document.getElementById("edit-subtask-list");
    if (!list) return;

    list.innerHTML = "";

    // Fallback, falls noch keine Subtasks existieren
    if (!task.subtasks) {
        task.subtasks = { items: [], total: 0, completed: 0 };
    }
    if (!task.subtasks.items) {
        task.subtasks.items = [];
    }

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

//Checkbox toggle
async function toggleSubtaskInEdit(task, index) {
    task.subtasks.items[index].done = !task.subtasks.items[index].done;
    await updateSubtasksInFirebase(task);
    renderEditSubtasks(task);
}

//Subtask edit mode
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

 //Subtasks in Firebase speichern
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

//Edit-Mode öffnen
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

    const priority = (task.priority || "Low").trim();

    // HTML generieren
    editForm.innerHTML = `
        <input class="input-title" type="text" id="edit-title" value="${task.title || ""}">

        <div class="description-container">
            <label class="desc-title" for="edit-desc">Description</label>
            <textarea class="description-input" id="edit-desc">${task.description || ""}</textarea>
        </div>

        <div class="due-date-container-overlay">
            <label class="due-date-header" for="edit-dueDate">Due Date</label>
            <input type="date" id="edit-dueDate" value="${isoDate}">
        </div>

        <div id="edit-priority" class="priority-container">
            <label class="priority-header">Priority</label>
            <div class="priority-content">
            <button class="priority-frame" data-priority="Urgent"><img src="./assets/icons-addTask/Prio alta.svg" alt>Urgent</button>
            <button class="priority-frame" data-priority="Medium"><img src="./assets/icons-addTask/Capa 2.svg" alt>Medium</button>
            <button class="priority-frame" data-priority="Low"><img src="./assets/icons-addTask/Prio baja.svg" alt>Low</button> 
            </div>
        </div>

<div class="assigned-container-overlay"> 
    <div class="assigned-header"> Assigned to <span class="optional">(optional)</span> </div> 
    <div class="assigned-content-overlay"> 
        <div class="assigned-text-container"> 
            <div class="assigned-text" id="edit-assigned-placeholder">Select contacts to assign</div> 
            <input type="text" id="edit-assigned-input" class="assigned-input" style="display:none;">
            <img id="edit-assigned-arrow" src="./assets/icons-addTask/arrow_drop_down.png" class="assigned-arrow-icon">
            <div id="edit-assigned-dropdown-overlay" class="dropdown-menu-overlay-edit hidden"></div> 
        </div> 
    </div> 
</div> 
<div id="edit-avatars-container-overlay" class="avatars-container-overlay"></div>

        <label class="assigned-header">Subtasks</label>
        <div id="task-content-addtask">
            <input type="text" id="edit-subtask-input" placeholder="Add new subtask">
            <div id="assigned-arrow-container">

<img id="edit-cancel-btn" class="assigned-arrow-icon" style="display:none;" src="/assets/icons-addTask/Subtask cancel.png" alt="Cancel subtask">
<img id="edit-check-btn" class="assigned-arrow-icon" style="display:none;" src="/assets/icons-addTask/Subtask's icons (1).png" alt="Confirm subtask">

            </div>
        </div>
        <div id="edit-subtask-list"></div>
    `;

    const dueDateInput = document.getElementById("edit-dueDate");
    const dueDateContainer = document.querySelector(".due-date-container-overlay");

    dueDateContainer.addEventListener("click", (e) => {
        if (e.target === dueDateInput) return; // Klick direkt auf Input ignorieren
        dueDateInput.focus(); // Fokus setzen
        dueDateInput.click(); // Versuch den Datepicker zu öffnen
    });
    const placeholder = document.getElementById("edit-assigned-placeholder");
    const input = document.getElementById("edit-assigned-input");
    const arrow = document.getElementById("edit-assigned-arrow");

    function openDropdown() {
        dropdown.classList.remove("hidden");
        input.style.display = "inline";
        placeholder.style.display = "none";
        arrow.src = "./assets/icons-addTask/arrow_drop_down_up.png";
        input.focus();
    }

    function closeDropdown() {
        dropdown.classList.add("hidden");
        input.style.display = "none";
        placeholder.style.display = "block";
        arrow.src = "./assets/icons-addTask/arrow_drop_down.png";
        input.value = "";
    }

    placeholder.addEventListener("click", (e) => {
        e.stopPropagation();
        openDropdown();
    });
    arrow.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.contains("hidden") ? openDropdown() : closeDropdown();
    });

    // Klick außerhalb schließt Dropdown
    document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target) && e.target !== input && e.target !== placeholder && e.target !== arrow) {
            closeDropdown();
        }
    });

    // Live-Suche
    input.addEventListener("input", () => {
        const filter = input.value.toLowerCase();
        Array.from(dropdown.children).forEach(div => {
            const name = div.querySelector("span").textContent.toLowerCase();
            div.style.display = name.includes(filter) ? "flex" : "none";
        });
    });

    // Input-Feld klick → Dropdown öffnen/schließen
    input.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.contains("hidden") ? openDropdown() : closeDropdown();
    });

    // DOM-Elemente greifen
    const subtaskInput = document.getElementById("edit-subtask-input"); // Dein Subtask Input im Edit-Modal
    const editCancelBtn = document.getElementById("edit-cancel-btn");
    const editCheckBtn = document.getElementById("edit-check-btn");

    subtaskInput.addEventListener("input", () => {
        const hasText = subtaskInput.value.trim().length > 0;
        editCancelBtn.style.display = hasText ? "inline-block" : "none";
        editCheckBtn.style.display = hasText ? "inline-block" : "none";
    });

    // Cancel Button
    editCancelBtn.addEventListener("click", () => {
        subtaskInput.value = "";
        editCancelBtn.style.display = "none";
        editCheckBtn.style.display = "none";
    });

    editCheckBtn.addEventListener("click", async () => {
        const text = subtaskInput.value.trim();
        if (text) {
            // Subtask zum Task hinzufügen
            if (!task.subtasks) task.subtasks = { items: [], total: 0, completed: 0 };
            task.subtasks.items.push({ title: text, done: false });

            // Subtasks in Firebase speichern
            await updateSubtasksInFirebase(task);

            // Subtasks neu rendern
            renderEditSubtasks(task);

            // Input und Buttons zurücksetzen
            subtaskInput.value = "";
            editCancelBtn.style.display = "none";
            editCheckBtn.style.display = "none";
        }
    });

    // Priorität Buttons
    const priorityButtons = edit.querySelectorAll(".priority-frame");
    priorityButtons.forEach((btn) => {
        if (btn.dataset.priority.toLowerCase() === priority.toLowerCase()) {
            btn.classList.add("active");
        }
        btn.addEventListener("click", () => {
            priorityButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            task.priority = btn.dataset.priority;
        });
    });

    // Task normalisieren
    task = normalizeTask(task, contacts);
    currentTask = task;

    // Assigned Users Dropdown
    await renderAssignedDropdownOverlay(task);
    const dropdownBtn = document.getElementById("edit-assigned-dropdown-btn");
    const dropdown = document.getElementById("edit-assigned-dropdown-overlay");
    if (dropdownBtn && dropdown) {
        dropdownBtn.onclick = () => dropdown.classList.toggle("hidden");
    }

    // Subtasks initial rendern
    renderEditSubtasks(task);

    // Save-Button
    document.getElementById("save-task").onclick = async () => {
        if (!currentTask) return;

        currentTask.title = document.getElementById("edit-title").value;
        currentTask.description = document.getElementById("edit-desc").value;
        currentTask.priority = currentTask.priority || "Low";

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

//Detail-Overlay rendern
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