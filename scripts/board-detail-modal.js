// ===================== DOM ELEMENTE =====================
// Werden bei DOMContentLoaded initialisiert

// ===================== HAUPTFUNKTIONEN =====================

function openTaskDetails(task) {
    currentTask = task;
    const overlay = document.getElementById("task-detail-overlay");
    const view = document.getElementById("task-view");
    const edit = document.getElementById("task-edit");
    
    if (!overlay || !view || !edit) {
        console.error('Detail modal elements not found');
        return;
    }
    
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
    
    view.innerHTML = taskDetailTemplate(task, categoryImg);
    
    // Edit Button Event
    const editBtn = document.getElementById("edit-header-btn");
    if (editBtn) {
        editBtn.addEventListener("click", () => openEditMode(task));
    }
    
    // Delete Button Event
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

// ===================== RENDER FUNKTIONEN =====================

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
    if (!users || users.length === 0) return '';
    
    return users.map(user => `
        <div class="assigned-item">
            <div class="assigned-avatar-detail-view" style="background-color: ${user.color};">
                ${user.initials}
            </div>
            <span class="assigned-name-full">${user.name}</span>
        </div>
    `).join("");
}

// ===================== SUBTASK CHECKBOX TOGGLE =====================

function toggleCheckbox(wrapper, taskId, subtaskIndex) {
    const defaultSVG = wrapper.querySelector('.checkbox-default');
    const checkedSVG = wrapper.querySelector('.checkbox-checked');
    
    if (!defaultSVG || !checkedSVG) return;
    
    const isChecked = checkedSVG.style.display === 'block';
    checkedSVG.style.display = isChecked ? 'none' : 'block';
    defaultSVG.style.display = isChecked ? 'block' : 'none';
    
    const task = getTasks().find(t => t.id === taskId);
    if (task && task.subtasks && task.subtasks.items && task.subtasks.items[subtaskIndex]) {
        task.subtasks.items[subtaskIndex].done = !task.subtasks.items[subtaskIndex].done;
        task.subtasks.completed = task.subtasks.items.filter(st => st.done).length;
        
        updateTaskCard(taskId);
        updateSubtaskInFirebase(taskId, task).catch(err => console.error(err));
    }
}

// ===================== INITIALISIERUNG =====================

document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById("task-detail-close");
    closeBtn?.addEventListener("click", closeTaskDetails);
});