/**
 * Collects all task data from the form and returns it as an object.
 * @returns {Object} Task data including title, description, dueDate, priority, assigned users, category, and subtasks.
 */
function getTaskData() {
    return {
        title: getTitle(),
        description: getDescription(),
        dueDate: getDueDate(),
        priority: getPriority(),
        assignedUsersFull: getAssignedUsers(),
        category: getCategory(),
        subtasks: getSubtasks()
    };
}

/**
 * Retrieves the task title from the input field.
 * @returns {string} Trimmed task title or empty string if not found.
 */
function getTitle() {
    const input = document.querySelector(".title-input");
    return input ? input.value.trim() : "";
}

/**
 * Retrieves the task description from the input field.
 * @returns {string} Trimmed task description or empty string if not found.
 */
function getDescription() {
    const input = document.querySelector(".description-input");
    return input ? input.value.trim() : "";
}

/**
 * Retrieves the due date value from the date input field.
 * @returns {string} ISO date string or empty string if not found.
 */
function getDueDate() {
    const input = document.querySelector(".due-date-input");
    return input ? input.value : "";
}

/**
 * Retrieves the currently selected priority from the buttons.
 * @returns {string} Priority value in lowercase or "medium" if none selected.
 */
function getPriority() {
    const activeBtn = document.querySelector(".priority-frame.active");
    return activeBtn ? activeBtn.textContent.trim().toLowerCase() : "medium";
}

/**
 * Retrieves all selected users from the assigned users dropdown.
 * @returns {Array} Array of formatted user objects.
 */
function getAssignedUsers() {
    const assignedDropdown = document.getElementById("assigned-dropdown");
    if (!assignedDropdown) return [];

    const selected = [];
    assignedDropdown.querySelectorAll(".checkbox-wrapper.checked").forEach(wrapper => {
        const div = wrapper.closest(".dropdown-item");
        const userId = div?.dataset.userId;
        const user = (window.users || []).find(u => u.id === userId);
        if (user) selected.push(formatUser(user));
    });

    return selected;
}

/**
 * Formats a user object to include only necessary fields.
 * @param {Object} user Original user object.
 * @returns {Object} Formatted user object with id, name, initials, and color.
 */
function formatUser(user) {
    return {
        id: user.id,
        name: user.name,
        initials: user.initials,
        color: user.color
    };
}

/**
 * Retrieves the selected category from the category dropdown.
 * @returns {string|null} Category name or null if not selected.
 */
function getCategory() {
    const categoryEl = document.querySelector(".category-content .assigned-text");
    return categoryEl ? categoryEl.textContent.trim() : null;
}

/**
 * Collects all subtasks from the subtask list.
 * @returns {Object} Subtask summary including total, completed, and an array of subtask items.
 */
function getSubtasks() {
    const subtaskList = document.querySelector("#subtask-list");
    const subtaskSpans = subtaskList ? subtaskList.querySelectorAll("li span") : [];
    const items = Array.from(subtaskSpans)
        .map(span => span.textContent.trim())
        .filter(title => title.length > 0)
        .map(title => ({ title, done: false }));

    return {
        total: items.length,
        completed: 0,
        items: items
    };
}
