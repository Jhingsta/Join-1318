// ============================================
// HELPER FUNCTIONS
// ============================================

function getCategoryIcon(category) {
    const icons = {
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

function calculateProgress(completed, total) {
    return total > 0 ? (completed / total) * 100 : 0;
}

function hasSubtasks(task) {
    return task.subtasks && (task.subtasks.total || task.subtasks.completed);
}

function getDisplayUsers(users) {
    return users ? users.slice(0, 3) : [];
}

// ============================================
// POPULATION FUNCTIONS
// ============================================

function populateTaskType(element, task) {
    const img = element.querySelector('img');
    const icon = getCategoryIcon(task.category);
    img.src = icon.src;
    img.alt = icon.alt;
}

function populateTaskContent(element, task) {
    const title = element.querySelector('.task-card-title');
    const info = element.querySelector('.task-card-info');
    
    title.textContent = task.title || 'Untitled';
    info.textContent = task.description || '';
}

function populateSubtasks(element, task) {
    if (!hasSubtasks(task)) {
        element.dataset.hidden = 'true';
        return;
    }
    
    element.dataset.hidden = 'false';
    
    const completed = task.subtasks?.completed || 0;
    const total = task.subtasks?.total || 0;
    
    const progressFill = element.querySelector('.progress-fill');
    const progressText = element.querySelector('.task-card-subtasks-text');
    
    progressFill.style.width = `${calculateProgress(completed, total)}%`;
    progressText.textContent = `${completed}/${total} Subtasks`;
}

function createAvatar(user) {
    const avatar = document.createElement('div');
    avatar.className = 'task-card-assigned-avatar';
    avatar.textContent = user.initials;
    avatar.style.backgroundColor = user.color;
    return avatar;
}

function populateAssignedTo(element, task) {
    const avatarsContainer = element.querySelector('.task-card-avatars-container');
    const priorityIconImg = element.querySelector('.priority-icon');
    
    avatarsContainer.innerHTML = '';
    
    if (task.assignedUsersFull && task.assignedUsersFull.length > 0) {
        const totalUsers = task.assignedUsersFull.length;
        
        if (totalUsers <= 2) {
            task.assignedUsersFull.forEach(user => {
                avatarsContainer.appendChild(createAvatar(user));
            });
        } else {
            // show first two avatars
            task.assignedUsersFull.slice(0, 2).forEach(user => {
                avatarsContainer.appendChild(createAvatar(user));
            });
            
            // add "+X" circular avatar
            const plusAvatar = document.createElement('div');
            plusAvatar.className = 'task-card-assigned-avatar task-card-avatar-plus';
            plusAvatar.textContent = `+${totalUsers - 2}`;
            avatarsContainer.appendChild(plusAvatar);
        }
    }
    
    if (priorityIconImg) {
        priorityIconImg.src = priorityIcon(task.priority);
    }
}

function updateTaskCard(taskId) {
    const task = getTasks().find(t => t.id === taskId);
    if (!task) return;
    
    const card = document.getElementById(`task-${taskId}`);
    if (!card) return;
    
    // Subtasks-Bereich komplett neu populieren
    const subtasksContainer = card.querySelector('.task-card-subtasks');
    if (subtasksContainer) {
        populateSubtasks(subtasksContainer, task);
    }
}

// ============================================
// MOBILE MOVE OVERLAY
// ============================================

function mobileMoveToOverlay(currentStatus) {
    const statuses = [
        { value: 'todo', label: 'To do' },
        { value: 'inProgress', label: 'In progress' },
        { value: 'awaitFeedback', label: 'Review' },
        { value: 'done', label: 'Done' }
    ];
    
    const statusItems = statuses.map(status => {
        const isCurrentStatus = status.value === currentStatus;
        const bgColor = isCurrentStatus ? '#005DFF' : '';
        const cursorStyle = isCurrentStatus ? 'default' : 'pointer';
        const dataAttr = isCurrentStatus ? '' : `data-status="${status.value}"`;
        
        return getMoveToContainerItemTemplate(status.label, bgColor, cursorStyle, dataAttr);
    }).join('');
    
    return getMoveToOverlayBackdropTemplate(statusItems);
}

function openMobileMoveToOverlay(taskId) {
    const existingOverlay = document.querySelector('.mobile-move-overlay-backdrop');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    const task = getTasks().find(t => t.id === taskId);
    if (!task) {
        console.error('Task not found:', taskId);
        return;
    }
    
    const overlayHTML = mobileMoveToOverlay(task.status);
    document.body.insertAdjacentHTML('beforeend', overlayHTML);
    document.body.classList.add('no-scroll');
    
    const overlay = document.querySelector('.mobile-move-overlay-backdrop');
    overlay.classList.remove('hidden');
    
    overlay.addEventListener('click', (e) => {
        if (e.target.classList.contains('mobile-move-overlay-backdrop')) {
            closeMobileMoveToOverlay();
        }
    });
    
    const moveToContainers = overlay.querySelectorAll('.move-to-container[data-status]');
    moveToContainers.forEach(container => {
        container.addEventListener('click', () => {
            const newStatus = container.dataset.status;
            handleMobileMoveToClick(taskId, newStatus);
        });
    });
}

function closeMobileMoveToOverlay() {
    const overlay = document.querySelector('.mobile-move-overlay-backdrop');
    if (overlay) {
        overlay.remove();
    }
    document.body.classList.remove('no-scroll');
}

async function handleMobileMoveToClick(taskId, newStatus) {
    closeMobileMoveToOverlay();
    const columnId = `column-${newStatus}`;
    await moveTaskToColumn(taskId, columnId);
}

// ============================================
// MAIN FUNCTION
// ============================================

function createTaskCard(task) {
    const template = document.createElement('div');
    template.innerHTML = getTaskCardTemplate(task.id);
    const card = template.firstElementChild;
    
    populateTaskType(card.querySelector('.task-card-type'), task);
    populateTaskContent(card.querySelector('.task-card-content'), task);
    populateSubtasks(card.querySelector('.task-card-subtasks'), task);
    populateAssignedTo(card.querySelector('.task-card-assigned-to'), task);
    
    const mobileBtn = card.querySelector('.mobile-move-task-btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openMobileMoveToOverlay(task.id);
        });
    }
    
    card.addEventListener('click', () => {
        openTaskDetails(task);
    });
    
    return card;
}