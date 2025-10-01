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

                <div class="end-spacer"></div>
            </div>
            <div class="modal-footer">
                <button class="create-btn" id="create-btn">
                    Create Task <img src="./assets/icons-addTask/check (1).png" alt="">
                </button>
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
                <span class="subtask-text" style="font-size:16px; font-family:'Open Sans', sans-serif;">${title}</span>
            </div>
        </div>
    </li>
  `;
}


