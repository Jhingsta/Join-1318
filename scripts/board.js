document.addEventListener('DOMContentLoaded', async () => {
    const addTaskButton = document.getElementById('add-task-btn');
    const modal = document.getElementById('add-task-modal');
    const modalClose = document.getElementById('modal-close');
    const cancelButton = document.getElementById('cancel-btn');
    const form = document.getElementById('add-task-form');
    const signUpBtn = document.querySelector('.sign-up-btn'); // Save Button
    const closeButton = document.querySelector('.close');

    closeButton?.addEventListener('click', closeModal);

    function openModal() {
        modal?.classList.remove('hidden');
        addTaskButton?.classList.add('active-style'); // Button aktiv stylen
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
        awaitFeedback: document.getElementById('column-awaitFeedback'),
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
    // Remove dragging class immediately to prevent visual glitch
    card.classList.remove('dragging');
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
        case 'awaitFeedback':
            return 'awaiting feedback';
        case 'done':
            return 'done';
        default:
            return status;
    }
}

const categories = ["Technical Task", "User Story"];
const titleInput = document.querySelector(".title-input");
const titleError = document.querySelector(".error-message");

titleInput.addEventListener("blur", () => {
    if (!titleInput.value.trim()) {
        titleInput.style.borderBottom = "1px solid #FF4D4D";
        titleError.style.display = "block";
    } else {
        titleInput.style.borderBottom = "1px solid #D1D1D1";
        titleError.style.display = "none";
    }
});

titleInput.addEventListener("input", () => {
    if (titleInput.value.trim()) {
        titleInput.style.borderBottom = "1px solid #005DFF";
        titleError.style.display = "none";
    }
});

const dueDateInput = document.querySelector(".due-date-input");
const dueDateIcon = document.querySelector(".due-date-icon");
const dueDateContainer = document.querySelector(".due-date-content");
const dueDateError = document.querySelector(".due-date-container .error-message");

// Blur-Event (Validierung)
dueDateInput.addEventListener("blur", () => {
    if (!dueDateInput.value.trim()) {
        dueDateInput.style.borderBottom = "1px solid #FF4D4D";
        dueDateError.style.display = "block";
    } else {
        dueDateInput.style.borderBottom = "1px solid #D1D1D1";
        dueDateError.style.display = "none";
    }
});

// Funktion um Datepicker zu öffnen
function openDatepicker() {
    if (dueDateInput.showPicker) {
        dueDateInput.showPicker(); // moderner Weg
    } else {
        dueDateInput.click(); // Fallback für ältere Browser
    }
}

// Klick auf Icon öffnet Datepicker
dueDateIcon.addEventListener("click", openDatepicker);

// Klick auf die gesamte Zeile öffnet Datepicker
dueDateContainer.addEventListener("click", openDatepicker);


const buttons = document.querySelectorAll(".priority-frame");

buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

const arrowContainer = document.querySelector('.assigned-content');
const assignedDropdown = document.getElementById('assigned-dropdown');

arrowContainer.addEventListener('click', (event) => {
    event.stopPropagation();
    assignedDropdown.classList.toggle('show');
});


document.addEventListener('click', (event) => {
    if (!assignedDropdown.contains(event.target) && event.target !==
        arrowContainer) {
        assignedDropdown.style.display = 'none';
    }
});

function populateCategoryDropdown() {
    const container = document.querySelector('.category-container .category-content');
    if (!container) return;

    const menu = document.createElement('div');
    menu.className = 'dropdown-menu';

    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = cat;

        item.addEventListener('click', () => {
            container.querySelector('.assigned-text').textContent = cat;
            menu.style.display = 'none';
        });

        menu.appendChild(item);
    });

    container.appendChild(menu);

    const arrow = container.querySelector('.assigned-arrow-container');
    arrow.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.style.display = menu.style.display === 'block' ? 'none' :
            'block';
    });

    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            menu.style.display = 'none';
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const assignedContent = document.querySelector('.assigned-content');
    const assignedTextContainer = assignedContent.querySelector('.assigned-text-container');
    const assignedText = assignedTextContainer.querySelector('.assigned-text');
    const assignedInput = assignedContent.querySelector('.assigned-input');
    const arrowContainer = assignedContent.querySelector('.assigned-arrow-container');
    const arrowIcon = arrowContainer.querySelector('img');
    const assignedDropdown = document.getElementById('assigned-dropdown');
    const selectedAvatarsContainer = document.querySelector(".selected-avatars-container");

    let users = [];

    // ---------- Load Users ----------
    async function loadUsers() {
        try {
            const res = await fetch("https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/users.json");
            const data = await res.json();
            users = data ? Object.values(data) : [];
            populateDropdown();
        } catch (e) {
            console.error("Fehler beim Laden der Users", e);
        }
    }

    // ---------- Helpers ----------
    function getInitials(name) {
        if (!name) return "";
        return name.trim().split(" ").map(n => n[0].toUpperCase()).slice(0, 2).join("");
    }

    function getColor(name) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return `hsl(${Math.abs(hash) % 360},70%,50%)`;
    }

    // ---------- Update Selected Avatars ----------
    function updateSelectedAvatars() {
        selectedAvatarsContainer.innerHTML = "";
        const selected = users.filter((u, i) => {
            const img = assignedDropdown.children[i].querySelector('img');
            return img.src.includes("checked");
        }).slice(0, 3);

        selected.forEach(u => {
            const a = document.createElement('div');
            a.className = 'selected-avatar assigned-text';
            a.textContent = getInitials(u.name);
            a.style.width = '28px';
            a.style.height = '28px';
            a.style.borderRadius = '50%';
            a.style.display = 'flex';
            a.style.alignItems = 'center';
            a.style.justifyContent = 'center';
            a.style.fontWeight = 'bold';
            a.style.fontSize = '13px';
            a.style.color = 'white';
            a.style.backgroundColor = getColor(u.name);
            a.style.marginRight = '4px';
            a.style.flex = '0 0 auto';
            selectedAvatarsContainer.appendChild(a);
        });

        selectedAvatarsContainer.style.display = selected.length > 0 ? 'flex' : 'none';
    }

    // ---------- Populate Dropdown ----------
    function populateDropdown() {
        assignedDropdown.innerHTML = "";

        users.forEach((user, i) => {
            const div = document.createElement('div');
            div.className = 'dropdown-item';
            div.dataset.clicked = "false";

            const wrapper = document.createElement('div');
            wrapper.className = 'assigned-wrapper';

            const avatar = document.createElement('div');
            avatar.className = 'dropdown-avatar';
            avatar.textContent = getInitials(user.name);
            avatar.style.backgroundColor = getColor(user.name);

            const span = document.createElement('span');
            span.textContent = user.name;

            wrapper.appendChild(avatar);
            wrapper.appendChild(span);

            // Checkbox
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.className = 'checkbox-wrapper';
            const checkbox = document.createElement('img');
            checkbox.src = "./assets/icons-addTask/Property 1=Default.png";

            // Hover-Kreis
            const hoverOverlay = document.createElement('div');
            hoverOverlay.className = 'hover-overlay';
            checkboxWrapper.appendChild(hoverOverlay);
            checkboxWrapper.appendChild(checkbox);

            div.appendChild(wrapper);
            div.appendChild(checkboxWrapper);
            assignedDropdown.appendChild(div);

            // ---------- Klick auf Zeile → nur Highlight ----------
            div.addEventListener('click', (e) => {
                if (e.target === checkbox || e.target === hoverOverlay) return;
                div.classList.toggle('active'); // nur Highlight beim Zeilen-Klick
            });

            // ---------- Klick auf Checkbox ----------
            checkboxWrapper.addEventListener('click', (e) => {
                e.stopPropagation();

                const isChecked = checkboxWrapper.classList.contains('checked');
                checkboxWrapper.classList.toggle('checked', !isChecked); // Klasse setzen

                checkbox.src = isChecked
                    ? "./assets/icons-addTask/Property 1=Default.png"
                    : "./assets/icons-addTask/Property 1=checked.svg";

                updateSelectedAvatars();
            });

        });
    }

    // ---------- Dropdown toggle ----------
    function toggleDropdown(e) {
        e.stopPropagation();
        const isOpen = assignedDropdown.classList.contains('open');
        if (!isOpen) {
            assignedDropdown.classList.add('open');
            assignedDropdown.style.display = 'block';
            assignedInput.style.display = 'inline';
            assignedText.style.display = 'none';
            arrowIcon.src = '/assets/icons-addTask/arrow_drop_down_up.png';
            assignedInput.focus();

            // ✅ FIX: Checkboxen beim Öffnen zurücksetzen
            Array.from(assignedDropdown.children).forEach(div => {
                div.querySelector('.checkbox-wrapper').style.display = 'flex';
            });
        } else {
            assignedDropdown.classList.remove('open');
            assignedDropdown.style.display = 'none';
            assignedInput.style.display = 'none';
            assignedText.style.display = 'block';
            arrowIcon.src = '/assets/icons-addTask/arrow_drop_down.png';
            assignedInput.value = '';
        }
    }

    assignedTextContainer.addEventListener('click', toggleDropdown);
    arrowContainer.addEventListener('click', toggleDropdown);

    // ---------- Klick außerhalb schließt Dropdown ----------
    // ---------- Klick außerhalb schließt Dropdown ----------
    document.addEventListener('click', e => {
        if (!assignedTextContainer.contains(e.target) && !arrowContainer.contains(e.target)) {
            assignedDropdown.classList.remove('open');
            assignedDropdown.style.display = 'none';
            assignedInput.style.display = 'none';
            assignedText.style.display = 'block';
            arrowIcon.src = '/assets/icons-addTask/arrow_drop_down.png';

            // Checkboxen beibehalten, wenn gesetzt
            Array.from(assignedDropdown.children).forEach(div => {
                const checkboxWrapper = div.querySelector('.checkbox-wrapper');
                const checkbox = checkboxWrapper.querySelector('img');

                if (checkbox.src.includes('checked')) {
                    checkboxWrapper.style.display = 'flex'; // bleibt sichtbar
                } else {
                    checkboxWrapper.style.display = 'none'; // ungesetzte Checkbox ausblenden
                }
            });
        }
    });

    // ---------- Filter input ----------
    assignedInput.addEventListener('input', () => {
        const filter = assignedInput.value.toLowerCase();
        Array.from(assignedDropdown.children).forEach(div => {
            const name = div.querySelector('span').textContent.toLowerCase();
            div.style.display = name.includes(filter) ? 'flex' : 'none';
        });
    });

    await loadUsers();
});


// ===================== CATEGORY ===================== 
const categoryContent = document.querySelector('.category-content');
const categoryText = categoryContent.querySelector('.assigned-text');
const categoryArrow = categoryContent.querySelector('.assigned-arrow-icon');

const categoryDropdown = document.createElement('div');
categoryDropdown.className = 'dropdown-menu';

categories.forEach(cat => {
    const div = document.createElement('div');
    div.className = 'dropdown-item';
    div.textContent = cat;
    div.addEventListener('click', (e) => {
        e.stopPropagation();
        categoryText.textContent = cat;
        categoryDropdown.classList.remove('show');
        categoryArrow.style.transform = 'rotate(0deg)'; // Pfeil zurücksetzen
    });
    categoryDropdown.appendChild(div);
});

categoryContent.appendChild(categoryDropdown);

// Dropdown & Pfeil Toggle
// Dropdown & Pfeil Toggle
categoryContent.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = categoryDropdown.classList.contains('show');
    categoryDropdown.classList.toggle('show', !isOpen); // ✅ Toggle über Klasse
    categoryArrow.src = !isOpen
        ? '/assets/icons-addTask/arrow_drop_down_up.png'
        : '/assets/icons-addTask/arrow_drop_down.png';
});

// Klick außerhalb schließt Dropdown
document.addEventListener('click', (e) => {
    if (!categoryContent.contains(e.target)) {
        categoryDropdown.classList.remove('show'); // ✅ nur über Klasse
        categoryArrow.src = '/assets/icons-addTask/arrow_drop_down.png';
    }
});


// ===================== SUBTASK DROPDOWN ===================== 
// // ===================== SUBTASK DROPDOWN ===================== 
const taskInput = document.querySelector("#subtask-text");
const plusBtn = document.querySelector("#plus-btn");
const checkBtn = document.querySelector("#check-btn");
const cancelBtn = document.querySelector("#cancel-btn");
const subtaskList = document.querySelector("#subtask-list");

taskInput.addEventListener("input", () => {
    if (taskInput.value.trim() !== "") {
        checkBtn.style.display = "inline";
        cancelBtn.style.display = "inline"; plusBtn.style.display = "none";
    } else { resetInput(); }
});
plusBtn.addEventListener("click", () => { taskInput.focus(); });
checkBtn.addEventListener("click", () => {
    const currentTask = taskInput.value.trim();
    if (!currentTask)
        return;
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = currentTask;
    li.appendChild(span);
    const icons = document.createElement("div");
    icons.classList.add("subtask-icons");
    const editIcon = document.createElement("img");
    editIcon.src = "./assets/icons-addTask/Property 1=edit.png";
    editIcon.alt = "Edit";
    editIcon.addEventListener("click", () => { startEditMode(li, span); });
    const deleteIcon = document.createElement("img");
    deleteIcon.src = "./assets/icons-addTask/Property 1=delete.png";
    deleteIcon.alt = "Delete";
    deleteIcon.addEventListener("click", () => { subtaskList.removeChild(li); });
    icons.appendChild(editIcon);
    icons.appendChild(deleteIcon);
    li.appendChild(icons);
    subtaskList.appendChild(li);
    resetInput();
});
cancelBtn.addEventListener("click", resetInput);
function resetInput() { taskInput.value = ""; checkBtn.style.display = "none"; cancelBtn.style.display = "none"; plusBtn.style.display = "inline"; }
function startEditMode(li, span) {
    const input = document.createElement("input"); input.type = "text"; input.value = span.textContent; input.classList.add("subtask-edit-input"); const saveIcon = document.createElement("img"); saveIcon.src = "./assets/icons-addTask/Subtask's icons (1).png";
    saveIcon.alt = "Save"; saveIcon.addEventListener("click", () => { span.textContent = input.value.trim() || span.textContent; li.replaceChild(span, input); li.replaceChild(defaultIcons, actionIcons); }); const deleteIcon = document.createElement("img"); deleteIcon.src = "./assets/icons-addTask/Property 1=delete.png"; deleteIcon.alt = "Delete"; deleteIcon.addEventListener("click", () => { subtaskList.removeChild(li); }); const actionIcons = document.createElement("div"); actionIcons.classList.add("subtask-icons"); actionIcons.appendChild(saveIcon); actionIcons.appendChild(deleteIcon); const defaultIcons = li.querySelector(".subtask-icons"); li.replaceChild(input, span); li.replaceChild(actionIcons, defaultIcons); input.focus();
}


// ----------------------------
// Funktion: Task-Daten auslesen
// ----------------------------
function getTaskData() {
    // 1. Überschrift
    const titleInput = document.querySelector(".title-input");
    const title = titleInput.value.trim();

    // 2. Description
    const descriptionInput = document.querySelector(".description-input");
    const description = descriptionInput.value.trim();

    // 3. Due Date
    const dueDateInput = document.querySelector(".due-date-input");
    let dueDate = dueDateInput.value; // yyyy-mm-dd
    if (dueDate) {
        const [year, month, day] = dueDate.split("-");
        dueDate = `${day}.${month}.${year}`;
    }

    // 4. Priority
    const priorityBtn = document.querySelector(".priority-frame.active");
    const priority = priorityBtn ? priorityBtn.textContent.trim() : null;

    // 5. Assigned to
    const assignedAvatars = document.querySelectorAll(".selected-avatars-container .assigned-text");
    const assignedTo = Array.from(assignedAvatars).map(el => el.textContent.trim());

    // 6. Category
    const categoryText = document.querySelector(".category-content .assigned-text");
    const category = categoryText ? categoryText.textContent.trim() : null;

    // 7. Subtasks
    const subtaskItems = document.querySelectorAll("#subtask-list li");
    const subtasks = Array.from(subtaskItems).map(el => el.textContent.trim());

    return { title, description, dueDate, priority, assignedTo, category, subtasks };
}

//Task an Firebase senden
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

    // Remove existing listeners to prevent duplicates
    tasksEl.removeEventListener('dragover', handleDragOver);
    tasksEl.removeEventListener('dragenter', handleDragEnter);
    tasksEl.removeEventListener('dragleave', handleDragLeave);
    // Note: We can't remove the drop listener easily since it's bound with status

    // Add new listeners
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
    
    // Find the dragged card element
    const draggedCard = document.querySelector(`[data-task-id="${taskId}"]`);
    if (!draggedCard) return;
    
    if (window.taskManager) {
      // Update task status in backend
      await window.taskManager.updateTask(taskId, { status: newStatus });
      
      // Move the card visually without full re-render
      const newColumn = document.querySelector(`[data-status="${newStatus}"] .tasks`);
      if (newColumn && draggedCard.parentNode !== newColumn) {
        // Remove from old column
        draggedCard.parentNode.removeChild(draggedCard);
        
        // Add to new column
        newColumn.appendChild(draggedCard);
        
        // Update task data locally
        const tasks = window.taskManager.getTasks();
        const task = tasks.find(t => t.id == taskId);
        if (task) {
          task.status = newStatus;
        }
      }
    }
  } catch (error) {
    console.error('Error moving task:', error);
    alert('Failed to move task');
    // Fallback to full re-render on error
    await window.taskManager.loadTasks();
    renderBoard();
    setupDragAndDrop();
  }
}


