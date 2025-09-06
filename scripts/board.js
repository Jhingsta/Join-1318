if (!window.taskManager.saveTasks) {
    window.taskManager.saveTasks = function (tasks) {
        // Beispiel: Speichern im LocalStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));
        // Wenn du Firebase nutzt, musst du hier ein Update an die Datenbank machen!
    };
}


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

        // Standardwerte zurücksetzen
        const priority = document.getElementById('task-priority');
        const status = document.getElementById('task-status');
        const done = document.getElementById('subtasks-done');
        const total = document.getElementById('subtasks-total');
        if (priority) priority.value = 'medium';
        if (status) status.value = 'todo';
        if (done) done.value = '0';
        if (total) total.value = '0';

        // Save Button zurücksetzen
        signUpBtn?.classList.remove('active');

        //Button-Styles zurücksetzen
        addTaskButton?.classList.remove('active-style');
    }

    // Save Button beim Klick aktiv machen
    signUpBtn?.addEventListener('click', () => {
        signUpBtn.classList.add('active');
    });

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
            closeModal(); // Hier wird auch der Save Button wieder zurückgesetzt
        } catch (err) {
            console.error(err);
            alert('Failed to save task');
        } finally {
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = false; // Text nicht zurücksetzen, closeModal kümmert sich drum
        }
    });
});

function closeModal() {
    const modal = document.getElementById('add-task-modal');
    const form = document.getElementById('add-task-form');

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

document.addEventListener('DOMContentLoaded', () => {
    const svgButtons = document.querySelectorAll('.svg-button'); // alle Buttons
    const modal = document.getElementById('add-task-modal');
    const modalClose = document.getElementById('close');

    function openModal(button) {
        modal?.classList.remove('hidden');
        const svg = button.querySelector('svg'); // SVG vom geklickten Button
        if (svg) {
            svg.classList.add('disabled');
            console.log("Modal geöffnet - SVG deaktiviert");
        }
    }

    function closeModal() {
        modal?.classList.add('hidden');
        console.log("Modal geschlossen");

        // alle SVGs wieder freischalten
        svgButtons.forEach(btn => {
            const svg = btn.querySelector('svg');
            if (svg) svg.classList.remove('disabled');
        });
    }

    // jedem Button einen eigenen Klick-Handler geben
    svgButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('SVG Button geklickt!');
            openModal(button);
        });
    });

    // Schließen über "X" oder Klick außerhalb
    if (modalClose) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target === modalClose) {
                closeModal();
            }
        });
    }
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

// function createTaskCard(task) {
//     const card = document.createElement('div');
//     card.className = 'task-card';

//     const type = document.createElement('div');
//     type.className = 'task-type';

//     const typeImg = document.createElement('img');
//     if (task.category === "User Story") {
//         typeImg.src = './assets/icons-board/user-story-tag.svg';
//         typeImg.alt = 'User Story';
//     } else if (task.category === "Technical Task") {
//         typeImg.src = './assets/icons-board/technical-task-tag.svg';
//         typeImg.alt = 'Technical Task';
//     }

//     type.appendChild(typeImg);

//     const content = document.createElement('div');
//     content.className = 'task-content';
//     const title = document.createElement('div');
//     title.className = 'title';
//     title.textContent = task.title || 'Untitled';
//     const info = document.createElement('div');
//     info.className = 'task-info';
//     info.textContent = task.description || '';
//     content.appendChild(title);
//     content.appendChild(info);

//     const subtasks = document.createElement('div');
//     subtasks.className = 'subtasks';
//     subtasks.style.display = 'flex';
//     subtasks.style.alignItems = 'center';
//     subtasks.style.gap = '8px'; // Abstand zwischen Leiste und Text

//     // Container für die Fortschrittsleiste
//     if (task.subtasks && (task.subtasks.total || task.subtasks.completed)) {
//         const progressContainer = document.createElement('div');
//         progressContainer.className = 'progress-container';
//         progressContainer.style.width = '128px';
//         progressContainer.style.height = '8px';
//         progressContainer.style.backgroundColor = '#E0E0E0';
//         progressContainer.style.borderRadius = '4px';
//         progressContainer.style.overflow = 'hidden';

//         // Fortschrittsfüllung
//         const completed = task.subtasks?.completed || 0;
//         const total = task.subtasks?.total || 0;
//         const progressFill = document.createElement('div');
//         const percentage = total > 0 ? (completed / total) * 100 : 0;
//         progressFill.style.width = `${percentage}%`;
//         progressFill.style.height = '100%';
//         progressFill.style.backgroundColor = '#635FC7'; // z.B. lila
//         progressFill.style.transition = 'width 0.3s ease';

//         progressContainer.appendChild(progressFill);

//         // Textanzeige
//         const progressText = document.createElement('span');
//         progressText.className = 'subtasks-text';
//         progressText.textContent = `${completed}/${total} Subtasks`;
//         progressText.style.fontSize = '13px';
//         progressText.style.color = '#000000'; // Farbe nach Bedarf

//         subtasks.appendChild(progressContainer);
//         subtasks.appendChild(progressText);
//     }

//     const assignedTo = document.createElement('div');
//     assignedTo.className = 'assigned-to';
//     assignedTo.style.display = 'flex';
//     assignedTo.style.alignItems = 'center';
//     assignedTo.style.gap = '8px'; // Abstand zwischen Avataren und Icon

//     // Container für Avatare
//     const avatarsContainer = document.createElement('div');
//     avatarsContainer.style.display = 'flex';
//     avatarsContainer.style.gap = '4px'; // Abstand zwischen den einzelnen Avataren

//     // Avatare der ausgewählten Nutzer
//     if (task.users && task.users.length > 0) {
//         task.users.slice(0, 3).forEach(user => {
//             const avatarDiv = document.createElement('div');
//             avatarDiv.className = 'assigned-avatar';
//             avatarDiv.textContent = getInitials(user);
//             avatarDiv.style.backgroundColor = getColor(user);
//             avatarDiv.style.width = '28px';
//             avatarDiv.style.height = '28px';
//             avatarDiv.style.borderRadius = '50%';
//             avatarDiv.style.display = 'flex';
//             avatarDiv.style.alignItems = 'center';
//             avatarDiv.style.justifyContent = 'center';
//             avatarDiv.style.fontFamily = 'Inter';
//             avatarDiv.style.fontWeight = '400';
//             avatarDiv.style.fontStyle = 'normal'; // "Regular" entspricht normal
//             avatarDiv.style.fontSize = '12px';
//             avatarDiv.style.lineHeight = '120%';
//             avatarDiv.style.textAlign = 'center';
//             avatarDiv.style.verticalAlign = 'middle';
//             avatarDiv.style.color = '#FFFFFF';



//             avatarsContainer.appendChild(avatarDiv);
//         });
//     }

//     // Priority-Icon rechts
//     const prioImg = document.createElement('img');
//     prioImg.alt = 'Priority';
//     prioImg.src = priorityIcon(task.priority);
//     prioImg.style.marginLeft = 'auto'; // schiebt es ganz nach rechts

//     // Alles zusammenfügen
//     assignedTo.appendChild(avatarsContainer);
//     assignedTo.appendChild(prioImg);


//     card.appendChild(type);
//     card.appendChild(content);
//     card.appendChild(subtasks);
//     card.appendChild(assignedTo);

//     return card;
// }

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';

    const type = document.createElement('div');
    type.className = 'task-type';

    const typeImg = document.createElement('img');
    if (task.category === "User Story") {
        typeImg.src = './assets/icons-board/user-story-tag.svg';
        typeImg.alt = 'User Story';
    } else if (task.category === "Technical Task") {
        typeImg.src = './assets/icons-board/technical-task-tag.svg';
        typeImg.alt = 'Technical Task';
    }
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
    subtasks.style.display = 'flex';
    subtasks.style.alignItems = 'center';
    subtasks.style.gap = '8px';

    if (task.subtasks && (task.subtasks.total || task.subtasks.completed)) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.style.width = '128px';
        progressContainer.style.height = '8px';
        progressContainer.style.backgroundColor = '#E0E0E0';
        progressContainer.style.borderRadius = '4px';
        progressContainer.style.overflow = 'hidden';

        const completed = task.subtasks?.completed || 0;
        const total = task.subtasks?.total || 0;
        const progressFill = document.createElement('div');
        const percentage = total > 0 ? (completed / total) * 100 : 0;
        progressFill.style.width = `${percentage}%`;
        progressFill.style.height = '100%';
        progressFill.style.backgroundColor = '#635FC7';
        progressFill.style.transition = 'width 0.3s ease';

        progressContainer.appendChild(progressFill);

        const progressText = document.createElement('span');
        progressText.className = 'subtasks-text';
        progressText.textContent = `${completed}/${total} Subtasks`;
        progressText.style.fontSize = '13px';
        progressText.style.color = '#000000';

        subtasks.appendChild(progressContainer);
        subtasks.appendChild(progressText);
    }

    const assignedTo = document.createElement('div');
    assignedTo.className = 'assigned-to';
    assignedTo.style.display = 'flex';
    assignedTo.style.alignItems = 'center';
    assignedTo.style.gap = '8px';

    const avatarsContainer = document.createElement('div');
    avatarsContainer.style.display = 'flex';
    avatarsContainer.style.gap = '4px';

    if (task.users && task.users.length > 0) {
        task.users.slice(0, 3).forEach(user => {
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'assigned-avatar';
            avatarDiv.textContent = getInitials(user);
            avatarDiv.style.backgroundColor = getColor(user);
            avatarDiv.style.width = '28px';
            avatarDiv.style.height = '28px';
            avatarDiv.style.borderRadius = '50%';
            avatarDiv.style.display = 'flex';
            avatarDiv.style.alignItems = 'center';
            avatarDiv.style.justifyContent = 'center';
            avatarDiv.style.fontFamily = 'Inter';
            avatarDiv.style.fontWeight = '400';
            avatarDiv.style.fontSize = '12px';
            avatarDiv.style.color = '#FFFFFF';

            avatarsContainer.appendChild(avatarDiv);
        });
    }

    const prioImg = document.createElement('img');
    prioImg.alt = 'Priority';
    prioImg.src = priorityIcon(task.priority);
    prioImg.style.marginLeft = 'auto';

    assignedTo.appendChild(avatarsContainer);
    assignedTo.appendChild(prioImg);

    card.appendChild(type);
    card.appendChild(content);
    card.appendChild(subtasks);
    card.appendChild(assignedTo);

    // 🆕 Klick auf Karte → Overlay öffnen
    card.addEventListener("click", () => {
        openTaskDetails(task);
    });

    return card;
}


function priorityIcon(priority) {
    switch ((priority || 'medium').toLowerCase()) {
        case 'urgent':
            return './assets/icons-board/priority-urgent.svg';
        case 'medium':
            return './assets/icons-board/priority-medium.svg';
        case 'low':
            return './assets/icons-board/priority-low.svg';
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

    // // ---------- Helpers ----------
    // function getInitials(name) {
    //     if (!name) return "";
    //     return name.trim().split(" ").map(n => n[0].toUpperCase()).slice(0, 2).join("");
    // }

    // function getColor(name) {
    //     let hash = 0;
    //     for (let i = 0; i < name.length; i++) {
    //         hash = name.charCodeAt(i) + ((hash << 5) - hash);
    //     }
    //     return `hsl(${Math.abs(hash) % 360},70%,50%)`;
    // }

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
            a.dataset.fullname = u.name;         // NEU: vollständiger Name für Overlay
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

    // Bestehende Kürzel für andere Projektteile
    const assignedTo = Array.from(assignedAvatars).map(el => el.textContent.trim());

    // NEU: Vollständige Namen für Overlay
    const assignedUsersFull = Array.from(assignedAvatars).map(el => ({
        name: el.dataset.fullname || el.textContent.trim() // fallback, falls dataset nicht gesetzt ist
    }));

    // 6. Category
    const categoryText = document.querySelector(".category-content .assigned-text");
    const category = categoryText ? categoryText.textContent.trim() : null;

    // 7. Subtasks
    const subtaskItems = document.querySelectorAll("#subtask-list li");
    const subtasks = Array.from(subtaskItems).map(el => el.textContent.trim());

    return {
        title,
        description,
        dueDate,
        priority,
        assignedTo,        // Kürzel
        assignedUsersFull, // volle Namen
        category,
        subtasks
    };
}


//Task an Firebase senden

async function saveTaskToFirebase(taskData) {
    try {
        const response = await fetch("https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/tasks.json", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: taskData.title,
                description: taskData.description,
                dueDate: taskData.dueDate,
                priority: taskData.priority,
                status: "inProgress",
                createdAt: new Date().toISOString(),
                subtasks: {
                    total: taskData.subtasks.length,
                    completed: 0,
                    items: taskData.subtasks
                },
                users: taskData.assignedTo,
                usersFull: taskData.assignedUsersFull,
                category: taskData.category
            })
        });

        if (!response.ok) throw new Error("Fehler beim Speichern des Tasks");

        const data = await response.json();
        console.log("Task erfolgreich gespeichert:", data);
        return data;

    } catch (error) {
        console.error("Firebase Save Error:", error);
        alert("Fehler beim Speichern des Tasks!");
    }
}


//Create Task Button mit Firebase verbinden

const createTaskBtn = document.querySelector(".sign-up-btn");

createTaskBtn.addEventListener("click", async (event) => {
    event.preventDefault(); // verhindert das Standard-Submit

    // 1. Task-Daten auslesen
    const taskData = getTaskData();

    // 2. Pflichtfelder prüfen
    if (!taskData.title || !taskData.dueDate) {
        alert("Bitte fülle alle Pflichtfelder aus!");
        return;
    }

    console.log("Task-Daten vor dem Speichern:", taskData);

    // 3. Task an Firebase senden
    const result = await saveTaskToFirebase(taskData);

    if (result) {
        // Erfolgsmeldung anzeigen
        showTaskAddedMessage(() => {
            // Callback: erst schließen, wenn Meldung weg ist
            closeModal();
        });

        // Formular zurücksetzen (bleibt aber noch offen sichtbar!)
        document.querySelector(".title-input").value = "";
        document.querySelector(".description-input").value = "";
        document.querySelector(".due-date-input").value = "";
        document.querySelector(".selected-avatars-container").innerHTML = "";
        document.querySelector("#subtask-list").innerHTML = "";

        // Priority zurücksetzen auf Medium
        document.querySelectorAll(".priority-frame").forEach(btn => btn.classList.remove("active"));
        document.querySelector(".priority-frame:nth-child(2)").classList.add("active");

        // Kategorie zurücksetzen
        if (categoryText) categoryText.textContent = "Select task category";
    }
});

//Meldung anzeigen, wenn Task erfolgreich erstellt wurde
function showTaskAddedMessage(onFinished) {
    const img = document.createElement("img");
    img.src = "./assets/icons-addTask/Added to board 1.png";
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

    // Einblenden
    requestAnimationFrame(() => {
        img.style.opacity = "1";
        img.style.transform = "translate(-50%, -50%)";
    });

    // Nach 800ms Slide-out links in 150ms
    setTimeout(() => {
        img.style.transform = "translate(-150%, -50%)";
        img.style.opacity = "0";
        img.addEventListener("transitionend", () => {
            img.remove();
            if (typeof onFinished === "function") {
                onFinished(); // Modal schließen
            }
        });
    }, 800);
}

// Drag and Drop Feature
function getTaskIdFromCard(card) {
    return card.dataset.taskId || card.getAttribute('data-task-id') || card.id;
}

// 1. Alle Task-Karten draggable machen, wenn das Board gerendert wurde
function enableTaskDragAndDrop() {
    // Alle Spalten holen
    const columns = [
        document.getElementById('column-todo'),
        document.getElementById('column-inProgress'),
        document.getElementById('column-awaitFeedback'),
        document.getElementById('column-done')
    ].filter(Boolean);

    // Alle Karten holen
    const cards = document.querySelectorAll('.task-card');
    cards.forEach(card => {
        card.setAttribute('draggable', 'true');
        // Optional: Eindeutige ID setzen, falls nicht vorhanden
        if (!card.dataset.taskId) {
            // Finde die Task anhand des Titels (besser: Task-Objekt mit ID erweitern!)
            card.dataset.taskId = card.querySelector('.title')?.textContent || '';
        }

        card.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', card.dataset.taskId);
            setTimeout(() => card.classList.add('dragging'), 0);
        });

        card.addEventListener('dragend', e => {
            card.classList.remove('dragging');
        });
    });

    // Spalten als Dropzone vorbereiten
    // Spalten als Dropzone vorbereiten
    columns.forEach(column => {
        column.addEventListener('dragover', e => {
            e.preventDefault();
            column.classList.add('drag-over');
        });

        column.addEventListener('dragleave', e => {
            column.classList.remove('drag-over');
        });

        column.addEventListener('drop', async e => {   // <- async hinzufügen
            e.preventDefault();
            column.classList.remove('drag-over');
            const taskId = e.dataTransfer.getData('text/plain');
            await moveTaskToColumn(taskId, column.id); // <- await, damit Firebase-Update fertig ist
        });
    });

}

// 2. Task verschieben und Board neu rendern
async function moveTaskToColumn(taskId, columnId) {

    let newStatus = 'todo';
    if (columnId.includes('inProgress')) newStatus = 'inProgress';
    else if (columnId.includes('awaitFeedback')) newStatus = 'awaitFeedback';
    else if (columnId.includes('done')) newStatus = 'done';

    const tasks = window.taskManager.getTasks();
    const task = tasks.find(t => (t.id || t.title) == taskId);

    if (task && task.status !== newStatus) {
        task.status = newStatus;                         // lokal ändern

        console.log("Task verschoben:", task.title, "Status:", task.status);
        console.log("Alle Tasks:", tasks.map(t => `${t.title}:${t.status}`));

        await window.taskManager.updateTaskInFirebase(task); // auf Firebase warten
        window.taskManager.saveTasks(tasks);             // lokal speichern
        renderBoard();                                   // Board neu rendern
        enableTaskDragAndDrop();                         // Drag & Drop wieder aktivieren
    }
}


// 3. Nach jedem Render Drag & Drop aktivieren
// (Falls du renderBoard() öfter aufrufst, dann immer danach auch enableTaskDragAndDrop() aufrufen!)
const origRenderBoard = renderBoard;
renderBoard = function () {
    origRenderBoard();
    enableTaskDragAndDrop();
};
// Initial aktivieren (falls Board schon gerendert)
enableTaskDragAndDrop();

// Ergänzung für Drag & Drop mit Firebase-Support
// Beispiel: Tasks aus Firebase laden und IDs zuweisen
// 🔹 Tasks aus Firebase laden (bleibt wie gehabt)
window.taskManager.loadTasks = async function () {
    const res = await fetch("https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/tasks.json");
    const data = await res.json();
    const tasks = [];
    for (const [key, value] of Object.entries(data || {})) {
        value.firebaseId = key;

        // ✅ assignedUsersFull setzen: entweder usersFull oder aus users ableiten
        if (value.usersFull && value.usersFull.length > 0) {
            value.assignedUsersFull = value.usersFull;
        } else if (value.users && value.users.length > 0) {
            value.assignedUsersFull = value.users.map(u => ({ name: u }));
        } else {
            value.assignedUsersFull = [];
        }

        tasks.push(value);
    }
    window.taskManager._tasks = tasks;
};

// 🔹 Tasks lokal abrufen (bleibt wie gehabt)
window.taskManager.getTasks = function () {
    return window.taskManager._tasks || [];
};

// 🔹 NEU: Task in Firebase aktualisieren (diesen Block zusätzlich unten einfügen)
window.taskManager.updateTaskInFirebase = async function (task) {
    if (!task.firebaseId) return;
    try {
        await fetch(`https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/tasks/${task.firebaseId}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: task.status })
        });
    } catch (err) {
        console.error("Fehler beim Aktualisieren in Firebase:", err);
    }
};


//Task card overlay
function openTaskDetails(task) {
    const overlay = document.getElementById("task-detail-overlay");
    const body = document.getElementById("task-detail-body");

    // Body leeren (inklusive alten Buttons)
    body.innerHTML = "";

    // Assigned-to HTML generieren
    let assignedHtml = "-";
    if (task.assignedUsersFull && task.assignedUsersFull.length > 0) {
        assignedHtml = task.assignedUsersFull.map(u => `
        <div class="assigned-person">
            <div class="assigned-avatar" style="
                background-color:${getColor(u.name)};
                width:28px;height:28px;border-radius:50%;
                display:flex;align-items:center;justify-content:center;
                font-family:Inter;font-weight:400;font-size:12px;color:#fff;">
                ${getInitials(u.name)} <!-- Kürzel im Kreis -->
            </div>
            <span class="assigned-name-full">${u.name}</span> <!-- voller Name -->
        </div>
    `).join("");
    }

    // Kategorie-Logik für das Bild
    let categoryImg = "";
    if (task.category === "User Story") {
        categoryImg = './assets/icons-board/user-story-tag.svg';
    } else if (task.category === "Technical Task") {
        categoryImg = './assets/icons-board/technical-task-tag.svg';
    }

    // Top-Bar erstellen (Category + SVG-Close Button)
    const topBar = document.createElement("div");
    topBar.classList.add("top-bar");
    topBar.style.position = "relative"; // für absolute Positionierung des Buttons

    const categoryImage = document.createElement("img");
    categoryImage.src = categoryImg;
    categoryImage.alt = task.category || "Category";
    categoryImage.classList.add("category-image");

    // SVG-Close Button
    const closeBtn = document.createElement("button");
    closeBtn.className = "close-button-overlay"; // gleiche Klasse wie Modal
    closeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path d="M6 6 L18 18" stroke="#000" stroke-width="2" stroke-linecap="round" />
            <path d="M6 18 L18 6" stroke="#000" stroke-width="2" stroke-linecap="round" />
        </svg>
    `;
    closeBtn.addEventListener("click", () => {
        overlay.classList.add("hidden");
    });

    // Top-Bar zusammenbauen
    topBar.appendChild(categoryImage);
    topBar.appendChild(closeBtn);
    body.appendChild(topBar);

    // Restliche Inhalte dynamisch hinzufügen
    const contentHtml = `
        <h2>${task.title}</h2>
        <p class="description-task-overlay">${task.description || ""}</p>
        <p class="task-overlay-bullet">
        <strong>Due date:</strong>
        <span>${task.dueDate || "-"}</span>
        </p>
        <p class="task-overlay-bullet">
        <strong>Priority:</strong>
        <span class="overlay-value">${task.priority || ""}</span>
        </p>
        <p class="task-overlay-bullet">
        <strong>Assigned To:</strong>
        </p>
        <div class="assigned-list">
    ${renderAssignedUsers(task.assignedUsersFull)}
        </div>
        
        <p class="task-overlay-bullet subtask-header-distance"><strong>Subtasks:</strong></p>
<ul class="subtasks-list">
    ${renderSubtasks(task)}
</ul>
    `;
    body.insertAdjacentHTML("beforeend", contentHtml);

    overlay.classList.remove("hidden");
}


//task detail overlay close
function closeTaskDetails() {
    const overlay = document.getElementById("task-detail-overlay");
    overlay?.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("task-detail-close");
    closeBtn?.addEventListener("click", closeTaskDetails);
});

//render assigned contacts
function renderAssignedUsers(users) {

    if (!users || users.length === 0) return "";

    return users.map(user => {
        // Wenn user ein String ist, nehmen wir den String als Namen
        // Wenn user ein Objekt ist, prüfen wir auf name oder username
        const name = typeof user === "string" ? user : (user.name || user.username || "");

        return `
      <div class="assigned-item">
        <div class="assigned-avatar" style="
          background-color:${getColor(name)};
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
          ${getInitials(name)} <!-- Kürzel bleibt im Kreis -->
        </div>
        <span class="assigned-name-full">${name}</span> <!-- kompletter Name -->
      </div>
    `;
    }).join("");
}

// Subtasks rendern mit Checkbox, Text + Edit & Delete Buttons darunter
function renderSubtasks(task) {
    if (!task.subtasks || !task.subtasks.items || task.subtasks.items.length === 0)
        return `<li>Keine Subtasks</li>`;

    return task.subtasks.items.map((subtask, index) => `
        <li class="subtask-item" style="margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <div class="checkbox-wrapper">
                    <div class="hover-overlay"></div>
                    <img src="./assets/icons-addTask/Property 1=Default.png" alt="Checkbox" data-index="${index}">
                </div>
                <span class="subtask-text" style="font-size:16px; font-family:'Open Sans', sans-serif;">${subtask}</span>
            </div>
            <div class="subtask-buttons" style="display:flex; gap:16px; justify-content: end;">
                <div style="display:flex; align-items:center; gap:4px; cursor:pointer; font-family:'Open Sans', sans-serif; font-size:16px;" class="subtask-edit-wrapper" data-index="${index}">
                    <img src="./assets/icons-addTask/Property 1=edit.png" alt="Edit" class="subtask-edit">
                    <span>Edit</span>
                </div>
                <div style="display:flex; align-items:center; gap:4px; cursor:pointer; font-family:'Open Sans', sans-serif; font-size:16px;" class="subtask-delete-wrapper" data-index="${index}">
                    <img src="./assets/icons-addTask/Property 1=delete.png" alt="Delete" class="subtask-delete">
                    <span>Delete</span>
                </div>
            </div>
        </li>
    `).join("");
}







