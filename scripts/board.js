document.addEventListener('DOMContentLoaded', async () => {
  const addTaskButton = document.getElementById('add-task-btn');
  const modal = document.getElementById('add-task-modal');
  const modalClose = document.getElementById('modal-close');
  const cancelButton = document.getElementById('cancel-btn');
  const form = document.getElementById('add-task-form');

  function openModal() {
    modal?.classList.remove('hidden');
  }

  function closeModal() {
    modal?.classList.add('hidden');
    form?.reset();
    const priority = document.getElementById('task-priority');
    const status = document.getElementById('task-status');
    const done = document.getElementById('subtasks-done');
    const total = document.getElementById('subtasks-total');
    if (priority) priority.value = 'medium';
    if (status) status.value = 'todo';
    if (done) done.value = '0';
    if (total) total.value = '0';
  }

  addTaskButton?.addEventListener('click', openModal);
  modalClose?.addEventListener('click', closeModal);
  cancelButton?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (!window.taskManager) {
    console.error('Task manager not loaded');
    return;
  }

  await window.taskManager.loadTasks();
  renderBoard();
  setupDragAndDrop();

  // Open modal automatically if requested via query param
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openAddTask') === '1') {
      const addTaskButton = document.getElementById('add-task-btn');
      addTaskButton?.click();
    }
  } catch (e) {}

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const dueDate = document.getElementById('task-dueDate').value;
    const priority = document.getElementById('task-priority').value;
    const status = document.getElementById('task-status').value;
    const subtasksDone = parseInt(document.getElementById('subtasks-done').value || '0', 10);
    const subtasksTotal = parseInt(document.getElementById('subtasks-total').value || '0', 10);

    if (!title) {
      alert('Please enter a title');
      return;
    }

    const payload = {
      title,
      description,
      dueDate,
      priority,
      status,
      subtasks: { completed: subtasksDone, total: subtasksTotal },
    };

    try {
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Saving...';
      submitButton.disabled = true;

      await window.taskManager.createTask(payload);
      await window.taskManager.loadTasks();
      renderBoard();
      setupDragAndDrop();
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Failed to save task');
    } finally {
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.textContent = 'Save Task';
      submitButton.disabled = false;
    }
  });
});

function renderBoard() {
  const tasks = window.taskManager.getTasks();
  const columns = {
    todo: document.getElementById('column-todo'),
    inProgress: document.getElementById('column-inProgress'),
    awaitingFeedback: document.getElementById('column-awaitingFeedback'),
    done: document.getElementById('column-done'),
  };

  Object.values(columns).forEach((el) => el && (el.innerHTML = ''));

  tasks.forEach((task) => {
    const card = createTaskCard(task);
    const column = columns[task.status] || columns.todo;
    if (column) {
      column.appendChild(card);
    }
  });

  // If a column is empty, show placeholder
  Object.entries(columns).forEach(([status, columnEl]) => {
    if (!columnEl) return;
    if (columnEl.children.length === 0) {
      const placeholder = document.createElement('div');
      placeholder.className = 'task-placeholder';
      placeholder.textContent = `No tasks in ${readableStatus(status)}`;
      columnEl.appendChild(placeholder);
    }
  });
}

function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.setAttribute('data-task-id', task.id || 'unknown');
  card.setAttribute('draggable', 'true');

  const type = document.createElement('div');
  type.className = 'task-type';
  const typeImg = document.createElement('img');
  typeImg.src = './assets/icons-board/user-story-tag.svg';
  typeImg.alt = 'User Story';
  type.appendChild(typeImg);

  const content = document.createElement('div');
  content.className = 'task-content';
  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = task.title || 'Untitled';
  const info = document.createElement('div');
  info.className = 'task-info';
  info.textContent = task.description || '';
  content.appendChild(title);
  content.appendChild(info);

  const subtasks = document.createElement('div');
  subtasks.className = 'subtasks';
  const progressImg = document.createElement('img');
  progressImg.src = './assets/Progress bar.png';
  const progressText = document.createElement('span');
  progressText.className = 'subtasks-text';
  const completed = task.subtasks?.completed || 0;
  const total = task.subtasks?.total || 0;
  progressText.textContent = `${completed}/${total} Subtasks`;
  subtasks.appendChild(progressImg);
  subtasks.appendChild(progressText);

  const assignedTo = document.createElement('div');
  assignedTo.className = 'assigned-to';
  const priority = document.createElement('div');
  priority.className = 'priority';
  const avatar = document.createElement('img');
  avatar.src = './assets/Frame 217.png';
  const prioImg = document.createElement('img');
  prioImg.alt = 'Priority';
  prioImg.src = priorityIcon(task.priority);
  priority.appendChild(avatar);
  priority.appendChild(prioImg);
  assignedTo.appendChild(priority);

  card.appendChild(type);
  card.appendChild(content);
  card.appendChild(subtasks);
  card.appendChild(assignedTo);

  // Add click event listener to open task details modal
  card.addEventListener('click', () => {
    if (!card.classList.contains('dragging')) {
      openTaskDetailsModal(task);
    }
  });

  // Drag handlers
  card.addEventListener('dragstart', (e) => {
    card.classList.add('dragging');
    try {
      e.dataTransfer?.setData('text/plain', String(task.id || ''));
      e.dataTransfer?.setDragImage(card, 20, 20);
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    } catch (_) {}
  });

  card.addEventListener('dragend', () => {
    // delay removal to avoid accidental click
    setTimeout(() => card.classList.remove('dragging'), 0);
  });

  return card;
}

function priorityIcon(priority) {
  switch ((priority || 'medium').toLowerCase()) {
    case 'urgent':
      return './assets/icons-board/priority-medium.svg';
    case 'low':
      return './assets/icons-board/priority-medium.svg';
    default:
      return './assets/icons-board/priority-medium.svg';
  }
}

function readableStatus(status) {
  switch (status) {
    case 'todo':
      return 'to do';
    case 'inProgress':
      return 'progress';
    case 'awaitingFeedback':
      return 'awaiting feedback';
    case 'done':
      return 'done';
    default:
      return status;
  }
}

// ======================
// Task Details Modal Functions
// ======================

function openTaskDetailsModal(task) {
  const modal = document.getElementById('task-details-modal');
  if (!modal) return;

  // Populate modal with task data
  populateTaskDetailsModal(task);
  
  // Show modal
  modal.classList.remove('hidden');
  
  // Add event listeners
  setupTaskDetailsModalListeners(task);
}

function populateTaskDetailsModal(task) {
  // Title
  const titleDisplay = document.getElementById('task-title-display');
  if (titleDisplay) {
    titleDisplay.textContent = task.title || 'Untitled';
  }

  // Description
  const descriptionDisplay = document.getElementById('task-description-display');
  if (descriptionDisplay) {
    const description = task.description || 'No description provided';
    descriptionDisplay.textContent = description;
    if (!task.description) {
      descriptionDisplay.classList.add('empty');
    }
  }

  // Due date
  const dueDateDisplay = document.getElementById('task-due-date-display');
  if (dueDateDisplay) {
    if (task.dueDate) {
      const date = new Date(task.dueDate);
      dueDateDisplay.textContent = date.toLocaleDateString('de-DE');
    } else {
      dueDateDisplay.textContent = 'No due date set';
      dueDateDisplay.classList.add('empty');
    }
  }

  // Priority
  const priorityDisplay = document.getElementById('task-priority-display');
  if (priorityDisplay) {
    const priority = task.priority || 'medium';
    priorityDisplay.className = `task-value priority-badge priority-${priority.toLowerCase()}`;
    priorityDisplay.innerHTML = `
      ${priority.charAt(0).toUpperCase() + priority.slice(1)}
      <img src="./assets/icons-addTask/${getPriorityIcon(priority)}" alt="${priority}" width="16" height="16">
    `;
  }

  // Status
  const statusDisplay = document.getElementById('task-status-display');
  if (statusDisplay) {
    const status = task.status || 'todo';
    statusDisplay.className = `task-value status-badge status-${status}`;
    statusDisplay.textContent = readableStatus(status);
  }

  // Assigned contacts
  const assignedDisplay = document.getElementById('task-assigned-display');
  if (assignedDisplay) {
    if (task.assignedContacts && task.assignedContacts.length > 0) {
      assignedDisplay.className = 'task-value assigned-contacts';
      const contactsHtml = task.assignedContacts.map(contact => `
        <div class="assigned-contact">
          <div class="contact-avatar">${getInitials(contact.name)}</div>
          <span>${contact.name}</span>
        </div>
      `).join('');
      assignedDisplay.innerHTML = contactsHtml;
    } else {
      assignedDisplay.className = 'task-value empty';
      assignedDisplay.textContent = 'No contacts assigned';
    }
  }

  // Category
  const categoryDisplay = document.getElementById('task-category-display');
  if (categoryDisplay) {
    if (task.category) {
      categoryDisplay.textContent = task.category;
    } else {
      categoryDisplay.textContent = 'No category set';
      categoryDisplay.classList.add('empty');
    }
  }

  // Subtasks
  const subtasksDisplay = document.getElementById('task-subtasks-display');
  if (subtasksDisplay) {
    if (task.subtasks && task.subtasks.total > 0) {
      subtasksDisplay.className = 'task-value subtasks-list';
      const subtasksHtml = task.subtasks.items.map(subtask => `
        <div class="subtask-item">
          <div class="subtask-checkbox ${subtask.completed ? 'checked' : ''}" 
               data-subtask-id="${subtask.id}">
          </div>
          <span class="subtask-text">${subtask.text}</span>
        </div>
      `).join('');
      subtasksDisplay.innerHTML = subtasksHtml;
    } else {
      subtasksDisplay.className = 'task-value empty';
      subtasksDisplay.textContent = 'No subtasks';
    }
  }
}

function setupTaskDetailsModalListeners(task) {
  const modal = document.getElementById('task-details-modal');
  const closeBtn = document.getElementById('close-task-details-btn');
  const closeDetailsBtn = document.getElementById('close-details-btn');
  const editBtn = document.getElementById('edit-task-btn');
  const deleteBtn = document.getElementById('delete-task-btn');

  // Close modal functions
  const closeModal = () => {
    modal.classList.add('hidden');
  };

  // Close buttons
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  if (closeDetailsBtn) {
    closeDetailsBtn.addEventListener('click', closeModal);
  }

  // Close on backdrop click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Edit task
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      closeModal();
      // TODO: Implement edit functionality
      console.log('Edit task:', task.id);
    });
  }

  // Delete task
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this task?')) {
        deleteTask(task.id);
      }
    });
  }

  // Subtask checkbox clicks
  const subtaskCheckboxes = document.querySelectorAll('.subtask-checkbox');
  subtaskCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation();
      const subtaskId = checkbox.getAttribute('data-subtask-id');
      toggleSubtask(subtaskId, checkbox);
    });
  });
}

function getPriorityIcon(priority) {
  switch (priority.toLowerCase()) {
    case 'urgent':
      return 'Prio alta.svg';
    case 'low':
      return 'Prio baja.svg';
    default:
      return 'Capa 2.svg';
  }
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

async function deleteTask(taskId) {
  try {
    if (window.taskManager) {
      await window.taskManager.deleteTask(taskId);
      await window.taskManager.loadTasks();
      renderBoard();
      closeTaskDetailsModal();
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    alert('Failed to delete task');
  }
}

function closeTaskDetailsModal() {
  const modal = document.getElementById('task-details-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function toggleSubtask(subtaskId, checkbox) {
  // TODO: Implement subtask toggle functionality
  checkbox.classList.toggle('checked');
  console.log('Toggle subtask:', subtaskId, checkbox.classList.contains('checked'));
}

// ======================
// Drag & Drop for columns
// ======================

function setupDragAndDrop() {
  const taskColumns = document.querySelectorAll('.task-column .tasks');
  taskColumns.forEach((tasksEl) => {
    const columnEl = tasksEl.closest('.task-column');
    if (!columnEl) return;
    const status = columnEl.getAttribute('data-status');
    if (!status) return;

    // Ensure listeners are not duplicated
    tasksEl.removeEventListener('dragover', handleDragOver);
    tasksEl.removeEventListener('dragenter', handleDragEnter);
    tasksEl.removeEventListener('dragleave', handleDragLeave);
    tasksEl.removeEventListener('drop', handleDrop);

    tasksEl.addEventListener('dragover', handleDragOver);
    tasksEl.addEventListener('dragenter', handleDragEnter);
    tasksEl.addEventListener('dragleave', handleDragLeave);
    tasksEl.addEventListener('drop', (e) => handleDrop(e, status));
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer && (e.dataTransfer.dropEffect = 'move');
}

function handleDragEnter(e) {
  const target = e.currentTarget;
  if (target && target.classList) target.classList.add('drag-over');
}

function handleDragLeave(e) {
  const target = e.currentTarget;
  if (target && target.classList) target.classList.remove('drag-over');
}

async function handleDrop(e, newStatus) {
  e.preventDefault();
  const target = e.currentTarget;
  if (target && target.classList) target.classList.remove('drag-over');
  try {
    const taskId = e.dataTransfer?.getData('text/plain');
    if (!taskId) return;
    if (window.taskManager) {
      await window.taskManager.updateTask(taskId, { status: newStatus });
      await window.taskManager.loadTasks();
      renderBoard();
      setupDragAndDrop();
    }
  } catch (error) {
    console.error('Error moving task:', error);
    alert('Failed to move task');
  }
}


