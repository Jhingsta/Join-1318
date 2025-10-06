//Avatare rendern
function renderAvatars(task) {
    const avatarsContainer = document.getElementById("edit-avatars-container-overlay");
    if (!avatarsContainer) return;
    avatarsContainer.innerHTML = "";

    (task.assignedUsersFull || []).forEach(user => {
        const avatarDiv = document.createElement("div");
        avatarDiv.className = "selected-avatar";
        avatarDiv.textContent = user.initials;
        avatarDiv.style.backgroundColor = user.color;

        avatarDiv.dataset.id = user.id;
        avatarDiv.dataset.fullname = user.name;
        avatarDiv.dataset.color = user.color;
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
        avatar.textContent = user.initials;
        avatar.style.backgroundColor = user.color;

        const label = document.createElement("span");
        label.textContent = user.name;

        wrapper.appendChild(avatar);
        wrapper.appendChild(label);

        // Checkbox
        const checkboxWrapper = document.createElement("div");
        checkboxWrapper.className = "checkbox-wrapper";

        const defaultIcon = document.createElement("img");
        defaultIcon.className = "checkbox-default";
        defaultIcon.src = "./assets/icons-addtask/Property 1=Default.png";
        defaultIcon.alt = "unchecked";

        const checkedIcon = document.createElement("img");
        checkedIcon.className = "checkbox-checked";
        checkedIcon.src = "./assets/icons-addtask/Property 1=checked.svg";
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
                        initials: user.initials,
                        color: user.color
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
    if (!task.subtasks || !Array.isArray(task.subtasks)) {
        task.subtasks = [];
    }
    if (!task.subtasks.items) {
        task.subtasks.items = [];
    }

    (task.subtasks || []).forEach((st, index) => {
        const li = document.createElement("li");
        li.className = "subtask-item";

        const span = document.createElement("span");
        span.textContent = st.title;
        span.className = "subtask-text";

        const editIcon = document.createElement("img");
        editIcon.src = "./assets/icons-addtask/Property 1=edit.png";
        editIcon.alt = "Edit";
        editIcon.addEventListener("click", () => startEditSubtaskMode(task, li, span, index));

        const deleteIcon = document.createElement("img");
        deleteIcon.src = "./assets/icons-addtask/Property 1=delete.png";
        deleteIcon.alt = "Delete";
        deleteIcon.addEventListener("click", async () => {
            task.subtasks.items.splice(index, 1);
            await updateTask(task.id, { subtasks: task.subtasks });
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
    await updateTask(task.id, { subtasks: task.subtasks });
    renderEditSubtasks(task);
}

//Subtask edit mode
function startEditSubtaskMode(task, li, span, index) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = span.textContent;
    input.className = "subtask-edit-input";

    const saveIcon = document.createElement("img");
    saveIcon.src = "./assets/icons-addtask/Subtask's icons (1).png";
    saveIcon.alt = "Save";
    saveIcon.addEventListener("click", async () => {
        task.subtasks.items[index].title = input.value.trim() || task.subtasks.items[index].title;
        await updateTask(task.id, { subtasks: task.subtasks });
        renderEditSubtasks(task);
    });

    const deleteIcon = document.createElement("img");
    deleteIcon.src = "./assets/icons-addtask/Property 1=delete.png";
    deleteIcon.alt = "Delete";
    deleteIcon.addEventListener("click", async () => {
        task.subtasks.items.splice(index, 1);
        await updateTask(task.id, { subtasks: task.subtasks });
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

//Edit-Mode öffnen
async function openEditMode(task) {
    // ✅ KORRIGIERT: Verwende loadUsers() statt loadContactsFromFirebase()
    if (users.length === 0) {
        await loadUsers();
    }

    const view = document.getElementById("task-view");
    const edit = document.getElementById("task-edit");
    const editForm = document.getElementById("edit-form-fields");

    view.classList.add("hidden");
    edit.classList.remove("hidden");

    let isoDate = task.dueDate || "";

    const priority = (task.priority || "medium").trim().toLowerCase(); // Konsistent mit createTask()

    // HTML generieren
    editForm.innerHTML = taskEditTemplate(task, isoDate);

    const editDueDateInput = document.getElementById("edit-dueDate");
    const dueDateContainer = document.querySelector(".due-date-container-overlay");

    dueDateContainer.addEventListener("click", (e) => {
        if (e.target === editDueDateInput) return; // Klick direkt auf Input ignorieren
        editDueDateInput.focus(); // Fokus setzen
        editDueDateInput.click(); // Versuch den Datepicker zu öffnen
    });
    const placeholder = document.getElementById("edit-assigned-placeholder");
    const input = document.getElementById("edit-assigned-input");
    const arrow = document.getElementById("edit-assigned-arrow");

    function openDropdown() {
        dropdown.classList.remove("hidden");
        input.style.display = "inline";
        placeholder.style.display = "none";
        arrow.src = "./assets/icons-addtask/arrow_drop_down_up.png";
        input.focus();
    }

    function closeDropdown() {
        dropdown.classList.add("hidden");
        input.style.display = "none";
        placeholder.style.display = "block";
        arrow.src = "./assets/icons-addtask/arrow_drop_down.png";
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
    editForm.innerHTML = taskEditTemplate(task, isoDate);
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

    // ✅ KORRIGIERT: Check-Button Event für Subtasks
    editCheckBtn.addEventListener("click", async () => {
        const text = subtaskInput.value.trim();
        if (text) {
            await addSubtask(task.id, text);

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

    // ✅ KORRIGIERT: Save-Button
    document.getElementById("save-task").onclick = async () => {
        if (!currentTask) return;

        // Daten aus Form auslesen
        currentTask.title = document.getElementById("edit-title").value;
        currentTask.description = document.getElementById("edit-desc").value;
        currentTask.priority = currentTask.priority || "medium";

        // ✅ KORRIGIERT: Datum im ISO-Format speichern
        const newDue = document.getElementById("edit-dueDate").value;
        if (newDue) {
            currentTask.dueDate = newDue; // Direkt ISO-Format verwenden
        }

        dropdown.classList.add("hidden");

        // ✅ KORRIGIERT: Verwende updateTask() aus CRUD
        try {
            await updateTask(currentTask.id, {
                title: currentTask.title,
                description: currentTask.description,
                priority: currentTask.priority,
                dueDate: currentTask.dueDate,
                assignedUsersFull: currentTask.assignedUsersFull
            });

            // Task auch lokal aktualisieren
            const localTaskIndex = tasks.findIndex(t => t.id === currentTask.id);
            if (localTaskIndex > -1) {
                Object.assign(tasks[localTaskIndex], currentTask);
            }

            openTaskDetails(currentTask);
            renderBoard();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };
}

//Detail-Overlay rendering
function renderDetailOverlay(task) {
    const container = document.getElementById("detail-avatars-container");
    if (!container) return;
    container.innerHTML = "";

    (task.assignedUsersFull || []).forEach(user => {
        const avatarDiv = document.createElement("div");
        avatarDiv.className = "selected-avatar";
        avatarDiv.textContent = user.initials;
        avatarDiv.style.backgroundColor = user.color;
        container.appendChild(avatarDiv);
    });
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