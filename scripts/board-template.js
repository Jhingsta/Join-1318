// board-template.js
function taskDetailTemplate(task) {
  let categoryImg = "";
  if (task.category === "User Story") {
    categoryImg = "./assets/icons-board/user-story-tag-overlay.svg";
  } else if (task.category === "Technical Task") {
    categoryImg = "./assets/icons-board/technical-task-tag-overlay.svg";
  }

  return `
    <div class="top-bar">
      <img src="${categoryImg}" alt="${task.category || "Category"}" class="category-image">
      <button class="close-button-overlay" onclick="document.getElementById('task-detail-overlay').classList.add('hidden')">
        <img src="./assets/icons-board/close.svg" alt="Schließen" class="close-icon">
      </button>
    </div>

    <h2 class="modal-title">${task.title}</h2>
    <p class="modal-desc">${task.description || ""}</p>
    <p class="task-overlay-bullet"><strong>Due date:</strong> <span>${task.dueDate || "-"}</span></p>
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
        <img src="./assets/icons-board/Property 1=delete.png" alt="Delete Icon" class="action-icon">Delete
      </button>
      <button id="edit-header-btn">
        <img src="./assets/icons-board/Property 1=edit.png" alt="Edit Icon" class="action-icon"> Edit
      </button>
    </div>
  `;
}

function renderSubtasks(task) {
  if (!task.subtasks || !task.subtasks.items || task.subtasks.items.length === 0) {
      return `<li>Keine Subtasks</li>`;
  }
  return task.subtasks.items.map((subtask, index) => {
      const title = subtask.title || `Subtask ${index + 1}`;
      const isChecked = subtask.done === true;

      return `
      <li class="subtask-item">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <div class="subtask-row">
                  <div class="checkbox-wrapper" onclick="toggleCheckbox(this, '${task.firebaseId}', ${index})">
                      <input type="checkbox" class="real-checkbox" style="display:none;" ${isChecked ? 'checked' : ''}>
                      <img src="./assets/icons-addTask/Property 1=Default.svg" class="checkbox-default" style="display:${isChecked ? 'none' : 'block'}">
                      <img src="./assets/icons-addTask/Property 1=checked.svg" class="checkbox-checked" style="display:${isChecked ? 'block' : 'none'}">
                  </div>
                  <span class="subtask-text" style="font-size:16px; font-family:'Open Sans', sans-serif;">${title}</span>
              </div>
          </div>
      </li>
      `;
  }).join("");
}

function renderAssignedUsers(users) {
    if (!users || users.length === 0) return "";

    return users.map(user => {
        const name = typeof user === "string" ? user : (user.name || user.username || "");

        return `
        <div class="assigned-item">
            <div class="assigned-avatar" style="
                background-color: ${getColor(name)};
                width:42px;
                height:42px;
                border-radius:50%;
                display:flex;
                align-items:center;
                justify-content:center;
                font-family:Open Sans;
                font-weight:400;
                font-size:12px;
                color:#fff;
            ">
                ${getInitials(name)}
            </div>
            <span class="assigned-name-full">${name}</span>
        </div>
        `;
    }).join("");
}