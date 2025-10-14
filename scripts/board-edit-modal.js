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