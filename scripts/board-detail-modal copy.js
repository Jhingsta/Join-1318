const closeBtn = document.getElementById("task-detail-close");

function openTaskDetails(task) {
    currentTask = task;
    const overlay = document.getElementById("task-detail-overlay");
    const view = document.getElementById("task-view");
    const edit = document.getElementById("task-edit");
    overlay.dataset.taskId = task.id;
    view.classList.remove("hidden");
    edit.classList.add("hidden");
    overlay.classList.remove("hidden");

    let categoryImg = "";
    if (task.category === "User Story") {
        categoryImg = './assets/icons-board/user-story-tag-overlay.svg';
    } else if (task.category === "Technical Task") {
        categoryImg = './assets/icons-board/technical-task-tag-overlay.svg';
    }

    // nur ausgelagerter Return
    view.innerHTML = taskDetailTemplate(task, categoryImg);

    // Events
    const editBtn = document.getElementById("edit-header-btn");
    if (editBtn) {
        editBtn.addEventListener("click", () => openEditMode(task));
    }
    const deleteBtn = view.querySelector(".delete-btn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
            if (!task.id) return;
            try {
                await deleteTask(task.id);
                const taskIndex = tasks.findIndex(t => t.id === task.id);
                if (taskIndex > -1) tasks.splice(taskIndex, 1);
                overlay.classList.add("hidden");
                renderBoard();
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Failed to delete task');
            }
        });
    }
}

function closeTaskDetails() {
    const overlay = document.getElementById("task-detail-overlay");
    overlay?.classList.add("hidden");
}

function renderSubtasks(task) {
    if (!task.subtasks || !task.subtasks.items || task.subtasks.items.length === 0) {
        return `<li>Keine Subtasks</li>`;
    }
    return task.subtasks.items.map((subtask, index) => {
        return subtaskHTML({
            title: subtask.title || `Subtask ${index + 1}`,
            isChecked: subtask.done === true,
            taskId: task.id,
            index: index
        });
    }).join("");
}

function renderAssignedUsers(users) {
    return users.map(user => `
        <div class="assigned-item">
            <div class="assigned-avatar-detail-view" style="
                background-color: ${user.color};">
                ${user.initials}
            </div>
            <span class="assigned-name-full">${user.name}</span>
        </div>
    `).join("");
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

closeBtn?.addEventListener("click", closeTaskDetails);