// ===== DRAG AND DROP SYSTEM =====

/**
 * Enables drag and drop functionality for all task cards.
 */
function enableTaskDragAndDrop() {
    setupDropZones();
    setupDraggableCards();
}

/**
 * Configures columns as drop zones.
 */
function setupDropZones() {
    let columns = [
        document.getElementById('column-todo'),
        document.getElementById('column-inProgress'),
        document.getElementById('column-awaitFeedback'),
        document.getElementById('column-done')
    ].filter(Boolean);

    columns.forEach(column => {
        column.removeEventListener('dragover', handleDragOver);
        column.removeEventListener('dragleave', handleDragLeave);
        column.removeEventListener('drop', handleDrop);

        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('dragleave', handleDragLeave);
        column.addEventListener('drop', handleDrop);
    });
}

/**
 * Makes task cards draggable and attaches event listeners.
 */
function setupDraggableCards() {
    let cards = document.querySelectorAll('.task-card');
    
    cards.forEach(card => {
        if (!card.id || !card.id.startsWith('task-')) {
            console.warn('Task card missing proper ID:', card);
            return;
        }
        card.setAttribute('draggable', 'true');
        card.removeEventListener('dragstart', handleDragStart);
        card.removeEventListener('dragend', handleDragEnd);

        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
}

/**
 * Handles the start of dragging a task card.
 * 
 * @param {DragEvent} e - The dragstart event.
 */
function handleDragStart(e) {
    let taskId = e.target.id.replace('task-', '');
    if (!taskId) {
        e.preventDefault();
        console.warn('Cannot drag - no task ID found');
        return;
    }

    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';

    setTimeout(() => e.target.classList.add('dragging'), 0);
}

/**
 * Handles the end of dragging a task card.
 * 
 * @param {DragEvent} e - The dragend event.
 */
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

/**
 * Handles dragover event on a drop zone.
 * 
 * @param {DragEvent} e - The dragover event.
 */
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
}

/**
 * Handles dragleave event on a drop zone.
 * 
 * @param {DragEvent} e - The dragleave event.
 */
function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

/**
 * Handles drop event on a drop zone.
 * 
 * @param {DragEvent} e - The drop event.
 */
async function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    let taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    let columnId = e.currentTarget.id;
    await moveTaskToColumn(taskId, columnId);
}

/**
 * Maps column IDs to task status values.
 * 
 * @param {string} columnId - The ID of the column.
 */
function getStatusFromColumn(columnId) {
    let statusMap = {
        'column-todo': 'todo',
        'column-inProgress': 'inProgress', 
        'column-awaitFeedback': 'awaitFeedback',
        'column-done': 'done'
    };
    return statusMap[columnId] || null;
}

/**
 * Finds a task by its ID.
 * 
 * @param {string} taskId - The ID of the task to find.
 */
function findTaskById(taskId) {
    return getTasks().find(t => t.id === taskId) || null;
}

/**
 * Updates the task status both locally and in the database.
 * 
 * @param {Object} task - The task object to update.
 * @param {string} newStatus - The new status to assign.
 */
async function updateTaskStatus(task, newStatus) {
    task.status = newStatus;
    await updateTask(task.id, { status: newStatus });
}

/**
 * Renders the board and re-enables drag and drop.
 */
function refreshBoard() {
    renderBoard();
    setTimeout(enableTaskDragAndDrop, 0);
}

/**
 * Attempts a rollback by reloading tasks and refreshing the board.
 */
async function rollbackBoard() {
    try {
        await loadTasksForBoard();
        refreshBoard();
    } catch (error) {
        console.error('Error during rollback:', error);
    }
}

/**
 * Validates task and column, updates status if needed.
 * 
 * @param {string} taskId - ID of the task to update.
 * @param {string} columnId - ID of the target column.
 * @returns {Promise<boolean>} - Returns true if task was updated, false otherwise.
 */
async function tryUpdateTaskStatus(taskId, columnId) {
    let newStatus = getStatusFromColumn(columnId);
    if (!newStatus) {
        console.error('Unknown column:', columnId);
        return false;
    }
    let task = findTaskById(taskId);
    if (!task) {
        console.error('Task not found:', taskId);
        return false;
    }
    if (task.status === newStatus) return false;
    await updateTaskStatus(task, newStatus);
    return true;
}

/**
 * Moves a task to a new column with error handling and board refresh.
 * 
 * @param {string} taskId - ID of the task to move.
 * @param {string} columnId - ID of the target column.
 */
async function moveTaskToColumn(taskId, columnId) {
    try {
        let updated = await tryUpdateTaskStatus(taskId, columnId);
        if (updated) refreshBoard();
    } catch (error) {
        console.error('Error moving task:', error);
        await rollbackBoard();
    }
}

/**
 * Initializes drag and drop after the board has been rendered.
 */
function initializeDragAndDrop() {
    setTimeout(enableTaskDragAndDrop, 10);
}