// ===================== MAIN FUNCTIONS =====================

/**
 * Opens the task detail overlay and initializes the view.
 * @param {Object} task - The task object containing all task information.
 */
function openTaskDetails(task) {
    currentTask = task;
    let overlay = getTaskOverlayElements();
    if (!overlay) return;

    setupOverlayView(overlay, task);
    renderTaskDetails(overlay.view, task);
    attachTaskDetailEvents(overlay, task);
}

/**
 * Retrieves the DOM elements for the task detail overlay.
 */
function getTaskOverlayElements() {
    let overlay = document.getElementById("task-detail-overlay");
    let view = document.getElementById("task-view");
    let edit = document.getElementById("task-edit");

    if (!overlay || !view || !edit) {
        console.error('Detail modal elements not found');
        return null;
    }

    return { overlay, view, edit };
}

/**
 * Sets up overlay visibility and initial state.
 * @param {{overlay: HTMLElement, view: HTMLElement, edit: HTMLElement}} overlayElements
 * @param {Object} task
 */
function setupOverlayView(overlayElements, task) {
    let { overlay, view, edit } = overlayElements;

    overlay.dataset.taskId = task.id;
    view.classList.remove("hidden");
    edit.classList.add("hidden");
    overlay.classList.remove("hidden");
}

/**
 * Renders task details into the view element.
 * @param {HTMLElement} view
 * @param {Object} task
 */
function renderTaskDetails(view, task) {
    let categoryImg = getCategoryImage(task.category);
    view.innerHTML = taskDetailTemplate(task, categoryImg);
}

/**
 * Returns the appropriate category image path.
 * @param {string} category
 */
function getCategoryImage(category) {
    if (category === "User Story") {
        return './assets/icons-board/user-story-tag-overlay.svg';
    } else if (category === "Technical Task") {
        return './assets/icons-board/technical-task-tag-overlay.svg';
    }
    return '';
}

/**
 * Attaches event listeners for edit and delete buttons.
 * @param {{overlay: HTMLElement, view: HTMLElement}} overlayElements
 * @param {Object} task
 */
function attachTaskDetailEvents(overlayElements, task) {
    let { overlay, view } = overlayElements;

    let editBtn = document.getElementById("edit-header-btn");
    if (editBtn) {
        editBtn.addEventListener("click", () => openEditMode(task));
    }

    let deleteBtn = view.querySelector(".delete-btn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => handleDeleteTask(task, overlay));
    }
}

/**
 * Handles task deletion and updates the board.
 * @param {Object} task
 * @param {HTMLElement} overlay
 */
async function handleDeleteTask(task, overlay) {
    if (!task.id) return;
    try {
        await deleteTask(task.id);
        let taskIndex = tasks.findIndex(t => t.id === task.id);
        if (taskIndex > -1) tasks.splice(taskIndex, 1);
        overlay.classList.add("hidden");
        renderBoard();
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
    }
}

/**
 * Closes the task detail overlay.
 */
function closeTaskDetails() {
    let overlay = document.getElementById("task-detail-overlay");
    overlay?.classList.add("hidden");
}

// ===================== RENDER FUNCTIONS =====================

/**
 * Renders subtasks list for a given task.
 * @param {Object} task
 */
function renderSubtasks(task) {
    if (!task.subtasks || !task.subtasks.items || task.subtasks.items.length === 0) {
        return `<li>No subtasks</li>`;
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

/**
 * Renders the assigned users list.
 * @param {Array} users
 */
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

/**
 * Toggles the checkbox state for a subtask and updates Firebase.
 * @param {HTMLElement} wrapper - Checkbox wrapper element.
 * @param {string} taskId - ID of the task.
 * @param {number} subtaskIndex - Index of the subtask.
 */
function toggleCheckbox(wrapper, taskId, subtaskIndex) {
    let defaultSVG = wrapper.querySelector('.checkbox-default');
    let checkedSVG = wrapper.querySelector('.checkbox-checked');
    
    if (!defaultSVG || !checkedSVG) return;
    
    let isChecked = checkedSVG.style.display === 'block';
    checkedSVG.style.display = isChecked ? 'none' : 'block';
    defaultSVG.style.display = isChecked ? 'block' : 'none';
    
    let task = getTasks().find(t => t.id === taskId);
    if (task && task.subtasks?.items?.[subtaskIndex]) {
        task.subtasks.items[subtaskIndex].done = !task.subtasks.items[subtaskIndex].done;
        task.subtasks.completed = task.subtasks.items.filter(st => st.done).length;
        
        updateTaskCard(taskId);
        updateSubtaskInFirebase(taskId, task).catch(err => console.error(err));
    }
}

// ===================== INITIALIZATION =====================

document.addEventListener('DOMContentLoaded', () => {
    let closeBtn = document.getElementById("task-detail-close");
    closeBtn?.addEventListener("click", closeTaskDetails);
});