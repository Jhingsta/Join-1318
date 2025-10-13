// ===================== DOM ELEMENTE =====================
// Werden bei DOMContentLoaded initialisiert
let assignedContent;
let assignedTextContainer;
let assignedText;
let assignedInput;
let assignedDropdown;
let arrowContainer;
let arrowIcon;

let categoryContent;
let categoryText;
let categoryArrow;
let categoryDropdown;

let taskInput;
let checkBtn;
let cancelBtn;
let subtaskList;

let addTaskModal;
let createBtn;
let addtaskButton;
let svgButtons;
let modalClose;
let closeButton;
let priorityButtons;

let titleInput;
let titleError;

let dueDateInput;
let dueDateDisplay;
let dueDateContainer;

// ===================== MODAL ÖFFNEN/SCHLIEßEN =====================

function openModal() {
    addTaskModal?.classList.remove('hidden');
    addtaskButton?.classList.add('active-style');
    currentNewTask = { assignedUsersFull: [] };
    
    svgButtons.forEach(btn => {
        const svg = btn.querySelector('svg');
        if (svg) svg.classList.add('disabled');
    });
}

function closeModal() {
    addTaskModal?.classList.add('hidden');
    createBtn?.classList.remove('active');
    addtaskButton?.classList.remove('active-style');
    svgButtons.forEach(btn => {
        const svg = btn.querySelector('svg');
        if (svg) svg.classList.remove('disabled');
    });
}

// ===================== DROPDOWN TOGGLE (ASSIGNED USERS) =====================

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
            const checkboxWrapper = div.querySelector('.checkbox-wrapper');
            if (checkboxWrapper) checkboxWrapper.style.display = 'flex';
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

// ===================== TASK DATA & SAVE =====================

function getTaskData() {
    const title = titleInput.value.trim();
    const descriptionInput = document.getElementById('add-description-input');
    const description = descriptionInput ? descriptionInput.value.trim() : '';
    const dueDate = dueDateInput.value;
    
    const priorityBtn = document.querySelector("#add-priority-buttons .priority-frame.active");
    const priority = priorityBtn ? priorityBtn.dataset.priority : "medium";
    
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
    
    const categoryTextEl = document.getElementById('add-category-text');
    const category = categoryTextEl ? categoryTextEl.textContent.trim() : null;
    
    const subtaskInputs = subtaskList.querySelectorAll("li span.subtask-text");
    const subtaskItems = Array.from(subtaskInputs)
        .map(span => span.textContent.trim())
        .filter(title => title.length > 0)
        .map(title => ({ title, done: false }));

    const subtasks = {
        total: subtaskItems.length,
        completed: 0,
        items: subtaskItems
    };
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

// ===================== FORM RESET =====================

function resetForm() {
    titleInput.value = "";
    const descInput = document.getElementById('add-description-input');
    if (descInput) descInput.value = "";
    dueDateInput.value = "";
    dueDateDisplay.textContent = "dd/mm/yyyy";
    dueDateDisplay.classList.remove("has-value");
    
    const avatarsContainer = document.getElementById('add-selected-avatars-container');
    if (avatarsContainer) avatarsContainer.innerHTML = "";
    
    subtaskList.innerHTML = "";
    
    priorityButtons.forEach(btn => btn.classList.remove("active"));
    const mediumBtn = document.querySelector("#add-priority-buttons .priority-frame[data-priority='medium']");
    if (mediumBtn) mediumBtn.classList.add("active");
    
    const categoryTextEl = document.getElementById('add-category-text');
    if (categoryTextEl) categoryTextEl.textContent = "Select task category";
    
    // Assigned dropdown zurücksetzen
    if (assignedDropdown) {
        assignedDropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.classList.remove('active');
            const checkboxWrapper = item.querySelector('.checkbox-wrapper');
            if (checkboxWrapper) {
                checkboxWrapper.classList.remove('checked');
                const checkbox = item.querySelector('img');
                if (checkbox) {
                    checkbox.src = "./assets/icons-addTask/Property 1=Default.png";
                }
            }
        });
    }
}

// ===================== SUCCESS MESSAGE =====================

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

// ===================== SUBTASK FUNKTIONEN =====================

function resetInput() { 
    taskInput.value = ""; 
    checkBtn.style.display = "none"; 
    cancelBtn.style.display = "none"; 
}

function startEditMode(li, span) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = span.textContent;
    input.classList.add("subtask-edit-input");
    
    const saveIcon = document.createElement("img");
    saveIcon.src = "./assets/icons-addtask/Subtask's icons (1).png";
    saveIcon.alt = "Save";
    
    const cancelIcon = document.createElement("img");
    cancelIcon.src = "./assets/icons-addtask/Subtask cancel.png";
    cancelIcon.alt = "Cancel";
    
    const actionIcons = document.createElement("div");
    actionIcons.classList.add("subtask-icons");
    actionIcons.appendChild(saveIcon);
    actionIcons.appendChild(cancelIcon);
    
    const defaultIcons = li.querySelector(".subtask-icons");
    
    saveIcon.addEventListener("click", () => {
        const newText = input.value.trim();
        if (newText) {
            span.textContent = newText;
        }
        li.replaceChild(span, input);
        li.replaceChild(defaultIcons, actionIcons);
    });
    
    cancelIcon.addEventListener("click", () => {
        li.replaceChild(span, input);
        li.replaceChild(defaultIcons, actionIcons);
    });
    
    li.replaceChild(input, span);
    li.replaceChild(actionIcons, defaultIcons);
    input.focus();
}

// ===================== INITIALISIERUNG =====================

document.addEventListener('DOMContentLoaded', () => {
    // DOM-Elemente initialisieren
    assignedContent = document.getElementById('add-assigned-dropdown-container');
    assignedTextContainer = document.getElementById('add-assigned-text-container');
    assignedText = document.getElementById('add-assigned-text');
    assignedInput = document.getElementById('add-assigned-input');
    assignedDropdown = document.getElementById('add-assigned-dropdown');
    arrowContainer = document.getElementById('add-assigned-arrow-container');
    arrowIcon = document.getElementById('add-assigned-arrow');
    
    categoryContent = document.getElementById('add-category-dropdown-container');
    categoryText = document.getElementById('add-category-text');
    categoryArrow = document.getElementById('add-category-arrow');
    
    taskInput = document.getElementById('add-subtask-input');
    checkBtn = document.getElementById('add-subtask-check');
    cancelBtn = document.getElementById('add-subtask-cancel');
    subtaskList = document.getElementById('add-subtask-list');
    
    addTaskModal = document.getElementById('add-task-modal');
    createBtn = document.getElementById('add-create-btn');
    addtaskButton = document.getElementById('add-task-btn');
    svgButtons = document.querySelectorAll('.svg-button');
    modalClose = document.getElementById('modal-close');
    closeButton = document.getElementById('add-modal-close');
    priorityButtons = document.querySelectorAll('#add-priority-buttons .priority-frame');
    
    titleInput = document.getElementById('add-title-input');
    titleError = document.getElementById('add-title-error');
    
    dueDateInput = document.getElementById('add-due-date-input');
    dueDateDisplay = document.getElementById('add-due-date-display');
    dueDateContainer = document.getElementById('add-due-date-content');
    
    // ===================== EVENT LISTENERS - MODAL =====================
    
    closeButton?.addEventListener('click', closeModal);
    addtaskButton?.addEventListener('click', openModal);
    modalClose?.addEventListener('click', closeModal);
    
    svgButtons.forEach(button => {
        button.addEventListener('click', openModal);
    });
    
    addTaskModal?.addEventListener('click', (e) => {
        if (e.target === addTaskModal) closeModal();
    });
    
    // ===================== EVENT LISTENERS - ASSIGNED DROPDOWN =====================
    
    assignedTextContainer?.addEventListener('click', toggleDropdown);
    arrowContainer?.addEventListener('click', toggleDropdown);
    
    document.addEventListener('click', (e) => {
        if (!assignedTextContainer?.contains(e.target) && !arrowContainer?.contains(e.target)) {
            assignedDropdown?.classList.remove('open');
            if (assignedDropdown) assignedDropdown.style.display = 'none';
            if (assignedInput) {
                assignedInput.style.display = 'none';
                assignedInput.value = '';
            }
            if (assignedText) assignedText.style.display = 'block';
            if (arrowIcon) arrowIcon.src = '/assets/icons-addtask/arrow_drop_down.png';
            
            Array.from(assignedDropdown?.children || []).forEach(div => {
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
    
    assignedInput?.addEventListener('input', () => {
        const filter = assignedInput.value.toLowerCase();
        Array.from(assignedDropdown?.children || []).forEach(div => {
            const nameEl = div.querySelector('span');
            if (nameEl) {
                const name = nameEl.textContent.toLowerCase();
                div.style.display = name.includes(filter) ? 'flex' : 'none';
            }
        });
    });
    
    // ===================== EVENT LISTENERS - CATEGORY DROPDOWN =====================
    
    categoryDropdown = document.createElement('div');
    categoryDropdown.className = 'dropdown-menu';
    
    categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        div.textContent = cat;
        
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            if (categoryText) categoryText.textContent = cat;
            categoryDropdown.classList.remove('show');
            if (categoryArrow) categoryArrow.src = '/assets/icons-addtask/arrow_drop_down.png';
        });
        
        categoryDropdown.appendChild(div);
    });
    
    categoryContent?.appendChild(categoryDropdown);
    
    categoryContent?.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = categoryDropdown.classList.contains('show');
        categoryDropdown.classList.toggle('show', !isOpen);
        if (categoryArrow) {
            categoryArrow.src = !isOpen
                ? '/assets/icons-addtask/arrow_drop_down_up.png'
                : '/assets/icons-addtask/arrow_drop_down.png';
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!categoryContent?.contains(e.target)) {
            categoryDropdown?.classList.remove('show');
            if (categoryArrow) categoryArrow.src = '/assets/icons-addtask/arrow_drop_down.png';
        }
    });
    
    // ===================== EVENT LISTENERS - TITLE VALIDATION =====================
    
    titleInput?.addEventListener("blur", () => {
        if (!titleInput.value.trim()) {
            titleInput.style.borderBottom = "1px solid #FF4D4D";
            if (titleError) titleError.style.display = "block";
        } else {
            titleInput.style.borderBottom = "1px solid #D1D1D1";
            if (titleError) titleError.style.display = "none";
        }
    });
    
    titleInput?.addEventListener("input", () => {
        if (titleInput.value.trim()) {
            titleInput.style.borderBottom = "1px solid #005DFF";
            if (titleError) titleError.style.display = "none";
        }
    });
    
    // ===================== EVENT LISTENERS - PRIORITY BUTTONS =====================
    
    priorityButtons?.forEach((btn) => {
        btn.addEventListener("click", () => {
            priorityButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });
    
    // ===================== EVENT LISTENERS - DUE DATE =====================
    
    dueDateInput?.addEventListener("change", updateDisplay);
    dueDateContainer?.addEventListener("click", openDatepicker);
    
    dueDateInput?.addEventListener("blur", () => {
        const dueDateError = document.getElementById('add-due-date-error');
        if (!dueDateInput.value.trim()) {
            if (dueDateContainer) dueDateContainer.style.borderBottom = "1px solid #FF4D4D";
            if (dueDateError) dueDateError.style.display = "block";
        } else {
            if (dueDateContainer) dueDateContainer.style.borderBottom = "1px solid #D1D1D1";
            if (dueDateError) dueDateError.style.display = "none";
        }
    });
    
    // ===================== EVENT LISTENERS - SUBTASKS =====================
    
    taskInput?.addEventListener("input", () => {
        if (taskInput.value.trim() !== "") {
            if (checkBtn) checkBtn.style.display = "inline";
            if (cancelBtn) cancelBtn.style.display = "inline";
        } else {
            resetInput();
        }
    });
    
    checkBtn?.addEventListener("click", () => {
        const currentTask = taskInput.value.trim();
        if (!currentTask) return;
        
        const li = document.createElement("li");
        li.className = "subtask-item";
        
        const span = document.createElement("span");
        span.textContent = currentTask;
        span.className = "subtask-text";
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
    
    cancelBtn?.addEventListener("click", resetInput);
    
    // ===================== EVENT LISTENERS - CREATE BUTTON =====================
    
    createBtn?.addEventListener("click", async (event) => {
        event.preventDefault();
        createBtn.classList.add('active');
        
        const taskData = getTaskData();
        let hasError = false;
        
        // Title Validation
        if (!taskData.title) {
            titleInput.style.borderBottom = "1px solid #FF4D4D";
            if (titleError) titleError.style.display = "block";
            hasError = true;
        } else {
            titleInput.style.borderBottom = "1px solid #D1D1D1";
            if (titleError) titleError.style.display = "none";
        }
        
        // Due Date Validation
        const dueDateError = document.getElementById('add-due-date-error');
        if (!taskData.dueDate) {
            if (dueDateContainer) dueDateContainer.style.borderBottom = "1px solid #FF4D4D";
            if (dueDateError) dueDateError.style.display = "block";
            hasError = true;
        } else {
            if (dueDateContainer) dueDateContainer.style.borderBottom = "1px solid #D1D1D1";
            if (dueDateError) dueDateError.style.display = "none";
        }
        
        // Category Validation
        const categoryError = document.getElementById('add-category-error');
        if (!taskData.category || taskData.category === "Select task category") {
            if (categoryContent) categoryContent.style.borderBottom = "1px solid #FF4D4D";
            if (categoryError) categoryError.style.display = "block";
            hasError = true;
        } else {
            if (categoryContent) categoryContent.style.borderBottom = "1px solid #D1D1D1";
            if (categoryError) categoryError.style.display = "none";
        }
        
        if (hasError) {
            createBtn.classList.remove('active');
            return;
        }
        
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
});