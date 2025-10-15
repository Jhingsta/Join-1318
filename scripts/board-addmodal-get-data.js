// ===================== TASK DATA & SAVING =====================

/**
 * Extracts task data from the modal inputs.
 */
function getTaskData() {
    let title = titleInput.value.trim();
    let description = document.getElementById('add-description-input')?.value.trim() || '';
    let dueDate = dueDateInput.value;

    let priorityBtn = document.querySelector("#add-priority-buttons .priority-frame.active");
    let priority = priorityBtn?.dataset.priority || "medium";

    let assignedUsersFull = Array.from(assignedDropdown?.querySelectorAll(".dropdown-item.active") || [])
        .map(div => {
            let user = users.find(u => u.id === div.dataset.userId);
            return user ? { id: user.id, name: user.name, initials: user.initials, color: user.color } : null;
        }).filter(Boolean);

    let category = document.getElementById('add-category-text')?.textContent.trim() || null;

    let subtasks = Array.from(subtaskList.querySelectorAll("li span.subtask-text"))
        .map(span => span.textContent.trim())
        .filter(text => text.length > 0)
        .map(title => ({ title, done: false }));

    return { title, description, dueDate, priority, assignedUsersFull, category, subtasks: { total: subtasks.length, completed: 0, items: subtasks } };
}

/**
 * Saves a new task via API and updates the tasks array.
 * 
 * @param {Object} taskData - Task object to be saved.
 */
async function saveTask(taskData) {
    try {
        let newTask = await createTask({
            title: taskData.title,
            description: taskData.description,
            dueDate: taskData.dueDate,
            priority: taskData.priority,
            assignedUsersFull: taskData.assignedUsersFull,
            category: taskData.category,
            subtasks: taskData.subtasks,
            status: currentNewTask?.status || 'todo'
        });
        tasks.push(newTask);
        return newTask;
    } catch (error) {
        console.error("❌ Error saving task:", error);
        throw error;
    }
}