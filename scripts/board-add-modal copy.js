const assignedTextContainer = assignedContent.querySelector('.assigned-text-container');
const assignedText = assignedTextContainer.querySelector('.assigned-text');
const assignedInput = assignedContent.querySelector('.assigned-input');
const assignedDropdown = document.getElementById('assigned-dropdown');

const categoryContent = document.querySelector('.category-content');
const categoryText = categoryContent.querySelector('.assigned-text');
const categoryArrow = categoryContent.querySelector('.assigned-arrow-icon');

const taskInput = document.querySelector("#subtask-text");
const checkBtn = document.querySelector("#check-btn");
const cancelBtn = document.querySelector("#cancel-btn");
const subtaskList = document.querySelector("#subtask-list");

const addTaskModal = document.getElementById('add-task-modal');
const createBtn = document.getElementById('create-btn');
const addtaskButton = document.getElementById('add-task-btn');
const svgButtons = document.querySelectorAll('.svg-button');

const modalClose = document.getElementById('modal-close');
const closeButton = document.querySelector('.close');
const priorityButtons = document.querySelectorAll(".priority-frame");

const titleInput = document.querySelector(".title-input");
const titleError = document.querySelector(".error-message");

function openModal() {
    addTaskModal?.classList.remove('hidden');
    addtaskButton?.classList.add('active-style');
    currentNewTask = { assignedUsersFull: [] };
    
    svgButtons.forEach(btn => {
        const svg = btn.querySelector('svg');
        if (svg) svg.classList.add('disabled');
    });
}

closeButton?.addEventListener('click', closeModal);
addtaskButton?.addEventListener('click', openModal);
modalClose?.addEventListener('click', closeModal);

svgButtons.forEach(button => {
    button.addEventListener('click', () => {
        openModal(button);
    });
});

addTaskModal?.addEventListener('click', (e) => {
    if (e.target === addTaskModal) closeModal();
});

createBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    createBtn.classList.add('active');
    const taskData = getTaskData();
    let hasError = false;

    const titleInput = document.querySelector(".title-input");
    if (!taskData.title) {
        titleInput.style.borderBottom = "1px solid #FF4D4D";
        titleError.style.display = "block";
        hasError = true;
    } else {
        titleInput.style.borderBottom = "1px solid #D1D1D1";
        titleError.style.display = "none";
    }

    const dueDateContainer = document.querySelector(".due-date-content");
    const dueDateError = document.querySelector(".due-date-container .error-message");
    const dueDateValue = taskData.dueDate;
    if (!dueDateValue) {
        dueDateContainer.style.borderBottom = "1px solid #FF4D4D";
        dueDateError.style.display = "block";
        hasError = true;
    } else {
        dueDateContainer.style.borderBottom = "1px solid #D1D1D1";
        dueDateError.style.display = "none";
    }

    const categoryError = document.querySelector(".error-message");
    const categoryText = taskData.category;
    if (!categoryText || categoryText === "Select task category") {
        categoryContent.style.borderBottom = "1px solid #FF4D4D";
        categoryError.style.display = "block";
        hasError = true;
    } else {
        categoryContent.style.borderBottom = "1px solid #D1D1D1";
        categoryError.style.display = "none";
    }

    if (hasError) return;
    const originalText = createBtn.textContent;
    createBtn.textContent = "Saving...";
    createBtn.disabled = true;
    try {
        const newTask = await saveTask(taskData);
        if (newTask) {
            showTaskAddedMessage(() => {
                closeModal();
                renderBoard();
            });
            resetForm();
        }
    } catch (err) {
        console.error("Fehler beim Erstellen der Task:", err);
    } finally {
        createBtn.disabled = false;
        createBtn.textContent = originalText;
        createBtn.classList.remove('active');
    }
});

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
        categoryArrow.src = '/assets/icons-addtask/arrow_drop_down.png';
    });
    
    categoryDropdown.appendChild(div);
});

categoryContent.appendChild(categoryDropdown);

categoryContent.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = categoryDropdown.classList.contains('show');
    categoryDropdown.classList.toggle('show', !isOpen);
    categoryArrow.src = !isOpen
        ? '/assets/icons-addtask/arrow_drop_down_up.png'
        : '/assets/icons-addtask/arrow_drop_down.png';
});

document.addEventListener('click', (e) => {
    if (!categoryContent.contains(e.target)) {
        categoryDropdown.classList.remove('show');
        categoryArrow.src = '/assets/icons-addtask/arrow_drop_down.png';
    }
});

function getTaskData() {
    const titleInput = document.querySelector(".title-input");
    const title = titleInput.value.trim();
    const descriptionInput = document.querySelector(".description-input");
    const description = descriptionInput.value.trim();
    const dueDateInput = document.querySelector(".due-date-input");
    const dueDate = dueDateInput.value;
    const priorityBtn = document.querySelector(".priority-frame.active");
    const priority = priorityBtn ? priorityBtn.textContent.trim().toLowerCase() : "medium";
    let assignedUsersFull = [];
    if (assignedDropdown) {
        assignedDropdown.querySelectorAll(".dropdown-item.active").forEach(div => {
            const userId = div.dataset.userId;
            const user = users.find(u => u.id === userId);
            if (user) {
                assignedUsersFull.push({
                    id: user.id,
                    name: user.name,
                    initials: user.initials,
                    color: user.color
                });
            }
        });
    }
    const categoryText = document.querySelector(".category-content .assigned-text");
    const category = categoryText ? categoryText.textContent.trim() : null;
    const subtaskInputs = document.querySelectorAll(".subtask-input");
    const subtasks = Array.from(subtaskInputs)
        .map(input => input.value.trim())
        .filter(title => title.length > 0)
        .map(title => ({ title, done: false }));
    return {
        title,
        description,
        dueDate,
        priority,
        assignedUsersFull,
        category,
        subtasks
    };
}

async function saveTask(taskData) {
    try {
        const newTask = await createTask({
            title: taskData.title,
            description: taskData.description,
            dueDate: taskData.dueDate,
            priority: taskData.priority,
            assignedUsersFull: taskData.assignedUsersFull,
            category: taskData.category,
            subtasks: taskData.subtasks
        });
        tasks.push(newTask);
        return newTask;
    } catch (error) {
        console.error("❌ Fehler beim Speichern:", error);
        throw error;
    }
}

function resetForm() {
    document.querySelector(".title-input").value = "";
    document.querySelector(".description-input").value = "";
    document.querySelector(".due-date-input").value = "";
    dueDateDisplay.textContent = "dd/mm/yyyy";
    dueDateDisplay.classList.remove("has-value");
    document.querySelector(".selected-avatars-container").innerHTML = "";
    document.querySelector("#subtask-list").innerHTML = "";
    document.querySelectorAll(".priority-frame").forEach(btn => btn.classList.remove("active"));
    document.querySelector(".priority-frame:nth-child(2)").classList.add("active");
    const categoryText = document.querySelector(".category-content .assigned-text");
    if (categoryText) categoryText.textContent = "Select task category";
}

function showTaskAddedMessage(onFinished) {
    const img = document.createElement("img");
    img.src = "./assets/icons-addtask/Added to board 1.png";
    img.alt = "Task added to Board";
    Object.assign(img.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: "9999",
        boxShadow: "0px 0px 4px 0px #00000029",
        transition: "transform 150ms ease-out, opacity 150ms ease-out",
        opacity: "0",
        pointerEvents: "none",
    });
    document.body.appendChild(img);
    requestAnimationFrame(() => {
        img.style.opacity = "1";
        img.style.transform = "translate(-50%, -50%)";
    });
    setTimeout(() => {
        img.style.transform = "translate(-150%, -50%)";
        img.style.opacity = "0";
        img.addEventListener("transitionend", () => {
            img.remove();
            if (typeof onFinished === "function") {
                onFinished();
            }
        });
    }, 800);
}

function toggleDropdown(e) {
    e.stopPropagation();
    const isOpen = assignedDropdown.classList.contains('open');
    if (!isOpen) {
        assignedDropdown.classList.add('open');
        assignedDropdown.style.display = 'block';
        assignedInput.style.display = 'inline';
        assignedText.style.display = 'none';
        arrowIcon.src = '/assets/icons-addtask/arrow_drop_down_up.png';
        assignedInput.focus();

        Array.from(assignedDropdown.children).forEach(div => {
            div.querySelector('.checkbox-wrapper').style.display = 'flex';
        });
    } else {
        assignedDropdown.classList.remove('open');
        assignedDropdown.style.display = 'none';
        assignedInput.style.display = 'none';
        assignedText.style.display = 'block';
        arrowIcon.src = '/assets/icons-addtask/arrow_drop_down.png';
        assignedInput.value = '';
    }
}

assignedTextContainer.addEventListener('click', toggleDropdown);
arrowContainer.addEventListener('click', toggleDropdown);

document.addEventListener('click', e => {
    if (!assignedTextContainer.contains(e.target) && !arrowContainer.contains(e.target)) {
        assignedDropdown.classList.remove('open');
        assignedDropdown.style.display = 'none';
        assignedInput.style.display = 'none';
        assignedText.style.display = 'block';
        arrowIcon.src = '/assets/icons-addtask/arrow_drop_down.png';

        Array.from(assignedDropdown.children).forEach(div => {
            const checkboxWrapper = div.querySelector('.checkbox-wrapper');
            if (!checkboxWrapper) return;

            const checkbox = checkboxWrapper.querySelector('img');
            if (!checkbox) return;

            if (checkbox.src.includes('checked')) {
                checkboxWrapper.style.display = 'flex';
            } else {
                checkboxWrapper.style.display = 'none';
            }
        });
    }
});

taskInput.addEventListener("input", () => {
    if (taskInput.value.trim() !== "") {
        checkBtn.style.display = "inline";
        cancelBtn.style.display = "inline";
    } else { resetInput(); }
});

function startEditMode(li, span) {
    const input = document.createElement("input"); input.type = "text"; input.value = span.textContent; input.classList.add("subtask-edit-input"); const saveIcon = document.createElement("img"); saveIcon.src = "./assets/icons-addtask/Subtask's icons (1).png";
    saveIcon.alt = "Save"; saveIcon.addEventListener("click", () => { span.textContent = input.value.trim() || span.textContent; li.replaceChild(span, input); li.replaceChild(defaultIcons, actionIcons); }); const deleteIcon = document.createElement("img"); deleteIcon.src = "./assets/icons-addtask/Property 1=delete.png"; deleteIcon.alt = "Delete"; deleteIcon.addEventListener("click", () => { subtaskList.removeChild(li); }); const actionIcons = document.createElement("div"); actionIcons.classList.add("subtask-icons"); actionIcons.appendChild(saveIcon); actionIcons.appendChild(deleteIcon); const defaultIcons = li.querySelector(".subtask-icons"); li.replaceChild(input, span); li.replaceChild(actionIcons, defaultIcons); input.focus();
}

function resetInput() { 
    taskInput.value = ""; 
    checkBtn.style.display = "none"; 
    cancelBtn.style.display = "none"; 
}

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
    editIcon.src = "./assets/icons-addtask/Property 1=edit.png";
    editIcon.alt = "Edit";
    editIcon.addEventListener("click", () => { startEditMode(li, span); });
    const deleteIcon = document.createElement("img");
    deleteIcon.src = "./assets/icons-addtask/Property 1=delete.png";
    deleteIcon.alt = "Delete";
    deleteIcon.addEventListener("click", () => { subtaskList.removeChild(li); });
    icons.appendChild(editIcon);
    icons.appendChild(deleteIcon);
    li.appendChild(icons);
    subtaskList.appendChild(li);
    resetInput();
});

cancelBtn.addEventListener("click", resetInput);

function closeModal() {
    addTaskModal?.classList.add('hidden');
    createBtn?.classList.remove('active');
    addtaskButton?.classList.remove('active-style');
    svgButtons.forEach(btn => {
        const svg = btn.querySelector('svg');
        if (svg) svg.classList.remove('disabled');
    });
}

assignedInput.addEventListener('input', () => {
    const filter = assignedInput.value.toLowerCase();
    Array.from(assignedDropdown.children).forEach(div => {
        const name = div.querySelector('span').textContent.toLowerCase();
        div.style.display = name.includes(filter) ? 'flex' : 'none';
    });
});

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
})

priorityButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        priorityButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});