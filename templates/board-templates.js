function addtaskModal() {
    return `
        <div id="add-task-modal" class="modal-overlay hidden">
            <div class="modal">
                <div id="header-container">
                    <div id="header-content">Add Task</div>
                    <button id="add-modal-close" class="close">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path d="M6 6 L18 18" stroke="#000" stroke-width="2" stroke-linecap="round" />
                            <path d="M6 18 L18 6" stroke="#000" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </button>
                </div>

                <div class="main-container-modal">
                    <!-- TITLE -->
                    <div class="title-container">
                        <input type="text" id="add-title-input" class="title-input" placeholder="Enter a title" required>
                        <span id="add-title-error" class="error-message">This field is required</span>
                    </div>

                    <!-- DESCRIPTION -->
                    <div class="description-container">
                        <div class="description-header">
                            <span class="desc-title">Description</span>
                            <span class="desc-optional">(optional)</span>
                        </div>
                        <textarea id="add-description-input" class="description-input" placeholder="Enter a description"></textarea>
                    </div>

                    <!-- DUE DATE -->
                    <div id="add-due-date-container" class="due-date-container">
                        <div class="due-date-header">Due date</div>
                        <div id="add-due-date-content" class="due-date-content">
                            <input type="date" id="add-due-date-input" class="due-date-input" required>
                            <span id="add-due-date-display" class="due-date-display">dd/mm/yyyy</span>
                            <div class="due-date-icon-container">
                                <div class="due-date-icon"></div>
                            </div>
                        </div>
                        <span id="add-due-date-error" class="error-message">This field is required</span>
                    </div>

                    <!-- PRIORITY -->
                    <div class="priority-container">
                        <div class="priority-header">Priority</div>
                        <div id="add-priority-buttons" class="priority-content">
                            <button type="button" class="priority-frame" data-priority="urgent">
                                Urgent <img src="./assets/icons-addtask/Prio alta.svg" alt="">
                            </button>
                            <button type="button" class="priority-frame active" data-priority="medium">
                                Medium <img src="./assets/icons-addtask/Capa 2.svg" alt="">
                            </button>
                            <button type="button" class="priority-frame" data-priority="low">
                                Low <img src="./assets/icons-addtask/Prio baja.svg" alt="">
                            </button>
                        </div>
                    </div>

                    <!-- ASSIGNED TO -->
                    <div class="assigned-container">
                        <div class="assigned-header">
                            Assigned to <span class="optional">(optional)</span>
                        </div>
                        <div id="add-assigned-dropdown-container" class="assigned-content">
                            <div id="add-assigned-text-container" class="assigned-text-container">
                                <div id="add-assigned-text" class="assigned-text">Select contacts to assign</div>
                            </div>
                            <input type="text" id="add-assigned-input" class="assigned-input" placeholder="" style="display:none;">
                            <div id="add-assigned-arrow-container" class="assigned-arrow-container">
                                <img id="add-assigned-arrow" src="/assets/icons-addtask/arrow_drop_down.png" alt="Select contacts" class="assigned-arrow-icon">
                            </div>
                            <div id="add-assigned-dropdown" class="dropdown-menu"></div>
                        </div>
                        <div id="add-selected-avatars-container" class="selected-avatars-container"></div>
                    </div>

                    <!-- CATEGORY -->
                    <div class="category-container">
                        <div class="assigned-header">Category</div>
                        <div id="add-category-dropdown-container" class="category-content">
                            <div id="add-category-text" class="assigned-text">Select task category</div>
                            <div id="add-category-arrow-container" class="assigned-arrow-container">
                                <img id="add-category-arrow" src="/assets/icons-addtask/arrow_drop_down.png" alt="Select category" class="assigned-arrow-icon">
                            </div>
                        </div>
                        <span id="add-category-error" class="error-message">This field is required</span>
                    </div>

                    <!-- SUBTASKS -->
                    <div class="task-container">
                        <div class="assigned-header">
                            Subtasks <span class="optional">(optional)</span>
                        </div>
                        <div id="add-subtask-input-container">
                            <input type="text" id="add-subtask-input" placeholder="Add new subtask">
                            <div id="add-subtask-action-container" class="assigned-arrow-container">
                                <img id="add-subtask-cancel" src="/assets/icons-addtask/Subtask cancel.png" alt="Cancel subtask" class="assigned-arrow-icon" style="display:none;">
                                <img id="add-subtask-check" src="/assets/icons-addtask/Subtask's icons (1).png" alt="Confirm subtask" class="assigned-arrow-icon" style="display:none;">
                            </div>
                            <ul id="add-subtask-list" class="subtask-list"></ul>
                        </div>
                    </div>

                    <!-- FOOTER -->
                    <div class="modal-footer">
                        <button class="create-btn" id="add-create-btn">
                            Create Task <img src="./assets/icons-addtask/check (1).png" alt="">
                        </button>
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
        <div>
            <div class="subtask-row">
                <div class="checkbox-wrapper" onclick="toggleCheckbox(this, '${taskId}', ${index})">
                    <input type="checkbox" class="real-checkbox" style="display:none;" ${isChecked ? 'checked' : ''}>
                    <img src="./assets/icons-addtask/Property 1=Default.svg" class="checkbox-default" style="display:${isChecked ? 'none' : 'block'}">
                    <img src="./assets/icons-addtask/Property 1=checked.svg" class="checkbox-checked" style="display:${isChecked ? 'block' : 'none'}">
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
                <img src="./assets/icons-board/close.svg" alt="Close" class="close-icon">
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
            <button id="edit-header-btn" class="edit-btn">
                <img src="./assets/icons-board/Property 1=edit.png" alt="Edit Icon" class="action-icon">
                Edit
            </button>
        </div>
    `;
}

function taskEditTemplate(task, isoDate) {
    return `
        <!-- TITLE -->
        <div class="top-bar">
            <input class="edit-title-input" type="text" id="edit-title-input" value="${task.title || ""}">
            <button class="close-button-overlay" onclick="document.getElementById('task-detail-overlay').classList.add('hidden')">
                <img src="./assets/icons-board/close.svg" alt="Close" class="close-icon">
            </button>
        </div>    
        
        <!-- DESCRIPTION -->
        <div class="description-container">
            <label class="desc-title" for="edit-description-input">Description</label>
            <textarea class="description-input" id="edit-description-input">${task.description || ""}</textarea>
        </div>
        
        <!-- DUE DATE -->
        <div id="edit-due-date-container" class="due-date-container-overlay">
            <label class="due-date-header" for="edit-due-date-input">Due Date</label>
            <input type="date" id="edit-due-date-input" value="${isoDate}">
        </div>
        
        <!-- PRIORITY -->
        <div id="edit-priority-container" class="priority-container">
            <label class="priority-header">Priority</label>
            <div id="edit-priority-buttons" class="priority-content">
                <button class="priority-frame" data-priority="urgent">
                    <img src="./assets/icons-addtask/Prio alta.svg" alt="">Urgent
                </button>
                <button class="priority-frame" data-priority="medium">
                    <img src="./assets/icons-addtask/Capa 2.svg" alt="">Medium
                </button>
                <button class="priority-frame" data-priority="low">
                    <img src="./assets/icons-addtask/Prio baja.svg" alt="">Low
                </button> 
            </div>
        </div>
        
        <!-- ASSIGNED TO -->
        <div class="assigned-container-overlay"> 
            <div class="assigned-header">
                Assigned to <span class="optional">(optional)</span>
            </div> 
            <div id="edit-assigned-dropdown-container" class="assigned-content-overlay"> 
                <div id="edit-assigned-text-container" class="assigned-text-container"> 
                    <div id="edit-assigned-placeholder" class="assigned-text">Select contacts to assign</div> 
                    <input type="text" id="edit-assigned-input" class="assigned-input" style="display:none;">
                    <img id="edit-assigned-arrow" src="./assets/icons-addtask/arrow_drop_down.png" class="assigned-arrow-icon">
                    <div id="edit-assigned-dropdown" class="dropdown-menu-overlay-edit hidden"></div> 
                </div> 
            </div> 
        </div> 
        <div id="edit-avatars-container" class="edit-avatars-container-overlay"></div>
        
        <!-- SUBTASKS -->
        <label class="assigned-header">Subtasks</label>
        <div id="edit-subtask-input-container">
            <input type="text" id="edit-subtask-input" placeholder="Add new subtask">
            <div id="edit-subtask-action-container">
                <img id="edit-subtask-cancel" class="assigned-arrow-icon" style="display:none;" src="/assets/icons-addtask/Subtask cancel.png" alt="Cancel subtask">
                <img id="edit-subtask-check" class="assigned-arrow-icon" style="display:none;" src="/assets/icons-addtask/Subtask's icons (1).png" alt="Confirm subtask">
            </div>
        </div>
        <div id="edit-subtask-list"></div>

        <!-- Actions -->
        <div class="edit-actions">
            <button class="create-btn" id="save-task">Ok
                    <img src="./assets/icons-addtask/check (1).png" alt="">
            </button>
        </div>
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