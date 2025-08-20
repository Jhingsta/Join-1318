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


