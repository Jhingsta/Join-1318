// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Gibt den Icon-Pfad basierend auf der Task-Kategorie zurück (Board-Icons)
 */
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

/**
 * Berechnet den Fortschritt in Prozent
 */
function calculateProgress(completed, total) {
    return total > 0 ? (completed / total) * 100 : 0;
}

/**
 * Prüft ob Subtasks angezeigt werden sollen
 */
function hasSubtasks(task) {
    return task.subtasks && (task.subtasks.total || task.subtasks.completed);
}

/**
 * Gibt maximal 3 User zurück für die Avatar-Anzeige
 */
function getDisplayUsers(users) {
    return users ? users.slice(0, 3) : [];
}

// ============================================
// POPULATION FUNCTIONS
// ============================================

/**
 * Befüllt den Task-Type Bereich
 */
function populateTaskType(element, task) {
    const img = element.querySelector('img');
    const icon = getCategoryIcon(task.category);
    img.src = icon.src;
    img.alt = icon.alt;
}

/**
 * Befüllt den Content Bereich
 */
function populateTaskContent(element, task) {
    const title = element.querySelector('.task-card-title');
    const info = element.querySelector('.task-card-info');
    
    title.textContent = task.title || 'Untitled';
    info.textContent = task.description || '';
}

/**
 * Befüllt den Subtasks Bereich
 */
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

/**
 * Erstellt einen einzelnen Avatar
 */
function createAvatar(user) {
    const avatar = document.createElement('div');
    avatar.className = 'task-card-assigned-avatar';
    avatar.textContent = user.initials;
    avatar.style.backgroundColor = user.color;
    return avatar;
}

/**
 * Befüllt den Assigned-To Bereich
 */
function populateAssignedTo(element, task) {
    const avatarsContainer = element.querySelector('.task-card-avatars-container');
    const priorityIconImg = element.querySelector('.priority-icon');
    
    // Avatare erstellen (maximal 3)
    avatarsContainer.innerHTML = '';
    const displayUsers = getDisplayUsers(task.assignedUsersFull);
    displayUsers.forEach(user => {
        avatarsContainer.appendChild(createAvatar(user));
    });
    
    // Priority Icon setzen (nutzt externe priorityIcon() Funktion)
    priorityIconImg.src = priorityIcon(task.priority);}

// ============================================
// MAIN FUNCTION
// ============================================

/**
 * Erstellt eine Task Card aus dem Template
 * @param {Object} task - Task-Objekt mit allen relevanten Daten
 * @returns {HTMLElement} - Die fertig befüllte Task Card
 */
function createTaskCard(task) {
    // Template als String holen und in DOM umwandeln
    const template = document.createElement('div');
    template.innerHTML = getTaskCardTemplate(task.id);
    const card = template.firstElementChild;    
    
    // Bereiche befüllen
    populateTaskType(card.querySelector('.task-card-type'), task);
    populateTaskContent(card.querySelector('.task-card-content'), task);
    populateSubtasks(card.querySelector('.task-card-subtasks'), task);
    populateAssignedTo(card.querySelector('.task-card-assigned-to'), task);
    
    // Event Listener (nutzt externe openTaskDetails() Funktion)
    card.addEventListener('click', () => {
        openTaskDetails(task);
    });
    
    return card;
}