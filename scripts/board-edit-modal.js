// ===================== HAUPTFUNKTION - EDIT MODE ÖFFNEN =====================

async function openEditMode(task) {
    if (users.length === 0) {
        await loadUsers();
    }

    const view = document.getElementById("task-view");
    const edit = document.getElementById("task-edit");
    const editForm = document.getElementById("edit-form-fields");

    if (!view || !edit || !editForm) {
        console.error('Edit modal elements not found');
        return;
    }

    view.classList.add("hidden");
    edit.classList.remove("hidden");

    let isoDate = task.dueDate || "";
    const priority = (task.priority || "medium").trim().toLowerCase();

    // Template einfügen
    editForm.innerHTML = taskEditTemplate(task, isoDate);

    // ===================== DUE DATE HANDLING =====================
    const editDueDateInput = document.getElementById("edit-due-date-input");
    const dueDateContainer = document.getElementById("edit-due-date-container");

    if (dueDateContainer && editDueDateInput) {
        dueDateContainer.addEventListener("click", (e) => {
            if (e.target === editDueDateInput) return;
            editDueDateInput.focus();
            editDueDateInput.click();
        });
    }

    // ===================== ASSIGNED USERS DROPDOWN =====================
    const placeholder = document.getElementById("edit-assigned-placeholder");
    const input = document.getElementById("edit-assigned-input");
    const arrow = document.getElementById("edit-assigned-arrow");
    const dropdown = document.getElementById("edit-assigned-dropdown");

    if (!dropdown) {
        console.error('Edit assigned dropdown not found');
        return;
    }

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

    if (placeholder) {
        placeholder.addEventListener("click", (e) => {
            e.stopPropagation();
            openDropdown();
        });
    }

    if (arrow) {
        arrow.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.contains("hidden") ? openDropdown() : closeDropdown();
        });
    }

    // Klick außerhalb schließt Dropdown
    document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target) && e.target !== input && e.target !== placeholder && e.target !== arrow) {
            closeDropdown();
        }
    });

    // Live-Suche im Dropdown
    if (input) {
        input.addEventListener("input", () => {
            const filter = input.value.toLowerCase();
            Array.from(dropdown.children).forEach(div => {
                const nameEl = div.querySelector("span");
                if (nameEl) {
                    const name = nameEl.textContent.toLowerCase();
                    div.style.display = name.includes(filter) ? "flex" : "none";
                }
            });
        });

        input.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.contains("hidden") ? openDropdown() : closeDropdown();
        });
    }

    // ===================== SUBTASK HANDLING =====================
    const subtaskInput = document.getElementById("edit-subtask-input");
    const editCancelBtn = document.getElementById("edit-subtask-cancel");
    const editCheckBtn = document.getElementById("edit-subtask-check");

    if (subtaskInput && editCancelBtn && editCheckBtn) {
        subtaskInput.addEventListener("input", () => {
            const hasText = subtaskInput.value.trim().length > 0;
            editCancelBtn.style.display = hasText ? "inline-block" : "none";
            editCheckBtn.style.display = hasText ? "inline-block" : "none";
        });

        editCancelBtn.addEventListener("click", () => {
            subtaskInput.value = "";
            editCancelBtn.style.display = "none";
            editCheckBtn.style.display = "none";
        });

        editCheckBtn.addEventListener("click", async () => {
            const text = subtaskInput.value.trim();
            if (text) {
                await addSubtask(task.id, text);
                renderEditSubtasks(task);
                subtaskInput.value = "";
                editCancelBtn.style.display = "none";
                editCheckBtn.style.display = "none";
            }
        });
    }

    // ===================== PRIORITY BUTTONS =====================
    const priorityButtons = document.querySelectorAll("#edit-priority-buttons .priority-frame");
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

    // ===================== TASK AKTUALISIEREN =====================
    currentTask = task;

    await renderAssignedDropdownOverlay(task);
    renderEditSubtasks(task);

    // ===================== SAVE BUTTON =====================
    const saveBtn = document.getElementById("save-task");
    if (saveBtn) {
        saveBtn.onclick = async () => {
            if (!currentTask) return;

            const titleInput = document.getElementById("edit-title-input");
            const descInput = document.getElementById("edit-description-input");
            const dueDateInput = document.getElementById("edit-due-date-input");

            if (titleInput) currentTask.title = titleInput.value;
            if (descInput) currentTask.description = descInput.value;
            currentTask.priority = currentTask.priority || "medium";

            if (dueDateInput && dueDateInput.value) {
                currentTask.dueDate = dueDateInput.value;
            }

            dropdown.classList.add("hidden");

            try {
                await updateTask(currentTask.id, {
                    title: currentTask.title,
                    description: currentTask.description,
                    priority: currentTask.priority,
                    dueDate: currentTask.dueDate,
                    assignedUsersFull: currentTask.assignedUsersFull
                });

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
}

// ===================== SUBTASK RENDERING =====================

function renderEditSubtasks(task) {
    const list = document.getElementById("edit-subtask-list");
    if (!list) return;

    list.innerHTML = "";

    if (!task.subtasks || !task.subtasks.items || !Array.isArray(task.subtasks.items)) {
        task.subtasks = { items: [], completed: 0, total: 0 };
    }

    task.subtasks.items.forEach((st, index) => {
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
            task.subtasks.total = task.subtasks.items.length;
            task.subtasks.completed = task.subtasks.items.filter(st => st.done).length;
            
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

function startEditSubtaskMode(task, li, span, index) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = span.textContent;
    input.className = "subtask-edit-input";

    const saveIcon = document.createElement("img");
    saveIcon.src = "./assets/icons-addtask/Subtask's icons (1).png";
    saveIcon.alt = "Save";

    saveIcon.addEventListener("click", async () => {
        const newText = input.value.trim();
        if (newText) {
            task.subtasks.items[index].title = newText;
            task.subtasks.total = task.subtasks.items.length;
            task.subtasks.completed = task.subtasks.items.filter(st => st.done).length;
            
            await updateTask(task.id, { subtasks: task.subtasks });
            renderEditSubtasks(task);
        }
    });

    const cancelIcon = document.createElement("img");
    cancelIcon.src = "./assets/icons-addtask/Subtask cancel.png";
    cancelIcon.alt = "Cancel";
    cancelIcon.addEventListener("click", () => {
        renderEditSubtasks(task);
    });

    const iconsDiv = document.createElement("div");
    iconsDiv.className = "subtask-icons";
    iconsDiv.appendChild(saveIcon);
    iconsDiv.appendChild(cancelIcon);

    li.innerHTML = "";
    li.appendChild(input);
    li.appendChild(iconsDiv);

    input.focus();
}

// ===================== ASSIGNED USERS DROPDOWN =====================

async function renderAssignedDropdownOverlay(task) {
    const dropdown = document.getElementById("edit-assigned-dropdown");
    if (!dropdown) return;

    dropdown.innerHTML = "";

    if (!task.assignedUsersFull) task.assignedUsersFull = [];

    users.forEach(user => {
        const initiallySelected = task.assignedUsersFull.some(u => u.id === user.id);

        const item = document.createElement("div");
        item.className = "dropdown-item";
        if (initiallySelected) item.classList.add("selected");

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

// ===================== ADD SUBTASK =====================

async function addSubtask(taskId, title) {
    if (!taskId || !title) return;

    try {
        const task = getTasks().find(t => t.id === taskId);
        if (!task) {
            console.error('Task nicht gefunden:', taskId);
            return;
        }

        if (!task.subtasks) {
            task.subtasks = { items: [], total: 0, completed: 0 };
        }
        if (!Array.isArray(task.subtasks.items)) {
            task.subtasks.items = [];
        }

        task.subtasks.items.push({ title, done: false });
        task.subtasks.total = task.subtasks.items.length;
        task.subtasks.completed = task.subtasks.items.filter(st => st.done).length;

        await updateTask(taskId, {
            subtasks: {
                items: task.subtasks.items,
                total: task.subtasks.total,
                completed: task.subtasks.completed
            }
        });

        renderBoard();
    } catch (error) {
        console.error("Fehler beim Hinzufügen der Subtask:", error);
        throw error;
    }
}

// ===================== AVATARS RENDERING =====================

function renderAvatars(task) {
    const avatarsContainer = document.getElementById("edit-avatars-container");
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