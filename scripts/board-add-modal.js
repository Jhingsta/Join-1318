const assignedTextContainer = assignedContent.querySelector('.assigned-text-container');
const assignedText = assignedTextContainer.querySelector('.assigned-text');
const assignedInput = assignedContent.querySelector('.assigned-input');
const assignedDropdown = document.getElementById('assigned-dropdown');
const assignedContent = document.querySelector('.assigned-content');

const categoryContent = document.querySelector('.category-content');
const categoryText = categoryContent.querySelector('.assigned-text');
const categoryArrow = categoryContent.querySelector('.assigned-arrow-icon');

createBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    createBtn.classList.add('active');
    const taskData = getTaskData();
    let hasError = false;

    // --- TITLE ---
    const titleInput = document.querySelector(".title-input");
    if (!taskData.title) {
        titleInput.style.borderBottom = "1px solid #FF4D4D";
        titleError.style.display = "block";
        hasError = true;
    } else {
        titleInput.style.borderBottom = "1px solid #D1D1D1";
        titleError.style.display = "none";
    }

    // --- DUE DATE ---
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

    // --- CATEGORY ---
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

    // Stoppen, wenn Fehler
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

// ===================== CATEGORY DROPDOWN =====================
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

// Dropdown & Pfeil Toggle
categoryContent.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = categoryDropdown.classList.contains('show');
    categoryDropdown.classList.toggle('show', !isOpen);
    categoryArrow.src = !isOpen
        ? '/assets/icons-addtask/arrow_drop_down_up.png'
        : '/assets/icons-addtask/arrow_drop_down.png';
});

// Klick außerhalb schließt Dropdown
document.addEventListener('click', (e) => {
    if (!categoryContent.contains(e.target)) {
        categoryDropdown.classList.remove('show');
        categoryArrow.src = '/assets/icons-addtask/arrow_drop_down.png';
    }
});

// --- Task-Daten sammeln ---
function getTaskData() {
    // 1. Titel
    const titleInput = document.querySelector(".title-input");
    const title = titleInput.value.trim();
    // 2. Beschreibung
    const descriptionInput = document.querySelector(".description-input");
    const description = descriptionInput.value.trim();
    // 3. Due Date
    const dueDateInput = document.querySelector(".due-date-input");
    const dueDate = dueDateInput.value;
    // 4. Priority
    const priorityBtn = document.querySelector(".priority-frame.active");
    const priority = priorityBtn ? priorityBtn.textContent.trim().toLowerCase() : "medium";
    // 5. Assigned Users Full
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
    // 6. Kategorie
    const categoryText = document.querySelector(".category-content .assigned-text");
    const category = categoryText ? categoryText.textContent.trim() : null;
    // 7. Subtasks (Objekte statt Strings)
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

        // Hier prüfen
        Array.from(assignedDropdown.children).forEach(div => {
            const checkboxWrapper = div.querySelector('.checkbox-wrapper');
            if (!checkboxWrapper) return; // <- überspringen, falls nicht vorhanden

            const checkbox = checkboxWrapper.querySelector('img');
            if (!checkbox) return; // <- optional, Sicherheit

            if (checkbox.src.includes('checked')) {
                checkboxWrapper.style.display = 'flex'; // bleibt sichtbar
            } else {
                checkboxWrapper.style.display = 'none'; // ungesetzte Checkbox ausblenden
            }
        });
    }
});