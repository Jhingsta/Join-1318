// ===================== DOM ELEMENTS =====================

let assignedContent, assignedTextContainer, assignedText, assignedInput, assignedDropdown, arrowContainer, arrowIcon;
let categoryContent, categoryText, categoryArrow, categoryDropdown;
let addTaskModal, createBtn, addtaskButton, svgButtons, modalClose, closeButton, priorityButtons;
let titleInput, titleError, dueDateInput, dueDateDisplay, dueDateContainer;

// ===================== MODAL HANDLING =====================

/**
 * Opens the add-task modal and initializes SVG buttons.
 */
function openModal() {
    addTaskModal?.classList.remove('hidden');
    addtaskButton?.classList.add('active-style');
    currentNewTask = currentNewTask || { assignedUsersFull: [] };
    svgButtons.forEach(btn => btn.querySelector('svg')?.classList.add('disabled'));
}

/**
 * Closes the add-task modal and resets SVG buttons.
 */
function closeModal() {
    addTaskModal?.classList.add('hidden');
    createBtn?.classList.remove('active');
    addtaskButton?.classList.remove('active-style');
    svgButtons.forEach(btn => btn.querySelector('svg')?.classList.remove('disabled'));
}

// ===================== DROPDOWN HANDLING =====================

/**
 * Toggles the assigned users dropdown.
 * 
 * @param {Event} e - The click event.
 */
function toggleDropdown(e) {
    e.stopPropagation();
    let isOpen = assignedDropdown.classList.contains('open');

    if (!isOpen) openAssignedDropdown();
    else closeAssignedDropdown();
}

/** 
 * Opens the assigned dropdown. 
 */
function openAssignedDropdown() {
    assignedDropdown.classList.add('open');
    assignedDropdown.style.display = 'block';
    assignedInput.style.display = 'inline';
    assignedText.style.display = 'none';
    assignedTextContainer.style.display = 'none';
    arrowIcon.src = '/assets/icons-addtask/arrow_drop_down_up.png';
    assignedInput.focus();

    Array.from(assignedDropdown.children).forEach(div => {
        let checkboxWrapper = div.querySelector('.checkbox-wrapper');
        if (checkboxWrapper) checkboxWrapper.style.display = 'flex';
    });
}

/** 
 * Closes the assigned dropdown. 
 */
function closeAssignedDropdown() {
    assignedDropdown.classList.remove('open');
    assignedDropdown.style.display = 'none';
    assignedInput.style.display = 'none';
    assignedText.style.display = 'block';
    assignedTextContainer.style.display = 'flex';
    arrowIcon.src = '/assets/icons-addtask/arrow_drop_down.png';
    assignedInput.value = '';

    Array.from(assignedDropdown.children).forEach(div => {
        div.style.display = 'flex';
    });
}

// ===================== SUCCESS MESSAGE =====================

/**
 * Displays a temporary "Task Added" message with animation.
 * 
 * @param {Function} [onFinished] - Callback executed after animation ends.
 */
function showTaskAddedMessage(onFinished) {
    let img = createTaskAddedImage();
    document.body.appendChild(img);
    animateTaskAddedIn(img, () => animateTaskAddedOut(img, onFinished));
}

/**
 * Creates the image element for the "Task Added" message and applies styles.
 */
function createTaskAddedImage() {
    let img = document.createElement("img");
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
    return img;
}

/**
 * Animates the "Task Added" image into view.
 * 
 * @param {HTMLImageElement} img
 * @param {Function} onComplete - Called after fade-in is done to start fade-out.
 */
function animateTaskAddedIn(img, onComplete) {
    requestAnimationFrame(() => {
        img.style.opacity = "1";
        img.style.transform = "translate(-50%, -50%)";
    });
    setTimeout(onComplete, 800);
}

/**
 * Animates the "Task Added" image out of view and removes it from DOM.
 * 
 * @param {HTMLImageElement} img
 * @param {Function} [onFinished] - Callback executed after removal.
 */
function animateTaskAddedOut(img, onFinished) {
    img.style.transform = "translate(-150%, -50%)";
    img.style.opacity = "0";
    img.addEventListener("transitionend", () => {
        img.remove();
        if (typeof onFinished === "function") onFinished();
    });
}

// ===================== DOM ELEMENTS INITIALIZATION =====================

/**
 * Initializes all DOM elements by calling grouped initialization functions.
 */
function initDOMElements() {
    initModalElements();
    initDropdownElements();
    !initSubtaskElements();    
    initPriorityElements();
    initTitleAndDueDateElements();
}

/** 
 * Initializes modal-related elements. 
 */
function initModalElements() {
    addTaskModal = document.getElementById('add-task-modal');
    createBtn = document.getElementById('add-create-btn');
    addtaskButton = document.getElementById('add-task-btn');
    svgButtons = document.querySelectorAll('.svg-button');
    modalClose = document.getElementById('modal-close');
    closeButton = document.getElementById('add-modal-close');
}

/** 
 * Initializes modal open/close event listeners. 
 */
function initModalEventListeners() {
    closeButton?.addEventListener('click', closeModal);
    addtaskButton?.addEventListener('click', openModal);
    modalClose?.addEventListener('click', closeModal);
    svgButtons.forEach(btn => btn.addEventListener('click', openModal));
    addTaskModal?.addEventListener('click', e => { if (e.target === addTaskModal) closeModal(); });
}

/** 
 * Initializes dropdown elements for assigned users and category. 
 */
function initDropdownElements() {
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
}

/** 
 * Initializes priority buttons. 
 */
function initPriorityElements() {
    priorityButtons = document.querySelectorAll('#add-priority-buttons .priority-frame');
}

/** 
 * Initializes title and due date input elements. 
 */
function initTitleAndDueDateElements() {
    titleInput = document.getElementById('add-title-input');
    titleError = document.getElementById('add-title-error');
    dueDateInput = document.getElementById('add-due-date-input');
    const today = new Date().toISOString().split("T")[0];
    dueDateInput.setAttribute("min", today);
    dueDateDisplay = document.getElementById('add-due-date-display');
    dueDateContainer = document.getElementById('add-due-date-content');
}

// ===================== EVENT LISTENERS INITIALIZATION =====================

/**
 * Initializes all event listeners by calling grouped listener functions.
 */
function initEventListeners() {
    initModalEventListeners();
    initAssignedDropdownListeners();
    initCategoryDropdownListeners();
    initSubtaskListeners();
    initPriorityListeners();
    initValidationListeners();
    initCreateButtonListener();
}

/** 
 * Initializes assigned dropdown listeners. 
 */
function initAssignedDropdownListeners() {
    assignedTextContainer?.addEventListener('click', toggleDropdown);
    arrowContainer?.addEventListener('click', toggleDropdown);
    document.addEventListener('click', e => {
        if (
            !assignedTextContainer?.contains(e.target) &&
            !arrowContainer?.contains(e.target) &&
            !assignedDropdown?.contains(e.target)
        ) {
            closeAssignedDropdown();
        }
    });
    assignedInput?.addEventListener('input', () => {
        let filter = assignedInput.value.toLowerCase();
        Array.from(assignedDropdown?.children || []).forEach(div => {
            let nameEl = div.querySelector('span');
            if (nameEl) div.style.display = nameEl.textContent.toLowerCase().includes(filter) ? 'flex' : 'none';
        });
    });
}

/**
 * Initializes category dropdown listeners.
 */
function initCategoryDropdownListeners() {
    createCategoryDropdownItems();
    addCategoryDropdownClickListener();
    addDocumentClickListenerForCategory();
}

/**
 * Creates dropdown items for each category and appends them to the dropdown.
 */
function createCategoryDropdownItems() {
    categoryDropdown = document.createElement('div');
    categoryDropdown.className = 'dropdown-menu';

    categories.forEach(cat => {
        let div = document.createElement('div');
        div.className = 'dropdown-item';
        div.textContent = cat;
        div.addEventListener('click', e => {
            e.stopPropagation();
            if (categoryText) categoryText.textContent = cat;
            categoryDropdown.classList.remove('show');
            if (categoryArrow) categoryArrow.src = '/assets/icons-addtask/arrow_drop_down.png';
        });
        categoryDropdown.appendChild(div);
    });

    categoryContent?.appendChild(categoryDropdown);
}

/**
 * Adds click listener to the category container to toggle the dropdown.
 */
function addCategoryDropdownClickListener() {
    categoryContent?.addEventListener('click', e => {
        e.stopPropagation();
        let isOpen = categoryDropdown.classList.contains('show');
        categoryDropdown.classList.toggle('show', !isOpen);
        if (categoryArrow) categoryArrow.src = !isOpen ? '/assets/icons-addtask/arrow_drop_down_up.png' : '/assets/icons-addtask/arrow_drop_down.png';
    });
}

/**
 * Adds a global click listener to close the category dropdown when clicking outside.
 */
function addDocumentClickListenerForCategory() {
    document.addEventListener('click', e => {
        if (!categoryContent?.contains(e.target)) {
            categoryDropdown?.classList.remove('show');
            if (categoryArrow) categoryArrow.src = '/assets/icons-addtask/arrow_drop_down.png';
        }
    });
}

/** 
 * Initializes priority button listeners. 
 */
function initPriorityListeners() {
    priorityButtons?.forEach(btn => btn.addEventListener("click", () => {
        priorityButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    }));
}

/** 
 * Initializes the create button listener. 
 */
function initCreateButtonListener() {
    createBtn?.addEventListener("click", handleCreateTask);
}

/**
 * Handles the click event for the create button, validates, saves task, and shows message.
 * 
 * @param {Event} event - Click event
 */
async function handleCreateTask(event) {
    event.preventDefault();
    setCreateButtonActive(true);

    if (!validateForm()) return resetCreateButton();

    let taskData = getTaskData();
    prepareCreateButtonForSaving();

    try {
        let newTask = await saveTask(taskData);
        if (newTask) handleTaskSaved();
    } catch (err) {
        console.error("Error creating task:", err);
    } finally {
        resetCreateButton();
    }
}

/**
 * Sets the create button to active/inactive state.
 * 
 * @param {boolean} isActive
 */
function setCreateButtonActive(isActive) {
    if (isActive) createBtn.classList.add('active');
    else createBtn.classList.remove('active');
}

/**
 * Prepares the create button UI for saving (disable, show "Saving...").
 */
function prepareCreateButtonForSaving() {
    createBtn.disabled = true;
    createBtn.dataset.originalText = createBtn.textContent;
    createBtn.textContent = "Saving...";
}

/**
 * Handles the task after it has been successfully saved.
 */
function handleTaskSaved() {
    showTaskAddedMessage(() => {
        closeModal();
        renderBoard();
        resetForm();
    });
}

/**
 * Resets the create button to its original state.
 */
function resetCreateButton() {
    createBtn.disabled = false;
    createBtn.textContent = createBtn.dataset.originalText || "Create";
    setCreateButtonActive(false);
}

// --- CLEAR BUTTON HANDLING ---

const clearBtn = document.getElementById("add-clear-btn");
clearBtn?.addEventListener("click", resetForm);

initDOMElements();
initEventListeners();