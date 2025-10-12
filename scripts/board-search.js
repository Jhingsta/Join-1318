// ===== BOARD SEARCH SYSTEM =====

let currentSearchTerm = "";

let input = document.getElementById("search-input");
let icon = document.getElementById("search-icon");
let clear = document.getElementById("search-icon-clear");

/**
 * Filters tasks based on the given search term.
 * 
 * @param {Array<Object>} tasks - Array of task objects.
 * @param {string} searchTerm - The term to filter tasks by title or description.
 */
function filterTasks(tasks, searchTerm) {
    return tasks.filter(task => 
        (task.title && task.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
}

/**
 * Clears all tasks from the given columns.
 * 
 * @param {Object} columns - Object containing column elements keyed by status.
 */
function clearColumns(columns) {
    Object.values(columns).forEach(el => el && (el.innerHTML = ''));
}

/**
 * Renders a single task card into its corresponding column.
 * Defaults to the 'todo' column if the status is invalid or missing.
 * 
 * @param {Object} task - The task object to render.
 * @param {Object} columns - Object containing column elements keyed by status.
 */
function renderTaskIntoColumn(task, columns) {
    let card = createTaskCard(task);
    let column = columns[task.status] || columns.todo;
    if (column) column.appendChild(card);
}

/**
 * Renders placeholder elements in empty columns indicating no tasks were found.
 * 
 * @param {Object} columns - Object containing column elements keyed by status.
 */
function renderEmptyPlaceholders(columns) {
    Object.values(columns).forEach(columnEl => {
        if (columnEl && columnEl.children.length === 0) {
            let placeholder = document.createElement('div');
            placeholder.className = 'task-placeholder';
            placeholder.textContent = 'No tasks found';
            columnEl.appendChild(placeholder);
        }
    });
}

/**
 * Filters tasks by search term and renders them into the board columns.
 * Empty columns receive a placeholder.
 * 
 * @param {string} searchTerm - The term to filter tasks by title or description.
 */
function renderFilteredBoard(searchTerm) {
    let allTasks = getTasks();
    let filteredTasks = filterTasks(allTasks, searchTerm);

    let columns = {
        todo: document.getElementById('column-todo'),
        inProgress: document.getElementById('column-inProgress'),
        awaitFeedback: document.getElementById('column-awaitFeedback'),
        done: document.getElementById('column-done'),
    };

    clearColumns(columns);
    filteredTasks.forEach(task => renderTaskIntoColumn(task, columns));
    renderEmptyPlaceholders(columns);
}

/**
 * Handles search input changes, updates the current search term,
 * toggles search icons, and renders either the filtered or full board.
 */
function handleSearch() {
    let searchTerm = input.value.trim();
    currentSearchTerm = searchTerm;

    if (searchTerm !== "") {
        icon.classList.add("hidden");
        clear.classList.remove("hidden");
        renderFilteredBoard(searchTerm);
    } else {
        icon.classList.remove("hidden");
        clear.classList.add("hidden");
        renderBoard();
    }
}

/**
 * Clears the search input and resets the current search term,
 * then updates the board display accordingly.
 */
function clearSearch() {
    input.value = "";
    currentSearchTerm = "";
    handleSearch();
}