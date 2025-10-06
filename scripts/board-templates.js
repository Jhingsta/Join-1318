function addTaskModal() {
    return `
            <div id="add-task-modal" class="modal-overlay hidden">
            <div class="modal">
                <div id="header-container">
                    <div id="header-content">Add Task</div>
                    <button id="close" class="close">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path d="M6 6 L18 18" stroke="#000" stroke-width="2" stroke-linecap="round" />
                            <path d="M6 18 L18 6" stroke="#000" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </button>
                </div>

                <div class="main-container-modal">
                    <div class="title-container">
                        <input type="text" class="title-input" placeholder="Enter a title" required>
                        <span class="error-message">This field is required</span>
                    </div>

                    <div class="description-container">
                        <div class="description-header">
                            <span class="desc-title">Description</span>
                            <span class="desc-optional">(optional)</span>
                        </div>
                        <textarea class="description-input" placeholder="Enter a description"></textarea>
                    </div>

                    <div class="due-date-container">
                        <div class="due-date-header">Due date</div>
                        <div class="due-date-content">
                            <input type="date" class="due-date-input" required>
                            
                            <span class="due-date-display" placeholder="dd/mm/yyyy">dd/mm/yyyy</span>
                            
                            <div class="due-date-icon-container">
                                <div class="due-date-icon"></div>
                            </div>
                        </div>
                        <span class="error-message">This field is required</span>
                    </div>

                    <div class="priority-container">
                        <div class="priority-header">Priority</div>
                        <div class="priority-content">
                            <button type="button" class="priority-frame">Urgent <img src="./assets/icons-addTask/Prio alta.svg" alt=""></button>
                            <button type="button" class="priority-frame active">Medium <img src="./assets/icons-addTask/Capa 2.svg" alt=""></button>
                            <button type="button" class="priority-frame">Low <img src="./assets/icons-addTask/Prio baja.svg" alt=""></button>
                        </div>
                    </div>

                    <div class="assigned-container">
                        <div class="assigned-header">
                            Assigned to <span class="optional">(optional)</span>
                        </div>

                        <div class="assigned-content">
                            <div class="assigned-text-container">
                                <div class="assigned-text">Select contacts to assign</div>
                            </div>
                            <input type="text" class="assigned-input" placeholder="" style="display:none;">
                            <div class="assigned-arrow-container">
                                <img src="/assets/icons-addTask/arrow_drop_down.png" alt="Select contacts" class="assigned-arrow-icon">
                            </div>
                            <div class="dropdown-menu" id="assigned-dropdown"></div>
                        </div>
                        <div class="selected-avatars-container"></div>
                    </div>

                    <div class="category-container">
                        <div class="assigned-header">Category</div>
                        <div class="category-content">
                            <div class="assigned-text">Select task category</div>
                            <div class="assigned-arrow-container">
                                <img src="/assets/icons-addTask/arrow_drop_down.png" alt="Select contacts" class="assigned-arrow-icon">
                            </div>
                        </div>
                        <span class="error-message">This field is required</span>
                    </div>

                    <div class="task-container">
                        <div class="assigned-header">
                            Subtasks <span class="optional">(optional)</span>
                        </div>
                        <div id="task-content-addtask">
                            <input type="text" id="subtask-text" placeholder="Add new subtask">
                            <div class="assigned-arrow-container">
                                <img id="cancel-btn" src="/assets/icons-addTask/Subtask cancel.png" alt="Cancel subtask" class="assigned-arrow-icon" style="display:none;">
                                <img id="check-btn" src="/assets/icons-addTask/Subtask's icons (1).png" alt="Confirm subtask" class="assigned-arrow-icon" style="display:none;">
                            </div>
                        </div>
                        <ul id="subtask-list" class="subtask-list"></ul>
                        <div id="task-dropdown" class="task-dropdown" style="display:none;"></div>
                    </div>
                    <div class="modal-footer">
                    <button class="create-btn" id="create-btn">
                        Create Task <img src="./assets/icons-addTask/check (1).png" alt="">
                    </button>
                </div>
                     <span class="error-message">This field is required</span>
                </div>
                </div>
            </div>
        </div>
    `;
}

function taskDetailModal() {
  return `
    <div id="task-detail-overlay" class="hidden">
        <div id="task-detail-card">
            <div id="task-detail-body">
                <div id="task-content">

                    <!-- Task View (read-only) -->
                    <div id="task-view"></div>

                    <!-- Task Edit -->
                    <div id="task-edit" class="hidden">

                        <!-- Dynamische Felder -->
                        <div id="edit-form-fields"></div>

                        <!-- Actions -->
                        <div class="edit-actions">
                            <button class="create-btn" id="save-task">Ok
                                <img src="./assets/icons-addTask/check (1).png" alt="">
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
  `;
}

function subtaskHTML({ title, isChecked, taskId, index }) {
  return `
    <li class="subtask-item">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <div class="subtask-row">
                <div class="checkbox-wrapper" onclick="toggleCheckbox(this, '${taskId}', ${index})">
                    <input type="checkbox" class="real-checkbox" style="display:none;" ${isChecked ? 'checked' : ''}>
                    <img src="./assets/icons-addTask/Property 1=Default.svg" class="checkbox-default" style="display:${isChecked ? 'none' : 'block'}">
                    <img src="./assets/icons-addTask/Property 1=checked.svg" class="checkbox-checked" style="display:${isChecked ? 'block' : 'none'}">
                </div>
                <span class="subtask-text">${title}</span>
            </div>
        </div>
    </li>
  `;
}

function taskDetailTemplate(task, categoryImg) {
    return `
        <div class="top-bar">
            <img src="${categoryImg}" alt="${task.category || "Category"}" class="category-image">
            <button class="close-button-overlay" onclick="document.getElementById('task-detail-overlay').classList.add('hidden')">
                <img src="./assets/icons-board/close.svg" alt="Schließen" class="close-icon">
            </button>
        </div>

        <h2 class="modal-title">${task.title}</h2>
        <p class="modal-desc">${task.description || ""}</p>
        <p class="task-overlay-bullet"><strong>Due date:</strong> <span>${formatDateForDisplay(task.dueDate) || "-"}</span></p>
        <p class="task-overlay-bullet">
            <strong>Priority:</strong> 
            <span class="priority_value">
                ${task.priority || ""}
                <img src="${priorityIcon(task.priority)}" alt="${task.priority || "Priority"}" class="priority-icon-overlay">
            </span>
        </p>

        <p class="task-overlay-bullet"><strong>Assigned To:</strong></p>
        <div class="assigned-list">${renderAssignedUsers(task.assignedUsersFull)}</div>

        <p class="task-overlay-bullet subtask-header-distance"><strong>Subtasks:</strong></p>
        <ul class="subtasks-list">${renderSubtasks(task)}</ul>

        <div class="task-detail-actions">
            <button class="delete-btn">
                <img src="./assets/icons-board/Property 1=delete.png" alt="Delete Icon" class="action-icon">
                Delete
            </button>
            <button id="edit-header-btn">
                <img src="./assets/icons-board/Property 1=edit.png" alt="Edit Icon" class="action-icon">
                Edit
            </button>
        </div>
    `;
}

function taskEditTemplate(task, isoDate) {
    return `
        <input class="input-title" type="text" id="edit-title" value="${task.title || ""}">

        <div class="description-container">
            <label class="desc-title" for="edit-desc">Description</label>
            <textarea class="description-input" id="edit-desc">${task.description || ""}</textarea>
        </div>

        <div class="due-date-container-overlay">
            <label class="due-date-header" for="edit-dueDate">Due Date</label>
            <input type="date" id="edit-dueDate" value="${isoDate}">
        </div>

        <div id="edit-priority" class="priority-container">
            <label class="priority-header">Priority</label>
            <div class="priority-content">
                <button class="priority-frame" data-priority="Urgent"><img src="./assets/icons-addTask/Prio alta.svg" alt>Urgent</button>
                <button class="priority-frame" data-priority="Medium"><img src="./assets/icons-addTask/Capa 2.svg" alt>Medium</button>
                <button class="priority-frame" data-priority="Low"><img src="./assets/icons-addTask/Prio baja.svg" alt>Low</button> 
            </div>
        </div>

        <div class="assigned-container-overlay"> 
            <div class="assigned-header"> Assigned to <span class="optional">(optional)</span> </div> 
            <div class="assigned-content-overlay"> 
                <div class="assigned-text-container"> 
                    <div class="assigned-text" id="edit-assigned-placeholder">Select contacts to assign</div> 
                    <input type="text" id="edit-assigned-input" class="assigned-input" style="display:none;">
                    <img id="edit-assigned-arrow" src="./assets/icons-addTask/arrow_drop_down.png" class="assigned-arrow-icon">
                    <div id="edit-assigned-dropdown-overlay" class="dropdown-menu-overlay-edit hidden"></div> 
                </div> 
            </div> 
        </div> 
        <div id="edit-avatars-container-overlay" class="avatars-container-overlay"></div>

        <label class="assigned-header">Subtasks</label>
        <div id="task-content-addtask">
            <input type="text" id="edit-subtask-input" placeholder="Add new subtask">
            <div id="assigned-arrow-container">
                <img id="edit-cancel-btn" class="assigned-arrow-icon" style="display:none;" src="/assets/icons-addTask/Subtask cancel.png" alt="Cancel subtask">
                <img id="edit-check-btn" class="assigned-arrow-icon" style="display:none;" src="/assets/icons-addTask/Subtask's icons (1).png" alt="Confirm subtask">
            </div>
        </div>
        <div id="edit-subtask-list"></div>
    `;
}

function getTaskCardTemplate(taskId) {
    return `
        <div class="task-card" id="task-${taskId}">
            <div class="task-card-type">
                <img src="" alt="">
            </div>

            <button class="mobile-move-task-btn">
                <img src="./assets/icons-board/mobile-arrow-btn.svg" alt="Open move to overlay">
            </button>
            
            <div class="task-card-content">
                <div class="task-card-title"></div>
                <div class="task-card-info"></div>
            </div>
            
            <div class="task-card-subtasks" data-hidden="true">
                <div class="progress-container">
                    <div class="progress-fill"></div>
                </div>
                <span class="task-card-subtasks-text"></span>
            </div>
            
            <div class="task-card-assigned-to">
                <div class="task-card-avatars-container"></div>
                <img class="priority-icon" src="" alt="Priority">
            </div>
        </div>
    `;
}

function getMoveToContainerItemTemplate(statusLabel, bgColor, cursorStyle, dataAttr) {
    return `
        <div class="move-to-container" 
             style="background-color: ${bgColor}; cursor: ${cursorStyle};"
             ${dataAttr}>
            <span>${statusLabel}</span>
        </div>
    `;
}

function getMoveToOverlayBackdropTemplate(overlayContent) {
    return `
        <div class="mobile-move-overlay-backdrop hidden">
            <div class="mobile-view-column-overlay">
                <div class="mobile-view-column-overlay-title">Move to</div>
                <div class="move-to">
                    ${overlayContent}
                </div>
            </div>
        </div>
    `;
}