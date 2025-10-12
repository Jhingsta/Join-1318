// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Returns the icon object for a given task category.
 * 
 * @param {string} category - The category of the task.
 */
function getCategoryIcon(category) {
    let icons = {
        "User Story": {
            src: './assets/icons-board/user-story-tag.svg',
            alt: 'User Story'
        },
        "Technical Task": {
            src: './assets/icons-board/technical-task-tag.svg',
            alt: 'Technical Task'
        }
    };
    return icons[category] || { src: '', alt: '' };
}

/**
 * Calculates the progress percentage.
 * 
 * @param {number} completed - Number of completed items.
 * @param {number} total - Total number of items.
 */
function calculateProgress(completed, total) {
    return total > 0 ? (completed / total) * 100 : 0;
}

/**
 * Checks if a task has subtasks.
 * 
 * @param {Object} task - The task object.
 */
function hasSubtasks(task) {
    return task.subtasks && (task.subtasks.total || task.subtasks.completed);
}

/**
 * Returns a list of users to display (up to 3).
 * 
 * @param {Array} users - Array of user objects.
 */
function getDisplayUsers(users) {
    return users ? users.slice(0, 3) : [];
}

// ============================================
// POPULATION FUNCTIONS
// ============================================

/**
 * Populates the task type icon in a task card.
 * 
 * @param {HTMLElement} element - The task card element.
 * @param {Object} task - The task object.
 */
function populateTaskType(element, task) {
    let img = element.querySelector('img');
    let icon = getCategoryIcon(task.category);
    img.src = icon.src;
    img.alt = icon.alt;
}

/**
 * Populates the title and description of a task card.
 * 
 * @param {HTMLElement} element - The task card element.
 * @param {Object} task - The task object.
 */
function populateTaskContent(element, task) {
    let title = element.querySelector('.task-card-title');
    let info = element.querySelector('.task-card-info');

    title.textContent = task.title || 'Untitled';
    info.textContent = task.description || '';
}

/**
 * Populates subtasks progress and visibility in a task card.
 * 
 * @param {HTMLElement} element - The task card subtasks container.
 * @param {Object} task - The task object.
 */
function populateSubtasks(element, task) {
    if (!hasSubtasks(task)) {
        element.dataset.hidden = 'true';
        return;
    }

    element.dataset.hidden = 'false';
    let completed = task.subtasks?.completed || 0;
    let total = task.subtasks?.total || 0;
    let progressFill = element.querySelector('.progress-fill');
    let progressText = element.querySelector('.task-card-subtasks-text');
    progressFill.style.width = `${calculateProgress(completed, total)}%`;
    progressText.textContent = `${completed}/${total} Subtasks`;
}

/**
 * Creates a user avatar element.
 * 
 * @param {Object} user - User object with initials and color.
 */
function createAvatar(user) {
    let avatar = document.createElement('div');
    avatar.className = 'task-card-assigned-avatar';
    avatar.textContent = user.initials;
    avatar.style.backgroundColor = user.color;
    return avatar;
}

/**
 * Appends individual user avatars to the container.
 * 
 * @param {HTMLElement} container - The avatars container.
 * @param {Array} users - Array of user objects.
 */
function appendUserAvatars(container, users) {
    users.forEach(user => {
        container.appendChild(createAvatar(user));
    });
}

/**
 * Appends a "plus" avatar indicating remaining users.
 * 
 * @param {HTMLElement} container - The avatars container.
 * @param {number} remainingCount - Number of remaining users not displayed.
 */
function appendPlusAvatar(container, remainingCount) {
    let plusAvatar = document.createElement('div');
    plusAvatar.className = 'task-card-assigned-avatar task-card-avatar-plus';
    plusAvatar.textContent = `+${remainingCount}`;
    container.appendChild(plusAvatar);
}

/**
 * Populates assigned users and priority icon for a task card.
 * 
 * @param {HTMLElement} element - The task card element.
 * @param {Object} task - The task object.
 */
function populateAssignedTo(element, task) {
    let avatarsContainer = element.querySelector('.task-card-avatars-container');
    let priorityIconImg = element.querySelector('.priority-icon');
    avatarsContainer.innerHTML = '';
    if (task.assignedUsersFull && task.assignedUsersFull.length > 0) {
        let totalUsers = task.assignedUsersFull.length;
        if (totalUsers <= 2) {
            appendUserAvatars(avatarsContainer, task.assignedUsersFull);
        } else {
            appendUserAvatars(avatarsContainer, task.assignedUsersFull.slice(0, 2));
            appendPlusAvatar(avatarsContainer, totalUsers - 2);
        }
    }
    if (priorityIconImg) {
        priorityIconImg.src = priorityIcon(task.priority);
    }
}

/**
 * Updates the subtasks display for a specific task card by ID.
 * 
 * @param {string} taskId - The ID of the task.
 */
function updateTaskCard(taskId) {
    let task = getTasks().find(t => t.id === taskId);
    if (!task) return;

    let card = document.getElementById(`task-${taskId}`);
    if (!card) return;

    let subtasksContainer = card.querySelector('.task-card-subtasks');
    if (subtasksContainer) {
        populateSubtasks(subtasksContainer, task);
    }
}

// ============================================
// MOBILE MOVE OVERLAY
// ============================================

/**
 * Computes background color, cursor style, and data attribute for a status item.
 * 
 * @param {string} statusValue - The value of the status.
 * @param {string} currentStatus - The current status of the task.
 */
function getStatusItemAttributes(statusValue, currentStatus) {
    let isCurrentStatus = statusValue === currentStatus;
    return {
        bgColor: isCurrentStatus ? '#005DFF' : '',
        cursorStyle: isCurrentStatus ? 'default' : 'pointer',
        dataAttr: isCurrentStatus ? '' : `data-status="${statusValue}"`
    };
}

/**
 * Generates HTML for each status option in the mobile "Move To" overlay.
 * 
 * @param {string} currentStatus - The current status of the task.
 */
function generateMobileMoveToStatusItems(currentStatus) {
    let statuses = [
        { value: 'todo', label: 'To do' },
        { value: 'inProgress', label: 'In progress' },
        { value: 'awaitFeedback', label: 'Review' },
        { value: 'done', label: 'Done' }
    ];

    return statuses.map(status => {
        let { bgColor, cursorStyle, dataAttr } = getStatusItemAttributes(status.value, currentStatus);
        return getMoveToContainerItemTemplate(status.label, bgColor, cursorStyle, dataAttr);
    }).join('');
}

/**
 * Generates the complete HTML for the mobile "Move To" overlay.
 * 
 * @param {string} currentStatus - The current status of the task.
 */
function mobileMoveToOverlay(currentStatus) {
    let statusItemsHTML = generateMobileMoveToStatusItems(currentStatus);
    return getMoveToOverlayBackdropTemplate(statusItemsHTML);
}

/**
 * Removes any existing mobile "Move To" overlay.
 */
function removeExistingMobileOverlay() {
    let existingOverlay = document.querySelector('.mobile-move-overlay-backdrop');
    if (existingOverlay) existingOverlay.remove();
}

/**
 * Inserts the overlay HTML into the DOM and prevents body scroll.
 * 
 * @param {string} overlayHTML - The HTML string of the overlay.
 */
function insertMobileOverlay(overlayHTML) {
    document.body.insertAdjacentHTML('beforeend', overlayHTML);
    document.body.classList.add('no-scroll');
}

/**
 * Shows the overlay and attaches a click listener to close it when clicking on the backdrop.
 */
function showOverlayWithBackdropListener() {
    let overlay = document.querySelector('.mobile-move-overlay-backdrop');
    overlay.classList.remove('hidden');

    overlay.addEventListener('click', (e) => {
        if (e.target.classList.contains('mobile-move-overlay-backdrop')) {
            closeMobileMoveToOverlay();
        }
    });
}

/**
 * Attaches click listeners to status options inside the overlay.
 * 
 * @param {string} taskId - ID of the task being moved.
 */
function attachMoveToOptionListeners(taskId) {
    let overlay = document.querySelector('.mobile-move-overlay-backdrop');
    let moveToContainers = overlay.querySelectorAll('.move-to-container[data-status]');

    moveToContainers.forEach(container => {
        container.addEventListener('click', () => {
            let newStatus = container.dataset.status;
            handleMobileMoveToClick(taskId, newStatus);
        });
    });
}

/**
 * Opens the mobile "Move To" overlay for a specific task.
 * 
 * @param {string} taskId - ID of the task.
 */
function openMobileMoveToOverlay(taskId) {
    removeExistingMobileOverlay();

    let task = getTasks().find(t => t.id === taskId);
    if (!task) {
        console.error('Task not found:', taskId);
        return;
    }

    let overlayHTML = mobileMoveToOverlay(task.status);
    insertMobileOverlay(overlayHTML);
    showOverlayWithBackdropListener();
    attachMoveToOptionListeners(taskId);
}

/**
 * Closes the mobile "Move To" overlay and restores body scroll.
 */
function closeMobileMoveToOverlay() {
    let overlay = document.querySelector('.mobile-move-overlay-backdrop');
    if (overlay) overlay.remove();
    document.body.classList.remove('no-scroll');
}

/**
 * Handles click on a move-to option in the mobile overlay.
 * 
 * @param {string} taskId - ID of the task to move.
 * @param {string} newStatus - New status to assign to the task.
 */
async function handleMobileMoveToClick(taskId, newStatus) {
    closeMobileMoveToOverlay();
    let columnId = `column-${newStatus}`;
    await moveTaskToColumn(taskId, columnId);
}

// ============================================
// MAIN FUNCTION
// ============================================

/**
 * Populates all sections of a task card.
 * 
 * @param {HTMLElement} card - The task card element.
 * @param {Object} task - The task object.
 */
function populateTaskCardSections(card, task) {
    populateTaskType(card.querySelector('.task-card-type'), task);
    populateTaskContent(card.querySelector('.task-card-content'), task);
    populateSubtasks(card.querySelector('.task-card-subtasks'), task);
    populateAssignedTo(card.querySelector('.task-card-assigned-to'), task);
}

/**
 * Attaches event listener to the mobile move button of a task card.
 * 
 * @param {HTMLElement} card - The task card element.
 * @param {string} taskId - The ID of the task.
 */
function attachMobileMoveListener(card, taskId) {
    let mobileBtn = card.querySelector('.mobile-move-task-btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openMobileMoveToOverlay(taskId);
        });
    }
}

/**
 * Attaches event listener to open task details on card click.
 * 
 * @param {HTMLElement} card - The task card element.
 * @param {Object} task - The task object.
 */
function attachTaskDetailsListener(card, task) {
    card.addEventListener('click', () => {
        openTaskDetails(task);
    });
}

/**
 * Creates a fully populated task card element.
 * 
 * @param {Object} task - The task object.
 */
function createTaskCard(task) {
    let template = document.createElement('div');
    template.innerHTML = getTaskCardTemplate(task.id);
    let card = template.firstElementChild;

    populateTaskCardSections(card, task);
    attachMobileMoveListener(card, task.id);
    attachTaskDetailsListener(card, task);

    return card;
}